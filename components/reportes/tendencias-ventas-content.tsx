"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ArrowLeft, Download, FileDown, TrendingUp, ShoppingCart, DollarSign, Target } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { captureMultipleCharts } from "@/lib/chart-capture"
import { toast } from "sonner"
import Link from "next/link"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"]

interface TendenciaItem {
  periodo: string
  transacciones: number
  totalVentas: number
  ticketPromedio: number
  totalCosto: number
  utilidad: number
  promedioMovil: number
}

interface ReporteData {
  periodo: string
  agrupacion: string
  resumen: {
    totalVentas: number
    totalTransacciones: number
    ticketPromedio: number
    totalUtilidad: number
    margenPromedio: number
    periodosAnalizados: number
  }
  tendencia: TendenciaItem[]
  topProductos: { nombre: string; sku: string; cantidadVendida: number; montoVentas: number }[]
  ventasPorCategoria: { categoria: string; cantidadVendida: number; montoVentas: number }[]
  ventasPorMetodo: { metodo: string; transacciones: number; monto: number }[]
}

export function TendenciasVentasContent() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [agrupacion, setAgrupacion] = useState("diario")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [tipoGrafico, setTipoGrafico] = useState<"area" | "barras">("area")
  const chartTendenciaRef = useRef<HTMLDivElement>(null)
  const chartCategoriasRef = useRef<HTMLDivElement>(null)
  const chartMetodosRef = useRef<HTMLDivElement>(null)

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
      const res = await fetch(`/api/reportes/estadisticas/tendencias?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&agrupacion=${agrupacion}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }, [fechaInicio, fechaFin, agrupacion])

  useEffect(() => {
    if (fechaInicio && fechaFin) fetchData()
  }, [fechaInicio, fechaFin, agrupacion, fetchData])

  const exportarCSV = () => {
    if (!data?.tendencia.length) { toast.error("No hay datos"); return }
    const rows = [
      ["Período", "Ventas", "Transacciones", "Ticket Promedio", "Costo", "Utilidad", "Promedio Móvil"],
      ...data.tendencia.map(d => [d.periodo, d.totalVentas.toFixed(2), d.transacciones, d.ticketPromedio.toFixed(2), d.totalCosto.toFixed(2), d.utilidad.toFixed(2), d.promedioMovil.toFixed(2)])
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `tendencias_ventas_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      const chartImages = await captureMultipleCharts([
        { title: `Tendencia de Ventas (${agrupacion})`, ref: chartTendenciaRef },
        { title: "Ventas por Categoría", ref: chartCategoriasRef },
        { title: "Distribución por Método de Pago", ref: chartMetodosRef },
      ])

      generateReportPDF({
        title: "Tendencias de Ventas",
        subtitle: `Agrupación: ${agrupacion}`,
        dateRange: `Del ${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Total Ventas", value: formatCurrency(data.resumen.totalVentas) },
          { label: "Transacciones", value: String(data.resumen.totalTransacciones) },
          { label: "Ticket Promedio", value: formatCurrency(data.resumen.ticketPromedio) },
          { label: "Margen", value: `${data.resumen.margenPromedio.toFixed(1)}%` },
        ],
        chartImages,
        tables: [
          {
            title: "Tendencia por Período",
            headers: ["Período", "Ventas", "Transacciones", "Ticket Prom.", "Utilidad"],
            rows: data.tendencia.map(d => [d.periodo, formatCurrency(d.totalVentas), String(d.transacciones), formatCurrency(d.ticketPromedio), formatCurrency(d.utilidad)]),
            columnStyles: { 1: { halign: "right" as const }, 2: { halign: "center" as const }, 3: { halign: "right" as const }, 4: { halign: "right" as const } },
          },
          {
            title: "Top 10 Productos",
            headers: ["Producto", "Cantidad", "Monto"],
            rows: data.topProductos.map(p => [p.nombre, String(p.cantidadVendida), formatCurrency(p.montoVentas)]),
            columnStyles: { 1: { halign: "center" as const }, 2: { halign: "right" as const } },
          },
        ],
        filename: `tendencias_ventas_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado")
    } catch { toast.error("Error al generar PDF") }
    finally { setExportingPdf(false) }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? formatCurrency(p.value) : p.value}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/estadisticas"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Tendencias de Ventas</h1>
            <p className="text-sm text-muted-foreground">Evolución temporal, promedios móviles y distribuciones</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!data || loading}><FileDown className="mr-2 h-4 w-4" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!data || loading || exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2"><Label>Fecha Inicio</Label><Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></div>
            <div className="space-y-2"><Label>Fecha Fin</Label><Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Agrupación</Label>
              <Select value={agrupacion} onValueChange={setAgrupacion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diario</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo Gráfico</Label>
              <Select value={tipoGrafico} onValueChange={(v) => setTipoGrafico(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="barras">Barras</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Ventas</CardTitle><DollarSign className="h-4 w-4 text-green-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(data.resumen.totalVentas)}</div><p className="text-xs text-muted-foreground mt-1">{data.resumen.periodosAnalizados} períodos</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Transacciones</CardTitle><ShoppingCart className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-blue-600">{data.resumen.totalTransacciones}</div><p className="text-xs text-muted-foreground mt-1">En el período</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle><Target className="h-4 w-4 text-purple-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-purple-600">{formatCurrency(data.resumen.ticketPromedio)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Margen Promedio</CardTitle><TrendingUp className="h-4 w-4 text-amber-600" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-amber-600">{data.resumen.margenPromedio.toFixed(1)}%</div><p className="text-xs text-muted-foreground mt-1">Utilidad: {formatCurrency(data.resumen.totalUtilidad)}</p></CardContent>
            </Card>
          </div>

          {/* Gráfico principal de tendencia */}
          {data.tendencia.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Tendencia de Ventas ({agrupacion})</CardTitle></CardHeader>
              <CardContent>
                <div ref={chartTendenciaRef} className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {tipoGrafico === "area" ? (
                      <AreaChart data={data.tendencia}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="totalVentas" name="Ventas" stroke="#3b82f6" fill="#3b82f680" strokeWidth={2} />
                        <Area type="monotone" dataKey="promedioMovil" name="Promedio Móvil" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                        <Area type="monotone" dataKey="utilidad" name="Utilidad" stroke="#10b981" fill="#10b98140" strokeWidth={2} />
                      </AreaChart>
                    ) : (
                      <BarChart data={data.tendencia}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="totalVentas" name="Ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="utilidad" name="Utilidad" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gráficos secundarios: Categorías + Métodos de Pago */}
          <div className="grid gap-4 md:grid-cols-2">
            {data.ventasPorCategoria.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Ventas por Categoría</CardTitle></CardHeader>
                <CardContent>
                  <div ref={chartCategoriasRef} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.ventasPorCategoria} dataKey="montoVentas" nameKey="categoria" cx="50%" cy="50%" outerRadius={100} label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}>
                          {data.ventasPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            {data.ventasPorMetodo.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Distribución por Método de Pago</CardTitle></CardHeader>
                <CardContent>
                  <div ref={chartMetodosRef} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.ventasPorMetodo} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <YAxis dataKey="metodo" type="category" tick={{ fontSize: 12 }} width={100} />
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="monto" name="Monto" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top productos tabla */}
          {data.topProductos.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Top 10 Productos Más Vendidos</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Producto</TableHead><TableHead>SKU</TableHead><TableHead className="text-center">Cantidad</TableHead><TableHead className="text-right">Monto</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.topProductos.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-medium">{p.nombre}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{p.sku || "—"}</TableCell>
                          <TableCell className="text-center">{p.cantidadVendida}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(p.montoVentas)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Selecciona fechas para analizar las tendencias</p></CardContent></Card>
      )}
    </div>
  )
}
