"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, RotateCcw, AlertTriangle, XCircle, Package } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface VentaAnulada {
  id: number
  numeroVenta: string
  fecha: string
  total: number
  metodoPago: string
  cliente: string
  usuario: string
}

interface Devolucion {
  id: number
  fecha: string
  producto: string
  sku: string
  cantidad: number
  motivo: string
  usuario: string
}

interface ReporteData {
  totalAnuladas: number
  montoAnulado: number
  totalDevoluciones: number
  unidadesDevueltas: number
  totalVentasPeriodo: number
  montoVentasPeriodo: number
  tasaAnulacion: number
  anuladas: VentaAnulada[]
  devoluciones: Devolucion[]
}

export function DevolucionesContent() {
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
      const res = await fetch(`/api/reportes/ventas/devoluciones?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
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
    if (!data) { toast.error("No hay datos"); return }
    const rows = [
      ["--- VENTAS ANULADAS ---"],
      ["# Venta", "Fecha", "Total", "Método", "Cliente", "Usuario"],
      ...data.anuladas.map(v => [v.numeroVenta, formatFecha(v.fecha), v.total.toFixed(2), v.metodoPago, v.cliente, v.usuario]),
      [""],
      ["--- DEVOLUCIONES DE INVENTARIO ---"],
      ["Fecha", "Producto", "SKU", "Cantidad", "Motivo", "Usuario"],
      ...data.devoluciones.map(d => [formatFecha(d.fecha), d.producto, d.sku, d.cantidad, d.motivo, d.usuario]),
    ]
    const csv = rows.map(r => Array.isArray(r) ? r.join(",") : r).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `devoluciones_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      const tables = []
      if (data.anuladas.length > 0) {
        tables.push({
          title: "Ventas Anuladas",
          headers: ["# Venta", "Fecha", "Total", "Método Pago", "Cliente", "Usuario"],
          rows: data.anuladas.map(v => [v.numeroVenta, formatFecha(v.fecha), formatCurrency(v.total), v.metodoPago, v.cliente, v.usuario]),
          columnStyles: { 2: { halign: "right" as const } },
        })
      }
      if (data.devoluciones.length > 0) {
        tables.push({
          title: "Devoluciones de Inventario",
          headers: ["Fecha", "Producto", "SKU", "Cantidad", "Motivo", "Usuario"],
          rows: data.devoluciones.map(d => [formatFecha(d.fecha), d.producto, d.sku, String(d.cantidad), d.motivo, d.usuario]),
          columnStyles: { 3: { halign: "center" as const } },
        })
      }
      generateReportPDF({
        title: "Devoluciones y Cambios",
        subtitle: `Ventas anuladas y devoluciones de inventario`,
        dateRange: `Del ${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Ventas Anuladas", value: String(data.totalAnuladas), detail: formatCurrency(data.montoAnulado) },
          { label: "Devoluciones", value: String(data.totalDevoluciones), detail: `${data.unidadesDevueltas} unidades` },
          { label: "Tasa Anulación", value: `${data.tasaAnulacion.toFixed(1)}%` },
        ],
        tables,
        filename: `devoluciones_${fechaInicio}_${fechaFin}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Devoluciones y Cambios</h1>
            <p className="text-sm text-muted-foreground">Ventas anuladas y devoluciones de productos</p>
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

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><span className="ml-2 text-muted-foreground">Cargando...</span></div>}

      {data && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ventas Anuladas</CardTitle><XCircle className="h-4 w-4 text-red-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{data.totalAnuladas}</div>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(data.montoAnulado)} en total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Devoluciones</CardTitle><RotateCcw className="h-4 w-4 text-orange-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{data.totalDevoluciones}</div>
                <p className="text-xs text-muted-foreground mt-1">{data.unidadesDevueltas} unidades devueltas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tasa de Anulación</CardTitle><AlertTriangle className="h-4 w-4 text-yellow-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{data.tasaAnulacion.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Del total de ventas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ventas Válidas</CardTitle><Package className="h-4 w-4 text-green-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{data.totalVentasPeriodo}</div>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(data.montoVentasPeriodo)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Ventas anuladas */}
          <Card>
            <CardHeader><CardTitle>Ventas Anuladas ({data.anuladas.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead># Venta</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Método Pago</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Usuario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.anuladas.map(v => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.numeroVenta}</TableCell>
                        <TableCell>{formatFecha(v.fecha)}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">{formatCurrency(v.total)}</TableCell>
                        <TableCell><Badge variant="outline">{v.metodoPago}</Badge></TableCell>
                        <TableCell>{v.cliente}</TableCell>
                        <TableCell>{v.usuario}</TableCell>
                      </TableRow>
                    ))}
                    {data.anuladas.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay ventas anuladas</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Devoluciones de inventario */}
          <Card>
            <CardHeader><CardTitle>Devoluciones de Inventario ({data.devoluciones.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Usuario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.devoluciones.map(d => (
                      <TableRow key={d.id}>
                        <TableCell>{formatFecha(d.fecha)}</TableCell>
                        <TableCell className="font-medium">{d.producto}</TableCell>
                        <TableCell>{d.sku}</TableCell>
                        <TableCell className="text-center">{d.cantidad}</TableCell>
                        <TableCell>{d.motivo}</TableCell>
                        <TableCell>{d.usuario}</TableCell>
                      </TableRow>
                    ))}
                    {data.devoluciones.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay devoluciones registradas</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><RotateCcw className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Selecciona un rango de fechas para ver el reporte</p></CardContent></Card>
      )}
    </div>
  )
}
