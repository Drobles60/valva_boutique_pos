"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp, BarChart3, PieChart, Users,
  Package, ArrowLeftRight, Target, Layers, ArrowLeft
} from "lucide-react"
import { SidebarToggle } from "./app-sidebar"

interface ReporteConfig {
  titulo: string
  descripcion: string
  detalle: string[]
  icono: any
  ruta: string
  color: string
  bgColor: string
  categoria: "ventas" | "clientes" | "inventario"
}

export function EstadisticasAvanzadasContent() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("todos")

  const reportes: ReporteConfig[] = [
    {
      titulo: "Tendencias de Ventas",
      descripcion: "Evolución y patrones de ventas",
      detalle: ["Gráficos de línea temporal", "Promedios móviles", "Comparativa interperiodos", "Proyecciones"],
      icono: TrendingUp,
      ruta: "/reportes/estadisticas/tendencias",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      categoria: "ventas",
    },
    {
      titulo: "Comparativas por Período",
      descripcion: "Análisis comparativo entre rangos de fechas",
      detalle: ["Período vs período anterior", "Variaciones porcentuales", "Gráficos de barras comparativos", "Métricas clave"],
      icono: ArrowLeftRight,
      ruta: "/reportes/estadisticas/comparativas",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      categoria: "ventas",
    },
    {
      titulo: "Análisis de Clientes",
      descripcion: "Comportamiento y segmentación de clientes",
      detalle: ["Clientes más frecuentes", "Mayor ticket promedio", "Segmentación por gasto", "Retención"],
      icono: Users,
      ruta: "/reportes/estadisticas/clientes",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      categoria: "clientes",
    },
    {
      titulo: "Rotación de Inventario",
      descripcion: "Análisis visual de movimiento de productos",
      detalle: ["Productos más vendidos", "Sin movimiento", "Velocidad de rotación", "Distribución por categoría"],
      icono: Package,
      ruta: "/reportes/estadisticas/rotacion",
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      categoria: "inventario",
    },
  ]

  const categorias = [
    { id: "todos", nombre: "Todos", color: "bg-gray-100" },
    { id: "ventas", nombre: "Ventas", color: "bg-blue-100 text-blue-800" },
    { id: "clientes", nombre: "Clientes", color: "bg-purple-100 text-purple-800" },
    { id: "inventario", nombre: "Inventario", color: "bg-amber-100 text-amber-800" },
  ]

  const reportesFiltrados = categoriaSeleccionada === "todos"
    ? reportes
    : reportes.filter(r => r.categoria === categoriaSeleccionada)

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Link href="/reportes">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <SidebarToggle />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Estadísticas Avanzadas</h1>
              <Badge variant="outline" className="text-emerald-600 border-emerald-300">Análisis detallados</Badge>
            </div>
            <p className="text-sm text-muted-foreground md:text-base mt-1">
              Métricas adicionales, gráficas comparativas y análisis de tendencias de tu negocio.
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
      <div className="grid gap-6 md:grid-cols-2">
        {reportesFiltrados.map((reporte, index) => {
          const Icon = reporte.icono
          return (
            <Link key={index} href={reporte.ruta}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-emerald-200">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl ${reporte.bgColor}`}>
                      <Icon className={`h-6 w-6 ${reporte.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{reporte.titulo}</CardTitle>
                      <CardDescription>{reporte.descripcion}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {reporte.detalle.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Estadísticas
                  </Button>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {reportesFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No hay estadísticas en esta categoría</h3>
          <p className="text-muted-foreground">Selecciona otra categoría para ver las disponibles</p>
        </div>
      )}

      {/* Info */}
      <Card className="mt-2 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/10">
        <CardHeader>
          <CardTitle className="text-base">📊 Sobre las Estadísticas Avanzadas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>Todos los reportes incluyen gráficos interactivos, filtros personalizables y exportación a PDF/CSV.</p>
          <p>Selecciona rangos de fechas, filtra por categorías o productos y elige el tipo de visualización.</p>
        </CardContent>
      </Card>
    </div>
  )
}
