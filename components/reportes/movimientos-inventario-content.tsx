"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, ArrowUpDown, ArrowDownRight, ArrowUpRight, RotateCcw, PackageMinus, PackagePlus } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface TipoResumen {
  tipo: string
  cantidad: number
  unidades: number
  porcentaje: number
}

interface Movimiento {
  id: number
  fecha: string
  sku: string
  producto: string
  tipo: string
  cantidad: number
  stockAnterior: number
  stockNuevo: number
  motivo: string | null
  usuario: string
}

interface ReporteData {
  totalMovimientos: number
  porTipo: TipoResumen[]
  movimientos: Movimiento[]
}

const TIPOS_LABEL: Record<string, { label: string; color: string; icon: any }> = {
  entrada_inicial: { label: "Entrada Inicial", color: "bg-blue-100 text-blue-800", icon: PackagePlus },
  entrada_devolucion: { label: "Devolución", color: "bg-cyan-100 text-cyan-800", icon: RotateCcw },
  salida_venta: { label: "Venta", color: "bg-green-100 text-green-800", icon: ArrowDownRight },
  salida_merma: { label: "Merma", color: "bg-red-100 text-red-800", icon: PackageMinus },
  ajuste_manual: { label: "Ajuste Manual", color: "bg-yellow-100 text-yellow-800", icon: ArrowUpDown },
}

export function MovimientosInventarioContent() {
  const hoy = new Date()
  const hace30 = new Date(hoy); hace30.setDate(hace30.getDate() - 30)
  const [fechaInicio, setFechaInicio] = useState(hace30.toISOString().split("T")[0])
  const [fechaFin, setFechaFin] = useState(hoy.toISOString().split("T")[0])
  const [tipo, setTipo] = useState<string>("todos")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  const cargarDatos = useCallback(async () => {
    if (!fechaInicio || !fechaFin) { toast.error("Selecciona las fechas"); return }
    setLoading(true)
    try {
      const params = new URLSearchParams({ fechaInicio, fechaFin })
      if (tipo && tipo !== "todos") params.set("tipo", tipo)
      const res = await fetch(`/api/reportes/inventario/movimientos?${params}`)
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.error || "Error al cargar datos"); return }
      setData(json)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }, [fechaInicio, fechaFin, tipo])

  const formatFecha = (f: string) => {
    try { return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) } catch { return f }
  }

  const getTipoBadge = (t: string) => {
    const cfg = TIPOS_LABEL[t] || { label: t, color: "bg-gray-100 text-gray-800" }
    return <Badge variant="secondary" className={cfg.color}>{cfg.label}</Badge>
  }

  const exportarCSV = () => {
    if (!data || !data.movimientos.length) { toast.error("No hay datos"); return }
    const headers = ["#", "Fecha", "SKU", "Producto", "Tipo", "Cantidad", "Stock Anterior", "Stock Nuevo", "Motivo", "Usuario"]
    const rows = data.movimientos.map((m, i) => [
      i + 1,
      formatFecha(m.fecha),
      m.sku || "",
      m.producto,
      TIPOS_LABEL[m.tipo]?.label || m.tipo,
      m.cantidad,
      m.stockAnterior,
      m.stockNuevo,
      m.motivo || "",
      m.usuario,
    ])
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `movimientos_inventario_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!data || !data.movimientos.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      const kpis = [
        { label: "Total Movimientos", value: String(data.totalMovimientos), detail: `${fechaInicio} al ${fechaFin}` },
        ...data.porTipo.slice(0, 3).map(t => ({
          label: TIPOS_LABEL[t.tipo]?.label || t.tipo,
          value: String(t.cantidad),
          detail: `${t.unidades} unidades (${t.porcentaje.toFixed(1)}%)`,
        })),
      ]

      generateReportPDF({
        title: "Movimientos de Inventario",
        subtitle: `${data.totalMovimientos} movimientos registrados`,
        dateRange: `Del ${fechaInicio} al ${fechaFin}`,
        kpis,
        tables: [{
          title: "Detalle de Movimientos",
          headers: ["#", "Fecha", "SKU", "Producto", "Tipo", "Cant.", "Ant.", "Nuevo", "Motivo", "Usuario"],
          rows: data.movimientos.map((m, i) => [
            String(i + 1),
            formatFecha(m.fecha),
            m.sku || "—",
            m.producto,
            TIPOS_LABEL[m.tipo]?.label || m.tipo,
            String(m.cantidad),
            String(m.stockAnterior),
            String(m.stockNuevo),
            m.motivo || "—",
            m.usuario,
          ]),
          columnStyles: { 0: { halign: "center" as const }, 5: { halign: "center" as const }, 6: { halign: "center" as const }, 7: { halign: "center" as const } },
        }],
        orientation: "landscape",
        filename: `movimientos_inventario_${fechaInicio}_${fechaFin}.pdf`,
      })
      toast.success("PDF exportado correctamente")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar PDF")
    } finally { setExportingPdf(false) }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reportes/contables">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Movimientos de Inventario</h1>
            <p className="text-sm text-muted-foreground md:text-base">Historial de entradas, salidas y ajustes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!data || loading}>
            <FileDown className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!data || loading || exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Desde</Label>
              <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(TIPOS_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={cargarDatos} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowUpDown className="mr-2 h-4 w-4" />}
                {loading ? "Cargando..." : "Consultar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando movimientos...</span>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Resumen por tipo */}
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries(TIPOS_LABEL).map(([key, cfg]) => {
              const item = data.porTipo.find(t => t.tipo === key)
              const Icon = cfg.icon
              return (
                <Card key={key}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium">{cfg.label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{item?.cantidad ?? 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">{item?.unidades ?? 0} unidades</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Tabla de movimientos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalle de Movimientos ({data.totalMovimientos})</CardTitle>
            </CardHeader>
            <CardContent>
              {data.movimientos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay movimientos en el periodo seleccionado</div>
              ) : (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-center">Anterior</TableHead>
                        <TableHead className="text-center">Nuevo</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Usuario</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.movimientos.map((m, i) => (
                        <TableRow key={m.id}>
                          <TableCell className="text-center text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="whitespace-nowrap text-sm">{formatFecha(m.fecha)}</TableCell>
                          <TableCell className="font-mono text-sm">{m.sku || "—"}</TableCell>
                          <TableCell className="font-medium">{m.producto}</TableCell>
                          <TableCell>{getTipoBadge(m.tipo)}</TableCell>
                          <TableCell className="text-center font-semibold">
                            <span className={m.tipo.startsWith("entrada") ? "text-green-600" : m.tipo.startsWith("salida") ? "text-red-600" : "text-yellow-600"}>
                              {m.tipo.startsWith("entrada") ? "+" : m.tipo.startsWith("salida") ? "-" : "±"}{m.cantidad}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">{m.stockAnterior}</TableCell>
                          <TableCell className="text-center">{m.stockNuevo}</TableCell>
                          <TableCell className="text-sm">{m.motivo || "—"}</TableCell>
                          <TableCell className="text-sm">{m.usuario}</TableCell>
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

      {/* Mensaje inicial */}
      {!data && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <ArrowUpDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Selecciona un rango de fechas</p>
              <p className="text-sm mt-1">Haz clic en &quot;Consultar&quot; para ver los movimientos de inventario</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
