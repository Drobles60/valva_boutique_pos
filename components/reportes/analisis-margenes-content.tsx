"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, TrendingUp, TrendingDown, BarChart3, DollarSign } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import Link from "next/link"

interface CategoriaMargen {
  categoria: string
  productos: number
  unidades: number
  ingresos: number
  costo: number
  utilidad: number
  margen: number
}

interface ProductoMargen {
  nombre: string
  sku: string
  categoria: string
  unidades: number
  ingresos: number
  costo: number
  utilidad: number
  margen: number
}

interface ReporteData {
  totalIngresos: number
  totalCosto: number
  totalUtilidad: number
  margenPromedio: number
  porCategoria: CategoriaMargen[]
  topProductos: ProductoMargen[]
  peoresProductos: ProductoMargen[]
}

export function AnalisisMargenesContent() {
  const { data: session } = useSession()
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

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
      const res = await fetch(`/api/reportes/financieros/margenes?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }, [fechaInicio, fechaFin])

  useEffect(() => {
    if (fechaInicio && fechaFin) fetchData()
  }, [fechaInicio, fechaFin, fetchData])

  const margenBadge = (m: number) => {
    if (m >= 40) return <Badge className="bg-green-100 text-green-800">{m.toFixed(1)}%</Badge>
    if (m >= 20) return <Badge className="bg-yellow-100 text-yellow-800">{m.toFixed(1)}%</Badge>
    if (m >= 0) return <Badge className="bg-orange-100 text-orange-800">{m.toFixed(1)}%</Badge>
    return <Badge className="bg-red-100 text-red-800">{m.toFixed(1)}%</Badge>
  }

  const exportarCSV = () => {
    if (!data) { toast.error("No hay datos"); return }
    const rows = [
      ["--- MÁRGENES POR CATEGORÍA ---"],
      ["Categoría", "Productos", "Unidades", "Ingresos", "Costo", "Utilidad", "Margen %"],
      ...data.porCategoria.map(c => [c.categoria, c.productos, c.unidades, c.ingresos.toFixed(2), c.costo.toFixed(2), c.utilidad.toFixed(2), c.margen.toFixed(1) + "%"]),
      [""],
      ["--- TOP PRODUCTOS ---"],
      ["Producto", "SKU", "Categoría", "Unidades", "Ingresos", "Costo", "Utilidad", "Margen %"],
      ...data.topProductos.map(p => [p.nombre, p.sku, p.categoria, p.unidades, p.ingresos.toFixed(2), p.costo.toFixed(2), p.utilidad.toFixed(2), p.margen.toFixed(1) + "%"]),
    ]
    const csv = rows.map(r => Array.isArray(r) ? r.join(",") : r).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `margenes_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Análisis de Márgenes",
        subtitle: `Rentabilidad por categoría y producto`,
        dateRange: `Del ${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Ingresos", value: formatCurrency(data.totalIngresos) },
          { label: "Costo", value: formatCurrency(data.totalCosto) },
          { label: "Utilidad", value: formatCurrency(data.totalUtilidad) },
          { label: "Margen Promedio", value: `${data.margenPromedio.toFixed(1)}%` },
        ],
        tables: [{
          title: "Márgenes por Categoría",
          headers: ["Categoría", "Productos", "Ingresos", "Costo", "Utilidad", "Margen"],
          rows: data.porCategoria.map(c => [c.categoria, String(c.productos), formatCurrency(c.ingresos), formatCurrency(c.costo), formatCurrency(c.utilidad), `${c.margen.toFixed(1)}%`]),
          columnStyles: { 1: { halign: "center" as const }, 2: { halign: "right" as const }, 3: { halign: "right" as const }, 4: { halign: "right" as const }, 5: { halign: "center" as const } },
        }, {
          title: "Top 20 Productos por Utilidad",
          headers: ["Producto", "Categoría", "Uds", "Ingresos", "Utilidad", "Margen"],
          rows: data.topProductos.map(p => [p.nombre, p.categoria, String(p.unidades), formatCurrency(p.ingresos), formatCurrency(p.utilidad), `${p.margen.toFixed(1)}%`]),
          columnStyles: { 2: { halign: "center" as const }, 3: { halign: "right" as const }, 4: { halign: "right" as const }, 5: { halign: "center" as const } },
        }],
        orientation: "landscape",
        filename: `margenes_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado")
    } catch { toast.error("Error al generar PDF") }
    finally { setExportingPdf(false) }
  }

  if (!canViewCosts) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center gap-3">
          <Link href="/reportes/contables"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <SidebarToggle />
          <h1 className="text-2xl font-bold">Análisis de Márgenes</h1>
        </div>
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Solo los administradores pueden ver este reporte</p></CardContent></Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/contables"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Análisis de Márgenes</h1>
            <p className="text-sm text-muted-foreground">Rentabilidad por categoría y producto</p>
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

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><span className="ml-2 text-muted-foreground">Analizando márgenes...</span></div>}

      {data && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ingresos</CardTitle><DollarSign className="h-4 w-4 text-green-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(data.totalIngresos)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Costo</CardTitle><TrendingDown className="h-4 w-4 text-red-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(data.totalCosto)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Utilidad Bruta</CardTitle><TrendingUp className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent><div className={`text-2xl font-bold ${data.totalUtilidad >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatCurrency(data.totalUtilidad)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Margen Promedio</CardTitle><BarChart3 className="h-4 w-4 text-purple-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-purple-600">{data.margenPromedio.toFixed(1)}%</div></CardContent>
            </Card>
          </div>

          {/* Márgenes por categoría */}
          <Card>
            <CardHeader><CardTitle>Márgenes por Categoría</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-center">Productos</TableHead>
                      <TableHead className="text-center">Unidades</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                      <TableHead className="text-right">Costo</TableHead>
                      <TableHead className="text-right">Utilidad</TableHead>
                      <TableHead className="text-center">Margen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.porCategoria.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{c.categoria}</TableCell>
                        <TableCell className="text-center">{c.productos}</TableCell>
                        <TableCell className="text-center">{c.unidades}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.ingresos)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.costo)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(c.utilidad)}</TableCell>
                        <TableCell className="text-center">{margenBadge(c.margen)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Top productos */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" /> Top 20 Productos por Utilidad</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-center">Uds</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                      <TableHead className="text-right">Utilidad</TableHead>
                      <TableHead className="text-center">Margen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topProductos.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{p.nombre}</TableCell>
                        <TableCell className="text-muted-foreground">{p.sku || "—"}</TableCell>
                        <TableCell>{p.categoria}</TableCell>
                        <TableCell className="text-center">{p.unidades}</TableCell>
                        <TableCell className="text-right">{formatCurrency(p.ingresos)}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">{formatCurrency(p.utilidad)}</TableCell>
                        <TableCell className="text-center">{margenBadge(p.margen)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Peores márgenes */}
          {data.peoresProductos.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-red-600" /> Productos con Menor Margen</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-center">Uds</TableHead>
                        <TableHead className="text-right">Ingresos</TableHead>
                        <TableHead className="text-right">Utilidad</TableHead>
                        <TableHead className="text-center">Margen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.peoresProductos.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{p.nombre}</TableCell>
                          <TableCell className="text-muted-foreground">{p.sku || "—"}</TableCell>
                          <TableCell>{p.categoria}</TableCell>
                          <TableCell className="text-center">{p.unidades}</TableCell>
                          <TableCell className="text-right">{formatCurrency(p.ingresos)}</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{formatCurrency(p.utilidad)}</TableCell>
                          <TableCell className="text-center">{margenBadge(p.margen)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Selecciona un rango de fechas para analizar los márgenes</p></CardContent></Card>
      )}
    </div>
  )
}
