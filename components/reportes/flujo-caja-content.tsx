"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { exportToPDF, exportToExcel, formatCurrency, type TableData, type PDFConfig } from "@/lib/export-utils"
import type { FlujoCaja } from "@/types/reportes"

export function FlujoCajaContent() {
  const router = useRouter()
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [reporte, setReporte] = useState<FlujoCaja | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Establecer fechas por defecto (mes actual)
    const hoy = new Date()
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    setFechaInicio(primerDia.toISOString().split('T')[0])
    setFechaFin(hoy.toISOString().split('T')[0])
  }, [])

  const cargarReporte = async () => {
    if (!fechaInicio || !fechaFin) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/reportes/financieros/flujo-caja?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      )
      const data = await response.json()
      setReporte(data)
    } catch (error) {
      console.error('Error cargando reporte:', error)
      alert('Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const exportarPDF = () => {
    if (!reporte) return

    const tableData: TableData = {
      headers: ['Fecha', 'Tipo', 'Concepto', 'Entrada', 'Salida', 'Balance'],
      rows: reporte.movimientos.map(mov => [
        new Date(mov.fecha).toLocaleDateString('es-CO'),
        mov.tipo === 'entrada' ? 'Entrada' : 'Salida',
        mov.concepto,
        mov.tipo === 'entrada' ? formatCurrency(mov.monto) : '-',
        mov.tipo === 'salida' ? formatCurrency(mov.monto) : '-',
        formatCurrency(mov.balance)
      ])
    }

    const config: PDFConfig = {
      title: 'Flujo de Caja',
      subtitle: 'Movimientos de Efectivo Detallados',
      period: `${fechaInicio} a ${fechaFin}`,
      orientation: 'landscape',
      companyInfo: {
        name: 'Valva Boutique',
        address: 'Sistema POS',
        phone: 'Reporte Financiero'
      }
    }

    exportToPDF(tableData, config)
  }

  const exportarExcel = () => {
    if (!reporte) return

    const tableData: TableData = {
      headers: ['Fecha', 'Tipo', 'Concepto', 'Entrada', 'Salida', 'Balance'],
      rows: reporte.movimientos.map(mov => [
        new Date(mov.fecha).toLocaleDateString('es-CO'),
        mov.tipo === 'entrada' ? 'Entrada' : 'Salida',
        mov.concepto,
        mov.tipo === 'entrada' ? mov.monto : 0,
        mov.tipo === 'salida' ? mov.monto : 0,
        mov.balance
      ])
    }

    exportToExcel(tableData, {
      title: 'Flujo de Caja',
      period: `${fechaInicio} a ${fechaFin}`,
      sheetName: 'Flujo de Caja'
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Flujo de Caja</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Movimientos de efectivo con balance acumulado
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportarPDF}
            disabled={!reporte}
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportarExcel}
            disabled={!reporte}
          >
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros del Reporte</CardTitle>
          <CardDescription>Seleccione el período a analizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-fin">Fecha Fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="flex items-end md:col-span-2">
              <Button
                className="w-full"
                onClick={cargarReporte}
                disabled={loading}
              >
                <FileText className="mr-2 h-4 w-4" />
                {loading ? 'Generando...' : 'Generar Reporte'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen en Cards */}
      {reporte && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reporte.saldoInicial)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Al inicio del período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reporte.totalEntradas)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ingresos de efectivo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Salidas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(reporte.totalSalidas)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Egresos de efectivo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Final</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${reporte.saldoFinal >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatCurrency(reporte.saldoFinal)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Balance al cierre
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Movimientos */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Movimientos</CardTitle>
              <CardDescription>
                Historial completo de entradas y salidas de efectivo ({reporte.movimientos.length} movimientos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead className="text-right">Entrada</TableHead>
                      <TableHead className="text-right">Salida</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reporte.movimientos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No hay movimientos en el período seleccionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      reporte.movimientos.map((mov, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                          <TableCell className="font-medium">
                            {new Date(mov.fecha).toLocaleDateString('es-CO')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={mov.tipo === 'entrada' ? 'default' : 'destructive'}
                              className={mov.tipo === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                            </Badge>
                          </TableCell>
                          <TableCell>{mov.concepto}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {mov.tipo === 'entrada' ? formatCurrency(mov.monto) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            {mov.tipo === 'salida' ? formatCurrency(mov.monto) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(mov.balance)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">💡 Interpretación del Flujo de Caja</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Saldo Positivo:</strong> Indica que tienes más entradas que salidas de efectivo, lo cual es saludable para el negocio.
              </p>
              <p>
                <strong>Saldo Negativo:</strong> Significa más egresos que ingresos. Revisa gastos y considera estrategias de cobro.
              </p>
              <p>
                <strong>Balance Acumulado:</strong> Muestra cómo va evolucionando tu efectivo día a día.
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
            <h3 className="text-lg font-semibold mb-2">Genere el reporte</h3>
            <p className="text-muted-foreground text-center">
              Seleccione las fechas y haga clic en "Generar Reporte" para ver el flujo de caja
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
