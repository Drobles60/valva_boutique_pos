import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

// Interfaz para datos de tabla genérica
export interface TableData {
  headers: string[]
  rows: (string | number)[][]
}

// Interfaz para configuración de PDF
export interface PDFConfig {
  title: string
  subtitle?: string
  period?: string
  orientation?: 'portrait' | 'landscape'
  companyInfo?: {
    name: string
    address?: string
    phone?: string
  }
}

/**
 * Exporta datos a PDF
 */
export function exportToPDF(
  tableData: TableData,
  config: PDFConfig
) {
  const doc = new jsPDF({
    orientation: config.orientation || 'portrait',
    unit: 'mm',
    format: 'letter'
  })

  let currentY = 20

  // Header con información de la empresa
  if (config.companyInfo) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(config.companyInfo.name, 15, currentY)
    currentY += 7
    
    if (config.companyInfo.address) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(config.companyInfo.address, 15, currentY)
      currentY += 5
    }
    
    if (config.companyInfo.phone) {
      doc.text(config.companyInfo.phone, 15, currentY)
      currentY += 8
    }
    
    currentY += 3
  }

  // Título del reporte
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(config.title, 15, currentY)
  currentY += 7

  // Subtítulo
  if (config.subtitle) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(config.subtitle, 15, currentY)
    currentY += 6
  }

  // Período
  if (config.period) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.text(`Período: ${config.period}`, 15, currentY)
    currentY += 8
  }

  // Fecha de generación
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 15, currentY)
  currentY += 10

  // Tabla de datos
  const pageWidth = doc.internal.pageSize.getWidth()
  const margins = { left: 15, right: 15 }
  const tableWidth = pageWidth - margins.left - margins.right
  const colWidth = tableWidth / tableData.headers.length

  // Headers de la tabla
  doc.setFillColor(41, 128, 185)
  doc.rect(margins.left, currentY, tableWidth, 8, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  
  tableData.headers.forEach((header, index) => {
    doc.text(
      header,
      margins.left + (index * colWidth) + 2,
      currentY + 5.5
    )
  })
  
  currentY += 8

  // Filas de la tabla
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  
  tableData.rows.forEach((row, rowIndex) => {
    // Alternar color de fila
    if (rowIndex % 2 === 0) {
      doc.setFillColor(240, 240, 240)
      doc.rect(margins.left, currentY, tableWidth, 7, 'F')
    }

    row.forEach((cell, colIndex) => {
      const text = String(cell)
      doc.text(
        text,
        margins.left + (colIndex * colWidth) + 2,
        currentY + 5
      )
    })

    currentY += 7

    // Nueva página si es necesario
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
      
      // Re-pintar headers
      doc.setFillColor(41, 128, 185)
      doc.rect(margins.left, currentY, tableWidth, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      
      tableData.headers.forEach((header, index) => {
        doc.text(
          header,
          margins.left + (index * colWidth) + 2,
          currentY + 5.5
        )
      })
      
      currentY += 8
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
    }
  })

  // Footer
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      280,
      { align: 'center' }
    )
  }

  // Descargar
  const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

/**
 * Exporta datos a Excel
 */
export function exportToExcel(
  tableData: TableData,
  config: {
    title: string
    sheetName?: string
    period?: string
  }
) {
  // Crear datos para el worksheet
  const wsData: any[][] = []

  // Agregar título
  wsData.push([config.title])
  wsData.push([])

  // Agregar período si existe
  if (config.period) {
    wsData.push([`Período: ${config.period}`])
    wsData.push([])
  }

  // Agregar fecha de generación
  wsData.push([`Generado: ${new Date().toLocaleString('es-MX')}`])
  wsData.push([])

  // Agregar headers
  wsData.push(tableData.headers)

  // Agregar filas
  tableData.rows.forEach(row => {
    wsData.push(row)
  })

  // Crear worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Configurar anchos de columna
  const colWidths = tableData.headers.map(() => ({ wch: 20 }))
  ws['!cols'] = colWidths

  // Crear workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, config.sheetName || 'Reporte')

  // Descargar
  const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * Formatea un número como moneda
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(value)
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

/**
 * Exporta un reporte financiero simple (sin tabla)
 */
export function exportSimpleReportToPDF(
  config: PDFConfig,
  sections: Array<{
    title: string
    items: Array<{ label: string; value: string | number }>
  }>
) {
  const doc = new jsPDF({
    orientation: config.orientation || 'portrait',
    unit: 'mm',
    format: 'letter'
  })

  let currentY = 20

  // Header
  if (config.companyInfo) {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(config.companyInfo.name, 15, currentY)
    currentY += 7
    
    if (config.companyInfo.address) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(config.companyInfo.address, 15, currentY)
      currentY += 5
    }
    
    currentY += 5
  }

  // Título
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(config.title, 15, currentY)
  currentY += 7

  if (config.subtitle) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(config.subtitle, 15, currentY)
    currentY += 6
  }

  if (config.period) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.text(`Período: ${config.period}`, 15, currentY)
    currentY += 10
  }

  // Secciones
  sections.forEach(section => {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(section.title, 15, currentY)
    currentY += 7

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    section.items.forEach(item => {
      doc.text(item.label, 20, currentY)
      doc.text(String(item.value), 150, currentY, { align: 'right' })
      currentY += 6
    })

    currentY += 5
  })

  // Fecha de generación
  currentY += 10
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 15, currentY)

  // Descargar
  const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
