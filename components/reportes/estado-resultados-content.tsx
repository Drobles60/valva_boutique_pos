"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ArrowLeft, Download, FileDown, DollarSign, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface ReporteData {
  periodo: string
  ingresos: {
    ventasTotales: number
    ventasContado: number
    ventasCredito: number
    abonosCredito: number
    total: number
  }
  egresos: {
    costoVentas: number
    gastos: number
    total: number
  }
  utilidadBruta: number
  utilidadNeta: number
  margenBruto: number
  margenNeto: number
}

export function EstadoResultadosContent() {
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  const cargarReporte = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/financieros/estado-resultados?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
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
    if (!data) { toast.error("No hay datos"); return }
    const lines = [
      `Estado de Resultados - ${data.periodo}`,
      "",
      "INGRESOS",
      `Ventas Totales,${data.ingresos.ventasTotales.toFixed(2)}`,
      `Ventas Contado,${data.ingresos.ventasContado.toFixed(2)}`,
      `Ventas Crédito,${data.ingresos.ventasCredito.toFixed(2)}`,
      `Abonos Recibidos,${data.ingresos.abonosCredito.toFixed(2)}`,
      `Total Ingresos,${data.ingresos.total.toFixed(2)}`,
      "",
      "EGRESOS",
      `Costo de Ventas,${data.egresos.costoVentas.toFixed(2)}`,
      `Gastos Operativos,${data.egresos.gastos.toFixed(2)}`,
      `Total Egresos,${data.egresos.total.toFixed(2)}`,
      "",
      "RESULTADOS",
      `Utilidad Bruta,${data.utilidadBruta.toFixed(2)}`,
      `Utilidad Neta,${data.utilidadNeta.toFixed(2)}`,
      `Margen Bruto,${data.margenBruto.toFixed(1)}%`,
      `Margen Neto,${data.margenNeto.toFixed(1)}%`,
    ]
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `estado_resultados_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Estado de Resultados",
        subtitle: "Reporte financiero de ingresos, egresos y utilidades",
        dateRange: data.periodo,
        kpis: [
          { label: "Total Ingresos", value: `$${formatCurrency(data.ingresos.total)}`, detail: `Ventas + Abonos` },
          { label: "Total Egresos", value: `$${formatCurrency(data.egresos.total)}`, detail: `Costos + Gastos` },
          { label: "Utilidad Neta", value: `$${formatCurrency(data.utilidadNeta)}`, detail: `Margen ${data.margenNeto.toFixed(1)}%` },
        ],
        tables: [
          {
            title: "Ingresos",
            headers: ["Concepto", "Monto"],
            rows: [
              ["Ventas Totales", `$${formatCurrency(data.ingresos.ventasTotales)}`],
              ["Ventas Contado", `$${formatCurrency(data.ingresos.ventasContado)}`],
              ["Ventas Crédito", `$${formatCurrency(data.ingresos.ventasCredito)}`],
              ["Abonos Recibidos", `$${formatCurrency(data.ingresos.abonosCredito)}`],
              ["TOTAL INGRESOS", `$${formatCurrency(data.ingresos.total)}`],
            ],
          },
          {
            title: "Egresos",
            headers: ["Concepto", "Monto"],
            rows: [
              ["Costo de Ventas", `$${formatCurrency(data.egresos.costoVentas)}`],
              ["Gastos Operativos", `$${formatCurrency(data.egresos.gastos)}`],
              ["TOTAL EGRESOS", `$${formatCurrency(data.egresos.total)}`],
            ],
          },
          {
            title: "Resultados",
            headers: ["Indicador", "Valor"],
            rows: [
              ["Utilidad Bruta", `$${formatCurrency(data.utilidadBruta)}`],
              ["Utilidad Neta", `$${formatCurrency(data.utilidadNeta)}`],
              ["Margen Bruto", `${data.margenBruto.toFixed(1)}%`],
              ["Margen Neto", `${data.margenNeto.toFixed(1)}%`],
            ],
          },
        ],
        filename: `estado_resultados_${fechaInicio}_${fechaFin}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Estado de Resultados</h1>
            <p className="text-sm text-muted-foreground md:text-base">Ingresos, egresos y utilidades del período</p>
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
                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${formatCurrency(data.ingresos.total)}</div>
                <p className="text-xs text-muted-foreground">Ventas + Abonos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${formatCurrency(data.egresos.total)}</div>
                <p className="text-xs text-muted-foreground">Costos + Gastos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.utilidadNeta >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${formatCurrency(data.utilidadNeta)}
                </div>
                <p className="text-xs text-muted-foreground">Margen {data.margenNeto.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margen Bruto</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{data.margenBruto.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Utilidad ${formatCurrency(data.utilidadBruta)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Ingresos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">📈 Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Ventas Totales</TableCell>
                    <TableCell className="text-right">${formatCurrency(data.ingresos.ventasTotales)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">↳ Ventas de Contado</TableCell>
                    <TableCell className="text-right text-muted-foreground">${formatCurrency(data.ingresos.ventasContado)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">↳ Ventas a Crédito</TableCell>
                    <TableCell className="text-right text-muted-foreground">${formatCurrency(data.ingresos.ventasCredito)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Abonos Recibidos (Créditos)</TableCell>
                    <TableCell className="text-right">${formatCurrency(data.ingresos.abonosCredito)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold border-t-2">
                    <TableCell>TOTAL INGRESOS (Contado + Abonos)</TableCell>
                    <TableCell className="text-right text-green-600">${formatCurrency(data.ingresos.total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Tabla de Egresos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">📉 Egresos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Costo de Ventas (Mercancía)</TableCell>
                    <TableCell className="text-right">${formatCurrency(data.egresos.costoVentas)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Gastos Operativos</TableCell>
                    <TableCell className="text-right">${formatCurrency(data.egresos.gastos)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold border-t-2">
                    <TableCell>TOTAL EGRESOS</TableCell>
                    <TableCell className="text-right text-red-600">${formatCurrency(data.egresos.total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicador</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Utilidad Bruta (Ingresos - Costo Ventas)</TableCell>
                    <TableCell className={`text-right font-bold ${data.utilidadBruta >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${formatCurrency(data.utilidadBruta)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Utilidad Neta (Ingresos - Egresos)</TableCell>
                    <TableCell className={`text-right font-bold ${data.utilidadNeta >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${formatCurrency(data.utilidadNeta)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Margen Bruto</TableCell>
                    <TableCell className="text-right font-bold">{data.margenBruto.toFixed(1)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Margen Neto</TableCell>
                    <TableCell className="text-right font-bold">{data.margenNeto.toFixed(1)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Seleccione un período y genere el reporte</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
