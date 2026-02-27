"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, PieChart, ArrowLeft, Download, FileDown, Package, TrendingDown, Activity, AlertTriangle } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { generateReportPDF } from "@/lib/pdf-export"
import Link from "next/link"

interface Producto {
  producto_id: number
  nombre: string
  sku: string
  categoria: string
  stock_actual: number
  precio_compra: number
  precio_venta: number
  unidades_vendidas: number
  total_ventas: number
  valor_inventario: number
  indice_rotacion: number
  dias_stock: number
  venta_diaria: number
  dias_con_venta: number
  primera_venta: string | null
  ultima_venta: string | null
  clasificacion: string
}

interface ReporteData {
  productos: Producto[]
  diasPeriodo: number
  totalProductos: number
  conMovimiento: number
  sinMovimiento: number
  valorInventarioTotal: number
  totalUnidadesVendidas: number
}

export function RotacionInventarioContent() {
  const { data: session } = useSession()
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [filtro, setFiltro] = useState<string>("todos")

  const canViewCosts = (session?.user as any)?.rol === "administrador"

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
      const res = await fetch(`/api/reportes/inventario/rotacion?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
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

  const productos = data?.productos ?? []
  const productosFiltrados = filtro === "todos"
    ? productos
    : productos.filter(p => p.clasificacion === filtro)

  const formatFecha = (f: string) => {
    const [a, m, d] = f.split("-").map(Number)
    return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
  }

  const clasificacionColor = (c: string) => {
    switch (c) {
      case "Alta rotación": return "text-green-700 border-green-300 bg-green-50"
      case "Media rotación": return "text-yellow-700 border-yellow-300 bg-yellow-50"
      case "Baja rotación": return "text-orange-700 border-orange-300 bg-orange-50"
      case "Sin movimiento": return "text-red-700 border-red-300 bg-red-50"
      default: return ""
    }
  }

  const exportarCSV = () => {
    if (!productosFiltrados.length) { toast.error("No hay datos para exportar"); return }
    const headers = canViewCosts
      ? ["#", "Producto", "SKU", "Categoría", "Stock", "Uds. Vendidas", "Ventas", "Costo Inv.", "Idx. Rotación", "Días Stock", "Clasificación"]
      : ["#", "Producto", "SKU", "Categoría", "Stock", "Uds. Vendidas", "Ventas", "Idx. Rotación", "Clasificación"]
    const rows = productosFiltrados.map((p, i) => {
      const base = [i + 1, p.nombre, p.sku, p.categoria, p.stock_actual, p.unidades_vendidas, p.total_ventas.toFixed(2)]
      if (canViewCosts) base.push(p.valor_inventario.toFixed(2) as any)
      base.push(p.indice_rotacion as any, canViewCosts ? p.dias_stock : undefined as any, p.clasificacion)
      return canViewCosts ? [i + 1, p.nombre, p.sku, p.categoria, p.stock_actual, p.unidades_vendidas, p.total_ventas.toFixed(2), p.valor_inventario.toFixed(2), p.indice_rotacion, p.dias_stock, p.clasificacion] : [i + 1, p.nombre, p.sku, p.categoria, p.stock_actual, p.unidades_vendidas, p.total_ventas.toFixed(2), p.indice_rotacion, p.clasificacion]
    })
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `rotacion_inventario_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!productosFiltrados.length) { toast.error("No hay datos para exportar"); return }
    setExportingPdf(true)
    try {
      const headers = canViewCosts
        ? ["#", "Producto", "Cat.", "Stock", "Vendidas", "Ventas", "Val. Inv.", "Rotación", "Días Stock", "Estado"]
        : ["#", "Producto", "Cat.", "Stock", "Vendidas", "Ventas", "Rotación", "Estado"]
      const rows = productosFiltrados.map((p, i) =>
        canViewCosts
          ? [String(i + 1), p.nombre, p.categoria, String(p.stock_actual), String(p.unidades_vendidas), `$${formatCurrency(p.total_ventas)}`, `$${formatCurrency(p.valor_inventario)}`, String(p.indice_rotacion), p.dias_stock >= 999 ? "∞" : String(p.dias_stock), p.clasificacion]
          : [String(i + 1), p.nombre, p.categoria, String(p.stock_actual), String(p.unidades_vendidas), `$${formatCurrency(p.total_ventas)}`, String(p.indice_rotacion), p.clasificacion]
      )

      generateReportPDF({
        title: "Rotación de Inventario",
        subtitle: "Análisis de velocidad de venta y productos sin movimiento",
        dateRange: `${formatFecha(fechaInicio)} — ${formatFecha(fechaFin)}`,
        kpis: [
          { label: "Total Productos", value: String(data?.totalProductos ?? 0), detail: `${data?.diasPeriodo ?? 0} días analizados` },
          { label: "Con Movimiento", value: String(data?.conMovimiento ?? 0), detail: `${data?.totalUnidadesVendidas ?? 0} uds. vendidas` },
          { label: "Sin Movimiento", value: String(data?.sinMovimiento ?? 0), detail: "Requieren atención" },
          ...(canViewCosts ? [{ label: "Valor Inventario", value: `$${formatCurrency(data?.valorInventarioTotal ?? 0)}`, detail: "Costo total en stock" }] : []),
        ],
        tables: [{
          title: filtro !== "todos" ? `Productos — ${filtro}` : "Todos los Productos",
          headers,
          rows,
          columnStyles: canViewCosts
            ? { 0: { halign: "center" as const }, 3: { halign: "center" as const }, 4: { halign: "center" as const }, 5: { halign: "right" as const }, 6: { halign: "right" as const }, 7: { halign: "center" as const }, 8: { halign: "center" as const } }
            : { 0: { halign: "center" as const }, 3: { halign: "center" as const }, 4: { halign: "center" as const }, 5: { halign: "right" as const }, 6: { halign: "center" as const } },
        }],
        orientation: "landscape",
        filename: `rotacion_inventario_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado correctamente")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar PDF: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setExportingPdf(false)
    }
  }

  // Summary counts by classification
  const conteoClasificacion = {
    alta: productos.filter(p => p.clasificacion === "Alta rotación").length,
    media: productos.filter(p => p.clasificacion === "Media rotación").length,
    baja: productos.filter(p => p.clasificacion === "Baja rotación").length,
    sin: productos.filter(p => p.clasificacion === "Sin movimiento").length,
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/reportes/contables" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Reportes Contables
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Rotación de Inventario</h1>
            <p className="text-sm text-muted-foreground">Análisis de velocidad de venta y productos sin movimiento</p>
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Clasificación</Label>
              <Select value={filtro} onValueChange={setFiltro}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Alta rotación">Alta rotación</SelectItem>
                  <SelectItem value="Media rotación">Media rotación</SelectItem>
                  <SelectItem value="Baja rotación">Baja rotación</SelectItem>
                  <SelectItem value="Sin movimiento">Sin movimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={fetchData} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PieChart className="mr-2 h-4 w-4" />}
                {loading ? "Cargando..." : "Aplicar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalProductos ?? 0}</div>
            <p className="text-xs text-muted-foreground">{data?.diasPeriodo ?? 0} días analizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Con Movimiento</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{data?.conMovimiento ?? 0}</div>
            <p className="text-xs text-muted-foreground">{data?.totalUnidadesVendidas ?? 0} unidades vendidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sin Movimiento</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data?.sinMovimiento ?? 0}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
        {canViewCosts && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatCurrency(data?.valorInventarioTotal ?? 0)}</div>
              <p className="text-xs text-muted-foreground">Costo total en stock</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Distribution bars */}
      {productos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Clasificación</CardTitle>
            <CardDescription>Proporción de productos según velocidad de rotación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Alta rotación", count: conteoClasificacion.alta, color: "bg-green-500" },
                { label: "Media rotación", count: conteoClasificacion.media, color: "bg-yellow-500" },
                { label: "Baja rotación", count: conteoClasificacion.baja, color: "bg-orange-500" },
                { label: "Sin movimiento", count: conteoClasificacion.sin, color: "bg-red-500" },
              ].map(item => {
                const pct = productos.length > 0 ? (item.count / productos.length) * 100 : 0
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{item.count} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className={`${item.color} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Rotación ({productosFiltrados.length} productos)</CardTitle>
          <CardDescription>Índice de rotación = unidades vendidas / stock actual</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {productosFiltrados.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-12">No hay productos que mostrar</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Vendidas</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  {canViewCosts && <TableHead className="text-right">Val. Inv.</TableHead>}
                  <TableHead className="text-center">Rotación</TableHead>
                  {canViewCosts && <TableHead className="text-center">Días Stock</TableHead>}
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosFiltrados.map((p, index) => (
                  <TableRow key={p.producto_id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.nombre}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.categoria}</TableCell>
                    <TableCell className="text-center font-medium">{p.stock_actual}</TableCell>
                    <TableCell className="text-center font-medium">{p.unidades_vendidas}</TableCell>
                    <TableCell className="text-right font-semibold">${formatCurrency(p.total_ventas)}</TableCell>
                    {canViewCosts && <TableCell className="text-right text-muted-foreground">${formatCurrency(p.valor_inventario)}</TableCell>}
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {p.indice_rotacion}x
                      </Badge>
                    </TableCell>
                    {canViewCosts && (
                      <TableCell className="text-center text-muted-foreground">
                        {p.dias_stock >= 999 ? "∞" : `${p.dias_stock}d`}
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <Badge variant="outline" className={clasificacionColor(p.clasificacion)}>
                        {p.clasificacion}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
