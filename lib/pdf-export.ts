/**
 * PDF export utility using jsPDF + jspdf-autotable.
 * Generates clean vector PDFs without html2canvas (avoids oklch/oklab issues).
 */

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

// Brand colors (hex from globals.css)
const COLORS = {
  primary: [185, 134, 0] as [number, number, number],     // #b98600
  foreground: [38, 33, 23] as [number, number, number],    // #262117
  muted: [119, 113, 101] as [number, number, number],      // #777165
  border: [228, 221, 207] as [number, number, number],     // #e4ddcf
  background: [255, 251, 244] as [number, number, number], // #fffbf4
  white: [255, 255, 255] as [number, number, number],
  card: [245, 241, 234] as [number, number, number],       // #f5f1ea
}

interface KPI {
  label: string
  value: string
  detail?: string
}

interface TableConfig {
  title?: string
  headers: string[]
  rows: string[][]
  columnStyles?: Record<number, { halign?: "left" | "center" | "right" }>
}

export interface ChartImage {
  title?: string
  dataUrl: string   // base64 PNG data URL from html2canvas
  width?: number    // desired width in mm (default: full content width)
  height?: number   // desired height in mm (auto-calculated from aspect ratio if omitted)
}

export interface PDFReportOptions {
  title: string
  subtitle?: string
  dateRange?: string
  kpis?: KPI[]
  chartImages?: ChartImage[]
  tables?: TableConfig[]
  orientation?: "portrait" | "landscape"
  filename: string
}

export function generateReportPDF(options: PDFReportOptions) {
  const {
    title,
    subtitle,
    dateRange,
    kpis = [],
    tables = [],
    orientation = "portrait",
    filename,
  } = options

  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // === Header: Title bar ===
  pdf.setFillColor(...COLORS.primary)
  pdf.rect(0, 0, pageWidth, 22, "F")
  pdf.setTextColor(...COLORS.white)
  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")
  pdf.text(title, margin, 14)
  y = 28

  // Subtitle
  if (subtitle) {
    pdf.setTextColor(...COLORS.muted)
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.text(subtitle, margin, y)
    y += 5
  }

  // Date range
  if (dateRange) {
    pdf.setTextColor(...COLORS.foreground)
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Período: ${dateRange}`, margin, y)
    y += 8
  }

  // === KPIs ===
  if (kpis.length > 0) {
    const kpiWidth = (contentWidth - (kpis.length - 1) * 4) / kpis.length
    const kpiHeight = 22

    kpis.forEach((kpi, i) => {
      const x = margin + i * (kpiWidth + 4)

      // KPI card background
      pdf.setFillColor(...COLORS.card)
      pdf.setDrawColor(...COLORS.border)
      pdf.roundedRect(x, y, kpiWidth, kpiHeight, 2, 2, "FD")

      // KPI label
      pdf.setTextColor(...COLORS.muted)
      pdf.setFontSize(8)
      pdf.setFont("helvetica", "normal")
      pdf.text(kpi.label, x + 4, y + 7)

      // KPI value
      pdf.setTextColor(...COLORS.foreground)
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text(kpi.value, x + 4, y + 15)

      // KPI detail
      if (kpi.detail) {
        pdf.setTextColor(...COLORS.muted)
        pdf.setFontSize(6.5)
        pdf.setFont("helvetica", "normal")
        pdf.text(kpi.detail, x + 4, y + 20)
      }
    })

    y += kpiHeight + 8
  }

  // === Chart Images ===
  if (options.chartImages && options.chartImages.length > 0) {
    for (const chart of options.chartImages) {
      // Check if we need a new page
      if (y > pdf.internal.pageSize.getHeight() - 60) {
        pdf.addPage()
        y = margin
      }

      // Chart title
      if (chart.title) {
        pdf.setTextColor(...COLORS.foreground)
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        pdf.text(chart.title, margin, y)
        y += 6
      }

      try {
        const imgProps = pdf.getImageProperties(chart.dataUrl)
        const imgAspect = imgProps.width / imgProps.height
        const imgW = chart.width || contentWidth
        const imgH = chart.height || imgW / imgAspect

        // If image would overflow page, start new page
        if (y + imgH > pdf.internal.pageSize.getHeight() - 15) {
          pdf.addPage()
          y = margin
        }

        pdf.addImage(chart.dataUrl, "PNG", margin, y, imgW, imgH)
        y += imgH + 8
      } catch (e) {
        console.error("Error adding chart image to PDF:", e)
      }
    }
  }

  // === Tables ===
  tables.forEach((table) => {
    // Check if we need a new page
    if (y > pdf.internal.pageSize.getHeight() - 40) {
      pdf.addPage()
      y = margin
    }

    // Table title
    if (table.title) {
      pdf.setTextColor(...COLORS.foreground)
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "bold")
      pdf.text(table.title, margin, y)
      y += 6
    }

    autoTable(pdf, {
      startY: y,
      head: [table.headers],
      body: table.rows,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: COLORS.foreground,
        lineColor: COLORS.border,
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontStyle: "bold",
        fontSize: 8.5,
      },
      alternateRowStyles: {
        fillColor: COLORS.card,
      },
      bodyStyles: {
        fillColor: COLORS.white,
      },
      columnStyles: table.columnStyles || {},
    })

    // Get final Y position after the table
    y = (pdf as any).lastAutoTable.finalY + 10
  })

  // === Footer ===
  const pageCount = pdf.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    const pageH = pdf.internal.pageSize.getHeight()
    pdf.setDrawColor(...COLORS.border)
    pdf.line(margin, pageH - 12, pageWidth - margin, pageH - 12)
    pdf.setTextColor(...COLORS.muted)
    pdf.setFontSize(7)
    pdf.setFont("helvetica", "normal")
    pdf.text("Valva Boutique POS", margin, pageH - 7)
    pdf.text(
      `Generado: ${new Date().toLocaleDateString("es-CO")} — Página ${i} de ${pageCount}`,
      pageWidth - margin,
      pageH - 7,
      { align: "right" }
    )
  }

  pdf.save(filename)
}

