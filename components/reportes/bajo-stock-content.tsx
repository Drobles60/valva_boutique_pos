"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, ArrowLeft, Download, FileDown, AlertTriangle, XCircle, AlertCircle } from "lucide-react"
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
  valor_reposicion: number
  ultima_venta: string | null
  vendidos_total: number
  nivel: string
}

interface ReporteData {
  productos: Producto[]
  totalAlerta: number
  agotados: number
  criticos: number
  bajos: number
  totalActivos: number
  porcentajeAfectado: number
  umbral: number
}

export function BajoStockContent() {
  const { data: session } = useSession()
  const [umbral, setUmbral] = useState(5)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  const canViewCosts = (session?.user as any)?.rol === "administrador"

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/inventario/bajo-stock?umbral=${umbral}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }, [umbral])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const productos = data?.productos ?? []

  const nivelColor = (n: string) => {
    switch (n) {
      case "Agotado": return "text-red-700 border-red-300 bg-red-50"
      case "Crítico": return "text-orange-700 border-orange-300 bg-orange-50"
      case "Bajo": return "text-yellow-700 border-yellow-300 bg-yellow-50"
      default: return ""
    }
  }

  const nivelIcon = (n: string) => {
    switch (n) {
      case "Agotado": return <XCircle className="h-3.5 w-3.5 mr-1" />
      case "Crítico": return <AlertTriangle className="h-3.5 w-3.5 mr-1" />
      case "Bajo": return <AlertCircle className="h-3.5 w-3.5 mr-1" />
      default: return null
    }
  }

  const formatFechaCorta = (f: string | null) => {
    if (!f) return "—"
    const [a, m, d] = f.split("-").map(Number)
    return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
  }

  const exportarCSV = () => {
    if (!productos.length) { toast.error("No hay datos para exportar"); return }
    const headers = canViewCosts
      ? ["#", "Producto", "SKU", "Categoría", "Stock", "Nivel", "Precio Compra", "Precio Venta", "Última Venta", "Vendidos Total"]
      : ["#", "Producto", "SKU", "Categoría", "Stock", "Nivel", "Precio Venta", "Última Venta"]
    const rows = productos.map((p, i) =>
      canViewCosts
        ? [i + 1, p.nombre, p.sku, p.categoria, p.stock_actual, p.nivel, p.precio_compra.toFixed(2), p.precio_venta.toFixed(2), p.ultima_venta || "Sin ventas", p.vendidos_total]
        : [i + 1, p.nombre, p.sku, p.categoria, p.stock_actual, p.nivel, p.precio_venta.toFixed(2), p.ultima_venta || "Sin ventas"]
    )
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `productos_bajo_stock_umbral_${umbral}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!productos.length) { toast.error("No hay datos para exportar"); return }
    setExportingPdf(true)
    try {
      const headers = canViewCosts
        ? ["#", "Producto", "SKU", "Categoría", "Stock", "Nivel", "P. Compra", "P. Venta", "Últ. Venta"]
        : ["#", "Producto", "SKU", "Categoría", "Stock", "Nivel", "P. Venta", "Últ. Venta"]
      const rows = productos.map((p, i) =>
        canViewCosts
          ? [String(i + 1), p.nombre, p.sku, p.categoria, String(p.stock_actual), p.nivel, `$${formatCurrency(p.precio_compra)}`, `$${formatCurrency(p.precio_venta)}`, formatFechaCorta(p.ultima_venta)]
          : [String(i + 1), p.nombre, p.sku, p.categoria, String(p.stock_actual), p.nivel, `$${formatCurrency(p.precio_venta)}`, formatFechaCorta(p.ultima_venta)]
      )

      generateReportPDF({
        title: "Productos Bajo Stock",
        subtitle: `Stock mínimo configurado: ${umbral} unidades`,
        dateRange: `Generado: ${new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`,
        kpis: [
          { label: "Total Alertas", value: String(data?.totalAlerta ?? 0), detail: `${data?.porcentajeAfectado ?? 0}% del inventario` },
          { label: "Agotados", value: String(data?.agotados ?? 0), detail: "Stock = 0" },
          { label: "Críticos", value: String(data?.criticos ?? 0), detail: "Stock ≤ 2" },
          { label: "Bajos", value: String(data?.bajos ?? 0), detail: `Stock ≤ ${umbral}` },
        ],
        tables: [{
          title: `Productos con Stock ≤ ${umbral}`,
          headers,
          rows,
          columnStyles: canViewCosts
            ? { 0: { halign: "center" as const }, 4: { halign: "center" as const }, 6: { halign: "right" as const }, 7: { halign: "right" as const } }
            : { 0: { halign: "center" as const }, 4: { halign: "center" as const }, 6: { halign: "right" as const } },
        }],
        orientation: "landscape",
        filename: `productos_bajo_stock_umbral_${umbral}.pdf`,
      })
      toast.success("PDF exportado correctamente")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar PDF: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setExportingPdf(false)
    }
  }

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
            <h1 className="text-2xl font-bold tracking-tight">Productos Bajo Stock</h1>
            <p className="text-sm text-muted-foreground">Alertas de productos próximos a agotarse</p>
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

      {/* Filtro umbral */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Umbral de Stock Mínimo</Label>
              <Input type="number" min={0} max={100} value={umbral} onChange={e => setUmbral(parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={fetchData} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                {loading ? "Cargando..." : "Buscar"}
              </Button>
            </div>
            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                Mostrando productos con stock ≤ <span className="font-bold">{umbral}</span> unidades
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalAlerta ?? 0}</div>
            <p className="text-xs text-muted-foreground">{data?.porcentajeAfectado ?? 0}% del inventario</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Agotados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data?.agotados ?? 0}</div>
            <p className="text-xs text-muted-foreground">Stock = 0</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data?.criticos ?? 0}</div>
            <p className="text-xs text-muted-foreground">Stock ≤ 2 unidades</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bajos</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data?.bajos ?? 0}</div>
            <p className="text-xs text-muted-foreground">Stock ≤ {umbral}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Productos con Bajo Stock ({productos.length})</CardTitle>
          <CardDescription>Ordenados por stock ascendente — los más urgentes primero</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {productos.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-12">No hay productos bajo el umbral configurado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Nivel</TableHead>
                  {canViewCosts && <TableHead className="text-right">P. Compra</TableHead>}
                  <TableHead className="text-right">P. Venta</TableHead>
                  <TableHead className="text-center">Últ. Venta</TableHead>
                  <TableHead className="text-center">Vendidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((p, index) => (
                  <TableRow key={p.producto_id} className={p.nivel === "Agotado" ? "bg-red-50/50" : ""}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.nombre}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.categoria}</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-bold ${p.stock_actual === 0 ? "text-red-600" : p.stock_actual <= 2 ? "text-orange-600" : "text-yellow-600"}`}>
                        {p.stock_actual}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`${nivelColor(p.nivel)} flex items-center w-fit mx-auto`}>
                        {nivelIcon(p.nivel)}
                        {p.nivel}
                      </Badge>
                    </TableCell>
                    {canViewCosts && <TableCell className="text-right text-muted-foreground">${formatCurrency(p.precio_compra)}</TableCell>}
                    <TableCell className="text-right font-medium">${formatCurrency(p.precio_venta)}</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {formatFechaCorta(p.ultima_venta)}
                    </TableCell>
                    <TableCell className="text-center">{p.vendidos_total}</TableCell>
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
