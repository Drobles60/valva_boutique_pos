"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ArrowLeft, Download, FileDown, Clock, TrendingUp, ShoppingCart, BarChart3 } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface HoraData {
  hora: number
  horaLabel: string
  transacciones: number
  total: number
  ticketPromedio: number
}

interface DiaData {
  dia: number
  nombre: string
  transacciones: number
  total: number
}

interface ReporteData {
  totalVentas: number
  totalTransacciones: number
  horaPico: { hora: number; transacciones: number; total: number } | null
  porHora: HoraData[]
  porDiaSemana: DiaData[]
}

export function VentasPorHoraContent() {
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
      const res = await fetch(`/api/reportes/ventas/por-hora?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }, [fechaInicio, fechaFin])

  useEffect(() => {
    if (fechaInicio && fechaFin) fetchData()
  }, [fechaInicio, fechaFin, fetchData])

  const maxTransacciones = data ? Math.max(...data.porHora.map(h => h.transacciones), 1) : 1

  const exportarCSV = () => {
    if (!data?.porHora.length) { toast.error("No hay datos"); return }
    const rows = [
      ["Hora", "Transacciones", "Total", "Ticket Promedio"],
      ...data.porHora.map(h => [h.horaLabel, h.transacciones, h.total.toFixed(2), h.ticketPromedio.toFixed(2)])
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `ventas_por_hora_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data?.porHora.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Ventas por Hora",
        subtitle: `Distribución horaria de ventas`,
        dateRange: `Del ${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Total Ventas", value: formatCurrency(data.totalVentas) },
          { label: "Transacciones", value: String(data.totalTransacciones) },
          { label: "Hora Pico", value: data.horaPico ? `${String(data.horaPico.hora).padStart(2, "0")}:00` : "—", detail: data.horaPico ? `${data.horaPico.transacciones} ventas` : "" },
        ],
        tables: [{
          title: "Ventas por Hora",
          headers: ["Hora", "Transacciones", "Total", "Ticket Promedio"],
          rows: data.porHora.map(h => [h.horaLabel, String(h.transacciones), formatCurrency(h.total), formatCurrency(h.ticketPromedio)]),
          columnStyles: { 1: { halign: "center" as const }, 2: { halign: "right" as const }, 3: { halign: "right" as const } },
        }, {
          title: "Ventas por Día de la Semana",
          headers: ["Día", "Transacciones", "Total"],
          rows: data.porDiaSemana.map(d => [d.nombre, String(d.transacciones), formatCurrency(d.total)]),
          columnStyles: { 1: { halign: "center" as const }, 2: { halign: "right" as const } },
        }],
        filename: `ventas_por_hora_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado")
    } catch { toast.error("Error al generar PDF") }
    finally { setExportingPdf(false) }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/generales"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ventas por Hora</h1>
            <p className="text-sm text-muted-foreground">Distribución horaria de ventas y horas pico</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!data || loading}><FileDown className="mr-2 h-4 w-4" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!data || loading || exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
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
              <Button onClick={fetchData} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Consultar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando datos...</span>
        </div>
      )}

      {data && !loading && (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(data.totalVentas)}</div>
                <p className="text-xs text-muted-foreground mt-1">En el período</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{data.totalTransacciones}</div>
                <p className="text-xs text-muted-foreground mt-1">Ventas completadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hora Pico</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {data.horaPico ? `${String(data.horaPico.hora).padStart(2, "0")}:00` : "—"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{data.horaPico ? `${data.horaPico.transacciones} transacciones` : "Sin datos"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {data.totalTransacciones > 0 ? formatCurrency(data.totalVentas / data.totalTransacciones) : "$0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Promedio por venta</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de barras horizontal simple */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Hora</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.porHora.map(h => (
                  <div key={h.hora} className="flex items-center gap-3">
                    <span className="w-14 text-sm font-medium text-right">{h.horaLabel}</span>
                    <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full flex items-center justify-end pr-2 text-xs text-primary-foreground font-medium transition-all"
                        style={{ width: `${Math.max((h.transacciones / maxTransacciones) * 100, 2)}%` }}
                      >
                        {h.transacciones > 0 ? h.transacciones : ""}
                      </div>
                    </div>
                    <span className="w-24 text-sm text-right">{formatCurrency(h.total)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabla por hora */}
          <Card>
            <CardHeader><CardTitle>Detalle por Hora</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hora</TableHead>
                      <TableHead className="text-center">Transacciones</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ticket Promedio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.porHora.map(h => (
                      <TableRow key={h.hora}>
                        <TableCell className="font-medium">{h.horaLabel}</TableCell>
                        <TableCell className="text-center">{h.transacciones}</TableCell>
                        <TableCell className="text-right">{formatCurrency(h.total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(h.ticketPromedio)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Tabla por día de semana */}
          <Card>
            <CardHeader><CardTitle>Ventas por Día de la Semana</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Día</TableHead>
                      <TableHead className="text-center">Transacciones</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.porDiaSemana.map(d => (
                      <TableRow key={d.dia}>
                        <TableCell className="font-medium">{d.nombre}</TableCell>
                        <TableCell className="text-center">{d.transacciones}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Selecciona un rango de fechas para ver el reporte</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
