"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, Calendar, DollarSign, TrendingUp, TrendingDown, Receipt, Wallet } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface VentasDia { fecha: string; transacciones: number; total: number }
interface SesionData { id: number; fechaApertura: string; fechaCierre: string | null; montoBase: number; efectivoContado: number; usuario: string; estado: string }

interface ReporteData {
  mes: string
  periodo: string
  ventas: {
    total: number; transacciones: number; efectivo: number; transferencia: number; mixto: number; credito: number; descuentos: number
  }
  gastos: { total: number; cantidad: number }
  abonos: { total: number; cantidad: number }
  utilidadBruta: number
  flujoNeto: number
  sesiones: SesionData[]
  ventasPorDia: VentasDia[]
}

export function CorteMensualContent() {
  const [mes, setMes] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  const fetchData = useCallback(async () => {
    if (!mes) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/ventas/corte-mensual?mes=${mes}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }, [mes])

  const formatFecha = (f: string | null) => {
    if (!f) return "—"
    try { return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) } catch { return f }
  }

  const formatDia = (f: string) => {
    try { return new Date(f + "T12:00:00").toLocaleDateString("es-CO", { weekday: "short", day: "2-digit", month: "short" }) } catch { return f }
  }

  const mesLabel = (m: string) => {
    const [y, mo] = m.split("-")
    const meses = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    return `${meses[Number(mo)]} ${y}`
  }

  const maxDia = data ? Math.max(...data.ventasPorDia.map(d => d.total), 1) : 1

  const exportarCSV = () => {
    if (!data) { toast.error("No hay datos"); return }
    const rows = [
      ["CORTE DE CAJA MENSUAL", mesLabel(data.mes)],
      ["Período", data.periodo],
      [""],
      ["RESUMEN"],
      ["Total Ventas", data.ventas.total.toFixed(2)],
      ["Transacciones", data.ventas.transacciones],
      ["Efectivo", data.ventas.efectivo.toFixed(2)],
      ["Transferencia", data.ventas.transferencia.toFixed(2)],
      ["Crédito", data.ventas.credito.toFixed(2)],
      ["Descuentos", data.ventas.descuentos.toFixed(2)],
      [""],
      ["Gastos", data.gastos.total.toFixed(2)],
      ["Abonos recibidos", data.abonos.total.toFixed(2)],
      ["Utilidad bruta", data.utilidadBruta.toFixed(2)],
      ["Flujo neto", data.flujoNeto.toFixed(2)],
      [""],
      ["VENTAS POR DÍA"],
      ["Fecha", "Transacciones", "Total"],
      ...data.ventasPorDia.map(d => [d.fecha, d.transacciones, d.total.toFixed(2)]),
    ]
    const csv = rows.map(r => Array.isArray(r) ? r.join(",") : String(r)).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `corte_mensual_${data.mes}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: `Corte de Caja Mensual — ${mesLabel(data.mes)}`,
        subtitle: data.periodo,
        dateRange: `Generado: ${new Date().toLocaleDateString("es-CO")}`,
        kpis: [
          { label: "Total Ventas", value: formatCurrency(data.ventas.total), detail: `${data.ventas.transacciones} transacciones` },
          { label: "Gastos", value: formatCurrency(data.gastos.total), detail: `${data.gastos.cantidad} registros` },
          { label: "Utilidad Bruta", value: formatCurrency(data.utilidadBruta) },
          { label: "Flujo Neto", value: formatCurrency(data.flujoNeto) },
        ],
        tables: [{
          title: "Ventas por Día",
          headers: ["Fecha", "Transacciones", "Total"],
          rows: data.ventasPorDia.map(d => [formatDia(d.fecha), String(d.transacciones), formatCurrency(d.total)]),
          columnStyles: { 1: { halign: "center" as const }, 2: { halign: "right" as const } },
        }, {
          title: "Sesiones de Caja",
          headers: ["Apertura", "Cierre", "Base", "Contado", "Usuario", "Estado"],
          rows: data.sesiones.map(s => [formatFecha(s.fechaApertura), formatFecha(s.fechaCierre), formatCurrency(s.montoBase), formatCurrency(s.efectivoContado), s.usuario, s.estado]),
          columnStyles: { 2: { halign: "right" as const }, 3: { halign: "right" as const } },
        }],
        filename: `corte_mensual_${data.mes}.pdf`,
      })
      toast.success("PDF exportado")
    } catch { toast.error("Error al generar PDF") }
    finally { setExportingPdf(false) }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/contables"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Corte de Caja Mensual</h1>
            <p className="text-sm text-muted-foreground">Resumen consolidado del mes: ventas, gastos y caja</p>
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
            <div className="space-y-2"><Label>Mes</Label><Input type="month" value={mes} onChange={e => setMes(e.target.value)} /></div>
            <div className="flex items-end"><Button onClick={fetchData} disabled={loading} className="w-full">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Consultar</Button></div>
          </div>
        </CardContent>
      </Card>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><span className="ml-2 text-muted-foreground">Generando corte...</span></div>}

      {data && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Ventas</CardTitle><DollarSign className="h-4 w-4 text-green-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(data.ventas.total)}</div>
                <p className="text-xs text-muted-foreground mt-1">{data.ventas.transacciones} transacciones</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Gastos</CardTitle><TrendingDown className="h-4 w-4 text-red-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(data.gastos.total)}</div>
                <p className="text-xs text-muted-foreground mt-1">{data.gastos.cantidad} registros</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Utilidad Bruta</CardTitle><TrendingUp className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent><div className={`text-2xl font-bold ${data.utilidadBruta >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatCurrency(data.utilidadBruta)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Flujo Neto</CardTitle><Wallet className="h-4 w-4 text-purple-600" /></CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.flujoNeto >= 0 ? "text-purple-600" : "text-red-600"}`}>{formatCurrency(data.flujoNeto)}</div>
                <p className="text-xs text-muted-foreground mt-1">Ventas + abonos - gastos</p>
              </CardContent>
            </Card>
          </div>

          {/* Desglose de ventas */}
          <Card>
            <CardHeader><CardTitle>Desglose de Ventas</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Por Método de Pago</p>
                  <div className="flex justify-between py-2 border-b"><span>Efectivo</span><span className="font-medium">{formatCurrency(data.ventas.efectivo)}</span></div>
                  <div className="flex justify-between py-2 border-b"><span>Transferencia</span><span className="font-medium">{formatCurrency(data.ventas.transferencia)}</span></div>
                  <div className="flex justify-between py-2 border-b"><span>Mixto</span><span className="font-medium">{formatCurrency(data.ventas.mixto)}</span></div>
                  <div className="flex justify-between py-2 bg-muted/50 px-2 rounded"><span className="font-bold">Total Ventas</span><span className="font-bold">{formatCurrency(data.ventas.total)}</span></div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Otros Movimientos</p>
                  <div className="flex justify-between py-2 border-b"><span>Ventas a crédito</span><span className="font-medium text-amber-600">{formatCurrency(data.ventas.credito)}</span></div>
                  <div className="flex justify-between py-2 border-b"><span>Descuentos otorgados</span><span className="font-medium text-red-600">-{formatCurrency(data.ventas.descuentos)}</span></div>
                  <div className="flex justify-between py-2 border-b"><span>Abonos recibidos</span><span className="font-medium text-green-600">+{formatCurrency(data.abonos.total)}</span></div>
                  <div className="flex justify-between py-2 bg-muted/50 px-2 rounded"><span className="font-bold">Flujo Neto</span><span className="font-bold">{formatCurrency(data.flujoNeto)}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico por día */}
          <Card>
            <CardHeader><CardTitle>Ventas Diarias</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {data.ventasPorDia.map(d => (
                  <div key={d.fecha} className="flex items-center gap-2">
                    <span className="w-20 text-xs text-right">{formatDia(d.fecha)}</span>
                    <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full flex items-center justify-end pr-2 text-[10px] text-primary-foreground font-medium transition-all"
                        style={{ width: `${Math.max((d.total / maxDia) * 100, 2)}%` }}
                      >
                        {d.transacciones > 0 ? d.transacciones : ""}
                      </div>
                    </div>
                    <span className="w-24 text-xs text-right">{formatCurrency(d.total)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabla ventas por día */}
          <Card>
            <CardHeader><CardTitle>Detalle por Día</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead className="text-center">Transacciones</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.ventasPorDia.map(d => (
                      <TableRow key={d.fecha}>
                        <TableCell>{formatDia(d.fecha)}</TableCell>
                        <TableCell className="text-center">{d.transacciones}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(d.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Sesiones de caja */}
          <Card>
            <CardHeader><CardTitle>Sesiones de Caja ({data.sesiones.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Apertura</TableHead><TableHead>Cierre</TableHead><TableHead className="text-right">Base</TableHead><TableHead className="text-right">Contado</TableHead><TableHead>Usuario</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.sesiones.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>{formatFecha(s.fechaApertura)}</TableCell>
                        <TableCell>{formatFecha(s.fechaCierre)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.montoBase)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.efectivoContado)}</TableCell>
                        <TableCell>{s.usuario}</TableCell>
                        <TableCell><Badge variant={s.estado === "cerrada" ? "secondary" : "default"}>{s.estado}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {data.sesiones.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay sesiones en este mes</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Selecciona un mes para generar el corte</p></CardContent></Card>
      )}
    </div>
  )
}
