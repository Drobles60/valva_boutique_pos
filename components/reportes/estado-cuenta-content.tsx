"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, FileDown, Users, DollarSign, TrendingDown, Receipt } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface ClienteResumen {
  id: number
  nombre: string
  telefono: string | null
  email: string | null
  totalCuentas: number
  totalCredito: number
  totalAbonado: number
  saldoPendiente: number
}

interface Movimiento {
  fecha: string
  tipo: string
  referencia: string
  descripcion: string
  monto: number
  saldo: number
}

interface EstadoCuentaData {
  cliente: { id: number; nombre: string; telefono: string | null; email: string | null }
  periodo: string
  totalCargos: number
  totalAbonos: number
  saldoFinal: number
  movimientos: Movimiento[]
}

export function EstadoCuentaContent() {
  const [clientes, setClientes] = useState<ClienteResumen[]>([])
  const [clienteId, setClienteId] = useState<string>("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [estadoCuenta, setEstadoCuenta] = useState<EstadoCuentaData | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  // Cargar clientes con crédito
  useEffect(() => {
    const cargarClientes = async () => {
      setLoadingClientes(true)
      try {
        const res = await fetch("/api/reportes/clientes/estado-cuenta")
        const data = await res.json()
        if (!res.ok || !data.success) { toast.error(data.error || "Error cargando clientes"); return }
        setClientes(data.clientes)
      } catch { toast.error("Error de conexión") }
      finally { setLoadingClientes(false) }
    }
    cargarClientes()
  }, [])

  const cargarEstadoCuentaDirecto = async (id: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ clienteId: id })
      if (fechaInicio) params.set("fechaInicio", fechaInicio)
      if (fechaFin) params.set("fechaFin", fechaFin)
      const res = await fetch(`/api/reportes/clientes/estado-cuenta?${params}`)
      const data = await res.json()
      if (!res.ok || !data.success) { toast.error(data.error || "Error"); return }
      setEstadoCuenta(data)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }

  const cargarEstadoCuenta = useCallback(async () => {
    if (!clienteId) { toast.error("Selecciona un cliente"); return }
    setLoading(true)
    try {
      const params = new URLSearchParams({ clienteId })
      if (fechaInicio) params.set("fechaInicio", fechaInicio)
      if (fechaFin) params.set("fechaFin", fechaFin)
      const res = await fetch(`/api/reportes/clientes/estado-cuenta?${params}`)
      const data = await res.json()
      if (!res.ok || !data.success) { toast.error(data.error || "Error"); return }
      setEstadoCuenta(data)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }, [clienteId, fechaInicio, fechaFin])

  const formatFecha = (f: string) => {
    try {
      return new Date(f).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
    } catch { return f }
  }

  const exportarCSV = () => {
    if (!estadoCuenta || !estadoCuenta.movimientos.length) { toast.error("No hay datos"); return }
    const headers = ["Fecha", "Tipo", "Referencia", "Descripción", "Cargo", "Abono", "Saldo"]
    const rows = estadoCuenta.movimientos.map(m => [
      formatFecha(m.fecha),
      m.tipo === "cargo" ? "Cargo" : "Abono",
      m.referencia,
      m.descripcion,
      m.tipo === "cargo" ? m.monto.toFixed(2) : "",
      m.tipo === "abono" ? m.monto.toFixed(2) : "",
      m.saldo.toFixed(2),
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `estado_cuenta_${estadoCuenta.cliente.nombre.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!estadoCuenta || !estadoCuenta.movimientos.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Estado de Cuenta",
        subtitle: `Cliente: ${estadoCuenta.cliente.nombre}`,
        dateRange: `Periodo: ${estadoCuenta.periodo}`,
        kpis: [
          { label: "Total Cargos", value: `$${formatCurrency(estadoCuenta.totalCargos)}`, detail: "Ventas a crédito" },
          { label: "Total Abonos", value: `$${formatCurrency(estadoCuenta.totalAbonos)}`, detail: "Pagos recibidos" },
          { label: "Saldo Final", value: `$${formatCurrency(estadoCuenta.saldoFinal)}`, detail: estadoCuenta.saldoFinal > 0 ? "Pendiente" : "Saldado" },
          { label: "Movimientos", value: String(estadoCuenta.movimientos.length), detail: `${estadoCuenta.periodo}` },
        ],
        tables: [{
          title: "Detalle de Movimientos",
          headers: ["Fecha", "Tipo", "Referencia", "Descripción", "Cargo", "Abono", "Saldo"],
          rows: estadoCuenta.movimientos.map(m => [
            formatFecha(m.fecha),
            m.tipo === "cargo" ? "Cargo" : "Abono",
            m.referencia,
            m.descripcion,
            m.tipo === "cargo" ? `$${formatCurrency(m.monto)}` : "",
            m.tipo === "abono" ? `$${formatCurrency(m.monto)}` : "",
            `$${formatCurrency(m.saldo)}`,
          ]),
          columnStyles: { 0: { halign: "center" as const }, 1: { halign: "center" as const }, 4: { halign: "right" as const }, 5: { halign: "right" as const }, 6: { halign: "right" as const } },
        }],
        orientation: "landscape",
        filename: `estado_cuenta_${estadoCuenta.cliente.nombre.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Estado de Cuenta</h1>
            <p className="text-sm text-muted-foreground md:text-base">Historial de cargos y abonos por cliente</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!estadoCuenta || loading}>
            <FileDown className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!estadoCuenta || loading || exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingClientes ? "Cargando clientes..." : "Seleccionar cliente"} />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre} — Saldo: {formatCurrency(c.saldoPendiente)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Desde</Label>
              <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hasta</Label>
              <div className="flex gap-2">
                <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                <Button onClick={cargarEstadoCuenta} disabled={loading || !clienteId}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Consultar"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista rápida de clientes si no se ha seleccionado */}
      {!estadoCuenta && !loading && clientes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clientes con Crédito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className="text-right">Total Crédito</TableHead>
                    <TableHead className="text-right">Abonado</TableHead>
                    <TableHead className="text-right">Saldo Pendiente</TableHead>
                    <TableHead className="text-center">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nombre}</TableCell>
                      <TableCell>{c.telefono || "—"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.totalCredito)}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(c.totalAbonado)}</TableCell>
                      <TableCell className="text-right font-semibold text-red-600">{formatCurrency(c.saldoPendiente)}</TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline" onClick={() => { setClienteId(String(c.id)); cargarEstadoCuentaDirecto(String(c.id)) }}>
                          Ver Estado
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando estado de cuenta...</span>
        </div>
      )}

      {/* Resumen KPIs */}
      {estadoCuenta && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cargos</CardTitle>
                <Receipt className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(estadoCuenta.totalCargos)}</div>
                <p className="text-xs text-muted-foreground mt-1">Ventas a crédito</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Abonos</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(estadoCuenta.totalAbonos)}</div>
                <p className="text-xs text-muted-foreground mt-1">Pagos recibidos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Final</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${estadoCuenta.saldoFinal > 0 ? "text-orange-600" : "text-green-600"}`}>
                  {formatCurrency(estadoCuenta.saldoFinal)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {estadoCuenta.saldoFinal > 0 ? "Pendiente de pago" : "Cuenta saldada"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{estadoCuenta.movimientos.length}</div>
                <p className="text-xs text-muted-foreground mt-1">{estadoCuenta.periodo}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Movimientos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Movimientos — {estadoCuenta.cliente.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {estadoCuenta.movimientos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay movimientos en el periodo seleccionado</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Referencia</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Cargo</TableHead>
                        <TableHead className="text-right">Abono</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estadoCuenta.movimientos.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="whitespace-nowrap">{formatFecha(m.fecha)}</TableCell>
                          <TableCell>
                            <Badge variant={m.tipo === "cargo" ? "destructive" : "default"} className={m.tipo === "abono" ? "bg-green-100 text-green-800" : ""}>
                              {m.tipo === "cargo" ? "Cargo" : "Abono"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{m.referencia}</TableCell>
                          <TableCell>{m.descripcion}</TableCell>
                          <TableCell className="text-right text-red-600 font-medium">
                            {m.tipo === "cargo" ? formatCurrency(m.monto) : ""}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            {m.tipo === "abono" ? formatCurrency(m.monto) : ""}
                          </TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(m.saldo)}</TableCell>
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
    </div>
  )
}
