"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Download, FileDown, Users, Star, DollarSign, UserPlus } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { captureMultipleCharts } from "@/lib/chart-capture"
import { toast } from "sonner"
import Link from "next/link"
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

interface ClienteRanking {
  id: number; nombre: string; tipoCliente: string
  totalCompras: number; montoTotal: number; ticketPromedio: number
  identificacion?: string; telefono?: string
  primeraCompra?: string; ultimaCompra?: string
}

interface ReporteData {
  periodo: string
  resumen: {
    clientesActivos: number; totalClientes: number
    totalTransacciones: number; totalVentas: number; ticketPromedioGeneral: number
  }
  topFrecuentes: ClienteRanking[]
  topTicket: ClienteRanking[]
  topGasto: ClienteRanking[]
  porTipo: { tipo: string; clientes: number; transacciones: number; monto: number }[]
  distribucion: { tipo: string; transacciones: number; monto: number }[]
  clientesNuevos: { mes: string; nuevos: number }[]
}

export function AnalisisClientesContent() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const chartDistribucionRef = useRef<HTMLDivElement>(null)
  const chartTipoRef = useRef<HTMLDivElement>(null)
  const chartNuevosRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hoy = new Date()
    const hace90 = new Date(hoy); hace90.setDate(hoy.getDate() - 90)
    setFechaInicio(hace90.toISOString().split("T")[0])
    setFechaFin(hoy.toISOString().split("T")[0])
  }, [])

  const fetchData = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/estadisticas/clientes?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }, [fechaInicio, fechaFin])

  useEffect(() => {
    if (fechaInicio && fechaFin) fetchData()
  }, [fechaInicio, fechaFin, fetchData])

  const tipoBadge = (tipo: string) => {
    const c: Record<string, string> = { publico: "bg-gray-100 text-gray-800", mayorista: "bg-blue-100 text-blue-800", especial: "bg-purple-100 text-purple-800" }
    return <Badge className={c[tipo] || c.publico}>{tipo}</Badge>
  }

  const exportarCSV = () => {
    if (!data?.topFrecuentes.length) { toast.error("No hay datos"); return }
    const rows = [
      ["Nombre", "Tipo", "Compras", "Monto Total", "Ticket Promedio"],
      ...data.topFrecuentes.map(c => [c.nombre, c.tipoCliente, c.totalCompras, c.montoTotal.toFixed(2), c.ticketPromedio.toFixed(2)])
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `analisis_clientes_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      const chartImages = await captureMultipleCharts([
        { title: "Con cliente vs Consumidor Final", ref: chartDistribucionRef },
        { title: "Ventas por Tipo de Cliente", ref: chartTipoRef },
        { title: "Clientes Nuevos por Mes", ref: chartNuevosRef },
      ])

      generateReportPDF({
        title: "Análisis de Clientes",
        subtitle: "Comportamiento y segmentación",
        dateRange: `Del ${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Clientes Activos", value: String(data.resumen.clientesActivos), detail: `de ${data.resumen.totalClientes} registrados` },
          { label: "Ventas Totales", value: formatCurrency(data.resumen.totalVentas) },
          { label: "Ticket Promedio", value: formatCurrency(data.resumen.ticketPromedioGeneral) },
        ],
        chartImages,
        tables: [
          { title: "Clientes Más Frecuentes", headers: ["Cliente", "Tipo", "Compras", "Monto", "Ticket Prom."], rows: data.topFrecuentes.slice(0, 10).map(c => [c.nombre, c.tipoCliente, String(c.totalCompras), formatCurrency(c.montoTotal), formatCurrency(c.ticketPromedio)]), columnStyles: { 2: { halign: "center" as const }, 3: { halign: "right" as const }, 4: { halign: "right" as const } } },
          { title: "Mayor Gasto Total", headers: ["Cliente", "Tipo", "Compras", "Monto"], rows: data.topGasto.slice(0, 10).map(c => [c.nombre, c.tipoCliente, String(c.totalCompras), formatCurrency(c.montoTotal)]), columnStyles: { 2: { halign: "center" as const }, 3: { halign: "right" as const } } },
        ],
        filename: `analisis_clientes_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado")
    } catch { toast.error("Error al generar PDF") }
    finally { setExportingPdf(false) }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/estadisticas"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Análisis de Clientes</h1>
            <p className="text-sm text-muted-foreground">Comportamiento, segmentación y rankings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!data || loading}><FileDown className="mr-2 h-4 w-4" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!data || loading || exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Fecha Inicio</Label><Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></div>
            <div className="space-y-2"><Label>Fecha Fin</Label><Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></div>
            <div className="flex items-end"><Button onClick={fetchData} disabled={loading} className="w-full">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Consultar</Button></div>
          </div>
        </CardContent>
      </Card>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}

      {data && !loading && (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Clientes Activos</CardTitle><Users className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-blue-600">{data.resumen.clientesActivos}</div><p className="text-xs text-muted-foreground mt-1">de {data.resumen.totalClientes} registrados</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Transacciones</CardTitle><Star className="h-4 w-4 text-amber-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-amber-600">{data.resumen.totalTransacciones}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ventas Totales</CardTitle><DollarSign className="h-4 w-4 text-green-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(data.resumen.totalVentas)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle><DollarSign className="h-4 w-4 text-purple-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-purple-600">{formatCurrency(data.resumen.ticketPromedioGeneral)}</div></CardContent>
            </Card>
          </div>

          {/* Gráficos: Distribución + Tipo + Nuevos */}
          <div className="grid gap-4 md:grid-cols-3">
            {data.distribucion.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Con cliente vs Consumidor Final</CardTitle></CardHeader>
                <CardContent>
                  <div ref={chartDistribucionRef} className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.distribucion} dataKey="monto" nameKey="tipo" cx="50%" cy="50%" outerRadius={80} label={({ tipo, percent }) => `${tipo} ${(percent * 100).toFixed(0)}%`}>
                          {data.distribucion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            {data.porTipo.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Ventas por Tipo de Cliente</CardTitle></CardHeader>
                <CardContent>
                  <div ref={chartTipoRef} className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.porTipo}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="monto" name="Monto" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            {data.clientesNuevos.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Clientes Nuevos por Mes</CardTitle></CardHeader>
                <CardContent>
                  <div ref={chartNuevosRef} className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.clientesNuevos}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="nuevos" name="Nuevos" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabs con rankings */}
          <Tabs defaultValue="frecuentes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="frecuentes">Más Frecuentes</TabsTrigger>
              <TabsTrigger value="gasto">Mayor Gasto</TabsTrigger>
              <TabsTrigger value="ticket">Mayor Ticket</TabsTrigger>
            </TabsList>

            <TabsContent value="frecuentes">
              <Card>
                <CardHeader><CardTitle>Clientes Más Frecuentes</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Cliente</TableHead><TableHead>Tipo</TableHead><TableHead className="text-center">Compras</TableHead><TableHead className="text-right">Monto Total</TableHead><TableHead className="text-right">Ticket Prom.</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {data.topFrecuentes.map((c, i) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="font-medium">{c.nombre}</TableCell>
                            <TableCell>{tipoBadge(c.tipoCliente)}</TableCell>
                            <TableCell className="text-center font-bold">{c.totalCompras}</TableCell>
                            <TableCell className="text-right">{formatCurrency(c.montoTotal)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(c.ticketPromedio)}</TableCell>
                          </TableRow>
                        ))}
                        {data.topFrecuentes.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay datos</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gasto">
              <Card>
                <CardHeader><CardTitle>Clientes con Mayor Gasto Total</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Cliente</TableHead><TableHead>Tipo</TableHead><TableHead className="text-center">Compras</TableHead><TableHead className="text-right">Monto Total</TableHead><TableHead className="text-right">Ticket Prom.</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {data.topGasto.map((c, i) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="font-medium">{c.nombre}</TableCell>
                            <TableCell>{tipoBadge(c.tipoCliente)}</TableCell>
                            <TableCell className="text-center">{c.totalCompras}</TableCell>
                            <TableCell className="text-right font-bold text-green-600">{formatCurrency(c.montoTotal)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(c.ticketPromedio)}</TableCell>
                          </TableRow>
                        ))}
                        {data.topGasto.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay datos</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ticket">
              <Card>
                <CardHeader><CardTitle>Clientes con Mayor Ticket Promedio</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Cliente</TableHead><TableHead>Tipo</TableHead><TableHead className="text-center">Compras</TableHead><TableHead className="text-right">Monto Total</TableHead><TableHead className="text-right">Ticket Prom.</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {data.topTicket.map((c, i) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="font-medium">{c.nombre}</TableCell>
                            <TableCell>{tipoBadge(c.tipoCliente)}</TableCell>
                            <TableCell className="text-center">{c.totalCompras}</TableCell>
                            <TableCell className="text-right">{formatCurrency(c.montoTotal)}</TableCell>
                            <TableCell className="text-right font-bold text-purple-600">{formatCurrency(c.ticketPromedio)}</TableCell>
                          </TableRow>
                        ))}
                        {data.topTicket.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay datos</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><Users className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Selecciona fechas para analizar el comportamiento de clientes</p></CardContent></Card>
      )}
    </div>
  )
}
