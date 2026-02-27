"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, TrendingUp, ShoppingCart, ArrowLeft, Download, FileDown } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { generateReportPDF } from "@/lib/pdf-export"
import Link from "next/link"

interface VentaDia {
  fecha: string
  ventas: number
  transacciones: number
}

interface ReporteData {
  totalVentas: number
  totalTransacciones: number
  ticketPromedio: number
  ventasPorDia: VentaDia[]
}

export function VentasPorDiaContent() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    const hoy = new Date()
    const hace30 = new Date(hoy)
    hace30.setDate(hoy.getDate() - 30)
    setFechaInicio(hace30.toISOString().split("T")[0])
    setFechaFin(hoy.toISOString().split("T")[0])
  }, [])

  const fetchData = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/ventas/general?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }, [fechaInicio, fechaFin])

  useEffect(() => {
    if (fechaInicio && fechaFin) fetchData()
  }, [fechaInicio, fechaFin, fetchData])

  const ventasPorDia = data?.ventasPorDia ?? []
  const maxVenta = Math.max(...ventasPorDia.map(d => d.ventas), 1)

  const exportarCSV = () => {
    if (!ventasPorDia.length) { toast.error("No hay datos para exportar"); return }
    const rows = [
      ["Fecha", "Ventas", "Transacciones", "Ticket Promedio"],
      ...ventasPorDia.map(d => [
        d.fecha,
        d.ventas.toFixed(2),
        d.transacciones,
        (d.ventas / d.transacciones).toFixed(2)
      ])
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `ventas_por_dia_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("Exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!ventasPorDia.length) { toast.error("No hay datos para exportar"); return }
    setExportingPdf(true)
    try {
      const formatFecha = (f: string) => {
        const [a, m, d] = f.split("-").map(Number)
        return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
      }
      generateReportPDF({
        title: "Ventas por Día",
        subtitle: "Historial diario de ventas del período",
        dateRange: `${formatFecha(fechaInicio)} — ${formatFecha(fechaFin)}`,
        kpis: [
          { label: "Total Ventas", value: `$${formatCurrency(data?.totalVentas ?? 0)}`, detail: `${ventasPorDia.length} días con ventas` },
          { label: "Transacciones", value: String(data?.totalTransacciones ?? 0), detail: "Total del período" },
          { label: "Ticket Promedio", value: `$${formatCurrency(data?.ticketPromedio ?? 0)}`, detail: "Por transacción" },
        ],
        tables: [{
          title: "Detalle por Día",
          headers: ["Fecha", "Transacciones", "Total", "Promedio"],
          rows: ventasPorDia.map(d => [
            formatFecha(d.fecha),
            String(d.transacciones),
            `$${formatCurrency(d.ventas)}`,
            `$${formatCurrency(d.transacciones > 0 ? d.ventas / d.transacciones : 0)}`,
          ]),
          columnStyles: { 1: { halign: "center" }, 2: { halign: "right" }, 3: { halign: "right" } },
        }],
        filename: `ventas_por_dia_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado correctamente")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar PDF: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setExportingPdf(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/generales">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ventas por Día</h1>
            <p className="text-sm text-muted-foreground md:text-base">Historial diario de ventas del período</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={fetchData} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
                {loading ? "Cargando..." : "Aplicar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(data?.totalVentas ?? 0)}</div>
            <p className="text-xs text-muted-foreground">{ventasPorDia.length} días con ventas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalTransacciones ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total del período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(data?.ticketPromedio ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Por transacción</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica de barras + tabla */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Barras visuales */}
        <Card>
          <CardHeader>
            <CardTitle>Gráfica de Ventas</CardTitle>
            <CardDescription>Distribución visual por día</CardDescription>
          </CardHeader>
          <CardContent>
            {ventasPorDia.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay datos en este período</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {ventasPorDia.map(dia => {
                  const [a, m, d] = dia.fecha.split("-").map(Number)
                  const fechaStr = new Date(a, m - 1, d).toLocaleDateString("es-CO", { weekday: "short", day: "2-digit", month: "short" })
                  const pct = (dia.ventas / maxVenta) * 100
                  return (
                    <div key={dia.fecha} className="relative rounded border p-2 overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary/8 transition-all" style={{ width: `${pct}%` }} />
                      <div className="relative flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium capitalize">{fechaStr}</span>
                          <span className="text-muted-foreground ml-2">({dia.transacciones} vtas)</span>
                        </div>
                        <span className="font-bold text-primary">${formatCurrency(dia.ventas)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla detallada */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle por Día</CardTitle>
            <CardDescription>Ticket promedio por jornada</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {ventasPorDia.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay datos en este período</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Transacciones</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventasPorDia.map(dia => {
                    const [a, m, d] = dia.fecha.split("-").map(Number)
                    const fechaStr = new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
                    const ticketDia = dia.transacciones > 0 ? dia.ventas / dia.transacciones : 0
                    return (
                      <TableRow key={dia.fecha}>
                        <TableCell className="font-medium">{fechaStr}</TableCell>
                        <TableCell className="text-right">{dia.transacciones}</TableCell>
                        <TableCell className="text-right font-semibold">${formatCurrency(dia.ventas)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">${formatCurrency(ticketDia)}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
