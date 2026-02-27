"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, ArrowLeft, Download, DollarSign, Banknote, ArrowLeftRight, FileText, ShoppingCart, FileDown } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { generateReportPDF } from "@/lib/pdf-export"
import Link from "next/link"

interface FormaPago {
  formaPago: string
  monto: number
  transacciones: number
  porcentaje: number
}

interface ReporteData {
  totalVentas: number
  totalTransacciones: number
  ventasContado: number
  ventasCredito: number
  ventasPorFormaPago: FormaPago[]
}

const ICONOS_FORMA: Record<string, any> = {
  efectivo: Banknote,
  transferencia: ArrowLeftRight,
  mixto: CreditCard,
  tarjeta: CreditCard,
}

const COLORES_FORMA: Record<string, { text: string; bg: string; bar: string }> = {
  efectivo: { text: "text-green-700", bg: "bg-green-50", bar: "bg-green-500" },
  transferencia: { text: "text-blue-700", bg: "bg-blue-50", bar: "bg-blue-500" },
  mixto: { text: "text-purple-700", bg: "bg-purple-50", bar: "bg-purple-500" },
  tarjeta: { text: "text-orange-700", bg: "bg-orange-50", bar: "bg-orange-500" },
}

function getNombreFormaPago(fp: string): string {
  const nombres: Record<string, string> = {
    efectivo: "Efectivo",
    transferencia: "Transferencia bancaria",
    mixto: "Pago mixto",
    tarjeta: "Tarjeta",
    credito: "Crédito",
  }
  return nombres[fp] || fp.charAt(0).toUpperCase() + fp.slice(1)
}

export function FormasPagoContent() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

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

  const formasPago = data?.ventasPorFormaPago ?? []
  const totalVentas = data?.totalVentas ?? 0
  const totalTransacciones = data?.totalTransacciones ?? 0
  const ventasContado = data?.ventasContado ?? 0
  const ventasCredito = data?.ventasCredito ?? 0

  const exportarCSV = () => {
    if (!formasPago.length) { toast.error("No hay datos para exportar"); return }
    const rows = [
      ["Forma de Pago", "Monto", "Transacciones", "Porcentaje"],
      ...formasPago.map(fp => [
        getNombreFormaPago(fp.formaPago),
        fp.monto.toFixed(2),
        fp.transacciones,
        fp.porcentaje.toFixed(1) + "%"
      ])
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `formas_pago_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("Exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!formasPago.length) { toast.error("No hay datos para exportar"); return }
    setExportingPdf(true)
    try {
      const formatFecha = (f: string) => {
        const [a, m, d] = f.split("-").map(Number)
        return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
      }
      generateReportPDF({
        title: "Formas de Pago",
        subtitle: "Distribución de ventas por método de pago",
        dateRange: `${formatFecha(fechaInicio)} — ${formatFecha(fechaFin)}`,
        kpis: [
          { label: "Total Ventas", value: `$${formatCurrency(totalVentas)}`, detail: `${totalTransacciones} transacciones` },
          { label: "Ventas Contado", value: `$${formatCurrency(ventasContado)}`, detail: `${totalVentas > 0 ? ((ventasContado / totalVentas) * 100).toFixed(1) : 0}% del total` },
          { label: "Ventas Crédito", value: `$${formatCurrency(ventasCredito)}`, detail: `${totalVentas > 0 ? ((ventasCredito / totalVentas) * 100).toFixed(1) : 0}% del total` },
          { label: "Métodos", value: String(formasPago.length), detail: "Formas de pago utilizadas" },
        ],
        tables: [{
          title: "Detalle por Forma de Pago",
          headers: ["Forma de Pago", "Monto", "Transacciones", "Ticket Promedio", "Participación"],
          rows: [
            ...formasPago.map(fp => [
              getNombreFormaPago(fp.formaPago),
              `$${formatCurrency(fp.monto)}`,
              String(fp.transacciones),
              `$${formatCurrency(fp.transacciones > 0 ? fp.monto / fp.transacciones : 0)}`,
              `${fp.porcentaje.toFixed(1)}%`,
            ]),
            [
              "TOTAL",
              `$${formatCurrency(totalVentas)}`,
              String(totalTransacciones),
              `$${formatCurrency(totalTransacciones > 0 ? totalVentas / totalTransacciones : 0)}`,
              "100.0%",
            ],
          ],
          columnStyles: { 1: { halign: "right" }, 2: { halign: "center" }, 3: { halign: "right" }, 4: { halign: "right" } },
        }],
        filename: `formas_pago_${fechaInicio}_${fechaFin}.pdf`,
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
              <Link href="/reportes/contables" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Reportes Contables
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Formas de Pago</h1>
            <p className="text-sm text-muted-foreground">Distribución de ventas por método de pago</p>
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
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                {loading ? "Cargando..." : "Aplicar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(totalVentas)}</div>
            <p className="text-xs text-muted-foreground">{totalTransacciones} transacciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${formatCurrency(ventasContado)}</div>
            <p className="text-xs text-muted-foreground">
              {totalVentas > 0 ? ((ventasContado / totalVentas) * 100).toFixed(1) : "0.0"}% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Crédito</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${formatCurrency(ventasCredito)}</div>
            <p className="text-xs text-muted-foreground">
              {totalVentas > 0 ? ((ventasCredito / totalVentas) * 100).toFixed(1) : "0.0"}% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Métodos Usados</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formasPago.length}</div>
            <p className="text-xs text-muted-foreground">diferentes en el período</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica visual de barras horizontales */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Método</CardTitle>
          <CardDescription>Proporción de cada forma de pago sobre el total</CardDescription>
        </CardHeader>
        <CardContent>
          {formasPago.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay datos en este período</p>
          ) : (
            <div className="space-y-4">
              {formasPago.map((fp) => {
                const Icon = ICONOS_FORMA[fp.formaPago] || CreditCard
                const colores = COLORES_FORMA[fp.formaPago] || { text: "text-gray-700", bg: "bg-gray-50", bar: "bg-gray-500" }
                const pct = totalVentas > 0 ? (fp.monto / totalVentas) * 100 : 0
                return (
                  <div key={fp.formaPago} className={`rounded-lg border p-4 ${colores.bg}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                          <Icon className={`h-5 w-5 ${colores.text}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${colores.text}`}>{getNombreFormaPago(fp.formaPago)}</p>
                          <p className="text-xs text-muted-foreground">{fp.transacciones} transacciones</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${colores.text}`}>${formatCurrency(fp.monto)}</p>
                        <p className="text-sm font-medium text-muted-foreground">{pct.toFixed(1)}%</p>
                      </div>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colores.bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Barra apilada visual */}
      {formasPago.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Proporción Visual</CardTitle>
            <CardDescription>Participación de cada método sobre el 100%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-10 rounded-lg overflow-hidden flex">
              {formasPago.map((fp) => {
                const colores = COLORES_FORMA[fp.formaPago] || { bar: "bg-gray-500" }
                const pct = totalVentas > 0 ? (fp.monto / totalVentas) * 100 : 0
                return (
                  <div
                    key={fp.formaPago}
                    className={`${colores.bar} flex items-center justify-center text-white text-xs font-bold transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    title={`${getNombreFormaPago(fp.formaPago)}: ${pct.toFixed(1)}%`}
                  >
                    {pct > 8 ? `${pct.toFixed(0)}%` : ""}
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {formasPago.map((fp) => {
                const colores = COLORES_FORMA[fp.formaPago] || { bar: "bg-gray-500", text: "text-gray-700" }
                return (
                  <div key={fp.formaPago} className="flex items-center gap-2 text-sm">
                    <div className={`h-3 w-3 rounded-full ${colores.bar}`} />
                    <span className={colores.text}>{getNombreFormaPago(fp.formaPago)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Método de Pago</CardTitle>
          <CardDescription>Monto y número de transacciones por cada forma de pago</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {formasPago.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay datos en este período</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead className="text-right">Transacciones</TableHead>
                  <TableHead className="text-right">Monto Total</TableHead>
                  <TableHead className="text-right">Ticket Promedio</TableHead>
                  <TableHead className="text-right">Participación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formasPago.map((fp) => {
                  const ticketProm = fp.transacciones > 0 ? fp.monto / fp.transacciones : 0
                  const colores = COLORES_FORMA[fp.formaPago] || { text: "text-gray-700" }
                  return (
                    <TableRow key={fp.formaPago}>
                      <TableCell>
                        <span className={`font-semibold ${colores.text}`}>{getNombreFormaPago(fp.formaPago)}</span>
                      </TableCell>
                      <TableCell className="text-right">{fp.transacciones}</TableCell>
                      <TableCell className="text-right font-semibold">${formatCurrency(fp.monto)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">${formatCurrency(ticketProm)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={`${COLORES_FORMA[fp.formaPago]?.bar || "bg-gray-500"} text-white`}>
                          {fp.porcentaje.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {/* Fila total */}
                <TableRow className="border-t-2 font-bold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right">{totalTransacciones}</TableCell>
                  <TableCell className="text-right">${formatCurrency(totalVentas)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">${formatCurrency(totalTransacciones > 0 ? totalVentas / totalTransacciones : 0)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge>100%</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
