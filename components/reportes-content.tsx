"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, TrendingUp, DollarSign, ShoppingCart, Percent, BarChart3, Calculator, PieChart, Loader2, ArrowLeft, FileDown } from "lucide-react"
import { generateReportPDF } from "@/lib/pdf-export"
import { useSession } from "next-auth/react"
import { SidebarToggle } from "./app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

interface ReporteData {
  periodo: string
  totalVentas: number
  totalTransacciones: number
  ticketPromedio: number
  ventasContado: number
  ventasCredito: number
  utilidadBruta: number
  totalCosto: number
  margenUtilidad: number
  ventasPorDia: { fecha: string; ventas: number; transacciones: number }[]
  ventasPorFormaPago: { formaPago: string; monto: number; transacciones: number; porcentaje: number }[]
  topProductos: { producto_id: number; nombre: string; sku: string; cantidad: number; ventas: number; costo: number; utilidad: number; margen: number }[]
  topRentables: { producto_id: number; nombre: string; sku: string; cantidad: number; ventas: number; costo: number; utilidad: number; margen: number }[]
}

export function ReportesContent() {
  const { data: session } = useSession()
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [tipoReporte, setTipoReporte] = useState("todo")
  const [loading, setLoading] = useState(false)
  const [reporte, setReporte] = useState<ReporteData | null>(null)
  const [mounted, setMounted] = useState(false)

  const canViewCosts = (session?.user as any)?.rol === "administrador"

  // Set default dates on mount
  useEffect(() => {
    setMounted(true)
    const hoy = new Date()
    const hace7Dias = new Date(hoy)
    hace7Dias.setDate(hoy.getDate() - 7)
    setFechaInicio(hace7Dias.toISOString().split("T")[0])
    setFechaFin(hoy.toISOString().split("T")[0])
  }, [])

  const fetchReporte = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ fechaInicio, fechaFin })
      const res = await fetch(`/api/reportes/ventas/general?${params}`)
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error || "Error al cargar reporte")
        return
      }
      setReporte(json)
    } catch {
      toast.error("Error de conexión al cargar reporte")
    } finally {
      setLoading(false)
    }
  }, [fechaInicio, fechaFin])

  // Auto-fetch when dates are set
  useEffect(() => {
    if (fechaInicio && fechaFin && mounted) {
      fetchReporte()
    }
  }, [fechaInicio, fechaFin, mounted, fetchReporte])

  const totalVentas = reporte?.totalVentas ?? 0
  const ventasContado = reporte?.ventasContado ?? 0
  const ventasCredito = reporte?.ventasCredito ?? 0
  const ticketPromedio = reporte?.ticketPromedio ?? 0
  const utilidadBruta = reporte?.utilidadBruta ?? 0
  const margenUtilidad = reporte?.margenUtilidad ?? 0
  const transacciones = reporte?.totalTransacciones ?? 0
  const ventasPorDia = reporte?.ventasPorDia ?? []
  const topProductos = reporte?.topProductos ?? []
  const topRentables = reporte?.topRentables ?? []

  // Visibility helpers based on tipoReporte filter
  const showVentasSection = tipoReporte === "todo" || tipoReporte === "ventas"
  const showRentabilidadSection = tipoReporte === "todo" || tipoReporte === "rentabilidad"
  const showProductosSection = tipoReporte === "todo" || tipoReporte === "ventas" || tipoReporte === "productos"
  const showDiarioSection = tipoReporte === "todo" || tipoReporte === "ventas" || tipoReporte === "productos"

  const [exportingPdf, setExportingPdf] = useState(false)

  // Exportar CSV
  const exportarCSV = () => {
    if (!reporte || !topProductos.length) { toast.error("No hay datos para exportar"); return }
    const headers = ["Producto", "SKU", "Cantidad", "Ventas", "Costo", "Utilidad", "Margen"]
    const rows = topProductos.map(p => [p.nombre, p.sku, p.cantidad, p.ventas.toFixed(2), p.costo.toFixed(2), p.utilidad.toFixed(2), p.margen.toFixed(1) + "%"])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte_ventas_${fechaInicio}_${fechaFin}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Reporte exportado")
  }

  // Exportar PDF
  const exportarPDF = async () => {
    if (!reporte) { toast.error("No hay datos para exportar"); return }
    setExportingPdf(true)
    try {
      const formatFecha = (f: string) => {
        const [a, m, d] = f.split("-").map(Number)
        return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
      }

      const kpis = [
        { label: "Ventas Totales", value: `$${formatCurrency(totalVentas)}`, detail: `${transacciones} transacciones` },
        { label: "Ticket Promedio", value: `$${formatCurrency(ticketPromedio)}`, detail: "Por transacción" },
      ]
      if (canViewCosts) {
        kpis.push(
          { label: "Utilidad Bruta", value: `$${formatCurrency(utilidadBruta)}`, detail: "Ventas menos costos" },
          { label: "Margen", value: `${margenUtilidad.toFixed(1)}%`, detail: "Rentabilidad promedio" },
        )
      }

      const tables: any[] = []

      // Tabla ventas por día
      if (ventasPorDia.length > 0) {
        tables.push({
          title: "Ventas por Día",
          headers: ["Fecha", "Transacciones", "Total Ventas"],
          rows: ventasPorDia.map(d => [d.fecha, String(d.transacciones), `$${formatCurrency(d.ventas)}`]),
          columnStyles: { 1: { halign: "center" as const }, 2: { halign: "right" as const } },
        })
      }

      // Tabla forma de pago
      if (reporte.ventasPorFormaPago?.length) {
        tables.push({
          title: "Ventas por Método de Pago",
          headers: ["Método", "Transacciones", "Monto", "Porcentaje"],
          rows: reporte.ventasPorFormaPago.map(fp => [
            fp.formaPago === "efectivo" ? "Efectivo" : fp.formaPago === "transferencia" ? "Transferencia" : fp.formaPago === "mixto" ? "Mixto" : fp.formaPago,
            String(fp.transacciones),
            `$${formatCurrency(fp.monto)}`,
            `${fp.porcentaje.toFixed(1)}%`,
          ]),
          columnStyles: { 1: { halign: "center" as const }, 2: { halign: "right" as const }, 3: { halign: "center" as const } },
        })
      }

      // Tabla top productos
      if (topProductos.length > 0) {
        const pHeaders = canViewCosts
          ? ["#", "Producto", "SKU", "Cantidad", "Ventas", "Costo", "Utilidad", "Margen"]
          : ["#", "Producto", "SKU", "Cantidad", "Ventas"]
        const pRows = topProductos.map((p, i) => {
          const base = [String(i + 1), p.nombre, p.sku, String(p.cantidad), `$${formatCurrency(p.ventas)}`]
          if (canViewCosts) base.push(`$${formatCurrency(p.costo)}`, `$${formatCurrency(p.utilidad)}`, `${p.margen.toFixed(1)}%`)
          return base
        })
        tables.push({ title: "Top 10 Productos Más Vendidos", headers: pHeaders, rows: pRows, columnStyles: { 0: { halign: "center" as const } } })
      }

      // Tabla top rentables
      if (canViewCosts && topRentables.length > 0) {
        tables.push({
          title: "Top 10 Productos Más Rentables",
          headers: ["#", "Producto", "Utilidad", "Margen", "Cantidad", "Ventas"],
          rows: topRentables.map((p, i) => [
            String(i + 1), p.nombre, `$${formatCurrency(p.utilidad)}`, `${p.margen.toFixed(1)}%`, String(p.cantidad), `$${formatCurrency(p.ventas)}`,
          ]),
          columnStyles: { 0: { halign: "center" as const }, 2: { halign: "right" as const }, 5: { halign: "right" as const } },
        })
      }

      generateReportPDF({
        title: "Dashboard en Vivo",
        subtitle: "Análisis de ventas y rentabilidad",
        dateRange: `${formatFecha(fechaInicio)} — ${formatFecha(fechaFin)}`,
        kpis,
        tables,
        orientation: "landscape",
        filename: `dashboard_ventas_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado correctamente")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/reportes/generales" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Reportes Generales
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard en Vivo</h1>
            <p className="text-sm text-muted-foreground md:text-base">Análisis de ventas y rentabilidad</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!reporte || loading}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!reporte || loading || exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            PDF
          </Button>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/reportes/generales">
        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Reportes Generales</CardTitle>
                <CardDescription className="text-xs">Ventas y productos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Análisis de ventas, productos más vendidos, rentabilidad y estadísticas generales del negocio.
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Ventas por período</li>
              <li>• Top productos</li>
              <li>• Análisis de rentabilidad</li>
              <li>• Ticket promedio</li>
            </ul>
            <Button size="sm" className="w-full mt-3">
              Ver Reportes Generales →
            </Button>
          </CardContent>
        </Card>
        </Link>

        <Card className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer" onClick={() => window.location.href = "/reportes/contables"}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Reportes Contables</CardTitle>
                <CardDescription className="text-xs">Finanzas y contabilidad</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Reportes financieros avanzados: estado de resultados, flujo de caja, gastos, inventario y más.
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Estado de resultados</li>
              <li>• Flujo de caja</li>
              <li>• Análisis de gastos</li>
              <li>• Cartera de créditos</li>
            </ul>
            <Button size="sm" className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
              Ver Reportes Contables →
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer" onClick={() => window.location.href = "/reportes/estadisticas"}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <PieChart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Estadísticas Avanzadas</CardTitle>
                <CardDescription className="text-xs">Análisis detallados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Métricas adicionales, gráficas comparativas y análisis de tendencias de tu negocio.
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Tendencias de ventas</li>
              <li>• Comparativas por período</li>
              <li>• Análisis de clientes</li>
              <li>• Rotación de inventario</li>
            </ul>
            <Button size="sm" className="w-full mt-3 bg-green-600 hover:bg-green-700">
              Ver Estadísticas Avanzadas →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
          <CardDescription>Seleccione el período para analizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="tipo-reporte">Tipo de Análisis</Label>
              <Select value={tipoReporte} onValueChange={setTipoReporte}>
                <SelectTrigger id="tipo-reporte">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todos</SelectItem>
                  <SelectItem value="ventas">Solo Ventas</SelectItem>
                  <SelectItem value="rentabilidad">Rentabilidad</SelectItem>
                  <SelectItem value="productos">Por Producto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-fin">Fecha Fin</Label>
              <Input id="fecha-fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={fetchReporte} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                {loading ? "Cargando..." : "Actualizar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats */}
      <div className={`grid gap-4 ${canViewCosts && showRentabilidadSection ? "md:grid-cols-4" : "md:grid-cols-2"}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(totalVentas)}</div>
            <p className="text-xs text-muted-foreground">{transacciones} transacciones</p>
          </CardContent>
        </Card>

        {canViewCosts && showRentabilidadSection && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilidad Bruta</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#D4AF37]">${formatCurrency(utilidadBruta)}</div>
                <p className="text-xs text-muted-foreground">Ventas menos costos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margen de Utilidad</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#D4AF37]">{margenUtilidad.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Rentabilidad promedio</p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(ticketPromedio)}</div>
            <p className="text-xs text-muted-foreground">Por transacción</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Payment Method + Sales by Day */}
      {(showVentasSection || showDiarioSection) && (
      <div className={`grid gap-6 ${showVentasSection && showDiarioSection ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
        {showVentasSection && (
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Método de Pago</CardTitle>
            <CardDescription>Distribución de ventas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Ventas de Contado</p>
                  <p className="text-sm text-muted-foreground">
                    {totalVentas > 0 ? ((ventasContado / totalVentas) * 100).toFixed(1) : "0.0"}% del total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">${formatCurrency(ventasContado)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Ventas a Crédito</p>
                  <p className="text-sm text-muted-foreground">
                    {totalVentas > 0 ? ((ventasCredito / totalVentas) * 100).toFixed(1) : "0.0"}% del total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">${formatCurrency(ventasCredito)}</p>
              </div>
            </div>

            {/* Ventas por forma de pago detallada */}
            {reporte?.ventasPorFormaPago && reporte.ventasPorFormaPago.length > 0 && (
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Por método</p>
                {reporte.ventasPorFormaPago.map((fp, i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-2">
                    <span className="capitalize">{fp.formaPago === "efectivo" ? "Efectivo" : fp.formaPago === "transferencia" ? "Transferencia" : fp.formaPago === "mixto" ? "Mixto" : fp.formaPago}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{fp.transacciones} ventas</span>
                      <span className="font-semibold">${formatCurrency(fp.monto)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {showDiarioSection && (
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Día</CardTitle>
            <CardDescription>Últimos días del período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ventasPorDia.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-8">No hay ventas en este período</p>
              )}
              {ventasPorDia.slice(-7).map((dia) => {
                // fecha siempre llega como "YYYY-MM-DD" desde el API
                const [anio, mes, dia2] = (dia.fecha as string).split("-").map(Number)
                const fechaFormateada = new Date(anio, mes - 1, dia2).toLocaleDateString("es-CO", {
                  weekday: "short", day: "2-digit", month: "short"
                })
                // Barra visual proporcional
                const maxVenta = Math.max(...ventasPorDia.map(d => d.ventas), 1)
                const pct = (dia.ventas / maxVenta) * 100
                return (
                  <div key={dia.fecha} className="relative rounded-lg border p-3 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-primary/5" style={{ width: `${pct}%` }} />
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{fechaFormateada}</p>
                        <p className="text-sm text-muted-foreground">{dia.transacciones} transacciones</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${formatCurrency(dia.ventas)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
      )}

      {/* Top Products */}
      {showProductosSection && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 10 productos por volumen de ventas</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {topProductos.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay ventas de productos en este período</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posición</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Ventas</TableHead>
                    {canViewCosts && (
                      <>
                        <TableHead className="text-right">Costo</TableHead>
                        <TableHead className="text-right">Utilidad</TableHead>
                        <TableHead className="text-right">Margen</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProductos.map((item, index) => (
                    <TableRow key={item.producto_id}>
                      <TableCell>
                        <Badge variant={index < 3 ? "default" : "secondary"}>#{index + 1}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.nombre}</p>
                          <p className="text-xs text-muted-foreground">{item.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.cantidad}</TableCell>
                      <TableCell className="text-right font-semibold">${formatCurrency(item.ventas)}</TableCell>
                      {canViewCosts && (
                        <>
                          <TableCell className="text-right text-muted-foreground">${formatCurrency(item.costo)}</TableCell>
                          <TableCell className="text-right font-semibold text-[#D4AF37]">${formatCurrency(item.utilidad)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{item.margen.toFixed(1)}%</Badge>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Most Profitable Products */}
      {canViewCosts && showRentabilidadSection && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Rentables</CardTitle>
            <CardDescription>Top 10 productos por utilidad generada</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {topRentables.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay datos de rentabilidad en este período</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posición</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Utilidad</TableHead>
                    <TableHead className="text-right">Margen</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Total Ventas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topRentables.map((item, index) => (
                    <TableRow key={item.producto_id}>
                      <TableCell>
                        <Badge className="bg-[#D4AF37]">#{index + 1}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.nombre}</p>
                          <p className="text-xs text-muted-foreground">{item.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#D4AF37]">${formatCurrency(item.utilidad)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{item.margen.toFixed(1)}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.cantidad}</TableCell>
                      <TableCell className="text-right font-semibold">${formatCurrency(item.ventas)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
