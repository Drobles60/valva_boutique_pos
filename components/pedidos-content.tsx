// @ts-nocheck
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Eye, ShoppingBag, Package, CheckCircle, Clock, X } from "lucide-react"
import { SidebarToggle } from "./app-sidebar"
import { toast } from "sonner"

type Proveedor = {
  id: number
  codigo?: string
  razon_social: string
  nombre_comercial?: string
  ruc: string
  estado: "activo" | "inactivo"
}

type DetallePedido = {
  id?: number
  descripcion: string
  cantidad: number
  precioTotal: number
}

type Pedido = {
  id: number
  numero_pedido: string
  proveedor_id: number
  proveedor_nombre: string
  proveedor_codigo?: string
  fecha_pedido: string
  costo_total: number
  estado: "pendiente" | "recibido"
  fecha_recibido?: string
  usuario_id?: number
  notas?: string
  detalles: DetallePedido[]
  created_at: string
  updated_at: string
}

export function PedidosContent() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    proveedorId: "",
    fechaPedido: new Date().toISOString().split('T')[0],
    notas: "",
  })

  const [detalles, setDetalles] = useState<DetallePedido[]>([])
  const [nuevaLinea, setNuevaLinea] = useState({
    descripcion: "",
    cantidad: "",
    precioTotal: "",
  })

  useEffect(() => {
    loadPedidos()
    loadProveedores()
  }, [])

  const loadPedidos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pedidos')
      if (!response.ok) throw new Error('Error al cargar pedidos')
      const data = await response.json()
      setPedidos(data)
    } catch (error: any) {
      console.error('Error al cargar pedidos:', error)
      toast.error('Error al cargar pedidos', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const loadProveedores = async () => {
    try {
      const response = await fetch('/api/proveedores')
      if (!response.ok) throw new Error('Error al cargar proveedores')
      const result = await response.json()
      // La API retorna { success: true, data: [...] }
      const data = result.data || result
      setProveedores(Array.isArray(data) ? data.filter((p: Proveedor) => p.estado === 'activo') : [])
    } catch (error: any) {
      console.error('Error al cargar proveedores:', error)
      toast.error('Error al cargar proveedores')
      setProveedores([])
    }
  }

  const agregarLinea = () => {
    if (!nuevaLinea.descripcion || !nuevaLinea.cantidad || !nuevaLinea.precioTotal) {
      toast.error('Complete todos los campos de la línea')
      return
    }

    const cantidad = parseInt(nuevaLinea.cantidad)
    const precioTotal = parseFloat(nuevaLinea.precioTotal)
    
    if (cantidad <= 0 || precioTotal < 0) {
      toast.error('Cantidad y precio deben ser valores válidos')
      return
    }

    const nuevaLineaCompleta: DetallePedido = {
      descripcion: nuevaLinea.descripcion,
      cantidad,
      precioTotal
    }

    setDetalles([...detalles, nuevaLineaCompleta])
    setNuevaLinea({ descripcion: "", cantidad: "", precioTotal: "" })
  }

  const eliminarLinea = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index))
  }

  const calcularTotal = () => {
    return detalles.reduce((sum, detalle) => sum + detalle.precioTotal, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.proveedorId) {
      toast.error('Seleccione un proveedor')
      return
    }

    if (detalles.length === 0) {
      toast.error('Agregue al menos una línea al pedido')
      return
    }

    try {
      setLoading(true)
      
      const pedidoData = {
        proveedorId: parseInt(formData.proveedorId),
        fechaPedido: formData.fechaPedido,
        costoTotal: calcularTotal(),
        detalles: detalles,
        notas: formData.notas || undefined,
        usuarioId: null // TODO: Obtener del usuario autenticado cuando se implemente
      }

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear pedido')
      }

      await loadPedidos()
      handleCloseDialog()
      
      toast.success('Pedido creado', {
        description: `Pedido ${data.numero_pedido} registrado correctamente`
      })
    } catch (error: any) {
      console.error('Error al crear pedido:', error)
      toast.error('Error al crear pedido', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const marcarComoRecibido = async (pedido: Pedido) => {
    if (pedido.estado === 'recibido') {
      toast.error('Este pedido ya fue marcado como recibido')
      return
    }

    setSelectedPedido(pedido)
    setConfirmDialogOpen(true)
  }

  const confirmarMarcarRecibido = async () => {
    if (!selectedPedido) return

    try {
      setLoading(true)
      setConfirmDialogOpen(false)

      const response = await fetch('/api/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPedido.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar estado')
      }

      await loadPedidos()
      
      toast.success('Estado actualizado', {
        description: `Pedido ${selectedPedido.numero_pedido} marcado como recibido`
      })
    } catch (error: any) {
      console.error('Error al actualizar estado:', error)
      toast.error('Error al actualizar estado', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const verDetalle = (pedido: Pedido) => {
    setSelectedPedido(pedido)
    setDetalleDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setFormData({
      proveedorId: "",
      fechaPedido: new Date().toISOString().split('T')[0],
      notas: "",
    })
    setDetalles([])
    setNuevaLinea({ descripcion: "", cantidad: "", precioTotal: "" })
  }

  const filteredPedidos = pedidos.filter(
    (p) =>
      p.numero_pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPedidos = pedidos.length
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length
  const pedidosRecibidos = pedidos.filter(p => p.estado === 'recibido').length

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b bg-white z-10 flex items-center gap-4 px-6 h-14 shrink-0">
          <SidebarToggle />
          <h1 className="text-xl font-semibold">Pedidos a Proveedores</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header con botón */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Gestión de Pedidos</h2>
              <p className="text-muted-foreground">Registra y controla pedidos a proveedores</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPedidos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{pedidosPendientes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recibidos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{pedidosRecibidos}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search y tabla */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar pedido por número o proveedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha Pedido</TableHead>
                    <TableHead>Fecha Entrega</TableHead>
                    <TableHead className="text-right">Costo Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && pedidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Cargando pedidos...
                      </TableCell>
                    </TableRow>
                  ) : filteredPedidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron pedidos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPedidos.map((pedido) => (
                      <TableRow key={pedido.id}>
                        <TableCell>
                          <div className="font-mono font-medium">{pedido.numero_pedido}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{pedido.proveedor_nombre}</p>
                            {pedido.proveedor_codigo && (
                              <p className="text-sm text-muted-foreground">{pedido.proveedor_codigo}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(pedido.fecha_pedido).toLocaleDateString('es-EC')}
                        </TableCell>
                        <TableCell>
                          {pedido.estado === 'recibido' && pedido.fecha_recibido ? (
                            <div>
                              <p className="font-medium text-green-600">
                                {new Date(pedido.fecha_recibido).toLocaleDateString('es-EC')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(pedido.fecha_recibido).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(pedido.costo_total).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={pedido.estado === 'recibido' ? 'default' : 'secondary'}>
                            {pedido.estado === 'recibido' ? 'Recibido' : 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => verDetalle(pedido)}
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {pedido.estado === 'pendiente' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => marcarComoRecibido(pedido)}
                                disabled={loading}
                                title="Marcar como recibido"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Dialog Nuevo Pedido */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Pedido a Proveedor</DialogTitle>
            <DialogDescription>
              Registra un nuevo pedido de mercancía a un proveedor
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proveedor">Proveedor *</Label>
                  <Select
                    value={formData.proveedorId}
                    onValueChange={(value) => setFormData({ ...formData, proveedorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map((prov) => (
                        <SelectItem key={prov.id} value={prov.id.toString()}>
                          {prov.razon_social} {prov.codigo && `(${prov.codigo})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaPedido">Fecha del Pedido *</Label>
                  <Input
                    id="fechaPedido"
                    type="date"
                    value={formData.fechaPedido}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">La fecha se registra automáticamente</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={2}
                  placeholder="Información adicional del pedido..."
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-4">Detalles del Pedido</h3>
                
                <div className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-5">
                    <Input
                      placeholder="Descripción del artículo"
                      value={nuevaLinea.descripcion}
                      onChange={(e) => setNuevaLinea({ ...nuevaLinea, descripcion: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Cantidad"
                      value={nuevaLinea.cantidad}
                      onChange={(e) => setNuevaLinea({ ...nuevaLinea, cantidad: e.target.value })}
                      min="1"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Precio Total"
                      value={nuevaLinea.precioTotal}
                      onChange={(e) => setNuevaLinea({ ...nuevaLinea, precioTotal: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <Button type="button" onClick={agregarLinea} className="w-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {detalles.length > 0 && (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-center">Cantidad</TableHead>
                          <TableHead className="text-right">Precio Total</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detalles.map((detalle, index) => (
                          <TableRow key={index}>
                            <TableCell>{detalle.descripcion}</TableCell>
                            <TableCell className="text-center">{detalle.cantidad}</TableCell>
                            <TableCell className="text-right font-medium">${Number(detalle.precioTotal).toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => eliminarLinea(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2} className="text-right font-bold">Total:</TableCell>
                          <TableCell className="text-right font-bold text-lg">${calcularTotal().toFixed(2)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || detalles.length === 0}>
                {loading ? 'Guardando...' : 'Crear Pedido'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalle */}
      <Dialog open={detalleDialogOpen} onOpenChange={setDetalleDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido</DialogTitle>
            <DialogDescription>
              {selectedPedido && `Pedido ${selectedPedido.numero_pedido}`}
            </DialogDescription>
          </DialogHeader>
          {selectedPedido && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Proveedor</Label>
                  <p className="font-medium">{selectedPedido.proveedor_nombre}</p>
                  {selectedPedido.proveedor_codigo && (
                    <p className="text-sm text-muted-foreground">{selectedPedido.proveedor_codigo}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha de Pedido</Label>
                  <p className="font-medium">
                    {new Date(selectedPedido.fecha_pedido).toLocaleDateString('es-EC')}
                  </p>
                </div>
                {selectedPedido.estado === 'recibido' && selectedPedido.fecha_recibido && (
                  <div>
                    <Label className="text-muted-foreground">Fecha de Entrega</Label>
                    <p className="font-medium text-green-600">
                      {new Date(selectedPedido.fecha_recibido).toLocaleDateString('es-EC')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedPedido.fecha_recibido).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <div className="mt-1">
                    <Badge variant={selectedPedido.estado === 'recibido' ? 'default' : 'secondary'}>
                      {selectedPedido.estado === 'recibido' ? 'Recibido' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedPedido.notas && (
                <div>
                  <Label className="text-muted-foreground">Notas</Label>
                  <p className="text-sm">{selectedPedido.notas}</p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground mb-2 block">Detalles</Label>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">Precio Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPedido.detalles.map((detalle, index) => (
                        <TableRow key={index}>
                          <TableCell>{detalle.descripcion}</TableCell>
                          <TableCell className="text-center">{detalle.cantidad}</TableCell>
                          <TableCell className="text-right font-medium">${Number(detalle.precioTotal).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-bold">Total:</TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          ${Number(selectedPedido.costo_total).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setDetalleDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para marcar como recibido */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Marcar pedido como recibido?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPedido && (
                <>
                  Se marcará el pedido <span className="font-semibold">{selectedPedido.numero_pedido}</span> como recibido.
                  <br /><br />
                  Esta acción registrará la fecha actual y <span className="font-semibold text-destructive">NO se puede deshacer</span>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarMarcarRecibido}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
