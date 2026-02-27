"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, Percent, Tag, ShoppingCart, TrendingDown } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface DescuentoResumen {
  nombre: string
  tipo: string | null
  valor: number
  vecesAplicado: number
  montoTotal: number
  ventasTotal: number
}

interface VentaDescuento {
  id: number
  numeroVenta: string
  fecha: string
  cliente: string
  subtotal: number
  descuento: number
  total: number
  descuentoNombre: string
  descuentoTipo: string | null
  descuentoValor: number
}

interface ReporteData {
  totalDescuentoMonto: number
  totalVentasConDescuento: number
  totalVentasPeriodo: number
  porcentajeVentasConDescuento: number
  porDescuento: DescuentoResumen[]
  detalle: VentaDescuento[]
}

export function DescuentosAplicadosContent() {
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
      const res = await fetch(`/api/reportes/ventas/descuentos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }, [fechaInicio, fechaFin])

  useEffect(() => {
    if (fechaInicio && fechaFin) fetchData()
  }, [fechaInicio, fechaFin, fetchData])

  const formatFecha = (f: string) => {
    try { return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) } catch { return f }
  }

  const exportarCSV = () => {
    if (!data?.detalle.length) { toast.error("No hay datos"); return }
    const rows = [
      ["# Venta", "Fecha", "Cliente", "Subtotal", "Descuento", "Total", "Tipo Descuento"],
      ...data.detalle.map(v => [v.numeroVenta, formatFecha(v.fecha), v.cliente, v.subtotal.toFixed(2), v.descuento.toFixed(2), v.total.toFixed(2), v.descuentoNombre])
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `descuentos_aplicados_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data?.detalle.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Descuentos Aplicados",
        subtitle: `Análisis de descuentos en ventas`,
        dateRange: `Del ${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Total Descontado", value: formatCurrency(data.totalDescuentoMonto) },
          { label: "Ventas c/Desc.", value: String(data.totalVentasConDescuento), detail: `de ${data.totalVentasPeriodo}` },
          { label: "% Ventas c/Desc.", value: `${data.porcentajeVentasConDescuento.toFixed(1)}%` },
        ],
        tables: [{
          title: "Resumen por Descuento",
          headers: ["Descuento", "Tipo", "Veces Aplicado", "Monto Descontado", "Ventas Totales"],
          rows: data.porDescuento.map(d => [d.nombre, d.tipo || "—", String(d.vecesAplicado), formatCurrency(d.montoTotal), formatCurrency(d.ventasTotal)]),
          columnStyles: { 2: { halign: "center" as const }, 3: { halign: "right" as const }, 4: { halign: "right" as const } },
        }, {
          title: "Detalle de Ventas con Descuento",
          headers: ["# Venta", "Fecha", "Cliente", "Subtotal", "Descuento", "Total"],
          rows: data.detalle.slice(0, 50).map(v => [v.numeroVenta, formatFecha(v.fecha), v.cliente, formatCurrency(v.subtotal), formatCurrency(v.descuento), formatCurrency(v.total)]),
          columnStyles: { 3: { halign: "right" as const }, 4: { halign: "right" as const }, 5: { halign: "right" as const } },
        }],
        filename: `descuentos_aplicados_${fechaInicio}_${fechaFin}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Descuentos Aplicados</h1>
            <p className="text-sm text-muted-foreground">Análisis de descuentos aplicados en ventas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!data || loading}><FileDown className="mr-2 h-4 w-4" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!data || loading || exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Fecha Inicio</Label><Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></div>
            <div className="space-y-2"><Label>Fecha Fin</Label><Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></div>
            <div className="flex items-end"><Button onClick={fetchData} disabled={loading} className="w-full">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Consultar</Button></div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><span className="ml-2 text-muted-foreground">Cargando...</span></div>
      )}

      {data && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Descontado</CardTitle><TrendingDown className="h-4 w-4 text-red-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(data.totalDescuentoMonto)}</div>
                <p className="text-xs text-muted-foreground mt-1">En el período</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ventas c/Descuento</CardTitle><ShoppingCart className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{data.totalVentasConDescuento}</div>
                <p className="text-xs text-muted-foreground mt-1">de {data.totalVentasPeriodo} ventas totales</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">% con Descuento</CardTitle><Percent className="h-4 w-4 text-orange-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{data.porcentajeVentasConDescuento.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Del total de ventas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tipos de Descuento</CardTitle><Tag className="h-4 w-4 text-purple-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{data.porDescuento.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Descuentos diferentes</p>
              </CardContent>
            </Card>
          </div>

          {/* Resumen por descuento */}
          <Card>
            <CardHeader><CardTitle>Resumen por Tipo de Descuento</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descuento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-center">Veces Aplicado</TableHead>
                      <TableHead className="text-right">Monto Descontado</TableHead>
                      <TableHead className="text-right">Ventas Totales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.porDescuento.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{d.nombre}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{d.tipo === "porcentaje" ? `${d.valor}%` : d.tipo === "fijo" ? formatCurrency(d.valor) : "Manual"}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{d.vecesAplicado}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">{formatCurrency(d.montoTotal)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.ventasTotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Detalle de ventas */}
          <Card>
            <CardHeader><CardTitle>Detalle de Ventas con Descuento ({data.detalle.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead># Venta</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">Descuento</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.detalle.map(v => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.numeroVenta}</TableCell>
                        <TableCell>{formatFecha(v.fecha)}</TableCell>
                        <TableCell>{v.cliente}</TableCell>
                        <TableCell className="text-right">{formatCurrency(v.subtotal)}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">-{formatCurrency(v.descuento)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(v.total)}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{v.descuentoNombre}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {data.detalle.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No hay ventas con descuento en este período</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><Percent className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Selecciona un rango de fechas para ver el reporte</p></CardContent></Card>
      )}
    </div>
  )
}
