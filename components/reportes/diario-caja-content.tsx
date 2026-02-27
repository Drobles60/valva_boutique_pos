"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, DollarSign, ShoppingCart, Receipt, CreditCard, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface DetalleVenta {
  numero: string
  total: number
  metodoPago: string
  tipoVenta: string
  cliente: string
  vendedor: string
}

interface DetalleGasto {
  descripcion: string
  categoria: string
  monto: number
}

interface SesionData {
  usuario: string
  apertura: string
  cierre: string | null
  estado: string
  montoBase: number
  efectivoContado: number
}

interface ReporteData {
  fecha: string
  sesion: SesionData | null
  ingresos: {
    ventasEfectivo: number
    ventasTransferencia: number
    ventasMixto: number
    ventasCredito: number
    abonosEfectivo: number
    abonosTransferencia: number
    total: number
  }
  egresos: { gastos: number; detalleGastos: DetalleGasto[] }
  transacciones: number
  efectivoEsperado: number
  efectivoContado: number
  diferencia: number
  detalleVentas: DetalleVenta[]
}

export function DiarioCajaContent() {
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [fecha, setFecha] = useState("")

  const cargarReporte = useCallback(async () => {
    if (!fecha) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/financieros/diario?fecha=${fecha}`)
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
  }, [fecha])

  useEffect(() => {
    setFecha(new Date().toISOString().split("T")[0])
  }, [])

  useEffect(() => {
    if (fecha) cargarReporte()
  }, [fecha, cargarReporte])

  const formatMetodo = (m: string) => {
    const map: Record<string, string> = { efectivo: "Efectivo", transferencia: "Transferencia", mixto: "Mixto" }
    return map[m] || m
  }

  const exportarCSV = () => {
    if (!data) { toast.error("No hay datos"); return }
    const lines = [
      `Diario de Caja - ${fecha}`,
      "",
      "INGRESOS",
      `Ventas Efectivo,${data.ingresos.ventasEfectivo.toFixed(2)}`,
      `Ventas Transferencia,${data.ingresos.ventasTransferencia.toFixed(2)}`,
      `Ventas Mixto,${data.ingresos.ventasMixto.toFixed(2)}`,
      `Ventas Crédito,${data.ingresos.ventasCredito.toFixed(2)}`,
      `Abonos Efectivo,${data.ingresos.abonosEfectivo.toFixed(2)}`,
      `Abonos Transferencia,${data.ingresos.abonosTransferencia.toFixed(2)}`,
      `Total Ingresos,${data.ingresos.total.toFixed(2)}`,
      "",
      "EGRESOS",
      `Gastos,${data.egresos.gastos.toFixed(2)}`,
      "",
      "RESUMEN",
      `Transacciones,${data.transacciones}`,
      `Efectivo Esperado,${data.efectivoEsperado.toFixed(2)}`,
      `Efectivo Contado,${data.efectivoContado.toFixed(2)}`,
      `Diferencia,${data.diferencia.toFixed(2)}`,
    ]
    if (data.detalleVentas.length > 0) {
      lines.push("", "DETALLE VENTAS", "No.Venta,Total,Método,Tipo,Cliente,Vendedor")
      data.detalleVentas.forEach(v => {
        lines.push(`${v.numero},${v.total.toFixed(2)},${v.metodoPago},${v.tipoVenta},${v.cliente},${v.vendedor}`)
      })
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `diario_caja_${fecha}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      const tables = [
        {
          title: "Ingresos del Día",
          headers: ["Concepto", "Monto"],
          rows: [
            ["Ventas Efectivo", `$${formatCurrency(data.ingresos.ventasEfectivo)}`],
            ["Ventas Transferencia", `$${formatCurrency(data.ingresos.ventasTransferencia)}`],
            ["Ventas Mixto", `$${formatCurrency(data.ingresos.ventasMixto)}`],
            ["Ventas Crédito", `$${formatCurrency(data.ingresos.ventasCredito)}`],
            ["Abonos Efectivo", `$${formatCurrency(data.ingresos.abonosEfectivo)}`],
            ["Abonos Transferencia", `$${formatCurrency(data.ingresos.abonosTransferencia)}`],
            ["TOTAL INGRESOS", `$${formatCurrency(data.ingresos.total)}`],
          ],
        },
      ]
      if (data.detalleVentas.length > 0) {
        tables.push({
          title: "Detalle de Ventas",
          headers: ["#Venta", "Total", "Método", "Tipo", "Cliente", "Vendedor"],
          rows: data.detalleVentas.map(v => [
            v.numero, `$${formatCurrency(v.total)}`, formatMetodo(v.metodoPago),
            v.tipoVenta, v.cliente, v.vendedor,
          ]),
        })
      }

      generateReportPDF({
        title: "Diario de Caja",
        subtitle: `Resumen del día ${fecha}`,
        dateRange: fecha,
        kpis: [
          { label: "Total Ingresos", value: `$${formatCurrency(data.ingresos.total)}`, detail: `${data.transacciones} transacciones` },
          { label: "Total Gastos", value: `$${formatCurrency(data.egresos.gastos)}`, detail: `${data.egresos.detalleGastos.length} gastos` },
          { label: "Efectivo Esperado", value: `$${formatCurrency(data.efectivoEsperado)}`, detail: `Diferencia: $${formatCurrency(data.diferencia)}` },
        ],
        tables,
        filename: `diario_caja_${fecha}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Diario de Caja</h1>
            <p className="text-sm text-muted-foreground md:text-base">Resumen operativo del día</p>
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
          <CardTitle>Fecha</CardTitle>
          <CardDescription>Seleccione el día del reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Día</Label>
              <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
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
          {/* Sesión de caja */}
          {data.sesion && (
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-400">📋 Sesión de Caja</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cajero</p>
                    <p className="font-medium">{data.sesion.usuario}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge variant={data.sesion.estado === "abierta" ? "default" : "secondary"}>
                      {data.sesion.estado}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monto Base</p>
                    <p className="font-medium">${formatCurrency(data.sesion.montoBase)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Efectivo Contado</p>
                    <p className="font-medium">${formatCurrency(data.sesion.efectivoContado)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${formatCurrency(data.ingresos.total)}</div>
                <p className="text-xs text-muted-foreground">{data.transacciones} transacciones</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${formatCurrency(data.egresos.gastos)}</div>
                <p className="text-xs text-muted-foreground">{data.egresos.detalleGastos.length} gastos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efectivo Esperado</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">${formatCurrency(data.efectivoEsperado)}</div>
                <p className="text-xs text-muted-foreground">Base + Efectivo - Gastos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Diferencia</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.diferencia >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${formatCurrency(data.diferencia)}
                </div>
                <p className="text-xs text-muted-foreground">Contado vs Esperado</p>
              </CardContent>
            </Card>
          </div>

          {/* Ingresos desglosados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">💰 Desglose de Ingresos</CardTitle>
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
                    <TableCell>Ventas en Efectivo</TableCell>
                    <TableCell className="text-right">${formatCurrency(data.ingresos.ventasEfectivo)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ventas por Transferencia</TableCell>
                    <TableCell className="text-right">${formatCurrency(data.ingresos.ventasTransferencia)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ventas Mixto</TableCell>
                    <TableCell className="text-right">${formatCurrency(data.ingresos.ventasMixto)}</TableCell>
                  </TableRow>
                  <TableRow className="text-muted-foreground">
                    <TableCell className="pl-8">↳ Ventas a Crédito (dentro del total)</TableCell>
                    <TableCell className="text-right">${formatCurrency(data.ingresos.ventasCredito)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Abonos en Efectivo</TableCell>
                    <TableCell className="text-right">${formatCurrency(data.ingresos.abonosEfectivo)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Abonos por Transferencia</TableCell>
                    <TableCell className="text-right">${formatCurrency(data.ingresos.abonosTransferencia)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold border-t-2">
                    <TableCell>TOTAL INGRESOS</TableCell>
                    <TableCell className="text-right text-green-600">${formatCurrency(data.ingresos.total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Egresos */}
          {data.egresos.detalleGastos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">📉 Gastos del Día</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.egresos.detalleGastos.map((g, i) => (
                      <TableRow key={i}>
                        <TableCell>{g.descripcion}</TableCell>
                        <TableCell><Badge variant="outline">{g.categoria}</Badge></TableCell>
                        <TableCell className="text-right text-red-600">${formatCurrency(g.monto)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold border-t-2">
                      <TableCell colSpan={2}>TOTAL GASTOS</TableCell>
                      <TableCell className="text-right text-red-600">${formatCurrency(data.egresos.gastos)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Detalle de Ventas */}
          <Card>
            <CardHeader>
              <CardTitle>🛒 Detalle de Ventas</CardTitle>
              <CardDescription>{data.detalleVentas.length} ventas del día</CardDescription>
            </CardHeader>
            <CardContent>
              {data.detalleVentas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay ventas registradas este día</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#Venta</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Vendedor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.detalleVentas.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono">{v.numero}</TableCell>
                          <TableCell className="text-right font-medium">${formatCurrency(v.total)}</TableCell>
                          <TableCell>
                            <Badge variant={v.metodoPago === "efectivo" ? "default" : "secondary"}>
                              {formatMetodo(v.metodoPago)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={v.tipoVenta === "credito" ? "destructive" : "outline"}>
                              {v.tipoVenta}
                            </Badge>
                          </TableCell>
                          <TableCell>{v.cliente}</TableCell>
                          <TableCell>{v.vendedor}</TableCell>
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
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Seleccione una fecha y genere el reporte</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
