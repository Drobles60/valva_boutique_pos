"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, ArrowUpCircle, ArrowDownCircle, DollarSign } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface Movimiento {
  fecha: string
  concepto: string
  tipo: "ingreso" | "egreso"
  categoria: string
  monto: number
  saldo: number
  usuario: string
}

interface ReporteData {
  movimientos: Movimiento[]
  totalIngresos: number
  totalEgresos: number
  saldoFinal: number
}

export function FlujoCajaContent() {
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  const cargarReporte = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/financieros/flujo-caja?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
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
    if (!data || !data.movimientos.length) { toast.error("No hay datos"); return }
    const headers = ["Fecha", "Concepto", "Tipo", "Categoría", "Monto", "Saldo", "Usuario"]
    const rows = data.movimientos.map(m => [
      formatFecha(m.fecha), m.concepto, m.tipo === "ingreso" ? "Ingreso" : "Egreso", m.categoria,
      m.monto.toFixed(2), m.saldo.toFixed(2), m.usuario,
    ])
    rows.push(["", "", "", "TOTALES", "", "", ""])
    rows.push(["", "Total Ingresos", "", "", data.totalIngresos.toFixed(2), "", ""])
    rows.push(["", "Total Egresos", "", "", data.totalEgresos.toFixed(2), "", ""])
    rows.push(["", "Saldo Final", "", "", data.saldoFinal.toFixed(2), "", ""])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `flujo_caja_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!data || !data.movimientos.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Flujo de Caja",
        subtitle: "Detalle de movimientos de ingresos y egresos",
        dateRange: `${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Total Ingresos", value: `$${formatCurrency(data.totalIngresos)}`, detail: `${data.movimientos.filter(m => m.tipo === "ingreso").length} movimientos` },
          { label: "Total Egresos", value: `$${formatCurrency(data.totalEgresos)}`, detail: `${data.movimientos.filter(m => m.tipo === "egreso").length} movimientos` },
          { label: "Saldo Final", value: `$${formatCurrency(data.saldoFinal)}`, detail: `${data.movimientos.length} total movimientos` },
        ],
        tables: [{
          title: "Movimientos",
          headers: ["Fecha", "Concepto", "Tipo", "Categoría", "Monto", "Saldo"],
          rows: data.movimientos.map(m => [
            formatFecha(m.fecha), m.concepto, m.tipo === "ingreso" ? "Ingreso" : "Egreso",
            m.categoria, `$${formatCurrency(m.monto)}`, `$${formatCurrency(m.saldo)}`,
          ]),
        }],
        orientation: "landscape",
        filename: `flujo_caja_${fechaInicio}_${fechaFin}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Flujo de Caja</h1>
            <p className="text-sm text-muted-foreground md:text-base">Movimientos de ingresos y egresos</p>
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
                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${formatCurrency(data.totalIngresos)}</div>
                <p className="text-xs text-muted-foreground">{data.movimientos.filter(m => m.tipo === "ingreso").length} movimientos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${formatCurrency(data.totalEgresos)}</div>
                <p className="text-xs text-muted-foreground">{data.movimientos.filter(m => m.tipo === "egreso").length} movimientos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Final</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.saldoFinal >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${formatCurrency(data.saldoFinal)}
                </div>
                <p className="text-xs text-muted-foreground">{data.movimientos.length} movimientos total</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Movimientos */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Movimientos</CardTitle>
              <CardDescription>{data.movimientos.length} registros encontrados</CardDescription>
            </CardHeader>
            <CardContent>
              {data.movimientos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay movimientos en este período</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead>Usuario</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.movimientos.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="whitespace-nowrap">{formatFecha(m.fecha)}</TableCell>
                          <TableCell>{m.concepto}</TableCell>
                          <TableCell>
                            <Badge variant={m.tipo === "ingreso" ? "default" : "destructive"}>
                              {m.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                            </Badge>
                          </TableCell>
                          <TableCell>{m.categoria}</TableCell>
                          <TableCell className={`text-right font-medium ${m.tipo === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                            {m.tipo === "ingreso" ? "+" : "-"}${formatCurrency(m.monto)}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${m.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ${formatCurrency(m.saldo)}
                          </TableCell>
                          <TableCell>{m.usuario}</TableCell>
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
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Seleccione un período y genere el reporte</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
