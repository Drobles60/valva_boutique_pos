"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Download, FileDown, DollarSign, CreditCard, ShoppingCart, Users, AlertTriangle, TrendingUp } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface ProveedorItem {
  proveedorId: number
  proveedor: string
  ruc: string | null
  telefono: string | null
  email: string | null
  totalCompras: number
  montoTotal: number
  montoContado: number
  montoCredito: number
  montoMixto: number
  totalAbonado: number
  totalDescuentos: number
  primeraCompra: string | null
  ultimaCompra: string | null
}

interface DeudaItem {
  proveedorId: number
  proveedor: string
  comprasPendientes: number
  saldoPendiente: number
  proximoVencimiento: string | null
}

interface CompraItem {
  id: number
  numeroCompra: string
  factura: string | null
  fecha: string
  fechaVencimiento: string | null
  tipoPago: string
  subtotal: number
  descuento: number
  iva: number
  total: number
  abonoInicial: number
  proveedor: string
  totalItems: number
}

interface ReporteData {
  periodo: string
  resumen: {
    totalCompras: number
    montoTotal: number
    montoContado: number
    montoCredito: number
    montoMixto: number
    totalDescuentos: number
    deudaTotalAcumulada: number
    proveedoresActivos: number
  }
  porProveedor: ProveedorItem[]
  deudasPendientes: DeudaItem[]
  detalle: CompraItem[]
}

export function ProveedoresReporteContent() {
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
      const res = await fetch(`/api/reportes/administrativos/proveedores?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
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
    try { return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) } catch { return f }
  }

  const tipoPagoBadge = (tipo: string) => {
    if (tipo === "contado") return <Badge className="bg-green-100 text-green-800">Contado</Badge>
    if (tipo === "credito") return <Badge className="bg-amber-100 text-amber-800">Crédito</Badge>
    return <Badge className="bg-blue-100 text-blue-800">Mixto</Badge>
  }

  const exportarCSV = () => {
    if (!data?.detalle.length) { toast.error("No hay datos"); return }
    const rows = [
      ["# Compra", "Factura", "Proveedor", "Fecha", "Tipo Pago", "Subtotal", "Descuento", "IVA", "Total", "Abono Inicial", "Items"],
      ...data.detalle.map(c => [
        c.numeroCompra, c.factura || "", c.proveedor, formatFecha(c.fecha),
        c.tipoPago, c.subtotal.toFixed(2), c.descuento.toFixed(2), c.iva.toFixed(2),
        c.total.toFixed(2), c.abonoInicial.toFixed(2), c.totalItems
      ])
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `reporte_proveedores_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      const tables: any[] = []
      if (data.porProveedor.length > 0) {
        tables.push({
          title: "Resumen por Proveedor",
          headers: ["Proveedor", "RUC", "Compras", "Total", "Contado", "Crédito", "Descuentos"],
          rows: data.porProveedor.map(p => [
            p.proveedor, p.ruc || "—", String(p.totalCompras), formatCurrency(p.montoTotal),
            formatCurrency(p.montoContado), formatCurrency(p.montoCredito), formatCurrency(p.totalDescuentos)
          ]),
          columnStyles: { 2: { halign: "center" as const }, 3: { halign: "right" as const }, 4: { halign: "right" as const }, 5: { halign: "right" as const }, 6: { halign: "right" as const } },
        })
      }
      if (data.deudasPendientes.length > 0) {
        tables.push({
          title: "Deudas Pendientes",
          headers: ["Proveedor", "Compras Pend.", "Saldo Pendiente", "Próx. Vencimiento"],
          rows: data.deudasPendientes.map(d => [
            d.proveedor, String(d.comprasPendientes), formatCurrency(d.saldoPendiente), formatFecha(d.proximoVencimiento)
          ]),
          columnStyles: { 1: { halign: "center" as const }, 2: { halign: "right" as const } },
        })
      }
      if (data.detalle.length > 0) {
        tables.push({
          title: "Detalle de Compras",
          headers: ["# Compra", "Proveedor", "Fecha", "Tipo Pago", "Total", "Items"],
          rows: data.detalle.map(c => [
            c.numeroCompra, c.proveedor, formatFecha(c.fecha), c.tipoPago,
            formatCurrency(c.total), String(c.totalItems)
          ]),
          columnStyles: { 4: { halign: "right" as const }, 5: { halign: "center" as const } },
        })
      }
      generateReportPDF({
        title: "Reporte de Proveedores",
        subtitle: "Compras y cuentas por pagar",
        dateRange: `Del ${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Total Compras", value: String(data.resumen.totalCompras), detail: `${data.resumen.proveedoresActivos} proveedores` },
          { label: "Monto Total", value: formatCurrency(data.resumen.montoTotal) },
          { label: "Deuda Acumulada", value: formatCurrency(data.resumen.deudaTotalAcumulada) },
          { label: "Descuentos", value: formatCurrency(data.resumen.totalDescuentos) },
        ],
        tables,
        filename: `reporte_proveedores_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado")
    } catch { toast.error("Error al generar PDF") }
    finally { setExportingPdf(false) }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/contables"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Proveedores</h1>
            <p className="text-sm text-muted-foreground">Compras y cuentas por pagar</p>
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
            <div className="space-y-2"><Label>Fecha Inicio</Label><Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></div>
            <div className="space-y-2"><Label>Fecha Fin</Label><Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></div>
            <div className="flex items-end"><Button onClick={fetchData} disabled={loading} className="w-full">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Consultar</Button></div>
          </div>
        </CardContent>
      </Card>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><span className="ml-2 text-muted-foreground">Cargando reporte...</span></div>}

      {data && !loading && (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Compras</CardTitle><ShoppingCart className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{data.resumen.totalCompras}</div>
                <p className="text-xs text-muted-foreground mt-1">{data.resumen.proveedoresActivos} proveedores</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Monto Total</CardTitle><DollarSign className="h-4 w-4 text-green-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(data.resumen.montoTotal)}</div>
                <p className="text-xs text-muted-foreground mt-1">En el período</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Deuda Acumulada</CardTitle><AlertTriangle className="h-4 w-4 text-red-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(data.resumen.deudaTotalAcumulada)}</div>
                <p className="text-xs text-muted-foreground mt-1">Pendiente de pago</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Descuentos</CardTitle><TrendingUp className="h-4 w-4 text-purple-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(data.resumen.totalDescuentos)}</div>
                <p className="text-xs text-muted-foreground mt-1">Obtenidos de proveedores</p>
              </CardContent>
            </Card>
          </div>

          {/* Distribución de pagos */}
          <Card>
            <CardHeader><CardTitle>Distribución por Tipo de Pago</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div>
                    <p className="text-sm font-medium text-green-800">Contado</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(data.resumen.montoContado)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{data.resumen.montoTotal > 0 ? ((data.resumen.montoContado / data.resumen.montoTotal) * 100).toFixed(1) : 0}%</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <div>
                    <p className="text-sm font-medium text-amber-800">Crédito</p>
                    <p className="text-xl font-bold text-amber-600">{formatCurrency(data.resumen.montoCredito)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{data.resumen.montoTotal > 0 ? ((data.resumen.montoCredito / data.resumen.montoTotal) * 100).toFixed(1) : 0}%</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Mixto</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(data.resumen.montoMixto)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{data.resumen.montoTotal > 0 ? ((data.resumen.montoMixto / data.resumen.montoTotal) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs: Proveedores / Deudas / Detalle */}
          <Tabs defaultValue="proveedores" className="space-y-4">
            <TabsList>
              <TabsTrigger value="proveedores"><Users className="mr-2 h-4 w-4" /> Por Proveedor ({data.porProveedor.length})</TabsTrigger>
              <TabsTrigger value="deudas"><CreditCard className="mr-2 h-4 w-4" /> Deudas Pendientes ({data.deudasPendientes.length})</TabsTrigger>
              <TabsTrigger value="detalle"><ShoppingCart className="mr-2 h-4 w-4" /> Detalle Compras ({data.detalle.length})</TabsTrigger>
            </TabsList>

            {/* Tab: Por Proveedor */}
            <TabsContent value="proveedores">
              <Card>
                <CardHeader><CardTitle>Resumen por Proveedor</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Proveedor</TableHead>
                          <TableHead>RUC</TableHead>
                          <TableHead className="text-center">Compras</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Contado</TableHead>
                          <TableHead className="text-right">Crédito</TableHead>
                          <TableHead className="text-right">Descuentos</TableHead>
                          <TableHead>Última Compra</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.porProveedor.map(p => (
                          <TableRow key={p.proveedorId}>
                            <TableCell className="font-medium">{p.proveedor}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{p.ruc || "—"}</TableCell>
                            <TableCell className="text-center">{p.totalCompras}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(p.montoTotal)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(p.montoContado)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(p.montoCredito)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(p.totalDescuentos)}</TableCell>
                            <TableCell className="text-sm">{formatFecha(p.ultimaCompra)}</TableCell>
                          </TableRow>
                        ))}
                        {data.porProveedor.length === 0 && (
                          <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No hay compras con proveedores en este período</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Deudas Pendientes */}
            <TabsContent value="deudas">
              <Card>
                <CardHeader><CardTitle>Deudas Pendientes con Proveedores</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Proveedor</TableHead>
                          <TableHead className="text-center">Compras Pendientes</TableHead>
                          <TableHead className="text-right">Saldo Pendiente</TableHead>
                          <TableHead>Próximo Vencimiento</TableHead>
                          <TableHead className="text-center">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.deudasPendientes.map(d => {
                          const hoy = new Date()
                          const venc = d.proximoVencimiento ? new Date(d.proximoVencimiento) : null
                          const vencida = venc ? venc < hoy : false
                          return (
                            <TableRow key={d.proveedorId} className={vencida ? "bg-red-50 dark:bg-red-950/10" : ""}>
                              <TableCell className="font-medium">{d.proveedor}</TableCell>
                              <TableCell className="text-center">{d.comprasPendientes}</TableCell>
                              <TableCell className="text-right font-bold text-red-600">{formatCurrency(d.saldoPendiente)}</TableCell>
                              <TableCell>{formatFecha(d.proximoVencimiento)}</TableCell>
                              <TableCell className="text-center">
                                {vencida ? <Badge className="bg-red-100 text-red-800">Vencida</Badge> : <Badge className="bg-green-100 text-green-800">Vigente</Badge>}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        {data.deudasPendientes.length === 0 && (
                          <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay deudas pendientes con proveedores</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Detalle Compras */}
            <TabsContent value="detalle">
              <Card>
                <CardHeader><CardTitle>Detalle de Compras</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead># Compra</TableHead>
                          <TableHead>Factura</TableHead>
                          <TableHead>Proveedor</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-center">Tipo Pago</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="text-right">Desc.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-center">Items</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.detalle.map(c => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.numeroCompra || `#${c.id}`}</TableCell>
                            <TableCell className="text-sm">{c.factura || "—"}</TableCell>
                            <TableCell>{c.proveedor}</TableCell>
                            <TableCell>{formatFecha(c.fecha)}</TableCell>
                            <TableCell className="text-center">{tipoPagoBadge(c.tipoPago)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(c.subtotal)}</TableCell>
                            <TableCell className="text-right text-purple-600">{c.descuento > 0 ? `-${formatCurrency(c.descuento)}` : "—"}</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(c.total)}</TableCell>
                            <TableCell className="text-center">{c.totalItems}</TableCell>
                          </TableRow>
                        ))}
                        {data.detalle.length === 0 && (
                          <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No hay compras en este período</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><DollarSign className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Selecciona un rango de fechas para consultar el reporte</p></CardContent></Card>
      )}
    </div>
  )
}
