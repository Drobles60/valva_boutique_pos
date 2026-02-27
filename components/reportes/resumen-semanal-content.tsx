"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Minus, Calendar } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface ResumenSemana {
  ventas: number
  transacciones: number
  ticketPromedio: number
  descuentos: number
}

interface VentaDia {
  dia: string
  fecha: string
  ventas: number
  transacciones: number
}

interface TopProducto {
  nombre: string
  unidades: number
  totalVenta: number
}

interface MetodoPago {
  metodo: string
  cantidad: number
  total: number
}

interface TipoVenta {
  tipo: string
  cantidad: number
  total: number
}

interface ReporteData {
  resumen: {
    semanaActual: ResumenSemana
    semanaAnterior: ResumenSemana
    cambios: { ventas: number; transacciones: number; ticketPromedio: number }
  }
  ventasPorDia: VentaDia[]
  topProductos: TopProducto[]
  metodosPago: MetodoPago[]
  tiposVenta: TipoVenta[]
}

export function ResumenSemanalContent() {
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    cargarReporte()
  }, [])

  const cargarReporte = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/reportes/periodo/semanal")
      const json = await response.json()
      if (!response.ok || !json.success) {
        toast.error(json.error || "Error al cargar el resumen")
        return
      }
      setData(json)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const CambioIndicator = ({ valor }: { valor: number }) => {
    if (valor === 0) return <span className="text-muted-foreground flex items-center gap-1 text-xs"><Minus className="h-3 w-3" /> Sin cambio</span>
    const positivo = valor > 0
    return (
      <span className={`flex items-center gap-1 text-xs font-medium ${positivo ? "text-green-600" : "text-red-600"}`}>
        {positivo ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {positivo ? "+" : ""}{valor.toFixed(1)}%
      </span>
    )
  }

  const metodoLabel = (m: string) => {
    const labels: Record<string, string> = { efectivo: "Efectivo", transferencia: "Transferencia", mixto: "Mixto" }
    return labels[m] || m
  }

  const tipoLabel = (t: string) => {
    const labels: Record<string, string> = { contado: "Contado", credito: "Crédito" }
    return labels[t] || t
  }

  const exportarCSV = () => {
    if (!data) { toast.error("No hay datos"); return }
    const lines: string[] = []
    lines.push("RESUMEN SEMANAL")
    lines.push("")
    lines.push("Indicador,Semana Actual,Semana Anterior,Cambio %")
    lines.push(`Ventas,$${data.resumen.semanaActual.ventas.toFixed(2)},$${data.resumen.semanaAnterior.ventas.toFixed(2)},${data.resumen.cambios.ventas.toFixed(1)}%`)
    lines.push(`Transacciones,${data.resumen.semanaActual.transacciones},${data.resumen.semanaAnterior.transacciones},${data.resumen.cambios.transacciones.toFixed(1)}%`)
    lines.push(`Ticket Promedio,$${data.resumen.semanaActual.ticketPromedio.toFixed(2)},$${data.resumen.semanaAnterior.ticketPromedio.toFixed(2)},${data.resumen.cambios.ticketPromedio.toFixed(1)}%`)
    lines.push("")
    lines.push("VENTAS POR DÍA")
    lines.push("Día,Fecha,Ventas,Transacciones")
    data.ventasPorDia.forEach(d => lines.push(`${d.dia},${d.fecha},$${d.ventas.toFixed(2)},${d.transacciones}`))
    lines.push("")
    lines.push("TOP PRODUCTOS")
    lines.push("#,Producto,Unidades,Total Venta")
    data.topProductos.forEach((p, i) => lines.push(`${i + 1},${p.nombre},${p.unidades},$${p.totalVenta.toFixed(2)}`))

    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `resumen_semanal_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      const r = data.resumen
      generateReportPDF({
        title: "Resumen Semanal",
        subtitle: "Comparativo semanal de ventas",
        dateRange: `Semana del ${data.ventasPorDia.length > 0 ? data.ventasPorDia[0].fecha : "N/A"}`,
        kpis: [
          { label: "Ventas Semana", value: `$${formatCurrency(r.semanaActual.ventas)}`, detail: `${r.cambios.ventas >= 0 ? "+" : ""}${r.cambios.ventas.toFixed(1)}% vs anterior` },
          { label: "Transacciones", value: String(r.semanaActual.transacciones), detail: `${r.cambios.transacciones >= 0 ? "+" : ""}${r.cambios.transacciones.toFixed(1)}% vs anterior` },
          { label: "Ticket Promedio", value: `$${formatCurrency(r.semanaActual.ticketPromedio)}`, detail: `${r.cambios.ticketPromedio >= 0 ? "+" : ""}${r.cambios.ticketPromedio.toFixed(1)}% vs anterior` },
          { label: "Descuentos", value: `$${formatCurrency(r.semanaActual.descuentos)}`, detail: "Semana actual" },
        ],
        tables: [
          {
            title: "Ventas por Día",
            headers: ["Día", "Fecha", "Ventas", "Transacciones"],
            rows: data.ventasPorDia.map(d => [d.dia, d.fecha, `$${formatCurrency(d.ventas)}`, String(d.transacciones)]),
            columnStyles: { 2: { halign: "right" as const }, 3: { halign: "center" as const } },
          },
          {
            title: "Top 10 Productos de la Semana",
            headers: ["#", "Producto", "Unidades", "Total Venta"],
            rows: data.topProductos.map((p, i) => [String(i + 1), p.nombre, String(p.unidades), `$${formatCurrency(p.totalVenta)}`]),
            columnStyles: { 0: { halign: "center" as const }, 2: { halign: "center" as const }, 3: { halign: "right" as const } },
          },
        ],
        orientation: "portrait",
        filename: `resumen_semanal_${new Date().toISOString().split("T")[0]}.pdf`,
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
          <Link href="/reportes/generales">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Resumen Semanal</h1>
            <p className="text-sm text-muted-foreground md:text-base">Comparativo de ventas semana actual vs anterior</p>
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando resumen...</span>
        </div>
      )}

      {data && (
        <>
          {/* KPIs comparativos */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${formatCurrency(data.resumen.semanaActual.ventas)}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Anterior: ${formatCurrency(data.resumen.semanaAnterior.ventas)}</span>
                  <CambioIndicator valor={data.resumen.cambios.ventas} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.resumen.semanaActual.transacciones}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Anterior: {data.resumen.semanaAnterior.transacciones}</span>
                  <CambioIndicator valor={data.resumen.cambios.transacciones} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${formatCurrency(data.resumen.semanaActual.ticketPromedio)}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Anterior: ${formatCurrency(data.resumen.semanaAnterior.ticketPromedio)}</span>
                  <CambioIndicator valor={data.resumen.cambios.ticketPromedio} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Descuentos</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">${formatCurrency(data.resumen.semanaActual.descuentos)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Anterior: ${formatCurrency(data.resumen.semanaAnterior.descuentos)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ventas por día */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ventas por Día
              </CardTitle>
              <CardDescription>Desglose diario de la semana actual</CardDescription>
            </CardHeader>
            <CardContent>
              {data.ventasPorDia.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay ventas esta semana</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Día</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Ventas</TableHead>
                        <TableHead className="text-center">Transacciones</TableHead>
                        <TableHead className="text-right">Ticket Prom.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.ventasPorDia.map((d, i) => (
                        <TableRow key={i} className={i % 2 === 0 ? "bg-muted/50" : ""}>
                          <TableCell className="font-medium">{d.dia}</TableCell>
                          <TableCell className="text-muted-foreground">{d.fecha}</TableCell>
                          <TableCell className="text-right font-semibold">${formatCurrency(d.ventas)}</TableCell>
                          <TableCell className="text-center">{d.transacciones}</TableCell>
                          <TableCell className="text-right">${formatCurrency(d.transacciones > 0 ? d.ventas / d.transacciones : 0)}</TableCell>
                        </TableRow>
                      ))}
                      {/* Total row */}
                      <TableRow className="border-t-2 font-bold">
                        <TableCell colSpan={2}>TOTAL SEMANA</TableCell>
                        <TableCell className="text-right">${formatCurrency(data.resumen.semanaActual.ventas)}</TableCell>
                        <TableCell className="text-center">{data.resumen.semanaActual.transacciones}</TableCell>
                        <TableCell className="text-right">${formatCurrency(data.resumen.semanaActual.ticketPromedio)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Top productos */}
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Productos</CardTitle>
                <CardDescription>Más vendidos esta semana</CardDescription>
              </CardHeader>
              <CardContent>
                {data.topProductos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Sin datos</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Uds</TableHead>
                        <TableHead className="text-right">Venta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topProductos.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{i + 1}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{p.nombre}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{p.unidades}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">${formatCurrency(p.totalVenta)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Métodos de pago y Tipos de venta */}
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pago</CardTitle>
                  <CardDescription>Distribución de la semana</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.metodosPago.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Sin datos</p>
                  ) : (
                    <div className="space-y-3">
                      {data.metodosPago.map((m, i) => {
                        const pct = data.resumen.semanaActual.ventas > 0
                          ? (m.total / data.resumen.semanaActual.ventas) * 100 : 0
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{metodoLabel(m.metodo)}</Badge>
                              <span className="text-xs text-muted-foreground">{m.cantidad} ventas</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold">${formatCurrency(m.total)}</span>
                              <span className="text-xs text-muted-foreground ml-2">({pct.toFixed(1)}%)</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Venta</CardTitle>
                  <CardDescription>Contado vs Crédito</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.tiposVenta.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Sin datos</p>
                  ) : (
                    <div className="space-y-3">
                      {data.tiposVenta.map((t, i) => {
                        const pct = data.resumen.semanaActual.ventas > 0
                          ? (t.total / data.resumen.semanaActual.ventas) * 100 : 0
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={t.tipo === "credito" ? "destructive" : "default"}>{tipoLabel(t.tipo)}</Badge>
                              <span className="text-xs text-muted-foreground">{t.cantidad} ventas</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold">${formatCurrency(t.total)}</span>
                              <span className="text-xs text-muted-foreground ml-2">({pct.toFixed(1)}%)</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* No data */}
      {!data && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin datos de la semana</h3>
            <p className="text-muted-foreground text-center">No se encontraron ventas para el período actual</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
