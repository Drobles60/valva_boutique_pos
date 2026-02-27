"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, Tag, Package, TrendingUp, BarChart3 } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface CategoriaData {
  categoria: string
  categoriaId: number
  ventas: number
  unidades: number
  totalVenta: number
  totalCosto: number
  utilidad: number
  margen: number
  productosDistintos: number
  participacion: number
}

interface Totales {
  ventas: number
  unidades: number
  costo: number
  utilidad: number
  margen: number
  categorias: number
}

interface ReporteData {
  categorias: CategoriaData[]
  totales: Totales
}

export function CategoriasProductosContent() {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.rol === "administrador"
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  const cargarReporte = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (fechaInicio) params.set("fechaInicio", fechaInicio)
      if (fechaFin) params.set("fechaFin", fechaFin)
      const response = await fetch(`/api/reportes/ventas/categorias?${params}`)
      const json = await response.json()
      if (!response.ok || !json.success) {
        toast.error(json.error || "Error al cargar el reporte")
        return
      }
      setData(json)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }, [fechaInicio, fechaFin])

  useEffect(() => {
    // Default: last 30 days
    const hoy = new Date()
    const hace30 = new Date()
    hace30.setDate(hace30.getDate() - 30)
    setFechaFin(hoy.toISOString().split("T")[0])
    setFechaInicio(hace30.toISOString().split("T")[0])
  }, [])

  useEffect(() => {
    if (fechaInicio && fechaFin) cargarReporte()
  }, [fechaInicio, fechaFin, cargarReporte])

  const getBarWidth = (valor: number, max: number) => {
    if (max === 0) return 0
    return Math.max(5, (valor / max) * 100)
  }

  const exportarCSV = () => {
    if (!data || !data.categorias.length) { toast.error("No hay datos"); return }
    const headers = isAdmin
      ? ["#", "Categoría", "Productos", "Unidades", "Total Venta", "Costo", "Utilidad", "Margen %", "Participación %"]
      : ["#", "Categoría", "Productos", "Unidades", "Total Venta", "Participación %"]
    const rows = data.categorias.map((c, i) => {
      const base = [i + 1, c.categoria, c.productosDistintos, c.unidades, c.totalVenta.toFixed(2)]
      if (isAdmin) {
        base.push(c.totalCosto.toFixed(2), c.utilidad.toFixed(2), c.margen.toFixed(1), c.participacion.toFixed(1))
      } else {
        base.push(c.participacion.toFixed(1))
      }
      return base
    })
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `categorias_productos_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!data || !data.categorias.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      const headers = isAdmin
        ? ["#", "Categoría", "Prods", "Uds", "Venta", "Costo", "Utilidad", "Margen", "Part."]
        : ["#", "Categoría", "Prods", "Uds", "Venta", "Part."]
      const rows = data.categorias.map((c, i) => {
        const base = [String(i + 1), c.categoria, String(c.productosDistintos), String(c.unidades), `$${formatCurrency(c.totalVenta)}`]
        if (isAdmin) {
          base.push(`$${formatCurrency(c.totalCosto)}`, `$${formatCurrency(c.utilidad)}`, `${c.margen.toFixed(1)}%`, `${c.participacion.toFixed(1)}%`)
        } else {
          base.push(`${c.participacion.toFixed(1)}%`)
        }
        return base
      })

      const kpis = [
        { label: "Total Ventas", value: `$${formatCurrency(data.totales.ventas)}`, detail: `${data.totales.unidades} unidades` },
        { label: "Categorías", value: String(data.totales.categorias), detail: "Con ventas" },
      ]
      if (isAdmin) {
        kpis.push(
          { label: "Utilidad", value: `$${formatCurrency(data.totales.utilidad)}`, detail: `Margen ${data.totales.margen.toFixed(1)}%` },
        )
      }

      generateReportPDF({
        title: "Ventas por Categoría",
        subtitle: "Análisis de rendimiento por categoría de producto",
        dateRange: `${fechaInicio} al ${fechaFin}`,
        kpis,
        tables: [{ title: "Desglose por Categoría", headers, rows, columnStyles: { 0: { halign: "center" as const } } }],
        orientation: "landscape",
        filename: `categorias_productos_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado correctamente")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al generar PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  const maxVenta = data ? Math.max(...data.categorias.map(c => c.totalVenta), 1) : 1

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/generales">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Categorías de Productos</h1>
            <p className="text-sm text-muted-foreground md:text-base">Ventas y rendimiento por categoría</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!data || loading}>
            <FileDown className="mr-2 h-4 w-4" />CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!data || loading || exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Período</CardTitle>
          <CardDescription>Seleccione el rango de fechas para el análisis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Desde</Label>
              <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
            <div className="flex items-end md:col-span-2">
              <Button className="w-full" onClick={cargarReporte} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
                {loading ? "Cargando..." : "Actualizar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && !data && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando datos...</span>
        </div>
      )}

      {data && (
        <>
          {/* KPIs */}
          <div className={`grid gap-4 ${isAdmin ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${formatCurrency(data.totales.ventas)}</div>
                <p className="text-xs text-muted-foreground mt-1">{data.totales.unidades} unidades vendidas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                <Tag className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totales.categorias}</div>
                <p className="text-xs text-muted-foreground mt-1">Con ventas en el período</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos</CardTitle>
                <Package className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.categorias.reduce((s, c) => s + c.productosDistintos, 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Productos distintos vendidos</p>
              </CardContent>
            </Card>
            {isAdmin && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilidad Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">${formatCurrency(data.totales.utilidad)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Margen {data.totales.margen.toFixed(1)}%</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Gráfico de barras simple */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Participación por Categoría
              </CardTitle>
              <CardDescription>Ventas totales por categoría</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.categorias.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.categoria}</span>
                      <span className="text-muted-foreground">${formatCurrency(c.totalVenta)} ({c.participacion.toFixed(1)}%)</span>
                    </div>
                    <div className="h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-end pr-2 text-[10px] text-white font-medium transition-all duration-500"
                        style={{ width: `${getBarWidth(c.totalVenta, maxVenta)}%` }}
                      >
                        {c.unidades} uds
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabla detallada */}
          <Card>
            <CardHeader>
              <CardTitle>Desglose por Categoría</CardTitle>
              <CardDescription>{data.categorias.length} categorías con ventas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-center">Productos</TableHead>
                      <TableHead className="text-center">Unidades</TableHead>
                      <TableHead className="text-right">Venta Total</TableHead>
                      {isAdmin && (
                        <>
                          <TableHead className="text-right">Costo</TableHead>
                          <TableHead className="text-right">Utilidad</TableHead>
                          <TableHead className="text-center">Margen</TableHead>
                        </>
                      )}
                      <TableHead className="text-center">Part.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.categorias.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 9 : 6} className="text-center text-muted-foreground">
                          No hay datos para el período seleccionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {data.categorias.map((c, i) => (
                          <TableRow key={i} className={i % 2 === 0 ? "bg-muted/50" : ""}>
                            <TableCell className="font-medium">{i + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{c.categoria}</Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{c.productosDistintos}</TableCell>
                            <TableCell className="text-center">{c.unidades}</TableCell>
                            <TableCell className="text-right font-semibold">${formatCurrency(c.totalVenta)}</TableCell>
                            {isAdmin && (
                              <>
                                <TableCell className="text-right text-muted-foreground">${formatCurrency(c.totalCosto)}</TableCell>
                                <TableCell className="text-right text-green-600 font-semibold">${formatCurrency(c.utilidad)}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={c.margen >= 40 ? "default" : c.margen >= 20 ? "secondary" : "destructive"}>
                                    {c.margen.toFixed(1)}%
                                  </Badge>
                                </TableCell>
                              </>
                            )}
                            <TableCell className="text-center">{c.participacion.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                        {/* Totals */}
                        <TableRow className="border-t-2 font-bold">
                          <TableCell colSpan={2}>TOTAL</TableCell>
                          <TableCell className="text-center">{data.categorias.reduce((s, c) => s + c.productosDistintos, 0)}</TableCell>
                          <TableCell className="text-center">{data.totales.unidades}</TableCell>
                          <TableCell className="text-right">${formatCurrency(data.totales.ventas)}</TableCell>
                          {isAdmin && (
                            <>
                              <TableCell className="text-right">${formatCurrency(data.totales.costo)}</TableCell>
                              <TableCell className="text-right text-green-600">${formatCurrency(data.totales.utilidad)}</TableCell>
                              <TableCell className="text-center">
                                <Badge>{data.totales.margen.toFixed(1)}%</Badge>
                              </TableCell>
                            </>
                          )}
                          <TableCell className="text-center">100%</TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No data */}
      {!data && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin datos</h3>
            <p className="text-muted-foreground text-center">No se encontraron ventas para el período seleccionado</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
