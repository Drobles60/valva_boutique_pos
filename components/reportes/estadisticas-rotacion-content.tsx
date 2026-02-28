"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Download, FileDown, Package, TrendingUp, TrendingDown, AlertTriangle, Zap } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { captureMultipleCharts } from "@/lib/chart-capture"
import { toast } from "sonner"
import Link from "next/link"
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"

const ROTATION_COLORS: Record<string, string> = {
  alta: "#10b981",
  media: "#3b82f6",
  baja: "#f59e0b",
  "sin-movimiento": "#ef4444",
}

interface ProductoItem {
  id: number
  nombre: string
  sku: string
  stockActual: number
  precioCompra: number
  precioVenta: number
  categoria: string
  cantidadVendida: number
  montoVentas: number
  costoVentas: number
  rotacion: string
  ratioRotacion: number
}

interface ReporteData {
  periodo: string
  resumen: {
    totalProductos: number
    altaRotacion: number
    mediaRotacion: number
    bajaRotacion: number
    sinMovimiento: number
    valorStockParado: number
    totalVendido: number
    montoTotalVentas: number
  }
  productos: ProductoItem[]
  rotacionCategoria: {
    categoria: string
    totalProductos: number
    cantidadVendida: number
    montoVentas: number
    stockTotal: number
  }[]
  categorias: { id: number; nombre: string }[]
}

export function EstadisticasRotacionContent() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [categoriaId, setCategoriaId] = useState("todas")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const chartPieRef = useRef<HTMLDivElement>(null)
  const chartBarRef = useRef<HTMLDivElement>(null)

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
      const catParam = categoriaId !== "todas" ? `&categoriaId=${categoriaId}` : ""
      const res = await fetch(
        `/api/reportes/estadisticas/rotacion?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}${catParam}`
      )
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error || "Error al cargar datos")
        return
      }
      setData(json)
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }, [fechaInicio, fechaFin, categoriaId])

  useEffect(() => {
    if (fechaInicio && fechaFin) fetchData()
  }, [fechaInicio, fechaFin, categoriaId, fetchData])

  const rotacionBadge = (r: string) => {
    const m: Record<string, { label: string; cls: string }> = {
      alta: { label: "Alta", cls: "bg-green-100 text-green-800" },
      media: { label: "Media", cls: "bg-blue-100 text-blue-800" },
      baja: { label: "Baja", cls: "bg-amber-100 text-amber-800" },
      "sin-movimiento": { label: "Sin Mov.", cls: "bg-red-100 text-red-800" },
    }
    const cfg = m[r] || m["sin-movimiento"]
    return <Badge className={cfg.cls}>{cfg.label}</Badge>
  }

  const exportarCSV = () => {
    if (!data?.productos.length) {
      toast.error("No hay datos para exportar")
      return
    }
    const rows = [
      ["Producto", "SKU", "Categoría", "Stock", "Vendido", "Monto Vtas", "Rotación", "Ratio"],
      ...data.productos.map((p) => [
        p.nombre,
        p.sku || "",
        p.categoria,
        p.stockActual,
        p.cantidadVendida,
        p.montoVentas.toFixed(2),
        p.rotacion,
        p.ratioRotacion.toFixed(2),
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `rotacion_inventario_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data) {
      toast.error("No hay datos")
      return
    }
    setExportingPdf(true)
    try {
      const chartImages = await captureMultipleCharts([
        { title: "Distribución de Rotación", ref: chartPieRef },
        { title: "Ventas por Categoría", ref: chartBarRef },
      ])

      generateReportPDF({
        title: "Rotación de Inventario",
        subtitle: "Análisis de movimiento de productos",
        dateRange: `Del ${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Productos", value: String(data.resumen.totalProductos) },
          { label: "Alta Rotación", value: String(data.resumen.altaRotacion) },
          {
            label: "Sin Movimiento",
            value: String(data.resumen.sinMovimiento),
            detail: formatCurrency(data.resumen.valorStockParado),
          },
          { label: "Uds. Vendidas", value: String(data.resumen.totalVendido) },
        ],
        chartImages,
        tables: [
          {
            title: "Top Productos por Ventas",
            headers: ["Producto", "Categoría", "Stock", "Vendido", "Monto", "Rotación"],
            rows: data.productos
              .filter((p) => p.cantidadVendida > 0)
              .slice(0, 20)
              .map((p) => [
                p.nombre,
                p.categoria,
                String(p.stockActual),
                String(p.cantidadVendida),
                formatCurrency(p.montoVentas),
                p.rotacion,
              ]),
            columnStyles: {
              2: { halign: "center" as const },
              3: { halign: "center" as const },
              4: { halign: "right" as const },
            },
          },
          {
            title: "Productos Sin Movimiento",
            headers: ["Producto", "Categoría", "Stock", "Valor Costo"],
            rows: data.productos
              .filter((p) => p.rotacion === "sin-movimiento")
              .slice(0, 20)
              .map((p) => [
                p.nombre,
                p.categoria,
                String(p.stockActual),
                formatCurrency(p.stockActual * p.precioCompra),
              ]),
            columnStyles: {
              2: { halign: "center" as const },
              3: { halign: "right" as const },
            },
          },
        ],
        filename: `rotacion_inventario_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado")
    } catch {
      toast.error("Error al generar PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  // Pie chart data
  const pieData = data
    ? [
        { name: "Alta", value: data.resumen.altaRotacion, fill: ROTATION_COLORS.alta },
        { name: "Media", value: data.resumen.mediaRotacion, fill: ROTATION_COLORS.media },
        { name: "Baja", value: data.resumen.bajaRotacion, fill: ROTATION_COLORS.baja },
        { name: "Sin Mov.", value: data.resumen.sinMovimiento, fill: ROTATION_COLORS["sin-movimiento"] },
      ].filter((d) => d.value > 0)
    : []

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/estadisticas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Rotación de Inventario</h1>
            <p className="text-sm text-muted-foreground">Velocidad de movimiento y distribución por categoría</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!data || loading}>
            <FileDown className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!data || loading || exportingPdf}>
            {exportingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={categoriaId} onValueChange={setCategoriaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {data?.categorias.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchData} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Consultar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {data && !loading && (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{data.resumen.totalProductos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alta Rotación</CardTitle>
                <Zap className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{data.resumen.altaRotacion}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.resumen.totalProductos > 0
                    ? ((data.resumen.altaRotacion / data.resumen.totalProductos) * 100).toFixed(0)
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sin Movimiento</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{data.resumen.sinMovimiento}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.resumen.totalProductos > 0
                    ? ((data.resumen.sinMovimiento / data.resumen.totalProductos) * 100).toFixed(0)
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uds. Vendidas</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{data.resumen.totalVendido}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Parado</CardTitle>
                <TrendingDown className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {formatCurrency(data.resumen.valorStockParado)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Valor en costo</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {pieData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Rotación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={chartPieRef} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((d, i) => (
                            <Cell key={i} fill={d.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            {data.rotacionCategoria.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div ref={chartBarRef} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.rotacionCategoria} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <YAxis dataKey="categoria" type="category" tick={{ fontSize: 11 }} width={120} />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="montoVentas" name="Ventas" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="vendidos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="vendidos">
                Más Vendidos ({data.productos.filter((p) => p.cantidadVendida > 0).length})
              </TabsTrigger>
              <TabsTrigger value="sin-movimiento">Sin Movimiento ({data.resumen.sinMovimiento})</TabsTrigger>
              <TabsTrigger value="categorias">Por Categoría ({data.rotacionCategoria.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="vendidos">
              <Card>
                <CardHeader>
                  <CardTitle>Productos con Mayor Rotación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead className="text-center">Stock</TableHead>
                          <TableHead className="text-center">Vendido</TableHead>
                          <TableHead className="text-right">Monto Vtas.</TableHead>
                          <TableHead className="text-center">Rotación</TableHead>
                          <TableHead className="text-right">Ratio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.productos
                          .filter((p) => p.cantidadVendida > 0)
                          .slice(0, 30)
                          .map((p, i) => (
                            <TableRow key={p.id}>
                              <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                              <TableCell className="font-medium">{p.nombre}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{p.categoria}</TableCell>
                              <TableCell className="text-center">{p.stockActual}</TableCell>
                              <TableCell className="text-center font-medium">{p.cantidadVendida}</TableCell>
                              <TableCell className="text-right">{formatCurrency(p.montoVentas)}</TableCell>
                              <TableCell className="text-center">{rotacionBadge(p.rotacion)}</TableCell>
                              <TableCell className="text-right font-mono">{p.ratioRotacion.toFixed(2)}x</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sin-movimiento">
              <Card>
                <CardHeader>
                  <CardTitle>Productos Sin Movimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead className="text-center">Stock</TableHead>
                          <TableHead className="text-right">Valor Costo</TableHead>
                          <TableHead className="text-right">Precio Venta</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.productos
                          .filter((p) => p.rotacion === "sin-movimiento")
                          .map((p) => (
                            <TableRow key={p.id} className="bg-red-50/50 dark:bg-red-950/10">
                              <TableCell className="font-medium">{p.nombre}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{p.sku || "—"}</TableCell>
                              <TableCell className="text-sm">{p.categoria}</TableCell>
                              <TableCell className="text-center">{p.stockActual}</TableCell>
                              <TableCell className="text-right text-red-600 font-medium">
                                {formatCurrency(p.stockActual * p.precioCompra)}
                              </TableCell>
                              <TableCell className="text-right">{formatCurrency(p.precioVenta)}</TableCell>
                            </TableRow>
                          ))}
                        {data.productos.filter((p) => p.rotacion === "sin-movimiento").length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Todos los productos tuvieron movimiento en este período
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categorias">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Categoría</TableHead>
                          <TableHead className="text-center">Productos</TableHead>
                          <TableHead className="text-center">Vendidos</TableHead>
                          <TableHead className="text-right">Monto Ventas</TableHead>
                          <TableHead className="text-center">Stock Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.rotacionCategoria.map((c, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{c.categoria}</TableCell>
                            <TableCell className="text-center">{c.totalProductos}</TableCell>
                            <TableCell className="text-center">{c.cantidadVendida}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(c.montoVentas)}</TableCell>
                            <TableCell className="text-center">{c.stockTotal}</TableCell>
                          </TableRow>
                        ))}
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Selecciona fechas para analizar la rotación del inventario</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
