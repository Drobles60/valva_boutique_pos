"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, TrendingUp, Users, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"

export function DashboardContent() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard')
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground md:text-base">Cargando métricas de hoy...</p>
      </div>
    )
  }

  const stats = [
    {
      title: "Ventas Hoy",
      value: `$${formatCurrency(data?.ventas?.ventasHoy || 0)}`,
      description: `${data?.ventas?.transacciones || 0} transacciones`,
      icon: DollarSign,
      trend: "+0%", // Puede calcularse dinámicamente futuro vs ayer
    },
    {
      title: "Productos Vendidos",
      value: (data?.productosVendidos || 0).toString(),
      description: "Unidades totales de hoy",
      icon: Package,
      trend: "+0%",
    },
    {
      title: "Clientes Atendidos",
      value: (data?.ventas?.clientesAtendidos || 0).toString(),
      description: "Clientes únicos hoy",
      icon: Users,
      trend: "+0%",
    },
    {
      title: "Cuentas por Cobrar",
      value: `$${formatCurrency(data?.cxc?.deudaTotal || 0)}`,
      description: `${data?.cxc?.clientesMorosos || 0} clientes pendientes`,
      icon: CreditCard,
      trend: "Total",
    },
  ]

  const recentSales = data?.ventasRecientes || []
  const cajaInfo = data?.caja || { estado: 'Cerrada', base: 0, ventasTurno: 0, totalEnCaja: 0 }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
            <p className="text-sm text-muted-foreground md:text-base">Bienvenido al sistema Valva</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none" asChild>
            <a href="/reportes">Ver Reportes</a>
          </Button>
          <Button size="sm" className="flex-1 md:flex-none" asChild>
            <a href="/ventas">Nueva Venta</a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="font-medium text-primary">{stat.trend}</span>
                <span className="text-muted-foreground">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>Últimas transacciones realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.length > 0 ? (
                recentSales.map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{sale.cliente}</p>
                      <p className="text-sm text-muted-foreground">Venta #{sale.numero_venta || sale.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${formatCurrency(sale.total)}</p>
                      <p className="text-sm text-muted-foreground capitalize">{sale.tipo}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay ventas registradas.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Caja</CardTitle>
            <CardDescription>Información del turno actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${cajaInfo.estado === 'Abierta' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                  {cajaInfo.estado}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base Inicial:</span>
                <span className="font-medium">${formatCurrency(cajaInfo.base)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ventas del Turno (Efectivo):</span>
                <span className="font-medium">${formatCurrency(cajaInfo.ventasTurno)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium">Total en Caja Fuerte:</span>
                <span className="text-xl font-bold text-primary">${formatCurrency(cajaInfo.totalEnCaja)}</span>
              </div>
              {cajaInfo.estado === 'Abierta' && (
                <Button className="w-full bg-transparent" variant="outline" asChild>
                  <a href="/caja">Ir a Caja</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
