"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, Receipt, DollarSign, CreditCard, Wallet, Banknote } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface MetodoPago {
  metodo: string
  cantidad: number
  monto: number
}

interface SesionCaja {
  id: number
  fechaApertura: string
  fechaCierre: string | null
  montoBase: number
  efectivoContado: number
  usuario: string
}

interface MovimientoCaja {
  tipo: string
  total: number
  cantidad: number
}

interface ReporteData {
  resumen: {
    totalVentas: number
    efectivoVentas: number
    transferenciaVentas: number
    mixtoVentas: number
    totalAbonos: number
    totalGastosEfectivo: number
    totalEfectivoContado: number
    totalMontosBase: number
    sesionesCerradas: number
  }
  ventasPorMetodo: MetodoPago[]
  sesiones: SesionCaja[]
  movimientosCaja: MovimientoCaja[]
}

export function ConciliacionPagosContent() {
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
      const res = await fetch(`/api/reportes/ventas/conciliacion?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }, [fechaInicio, fechaFin])

  useEffect(() => {
    if (fechaInicio && fechaFin) fetchData()
  }, [fechaInicio, fechaFin, fetchData])

  const formatFecha = (f: string | null) => {
    if (!f) return "—"
    try { return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) } catch { return f }
  }

  const metodoLabel = (m: string) => {
    const map: Record<string, string> = { efectivo: "Efectivo", transferencia: "Transferencia", mixto: "Mixto" }
    return map[m] || m
  }

  const exportarCSV = () => {
    if (!data) { toast.error("No hay datos"); return }
    const rows = [
      ["CONCILIACIÓN DE PAGOS"],
      ["Período", `${fechaInicio} a ${fechaFin}`],
      [""],
      ["VENTAS POR MÉTODO DE PAGO"],
      ["Método", "Cantidad", "Monto"],
      ...data.ventasPorMetodo.map(v => [metodoLabel(v.metodo), v.cantidad, v.monto.toFixed(2)]),
      [""],
      ["Total Ventas", "", data.resumen.totalVentas.toFixed(2)],
      ["Total Abonos", "", data.resumen.totalAbonos.toFixed(2)],
      ["Gastos en Efectivo", "", data.resumen.totalGastosEfectivo.toFixed(2)],
      [""],
      ["SESIONES DE CAJA"],
      ["ID", "Apertura", "Cierre", "Monto Base", "Efectivo Contado", "Usuario"],
      ...data.sesiones.map(s => [s.id, formatFecha(s.fechaApertura), formatFecha(s.fechaCierre), s.montoBase.toFixed(2), s.efectivoContado.toFixed(2), s.usuario]),
    ]
    const csv = rows.map(r => Array.isArray(r) ? r.join(",") : String(r)).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `conciliacion_pagos_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Conciliación de Pagos",
        subtitle: `Cruce de ventas, métodos de pago y caja`,
        dateRange: `Del ${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Total Ventas", value: formatCurrency(data.resumen.totalVentas) },
          { label: "Efectivo", value: formatCurrency(data.resumen.efectivoVentas) },
          { label: "Transferencia", value: formatCurrency(data.resumen.transferenciaVentas) },
          { label: "Sesiones", value: String(data.resumen.sesionesCerradas) },
        ],
        tables: [{
          title: "Ventas por Método de Pago",
          headers: ["Método", "Cant.", "Monto"],
          rows: data.ventasPorMetodo.map(v => [metodoLabel(v.metodo), String(v.cantidad), formatCurrency(v.monto)]),
          columnStyles: { 1: { halign: "center" as const }, 2: { halign: "right" as const } },
        }, {
          title: "Sesiones de Caja",
          headers: ["Apertura", "Cierre", "Base", "Contado", "Usuario"],
          rows: data.sesiones.map(s => [formatFecha(s.fechaApertura), formatFecha(s.fechaCierre), formatCurrency(s.montoBase), formatCurrency(s.efectivoContado), s.usuario]),
          columnStyles: { 2: { halign: "right" as const }, 3: { halign: "right" as const } },
        }],
        filename: `conciliacion_pagos_${fechaInicio}_${fechaFin}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Conciliación de Pagos</h1>
            <p className="text-sm text-muted-foreground">Cruce entre ventas, métodos de pago y sesiones de caja</p>
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

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><span className="ml-2 text-muted-foreground">Cargando conciliación...</span></div>}

      {data && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Ventas</CardTitle><DollarSign className="h-4 w-4 text-green-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(data.resumen.totalVentas)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Efectivo</CardTitle><Banknote className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-blue-600">{formatCurrency(data.resumen.efectivoVentas)}</div><p className="text-xs text-muted-foreground">en ventas</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Transferencias</CardTitle><CreditCard className="h-4 w-4 text-purple-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-purple-600">{formatCurrency(data.resumen.transferenciaVentas)}</div><p className="text-xs text-muted-foreground">en ventas</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Sesiones Cerradas</CardTitle><Receipt className="h-4 w-4 text-orange-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-orange-600">{data.resumen.sesionesCerradas}</div></CardContent>
            </Card>
          </div>

          {/* Resumen de conciliación */}
          <Card>
            <CardHeader><CardTitle>Resumen de Flujos</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="flex items-center gap-2"><Banknote className="h-4 w-4" /> Ventas en efectivo</span>
                  <span className="font-medium text-green-600">+{formatCurrency(data.resumen.efectivoVentas)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Ventas por transferencia</span>
                  <span className="font-medium text-green-600">+{formatCurrency(data.resumen.transferenciaVentas)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Ventas mixtas</span>
                  <span className="font-medium text-green-600">+{formatCurrency(data.resumen.mixtoVentas)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Abonos recibidos</span>
                  <span className="font-medium text-green-600">+{formatCurrency(data.resumen.totalAbonos)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="flex items-center gap-2"><Receipt className="h-4 w-4" /> Gastos en efectivo</span>
                  <span className="font-medium text-red-600">-{formatCurrency(data.resumen.totalGastosEfectivo)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-md">
                  <span className="font-bold">Total Ingresos</span>
                  <span className="font-bold text-green-600">{formatCurrency(data.resumen.totalVentas + data.resumen.totalAbonos)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ventas por método */}
          <Card>
            <CardHeader><CardTitle>Ventas por Método de Pago</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Método</TableHead><TableHead className="text-center">Cantidad</TableHead><TableHead className="text-right">Monto</TableHead><TableHead className="text-right">% del Total</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.ventasPorMetodo.map((v, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium"><Badge variant="outline">{metodoLabel(v.metodo)}</Badge></TableCell>
                        <TableCell className="text-center">{v.cantidad}</TableCell>
                        <TableCell className="text-right">{formatCurrency(v.monto)}</TableCell>
                        <TableCell className="text-right">{data.resumen.totalVentas > 0 ? ((v.monto / data.resumen.totalVentas) * 100).toFixed(1) : "0"}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Movimientos de caja */}
          {data.movimientosCaja.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Movimientos de Caja por Tipo</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Tipo Movimiento</TableHead><TableHead className="text-center">Cantidad</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.movimientosCaja.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.tipo}</TableCell>
                          <TableCell className="text-center">{m.cantidad}</TableCell>
                          <TableCell className="text-right">{formatCurrency(m.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sesiones */}
          <Card>
            <CardHeader><CardTitle>Sesiones de Caja ({data.sesiones.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Apertura</TableHead><TableHead>Cierre</TableHead><TableHead className="text-right">Monto Base</TableHead><TableHead className="text-right">Efectivo Contado</TableHead><TableHead>Usuario</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.sesiones.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>{formatFecha(s.fechaApertura)}</TableCell>
                        <TableCell>{formatFecha(s.fechaCierre)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.montoBase)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.efectivoContado)}</TableCell>
                        <TableCell>{s.usuario}</TableCell>
                      </TableRow>
                    ))}
                    {data.sesiones.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay sesiones cerradas</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><Receipt className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Selecciona un rango de fechas para conciliar</p></CardContent></Card>
      )}
    </div>
  )
}
