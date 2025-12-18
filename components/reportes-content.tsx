"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, TrendingUp } from "lucide-react"

export function ReportesContent() {
  const ventasDiarias = [
    { dia: "Lunes", ventas: 1250000, transacciones: 12 },
    { dia: "Martes", ventas: 1850000, transacciones: 18 },
    { dia: "Miércoles", ventas: 2100000, transacciones: 21 },
    { dia: "Jueves", ventas: 1650000, transacciones: 15 },
    { dia: "Viernes", ventas: 2450000, transacciones: 24 },
    { dia: "Sábado", ventas: 3200000, transacciones: 32 },
    { dia: "Domingo", ventas: 1500000, transacciones: 14 },
  ]

  const productosTop = [
    { nombre: "Vestido de Noche", cantidad: 28, total: 6020000 },
    { nombre: "Chaqueta Cuero", cantidad: 15, total: 5250000 },
    { nombre: "Pantalón Clásico", cantidad: 42, total: 5250000 },
    { nombre: "Blusa Elegante", cantidad: 38, total: 3382000 },
    { nombre: "Falda Plisada", cantidad: 25, total: 1875000 },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Análisis y estadísticas de ventas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
          <CardDescription>Seleccione el período y tipo de reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="tipo-reporte">Tipo de Reporte</Label>
              <Select defaultValue="diario">
                <SelectTrigger id="tipo-reporte">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diario</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
              <Input id="fecha-inicio" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-fin">Fecha Fin</Label>
              <Input id="fecha-fin" type="date" />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Día (Semana Actual)</CardTitle>
            <CardDescription>Resumen de ventas diarias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ventasDiarias.map((dia, index) => (
                <div key={dia.dia} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{dia.dia}</p>
                      <p className="text-sm text-muted-foreground">{dia.transacciones} transacciones</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">${dia.ventas.toLocaleString("es-CO")}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>+5.2%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 5 productos del período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productosTop.map((producto, index) => (
                <div key={producto.nombre} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">{producto.cantidad} unidades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">${producto.total.toLocaleString("es-CO")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen General</CardTitle>
          <CardDescription>Estadísticas consolidadas del período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Ventas Totales</p>
              <p className="text-2xl font-bold text-primary">
                ${ventasDiarias.reduce((sum, d) => sum + d.ventas, 0).toLocaleString("es-CO")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {ventasDiarias.reduce((sum, d) => sum + d.transacciones, 0)} transacciones
              </p>
            </div>
            <div className="rounded-lg border bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Ventas Contado</p>
              <p className="text-2xl font-bold">$11,250,000</p>
              <p className="text-xs text-muted-foreground mt-1">78% del total</p>
            </div>
            <div className="rounded-lg border bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Ventas Crédito</p>
              <p className="text-2xl font-bold">$2,750,000</p>
              <p className="text-xs text-muted-foreground mt-1">22% del total</p>
            </div>
            <div className="rounded-lg border bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Ticket Promedio</p>
              <p className="text-2xl font-bold">$102,340</p>
              <p className="text-xs text-muted-foreground mt-1">por transacción</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
