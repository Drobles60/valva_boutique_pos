"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Star, ArrowLeft, Download, FileDown, Users, ShoppingCart, TrendingUp } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { generateReportPDF } from "@/lib/pdf-export"
import Link from "next/link"

interface Cliente {
  cliente_id: number
  nombre: string
  identificacion: string
  tipo_cliente: string
  telefono: string
  email: string
  saldo_pendiente: number
  total_compras: number
  total_gastado: number
  ticket_promedio: number
  ultima_compra: string | null
  primera_compra: string | null
  dias_con_compras: number
  compras_credito: number
  compras_contado: number
  participacion: number
}

interface ReporteData {
  clientes: Cliente[]
  totalClientes: number
  totalVentas: number
  totalTransacciones: number
  ticketPromedio: number
  clientesActivos: number
}

export function ClientesFrecuentesContent() {
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
      const res = await fetch(`/api/reportes/clientes/general?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
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

  const clientes = data?.clientes ?? []
  const maxGasto = Math.max(...clientes.map(c => c.total_gastado), 1)

  const formatFecha = (f: string) => {
    const [a, m, d] = f.split("-").map(Number)
    return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
  }

  const formatFechaCorta = (f: string | null) => {
    if (!f) return "—"
    const [a, m, d] = f.split("-").map(Number)
    return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
  }

  const tipoColor = (t: string) => {
    switch (t) {
      case "mayorista": return "text-blue-700 border-blue-300 bg-blue-50"
      case "especial": return "text-purple-700 border-purple-300 bg-purple-50"
      default: return "text-gray-700 border-gray-300"
    }
  }

  const exportarCSV = () => {
    if (!clientes.length) { toast.error("No hay datos para exportar"); return }
    const headers = ["#", "Cliente", "Tipo", "Compras", "Total Gastado", "Ticket Promedio", "Contado", "Crédito", "Saldo Pend.", "Última Compra", "Participación"]
    const rows = clientes.map((c, i) => [
      i + 1,
      c.nombre,
      c.tipo_cliente,
      c.total_compras,
      c.total_gastado.toFixed(2),
      c.ticket_promedio.toFixed(2),
      c.compras_contado.toFixed(2),
      c.compras_credito.toFixed(2),
      c.saldo_pendiente.toFixed(2),
      c.ultima_compra || "—",
      c.participacion + "%",
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `clientes_frecuentes_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!clientes.length) { toast.error("No hay datos para exportar"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Clientes Frecuentes",
        subtitle: "Ranking por volumen de compras en el período",
        dateRange: `${formatFecha(fechaInicio)} — ${formatFecha(fechaFin)}`,
        kpis: [
          { label: "Clientes Activos", value: String(data?.clientesActivos ?? 0), detail: "Con compras en período" },
          { label: "Total Ventas", value: `$${formatCurrency(data?.totalVentas ?? 0)}`, detail: `${data?.totalTransacciones ?? 0} transacciones` },
          { label: "Ticket Promedio", value: `$${formatCurrency(data?.ticketPromedio ?? 0)}`, detail: "Por transacción" },
        ],
        tables: [{
          title: "Ranking de Clientes",
          headers: ["#", "Cliente", "Tipo", "Compras", "Total", "Ticket Prom.", "Contado", "Crédito", "Part."],
          rows: clientes.map((c, i) => [
            String(i + 1),
            c.nombre,
            c.tipo_cliente,
            String(c.total_compras),
            `$${formatCurrency(c.total_gastado)}`,
            `$${formatCurrency(c.ticket_promedio)}`,
            `$${formatCurrency(c.compras_contado)}`,
            `$${formatCurrency(c.compras_credito)}`,
            `${c.participacion}%`,
          ]),
          columnStyles: {
            0: { halign: "center" as const },
            3: { halign: "center" as const },
            4: { halign: "right" as const },
            5: { halign: "right" as const },
            6: { halign: "right" as const },
            7: { halign: "right" as const },
            8: { halign: "center" as const },
          },
        }],
        orientation: "landscape",
        filename: `clientes_frecuentes_${fechaInicio}_${fechaFin}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight">Clientes Frecuentes</h1>
            <p className="text-sm text-muted-foreground">Ranking de clientes por volumen de compras y visitas</p>
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
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Star className="mr-2 h-4 w-4" />}
                {loading ? "Cargando..." : "Aplicar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.clientesActivos ?? 0}</div>
            <p className="text-xs text-muted-foreground">Con compras en el período</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(data?.totalVentas ?? 0)}</div>
            <p className="text-xs text-muted-foreground">{data?.totalTransacciones ?? 0} transacciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(data?.ticketPromedio ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Por transacción</p>
          </CardContent>
        </Card>
      </div>

      {/* Barras de participación */}
      {clientes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Clientes por Gasto</CardTitle>
            <CardDescription>Participación en ventas totales del período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientes.slice(0, 10).map((c, index) => {
                const pct = (c.total_gastado / maxGasto) * 100
                return (
                  <div key={c.cliente_id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={index === 0 ? "bg-yellow-400 text-yellow-900" : index === 1 ? "bg-gray-300 text-gray-800" : index === 2 ? "bg-amber-600 text-white" : ""}
                          variant={index >= 3 ? "secondary" : "default"}
                        >
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{c.nombre}</span>
                        <Badge variant="outline" className={`text-xs ${tipoColor(c.tipo_cliente)}`}>
                          {c.tipo_cliente}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs">{c.total_compras} compras</span>
                        <span className="font-bold text-primary">${formatCurrency(c.total_gastado)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
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
          <CardTitle>Detalle de Clientes ({clientes.length})</CardTitle>
          <CardDescription>Ordenados por monto total gastado en el período</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {clientes.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-12">No hay clientes con compras en este período</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Tipo</TableHead>
                  <TableHead className="text-center">Compras</TableHead>
                  <TableHead className="text-right">Total Gastado</TableHead>
                  <TableHead className="text-right">Ticket Prom.</TableHead>
                  <TableHead className="text-right">Contado</TableHead>
                  <TableHead className="text-right">Crédito</TableHead>
                  <TableHead className="text-right">Saldo Pend.</TableHead>
                  <TableHead className="text-center">Últ. Compra</TableHead>
                  <TableHead className="text-center">Part.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((c, index) => (
                  <TableRow key={c.cliente_id}>
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
                        <p className="font-medium">{c.nombre}</p>
                        {c.identificacion && <p className="text-xs text-muted-foreground">{c.identificacion}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-xs ${tipoColor(c.tipo_cliente)}`}>
                        {c.tipo_cliente}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">{c.total_compras}</TableCell>
                    <TableCell className="text-right font-semibold">${formatCurrency(c.total_gastado)}</TableCell>
                    <TableCell className="text-right">${formatCurrency(c.ticket_promedio)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">${formatCurrency(c.compras_contado)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">${formatCurrency(c.compras_credito)}</TableCell>
                    <TableCell className="text-right">
                      {c.saldo_pendiente > 0 ? (
                        <span className="text-red-600 font-medium">${formatCurrency(c.saldo_pendiente)}</span>
                      ) : (
                        <span className="text-muted-foreground">$0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {formatFechaCorta(c.ultima_compra)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={c.participacion >= 20 ? "text-green-700 border-green-300" : c.participacion >= 10 ? "text-yellow-700 border-yellow-300" : ""}>
                        {c.participacion}%
                      </Badge>
                    </TableCell>
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
