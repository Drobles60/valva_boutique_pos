"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, TrendingUp, Package, 
  FileText, BarChart3, PieChart, Calculator,
  CreditCard, Wallet, ClipboardList, AlertTriangle, FileCheck,
  Landmark, Scale, Receipt, BookOpen
} from "lucide-react"
import { SidebarToggle } from "./app-sidebar"

interface ReporteConfig {
  titulo: string
  descripcion: string
  icono: any
  ruta: string
  color: string
  categoria: "financiero" | "ventas" | "inventario" | "clientes" | "administrativo"
  recomendado?: "diario" | "semanal" | "mensual"
}

export function ReportesContablesContent() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("todos")

  const reportes: ReporteConfig[] = [
    // Reportes Financieros
    {
      titulo: "Estado de Resultados",
      descripcion: "Ingresos, egresos y utilidad del período",
      icono: BarChart3,
      ruta: "/reportes/financieros/estado-resultados",
      color: "text-green-600",
      categoria: "financiero",
      recomendado: "mensual"
    },
    {
      titulo: "Flujo de Caja",
      descripcion: "Movimientos de dinero detallados con saldo acumulado",
      icono: Wallet,
      ruta: "/reportes/financieros/flujo-caja",
      color: "text-blue-600",
      categoria: "financiero",
      recomendado: "mensual"
    },
    {
      titulo: "Ganancias",
      descripcion: "Análisis de rentabilidad por producto",
      icono: TrendingUp,
      ruta: "/reportes/financieros/ganancias",
      color: "text-yellow-600",
      categoria: "financiero",
      recomendado: "mensual"
    },
    {
      titulo: "Gastos",
      descripcion: "Análisis de gastos por categoría",
      icono: Calculator,
      ruta: "/reportes/financieros/gastos",
      color: "text-red-600",
      categoria: "financiero",
      recomendado: "mensual"
    },
    {
      titulo: "Diario de Caja",
      descripcion: "Reporte detallado de sesión de caja",
      icono: BookOpen,
      ruta: "/reportes/financieros/diario",
      color: "text-purple-600",
      categoria: "financiero",
      recomendado: "diario"
    },
    {
      titulo: "Balance General",
      descripcion: "Resumen de activos, pasivos y patrimonio del negocio",
      icono: Scale,
      ruta: "/reportes/financieros/balance",
      color: "text-emerald-600",
      categoria: "financiero",
      recomendado: "mensual"
    },
    {
      titulo: "Análisis de Márgenes",
      descripcion: "Márgenes de ganancia por categoría, producto y período",
      icono: TrendingUp,
      ruta: "/reportes/financieros/margenes",
      color: "text-amber-600",
      categoria: "financiero",
      recomendado: "mensual"
    },

    // Reportes de Ventas
    {
      titulo: "Formas de Pago",
      descripcion: "Distribución de ventas por método de pago",
      icono: CreditCard,
      ruta: "/reportes/ventas/formas-pago",
      color: "text-teal-600",
      categoria: "ventas",
      recomendado: "mensual"
    },
    {
      titulo: "Conciliación de Pagos",
      descripcion: "Cruce de efectivo, transferencias y cierres de caja",
      icono: Receipt,
      ruta: "/reportes/ventas/conciliacion",
      color: "text-indigo-600",
      categoria: "ventas",
      recomendado: "semanal"
    },
    {
      titulo: "Corte de Caja Mensual",
      descripcion: "Resumen consolidado mensual de todas las sesiones de caja",
      icono: Landmark,
      ruta: "/reportes/ventas/corte-mensual",
      color: "text-blue-600",
      categoria: "ventas",
      recomendado: "mensual"
    },

    // Reportes de Clientes
    {
      titulo: "Cartera de Créditos",
      descripcion: "Cuentas por cobrar y estado de créditos",
      icono: FileCheck,
      ruta: "/reportes/clientes/creditos",
      color: "text-orange-600",
      categoria: "clientes",
      recomendado: "semanal"
    },
    {
      titulo: "Estado de Cuenta",
      descripcion: "Movimientos y saldo por cliente",
      icono: FileText,
      ruta: "/reportes/clientes/estado-cuenta",
      color: "text-pink-600",
      categoria: "clientes",
      recomendado: "mensual"
    },
    {
      titulo: "Cuentas por Pagar",
      descripcion: "Deudas pendientes con proveedores y vencimientos",
      icono: DollarSign,
      ruta: "/reportes/clientes/cuentas-por-pagar",
      color: "text-red-600",
      categoria: "clientes",
      recomendado: "semanal"
    },

    // Reportes de Inventario
    {
      titulo: "Estado de Inventario",
      descripcion: "Stock actual y valorización",
      icono: Package,
      ruta: "/reportes/inventario/estado",
      color: "text-green-600",
      categoria: "inventario",
      recomendado: "semanal"
    },
    {
      titulo: "Movimientos de Inventario",
      descripcion: "Historial de entradas, salidas y ajustes",
      icono: ClipboardList,
      ruta: "/reportes/inventario/movimientos",
      color: "text-blue-600",
      categoria: "inventario",
      recomendado: "mensual"
    },
    {
      titulo: "Rotación de Inventario",
      descripcion: "Análisis de rotación y productos sin movimiento",
      icono: PieChart,
      ruta: "/reportes/inventario/rotacion",
      color: "text-purple-600",
      categoria: "inventario",
      recomendado: "mensual"
    },

    // Reportes Administrativos
    {
      titulo: "Diferencias de Caja",
      descripcion: "Análisis de cuadre y diferencias",
      icono: AlertTriangle,
      ruta: "/reportes/administrativos/diferencias",
      color: "text-red-600",
      categoria: "administrativo",
      recomendado: "semanal"
    },
    {
      titulo: "Proveedores",
      descripcion: "Compras y cuentas por pagar",
      icono: DollarSign,
      ruta: "/reportes/administrativos/proveedores",
      color: "text-amber-600",
      categoria: "administrativo",
      recomendado: "mensual"
    }
  ]

  const categorias = [
    { id: "todos", nombre: "Todos los Reportes", color: "bg-gray-100" },
    { id: "financiero", nombre: "Financieros", color: "bg-green-100 text-green-800" },
    { id: "ventas", nombre: "Ventas", color: "bg-blue-100 text-blue-800" },
    { id: "inventario", nombre: "Inventario", color: "bg-purple-100 text-purple-800" },
    { id: "clientes", nombre: "Clientes", color: "bg-pink-100 text-pink-800" },
    { id: "administrativo", nombre: "Administrativos", color: "bg-gray-100 text-gray-800" }
  ]

  const reportesFiltrados = categoriaSeleccionada === "todos" 
    ? reportes 
    : reportes.filter(r => r.categoria === categoriaSeleccionada)

  const getRecomendacionBadge = (recomendado?: string) => {
    if (!recomendado) return null
    
    const colores = {
      diario: "bg-red-100 text-red-800",
      semanal: "bg-yellow-100 text-yellow-800",
      mensual: "bg-blue-100 text-blue-800"
    }

    return (
      <Badge variant="secondary" className={colores[recomendado as keyof typeof colores]}>
        {recomendado.charAt(0).toUpperCase() + recomendado.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Reportes Contables</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Sistema completo de reportes financieros y análisis del negocio
            </p>
          </div>
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-wrap gap-2">
          {categorias.map(cat => (
            <Button
              key={cat.id}
              variant={categoriaSeleccionada === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaSeleccionada(cat.id)}
              className={categoriaSeleccionada === cat.id ? "" : cat.color}
            >
              {cat.nombre}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de reportes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportesFiltrados.map((reporte, index) => {
          const Icon = reporte.icono
          return (
            <Link key={index} href={reporte.ruta}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Icon className={`h-8 w-8 ${reporte.color}`} />
                    {getRecomendacionBadge(reporte.recomendado)}
                  </div>
                  <CardTitle className="text-lg">{reporte.titulo}</CardTitle>
                  <CardDescription className="text-sm">
                    {reporte.descripcion}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Reporte
                  </Button>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {reportesFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No hay reportes en esta categoría</h3>
          <p className="text-muted-foreground">Selecciona otra categoría para ver los reportes disponibles</p>
        </div>
      )}

      {/* Información adicional */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>💡 Recomendaciones de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800">Diario</Badge>
            <span>Reportes que debes revisar todos los días</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-800">Semanal</Badge>
            <span>Reportes recomendados cada semana</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Mensual</Badge>
            <span>Reportes para análisis mensual</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
