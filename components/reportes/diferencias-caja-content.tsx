"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Scale } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface DiferenciaItem {
  fecha: string
  sesion_id: number
  usuario: string
  efectivoEsperado: number
  efectivoContado: number
  diferencia: number
  tipo: "faltante" | "sobrante" | "exacto"
  notas: string | null
}

interface ReporteData {
  periodo: string
  diferencias: DiferenciaItem[]
  totalDiferencias: number
  sesionesConDiferencia: number
  sesionesTotales: number
  porcentajeExactitud: number
}

export function DiferenciasCajaContent() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    const hoy = new Date()
    const hace7 = new Date(hoy)
    hace7.setDate(hoy.getDate() - 7)
    setFechaInicio(hace7.toISOString().split("T")[0])
    setFechaFin(hoy.toISOString().split("T")[0])
  }, [])

  const fetchData = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes/administrativos/diferencias?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      const json = await res.json()
      if (!res.ok) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }, [fechaInicio, fechaFin])

  useEffect(() => {
    if (fechaInicio && fechaFin) fetchData()
  }, [fechaInicio, fechaFin, fetchData])

  const formatFecha = (f: string | null) => {
    if (!f) return "—"
    try { return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) } catch { return f }
  }

  const tipoBadge = (tipo: string) => {
    if (tipo === "exacto") return <Badge className="bg-green-100 text-green-800">Cuadrado</Badge>
    if (tipo === "sobrante") return <Badge className="bg-blue-100 text-blue-800">Sobrante</Badge>
    return <Badge className="bg-red-100 text-red-800">Faltante</Badge>
  }

  const exportarCSV = () => {
    if (!data?.diferencias.length) { toast.error("No hay datos"); return }
    const rows = [
      ["Fecha", "Sesión", "Usuario", "Esperado", "Contado", "Diferencia", "Estado", "Notas"],
      ...data.diferencias.map(d => [
        formatFecha(d.fecha), d.sesion_id, d.usuario,
        d.efectivoEsperado.toFixed(2), d.efectivoContado.toFixed(2),
        d.diferencia.toFixed(2), d.tipo, d.notas || ""
      ])
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `diferencias_caja_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado")
  }

  const exportarPDF = async () => {
    if (!data?.diferencias.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Diferencias de Caja",
        subtitle: `Análisis de cuadre y diferencias`,
        dateRange: `Del ${fechaInicio} al ${fechaFin}`,
        kpis: [
          { label: "Sesiones", value: String(data.sesionesTotales), detail: `${data.sesionesConDiferencia} con diferencia` },
          { label: "Exactitud", value: `${data.porcentajeExactitud.toFixed(1)}%` },
          { label: "Total Diferencias", value: formatCurrency(data.totalDiferencias), detail: "Valor absoluto" },
        ],
        tables: [{
          title: "Detalle de Sesiones",
          headers: ["Fecha", "Sesión", "Usuario", "Esperado", "Contado", "Diferencia", "Estado"],
          rows: data.diferencias.map(d => [
            formatFecha(d.fecha), String(d.sesion_id), d.usuario,
            formatCurrency(d.efectivoEsperado), formatCurrency(d.efectivoContado),
            formatCurrency(d.diferencia), d.tipo === "exacto" ? "Cuadrado" : d.tipo === "sobrante" ? "Sobrante" : "Faltante"
          ]),
          columnStyles: { 3: { halign: "right" as const }, 4: { halign: "right" as const }, 5: { halign: "right" as const } },
        }],
        filename: `diferencias_caja_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado")
    } catch { toast.error("Error al generar PDF") }
    finally { setExportingPdf(false) }
  }

  const sobrantes = data?.diferencias.filter(d => d.tipo === "sobrante") || []
  const faltantes = data?.diferencias.filter(d => d.tipo === "faltante") || []
  const totalSobrantes = sobrantes.reduce((s, d) => s + d.diferencia, 0)
  const totalFaltantes = faltantes.reduce((s, d) => s + d.diferencia, 0)

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/contables"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Diferencias de Caja</h1>
            <p className="text-sm text-muted-foreground">Análisis de cuadre y diferencias en sesiones de caja</p>
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

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /><span className="ml-2 text-muted-foreground">Analizando diferencias...</span></div>}

      {data && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Sesiones Analizadas</CardTitle><Scale className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{data.sesionesTotales}</div>
                <p className="text-xs text-muted-foreground mt-1">{data.sesionesConDiferencia} con diferencia</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Exactitud</CardTitle><CheckCircle className="h-4 w-4 text-green-600" /></CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.porcentajeExactitud >= 80 ? "text-green-600" : data.porcentajeExactitud >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                  {data.porcentajeExactitud.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Sesiones sin diferencia</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Sobrantes</CardTitle><TrendingUp className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{sobrantes.length > 0 ? `+${formatCurrency(totalSobrantes)}` : "$0"}</div>
                <p className="text-xs text-muted-foreground mt-1">{sobrantes.length} sesiones</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Faltantes</CardTitle><TrendingDown className="h-4 w-4 text-red-600" /></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{faltantes.length > 0 ? formatCurrency(totalFaltantes) : "$0"}</div>
                <p className="text-xs text-muted-foreground mt-1">{faltantes.length} sesiones</p>
              </CardContent>
            </Card>
          </div>

          {/* Indicador de diferencia neta */}
          <Card>
            <CardHeader><CardTitle>Diferencia Neta del Período</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Suma de todas las diferencias (sobrantes - faltantes)</p>
                  <div className={`text-3xl font-bold ${(totalSobrantes + totalFaltantes) >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    {(totalSobrantes + totalFaltantes) >= 0 ? "+" : ""}{formatCurrency(totalSobrantes + totalFaltantes)}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-muted-foreground">Diferencias absolutas</p>
                  <div className="text-xl font-semibold">{formatCurrency(data.totalDiferencias)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de diferencias */}
          <Card>
            <CardHeader><CardTitle>Detalle por Sesión ({data.diferencias.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Sesión</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead className="text-right">Esperado</TableHead>
                      <TableHead className="text-right">Contado</TableHead>
                      <TableHead className="text-right">Diferencia</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.diferencias.map(d => (
                      <TableRow key={d.sesion_id} className={d.tipo === "faltante" ? "bg-red-50 dark:bg-red-950/10" : d.tipo === "sobrante" ? "bg-blue-50 dark:bg-blue-950/10" : ""}>
                        <TableCell>{formatFecha(d.fecha)}</TableCell>
                        <TableCell className="font-medium">#{d.sesion_id}</TableCell>
                        <TableCell>{d.usuario}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.efectivoEsperado)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.efectivoContado)}</TableCell>
                        <TableCell className={`text-right font-bold ${d.diferencia > 0 ? "text-blue-600" : d.diferencia < 0 ? "text-red-600" : "text-green-600"}`}>
                          {d.diferencia > 0 ? "+" : ""}{formatCurrency(d.diferencia)}
                        </TableCell>
                        <TableCell className="text-center">{tipoBadge(d.tipo)}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{d.notas || "—"}</TableCell>
                      </TableRow>
                    ))}
                    {data.diferencias.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No hay sesiones cerradas en este período</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Resumen visual */}
          {data.diferencias.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Distribución de Estados</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{data.diferencias.filter(d => d.tipo === "exacto").length}</p>
                      <p className="text-sm text-muted-foreground">Cuadradas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{sobrantes.length}</p>
                      <p className="text-sm text-muted-foreground">Con sobrante</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-red-600">{faltantes.length}</p>
                      <p className="text-sm text-muted-foreground">Con faltante</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!data && !loading && (
        <Card><CardContent className="flex flex-col items-center justify-center py-12"><AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Selecciona un rango de fechas para analizar las diferencias</p></CardContent></Card>
      )}
    </div>
  )
}
