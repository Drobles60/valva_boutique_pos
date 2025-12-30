"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ShoppingCart, Search } from "lucide-react"
import type { Product, Cliente } from "@/lib/types"
import { getProducts, getClientes, saveVenta } from "@/lib/storage"

type CartItem = {
  product: Product
  cantidad: number
  precioUnitario: number
  tipoCliente: "publico" | "mayorista" | "especial"
}

export function VentasContent() {
  const [carrito, setCarrito] = React.useState<CartItem[]>([])
  const [productos, setProductos] = React.useState<Product[]>([])
  const [clientes, setClientes] = React.useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [tipoVenta, setTipoVenta] = React.useState("contado")
  const [metodoPago, setMetodoPago] = React.useState("efectivo")
  const [clienteSeleccionado, setClienteSeleccionado] = React.useState<Cliente | null>(null)

  React.useEffect(() => {
    setProductos(getProducts())
    setClientes(getClientes())
  }, [])

  React.useEffect(() => {
    if (clienteSeleccionado) {
      setCarrito((prevCarrito) =>
        prevCarrito.map((item) => ({
          ...item,
          tipoCliente: clienteSeleccionado.tipoCliente,
          precioUnitario: getPrecioByTipo(item.product, clienteSeleccionado.tipoCliente),
        })),
      )
    }
  }, [clienteSeleccionado])

  const getPrecioByTipo = (product: Product, tipoCliente: "publico" | "mayorista" | "especial") => {
    if (product.descuento && product.precioConDescuento) {
      return product.precioConDescuento
    }
    switch (tipoCliente) {
      case "mayorista":
        return product.precioMayorista
      case "especial":
        return product.precioEspecial
      default:
        return product.precioVentaPublico
    }
  }

  const agregarProducto = (producto: Product) => {
    const tipoCliente = clienteSeleccionado?.tipoCliente || "publico"
    const precio = getPrecioByTipo(producto, tipoCliente)

    const existente = carrito.find((item) => item.product.id === producto.id)
    if (existente) {
      setCarrito(
        carrito.map((item) => (item.product.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)),
      )
    } else {
      setCarrito([
        ...carrito,
        {
          product: producto,
          cantidad: 1,
          precioUnitario: precio,
          tipoCliente,
        },
      ])
    }
  }

  const eliminarProducto = (id: string) => {
    setCarrito(carrito.filter((item) => item.product.id !== id))
  }

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad < 1) return
    setCarrito(carrito.map((item) => (item.product.id === id ? { ...item, cantidad } : item)))
  }

  const actualizarPrecio = (id: string, precio: number) => {
    if (precio < 0) return
    setCarrito(carrito.map((item) => (item.product.id === id ? { ...item, precioUnitario: precio } : item)))
  }

  const subtotal = carrito.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0)
  const total = subtotal

  const procesarVenta = () => {
    if (carrito.length === 0) return

    const venta = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      cliente: clienteSeleccionado || {
        id: "0",
        nombre: "Cliente General",
        identificacion: "N/A",
        telefono: "",
        tipoCliente: "publico" as const,
        limiteCredito: 0,
        saldoActual: 0,
        createdAt: new Date().toISOString(),
      },
      productos: carrito.map((item) => ({
        producto: item.product,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.precioUnitario * item.cantidad,
      })),
      subtotal,
      impuestos: 0,
      descuento: 0,
      total,
      metodoPago: [metodoPago],
      estado: tipoVenta === "credito" ? ("credito" as const) : ("completada" as const),
      vendedor: "Usuario",
    }

    saveVenta(venta)
    setCarrito([])
    alert("Venta procesada exitosamente")
  }

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referencia.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Punto de Venta</h1>
          <p className="text-muted-foreground">Sistema POS con múltiples precios</p>
        </div>
        <Button size="lg" disabled={carrito.length === 0} onClick={procesarVenta}>
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
                  <Input
                    className="pl-9"
                    placeholder="Buscar por nombre, código o referencia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productos Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              {productosFiltrados.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No se encontraron productos</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {productosFiltrados.map((producto) => {
                    const tipoCliente = clienteSeleccionado?.tipoCliente || "publico"
                    const precioActual = getPrecioByTipo(producto, tipoCliente)

                    return (
                      <div
                        key={producto.id}
                        className="flex flex-col rounded-lg border p-4 hover:bg-secondary cursor-pointer transition-colors"
                        onClick={() => agregarProducto(producto)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium">{producto.nombre}</p>
                            <p className="text-xs text-muted-foreground">{producto.codigo}</p>
                            {producto.descuento && (
                              <Badge variant="destructive" className="mt-1">
                                {producto.descuento}% OFF
                              </Badge>
                            )}
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => agregarProducto(producto)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Público:</span>
                            <span
                              className={
                                tipoCliente === "publico" ? "font-bold text-[#D4AF37]" : "text-muted-foreground"
                              }
                            >
                              ${producto.precioVentaPublico.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mayorista:</span>
                            <span
                              className={
                                tipoCliente === "mayorista" ? "font-bold text-[#D4AF37]" : "text-muted-foreground"
                              }
                            >
                              ${producto.precioMayorista.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Especial:</span>
                            <span
                              className={
                                tipoCliente === "especial" ? "font-bold text-[#D4AF37]" : "text-muted-foreground"
                              }
                            >
                              ${producto.precioEspecial.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <p className="font-bold text-primary text-lg">${precioActual.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {producto.cantidad} | {producto.categoria}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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
                    <div key={item.product.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.nombre}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.tipoCliente === "publico"
                                ? "Público"
                                : item.tipoCliente === "mayorista"
                                  ? "Mayorista"
                                  : "Especial"}
                            </Badge>
                            {item.product.descuento && (
                              <Badge variant="destructive" className="text-xs">
                                {item.product.descuento}% OFF
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => eliminarProducto(item.product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidad(item.product.id, item.cantidad - 1)}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => actualizarCantidad(item.product.id, Number.parseInt(e.target.value) || 1)}
                            className="h-8 w-12 text-center"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidad(item.product.id, item.cantidad + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Precio:</span>
                        <Input
                          type="number"
                          value={item.precioUnitario}
                          onChange={(e) => actualizarPrecio(item.product.id, Number.parseFloat(e.target.value) || 0)}
                          className="h-8 flex-1 text-sm"
                        />
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Subtotal:</span>
                        <span className="font-bold text-sm">
                          ${(item.precioUnitario * item.cantidad).toLocaleString()}
                        </span>
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
                <Label htmlFor="cliente">Cliente</Label>
                <Select
                  value={clienteSeleccionado?.id || ""}
                  onValueChange={(value) => {
                    const cliente = clientes.find((c) => c.id === value)
                    setClienteSeleccionado(cliente || null)
                  }}
                >
                  <SelectTrigger id="cliente">
                    <SelectValue placeholder="Cliente General (Precio Público)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Cliente General (Precio Público)</SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre} -{" "}
                        {cliente.tipoCliente === "publico"
                          ? "Público"
                          : cliente.tipoCliente === "mayorista"
                            ? "Mayorista"
                            : "Especial"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary">${total.toLocaleString()}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" disabled={carrito.length === 0} onClick={procesarVenta}>
                Finalizar Venta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
