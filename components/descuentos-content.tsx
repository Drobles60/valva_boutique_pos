"use client"

import { useState, useEffect } from "react"
import { Search, Percent, Save, X, Plus, Edit, Trash2, Tag, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { SidebarToggle } from "@/components/app-sidebar"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
import { formatCurrency, normalizeText } from "@/lib/utils"

interface Descuento {
  id: string
  nombre: string
  descripcion: string
  tipo: 'fijo' | 'porcentaje'
  valor: number
  fecha_inicio: string
  fecha_fin: string
  estado: 'activo' | 'inactivo'
  aplicable_a: 'productos' | 'tipos_prenda'
  productos?: any[]
  tipos_prenda?: any[]
}

export function DescuentosContent() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDescuento, setEditingDescuento] = useState<Descuento | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [descuentoToDelete, setDescuentoToDelete] = useState<string | null>(null)
  const [detallesDialogOpen, setDetallesDialogOpen] = useState(false)
  const [descuentoDetalles, setDescuentoDetalles] = useState<Descuento | null>(null)
  const [productos, setProductos] = useState<any[]>([])
  const [tiposPrenda, setTiposPrenda] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchProductoTerm, setSearchProductoTerm] = useState("")
  const [searchTipoPrendaTerm, setSearchTipoPrendaTerm] = useState("")
  const [productosSeleccionadosInfo, setProductosSeleccionadosInfo] = useState<Record<string, any>>({})

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "porcentaje" as 'fijo' | 'porcentaje',
    valor: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "activo" as 'activo' | 'inactivo',
    aplicable_a: "productos" as 'productos' | 'tipos_prenda',
    productos_seleccionados: [] as string[],
    tipos_prenda_seleccionados: [] as string[]
  })

  useEffect(() => {
    loadDescuentos()
    loadTiposPrenda()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProductos(searchProductoTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchProductoTerm])

  const loadDescuentos = async () => {
    try {
      const response = await fetch('/api/descuentos')
      if (response.ok) {
        const result = await response.json()
        setDescuentos(result.data || [])
      }
    } catch (error) {
      console.error('Error cargando descuentos:', error)
      toast.error('Error al cargar descuentos')
    }
  }

  const loadProductos = async (searchText: string = "") => {
    if (!searchText.trim()) {
      setProductos([])
      return
    }
    
    try {
      const response = await fetch('/api/productos')
      if (response.ok) {
        const result = await response.json()
        const allProductos = result.data || []
        
        const searchNormalized = normalizeText(searchText)
        const filtered = allProductos.filter((p: any) => 
          normalizeText(p.nombre || '').includes(searchNormalized) ||
          normalizeText(p.sku || '').includes(searchNormalized) ||
          normalizeText(p.codigo_barras || '').includes(searchNormalized)
        )
        setProductos(filtered)
      }
    } catch (error) {
      console.error('Error cargando productos:', error)
    }
  }

  const loadTiposPrenda = async () => {
    try {
      const response = await fetch('/api/tipos-prenda')
      if (response.ok) {
        const result = await response.json()
        setTiposPrenda(result.data || [])
      }
    } catch (error) {
      console.error('Error cargando tipos de prenda:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.valor) {
      toast.error('Completa los campos requeridos')
      return
    }

    // Validar que el porcentaje no exceda 100
    if (formData.tipo === 'porcentaje' && parseFloat(formData.valor) > 100) {
      toast.error('El porcentaje no puede ser mayor a 100%')
      return
    }

    // Validar que el porcentaje sea mayor a 0
    if (formData.tipo === 'porcentaje' && parseFloat(formData.valor) <= 0) {
      toast.error('El porcentaje debe ser mayor a 0%')
      return
    }

    if (formData.aplicable_a === 'productos' && formData.productos_seleccionados.length === 0) {
      toast.error('Selecciona al menos un producto')
      return
    }
    if (formData.aplicable_a === 'tipos_prenda' && formData.tipos_prenda_seleccionados.length === 0) {
      toast.error('Selecciona al menos un tipo de prenda')
      return
    }
 
    try {
      const body = {
        id: editingDescuento?.id,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        estado: formData.estado,
        aplicable_a: formData.aplicable_a,
        productos_seleccionados: formData.aplicable_a === 'productos' ? formData.productos_seleccionados : [],
        tipos_prenda_seleccionados: formData.aplicable_a === 'tipos_prenda' ? formData.tipos_prenda_seleccionados : []
      }

      const method = editingDescuento ? 'PUT' : 'POST'
      const response = await fetch('/api/descuentos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Error parseando JSON:', parseError)
        toast.error('Error de servidor - respuesta inválida')
        return
      }
      
      if (response.ok && result.success) {
        toast.success(editingDescuento ? 'Descuento actualizado' : 'Descuento creado')
        loadDescuentos()
        handleCloseDialog()
      } else {
        console.error('Error del servidor:', result)
        toast.error(result.error || 'Error al guardar descuento')
        if (result.details) {
          console.error('Detalles:', result.details)
          console.error('Código:', result.code)
        }
      }
    } catch (error) {
      console.error('Error completo:', error)
      toast.error('Error al guardar descuento')
    }
  }

  const handleEdit = (descuento: Descuento) => {
    setEditingDescuento(descuento)
    
    const productosIds = Array.isArray(descuento.productos) 
      ? descuento.productos.map((p: any) => typeof p === 'string' ? p : p.producto_id?.toString())
      : []
    
    const tiposPrendaIds = Array.isArray(descuento.tipos_prenda)
      ? descuento.tipos_prenda.map((t: any) => typeof t === 'string' ? t : t.tipo_prenda_id?.toString())
      : []

    const productosInfo = Array.isArray(descuento.productos)
      ? descuento.productos.reduce((acc: Record<string, any>, p: any) => {
          if (typeof p === 'string') {
            acc[p] = { id: p }
            return acc
          }

          const id = (p.producto_id ?? p.id)?.toString()
          if (!id) return acc

          acc[id] = {
            id,
            nombre: p.nombre || p.producto_nombre,
            sku: p.sku,
            codigo_barras: p.codigo_barras
          }
          return acc
        }, {})
      : {}
    
    setFormData({
      nombre: descuento.nombre || "",
      descripcion: descuento.descripcion || "",
      tipo: descuento.tipo,
      valor: descuento.valor.toString(),
      fecha_inicio: descuento.fecha_inicio || '',
      fecha_fin: descuento.fecha_fin || '',
      estado: descuento.estado,
      aplicable_a: descuento.aplicable_a,
      productos_seleccionados: productosIds,
      tipos_prenda_seleccionados: tiposPrendaIds
    })
    setProductosSeleccionadosInfo(productosInfo)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDescuentoToDelete(id)
    setConfirmDeleteOpen(true)
  }

  const handleVerDetalles = (descuento: Descuento) => {
    setDescuentoDetalles(descuento)
    setDetallesDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (descuentoToDelete) {
      try {
        const response = await fetch(`/api/descuentos?id=${descuentoToDelete}`, {
          method: 'DELETE'
        })

        const result = await response.json()

        if (response.ok) {
          toast.success('Descuento eliminado correctamente')
          loadDescuentos()
        } else {
          console.error('Error del servidor:', result)
          toast.error(result.error || 'Error al eliminar descuento')
          if (result.details) {
            console.error('Detalles:', result.details)
          }
        }
      } catch (error) {
        console.error('Error completo:', error)
        toast.error('Error al eliminar descuento')
      }
      setDescuentoToDelete(null)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingDescuento(null)
    setSearchProductoTerm("")
    setSearchTipoPrendaTerm("")
    setProductosSeleccionadosInfo({})
    setFormData({
      nombre: "",
      descripcion: "",
      tipo: "porcentaje",
      valor: "",
      fecha_inicio: "",
      fecha_fin: "",
      estado: "activo",
      aplicable_a: "productos",
      productos_seleccionados: [],
      tipos_prenda_seleccionados: []
    })
  }

  const toggleProducto = (productoId: string) => {
    const productoActual = productos.find((p: any) => p.id?.toString() === productoId)

    setFormData(prev => {
      const yaSeleccionado = prev.productos_seleccionados.includes(productoId)

      if (yaSeleccionado) {
        setProductosSeleccionadosInfo((prevInfo) => {
          const nextInfo = { ...prevInfo }
          delete nextInfo[productoId]
          return nextInfo
        })

        return {
          ...prev,
          productos_seleccionados: prev.productos_seleccionados.filter(id => id !== productoId)
        }
      }

      if (productoActual) {
        setProductosSeleccionadosInfo((prevInfo) => ({
          ...prevInfo,
          [productoId]: {
            id: productoId,
            nombre: productoActual.nombre,
            sku: productoActual.sku,
            codigo_barras: productoActual.codigo_barras
          }
        }))
      }

      return {
        ...prev,
        productos_seleccionados: [...prev.productos_seleccionados, productoId]
      }
    })
  }

  const toggleTipoPrenda = (tipoId: string) => {
    setFormData(prev => ({
      ...prev,
      tipos_prenda_seleccionados: prev.tipos_prenda_seleccionados.includes(tipoId)
        ? prev.tipos_prenda_seleccionados.filter(id => id !== tipoId)
        : [...prev.tipos_prenda_seleccionados, tipoId]
    }))
  }

  const filteredDescuentos = descuentos.filter(d =>
    normalizeText(d.nombre).includes(normalizeText(searchTerm)) ||
    normalizeText(d.descripcion).includes(normalizeText(searchTerm))
  )

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gestión de Descuentos</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Crea descuentos fijos o porcentuales para productos o tipos de prenda
            </p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Descuento
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar descuentos por nombre..."
              className="pl-9 pr-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 md:h-7 md:w-7"
                onClick={() => setSearchTerm("")}
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Descuentos Activos</CardTitle>
          <CardDescription>{filteredDescuentos.length} descuento(s) registrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Aplica a</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDescuentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay descuentos registrados
                  </TableCell>
                </TableRow>
              ) : (
                filteredDescuentos.map((descuento) => (
                  <TableRow key={descuento.id}>
                    <TableCell className="font-medium">{descuento.nombre}</TableCell>
                    <TableCell>
                      <Badge variant={descuento.tipo === 'porcentaje' ? 'default' : 'secondary'}>
                        {descuento.tipo === 'porcentaje' ? 'Porcentaje' : 'Fijo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {descuento.tipo === 'porcentaje' 
                        ? `${Number(descuento.valor).toFixed(0)}% de descuento` 
                        : `Precio fijo: $${formatCurrency(Number(descuento.valor))}`}
                    </TableCell>
                    <TableCell>
                      {descuento.aplicable_a === 'productos' ? (
                        <span className="text-sm">
                          {descuento.productos?.length || 0} producto(s)
                        </span>
                      ) : (
                        <span className="text-sm">
                          {descuento.tipos_prenda?.length || 0} tipo(s) de prenda
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {descuento.fecha_inicio && descuento.fecha_fin ? (
                        <>
                          {new Date(descuento.fecha_inicio).toLocaleDateString()} -{' '}
                          {new Date(descuento.fecha_fin).toLocaleDateString()}
                        </>
                      ) : (
                        'Sin límite'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={descuento.estado === 'activo' ? 'default' : 'secondary'}>
                        {descuento.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleVerDetalles(descuento)} title="Ver Detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(descuento)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(descuento.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar descuento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDescuento ? 'Editar Descuento' : 'Nuevo Descuento'}</DialogTitle>
            <DialogDescription>
              Define los parámetros del descuento y selecciona a qué se aplicará
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Descuento *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Descuento Temporada"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                className="uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el descuento..."
                value={formData.descripcion || ""}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value.toUpperCase() })}
                className="uppercase"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Descuento *</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                    <SelectItem value="fijo">Precio Fijo ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">
                  {formData.tipo === 'porcentaje' ? 'Porcentaje de Descuento * (máx. 100)' : 'Precio Final del Producto *'}
                </Label>
                <Input
                  id="valor"
                  type="text"
                  inputMode={formData.tipo === 'porcentaje' ? 'decimal' : 'numeric'}
                  placeholder={formData.tipo === 'porcentaje' ? '20' : '80.000'}
                  value={formData.tipo === 'porcentaje' ? formData.valor : (formData.valor ? formatCurrency(formData.valor) : '')}
                  onChange={(e) => {
                    if (formData.tipo === 'porcentaje') {
                      const raw = e.target.value.replace(',', '.')
                      let value = raw.replace(/[^0-9.]/g, '')

                      const firstDot = value.indexOf('.')
                      if (firstDot !== -1) {
                        value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, '')
                      }

                      if (value.includes('.')) {
                        const [entero, decimal = ''] = value.split('.')
                        value = `${entero}.${decimal.slice(0, 2)}`
                      }

                      if (value) {
                        const numericValue = parseFloat(value)
                        if (!Number.isNaN(numericValue) && numericValue > 100) {
                          value = '100'
                        }
                      }

                      setFormData({ ...formData, valor: value })
                    } else {
                      const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                      setFormData({ ...formData, valor: value })
                    }
                  }}
                  onFocus={(e) => {
                    if (formData.tipo === 'fijo' && formData.valor) {
                      e.target.value = formData.valor
                    }
                  }}
                  onBlur={(e) => {
                    if (formData.tipo === 'fijo' && formData.valor) {
                      e.target.value = formatCurrency(formData.valor)
                    }
                  }}
                  min="0"
                  max={formData.tipo === 'porcentaje' ? '100' : undefined}
                  step={formData.tipo === 'porcentaje' ? '0.1' : '1'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_fin">Fecha Fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aplicable_a">Aplicar a *</Label>
              <Select
                value={formData.aplicable_a}
                onValueChange={(value: any) => setFormData({ ...formData, aplicable_a: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="productos">Productos Específicos</SelectItem>
                  <SelectItem value="tipos_prenda">Tipos de Prenda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.aplicable_a === 'productos' && (
              <div className="space-y-2">
                <Label>Seleccionar Productos</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, referencia o código..."
                    className="pl-9 pr-9"
                    value={searchProductoTerm}
                    onChange={(e) => setSearchProductoTerm(e.target.value)}
                  />
                  {searchProductoTerm && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 md:h-7 md:w-7"
                      onClick={() => setSearchProductoTerm("")}
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                  {productos.length === 0 && searchProductoTerm.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Escribe para buscar productos...
                    </p>
                  ) : productos.length === 0 && searchProductoTerm.length > 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No se encontraron productos
                    </p>
                  ) : (
                    productos.map((producto) => {
                      const precioOriginal = Number(producto.precio_venta) || 0
                      let precioFinal = precioOriginal
                      let descuento = 0
                      
                      if (formData.valor && formData.productos_seleccionados.includes(producto.id.toString())) {
                        if (formData.tipo === 'porcentaje') {
                          descuento = (precioOriginal * Number(formData.valor)) / 100
                          precioFinal = precioOriginal - descuento
                        } else if (formData.tipo === 'fijo') {
                          precioFinal = Number(formData.valor)
                          descuento = precioOriginal - precioFinal
                        }
                      }
                      
                      return (
                        <div key={producto.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`producto-${producto.id}`}
                            checked={formData.productos_seleccionados.includes(producto.id.toString())}
                            onChange={() => toggleProducto(producto.id.toString())}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`producto-${producto.id}`} className="text-sm flex-1 cursor-pointer">
                            <div className="flex flex-col">
                              <span>{producto.nombre} - {producto.sku || producto.codigo_barras || 'Sin SKU'}</span>
                              {formData.valor && formData.productos_seleccionados.includes(producto.id.toString()) && (
                                <span className="text-xs text-muted-foreground mt-1">
                                  <span className="line-through">${formatCurrency(precioOriginal)}</span>
                                  <span className="text-green-600 font-semibold ml-2">
                                    ${formatCurrency(precioFinal)}
                                  </span>
                                  <span className="text-red-600 ml-2">
                                    (-${formatCurrency(descuento)})
                                  </span>
                                </span>
                              )}
                            </div>
                          </label>
                        </div>
                      )
                    })
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.productos_seleccionados.length} producto(s) seleccionado(s)
                </p>

                {formData.productos_seleccionados.length > 0 && (
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    <p className="text-sm font-medium">Productos seleccionados:</p>
                    {formData.productos_seleccionados.map((productoId) => {
                      const productoSeleccionado = productosSeleccionadosInfo[productoId] ||
                        productos.find((p: any) => p.id?.toString() === productoId)

                      const referencia = productoSeleccionado?.sku || productoSeleccionado?.codigo_barras || 'Sin SKU'
                      const nombre = productoSeleccionado?.nombre || `Producto ID ${productoId}`

                      return (
                        <div key={`seleccionado-${productoId}`} className="flex items-center justify-between gap-2">
                          <span className="text-sm text-muted-foreground">
                            {nombre} - {referencia}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => toggleProducto(productoId)}
                            aria-label={`Quitar ${nombre}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {formData.aplicable_a === 'tipos_prenda' && (
              <div className="space-y-2">
                <Label>Seleccionar Tipos de Prenda</Label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tipo de prenda..."
                    value={searchTipoPrendaTerm}
                    onChange={(e) => setSearchTipoPrendaTerm(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {searchTipoPrendaTerm && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 md:h-7 md:w-7"
                      onClick={() => setSearchTipoPrendaTerm("")}
                      aria-label="Limpiar búsqueda de tipos de prenda"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                  {tiposPrenda
                    .filter((tipo) => 
                      normalizeText(tipo.nombre || '').includes(normalizeText(searchTipoPrendaTerm))
                    )
                    .map((tipo) => (
                    <div key={tipo.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`tipo-${tipo.id}`}
                        checked={formData.tipos_prenda_seleccionados.includes(tipo.id.toString())}
                        onChange={() => toggleTipoPrenda(tipo.id.toString())}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`tipo-${tipo.id}`} className="text-sm flex-1 cursor-pointer">
                        {tipo.nombre}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.tipos_prenda_seleccionados.length} tipo(s) seleccionado(s)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              {editingDescuento ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalles */}
      <Dialog open={detallesDialogOpen} onOpenChange={setDetallesDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto w-[98vw] sm:w-[95vw] lg:w-full">
          <DialogHeader>
            <DialogTitle>Detalles del Descuento</DialogTitle>
            <DialogDescription>
              Información completa del descuento y productos/tipos de prenda aplicables
            </DialogDescription>
          </DialogHeader>

          {descuentoDetalles && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Nombre</Label>
                      <p className="font-medium">{descuentoDetalles.nombre}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Tipo</Label>
                      <div className="mt-1">
                        <Badge variant={descuentoDetalles.tipo === 'porcentaje' ? 'default' : 'secondary'}>
                          {descuentoDetalles.tipo === 'porcentaje' ? 'Porcentaje' : 'Precio Fijo'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Valor</Label>
                      <p className="font-medium text-lg">
                        {descuentoDetalles.tipo === 'porcentaje' 
                          ? `${descuentoDetalles.valor}% de descuento` 
                          : `Precio final: $${formatCurrency(descuentoDetalles.valor)}`}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Estado</Label>
                      <div className="mt-1">
                        <Badge variant={descuentoDetalles.estado === 'activo' ? 'default' : 'secondary'}>
                          {descuentoDetalles.estado}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Fecha Inicio</Label>
                      <p className="font-medium">
                        {descuentoDetalles.fecha_inicio 
                          ? new Date(descuentoDetalles.fecha_inicio).toLocaleDateString()
                          : 'Sin fecha'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Fecha Fin</Label>
                      <p className="font-medium">
                        {descuentoDetalles.fecha_fin 
                          ? new Date(descuentoDetalles.fecha_fin).toLocaleDateString()
                          : 'Sin fecha'}
                      </p>
                    </div>
                  </div>
                  {descuentoDetalles.descripcion && (
                    <div>
                      <Label className="text-muted-foreground">Descripción</Label>
                      <p className="mt-1">{descuentoDetalles.descripcion}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {descuentoDetalles.aplicable_a === 'productos' 
                      ? 'Productos Aplicables' 
                      : 'Tipos de Prenda Aplicables'}
                  </CardTitle>
                  <CardDescription>
                    {descuentoDetalles.aplicable_a === 'productos'
                      ? `${descuentoDetalles.productos?.length || 0} producto(s) con este descuento`
                      : `${descuentoDetalles.tipos_prenda?.length || 0} tipo(s) de prenda con este descuento`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {descuentoDetalles.aplicable_a === 'productos' ? (
                    <div className="space-y-2">
                      {descuentoDetalles.productos && descuentoDetalles.productos.length > 0 ? (
                        <div className="overflow-x-auto -mx-2 px-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[100px] whitespace-nowrap">Código</TableHead>
                              <TableHead className="min-w-[80px] whitespace-nowrap">SKU</TableHead>
                              <TableHead className="min-w-[150px] whitespace-nowrap">Nombre</TableHead>
                              <TableHead className="text-right min-w-[100px] whitespace-nowrap">Precio</TableHead>
                              <TableHead className="text-right min-w-[120px] whitespace-nowrap">Precio c/ Desc.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {descuentoDetalles.productos.map((producto: any) => {
                              const precioOriginal = producto.precio_venta || 0
                              const precioConDescuento = descuentoDetalles.tipo === 'porcentaje'
                                ? precioOriginal - (precioOriginal * descuentoDetalles.valor / 100)
                                : descuentoDetalles.valor
                              
                              return (
                                <TableRow key={producto.producto_id || producto.id}>
                                  <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap">
                                    {producto.codigo_barras || 'N/A'}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap">
                                    {producto.sku || 'N/A'}
                                  </TableCell>
                                  <TableCell className="font-medium text-sm">
                                    {producto.nombre || 'Sin nombre'}
                                  </TableCell>
                                  <TableCell className="text-right text-sm whitespace-nowrap">
                                    ${formatCurrency(precioOriginal)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-green-600 text-sm whitespace-nowrap">
                                    ${formatCurrency(Math.max(0, precioConDescuento))}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No hay productos asociados a este descuento
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {descuentoDetalles.tipos_prenda && descuentoDetalles.tipos_prenda.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {descuentoDetalles.tipos_prenda.map((tipo: any) => (
                            <div 
                              key={tipo.tipo_prenda_id || tipo.id} 
                              className="border rounded-lg p-3 flex items-center gap-3"
                            >
                              <Tag className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{tipo.nombre || 'Sin nombre'}</p>
                                {tipo.descripcion && (
                                  <p className="text-sm text-muted-foreground">{tipo.descripcion}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No hay tipos de prenda asociados a este descuento
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetallesDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar descuento?"
        description="Esta acción no se puede deshacer. El descuento será eliminado permanentemente."
      />
    </div>
  )
}
