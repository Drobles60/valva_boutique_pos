"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, ArrowLeft, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { exportToPDF, exportToExcel, formatCurrency, type TableData, type PDFConfig } from "@/lib/export-utils"
import type { EstadoResultados } from "@/types/reportes"

export function EstadoResultadosContent() {
  const router = useRouter()
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [reporte, setReporte] = useState<EstadoResultados | null>(null)
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
        `/api/reportes/financieros/estado-resultados?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
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
      headers: ['Concepto', 'Valor'],
      rows: [
        ['INGRESOS', ''],
        ['Ventas Totales', formatCurrency(reporte.ingresos.ventasTotales)],
        ['Ventas de Contado', formatCurrency(reporte.ingresos.ventasContado)],
        ['Ventas a Crédito', formatCurrency(reporte.ingresos.ventasCredito)],
        ['Abonos Recibidos', formatCurrency(reporte.ingresos.abonosRecibidos)],
        ['Total Ingresos', formatCurrency(reporte.ingresos.total)],
        ['', ''],
        ['EGRESOS', ''],
        ['Costo de Ventas', formatCurrency(reporte.egresos.costoVentas)],
        ['Gastos Operativos', formatCurrency(reporte.egresos.gastos)],
        ['Otros Egresos', formatCurrency(reporte.egresos.otros)],
        ['Total Egresos', formatCurrency(reporte.egresos.total)],
        ['', ''],
        ['RESULTADO', ''],
        ['Utilidad Bruta', formatCurrency(reporte.utilidadBruta)],
        ['Utilidad Neta', formatCurrency(reporte.utilidadNeta)],
        ['Margen Bruto', `${reporte.margenBruto.toFixed(2)}%`],
        ['Margen Neto', `${reporte.margenNeto.toFixed(2)}%`]
      ]
    }

    const config: PDFConfig = {
      title: 'Estado de Resultados',
      subtitle: 'Análisis de Ingresos y Egresos',
      period: `${fechaInicio} a ${fechaFin}`,
      orientation: 'portrait',
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
      headers: ['Concepto', 'Valor'],
      rows: [
        ['INGRESOS', ''],
        ['Ventas Totales', reporte.ingresos.ventasTotales],
        ['Ventas de Contado', reporte.ingresos.ventasContado],
        ['Ventas a Crédito', reporte.ingresos.ventasCredito],
        ['Abonos Recibidos', reporte.ingresos.abonosRecibidos],
        ['Total Ingresos', reporte.ingresos.total],
        ['', ''],
        ['EGRESOS', ''],
        ['Costo de Ventas', reporte.egresos.costoVentas],
        ['Gastos Operativos', reporte.egresos.gastos],
        ['Otros Egresos', reporte.egresos.otros],
        ['Total Egresos', reporte.egresos.total],
        ['', ''],
        ['RESULTADO', ''],
        ['Utilidad Bruta', reporte.utilidadBruta],
        ['Utilidad Neta', reporte.utilidadNeta],
        ['Margen Bruto (%)', reporte.margenBruto],
        ['Margen Neto (%)', reporte.margenNeto]
      ]
    }

    exportToExcel(tableData, {
      title: 'Estado de Resultados',
      period: `${fechaInicio} a ${fechaFin}`,
      sheetName: 'Estado de Resultados'
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Estado de Resultados</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Análisis de ingresos, egresos y utilidad del período
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
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reporte.ingresos.total)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ventas y abonos del período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(reporte.egresos.total)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Costos y gastos del período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${reporte.utilidadNeta >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(reporte.utilidadNeta)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ganancia/Pérdida final
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margen Neto</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {reporte.margenNeto.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Rentabilidad sobre ventas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detalle de Ingresos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Ingresos</CardTitle>
              <CardDescription>Detalle de ingresos del período</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Ventas Totales</TableCell>
                    <TableCell className="text-right">{formatCurrency(reporte.ingresos.ventasTotales)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">• Ventas de Contado</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(reporte.ingresos.ventasContado)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">• Ventas a Crédito</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(reporte.ingresos.ventasCredito)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Abonos Recibidos</TableCell>
                    <TableCell className="text-right">{formatCurrency(reporte.ingresos.abonosRecibidos)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-green-50">
                    <TableCell className="font-bold">Total Ingresos</TableCell>
                    <TableCell className="text-right font-bold text-green-700">
                      {formatCurrency(reporte.ingresos.total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Detalle de Egresos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">Egresos</CardTitle>
              <CardDescription>Detalle de costos y gastos del período</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Costo de Ventas</TableCell>
                    <TableCell className="text-right">{formatCurrency(reporte.egresos.costoVentas)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Gastos Operativos</TableCell>
                    <TableCell className="text-right">{formatCurrency(reporte.egresos.gastos)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Otros Egresos</TableCell>
                    <TableCell className="text-right">{formatCurrency(reporte.egresos.otros)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-red-50">
                    <TableCell className="font-bold">Total Egresos</TableCell>
                    <TableCell className="text-right font-bold text-red-700">
                      {formatCurrency(reporte.egresos.total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Análisis de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Análisis de Resultados</CardTitle>
              <CardDescription>Utilidad y márgenes del período</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicador</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Utilidad Bruta</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(reporte.utilidadBruta)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Margen Bruto</TableCell>
                    <TableCell className="text-right">{reporte.margenBruto.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Utilidad Neta</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(reporte.utilidadNeta)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Margen Neto</TableCell>
                    <TableCell className="text-right">{reporte.margenNeto.toFixed(2)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
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
              Seleccione las fechas y haga clic en "Generar Reporte" para ver el análisis
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
