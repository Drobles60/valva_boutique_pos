"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, ArrowLeft, Download, FileDown, TrendingUp, ShoppingCart, UserCheck } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { generateReportPDF } from "@/lib/pdf-export"
import Link from "next/link"

interface Vendedor {
  usuario_id: number
  nombre: string
  apellido: string
  rol: string
  transacciones: number
  total_ventas: number
  ticket_promedio: number
  ventas_contado: number
  ventas_credito: number
  dias_activos: number
  mejor_dia: string | null
  venta_mejor_dia: number
  participacion: number
}

interface ReporteData {
  vendedores: Vendedor[]
  totalVentas: number
  totalTransacciones: number
  ticketPromedio: number
  totalVendedores: number
}

export function VentasVendedorContent() {
  const { data: session } = useSession()
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReporteData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  const isAdmin = (session?.user as any)?.rol === "administrador"

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
      const res = await fetch(`/api/reportes/ventas/vendedores?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
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

  const vendedores = data?.vendedores ?? []
  const vendedoresConVentas = vendedores.filter(v => v.transacciones > 0)
  const maxVenta = Math.max(...vendedoresConVentas.map(v => v.total_ventas), 1)

  const formatFecha = (f: string) => {
    const [a, m, d] = f.split("-").map(Number)
    return new Date(a, m - 1, d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
  }

  const exportarCSV = () => {
    if (!vendedoresConVentas.length) { toast.error("No hay datos para exportar"); return }
    const headers = ["#", "Vendedor", "Rol", "Transacciones", "Total Ventas", "Ticket Promedio", "Contado", "Crédito", "Días Activos", "Participación"]
    const rows = vendedoresConVentas.map((v, i) => [
      i + 1,
      `${v.nombre} ${v.apellido}`,
      v.rol,
      v.transacciones,
      v.total_ventas.toFixed(2),
      v.ticket_promedio.toFixed(2),
      v.ventas_contado.toFixed(2),
      v.ventas_credito.toFixed(2),
      v.dias_activos,
      v.participacion.toFixed(1) + "%",
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `ventas_por_vendedor_${fechaInicio}_${fechaFin}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!vendedoresConVentas.length) { toast.error("No hay datos para exportar"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Ventas por Vendedor",
        subtitle: "Comparativo de rendimiento y ventas por usuario",
        dateRange: `${formatFecha(fechaInicio)} — ${formatFecha(fechaFin)}`,
        kpis: [
          { label: "Total Ventas", value: `$${formatCurrency(data?.totalVentas ?? 0)}`, detail: `${data?.totalTransacciones ?? 0} transacciones` },
          { label: "Vendedores Activos", value: String(data?.totalVendedores ?? 0), detail: "Con ventas en período" },
          { label: "Ticket Promedio", value: `$${formatCurrency(data?.ticketPromedio ?? 0)}`, detail: "Por transacción" },
        ],
        tables: [{
          title: "Detalle por Vendedor",
          headers: ["#", "Vendedor", "Ventas", "Ticket Prom.", "Contado", "Crédito", "Días", "Part."],
          rows: vendedoresConVentas.map((v, i) => [
            String(i + 1),
            `${v.nombre} ${v.apellido}`,
            `$${formatCurrency(v.total_ventas)}`,
            `$${formatCurrency(v.ticket_promedio)}`,
            `$${formatCurrency(v.ventas_contado)}`,
            `$${formatCurrency(v.ventas_credito)}`,
            String(v.dias_activos),
            `${v.participacion.toFixed(1)}%`,
          ]),
          columnStyles: {
            0: { halign: "center" },
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right" },
            6: { halign: "center" },
            7: { halign: "center" },
          },
        }],
        orientation: "landscape",
        filename: `ventas_por_vendedor_${fechaInicio}_${fechaFin}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight">Ventas por Vendedor</h1>
            <p className="text-sm text-muted-foreground">Comparativo de rendimiento y ventas por usuario</p>
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
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
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
            <CardTitle className="text-sm font-medium">Vendedores Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalVendedores ?? 0}</div>
            <p className="text-xs text-muted-foreground">Con ventas en el período</p>
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
      {vendedoresConVentas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Participación en Ventas</CardTitle>
            <CardDescription>Distribución de ventas por vendedor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendedoresConVentas.map((v, index) => {
                const pct = (v.total_ventas / maxVenta) * 100
                return (
                  <div key={v.usuario_id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={index === 0 ? "bg-yellow-400 text-yellow-900" : index === 1 ? "bg-gray-300 text-gray-800" : index === 2 ? "bg-amber-600 text-white" : ""}
                          variant={index >= 3 ? "secondary" : "default"}
                        >
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{v.nombre} {v.apellido}</span>
                        <Badge variant="outline" className="text-xs">{v.rol}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs">{v.participacion.toFixed(1)}%</span>
                        <span className="font-bold text-primary">${formatCurrency(v.total_ventas)}</span>
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
          <CardTitle>Detalle por Vendedor</CardTitle>
          <CardDescription>Métricas individuales de rendimiento</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {vendedoresConVentas.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-12">No hay ventas en este período</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-center">Transacciones</TableHead>
                  <TableHead className="text-right">Total Ventas</TableHead>
                  <TableHead className="text-right">Ticket Prom.</TableHead>
                  <TableHead className="text-right">Contado</TableHead>
                  <TableHead className="text-right">Crédito</TableHead>
                  <TableHead className="text-center">Días Activos</TableHead>
                  <TableHead className="text-center">Participación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendedoresConVentas.map((v, index) => (
                  <TableRow key={v.usuario_id}>
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
                        <p className="font-medium">{v.nombre} {v.apellido}</p>
                        <p className="text-xs text-muted-foreground capitalize">{v.rol}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{v.transacciones}</TableCell>
                    <TableCell className="text-right font-semibold">${formatCurrency(v.total_ventas)}</TableCell>
                    <TableCell className="text-right">${formatCurrency(v.ticket_promedio)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">${formatCurrency(v.ventas_contado)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">${formatCurrency(v.ventas_credito)}</TableCell>
                    <TableCell className="text-center">{v.dias_activos}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={v.participacion >= 30 ? "text-green-700 border-green-300" : v.participacion >= 15 ? "text-yellow-700 border-yellow-300" : "text-muted-foreground"}>
                        {v.participacion.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Mejor día por vendedor */}
      {vendedoresConVentas.some(v => v.mejor_dia) && (
        <Card>
          <CardHeader>
            <CardTitle>Mejor Día de Cada Vendedor</CardTitle>
            <CardDescription>El día con mayor venta durante el período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {vendedoresConVentas.filter(v => v.mejor_dia).map(v => (
                <div key={v.usuario_id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{v.nombre} {v.apellido}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.mejor_dia ? formatFecha(v.mejor_dia) : "—"} · <span className="font-semibold text-primary">${formatCurrency(v.venta_mejor_dia)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
