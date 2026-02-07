"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, TrendingUp, Users, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarToggle } from "@/components/app-sidebar"
import { formatCurrency } from "@/lib/utils"

export function DashboardContent() {
  const stats = [
    {
      title: "Ventas Hoy",
      value: "$2,450,000",
      description: "15 transacciones",
      icon: DollarSign,
      trend: "+12.5%",
    },
    {
      title: "Productos Vendidos",
      value: "42",
      description: "Unidades totales",
      icon: Package,
      trend: "+8.2%",
    },
    {
      title: "Clientes Atendidos",
      value: "18",
      description: "Clientes únicos",
      icon: Users,
      trend: "+5.1%",
    },
    {
      title: "Cuentas por Cobrar",
      value: "$850,000",
      description: "8 clientes pendientes",
      icon: CreditCard,
      trend: "-3.2%",
    },
  ]

  const recentSales = [
    { id: "001", cliente: "María González", total: 125000, tipo: "Contado" },
    { id: "002", cliente: "Juan Pérez", total: 89000, tipo: "Crédito" },
    { id: "003", cliente: "Ana Martínez", total: 215000, tipo: "Contado" },
    { id: "004", cliente: "Carlos López", total: 156000, tipo: "Contado" },
  ]

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
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{sale.cliente}</p>
                    <p className="text-sm text-muted-foreground">Venta #{sale.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${formatCurrency(sale.total)}</p>
                    <p className="text-sm text-muted-foreground">{sale.tipo}</p>
                  </div>
                </div>
              ))}
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
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Abierta</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base Inicial:</span>
                <span className="font-medium">$500,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ventas del Turno:</span>
                <span className="font-medium">$2,450,000</span>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium">Total en Caja:</span>
                <span className="text-xl font-bold text-primary">$2,950,000</span>
              </div>
              <Button className="w-full bg-transparent" variant="outline">
                Cerrar Caja
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
