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
import { Search, Plus, Eye, ShoppingBag, Package, CheckCircle, Clock, X, DollarSign, Wallet } from "lucide-react"
import { SidebarToggle } from "./app-sidebar"
import { toast } from "sonner"
import { formatCurrency, normalizeText } from "@/lib/utils"

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

type Abono = {
  id: number
  monto: number
  fecha_abono: string
  metodo_pago: "efectivo" | "transferencia" | "tarjeta" | "cheque" | "otro"
  referencia?: string
  notas?: string
  usuario_id?: number
}

type Pedido = {
  id: number
  numero_pedido: string
  proveedor_id: number
  proveedor_nombre: string
  proveedor_codigo?: string
  fecha_pedido: string
  costo_total: number
  total_abonado: number
  saldo_pendiente: number
  estado: "pendiente" | "recibido"
  estado_pago?: "sin_pagar" | "pago_parcial" | "pagado"
  porcentaje_pagado?: number
  fecha_recibido?: string
  usuario_id?: number
  notas?: string
  detalles: DetallePedido[]
  abonos?: Abono[]
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
  const [abonoDialogOpen, setAbonoDialogOpen] = useState(false)
  const [abonoProveedorDialogOpen, setAbonoProveedorDialogOpen] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [abonoForm, setAbonoForm] = useState({
    monto: "",
    metodoPago: "efectivo" as "efectivo" | "transferencia" | "tarjeta" | "cheque" | "otro",
    referencia: "",
    notas: "",
  })
  
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
      // Cargar todos los proveedores sin filtrar
      setProveedores(Array.isArray(data) ? data : [])
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

  const abrirDialogAbonoPedido = (pedido: Pedido) => {
    if (pedido.saldo_pendiente <= 0) {
      toast.info('Este pedido ya está completamente pagado')
      return
    }
    setSelectedPedido(pedido)
    setAbonoForm({
      monto: "",
      metodoPago: "efectivo",
      referencia: "",
      notas: "",
    })
    setAbonoDialogOpen(true)
  }

  const abrirDialogAbonoProveedor = () => {
    // Filtrar proveedores que tengan pedidos con saldo pendiente
    const proveedoresConDeuda = proveedores.filter(prov => 
      pedidos.some(ped => ped.proveedor_id === prov.id && ped.saldo_pendiente > 0)
    )
    
    if (proveedoresConDeuda.length === 0) {
      toast.info('No hay proveedores con saldo pendiente')
      return
    }
    
    setAbonoForm({
      monto: "",
      metodoPago: "efectivo",
      referencia: "",
      notas: "",
    })
    setSelectedProveedor(null)
    setAbonoProveedorDialogOpen(true)
  }

  const registrarAbonoPedido = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPedido) return
    
    const monto = parseFloat(abonoForm.monto)
    
    if (!monto || monto <= 0) {
      toast.error('Ingrese un monto válido')
      return
    }
    
    if (monto > selectedPedido.saldo_pendiente) {
      toast.error('El monto no puede ser mayor al saldo pendiente')
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch(`/api/pedidos/${selectedPedido.id}/abonos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto,
          metodoPago: abonoForm.metodoPago,
          referencia: abonoForm.referencia || undefined,
          notas: abonoForm.notas || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar abono')
      }

      await loadPedidos()
      setAbonoDialogOpen(false)
      setSelectedPedido(null)
      
      toast.success('Abono registrado correctamente', {
        description: `Pedido ${selectedPedido.numero_pedido}: $${formatCurrency(monto)}`
      })
    } catch (error: any) {
      console.error('Error al registrar abono:', error)
      toast.error('Error al registrar abono', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const registrarAbonoProveedor = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProveedor) {
      toast.error('Seleccione un proveedor')
      return
    }
    
    const monto = parseFloat(abonoForm.monto)
    
    if (!monto || monto <= 0) {
      toast.error('Ingrese un monto válido')
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch(`/api/proveedores/${selectedProveedor.id}/abonos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto,
          metodoPago: abonoForm.metodoPago,
          referencia: abonoForm.referencia || undefined,
          notas: abonoForm.notas || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar abono')
      }

      await loadPedidos()
      setAbonoProveedorDialogOpen(false)
      setSelectedProveedor(null)
      
      toast.success('Abono distribuido correctamente', {
        description: `${data.pedidos_afectados} pedido(s) afectado(s) - Total: $${formatCurrency(data.monto_aplicado)}`
      })
    } catch (error: any) {
      console.error('Error al registrar abono:', error)
      toast.error('Error al registrar abono', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
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
      normalizeText(p.numero_pedido).includes(normalizeText(searchTerm)) ||
      normalizeText(p.proveedor_nombre).includes(normalizeText(searchTerm))
  )

  const totalPedidos = pedidos.length
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length
  const pedidosRecibidos = pedidos.filter(p => p.estado === 'recibido').length
  const totalSaldoPendiente = pedidos.reduce((sum, p) => sum + parseFloat(p.saldo_pendiente.toString()), 0)
  const totalAbonado = pedidos.reduce((sum, p) => sum + parseFloat(p.total_abonado?.toString() || '0'), 0)
  const pedidosConSaldoPendiente = pedidos.filter(p => parseFloat(p.saldo_pendiente.toString()) > 0).length

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header con botón */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Gestión de Pedidos</h2>
              <p className="text-muted-foreground">Registra y controla pedidos a proveedores</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={abrirDialogAbonoProveedor} 
                variant="outline"
                className="w-full md:w-auto"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Abonar a Proveedor
              </Button>
              <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Pedido
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Abonado</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${formatCurrency(totalAbonado)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos con Saldo</CardTitle>
                <Package className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{pedidosConSaldoPendiente}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ${formatCurrency(totalSaldoPendiente)}
                </div>
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
            <CardContent className="overflow-x-auto -mx-6 sm:mx-0">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Número</TableHead>
                    <TableHead className="min-w-[150px]">Proveedor</TableHead>
                    <TableHead className="min-w-[100px]">Fecha Pedido</TableHead>
                    <TableHead className="min-w-[100px]">Fecha Entrega</TableHead>
                    <TableHead className="text-right min-w-[100px]">Costo Total</TableHead>
                    <TableHead className="text-right min-w-[100px]">Total Abonado</TableHead>
                    <TableHead className="text-right min-w-[120px]">Saldo Pendiente</TableHead>
                    <TableHead className="min-w-[90px]">Estado</TableHead>
                    <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && pedidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Cargando pedidos...
                      </TableCell>
                    </TableRow>
                  ) : filteredPedidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
                          ${formatCurrency(pedido.costo_total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium text-blue-600">
                            ${formatCurrency(pedido.total_abonado || 0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${Number(pedido.saldo_pendiente || 0) === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            ${formatCurrency(pedido.saldo_pendiente || pedido.costo_total)}
                          </span>
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
                            {pedido.saldo_pendiente > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => abrirDialogAbonoPedido(pedido)}
                                title="Registrar abono"
                              >
                                <DollarSign className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
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
        <DialogContent className="max-w-7xl max-h-[150vh] overflow-y-auto w-[150vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Nuevo Pedido a Proveedor</DialogTitle>
            <DialogDescription>
              Registra un nuevo pedido de mercancía a un proveedor
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {proveedores
                        .filter(prov => prov.estado === 'activo')
                        .map((prov) => (
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
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-2">
                  <div className="sm:col-span-5">
                    <Input
                      placeholder="Descripción del artículo"
                      value={nuevaLinea.descripcion}
                      onChange={(e) => setNuevaLinea({ ...nuevaLinea, descripcion: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      type="text"
                      placeholder="Cantidad"
                      value={nuevaLinea.cantidad ? formatCurrency(nuevaLinea.cantidad) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                        setNuevaLinea({ ...nuevaLinea, cantidad: value })
                      }}
                      onFocus={(e) => {
                        if (nuevaLinea.cantidad) {
                          e.target.value = nuevaLinea.cantidad
                        }
                      }}
                      onBlur={(e) => {
                        if (nuevaLinea.cantidad) {
                          e.target.value = formatCurrency(nuevaLinea.cantidad)
                        }
                      }}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      type="text"
                      placeholder="Precio Total"
                      value={nuevaLinea.precioTotal ? formatCurrency(nuevaLinea.precioTotal) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                        setNuevaLinea({ ...nuevaLinea, precioTotal: value })
                      }}
                      onFocus={(e) => {
                        if (nuevaLinea.precioTotal) {
                          e.target.value = nuevaLinea.precioTotal
                        }
                      }}
                      onBlur={(e) => {
                        if (nuevaLinea.precioTotal) {
                          e.target.value = formatCurrency(nuevaLinea.precioTotal)
                        }
                      }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="button" onClick={agregarLinea} className="w-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {detalles.length > 0 && (
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">Descripción</TableHead>
                          <TableHead className="text-center min-w-[80px]">Cantidad</TableHead>
                          <TableHead className="text-right min-w-[100px]">Precio Total</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detalles.map((detalle, index) => (
                          <TableRow key={index}>
                            <TableCell>{detalle.descripcion}</TableCell>
                            <TableCell className="text-center">{detalle.cantidad}</TableCell>
                            <TableCell className="text-right font-medium">${formatCurrency(detalle.precioTotal)}</TableCell>
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
                          <TableCell className="text-right font-bold text-lg">${formatCurrency(calcularTotal())}</TableCell>
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
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido</DialogTitle>
            <DialogDescription>
              {selectedPedido && `Pedido ${selectedPedido.numero_pedido}`}
            </DialogDescription>
          </DialogHeader>
          {selectedPedido && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Descripción</TableHead>
                        <TableHead className="text-center min-w-[80px]">Cantidad</TableHead>
                        <TableHead className="text-right min-w-[100px]">Precio Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPedido.detalles.map((detalle, index) => (
                        <TableRow key={index}>
                          <TableCell>{detalle.descripcion}</TableCell>
                          <TableCell className="text-center">{detalle.cantidad}</TableCell>
                          <TableCell className="text-right font-medium">${formatCurrency(detalle.precioTotal)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} className="text-right font-bold">Total:</TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          ${formatCurrency(selectedPedido.costo_total)}
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
        <AlertDialogContent className="w-[95vw] sm:w-full max-w-lg">
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

      {/* Dialog Abono a Pedido Individual */}
      <Dialog open={abonoDialogOpen} onOpenChange={setAbonoDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Abono a Pedido</DialogTitle>
          </DialogHeader>
          {selectedPedido && (
            <div className="space-y-2">
              <p><span className="font-semibold">Pedido:</span> {selectedPedido.numero_pedido}</p>
              <p><span className="font-semibold">Proveedor:</span> {selectedPedido.proveedor_nombre}</p>
              <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm pt-2 border-t">
                <div>
                  <p className="text-muted-foreground">Costo Total</p>
                  <p className="font-semibold">${formatCurrency(selectedPedido.costo_total)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Abonado</p>
                  <p className="font-semibold text-blue-600">${formatCurrency(selectedPedido.total_abonado)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Saldo</p>
                  <p className="font-semibold text-orange-600">${formatCurrency(selectedPedido.saldo_pendiente)}</p>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={registrarAbonoPedido}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="monto-abono">Monto del Abono *</Label>
                <Input
                  id="monto-abono"
                  type="text"
                  placeholder="0"
                  value={abonoForm.monto ? formatCurrency(abonoForm.monto) : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                    setAbonoForm({ ...abonoForm, monto: value })
                  }}
                  onFocus={(e) => {
                    if (abonoForm.monto) {
                      e.target.value = abonoForm.monto
                    }
                  }}
                  onBlur={(e) => {
                    if (abonoForm.monto) {
                      e.target.value = formatCurrency(abonoForm.monto)
                    }
                  }}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metodo-pago-abono">Método de Pago</Label>
                <Select
                  value={abonoForm.metodoPago}
                  onValueChange={(value: any) => setAbonoForm({ ...abonoForm, metodoPago: value })}
                >
                  <SelectTrigger id="metodo-pago-abono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="referencia-abono">Referencia</Label>
                <Input
                  id="referencia-abono"
                  type="text"
                  placeholder="Número de transacción, cheque, etc."
                  value={abonoForm.referencia}
                  onChange={(e) => setAbonoForm({ ...abonoForm, referencia: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notas-abono">Notas</Label>
                <Textarea
                  id="notas-abono"
                  placeholder="Observaciones adicionales..."
                  value={abonoForm.notas}
                  onChange={(e) => setAbonoForm({ ...abonoForm, notas: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAbonoDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar Abono'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Abono a Proveedor (Colectivo) */}
      <Dialog open={abonoProveedorDialogOpen} onOpenChange={setAbonoProveedorDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Abonar a Proveedor</DialogTitle>
            <DialogDescription>
              El monto se distribuirá automáticamente entre los pedidos pendientes del proveedor, comenzando por el más antiguo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={registrarAbonoProveedor}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="proveedor-abono">Proveedor *</Label>
                <Select
                  value={selectedProveedor?.id.toString() || ""}
                  onValueChange={(value) => {
                    const prov = proveedores.find(p => p.id.toString() === value)
                    setSelectedProveedor(prov || null)
                  }}
                  required
                >
                  <SelectTrigger id="proveedor-abono">
                    <SelectValue placeholder="Seleccione un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores
                      .filter(prov => prov.estado === 'activo' && pedidos.some(ped => ped.proveedor_id === prov.id && ped.saldo_pendiente > 0))
                      .map((proveedor) => {
                        const saldoTotal = pedidos
                          .filter(p => p.proveedor_id === proveedor.id && p.saldo_pendiente > 0)
                          .reduce((sum, p) => sum + parseFloat(p.saldo_pendiente.toString()), 0)
                        const numPedidos = pedidos.filter(p => p.proveedor_id === proveedor.id && p.saldo_pendiente > 0).length
                        
                        return (
                          <SelectItem key={proveedor.id} value={proveedor.id.toString()}>
                            {proveedor.razon_social} - {numPedidos} pedido(s) - Deuda: ${formatCurrency(saldoTotal)}
                          </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="monto-proveedor">Monto del Abono *</Label>
                <Input
                  id="monto-proveedor"
                  type="text"
                  placeholder="0"
                  value={abonoForm.monto ? formatCurrency(abonoForm.monto) : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                    setAbonoForm({ ...abonoForm, monto: value })
                  }}
                  onFocus={(e) => {
                    if (abonoForm.monto) {
                      e.target.value = abonoForm.monto
                    }
                  }}
                  onBlur={(e) => {
                    if (abonoForm.monto) {
                      e.target.value = formatCurrency(abonoForm.monto)
                    }
                  }}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metodo-pago-proveedor">Método de Pago</Label>
                <Select
                  value={abonoForm.metodoPago}
                  onValueChange={(value: any) => setAbonoForm({ ...abonoForm, metodoPago: value })}
                >
                  <SelectTrigger id="metodo-pago-proveedor">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="referencia-proveedor">Referencia</Label>
                <Input
                  id="referencia-proveedor"
                  type="text"
                  placeholder="Número de transacción, cheque, etc."
                  value={abonoForm.referencia}
                  onChange={(e) => setAbonoForm({ ...abonoForm, referencia: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notas-proveedor">Notas</Label>
                <Textarea
                  id="notas-proveedor"
                  placeholder="Observaciones adicionales..."
                  value={abonoForm.notas}
                  onChange={(e) => setAbonoForm({ ...abonoForm, notas: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAbonoProveedorDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !selectedProveedor}>
                {loading ? 'Registrando...' : 'Distribuir Abono'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
