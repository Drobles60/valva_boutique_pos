"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ShoppingCart, Search } from "lucide-react"

type CartItem = {
  id: string
  nombre: string
  precio: number
  cantidad: number
}

export function VentasContent() {
  const [carrito, setCarrito] = React.useState<CartItem[]>([])
  const [tipoVenta, setTipoVenta] = React.useState("contado")
  const [metodoPago, setMetodoPago] = React.useState("efectivo")

  const productosDisponibles = [
    { id: "P001", nombre: "Blusa Elegante", precio: 89000 },
    { id: "P002", nombre: "Pantalón Clásico", precio: 125000 },
    { id: "P003", nombre: "Vestido de Noche", precio: 215000 },
    { id: "P004", nombre: "Chaqueta Cuero", precio: 350000 },
    { id: "P005", nombre: "Falda Plisada", precio: 75000 },
  ]

  const agregarProducto = (producto: (typeof productosDisponibles)[0]) => {
    const existente = carrito.find((item) => item.id === producto.id)
    if (existente) {
      setCarrito(carrito.map((item) => (item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)))
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
  }

  const eliminarProducto = (id: string) => {
    setCarrito(carrito.filter((item) => item.id !== id))
  }

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad < 1) return
    setCarrito(carrito.map((item) => (item.id === id ? { ...item, cantidad } : item)))
  }

  const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const total = subtotal

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Punto de Venta</h1>
          <p className="text-muted-foreground">Sistema POS para ventas rápidas</p>
        </div>
        <Button size="lg" disabled={carrito.length === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Procesar Venta
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Búsqueda de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Buscar por nombre o código..." />
                </div>
                <Button variant="outline">Buscar</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productos Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {productosDisponibles.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-secondary cursor-pointer transition-colors"
                    onClick={() => agregarProducto(producto)}
                  >
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">{producto.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${producto.precio.toLocaleString("es-CO")}</p>
                      <Button size="sm" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Carrito de Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No hay productos en el carrito</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {carrito.map((item) => (
                    <div key={item.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.nombre}</p>
                          <p className="text-xs text-muted-foreground">${item.precio.toLocaleString("es-CO")}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => eliminarProducto(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => actualizarCantidad(item.id, Number.parseInt(e.target.value) || 1)}
                          className="h-8 w-16 text-center"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        >
                          +
                        </Button>
                        <div className="ml-auto font-bold text-sm">
                          ${(item.precio * item.cantidad).toLocaleString("es-CO")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo-venta">Tipo de Venta</Label>
                <Select value={tipoVenta} onValueChange={setTipoVenta}>
                  <SelectTrigger id="tipo-venta">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contado">Contado</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {tipoVenta === "contado" && (
                <div className="space-y-2">
                  <Label htmlFor="metodo-pago">Método de Pago</Label>
                  <Select value={metodoPago} onValueChange={setMetodoPago}>
                    <SelectTrigger id="metodo-pago">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {tipoVenta === "credito" && (
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select>
                    <SelectTrigger id="cliente">
                      <SelectValue placeholder="Seleccione cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c1">María González</SelectItem>
                      <SelectItem value="c2">Juan Pérez</SelectItem>
                      <SelectItem value="c3">Ana Martínez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="font-medium">${subtotal.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary">${total.toLocaleString("es-CO")}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" disabled={carrito.length === 0}>
                Finalizar Venta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
