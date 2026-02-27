"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ArrowLeft, Download, FileDown, DollarSign, TrendingUp, BarChart3, Package } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface ProductoGanancia {
  producto_id: number
  nombre: string
  sku: string
  categoria: string
  cantidad: number
  ventas: number
  costo: number
  utilidad: number
  margen: number
}

interface ReporteData {
  totalVentas: number
  totalCostos: number
  utilidadBruta: number
  gastos: number
  utilidadNeta: number
  margenBruto: number
  margenNeto: number
  productos: ProductoGanancia[]
}

export function GananciasContent() {
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  const cargarReporte = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/financieros/ganancias?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      const json = await res.json()
      if (!res.ok || !json.success) {
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
    const hoy = new Date()
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    setFechaInicio(primerDia.toISOString().split("T")[0])
    setFechaFin(hoy.toISOString().split("T")[0])
  }, [])

  useEffect(() => {
    if (fechaInicio && fechaFin) cargarReporte()
  }, [fechaInicio, fechaFin, cargarReporte])

  const exportarCSV = () => {
    if (!data || !data.productos.length) { toast.error("No hay datos"); return }
    const headers = ["#", "SKU", "Producto", "Categoría", "Cantidad", "Ventas", "Costo", "Utilidad", "Margen %"]
    const rows = data.productos.map((p, i) => [
      i + 1, p.sku, p.nombre, p.categoria, p.cantidad, p.ventas.toFixed(2),
      p.costo.toFixed(2), p.utilidad.toFixed(2), p.margen.toFixed(1),
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `ganancias_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!data || !data.productos.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Reporte de Ganancias",
        subtitle: "Rentabilidad por producto",
        dateRange: `${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Total Ventas", value: `$${formatCurrency(data.totalVentas)}`, detail: `${data.productos.length} productos` },
          { label: "Utilidad Bruta", value: `$${formatCurrency(data.utilidadBruta)}`, detail: `Margen ${data.margenBruto.toFixed(1)}%` },
          { label: "Utilidad Neta", value: `$${formatCurrency(data.utilidadNeta)}`, detail: `Margen ${data.margenNeto.toFixed(1)}%` },
        ],
        tables: [{
          title: "Ganancias por Producto",
          headers: ["#", "SKU", "Producto", "Cat.", "Cant.", "Ventas", "Costo", "Utilidad", "Margen"],
          rows: data.productos.map((p, i) => [
            String(i + 1), p.sku || "-", p.nombre, p.categoria, String(p.cantidad),
            `$${formatCurrency(p.ventas)}`, `$${formatCurrency(p.costo)}`,
            `$${formatCurrency(p.utilidad)}`, `${p.margen.toFixed(1)}%`,
          ]),
        }],
        orientation: "landscape",
        filename: `ganancias_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado correctamente")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al generar PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/contables">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Reporte de Ganancias</h1>
            <p className="text-sm text-muted-foreground md:text-base">Rentabilidad por producto vendido</p>
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
          <CardDescription>Seleccione el rango de fechas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Desde</Label>
              <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={cargarReporte} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Generar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {data && !loading && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${formatCurrency(data.totalVentas)}</div>
                <p className="text-xs text-muted-foreground">{data.productos.length} productos vendidos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">${formatCurrency(data.totalCostos)}</div>
                <p className="text-xs text-muted-foreground">+ Gastos: ${formatCurrency(data.gastos)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilidad Bruta</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.utilidadBruta >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${formatCurrency(data.utilidadBruta)}
                </div>
                <p className="text-xs text-muted-foreground">Margen {data.margenBruto.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.utilidadNeta >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${formatCurrency(data.utilidadNeta)}
                </div>
                <p className="text-xs text-muted-foreground">Margen {data.margenNeto.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Ganancias por Producto</CardTitle>
              <CardDescription>{data.productos.length} productos con ventas en el período</CardDescription>
            </CardHeader>
            <CardContent>
              {data.productos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay productos vendidos en este período</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-center">Cant.</TableHead>
                        <TableHead className="text-right">Ventas</TableHead>
                        <TableHead className="text-right">Costo</TableHead>
                        <TableHead className="text-right">Utilidad</TableHead>
                        <TableHead className="text-right">Margen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.productos.map((p, i) => (
                        <TableRow key={p.producto_id}>
                          <TableCell className="text-center">{i + 1}</TableCell>
                          <TableCell className="font-mono text-xs">{p.sku || "-"}</TableCell>
                          <TableCell className="font-medium">{p.nombre}</TableCell>
                          <TableCell>{p.categoria}</TableCell>
                          <TableCell className="text-center">{p.cantidad}</TableCell>
                          <TableCell className="text-right">${formatCurrency(p.ventas)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">${formatCurrency(p.costo)}</TableCell>
                          <TableCell className={`text-right font-medium ${p.utilidad >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ${formatCurrency(p.utilidad)}
                          </TableCell>
                          <TableCell className={`text-right ${p.margen >= 30 ? "text-green-600" : p.margen >= 15 ? "text-yellow-600" : "text-red-600"}`}>
                            {p.margen.toFixed(1)}%
                          </TableCell>
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

      {!data && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Seleccione un período y genere el reporte</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
