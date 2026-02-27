"use client"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Download, FileDown, TrendingUp, TrendingDown, Minus, ArrowLeftRight } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { captureMultipleCharts } from "@/lib/chart-capture"
import { toast } from "sonner"
import Link from "next/link"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts"

interface PeriodoData {
  rango: string
  transacciones: number
  totalVentas: number
  ticketPromedio: number
  clientesUnicos: number
  descuentosAplicados: number
  totalCosto: number
  utilidad: number
  margen: number
  ventasDiarias: { fecha: string; transacciones: number; total: number }[]
  topCategorias: { categoria: string; monto: number }[]
  porMetodo: { metodo: string; transacciones: number; monto: number }[]
}

interface ReporteData {
  periodo1: PeriodoData
  periodo2: PeriodoData
  variaciones: {
    ventas: number
    transacciones: number
    ticketPromedio: number
    clientes: number
    utilidad: number
    margen: number
  }
}

export function ComparativasContent() {
  const [fi1, setFi1] = useState("")
  const [ff1, setFf1] = useState("")
  const [fi2, setFi2] = useState("")
  const [ff2, setFf2] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const chartMontosRef = useRef<HTMLDivElement>(null)
  const chartRadarRef = useRef<HTMLDivElement>(null)
  const chartCategoriasRef = useRef<HTMLDivElement>(null)

  const setPreset = (tipo: string) => {
    const hoy = new Date()
    if (tipo === "semana") {
      const finP1 = new Date(hoy)
      const iniP1 = new Date(hoy); iniP1.setDate(hoy.getDate() - 6)
      const finP2 = new Date(iniP1); finP2.setDate(iniP1.getDate() - 1)
      const iniP2 = new Date(finP2); iniP2.setDate(finP2.getDate() - 6)
      setFi1(iniP1.toISOString().split("T")[0]); setFf1(finP1.toISOString().split("T")[0])
      setFi2(iniP2.toISOString().split("T")[0]); setFf2(finP2.toISOString().split("T")[0])
    } else if (tipo === "mes") {
      const finP1 = new Date(hoy)
      const iniP1 = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      const finP2 = new Date(iniP1); finP2.setDate(finP2.getDate() - 1)
      const iniP2 = new Date(finP2.getFullYear(), finP2.getMonth(), 1)
      setFi1(iniP1.toISOString().split("T")[0]); setFf1(finP1.toISOString().split("T")[0])
      setFi2(iniP2.toISOString().split("T")[0]); setFf2(finP2.toISOString().split("T")[0])
    }
  }

  const fetchData = useCallback(async () => {
    if (!fi1 || !ff1 || !fi2 || !ff2) { toast.error("Completa ambos períodos"); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/estadisticas/comparativas?fechaInicio1=${fi1}&fechaFin1=${ff1}&fechaInicio2=${fi2}&fechaFin2=${ff2}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }, [fi1, ff1, fi2, ff2])

  const variacionIcon = (v: number) => {
    if (v > 1) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (v < -1) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }
  const variacionColor = (v: number) => v > 1 ? "text-green-600" : v < -1 ? "text-red-600" : "text-gray-500"
  const variacionBg = (v: number) => v > 1 ? "bg-green-50 dark:bg-green-950/20" : v < -1 ? "bg-red-50 dark:bg-red-950/20" : "bg-gray-50 dark:bg-gray-950/20"

  const exportarCSV = () => {
    if (!data) { toast.error("No hay datos"); return }
    const p1 = data.periodo1; const p2 = data.periodo2; const v = data.variaciones
    const rows = [
      ["Métrica", "Período Actual", "Período Anterior", "Variación %"],
      ["Ventas", p1.totalVentas.toFixed(2), p2.totalVentas.toFixed(2), v.ventas.toFixed(1)],
      ["Transacciones", p1.transacciones, p2.transacciones, v.transacciones.toFixed(1)],
      ["Ticket Promedio", p1.ticketPromedio.toFixed(2), p2.ticketPromedio.toFixed(2), v.ticketPromedio.toFixed(1)],
      ["Clientes", p1.clientesUnicos, p2.clientesUnicos, v.clientes.toFixed(1)],
      ["Utilidad", p1.utilidad.toFixed(2), p2.utilidad.toFixed(2), v.utilidad.toFixed(1)],
      ["Margen %", p1.margen.toFixed(1), p2.margen.toFixed(1), v.margen.toFixed(1)],
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `comparativa_${fi1}_vs_${fi2}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      const p1 = data.periodo1; const p2 = data.periodo2; const v = data.variaciones

      const chartImages = await captureMultipleCharts([
        { title: "Comparativa de Montos", ref: chartMontosRef },
        { title: "Perfil Comparativo", ref: chartRadarRef },
        { title: "Ventas por Categoría", ref: chartCategoriasRef },
      ])

      generateReportPDF({
        title: "Comparativa por Período",
        subtitle: `${p1.rango} vs ${p2.rango}`,
        dateRange: `Generado: ${new Date().toLocaleDateString("es-CO")}`,
        kpis: [
          { label: "Var. Ventas", value: `${v.ventas >= 0 ? "+" : ""}${v.ventas.toFixed(1)}%` },
          { label: "Var. Transacciones", value: `${v.transacciones >= 0 ? "+" : ""}${v.transacciones.toFixed(1)}%` },
          { label: "Var. Ticket", value: `${v.ticketPromedio >= 0 ? "+" : ""}${v.ticketPromedio.toFixed(1)}%` },
          { label: "Var. Clientes", value: `${v.clientes >= 0 ? "+" : ""}${v.clientes.toFixed(1)}%` },
        ],
        chartImages,
        tables: [{
          title: "Comparativa Detallada",
          headers: ["Métrica", "Período Actual", "Período Anterior", "Variación"],
          rows: [
            ["Ventas", formatCurrency(p1.totalVentas), formatCurrency(p2.totalVentas), `${v.ventas >= 0 ? "+" : ""}${v.ventas.toFixed(1)}%`],
            ["Transacciones", String(p1.transacciones), String(p2.transacciones), `${v.transacciones >= 0 ? "+" : ""}${v.transacciones.toFixed(1)}%`],
            ["Ticket Promedio", formatCurrency(p1.ticketPromedio), formatCurrency(p2.ticketPromedio), `${v.ticketPromedio >= 0 ? "+" : ""}${v.ticketPromedio.toFixed(1)}%`],
            ["Clientes Únicos", String(p1.clientesUnicos), String(p2.clientesUnicos), `${v.clientes >= 0 ? "+" : ""}${v.clientes.toFixed(1)}%`],
            ["Utilidad", formatCurrency(p1.utilidad), formatCurrency(p2.utilidad), `${v.utilidad >= 0 ? "+" : ""}${v.utilidad.toFixed(1)}%`],
            ["Margen", `${p1.margen.toFixed(1)}%`, `${p2.margen.toFixed(1)}%`, `${v.margen >= 0 ? "+" : ""}${v.margen.toFixed(1)} pts`],
          ],
          columnStyles: { 1: { halign: "right" as const }, 2: { halign: "right" as const }, 3: { halign: "right" as const } },
        }],
        filename: `comparativa_${fi1}_vs_${fi2}.pdf`,
      })
      toast.success("PDF exportado")
    } catch { toast.error("Error al generar PDF") }
    finally { setExportingPdf(false) }
  }

  // Build bar chart data for comparison
  const barData = data ? [
    { metrica: "Ventas", actual: data.periodo1.totalVentas, anterior: data.periodo2.totalVentas },
    { metrica: "Utilidad", actual: data.periodo1.utilidad, anterior: data.periodo2.utilidad },
    { metrica: "Descuentos", actual: data.periodo1.descuentosAplicados, anterior: data.periodo2.descuentosAplicados },
  ] : []

  // Radar data (normalizado)
  const radarData = data ? (() => {
    const p1 = data.periodo1; const p2 = data.periodo2
    const max = (a: number, b: number) => Math.max(a, b) || 1
    return [
      { subject: "Ventas", A: p1.totalVentas / max(p1.totalVentas, p2.totalVentas) * 100, B: p2.totalVentas / max(p1.totalVentas, p2.totalVentas) * 100 },
      { subject: "Transacciones", A: p1.transacciones / max(p1.transacciones, p2.transacciones) * 100, B: p2.transacciones / max(p1.transacciones, p2.transacciones) * 100 },
      { subject: "Ticket", A: p1.ticketPromedio / max(p1.ticketPromedio, p2.ticketPromedio) * 100, B: p2.ticketPromedio / max(p1.ticketPromedio, p2.ticketPromedio) * 100 },
      { subject: "Clientes", A: p1.clientesUnicos / max(p1.clientesUnicos, p2.clientesUnicos) * 100, B: p2.clientesUnicos / max(p1.clientesUnicos, p2.clientesUnicos) * 100 },
      { subject: "Margen", A: p1.margen, B: p2.margen },
    ]
  })() : []

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/estadisticas"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Comparativas por Período</h1>
            <p className="text-sm text-muted-foreground">Compara dos rangos de fechas lado a lado</p>
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
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreset("semana")}>Semana vs anterior</Button>
            <Button variant="outline" size="sm" onClick={() => setPreset("mes")}>Mes vs anterior</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2"><Label className="text-blue-600 font-medium">Período Actual - Inicio</Label><Input type="date" value={fi1} onChange={e => setFi1(e.target.value)} /></div>
            <div className="space-y-2"><Label className="text-blue-600 font-medium">Período Actual - Fin</Label><Input type="date" value={ff1} onChange={e => setFf1(e.target.value)} /></div>
            <div className="space-y-2"><Label className="text-amber-600 font-medium">Período Anterior - Inicio</Label><Input type="date" value={fi2} onChange={e => setFi2(e.target.value)} /></div>
            <div className="space-y-2"><Label className="text-amber-600 font-medium">Período Anterior - Fin</Label><Input type="date" value={ff2} onChange={e => setFf2(e.target.value)} /></div>
            <div className="flex items-end"><Button onClick={fetchData} disabled={loading} className="w-full">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeftRight className="mr-2 h-4 w-4" />} Comparar</Button></div>
          </div>
        </CardContent>
      </Card>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}

      {data && !loading && (
        <>
          {/* Variaciones KPI */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Ventas", val: data.variaciones.ventas, p1: formatCurrency(data.periodo1.totalVentas), p2: formatCurrency(data.periodo2.totalVentas) },
              { label: "Transacciones", val: data.variaciones.transacciones, p1: String(data.periodo1.transacciones), p2: String(data.periodo2.transacciones) },
              { label: "Ticket Prom.", val: data.variaciones.ticketPromedio, p1: formatCurrency(data.periodo1.ticketPromedio), p2: formatCurrency(data.periodo2.ticketPromedio) },
              { label: "Clientes", val: data.variaciones.clientes, p1: String(data.periodo1.clientesUnicos), p2: String(data.periodo2.clientesUnicos) },
              { label: "Utilidad", val: data.variaciones.utilidad, p1: formatCurrency(data.periodo1.utilidad), p2: formatCurrency(data.periodo2.utilidad) },
              { label: "Margen", val: data.variaciones.margen, p1: `${data.periodo1.margen.toFixed(1)}%`, p2: `${data.periodo2.margen.toFixed(1)}%` },
            ].map((item, i) => (
              <Card key={i} className={variacionBg(item.val)}>
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <div className="flex items-center justify-center gap-1">
                    {variacionIcon(item.val)}
                    <span className={`text-lg font-bold ${variacionColor(item.val)}`}>
                      {item.val >= 0 ? "+" : ""}{item.val.toFixed(1)}{item.label === "Margen" ? " pts" : "%"}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-blue-600">{item.p1}</span>
                    <span className="text-amber-600">{item.p2}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráficos */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Comparativa de Montos</CardTitle></CardHeader>
              <CardContent>
                <div ref={chartMontosRef} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metrica" />
                      <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="actual" name="Período Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="anterior" name="Período Anterior" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Perfil Comparativo</CardTitle></CardHeader>
              <CardContent>
                <div ref={chartRadarRef} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="Actual" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Radar name="Anterior" dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla comparativa por categorías */}
          {(data.periodo1.topCategorias.length > 0 || data.periodo2.topCategorias.length > 0) && (
            <Card>
              <CardHeader><CardTitle>Ventas por Categoría - Comparativa</CardTitle></CardHeader>
              <CardContent>
                <div ref={chartCategoriasRef} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(() => {
                      const cats = new Set([...data.periodo1.topCategorias.map(c => c.categoria), ...data.periodo2.topCategorias.map(c => c.categoria)])
                      return Array.from(cats).map(cat => ({
                        categoria: cat,
                        actual: data.periodo1.topCategorias.find(c => c.categoria === cat)?.monto || 0,
                        anterior: data.periodo2.topCategorias.find(c => c.categoria === cat)?.monto || 0,
                      }))
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="anterior" name="Anterior" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><ArrowLeftRight className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Selecciona dos períodos para comparar o usa un preset rápido</p></CardContent></Card>
      )}
    </div>
  )
}
