"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, TrendingUp, DollarSign, ShoppingCart, Percent, BarChart3, PieChart, LineChart, Calculator, Users, Package } from "lucide-react"
import type { Venta } from "@/lib/types"
import { getVentas, getProducts, getCurrentUser } from "@/lib/storage"
import { SidebarToggle } from "./app-sidebar"
import { formatCurrency } from "@/lib/utils"

export function ReportesContent() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [tipoReporte, setTipoReporte] = useState("todo")
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getCurrentUser>>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentUser(getCurrentUser())
    loadVentas()
    // Set default dates (last 7 days)
    const hoy = new Date()
    const hace7Dias = new Date(hoy)
    hace7Dias.setDate(hoy.getDate() - 7)
    setFechaInicio(hace7Dias.toISOString().split("T")[0])
    setFechaFin(hoy.toISOString().split("T")[0])
  }, [])

  const loadVentas = () => {
    setVentas(getVentas())
  }

  const ventasFiltradas = ventas.filter((venta) => {
    const fechaVenta = new Date(venta.fecha)
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date(0)
    const fin = fechaFin ? new Date(fechaFin) : new Date()
    fin.setHours(23, 59, 59)

    return fechaVenta >= inicio && fechaVenta <= fin
  })

  // Calculate profit for each sale
  const productos = getProducts()
  const calcularUtilidad = () => {
    let totalCosto = 0
    let totalVenta = 0

    ventasFiltradas.forEach((venta) => {
      venta.productos.forEach((item) => {
        const producto = productos.find((p) => p.id === item.producto.id)
        if (producto) {
          totalCosto += producto.precioCosto * item.cantidad
          totalVenta += item.precioUnitario * item.cantidad
        }
      })
    })

    return {
      totalCosto,
      totalVenta,
      utilidad: totalVenta - totalCosto,
      margen: totalVenta > 0 ? ((totalVenta - totalCosto) / totalVenta) * 100 : 0,
    }
  }

  const utilidadData = calcularUtilidad()

  // Group sales by product
  const ventasPorProducto = ventasFiltradas
    .flatMap((venta) => venta.productos)
    .reduce(
      (acc, item) => {
        const producto = productos.find((p) => p.id === item.producto.id)
        if (!producto) return acc

        const key = item.producto.id
        if (!acc[key]) {
          acc[key] = {
            producto: item.producto,
            cantidad: 0,
            totalVenta: 0,
            totalCosto: 0,
            utilidad: 0,
          }
        }
        acc[key].cantidad += item.cantidad
        acc[key].totalVenta += item.precioUnitario * item.cantidad
        acc[key].totalCosto += producto.precioCosto * item.cantidad
        acc[key].utilidad = acc[key].totalVenta - acc[key].totalCosto
        return acc
      },
      {} as Record<string, any>,
    )

  const productosTop = Object.values(ventasPorProducto)
    .sort((a: any, b: any) => b.totalVenta - a.totalVenta)
    .slice(0, 10)

  const productosMasRentables = Object.values(ventasPorProducto)
    .sort((a: any, b: any) => b.utilidad - a.utilidad)
    .slice(0, 10)

  // Sales by day
  const ventasPorDia = ventasFiltradas.reduce(
    (acc, venta) => {
      const dia = new Date(venta.fecha).toLocaleDateString()
      if (!acc[dia]) {
        acc[dia] = { total: 0, transacciones: 0, utilidad: 0 }
      }
      acc[dia].total += venta.total
      acc[dia].transacciones += 1

      // Calculate profit
      venta.productos.forEach((item) => {
        const producto = productos.find((p) => p.id === item.producto.id)
        if (producto) {
          acc[dia].utilidad += (item.precioUnitario - producto.precioCosto) * item.cantidad
        }
      })
      return acc
    },
    {} as Record<string, any>,
  )

  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0)
  const ventasContado = ventasFiltradas.filter((v) => v.estado === "completada").reduce((sum, v) => sum + v.total, 0)
  const ventasCredito = ventasFiltradas.filter((v) => v.estado === "credito").reduce((sum, v) => sum + v.total, 0)
  const ticketPromedio = ventasFiltradas.length > 0 ? totalVentas / ventasFiltradas.length : 0

  const canViewReports = true
  const canViewCosts = currentUser?.rol === 'administrador'

  if (!mounted) {
    return null
  }

  if (!canViewReports) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4 p-6">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">No tiene permisos para ver reportes</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Reportes y Analíticas</h1>
            <p className="text-sm text-muted-foreground md:text-base">Análisis de ventas y rentabilidad</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span> PDF
          </Button>
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span> Excel
          </Button>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Reportes Generales</CardTitle>
                  <CardDescription className="text-xs">Ventas y productos</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Análisis de ventas, productos más vendidos, rentabilidad y estadísticas generales del negocio.
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Ventas por período</li>
              <li>• Top productos</li>
              <li>• Análisis de rentabilidad</li>
              <li>• Ticket promedio</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer" onClick={() => window.location.href = '/reportes/contables'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Reportes Contables</CardTitle>
                  <CardDescription className="text-xs">Finanzas y contabilidad</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Reportes financieros avanzados: estado de resultados, flujo de caja, gastos, inventario y más.
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Estado de resultados</li>
              <li>• Flujo de caja</li>
              <li>• Análisis de gastos</li>
              <li>• Cartera de créditos</li>
            </ul>
            <Button size="sm" className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
              Ver Reportes Contables →
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <PieChart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Estadísticas Avanzadas</CardTitle>
                  <CardDescription className="text-xs">Análisis detallados</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Métricas adicionales, gráficas comparativas y análisis de tendencias de tu negocio.
            </p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Tendencias de ventas</li>
              <li>• Comparativas por período</li>
              <li>• Análisis de clientes</li>
              <li>• Rotación de inventario</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
          <CardDescription>Seleccione el período para analizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="tipo-reporte">Tipo de Análisis</Label>
              <Select value={tipoReporte} onValueChange={setTipoReporte}>
                <SelectTrigger id="tipo-reporte">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todos</SelectItem>
                  <SelectItem value="ventas">Solo Ventas</SelectItem>
                  <SelectItem value="rentabilidad">Rentabilidad</SelectItem>
                  <SelectItem value="productos">Por Producto</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Input id="fecha-fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={loadVentas}>
                <FileText className="mr-2 h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(totalVentas)}</div>
            <p className="text-xs text-muted-foreground">{ventasFiltradas.length} transacciones</p>
          </CardContent>
        </Card>

        {canViewCosts && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilidad Bruta</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#D4AF37]">${formatCurrency(utilidadData.utilidad)}</div>
                <p className="text-xs text-muted-foreground">Ventas menos costos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margen de Utilidad</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#D4AF37]">{utilidadData.margen.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Rentabilidad promedio</p>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(ticketPromedio)}</div>
            <p className="text-xs text-muted-foreground">Por transacción</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Payment Method */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Método de Pago</CardTitle>
            <CardDescription>Distribución de ventas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Ventas de Contado</p>
                  <p className="text-sm text-muted-foreground">
                    {((ventasContado / totalVentas) * 100 || 0).toFixed(1)}% del total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">${formatCurrency(ventasContado)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Ventas a Crédito</p>
                  <p className="text-sm text-muted-foreground">
                    {((ventasCredito / totalVentas) * 100 || 0).toFixed(1)}% del total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">${formatCurrency(ventasCredito)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventas por Día</CardTitle>
            <CardDescription>Últimos días del período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(ventasPorDia)
                .slice(-7)
                .map(([dia, data]: [string, any]) => (
                  <div key={dia} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{dia}</p>
                      <p className="text-sm text-muted-foreground">{data.transacciones} transacciones</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${formatCurrency(data.total)}</p>
                      {canViewCosts && <p className="text-sm text-[#D4AF37]">+${formatCurrency(data.utilidad)}</p>}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
          <CardDescription>Top 10 productos por volumen de ventas</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posición</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Ventas</TableHead>
                {canViewCosts && (
                  <>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Utilidad</TableHead>
                    <TableHead className="text-right">Margen</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosTop.map((item: any, index) => (
                <TableRow key={item.producto.id}>
                  <TableCell>
                    <Badge variant={index < 3 ? "default" : "secondary"}>#{index + 1}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.producto.nombre}</TableCell>
                  <TableCell className="text-right">{item.cantidad}</TableCell>
                  <TableCell className="text-right font-semibold">${formatCurrency(item.totalVenta)}</TableCell>
                  {canViewCosts && (
                    <>
                      <TableCell className="text-right text-muted-foreground">
                        ${formatCurrency(item.totalCosto)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[#D4AF37]">
                        ${formatCurrency(item.utilidad)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{((item.utilidad / item.totalVenta) * 100).toFixed(1)}%</Badge>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Most Profitable Products */}
      {canViewCosts && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Rentables</CardTitle>
            <CardDescription>Top 10 productos por utilidad generada</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posición</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Utilidad</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Total Ventas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosMasRentables.map((item: any, index) => (
                  <TableRow key={item.producto.id}>
                    <TableCell>
                      <Badge className="bg-[#D4AF37]">#{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.producto.nombre}</TableCell>
                    <TableCell className="text-right font-bold text-[#D4AF37]">
                      ${formatCurrency(item.utilidad)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{((item.utilidad / item.totalVenta) * 100).toFixed(1)}%</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.cantidad}</TableCell>
                    <TableCell className="text-right font-semibold">${formatCurrency(item.totalVenta)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
