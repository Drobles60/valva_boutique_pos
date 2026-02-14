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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, DollarSign, CreditCard, History, AlertCircle, Users } from "lucide-react"
import { SidebarToggle } from "./app-sidebar"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CuentaPorCobrar {
  id: number
  venta_id: number
  numero_venta: string
  fecha_venta: string
  monto_total: number
  saldo_pendiente: number
  total_abonado: number
  cantidad_abonos: number
  fecha_vencimiento: string
  estado: string
  created_at: string
  cliente_id: number
  cliente_nombre: string
  cliente_identificacion: string
  cliente_telefono: string
  cliente_email?: string
}

interface ClienteConDeuda {
  id: number
  nombre: string
  identificacion: string
  telefono: string
  saldo_pendiente: number
  total_cuentas: number
  cuentas_pendientes: number
}

interface Abono {
  id: number
  monto: number
  fecha: string
  metodoPago: string
  referencia?: string
  notas?: string
  usuario: string
  numero_venta?: string
}

interface AbonoDistribucion {
  cuenta_id: number
  numero_venta: string
  monto_abonado: number
  saldo_anterior: number
  nuevo_saldo: number
}

export function ClientesContent() {
  // Estados para facturas
  const [cuentas, setCuentas] = useState<CuentaPorCobrar[]>([])
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaPorCobrar | null>(null)
  
  // Estados para clientes
  const [clientes, setClientes] = useState<ClienteConDeuda[]>([])
  const [selectedCliente, setSelectedCliente] = useState<ClienteConDeuda | null>(null)
  const [clienteSearchTerm, setClienteSearchTerm] = useState("")
  
  // Estados generales
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Estados de diálogos
  const [abonoIndividualDialogOpen, setAbonoIndividualDialogOpen] = useState(false)
  const [abonoClienteDialogOpen, setAbonoClienteDialogOpen] = useState(false)
  const [historialDialogOpen, setHistorialDialogOpen] = useState(false)
  
  // Estados de datos
  const [abonos, setAbonos] = useState<Abono[]>([])
  const [distribucionDetalle, setDistribucionDetalle] = useState<AbonoDistribucion[]>([])

  const [abonoIndividualData, setAbonoIndividualData] = useState({
    monto: "",
    metodoPago: "efectivo",
    referencia: "",
    notas: "",
  })

  const [abonoClienteData, setAbonoClienteData] = useState({
    monto: "",
    metodoPago: "efectivo",
    referencia: "",
    notas: "",
  })

  useEffect(() => {
    loadCuentas()
    loadClientes()
  }, [])

  useEffect(() => {
    loadCuentas()
    loadClientes()
  }, [])

  // Cargar todas las facturas (cuentas por cobrar)
  const loadCuentas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cuentas-por-cobrar')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar facturas')
      }

      setCuentas(data.data || [])
    } catch (error: any) {
      console.error('Error al cargar facturas:', error)
      toast.error('Error al cargar facturas', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  // Cargar clientes con deudas (para el selector)
  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes/cuentas-por-cobrar')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar clientes')
      }

      setClientes(data.data || [])
    } catch (error: any) {
      console.error('Error al cargar clientes:', error)
    }
  }

  // Cargar abonos de una factura específica
  const loadAbonos = async (cuentaId: number) => {
    try {
      const response = await fetch(`/api/cuentas-por-cobrar/${cuentaId}/abonos`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar abonos')
      }

      setAbonos(data.data.abonos || [])
    } catch (error: any) {
      console.error('Error al cargar abonos:', error)
      toast.error('Error al cargar historial', {
        description: error.message
      })
    }
  }

  // Abono INDIVIDUAL a una factura específica
  const handleAbonoIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCuenta) {
      toast.error("Error", {
        description: "No se ha seleccionado una factura"
      })
      return
    }

    const monto = Number.parseFloat(abonoIndividualData.monto)

    if (monto <= 0 || monto > selectedCuenta.saldo_pendiente) {
      toast.error("Monto inválido", {
        description: `El monto debe ser mayor a 0 y no puede exceder el saldo pendiente de $${formatCurrency(selectedCuenta.saldo_pendiente)}`
      })
      return
    }

    try {
      setLoading(true)

      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null

      const payload = {
        monto,
        metodo_pago: abonoIndividualData.metodoPago,
        referencia_transferencia: abonoIndividualData.referencia?.trim() || null,
        notas: abonoIndividualData.notas?.trim() || null,
        usuario_id: user?.id || 1
      }

      const response = await fetch(`/api/cuentas-por-cobrar/${selectedCuenta.id}/abonos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar abono')
      }

      toast.success("¡Abono registrado!", {
        description: `Se registró un abono de $${formatCurrency(monto)} para la factura #${selectedCuenta.numero_venta}`
      })

      await loadCuentas()
      handleCloseAbonoIndividualDialog()
    } catch (error: any) {
      console.error('Error al registrar abono:', error)
      toast.error('Error al registrar abono', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  // Abono a CLIENTE con distribución automática
  const handleAbonoClienteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCliente) {
      toast.error("Error", {
        description: "No se ha seleccionado un cliente"
      })
      return
    }

    const monto = Number.parseFloat(abonoClienteData.monto)

    if (monto <= 0 || monto > selectedCliente.saldo_pendiente) {
      toast.error("Monto inválido", {
        description: `El monto debe ser mayor a 0 y no puede exceder el saldo pendiente de $${formatCurrency(selectedCliente.saldo_pendiente)}`
      })
      return
    }

    try {
      setLoading(true)

      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null

      const payload = {
        monto,
        metodo_pago: abonoClienteData.metodoPago,
        referencia_transferencia: abonoClienteData.referencia?.trim() || null,
        notas: abonoClienteData.notas?.trim() || null,
        usuario_id: user?.id || 1
      }

      const response = await fetch(`/api/clientes/${selectedCliente.id}/abonos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar abono')
      }

      // Mostrar detalle de distribución
      const distribucion = data.data.detalle || []
      setDistribucionDetalle(distribucion)

      const facturasAfectadas = distribucion.map((d: any) => `#${d.numero_venta}`).join(', ')

      toast.success("¡Abono distribuido exitosamente!", {
        description: `Se distribuyeron $${formatCurrency(data.data.monto_aplicado)} entre ${data.data.cuentas_afectadas} factura(s): ${facturasAfectadas}`
      })

      await loadCuentas()
      await loadClientes()
      handleCloseAbonoClienteDialog()
    } catch (error: any) {
      console.error('Error al registrar abono:', error)
      toast.error('Error al registrar abono', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAbonoIndividual = async (cuenta: CuentaPorCobrar) => {
    setSelectedCuenta(cuenta)
    setAbonoIndividualDialogOpen(true)
  }

  const handleOpenAbonoCliente = () => {
    setAbonoClienteDialogOpen(true)
  }

  const handleOpenHistorial = async (cuenta: CuentaPorCobrar) => {
    setSelectedCuenta(cuenta)
    await loadAbonos(cuenta.id)
    setHistorialDialogOpen(true)
  }

  const handleCloseAbonoIndividualDialog = () => {
    setAbonoIndividualDialogOpen(false)
    setSelectedCuenta(null)
    setAbonoIndividualData({
      monto: "",
      metodoPago: "efectivo",
      referencia: "",
      notas: "",
    })
  }

  const handleCloseAbonoClienteDialog = () => {
    setAbonoClienteDialogOpen(false)
    setSelectedCliente(null)
    setClienteSearchTerm("")
    setDistribucionDetalle([])
    setAbonoClienteData({
      monto: "",
      metodoPago: "efectivo",
      referencia: "",
      notas: "",
    })
  }

  const filteredCuentas = cuentas.filter(
    (c) =>
      c.numero_venta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cliente_identificacion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredClientes = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
      c.identificacion.toLowerCase().includes(clienteSearchTerm.toLowerCase()),
  )

  const totalCuentas = cuentas.length
  const cuentasPendientes = cuentas.filter((c) => c.estado === 'pendiente').length
  const totalPorCobrar = cuentas.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)
  
  const cuentasVencidas = cuentas.filter((c) => {
    if (c.estado !== 'pendiente') return false
    const diasVencimiento = Math.ceil(
      (new Date(c.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    return diasVencimiento < 0
  }).length

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Cuentas por Cobrar</h1>
            <p className="text-sm text-muted-foreground md:text-base">Gestión de ventas a crédito y abonos</p>
          </div>
        </div>
        <Button onClick={handleOpenAbonoCliente} size="lg">
          <Users className="h-4 w-4 mr-2" />
          Abonar a Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCuentas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#D4AF37]">{cuentasPendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{cuentasVencidas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${formatCurrency(totalPorCobrar)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por factura, cliente o identificación..."
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
                <TableHead>Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                <TableHead className="text-right">Monto Total</TableHead>
                <TableHead className="text-right hidden md:table-cell">Abonado</TableHead>
                <TableHead className="text-right">Pendiente</TableHead>
                <TableHead className="hidden xl:table-cell">Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && cuentas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Cargando facturas...
                  </TableCell>
                </TableRow>
              ) : filteredCuentas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No se encontraron facturas
                  </TableCell>
                </TableRow>
              ) : (
                filteredCuentas.map((cuenta) => {
                  const diasVencimiento = Math.ceil(
                    (new Date(cuenta.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )
                  const estaVencida = diasVencimiento < 0 && cuenta.estado === 'pendiente'
                  const proximaVencer = diasVencimiento >= 0 && diasVencimiento <= 7 && cuenta.estado === 'pendiente'

                  return (
                    <TableRow key={cuenta.id}>
                      <TableCell>
                        <Badge variant="outline">#{cuenta.numero_venta}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cuenta.cliente_nombre}</p>
                          <p className="text-xs text-muted-foreground">{cuenta.cliente_identificacion}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {new Date(cuenta.fecha_venta).toLocaleDateString('es-EC')}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${formatCurrency(cuenta.monto_total)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium hidden md:table-cell">
                        ${formatCurrency(cuenta.total_abonado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cuenta.saldo_pendiente > 0 ? "font-semibold text-[#D4AF37]" : "text-muted-foreground"}>
                          ${formatCurrency(cuenta.saldo_pendiente)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm">
                        {estaVencida ? (
                          <span className="text-destructive font-medium">
                            Vencida ({Math.abs(diasVencimiento)} días)
                          </span>
                        ) : proximaVencer ? (
                          <span className="text-[#D4AF37] font-medium">
                            {diasVencimiento} días
                          </span>
                        ) : cuenta.estado === 'pagada' ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <span className="text-muted-foreground">{diasVencimiento} días</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={cuenta.estado === 'pagada' ? 'default' : estaVencida ? 'destructive' : 'secondary'}
                        >
                          {cuenta.estado === 'pagada' ? 'Pagada' : estaVencida ? 'Vencida' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {cuenta.estado === 'pendiente' && (
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => handleOpenAbonoIndividual(cuenta)}
                              disabled={loading}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Abonar
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenHistorial(cuenta)}
                            title="Ver historial de abonos"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo: Abono Individual a Factura */}
      <Dialog open={abonoIndividualDialogOpen} onOpenChange={setAbonoIndividualDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Abonar a Factura</DialogTitle>
            <DialogDescription>
              Factura: #{selectedCuenta?.numero_venta}
              <br />
              Cliente: {selectedCuenta?.cliente_nombre}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAbonoIndividualSubmit}>
            <div className="grid gap-4 py-4">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold">${formatCurrency(selectedCuenta?.monto_total || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Abonado</p>
                      <p className="font-semibold text-green-600">${formatCurrency(selectedCuenta?.total_abonado || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pendiente</p>
                      <p className="font-semibold text-[#D4AF37]">${formatCurrency(selectedCuenta?.saldo_pendiente || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="montoIndividual">Monto del Abono *</Label>
                <Input
                  id="montoIndividual"
                  type="text"
                  value={abonoIndividualData.monto ? formatCurrency(abonoIndividualData.monto) : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                    setAbonoIndividualData({ ...abonoIndividualData, monto: value })
                  }}
                  onFocus={(e) => {
                    if (abonoIndividualData.monto) {
                      e.target.value = abonoIndividualData.monto
                    }
                  }}
                  onBlur={(e) => {
                    if (abonoIndividualData.monto) {
                      e.target.value = formatCurrency(abonoIndividualData.monto)
                    }
                  }}
                  required
                />
                {abonoIndividualData.monto && Number.parseFloat(abonoIndividualData.monto) > 0 && selectedCuenta && (
                  <p className="text-sm text-muted-foreground">
                    Nuevo saldo: ${formatCurrency(Math.max(0, (selectedCuenta.saldo_pendiente || 0) - Number.parseFloat(abonoIndividualData.monto)))}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodoPagoIndividual">Método de Pago *</Label>
                <Select
                  value={abonoIndividualData.metodoPago}
                  onValueChange={(value) => setAbonoIndividualData({ ...abonoIndividualData, metodoPago: value })}
                >
                  <SelectTrigger id="metodoPagoIndividual">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {abonoIndividualData.metodoPago === 'transferencia' && (
                <div className="space-y-2">
                  <Label htmlFor="referenciaIndividual">Referencia de Transferencia</Label>
                  <Input
                    id="referenciaIndividual"
                    value={abonoIndividualData.referencia}
                    onChange={(e) => setAbonoIndividualData({ ...abonoIndividualData, referencia: e.target.value })}
                    placeholder="Número de referencia"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notasIndividual">Notas (opcional)</Label>
                <Textarea
                  id="notasIndividual"
                  value={abonoIndividualData.notas}
                  onChange={(e) => setAbonoIndividualData({ ...abonoIndividualData, notas: e.target.value })}
                  placeholder="Observaciones adicionales"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseAbonoIndividualDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Registrando..." : "Registrar Abono"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Abonar a Cliente (con distribución automática) */}
      <Dialog open={abonoClienteDialogOpen} onOpenChange={setAbonoClienteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Abonar a Cliente con Distribución Automática</DialogTitle>
            <DialogDescription>
              Busca un cliente y el pago se distribuirá automáticamente entre sus facturas pendientes (más antiguas primero)
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <form onSubmit={handleAbonoClienteSubmit}>
              <div className="grid gap-4 py-4">
                {/* Selector de Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="cliente">Buscar Cliente *</Label>
                  <Input
                    id="cliente"
                    placeholder="Buscar por nombre o identificación..."
                    value={clienteSearchTerm}
                    onChange={(e) => setClienteSearchTerm(e.target.value)}
                  />
                  {clienteSearchTerm && (
                    <div className="border rounded-md max-h-48 overflow-y-auto mt-2">
                      {filteredClientes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No se encontraron clientes
                        </p>
                      ) : (
                        filteredClientes.map((cliente) => (
                          <div
                            key={cliente.id}
                            className={`p-3 border-b cursor-pointer hover:bg-accent ${
                              selectedCliente?.id === cliente.id ? 'bg-accent' : ''
                            }`}
                            onClick={() => {
                              setSelectedCliente(cliente)
                              setClienteSearchTerm(cliente.nombre)
                            }}
                          >
                            <p className="font-medium">{cliente.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {cliente.identificacion} | Deuda: ${formatCurrency(cliente.saldo_pendiente)} | {cliente.cuentas_pendientes} facturas pendientes
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Información del cliente seleccionado */}
                {selectedCliente && (
                  <>
                    <Card className="bg-muted">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Facturas Pendientes</p>
                            <p className="font-semibold">{selectedCliente.cuentas_pendientes}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Deuda</p>
                            <p className="font-semibold text-[#D4AF37]">${formatCurrency(selectedCliente.saldo_pendiente)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cliente</p>
                            <p className="font-semibold text-xs">{selectedCliente.nombre}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      <Label htmlFor="montoCliente">Monto del Abono *</Label>
                      <Input
                        id="montoCliente"
                        type="text"
                        value={abonoClienteData.monto ? formatCurrency(abonoClienteData.monto) : ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                          setAbonoClienteData({ ...abonoClienteData, monto: value })
                        }}
                        onFocus={(e) => {
                          if (abonoClienteData.monto) {
                            e.target.value = abonoClienteData.monto
                          }
                        }}
                        onBlur={(e) => {
                          if (abonoClienteData.monto) {
                            e.target.value = formatCurrency(abonoClienteData.monto)
                          }
                        }}
                        required
                      />
                      {abonoClienteData.monto && Number.parseFloat(abonoClienteData.monto) > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Nuevo saldo del cliente: ${formatCurrency(Math.max(0, selectedCliente.saldo_pendiente - Number.parseFloat(abonoClienteData.monto)))}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metodoPagoCliente">Método de Pago *</Label>
                      <Select
                        value={abonoClienteData.metodoPago}
                        onValueChange={(value) => setAbonoClienteData({ ...abonoClienteData, metodoPago: value })}
                      >
                        <SelectTrigger id="metodoPagoCliente">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {abonoClienteData.metodoPago === 'transferencia' && (
                      <div className="space-y-2">
                        <Label htmlFor="referenciaCliente">Referencia de Transferencia</Label>
                        <Input
                          id="referenciaCliente"
                          value={abonoClienteData.referencia}
                          onChange={(e) => setAbonoClienteData({ ...abonoClienteData, referencia: e.target.value })}
                          placeholder="Número de referencia"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notasCliente">Notas (opcional)</Label>
                      <Textarea
                        id="notasCliente"
                        value={abonoClienteData.notas}
                        onChange={(e) => setAbonoClienteData({ ...abonoClienteData, notas: e.target.value })}
                        placeholder="Observaciones adicionales"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseAbonoClienteDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || !selectedCliente}>
                  {loading ? "Registrando..." : "Distribuir Abono"}
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Historial de Abonos */}
      <Dialog open={historialDialogOpen} onOpenChange={setHistorialDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Historial de Abonos</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Factura: #{selectedCuenta?.numero_venta}
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> | </span>
              Cliente: {selectedCuenta?.cliente_nombre}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="py-4">
              {abonos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay abonos registrados</div>
              ) : (
                <>
                  {/* Vista Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Factura</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead className="hidden lg:table-cell">Referencia</TableHead>
                          <TableHead className="hidden xl:table-cell">Usuario</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {abonos.map((abono) => (
                          <TableRow key={abono.id}>
                            <TableCell className="text-sm whitespace-nowrap">
                              {new Date(abono.fecha).toLocaleString('es-EC', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell className="text-sm">
                              {abono.numero_venta ? (
                                <Badge variant="outline">#{abono.numero_venta}</Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="font-bold text-green-600 text-right whitespace-nowrap">
                              ${formatCurrency(abono.monto)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{abono.metodoPago}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                              {abono.referencia || "-"}
                            </TableCell>
                            <TableCell className="text-sm hidden xl:table-cell">{abono.usuario}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Vista Mobile */}
                  <div className="md:hidden space-y-3">
                    {abonos.map((abono) => (
                      <Card key={abono.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-1">
                                {new Date(abono.fecha).toLocaleString('es-EC', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {abono.numero_venta && (
                                <Badge variant="outline" className="text-xs">
                                  #{abono.numero_venta}
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                ${formatCurrency(abono.monto)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Método</p>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {abono.metodoPago}
                              </Badge>
                            </div>
                            {abono.referencia && (
                              <div>
                                <p className="text-xs text-muted-foreground">Referencia</p>
                                <p className="text-xs mt-1 truncate">{abono.referencia}</p>
                              </div>
                            )}
                            <div className="col-span-2">
                              <p className="text-xs text-muted-foreground">Usuario</p>
                              <p className="text-xs mt-1">{abono.usuario}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
