"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, Package, DollarSign, AlertTriangle, TrendingUp, Search } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import Link from "next/link"

interface Producto {
  id: number
  sku: string
  nombre: string
  categoria: string
  stockActual: number
  precioCompra: number
  precioVenta: number
  valorCosto: number
  valorVenta: number
  estado: string
  ultimoMovimiento: string | null
}

interface CategoriaResumen {
  nombre: string
  productos: number
  unidades: number
  valorCosto: number
  valorVenta: number
}

interface ReporteData {
  totalProductos: number
  stockTotal: number
  sinStock: number
  agotados: number
  valorCostoTotal: number
  valorVentaTotal: number
  utilidadPotencial: number
  porCategoria: CategoriaResumen[]
  productos: Producto[]
}

export function EstadoInventarioContent() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [busqueda, setBusqueda] = useState("")

  const canViewCosts = (session?.user as any)?.rol === "administrador"

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/reportes/inventario/estado")
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }

  const productosFiltrados = (data?.productos ?? []).filter(p =>
    !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(busqueda.toLowerCase()))
  )

  const formatFecha = (f: string | null) => {
    if (!f) return "Sin movimiento"
    try { return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) } catch { return f }
  }

  const estadoBadge = (e: string) => {
    const map: Record<string, string> = { activo: "bg-green-100 text-green-800", agotado: "bg-red-100 text-red-800", inactivo: "bg-gray-100 text-gray-800" }
    return <Badge variant="secondary" className={map[e] || ""}>{e}</Badge>
  }

  const exportarCSV = () => {
    if (!productosFiltrados.length) { toast.error("No hay datos"); return }
    const headers = canViewCosts
      ? ["#", "SKU", "Producto", "Categoría", "Stock", "P. Compra", "P. Venta", "Valor Costo", "Valor Venta", "Estado", "Último Mov."]
      : ["#", "SKU", "Producto", "Categoría", "Stock", "P. Venta", "Estado", "Último Mov."]
    const rows = productosFiltrados.map((p, i) =>
      canViewCosts
        ? [i + 1, p.sku || "", p.nombre, p.categoria, p.stockActual, p.precioCompra.toFixed(2), p.precioVenta.toFixed(2), p.valorCosto.toFixed(2), p.valorVenta.toFixed(2), p.estado, formatFecha(p.ultimoMovimiento)]
        : [i + 1, p.sku || "", p.nombre, p.categoria, p.stockActual, p.precioVenta.toFixed(2), p.estado, formatFecha(p.ultimoMovimiento)]
    )
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `estado_inventario_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!productosFiltrados.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      const headers = canViewCosts
        ? ["#", "SKU", "Producto", "Categoría", "Stock", "P.Compra", "P.Venta", "V.Costo", "V.Venta", "Estado"]
        : ["#", "SKU", "Producto", "Categoría", "Stock", "P.Venta", "Estado"]
      const rows = productosFiltrados.map((p, i) =>
        canViewCosts
          ? [String(i + 1), p.sku || "—", p.nombre, p.categoria, String(p.stockActual), `$${formatCurrency(p.precioCompra)}`, `$${formatCurrency(p.precioVenta)}`, `$${formatCurrency(p.valorCosto)}`, `$${formatCurrency(p.valorVenta)}`, p.estado]
          : [String(i + 1), p.sku || "—", p.nombre, p.categoria, String(p.stockActual), `$${formatCurrency(p.precioVenta)}`, p.estado]
      )

      generateReportPDF({
        title: "Estado de Inventario",
        subtitle: `${data?.totalProductos ?? 0} productos registrados`,
        dateRange: `Generado: ${new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`,
        kpis: [
          { label: "Total Productos", value: String(data?.totalProductos ?? 0), detail: `${data?.stockTotal ?? 0} unidades` },
          { label: "Valor Inventario", value: `$${formatCurrency(data?.valorCostoTotal ?? 0)}`, detail: "Al costo" },
          { label: "Valor Venta", value: `$${formatCurrency(data?.valorVentaTotal ?? 0)}`, detail: `Utilidad: $${formatCurrency(data?.utilidadPotencial ?? 0)}` },
          { label: "Sin Stock", value: String(data?.sinStock ?? 0), detail: `${data?.agotados ?? 0} agotados` },
        ],
        tables: [{
          title: "Detalle de Productos",
          headers,
          rows,
          columnStyles: canViewCosts
            ? { 0: { halign: "center" as const }, 4: { halign: "center" as const }, 5: { halign: "right" as const }, 6: { halign: "right" as const }, 7: { halign: "right" as const }, 8: { halign: "right" as const } }
            : { 0: { halign: "center" as const }, 4: { halign: "center" as const }, 5: { halign: "right" as const } },
        }],
        orientation: "landscape",
        filename: `estado_inventario_${new Date().toISOString().split("T")[0]}.pdf`,
      })
      toast.success("PDF exportado correctamente")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar PDF")
    } finally { setExportingPdf(false) }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/contables">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Estado de Inventario</h1>
            <p className="text-sm text-muted-foreground md:text-base">Valorización y estado actual del inventario</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!data || loading}>
            <FileDown className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!data || loading || exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            PDF
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando inventario...</span>
        </div>
      )}

      {data && !loading && (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{data.totalProductos}</div>
                <p className="text-xs text-muted-foreground mt-1">{data.stockTotal} unidades en total</p>
              </CardContent>
            </Card>
            {canViewCosts && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor al Costo</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(data.valorCostoTotal)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Inversión actual</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor de Venta</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(data.valorVentaTotal)}</div>
                {canViewCosts && <p className="text-xs text-muted-foreground mt-1">Utilidad pot.: {formatCurrency(data.utilidadPotencial)}</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{data.sinStock}</div>
                <p className="text-xs text-muted-foreground mt-1">{data.agotados} marcados agotados</p>
              </CardContent>
            </Card>
          </div>

          {/* Resumen por Categoría */}
          {data.porCategoria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-center">Productos</TableHead>
                        <TableHead className="text-center">Unidades</TableHead>
                        {canViewCosts && <TableHead className="text-right">Valor Costo</TableHead>}
                        <TableHead className="text-right">Valor Venta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.porCategoria.map((c, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{c.nombre}</TableCell>
                          <TableCell className="text-center">{c.productos}</TableCell>
                          <TableCell className="text-center">{c.unidades}</TableCell>
                          {canViewCosts && <TableCell className="text-right">{formatCurrency(c.valorCosto)}</TableCell>}
                          <TableCell className="text-right">{formatCurrency(c.valorVenta)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Búsqueda y tabla de productos */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-lg">Detalle de Productos ({productosFiltrados.length})</CardTitle>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por nombre o SKU..." className="pl-9" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No se encontraron productos</div>
              ) : (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-center">Stock</TableHead>
                        {canViewCosts && <TableHead className="text-right">P. Compra</TableHead>}
                        <TableHead className="text-right">P. Venta</TableHead>
                        {canViewCosts && <TableHead className="text-right">Valor Costo</TableHead>}
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead>Último Mov.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productosFiltrados.map((p, i) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-center text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{p.sku || "—"}</TableCell>
                          <TableCell className="font-medium">{p.nombre}</TableCell>
                          <TableCell>{p.categoria}</TableCell>
                          <TableCell className="text-center">
                            <span className={p.stockActual <= 0 ? "text-red-600 font-bold" : p.stockActual <= 3 ? "text-orange-600 font-semibold" : ""}>
                              {p.stockActual}
                            </span>
                          </TableCell>
                          {canViewCosts && <TableCell className="text-right">{formatCurrency(p.precioCompra)}</TableCell>}
                          <TableCell className="text-right">{formatCurrency(p.precioVenta)}</TableCell>
                          {canViewCosts && <TableCell className="text-right">{formatCurrency(p.valorCosto)}</TableCell>}
                          <TableCell className="text-center">{estadoBadge(p.estado)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatFecha(p.ultimoMovimiento)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
