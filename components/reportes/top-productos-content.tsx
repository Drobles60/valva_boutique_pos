"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, ArrowLeft, Download, FileDown } from "lucide-react"
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
  cantidad: number
  ventas: number
  costo: number
  utilidad: number
  margen: number
}

interface ReporteData {
  topProductos: Producto[]
  topRentables: Producto[]
}

export function TopProductosContent({ vistaInicial = "vendidos" }: { vistaInicial?: "vendidos" | "rentables" }) {
  const { data: session } = useSession()
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [vista, setVista] = useState<"vendidos" | "rentables">(vistaInicial)
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
      const res = await fetch(`/api/reportes/ventas/general?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
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

  const lista = vista === "vendidos" ? (data?.topProductos ?? []) : (data?.topRentables ?? [])

  const exportarCSV = () => {
    if (!lista.length) { toast.error("No hay datos para exportar"); return }
    const headers = canViewCosts
      ? ["#", "Producto", "SKU", "Cantidad", "Ventas", "Costo", "Utilidad", "Margen"]
      : ["#", "Producto", "SKU", "Cantidad", "Ventas"]
    const rows = lista.map((p, i) => {
      const base = [i + 1, p.nombre, p.sku, p.cantidad, p.ventas.toFixed(2)]
      return canViewCosts ? [...base, p.costo.toFixed(2), p.utilidad.toFixed(2), p.margen.toFixed(1) + "%"] : base
    })
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `top_productos_${vista}_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("Exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!lista.length) { toast.error("No hay datos para exportar"); return }
    setExportingPdf(true)
    try {
      const formatFecha = (f: string) => {
        const [a, m, d] = f.split("-").map(Number)
        return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
      }
      const esVendidos = vista === "vendidos"
      const headers = canViewCosts
        ? ["#", "Producto", "SKU", "Cantidad", "Ventas", "Costo", "Utilidad", "Margen"]
        : ["#", "Producto", "SKU", "Cantidad", "Ventas"]
      const rows = lista.map((p, i) => {
        const base = [String(i + 1), p.nombre, p.sku, String(p.cantidad), `$${formatCurrency(p.ventas)}`]
        return canViewCosts
          ? [...base, `$${formatCurrency(p.costo)}`, `$${formatCurrency(p.utilidad)}`, `${p.margen.toFixed(1)}%`]
          : base
      })
      const colStyles: Record<number, { halign: "right" | "center" }> = { 0: { halign: "center" }, 3: { halign: "center" }, 4: { halign: "right" } }
      if (canViewCosts) {
        colStyles[5] = { halign: "right" }
        colStyles[6] = { halign: "right" }
        colStyles[7] = { halign: "center" }
      }

      // KPIs: Calculate totals from the list
      const totalCantidad = lista.reduce((s, p) => s + p.cantidad, 0)
      const totalVentas = lista.reduce((s, p) => s + p.ventas, 0)
      const kpis = [
        { label: "Productos", value: String(lista.length), detail: `Top ${lista.length} del período` },
        { label: "Unidades Vendidas", value: String(totalCantidad), detail: "Total del ranking" },
        { label: "Total Ventas", value: `$${formatCurrency(totalVentas)}`, detail: "Suma del ranking" },
      ]
      if (canViewCosts) {
        const totalUtilidad = lista.reduce((s, p) => s + p.utilidad, 0)
        kpis.push({ label: "Utilidad Total", value: `$${formatCurrency(totalUtilidad)}`, detail: "Del ranking" })
      }

      generateReportPDF({
        title: esVendidos ? "Productos Más Vendidos" : "Productos Más Rentables",
        subtitle: esVendidos ? "Ranking por unidades vendidas" : "Ranking por utilidad bruta generada",
        dateRange: `${formatFecha(fechaInicio)} — ${formatFecha(fechaFin)}`,
        kpis,
        tables: [{
          title: esVendidos ? "Top Productos por Unidades" : "Top Productos por Rentabilidad",
          headers,
          rows,
          columnStyles: colStyles as any,
        }],
        filename: `top_productos_${vista}_${fechaInicio}_${fechaFin}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
            <p className="text-sm text-muted-foreground">Ranking de productos por ventas y rentabilidad</p>
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={fetchData} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                {loading ? "Cargando..." : "Aplicar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de vista */}
      <div className="flex gap-2">
        <Button
          variant={vista === "vendidos" ? "default" : "outline"}
          size="sm"
          onClick={() => setVista("vendidos")}
        >
          Más Vendidos
        </Button>
        {canViewCosts && (
          <Button
            variant={vista === "rentables" ? "default" : "outline"}
            size="sm"
            onClick={() => setVista("rentables")}
          >
            Más Rentables
          </Button>
        )}
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>{vista === "vendidos" ? "Top 10 Productos Más Vendidos" : "Top 10 Productos Más Rentables"}</CardTitle>
          <CardDescription>
            {vista === "vendidos"
              ? "Ordenados por cantidad de unidades vendidas"
              : "Ordenados por utilidad bruta generada"}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {lista.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-12">No hay datos en este período</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
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
                {lista.map((item, index) => (
                  <TableRow key={item.producto_id}>
                    <TableCell>
                      <Badge
                        className={index === 0 ? "bg-yellow-400 text-yellow-900" : index === 1 ? "bg-gray-300 text-gray-800" : index === 2 ? "bg-amber-600 text-white" : ""}
                        variant={index >= 3 ? "secondary" : "default"}
                      >
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{item.cantidad}</TableCell>
                    <TableCell className="text-right font-semibold">${formatCurrency(item.ventas)}</TableCell>
                    {canViewCosts && (
                      <>
                        <TableCell className="text-right text-muted-foreground">${formatCurrency(item.costo)}</TableCell>
                        <TableCell className="text-right font-semibold text-[#D4AF37]">${formatCurrency(item.utilidad)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={item.margen >= 40 ? "text-green-700 border-green-300" : item.margen >= 20 ? "text-yellow-700 border-yellow-300" : "text-red-700 border-red-300"}>
                            {item.margen.toFixed(1)}%
                          </Badge>
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
    </div>
  )
}
