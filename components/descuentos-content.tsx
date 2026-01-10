"use client"

import { useState } from "react"
import { Search, Percent, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarToggle } from "@/components/app-sidebar"
import { toast } from "sonner"

// Mock data de productos
const mockProductos = [
  { id: 1, nombre: "Vestido Floral", codigo: "VF001", referencia: "7891234567890", precioOriginal: 150000, stock: 5 },
  { id: 2, nombre: "Blusa Blanca", codigo: "BB002", referencia: "7891234567891", precioOriginal: 80000, stock: 8 },
  { id: 3, nombre: "Pantalón Negro", codigo: "PN003", referencia: "7891234567892", precioOriginal: 120000, stock: 3 },
  { id: 4, nombre: "Chaqueta Cuero", codigo: "CC004", referencia: "7891234567893", precioOriginal: 350000, stock: 2 },
]

export function DescuentosContent() {
  const [busqueda, setBusqueda] = useState("")
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null)
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState("")
  const [precioConDescuento, setPrecioConDescuento] = useState("")
  const [productosConDescuento, setProductosConDescuento] = useState<any[]>([])

  // Buscar producto por código o referencia
  const buscarProducto = () => {
    const producto = mockProductos.find(
      (p) => p.codigo.toLowerCase() === busqueda.toLowerCase() || p.referencia === busqueda,
    )

    if (producto) {
      setProductoSeleccionado(producto)
      setPrecioConDescuento(producto.precioOriginal.toString())
      setDescuentoPorcentaje("")
    } else {
      toast.error("Producto no encontrado", {
        description: "Verifica el código o referencia del producto"
      })
      setProductoSeleccionado(null)
    }
  }

  // Calcular precio con descuento al cambiar el porcentaje
  const calcularDescuento = (porcentaje: string) => {
    setDescuentoPorcentaje(porcentaje)
    if (productoSeleccionado && porcentaje) {
      const desc = Number.parseFloat(porcentaje)
      if (!isNaN(desc) && desc >= 0 && desc <= 100) {
        const precioFinal = productoSeleccionado.precioOriginal * (1 - desc / 100)
        setPrecioConDescuento(Math.round(precioFinal).toString())
      }
    }
  }

  // Aplicar descuento
  const aplicarDescuento = () => {
    if (!productoSeleccionado || !precioConDescuento) return

    const precioFinal = Number.parseFloat(precioConDescuento)
    const descPorcentaje = descuentoPorcentaje
      ? Number.parseFloat(descuentoPorcentaje)
      : ((productoSeleccionado.precioOriginal - precioFinal) / productoSeleccionado.precioOriginal) * 100

    const nuevoProducto = {
      ...productoSeleccionado,
      precioConDescuento: precioFinal,
      descuentoPorcentaje: Math.round(descPorcentaje * 100) / 100,
      fechaAplicacion: new Date().toLocaleDateString(),
    }

    // Actualizar o agregar producto con descuento
    const existe = productosConDescuento.findIndex((p) => p.id === productoSeleccionado.id)
    if (existe >= 0) {
      const nuevaLista = [...productosConDescuento]
      nuevaLista[existe] = nuevoProducto
      setProductosConDescuento(nuevaLista)
    } else {
      setProductosConDescuento([...productosConDescuento, nuevoProducto])
    }

    // Limpiar formulario
    setBusqueda("")
    setProductoSeleccionado(null)
    setDescuentoPorcentaje("")
    setPrecioConDescuento("")
  }

  // Quitar descuento
  const quitarDescuento = (id: number) => {
    setProductosConDescuento(productosConDescuento.filter((p) => p.id !== id))
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gestión de Descuentos</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Busca productos por código o referencia para aplicar descuentos especiales
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {/* Formulario de búsqueda y aplicación */}
        <Card>
          <CardHeader>
            <CardTitle>Aplicar Descuento</CardTitle>
            <CardDescription>Busca el producto y define el descuento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="busqueda">Código o Referencia</Label>
              <div className="flex gap-2">
                <Input
                  id="busqueda"
                  placeholder="Ingresa código o código de barras"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && buscarProducto()}
                />
                <Button onClick={buscarProducto} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Información del producto */}
            {productoSeleccionado && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">Producto Encontrado</p>
                  <p className="text-lg font-bold">{productoSeleccionado.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    Código: {productoSeleccionado.codigo} | Ref: {productoSeleccionado.referencia}
                  </p>
                </div>

                <div className="grid gap-3">
                  <div>
                    <Label className="text-xs">Precio Original</Label>
                    <p className="text-xl font-bold text-primary">
                      ${productoSeleccionado.precioOriginal.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descuento">Descuento (%)</Label>
                    <div className="relative">
                      <Input
                        id="descuento"
                        type="number"
                        placeholder="0"
                        value={descuentoPorcentaje}
                        onChange={(e) => calcularDescuento(e.target.value)}
                        min="0"
                        max="100"
                      />
                      <Percent className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioFinal">Precio Final</Label>
                    <Input
                      id="precioFinal"
                      type="number"
                      value={precioConDescuento}
                      onChange={(e) => setPrecioConDescuento(e.target.value)}
                      placeholder="Precio con descuento"
                    />
                  </div>

                  <Button onClick={aplicarDescuento} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Aplicar Descuento
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de productos con descuento */}
        <Card>
          <CardHeader>
            <CardTitle>Productos con Descuento Activo</CardTitle>
            <CardDescription>{productosConDescuento.length} producto(s) con descuento</CardDescription>
          </CardHeader>
          <CardContent>
            {productosConDescuento.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Percent className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No hay productos con descuento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productosConDescuento.map((producto) => (
                  <div key={producto.id} className="rounded-lg border bg-card p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{producto.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {producto.codigo} | {producto.referencia}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => quitarDescuento(producto.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Original</p>
                        <p className="line-through">${producto.precioOriginal.toLocaleString()}</p>
                      </div>
                      <Badge variant="secondary">-{producto.descuentoPorcentaje}%</Badge>
                      <div>
                        <p className="text-xs text-muted-foreground">Con descuento</p>
                        <p className="font-bold text-primary">${producto.precioConDescuento.toLocaleString()}</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">Aplicado: {producto.fechaAplicacion}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla completa de productos con descuento */}
      {productosConDescuento.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Descuentos</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="text-right">Precio Original</TableHead>
                  <TableHead className="text-center">Descuento</TableHead>
                  <TableHead className="text-right">Precio Final</TableHead>
                  <TableHead className="text-right">Ahorro</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosConDescuento.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="font-medium">{producto.nombre}</TableCell>
                    <TableCell>{producto.codigo}</TableCell>
                    <TableCell className="font-mono text-xs">{producto.referencia}</TableCell>
                    <TableCell className="text-right">${producto.precioOriginal.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">-{producto.descuentoPorcentaje}%</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      ${producto.precioConDescuento.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      ${(producto.precioOriginal - producto.precioConDescuento).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => quitarDescuento(producto.id)}>
                        Quitar
                      </Button>
                    </TableCell>
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
