"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, FileDown, FileText, ArrowLeft, AlertTriangle, Clock, CheckCircle, Loader2 } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { generateReportPDF } from "@/lib/pdf-export"
import { toast } from "sonner"
import Link from "next/link"

interface CreditoCliente {
  cliente: { nombre: string; telefono: string | null }
  totalCredito: number
  totalAbonado: number
  saldoPendiente: number
  diasVencido: number
  estado: string
  facturas: number
}

interface ReporteData {
  creditos: CreditoCliente[]
  totalPorCobrar: number
  totalAbonado: number
  saldoPendiente: number
  creditosVencidos: number
}

export function CreditosContent() {
  const [reporte, setReporte] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    cargarReporte()
  }, [])

  const cargarReporte = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reportes/clientes/creditos`)
      const data = await response.json()
      if (!response.ok || !data.success) {
        toast.error(data.error || "Error al cargar el reporte")
        return
      }
      setReporte(data)
    } catch (error) {
      console.error('Error cargando reporte:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const exportarCSV = () => {
    if (!reporte || !reporte.creditos.length) { toast.error("No hay datos"); return }
    const headers = ["#", "Cliente", "Teléfono", "Total Crédito", "Abonado", "Saldo Pendiente", "Días Vencidos", "Estado"]
    const rows = reporte.creditos.map((c, i) => [
      i + 1,
      c.cliente.nombre,
      c.cliente.telefono || "N/A",
      c.totalCredito.toFixed(2),
      c.totalAbonado.toFixed(2),
      c.saldoPendiente.toFixed(2),
      c.diasVencido,
      c.estado,
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `cartera_creditos_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    toast.success("CSV exportado correctamente")
  }

  const exportarPDF = async () => {
    if (!reporte || !reporte.creditos.length) { toast.error("No hay datos"); return }
    setExportingPdf(true)
    try {
      generateReportPDF({
        title: "Cartera de Créditos",
        subtitle: "Estado de cuentas por cobrar",
        dateRange: `Corte: ${new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`,
        kpis: [
          { label: "Total Crédito", value: `$${formatCurrency(reporte.totalPorCobrar)}`, detail: `${reporte.creditos.length} clientes` },
          { label: "Abonado", value: `$${formatCurrency(reporte.totalAbonado)}`, detail: reporte.totalPorCobrar > 0 ? `${((reporte.totalAbonado / reporte.totalPorCobrar) * 100).toFixed(1)}% recuperado` : "0%" },
          { label: "Saldo Pendiente", value: `$${formatCurrency(reporte.saldoPendiente)}`, detail: "Por cobrar" },
          { label: "Vencidos", value: String(reporte.creditosVencidos), detail: "Requieren atención" },
        ],
        tables: [{
          title: "Detalle de Cartera",
          headers: ["#", "Cliente", "Total Crédito", "Abonado", "Saldo Pend.", "Días Venc.", "Estado"],
          rows: reporte.creditos.map((c, i) => [
            String(i + 1),
            c.cliente.nombre,
            `$${formatCurrency(c.totalCredito)}`,
            `$${formatCurrency(c.totalAbonado)}`,
            `$${formatCurrency(c.saldoPendiente)}`,
            String(c.diasVencido),
            c.estado === "vencido" ? "VENCIDO" : c.estado === "por_vencer" ? "Por Vencer" : "Al Día",
          ]),
          columnStyles: { 0: { halign: "center" as const }, 2: { halign: "right" as const }, 3: { halign: "right" as const }, 4: { halign: "right" as const }, 5: { halign: "center" as const }, 6: { halign: "center" as const } },
        }],
        orientation: "landscape",
        filename: `cartera_creditos_${new Date().toISOString().split("T")[0]}.pdf`,
      })
      toast.success("PDF exportado correctamente")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const configs = {
      'al_dia': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Al Día' },
      'por_vencer': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Por Vencer' },
      'vencido': { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Vencido' }
    }
    const config = configs[estado as keyof typeof configs] || configs.al_dia
    const Icon = config.icon
    
    return (
      <Badge variant="secondary" className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Cartera de Créditos</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Cuentas por cobrar y estado de créditos
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} disabled={!reporte || loading}>
            <FileDown className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!reporte || loading || exportingPdf}>
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            PDF
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando cartera...</span>
        </div>
      )}

      {/* Resumen en Cards */}
      {reporte && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reporte.totalPorCobrar)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {reporte.creditos.length} clientes con crédito
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abonado</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reporte.totalAbonado)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pagos recibidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(reporte.saldoPendiente)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por cobrar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Créditos Vencidos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {reporte.creditosVencidos}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requieren atención
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Créditos */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Cartera</CardTitle>
              <CardDescription>
                Listado completo de clientes con crédito ({reporte.creditos.length} registros)
              </CardDescription>
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
                      <TableHead className="text-center">Días Vencidos</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reporte.creditos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No hay créditos activos
                        </TableCell>
                      </TableRow>
                    ) : (
                      reporte.creditos.map((credito, index) => (
                        <TableRow 
                          key={index} 
                          className={`${index % 2 === 0 ? 'bg-muted/50' : ''} ${credito.estado === 'vencido' ? 'border-l-4 border-red-500' : ''}`}
                        >
                          <TableCell className="font-medium">{credito.cliente.nombre}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {credito.cliente.telefono || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(credito.totalCredito)}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-semibold">
                            {formatCurrency(credito.totalAbonado)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(credito.saldoPendiente)}
                          </TableCell>
                          <TableCell className="text-center">
                            {credito.diasVencido > 0 ? (
                              <Badge variant="destructive">{credito.diasVencido} días</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {getEstadoBadge(credito.estado)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Análisis por Estado */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Al Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700">
                  {reporte.creditos.filter(c => c.estado === 'al_dia').length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Clientes sin retraso
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Por Vencer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-700">
                  {reporte.creditos.filter(c => c.estado === 'por_vencer').length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Próximos a vencer
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Vencidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-700">
                  {reporte.creditosVencidos}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Requieren seguimiento
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Información adicional */}
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">💡 Gestión de Cartera</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Créditos al día:</strong> Clientes que están cumpliendo con sus pagos según lo acordado.
              </p>
              <p>
                <strong>Por vencer:</strong> Créditos que están próximos a su fecha de pago. Considera enviar recordatorios.
              </p>
              <p>
                <strong>Vencidos:</strong> Clientes con pagos atrasados. Se recomienda hacer seguimiento inmediato.
              </p>
              <p className="mt-4 font-semibold">
                💰 Tasa de recuperación: {reporte.totalPorCobrar > 0 ? ((reporte.totalAbonado / reporte.totalPorCobrar) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Mensaje cuando no hay datos */}
      {!reporte && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin datos de cartera</h3>
            <p className="text-muted-foreground text-center">
              No se encontraron cuentas por cobrar activas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
