"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, Plus, Search, Edit, Trash2, TrendingUp, DollarSign } from "lucide-react"
import type { Product } from "@/lib/types"
import { getProducts, saveProduct, deleteProduct, getCurrentUser } from "@/lib/storage"

export function ProductosContent() {
  const [productos, setProductos] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentUser, setCurrentUser] = useState(getCurrentUser())

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    referencia: "",
    categoria: "",
    cantidad: "",
    precioCosto: "",
    precioVentaPublico: "",
    precioMayorista: "",
    precioEspecial: "",
    stockMinimo: "",
    proveedor: "",
  })

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = () => {
    setProductos(getProducts())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const product: Product = {
      id: editingProduct?.id || Date.now().toString(),
      codigo: formData.codigo,
      nombre: formData.nombre,
      referencia: formData.referencia,
      categoria: formData.categoria,
      cantidad: Number.parseFloat(formData.cantidad),
      precioCosto: Number.parseFloat(formData.precioCosto),
      precioVentaPublico: Number.parseFloat(formData.precioVentaPublico),
      precioMayorista: Number.parseFloat(formData.precioMayorista),
      precioEspecial: Number.parseFloat(formData.precioEspecial),
      stockMinimo: formData.stockMinimo ? Number.parseFloat(formData.stockMinimo) : undefined,
      proveedor: formData.proveedor || undefined,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    saveProduct(product)
    loadProductos()
    handleCloseDialog()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      codigo: product.codigo,
      nombre: product.nombre,
      referencia: product.referencia,
      categoria: product.categoria,
      cantidad: product.cantidad.toString(),
      precioCosto: product.precioCosto.toString(),
      precioVentaPublico: product.precioVentaPublico.toString(),
      precioMayorista: product.precioMayorista.toString(),
      precioEspecial: product.precioEspecial.toString(),
      stockMinimo: product.stockMinimo?.toString() || "",
      proveedor: product.proveedor || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este producto?")) {
      deleteProduct(id)
      loadProductos()
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingProduct(null)
    setFormData({
      codigo: "",
      nombre: "",
      referencia: "",
      categoria: "",
      cantidad: "",
      precioCosto: "",
      precioVentaPublico: "",
      precioMayorista: "",
      precioEspecial: "",
      stockMinimo: "",
      proveedor: "",
    })
  }

  const calcularMargen = (costo: number, venta: number) => {
    if (!costo || !venta) return 0
    return (((venta - costo) / costo) * 100).toFixed(2)
  }

  const filteredProductos = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalInventario = productos.reduce((sum, p) => sum + p.cantidad * p.precioCosto, 0)
  const totalProductos = productos.length
  const productosStockBajo = productos.filter((p) => p.stockMinimo && p.cantidad <= p.stockMinimo).length

  const canViewCosts = currentUser?.permisos.verCostos
  const canEditPrices = currentUser?.permisos.editarPrecios

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductos}</div>
            <p className="text-xs text-muted-foreground">{productosStockBajo} con stock bajo</p>
          </CardContent>
        </Card>
        {canViewCosts && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInventario.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Costo total</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productos.length > 0
                ? (
                    productos.reduce(
                      (sum, p) => sum + Number.parseFloat(calcularMargen(p.precioCosto, p.precioVentaPublico)),
                      0,
                    ) / productos.length
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Rentabilidad</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código, referencia o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {canEditPrices && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        )}
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
          <CardDescription>Gestión de productos con múltiples precios</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                {canViewCosts && <TableHead className="text-right">Costo</TableHead>}
                <TableHead className="text-right">P. Público</TableHead>
                <TableHead className="text-right">P. Mayorista</TableHead>
                <TableHead className="text-right">P. Especial</TableHead>
                {canViewCosts && <TableHead className="text-right">Margen</TableHead>}
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell className="font-medium">{producto.codigo}</TableCell>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.referencia}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{producto.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        producto.stockMinimo && producto.cantidad <= producto.stockMinimo
                          ? "text-red-600 font-semibold"
                          : ""
                      }
                    >
                      {producto.cantidad}
                    </span>
                  </TableCell>
                  {canViewCosts && (
                    <TableCell className="text-right">${producto.precioCosto.toLocaleString()}</TableCell>
                  )}
                  <TableCell className="text-right">${producto.precioVentaPublico.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${producto.precioMayorista.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${producto.precioEspecial.toLocaleString()}</TableCell>
                  {canViewCosts && (
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {calcularMargen(producto.precioCosto, producto.precioVentaPublico)}%
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEditPrices && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(producto)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(producto.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            <DialogDescription>Complete la información del producto con los tres precios de venta</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referencia">Referencia (Código de Barras) *</Label>
                  <Input
                    id="referencia"
                    value={formData.referencia}
                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Producto *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input
                    id="proveedor"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad en Stock *</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    step="0.01"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                  <Input
                    id="stockMinimo"
                    type="number"
                    step="0.01"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-[#D4AF37]">Precios</h4>

                <div className="space-y-2 mb-3">
                  <Label htmlFor="precioCosto">Precio Costo *</Label>
                  <Input
                    id="precioCosto"
                    type="number"
                    step="0.01"
                    value={formData.precioCosto}
                    onChange={(e) => setFormData({ ...formData, precioCosto: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="precioVentaPublico">Precio Público *</Label>
                    <Input
                      id="precioVentaPublico"
                      type="number"
                      step="0.01"
                      value={formData.precioVentaPublico}
                      onChange={(e) => setFormData({ ...formData, precioVentaPublico: e.target.value })}
                      required
                    />
                    {formData.precioCosto && formData.precioVentaPublico && (
                      <p className="text-xs text-muted-foreground">
                        Margen:{" "}
                        {calcularMargen(
                          Number.parseFloat(formData.precioCosto),
                          Number.parseFloat(formData.precioVentaPublico),
                        )}
                        %
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioMayorista">Precio Mayorista *</Label>
                    <Input
                      id="precioMayorista"
                      type="number"
                      step="0.01"
                      value={formData.precioMayorista}
                      onChange={(e) => setFormData({ ...formData, precioMayorista: e.target.value })}
                      required
                    />
                    {formData.precioCosto && formData.precioMayorista && (
                      <p className="text-xs text-muted-foreground">
                        Margen:{" "}
                        {calcularMargen(
                          Number.parseFloat(formData.precioCosto),
                          Number.parseFloat(formData.precioMayorista),
                        )}
                        %
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precioEspecial">Precio Especial *</Label>
                    <Input
                      id="precioEspecial"
                      type="number"
                      step="0.01"
                      value={formData.precioEspecial}
                      onChange={(e) => setFormData({ ...formData, precioEspecial: e.target.value })}
                      required
                    />
                    {formData.precioCosto && formData.precioEspecial && (
                      <p className="text-xs text-muted-foreground">
                        Margen:{" "}
                        {calcularMargen(
                          Number.parseFloat(formData.precioCosto),
                          Number.parseFloat(formData.precioEspecial),
                        )}
                        %
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">{editingProduct ? "Guardar Cambios" : "Agregar Producto"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
