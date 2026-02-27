"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, Receipt, TrendingDown, Calendar, Tag } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface GastoCategoria {
  categoria: string
  monto: number
  porcentaje: number
  cantidad: number
}

interface GastoDia {
  fecha: string
  monto: number
  cantidad: number
}

interface GastoDetalle {
  id: number
  fecha: string
  categoria: string
  descripcion: string
  monto: number
  usuario: string
}

interface ReporteData {
  totalGastos: number
  gastosPorCategoria: GastoCategoria[]
  gastosPorDia: GastoDia[]
  detalleGastos: GastoDetalle[]
}

export function GastosReporteContent() {
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  const cargarReporte = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/financieros/gastos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
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

  const formatFecha = (f: string) => {
    try { return new Date(f).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) }
    catch { return f }
  }

  const exportarCSV = () => {
    if (!data || !data.detalleGastos.length) { toast.error("No hay datos"); return }
    const headers = ["#", "Fecha", "Categoría", "Descripción", "Monto", "Usuario"]
    const rows = data.detalleGastos.map((g, i) => [
      i + 1, formatFecha(g.fecha), g.categoria, `"${g.descripcion}"`, g.monto.toFixed(2), g.usuario,
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `gastos_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!data || !data.detalleGastos.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      const tables = []
      if (data.gastosPorCategoria.length > 0) {
        tables.push({
          title: "Gastos por Categoría",
          headers: ["Categoría", "Cantidad", "Monto", "% del Total"],
          rows: data.gastosPorCategoria.map(g => [
            g.categoria, String(g.cantidad), `$${formatCurrency(g.monto)}`, `${g.porcentaje.toFixed(1)}%`,
          ]),
        })
      }
      tables.push({
        title: "Detalle de Gastos",
        headers: ["#", "Fecha", "Categoría", "Descripción", "Monto", "Usuario"],
        rows: data.detalleGastos.map((g, i) => [
          String(i + 1), formatFecha(g.fecha), g.categoria, g.descripcion,
          `$${formatCurrency(g.monto)}`, g.usuario,
        ]),
      })

      generateReportPDF({
        title: "Reporte de Gastos",
        subtitle: "Análisis detallado de gastos operativos",
        dateRange: `${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Total Gastos", value: `$${formatCurrency(data.totalGastos)}`, detail: `${data.detalleGastos.length} registros` },
          { label: "Categorías", value: String(data.gastosPorCategoria.length), detail: "Tipos de gasto" },
          { label: "Promedio/Día", value: `$${formatCurrency(data.gastosPorDia.length > 0 ? data.totalGastos / data.gastosPorDia.length : 0)}`, detail: `${data.gastosPorDia.length} días con gastos` },
        ],
        tables,
        orientation: "landscape",
        filename: `gastos_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado correctamente")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al generar PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  const maxCategoria = data ? Math.max(...data.gastosPorCategoria.map(g => g.monto), 1) : 1

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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Reporte de Gastos</h1>
            <p className="text-sm text-muted-foreground md:text-base">Análisis detallado de gastos operativos</p>
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
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${formatCurrency(data.totalGastos)}</div>
                <p className="text-xs text-muted-foreground">{data.detalleGastos.length} registros</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                <Tag className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.gastosPorCategoria.length}</div>
                <p className="text-xs text-muted-foreground">Tipos de gasto</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ${formatCurrency(data.gastosPorDia.length > 0 ? data.totalGastos / data.gastosPorDia.length : 0)}
                </div>
                <p className="text-xs text-muted-foreground">{data.gastosPorDia.length} días con gastos</p>
              </CardContent>
            </Card>
          </div>

          {/* Gastos por Categoría */}
          {data.gastosPorCategoria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.gastosPorCategoria.map((g) => (
                    <div key={g.categoria} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{g.categoria}</span>
                          <Badge variant="secondary">{g.cantidad}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{g.porcentaje.toFixed(1)}%</span>
                          <span className="font-bold">${formatCurrency(g.monto)}</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-red-500 transition-all"
                          style={{ width: `${Math.max(5, (g.monto / maxCategoria) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gastos por Día */}
          {data.gastosPorDia.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Día</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.gastosPorDia.map((g) => (
                      <TableRow key={String(g.fecha)}>
                        <TableCell>{formatFecha(String(g.fecha))}</TableCell>
                        <TableCell className="text-center">{g.cantidad}</TableCell>
                        <TableCell className="text-right font-medium">${formatCurrency(g.monto)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Detalle de Gastos */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Gastos</CardTitle>
              <CardDescription>{data.detalleGastos.length} registros</CardDescription>
            </CardHeader>
            <CardContent>
              {data.detalleGastos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay gastos en este período</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Usuario</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.detalleGastos.map((g, i) => (
                        <TableRow key={g.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="whitespace-nowrap">{formatFecha(g.fecha)}</TableCell>
                          <TableCell><Badge variant="outline">{g.categoria}</Badge></TableCell>
                          <TableCell>{g.descripcion}</TableCell>
                          <TableCell className="text-right font-medium text-red-600">${formatCurrency(g.monto)}</TableCell>
                          <TableCell>{g.usuario}</TableCell>
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
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Seleccione un período y genere el reporte</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
