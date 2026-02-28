"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart, Package, Users, FileText, BarChart3,
  TrendingUp, Calendar, Star, Clock,
  Activity, Tag, Percent, RotateCcw
} from "lucide-react"
import { SidebarToggle } from "./app-sidebar"

interface ReporteConfig {
  titulo: string
  descripcion: string
  icono: any
  ruta: string
  color: string
  bg: string
  categoria: "ventas" | "productos" | "clientes" | "periodo"
  frecuencia?: "diario" | "semanal" | "mensual"
}

export function ReportesGeneralesContent() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("todos")

  const reportes: ReporteConfig[] = [
    // Ventas
    {
      titulo: "Dashboard en Vivo",
      descripcion: "KPIs del período, ventas por día, método de pago y tendencias en tiempo real",
      icono: Activity,
      ruta: "/reportes",
      color: "text-primary",
      bg: "bg-primary/10",
      categoria: "ventas",
      frecuencia: "diario"
    },
    {
      titulo: "Ventas por Día",
      descripcion: "Historial diario de ventas con totales, transacciones y ticket promedio",
      icono: Calendar,
      ruta: "/reportes/ventas/general",
      color: "text-blue-600",
      bg: "bg-blue-100",
      categoria: "ventas",
      frecuencia: "diario"
    },
    {
      titulo: "Ventas por Vendedor",
      descripcion: "Comparativa de desempeño y ventas por cada usuario del sistema",
      icono: Users,
      ruta: "/reportes/administrativos/usuarios",
      color: "text-violet-600",
      bg: "bg-violet-100",
      categoria: "ventas",
      frecuencia: "semanal"
    },
    {
      titulo: "Ventas por Hora",
      descripcion: "Horarios pico de ventas para optimizar turnos y atención al cliente",
      icono: Clock,
      ruta: "/reportes/ventas/por-hora",
      color: "text-teal-600",
      bg: "bg-teal-100",
      categoria: "ventas",
      frecuencia: "semanal"
    },

    // Productos
    {
      titulo: "Productos Más Vendidos",
      descripcion: "Ranking de los productos con más unidades vendidas en el período",
      icono: ShoppingCart,
      ruta: "/reportes/ventas/productos",
      color: "text-green-600",
      bg: "bg-green-100",
      categoria: "productos",
      frecuencia: "semanal"
    },
    {
      titulo: "Productos Más Rentables",
      descripcion: "Los productos que generan mayor utilidad bruta y mejor margen de ganancia",
      icono: TrendingUp,
      ruta: "/reportes/ventas/rentabilidad",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      categoria: "productos",
      frecuencia: "mensual"
    },
    {
      titulo: "Productos Bajo Stock",
      descripcion: "Alertas de productos próximos a agotarse según stock mínimo configurado",
      icono: Package,
      ruta: "/reportes/inventario/bajo-stock",
      color: "text-red-600",
      bg: "bg-red-100",
      categoria: "productos",
      frecuencia: "diario"
    },
    {
      titulo: "Descuentos Aplicados",
      descripcion: "Análisis de descuentos otorgados: monto, frecuencia y productos afectados",
      icono: Percent,
      ruta: "/reportes/ventas/descuentos",
      color: "text-orange-600",
      bg: "bg-orange-100",
      categoria: "productos",
      frecuencia: "mensual"
    },

    // Clientes
    {
      titulo: "Clientes Frecuentes",
      descripcion: "Ranking de clientes por volumen de compras y visitas en el período",
      icono: Star,
      ruta: "/reportes/clientes/general",
      color: "text-pink-600",
      bg: "bg-pink-100",
      categoria: "clientes",
      frecuencia: "mensual"
    },
    {
      titulo: "Devoluciones y Cambios",
      descripcion: "Registro de devoluciones, cambios y motivos más frecuentes",
      icono: RotateCcw,
      ruta: "/reportes/ventas/devoluciones",
      color: "text-red-600",
      bg: "bg-red-100",
      categoria: "clientes",
      frecuencia: "semanal"
    },

    // Período
    {
      titulo: "Resumen Semanal",
      descripcion: "Comparativa de la semana actual vs semana anterior: ventas, utilidad y productos",
      icono: BarChart3,
      ruta: "/reportes/periodo/semanal",
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      categoria: "periodo",
      frecuencia: "semanal"
    },
    {
      titulo: "Categorías de Productos",
      descripcion: "Ventas y rentabilidad agrupadas por categoría de producto",
      icono: Tag,
      ruta: "/reportes/ventas/categorias",
      color: "text-cyan-600",
      bg: "bg-cyan-100",
      categoria: "periodo",
      frecuencia: "mensual"
    },
  ]

  const categorias = [
    { id: "todos", nombre: "Todos", color: "" },
    { id: "ventas", nombre: "Ventas", color: "bg-blue-100 text-blue-800" },
    { id: "productos", nombre: "Productos", color: "bg-green-100 text-green-800" },
    { id: "clientes", nombre: "Clientes", color: "bg-pink-100 text-pink-800" },
    { id: "periodo", nombre: "Por Período", color: "bg-indigo-100 text-indigo-800" },
  ]

  const reportesFiltrados = categoriaSeleccionada === "todos"
    ? reportes
    : reportes.filter(r => r.categoria === categoriaSeleccionada)

  const getBadgeFrecuencia = (frecuencia?: string) => {
    if (!frecuencia) return null
    const colores: Record<string, string> = {
      diario: "bg-red-100 text-red-800",
      semanal: "bg-yellow-100 text-yellow-800",
      mensual: "bg-blue-100 text-blue-800",
    }
    return (
      <Badge variant="secondary" className={colores[frecuencia]}>
        {frecuencia.charAt(0).toUpperCase() + frecuencia.slice(1)}
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Reportes Generales</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Análisis operacional de ventas, productos y clientes
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
              className={categoriaSeleccionada !== cat.id ? cat.color : ""}
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
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${reporte.bg}`}>
                      <Icon className={`h-5 w-5 ${reporte.color}`} />
                    </div>
                    {getBadgeFrecuencia(reporte.frecuencia)}
                  </div>
                  <CardTitle className="text-base mt-2">{reporte.titulo}</CardTitle>
                  <CardDescription className="text-sm">{reporte.descripcion}</CardDescription>
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

      {/* Leyenda de frecuencia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">💡 Frecuencia recomendada</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800">Diario</Badge>
            <span className="text-muted-foreground">Revisar todos los días</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-800">Semanal</Badge>
            <span className="text-muted-foreground">Revisar cada semana</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Mensual</Badge>
            <span className="text-muted-foreground">Revisar cada mes</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
