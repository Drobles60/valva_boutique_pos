"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, CreditCard, AlertTriangle, DollarSign, Clock } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface ProveedorResumen {
  proveedor: string
  compras: number
  totalCompras: number
  totalAbonado: number
  saldoPendiente: number
}

interface CompraDetalle {
  id: number
  numeroCompra: string
  factura: string | null
  fecha: string
  fechaVencimiento: string | null
  total: number
  abonoInicial: number
  saldoPendiente: number
  proveedor: string
  telefono: string | null
  email: string | null
  vencida: boolean
}

interface ReporteData {
  totalDeuda: number
  totalComprasPendientes: number
  totalVencidas: number
  montoVencido: number
  porVencerProximaSemana: number
  porProveedor: ProveedorResumen[]
  detalle: CompraDetalle[]
}

export function CuentasPorPagarContent() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/reportes/clientes/cuentas-por-pagar")
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const formatFecha = (f: string | null) => {
    if (!f) return "—"
    try { return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) } catch { return f }
  }

  const exportarCSV = () => {
    if (!data?.detalle.length) { toast.error("No hay datos"); return }
    const rows = [
      ["# Compra", "Factura", "Fecha", "Vencimiento", "Total", "Abono", "Saldo", "Proveedor", "Teléfono", "Estado"],
      ...data.detalle.map(c => [c.numeroCompra, c.factura || "", formatFecha(c.fecha), formatFecha(c.fechaVencimiento), c.total.toFixed(2), c.abonoInicial.toFixed(2), c.saldoPendiente.toFixed(2), c.proveedor, c.telefono || "", c.vencida ? "VENCIDA" : "Vigente"])
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `cuentas_por_pagar_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data?.detalle.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Cuentas por Pagar",
        subtitle: `Deudas a proveedores`,
        dateRange: `Generado: ${new Date().toLocaleDateString("es-CO")}`,
        kpis: [
          { label: "Deuda Total", value: formatCurrency(data.totalDeuda) },
          { label: "Compras Pend.", value: String(data.totalComprasPendientes) },
          { label: "Vencidas", value: String(data.totalVencidas), detail: formatCurrency(data.montoVencido) },
          { label: "Por Vencer (7d)", value: String(data.porVencerProximaSemana) },
        ],
        tables: [{
          title: "Resumen por Proveedor",
          headers: ["Proveedor", "Compras", "Total Compras", "Abonado", "Saldo Pendiente"],
          rows: data.porProveedor.map(p => [p.proveedor, String(p.compras), formatCurrency(p.totalCompras), formatCurrency(p.totalAbonado), formatCurrency(p.saldoPendiente)]),
          columnStyles: { 1: { halign: "center" as const }, 2: { halign: "right" as const }, 3: { halign: "right" as const }, 4: { halign: "right" as const } },
        }, {
          title: "Detalle de Cuentas",
          headers: ["# Compra", "Proveedor", "Fecha", "Vencimiento", "Total", "Saldo", "Estado"],
          rows: data.detalle.map(c => [c.numeroCompra, c.proveedor, formatFecha(c.fecha), formatFecha(c.fechaVencimiento), formatCurrency(c.total), formatCurrency(c.saldoPendiente), c.vencida ? "VENCIDA" : "Vigente"]),
          columnStyles: { 4: { halign: "right" as const }, 5: { halign: "right" as const } },
        }],
        filename: `cuentas_por_pagar_${new Date().toISOString().split("T")[0]}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Cuentas por Pagar</h1>
            <p className="text-sm text-muted-foreground">Deudas pendientes con proveedores</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Actualizar</Button>
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!data || loading}><FileDown className="mr-2 h-4 w-4" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!data || loading || exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} PDF
          </Button>
        </div>
      </div>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><span className="ml-2 text-muted-foreground">Cargando...</span></div>}

      {data && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Deuda Total</CardTitle><DollarSign className="h-4 w-4 text-red-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(data.totalDeuda)}</div>
                <p className="text-xs text-muted-foreground mt-1">{data.totalComprasPendientes} compras pendientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Vencidas</CardTitle><AlertTriangle className="h-4 w-4 text-orange-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{data.totalVencidas}</div>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(data.montoVencido)} vencido</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Por Vencer (7 días)</CardTitle><Clock className="h-4 w-4 text-yellow-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{data.porVencerProximaSemana}</div>
                <p className="text-xs text-muted-foreground mt-1">Próximos 7 días</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Proveedores</CardTitle><CreditCard className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{data.porProveedor.length}</div>
                <p className="text-xs text-muted-foreground mt-1">con deuda pendiente</p>
              </CardContent>
            </Card>
          </div>

          {/* Por proveedor */}
          <Card>
            <CardHeader><CardTitle>Resumen por Proveedor</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proveedor</TableHead>
                      <TableHead className="text-center">Compras</TableHead>
                      <TableHead className="text-right">Total Compras</TableHead>
                      <TableHead className="text-right">Abonado</TableHead>
                      <TableHead className="text-right">Saldo Pendiente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.porProveedor.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{p.proveedor}</TableCell>
                        <TableCell className="text-center">{p.compras}</TableCell>
                        <TableCell className="text-right">{formatCurrency(p.totalCompras)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(p.totalAbonado)}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">{formatCurrency(p.saldoPendiente)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Detalle */}
          <Card>
            <CardHeader><CardTitle>Detalle de Cuentas por Pagar ({data.detalle.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead># Compra</TableHead>
                      <TableHead>Factura</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Abono</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.detalle.map(c => (
                      <TableRow key={c.id} className={c.vencida ? "bg-red-50 dark:bg-red-950/10" : ""}>
                        <TableCell className="font-medium">{c.numeroCompra}</TableCell>
                        <TableCell>{c.factura || "—"}</TableCell>
                        <TableCell>{c.proveedor}</TableCell>
                        <TableCell>{formatFecha(c.fecha)}</TableCell>
                        <TableCell>{formatFecha(c.fechaVencimiento)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.abonoInicial)}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">{formatCurrency(c.saldoPendiente)}</TableCell>
                        <TableCell>
                          <Badge variant={c.vencida ? "destructive" : "secondary"}>
                            {c.vencida ? "Vencida" : "Vigente"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.detalle.length === 0 && (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No hay cuentas por pagar</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Cargando cuentas por pagar...</p></CardContent></Card>
      )}
    </div>
  )
}
