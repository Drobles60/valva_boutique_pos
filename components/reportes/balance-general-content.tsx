"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Download, FileDown, Landmark, TrendingUp, TrendingDown, Wallet, Package, CreditCard, DollarSign } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import Link from "next/link"

interface BalanceData {
  fecha: string
  activos: {
    inventario: number
    inventarioVenta: number
    efectivoCaja: number
    cuentasPorCobrar: number
    cuentasPorCobrarCantidad: number
    total: number
  }
  pasivos: {
    deudasProveedores: number
    deudasProveedoresCantidad: number
    total: number
  }
  patrimonio: number
  utilidadAcumulada: number
  ingresosAcumulados: number
  gastosAcumulados: number
}

export function BalanceGeneralContent() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<BalanceData | null>(null)
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0])
  const [exportingPdf, setExportingPdf] = useState(false)

  const canViewCosts = (session?.user as any)?.rol === "administrador"

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/financieros/balance?fecha=${fecha}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const exportarCSV = () => {
    if (!data) { toast.error("No hay datos"); return }
    const rows = [
      ["BALANCE GENERAL", `Al ${data.fecha}`],
      [""],
      ["ACTIVOS"],
      ["Inventario (al costo)", data.activos.inventario.toFixed(2)],
      ["Efectivo en caja", data.activos.efectivoCaja.toFixed(2)],
      ["Cuentas por cobrar", data.activos.cuentasPorCobrar.toFixed(2)],
      ["TOTAL ACTIVOS", data.activos.total.toFixed(2)],
      [""],
      ["PASIVOS"],
      ["Deudas a proveedores", data.pasivos.deudasProveedores.toFixed(2)],
      ["TOTAL PASIVOS", data.pasivos.total.toFixed(2)],
      [""],
      ["PATRIMONIO", data.patrimonio.toFixed(2)],
      [""],
      ["RESULTADOS"],
      ["Ingresos acumulados", data.ingresosAcumulados.toFixed(2)],
      ["Gastos acumulados", data.gastosAcumulados.toFixed(2)],
      ["Utilidad acumulada", data.utilidadAcumulada.toFixed(2)],
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `balance_general_${data.fecha}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Balance General",
        subtitle: `Estado financiero al ${data.fecha}`,
        dateRange: `Generado: ${new Date().toLocaleDateString("es-CO")}`,
        kpis: [
          { label: "Total Activos", value: formatCurrency(data.activos.total) },
          { label: "Total Pasivos", value: formatCurrency(data.pasivos.total) },
          { label: "Patrimonio", value: formatCurrency(data.patrimonio) },
          { label: "Utilidad", value: formatCurrency(data.utilidadAcumulada) },
        ],
        tables: [{
          title: "Detalle del Balance",
          headers: ["Concepto", "Monto"],
          rows: [
            ["ACTIVOS", ""],
            ["  Inventario (al costo)", formatCurrency(data.activos.inventario)],
            ["  Efectivo en caja", formatCurrency(data.activos.efectivoCaja)],
            ["  Cuentas por cobrar", formatCurrency(data.activos.cuentasPorCobrar)],
            ["  TOTAL ACTIVOS", formatCurrency(data.activos.total)],
            ["", ""],
            ["PASIVOS", ""],
            ["  Deudas a proveedores", formatCurrency(data.pasivos.deudasProveedores)],
            ["  TOTAL PASIVOS", formatCurrency(data.pasivos.total)],
            ["", ""],
            ["PATRIMONIO NETO", formatCurrency(data.patrimonio)],
            ["", ""],
            ["Ingresos acumulados", formatCurrency(data.ingresosAcumulados)],
            ["Gastos acumulados", formatCurrency(data.gastosAcumulados)],
            ["Utilidad acumulada", formatCurrency(data.utilidadAcumulada)],
          ],
          columnStyles: { 1: { halign: "right" as const } },
        }],
        filename: `balance_general_${data.fecha}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Balance General</h1>
            <p className="text-sm text-muted-foreground">Estado financiero: activos, pasivos y patrimonio</p>
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
            <div className="space-y-2"><Label>Fecha de corte</Label><Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></div>
            <div className="flex items-end"><Button onClick={fetchData} disabled={loading} className="w-full">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Consultar</Button></div>
          </div>
        </CardContent>
      </Card>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><span className="ml-2 text-muted-foreground">Cargando balance...</span></div>}

      {data && !loading && (
        <>
          {/* KPIs principales */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Activos</CardTitle><TrendingUp className="h-4 w-4 text-green-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(data.activos.total)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Pasivos</CardTitle><TrendingDown className="h-4 w-4 text-red-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(data.pasivos.total)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Patrimonio</CardTitle><Landmark className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-blue-600">{formatCurrency(data.patrimonio)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Utilidad Acumulada</CardTitle><DollarSign className="h-4 w-4 text-purple-600" /></CardHeader>
              <CardContent><div className={`text-2xl font-bold ${data.utilidadAcumulada >= 0 ? "text-purple-600" : "text-red-600"}`}>{formatCurrency(data.utilidadAcumulada)}</div></CardContent>
            </Card>
          </div>

          {/* Activos */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" /> Activos</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <div className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /><span>Inventario (al costo)</span></div>
                  <span className="font-medium">{formatCurrency(data.activos.inventario)}</span>
                </div>
                {canViewCosts && (
                  <div className="flex justify-between items-center py-3 border-b pl-6">
                    <span className="text-sm text-muted-foreground">Valor de venta estimado</span>
                    <span className="text-sm text-muted-foreground">{formatCurrency(data.activos.inventarioVenta)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 border-b">
                  <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-muted-foreground" /><span>Efectivo en caja</span></div>
                  <span className="font-medium">{formatCurrency(data.activos.efectivoCaja)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /><span>Cuentas por cobrar ({data.activos.cuentasPorCobrarCantidad})</span></div>
                  <span className="font-medium">{formatCurrency(data.activos.cuentasPorCobrar)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-950/20 px-3 rounded-md">
                  <span className="font-bold">TOTAL ACTIVOS</span>
                  <span className="font-bold text-green-600">{formatCurrency(data.activos.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pasivos */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-red-600" /> Pasivos</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /><span>Deudas a proveedores ({data.pasivos.deudasProveedoresCantidad})</span></div>
                  <span className="font-medium">{formatCurrency(data.pasivos.deudasProveedores)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-red-50 dark:bg-red-950/20 px-3 rounded-md">
                  <span className="font-bold">TOTAL PASIVOS</span>
                  <span className="font-bold text-red-600">{formatCurrency(data.pasivos.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patrimonio y resultados */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-blue-600" /> Patrimonio y Resultados</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 bg-blue-50 dark:bg-blue-950/20 px-3 rounded-md">
                  <span className="font-bold">PATRIMONIO NETO</span>
                  <span className="font-bold text-blue-600">{formatCurrency(data.patrimonio)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span>Ingresos acumulados (ventas)</span>
                  <span className="font-medium text-green-600">{formatCurrency(data.ingresosAcumulados)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span>Gastos acumulados</span>
                  <span className="font-medium text-red-600">{formatCurrency(data.gastosAcumulados)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-purple-50 dark:bg-purple-950/20 px-3 rounded-md">
                  <span className="font-bold">UTILIDAD ACUMULADA</span>
                  <span className={`font-bold ${data.utilidadAcumulada >= 0 ? "text-purple-600" : "text-red-600"}`}>{formatCurrency(data.utilidadAcumulada)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><Landmark className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Consulta el balance general a una fecha de corte</p></CardContent></Card>
      )}
    </div>
  )
}
