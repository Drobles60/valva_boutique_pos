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
import { formatCurrency, normalizeText } from "@/lib/utils"
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
  const [historialSearchTerm, setHistorialSearchTerm] = useState("")
  const [abonoSearchTerm, setAbonoSearchTerm] = useState("")
  
  // Estados para filtros de fecha (historial de abonos)
  const [showDateFilters, setShowDateFilters] = useState(false)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  
  // Estados para filtros de fecha (facturas)
  const [showFacturasDateFilters, setShowFacturasDateFilters] = useState(false)
  const [facturasFechaInicio, setFacturasFechaInicio] = useState("")
  const [facturasFechaFin, setFacturasFechaFin] = useState("")
  
  // Estados generales
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Estados de diálogos
  const [abonoIndividualDialogOpen, setAbonoIndividualDialogOpen] = useState(false)
  const [abonoClienteDialogOpen, setAbonoClienteDialogOpen] = useState(false)
  const [historialDialogOpen, setHistorialDialogOpen] = useState(false)
  const [historialClienteDialogOpen, setHistorialClienteDialogOpen] = useState(false)
  const [buscarHistorialDialogOpen, setBuscarHistorialDialogOpen] = useState(false)
  
  // Estados de datos
  const [abonos, setAbonos] = useState<Abono[]>([])
  const [distribucionDetalle, setDistribucionDetalle] = useState<AbonoDistribucion[]>([])
  const [historialResumen, setHistorialResumen] = useState<any>(null)

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
  const loadCuentas = async (fechaInicioParam?: string, fechaFinParam?: string) => {
    try {
      setLoading(true)
      let url = '/api/cuentas-por-cobrar'
      const params = new URLSearchParams()
      
      if (fechaInicioParam) {
        params.append('fechaInicio', fechaInicioParam)
      }
      if (fechaFinParam) {
        params.append('fechaFin', fechaFinParam)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
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

  // Cargar historial general de abonos de un cliente (todas sus facturas)
  const loadHistorialCliente = async (clienteId: number, fechaInicioParam?: string, fechaFinParam?: string) => {
    try {
      let url = `/api/clientes/${clienteId}/abonos`
      const params = new URLSearchParams()
      
      if (fechaInicioParam) {
        params.append('fechaInicio', fechaInicioParam)
      }
      if (fechaFinParam) {
        params.append('fechaFin', fechaFinParam)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar historial del cliente')
      }

      setAbonos(data.data.abonos || [])
      setHistorialResumen(data.data.resumen || null)
    } catch (error: any) {
      console.error('Error al cargar historial del cliente:', error)
      toast.error('Error al cargar historial del cliente', {
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
    const saldoPendiente = selectedCuenta.saldo_pendiente

    if (monto <= 0 || monto > saldoPendiente) {
      toast.error("Monto inválido", {
        description: `El monto debe ser mayor a 0 y no puede exceder el saldo pendiente de $${formatCurrency(saldoPendiente)}`
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
        usuario_id: user?.id || null
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
    const saldoCliente = selectedCliente.saldo_pendiente

    if (monto <= 0 || monto > saldoCliente) {
      toast.error("Monto inválido", {
        description: `El monto debe ser mayor a 0 y no puede exceder el saldo pendiente de $${formatCurrency(saldoCliente)}`
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
        usuario_id: user?.id || null
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

  const handleOpenHistorialCliente = async (cliente: ClienteConDeuda) => {
    setSelectedCliente(cliente)
    await loadHistorialCliente(cliente.id)
    setHistorialClienteDialogOpen(true)
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
      normalizeText(c.numero_venta).includes(normalizeText(searchTerm)) ||
      normalizeText(c.cliente_nombre).includes(normalizeText(searchTerm)) ||
      normalizeText(c.cliente_identificacion).includes(normalizeText(searchTerm)),
  )

  const filteredClientes = clientes.filter(
    (c) =>
      normalizeText(c.nombre).includes(normalizeText(clienteSearchTerm)) ||
      normalizeText(c.identificacion).includes(normalizeText(clienteSearchTerm)),
  )

  const totalCuentas = cuentas.length
  const cuentasPendientes = cuentas.filter((c) => c.saldo_pendiente > 0).length
  const totalPorCobrar = cuentas.reduce((sum, c) => sum + Number(c.saldo_pendiente), 0)
  const totalAbonado = cuentas.reduce((sum, c) => sum + (Number(c.total_abonado) || 0), 0)

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
        <div className="flex gap-2">
          <Button onClick={handleOpenAbonoCliente} size="lg">
            <Users className="h-4 w-4 mr-2" />
            Abonar a Cliente
          </Button>
          <Button onClick={() => setBuscarHistorialDialogOpen(true)} variant="outline" size="lg">
            <History className="h-4 w-4 mr-2" />
            Ver Historial
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Total Abonado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${formatCurrency(totalAbonado)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#D4AF37]">${formatCurrency(totalPorCobrar)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar por factura, cliente o identificación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant={showFacturasDateFilters ? "default" : "outline"}
                onClick={() => setShowFacturasDateFilters(!showFacturasDateFilters)}
                className="whitespace-nowrap"
              >
                {showFacturasDateFilters ? "Ocultar Fechas" : "Buscar por Fechas"}
              </Button>
            </div>
            
            {showFacturasDateFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="facturasFechaInicio">Fecha Inicio</Label>
                  <Input
                    id="facturasFechaInicio"
                    type="date"
                    value={facturasFechaInicio}
                    onChange={(e) => setFacturasFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facturasFechaFin">Fecha Fin</Label>
                  <Input
                    id="facturasFechaFin"
                    type="date"
                    value={facturasFechaFin}
                    onChange={(e) => setFacturasFechaFin(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFacturasFechaInicio("")
                      setFacturasFechaFin("")
                      loadCuentas()
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                  <Button
                    type="button"
                    onClick={() => loadCuentas(facturasFechaInicio, facturasFechaFin)}
                  >
                    Aplicar Filtro
                  </Button>
                </div>
              </div>
            )}
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
                  // Calcular el estado real basándose en el saldo pendiente
                  // Si saldo > 0: pendiente (cliente debe)
                  // Si saldo <= 0: pagada (o pagada con saldo a favor)
                  const saldoPendiente = cuenta.saldo_pendiente
                  const estadoReal = saldoPendiente > 0 ? 'pendiente' : 'pagada'
                  const tieneSaldoAFavor = saldoPendiente < 0
                  
                  const diasVencimiento = Math.ceil(
                    (new Date(cuenta.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )
                  const estaVencida = diasVencimiento < 0 && estadoReal === 'pendiente'
                  const proximaVencer = diasVencimiento >= 0 && diasVencimiento <= 7 && estadoReal === 'pendiente'

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
                        {tieneSaldoAFavor ? (
                          <span className="text-blue-600 font-medium" title="Saldo a favor del cliente">
                            -${formatCurrency(Math.abs(saldoPendiente))}
                          </span>
                        ) : (
                          <span className={saldoPendiente > 0 ? "font-semibold text-[#D4AF37]" : "text-muted-foreground"}>
                            ${formatCurrency(saldoPendiente)}
                          </span>
                        )}
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
                        ) : estadoReal === 'pagada' ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <span className="text-muted-foreground">{diasVencimiento} días</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={estadoReal === 'pagada' ? 'default' : estaVencida ? 'destructive' : 'secondary'}
                        >
                          {estadoReal === 'pagada' ? 'Pagada' : estaVencida ? 'Vencida' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {estadoReal === 'pendiente' && (
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
                    const montoNumerico = Number.parseFloat(value) || 0
                    const saldoMaximo = selectedCuenta?.saldo_pendiente || 0
                    
                    // Solo actualizar si el monto no excede el saldo pendiente
                    if (montoNumerico <= saldoMaximo) {
                      setAbonoIndividualData({ ...abonoIndividualData, monto: value })
                    } else {
                      // Si excede, establecer el saldo máximo
                      setAbonoIndividualData({ ...abonoIndividualData, monto: saldoMaximo.toString() })
                      toast.error("Monto excedido", {
                        description: `El monto no puede ser mayor al saldo pendiente de $${formatCurrency(saldoMaximo)}`
                      })
                    }
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
                  placeholder={`Máximo: $${formatCurrency(selectedCuenta?.saldo_pendiente || 0)}`}
                  required
                />
                {abonoIndividualData.monto && Number.parseFloat(abonoIndividualData.monto) > 0 && selectedCuenta && (
                  <p className="text-sm text-muted-foreground">
                    Nuevo saldo: ${formatCurrency(Math.max(0, selectedCuenta.saldo_pendiente - Number.parseFloat(abonoIndividualData.monto)))}
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

      {/* Diálogo: Buscar Cliente para Ver Historial */}
      <Dialog open={buscarHistorialDialogOpen} onOpenChange={setBuscarHistorialDialogOpen}>
        <DialogContent className="max-w-full mx-4">
          <DialogHeader>
            <DialogTitle>Buscar Historial de Abonos</DialogTitle>
            <DialogDescription>
              Busca un cliente para ver su historial completo de abonos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="buscarHistorial">Buscar Cliente</Label>
              <Input
                id="buscarHistorial"
                placeholder="Buscar por nombre o identificación..."
                value={historialSearchTerm}
                onChange={(e) => setHistorialSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            
            {historialSearchTerm && (
              <ScrollArea className="h-[400px] border rounded-md">
                {clientes
                  .filter((c) =>
                    normalizeText(c.nombre).includes(normalizeText(historialSearchTerm)) ||
                    normalizeText(c.identificacion).includes(normalizeText(historialSearchTerm))
                  )
                  .map((cliente) => (
                    <div
                      key={cliente.id}
                      className="p-4 border-b hover:bg-accent cursor-pointer transition-colors"
                      onClick={async () => {
                        setBuscarHistorialDialogOpen(false)
                        setHistorialSearchTerm("")
                        await handleOpenHistorialCliente(cliente)
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-base">{cliente.nombre}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">ID:</span> {cliente.identificacion}
                            {cliente.telefono && (
                              <>
                                {" "} | <span className="font-medium">Tel:</span> {cliente.telefono}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-semibold text-[#D4AF37]">
                            ${formatCurrency(cliente.saldo_pendiente)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cliente.cuentas_pendientes} {cliente.cuentas_pendientes === 1 ? "factura" : "facturas"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Abonar a Cliente (con distribución automática) */}
      <Dialog open={abonoClienteDialogOpen} onOpenChange={setAbonoClienteDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[150vh]">
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
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-base">{cliente.nombre}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  <span className="font-medium">ID:</span> {cliente.identificacion}
                                  {cliente.telefono && <> | <span className="font-medium">Tel:</span> {cliente.telefono}</>}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenHistorialCliente(cliente)
                                  }}
                                  title="Ver historial de abonos"
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-[#D4AF37]">${formatCurrency(cliente.saldo_pendiente)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {cliente.cuentas_pendientes} {cliente.cuentas_pendientes === 1 ? 'factura' : 'facturas'}
                                  </p>
                                </div>
                              </div>
                            </div>
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
                          const montoNumerico = Number.parseFloat(value) || 0
                          const saldoMaximo = selectedCliente?.saldo_pendiente || 0
                          
                          // Solo actualizar si el monto no excede el saldo pendiente total del cliente
                          if (montoNumerico <= saldoMaximo) {
                            setAbonoClienteData({ ...abonoClienteData, monto: value })
                          } else {
                            // Si excede, establecer el saldo máximo
                            setAbonoClienteData({ ...abonoClienteData, monto: saldoMaximo.toString() })
                            toast.error("Monto excedido", {
                              description: `El monto no puede ser mayor al saldo total del cliente de $${formatCurrency(saldoMaximo)}`
                            })
                          }
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
                        placeholder={`Máximo: $${formatCurrency(selectedCliente?.saldo_pendiente || 0)}`}
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

      {/* Diálogo: Historial de Abonos de Factura Individual */}
      <Dialog open={historialDialogOpen} onOpenChange={(open) => {
        setHistorialDialogOpen(open)
        if (!open) setAbonoSearchTerm("")
      }}>
        <DialogContent className="w-[99vw] h-[95vh] flex flex-col p-0" style={{ maxWidth: '60vw' }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl md:text-2xl">Historial de Abonos de Factura</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              <span className="font-semibold text-foreground">
                Factura #{selectedCuenta?.numero_venta}
              </span>
              <br />
              <span className="text-xs md:text-sm">
                Cliente: <span className="font-medium">{selectedCuenta?.cliente_nombre}</span>
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="px-6 py-4">
              {/* Card de Información de la Factura */}
              <Card className="mb-6 bg-gradient-to-r from-muted to-muted/50 border-2">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Monto Total</p>
                      <p className="text-3xl font-bold text-primary">
                        ${formatCurrency(selectedCuenta?.monto_total || 0)}
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Abonado</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${formatCurrency(selectedCuenta?.total_abonado || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedCuenta?.cantidad_abonos || 0} {selectedCuenta?.cantidad_abonos === 1 ? 'abono' : 'abonos'}
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Saldo Pendiente</p>
                      <p className="text-3xl font-bold text-[#D4AF37]">
                        ${formatCurrency(selectedCuenta?.saldo_pendiente || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Buscador */}
              {abonos.length > 0 && (
                <div className="mb-4">
                  <Input
                    placeholder="Buscar por fecha, monto, método, referencia, notas o usuario..."
                    value={abonoSearchTerm}
                    onChange={(e) => setAbonoSearchTerm(e.target.value)}
                    className="max-w-2xl"
                  />
                </div>
              )}

              {(() => {
                const filteredAbonos = abonos.filter(abono => {
                  if (!abonoSearchTerm) return true
                  const searchNormalized = normalizeText(abonoSearchTerm)
                  return (
                    normalizeText(new Date(abono.fecha).toLocaleString('es-EC')).includes(searchNormalized) ||
                    normalizeText(abono.monto.toString()).includes(searchNormalized) ||
                    normalizeText(abono.metodoPago).includes(searchNormalized) ||
                    normalizeText(abono.referencia || '').includes(searchNormalized) ||
                    normalizeText(abono.notas || '').includes(searchNormalized) ||
                    normalizeText(abono.usuario).includes(searchNormalized)
                  )
                })
                
                return filteredAbonos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">
                      {abonos.length === 0 ? 'No hay abonos registrados' : 'No se encontraron abonos'}
                    </p>
                    <p className="text-sm">
                      {abonos.length === 0 ? 'Esta factura no tiene historial de pagos' : 'Intenta con otro término de búsqueda'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Vista Desktop */}
                    <div className="hidden md:block border rounded-lg">
                      <div className="overflow-x-auto">
                        <div className="max-h-[400px] overflow-y-auto">
                          <Table className="w-full">
                            <TableHeader className="sticky top-0 bg-background z-10">
                              <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold whitespace-nowrap min-w-[160px]">Fecha</TableHead>
                                <TableHead className="font-semibold text-right whitespace-nowrap min-w-[120px]">Monto</TableHead>
                                <TableHead className="font-semibold whitespace-nowrap min-w-[120px]">Método</TableHead>
                                <TableHead className="font-semibold whitespace-nowrap min-w-[120px]">Referencia</TableHead>
                                <TableHead className="font-semibold whitespace-nowrap min-w-[120px]">Notas</TableHead>
                                <TableHead className="font-semibold whitespace-nowrap min-w-[90px]">Usuario</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredAbonos.map((abono) => (
                          <TableRow key={abono.id} className="hover:bg-muted/30">
                            <TableCell className="text-sm whitespace-nowrap font-medium">
                              {new Date(abono.fecha).toLocaleString('es-EC', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell className="text-base font-bold text-green-600 text-right whitespace-nowrap">
                              ${formatCurrency(abono.monto)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {abono.metodoPago}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {abono.referencia ? (
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded break-words">
                                  {abono.referencia}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {abono.notas ? (
                                <div className="break-words" title={abono.notas}>
                                  {abono.notas}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {abono.usuario}
                            </TableCell>
                          </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>

                    {/* Vista Mobile */}
                    <div className="md:hidden space-y-4">
                      {filteredAbonos.map((abono) => (
                      <Card key={abono.id} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-0">
                          {/* Header del Card */}
                          <div className="bg-muted/50 p-3 border-b">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground font-medium mb-1">
                                  {new Date(abono.fecha).toLocaleString('es-EC', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-green-600">
                                  ${formatCurrency(abono.monto)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Cuerpo del Card */}
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Método de Pago</p>
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {abono.metodoPago}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Usuario</p>
                                <p className="text-sm font-medium">{abono.usuario}</p>
                              </div>
                            </div>

                            {abono.referencia && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Referencia</p>
                                <p className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
                                  {abono.referencia}
                                </p>
                              </div>
                            )}

                            {abono.notas && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Notas</p>
                                <p className="text-sm bg-muted/50 px-3 py-2 rounded">
                                  {abono.notas}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Historial General de Abonos del Cliente */}
      <Dialog open={historialClienteDialogOpen} onOpenChange={(open) => {
        setHistorialClienteDialogOpen(open)
        if (!open) {
          setAbonoSearchTerm("")
          setShowDateFilters(false)
          setFechaInicio("")
          setFechaFin("")
        }
      }}>
        <DialogContent className="w-[99vw] h-[95vh] flex flex-col p-0" style={{ maxWidth: '60vw' }}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl md:text-2xl">Historial General de Abonos</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              <span className="font-semibold text-foreground">
                Cliente: {selectedCliente?.nombre}
              </span>
              <br />
              <span className="text-xs md:text-sm">
                ID: {selectedCliente?.identificacion}
                {historialResumen && (
                  <>
                    {" "} | Total Abonado: <span className="font-semibold text-green-600">${formatCurrency(historialResumen.total_abonado)}</span>
                    {" "} | Saldo Pendiente: <span className="font-semibold text-[#D4AF37]">${formatCurrency(historialResumen.saldo_pendiente)}</span>
                  </>
                )}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="px-6 py-4">
              {/* Buscador */}
              {abonos.length > 0 && (
                <div className="mb-4 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar por fecha, factura, monto, método, referencia, notas o usuario..."
                      value={abonoSearchTerm}
                      onChange={(e) => setAbonoSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant={showDateFilters ? "default" : "outline"}
                      onClick={() => setShowDateFilters(!showDateFilters)}
                      className="whitespace-nowrap"
                    >
                      {showDateFilters ? "Ocultar Fechas" : "Buscar por Fechas"}
                    </Button>
                  </div>
                  
                  {showDateFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/50">
                      <div className="space-y-2">
                        <Label htmlFor="fechaInicioHistorial">Fecha Inicio</Label>
                        <Input
                          id="fechaInicioHistorial"
                          type="date"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fechaFinHistorial">Fecha Fin</Label>
                        <Input
                          id="fechaFinHistorial"
                          type="date"
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setFechaInicio("")
                            setFechaFin("")
                            if (selectedCliente) {
                              loadHistorialCliente(selectedCliente.id)
                            }
                          }}
                        >
                          Limpiar Filtros
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            if (selectedCliente) {
                              loadHistorialCliente(selectedCliente.id, fechaInicio, fechaFin)
                            }
                          }}
                        >
                          Aplicar Filtro
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(() => {
                const filteredAbonos = abonos.filter(abono => {
                  if (!abonoSearchTerm) return true
                  const searchNormalized = normalizeText(abonoSearchTerm)
                  return (
                    normalizeText(new Date(abono.fecha).toLocaleString('es-EC')).includes(searchNormalized) ||
                    normalizeText(abono.numero_venta?.toString() || '').includes(searchNormalized) ||
                    normalizeText(abono.monto.toString()).includes(searchNormalized) ||
                    normalizeText(abono.metodoPago).includes(searchNormalized) ||
                    normalizeText(abono.referencia || '').includes(searchNormalized) ||
                    normalizeText(abono.notas || '').includes(searchNormalized) ||
                    normalizeText(abono.usuario).includes(searchNormalized)
                  )
                })
                
                return filteredAbonos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">
                      {abonos.length === 0 ? 'No hay abonos registrados' : 'No se encontraron abonos'}
                    </p>
                    <p className="text-sm">
                      {abonos.length === 0 ? 'Este cliente no tiene historial de pagos' : 'Intenta con otro término de búsqueda'}
                    </p>
                  </div>
                ) : (
                <>
                  {/* Resumen Superior */}
                  {historialResumen && (
                    <Card className="mb-6 bg-gradient-to-r from-muted to-muted/50 border-2">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="text-center sm:text-left">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Abonado</p>
                            <p className="text-3xl font-bold text-green-600">
                              ${formatCurrency(historialResumen.total_abonado)}
                            </p>
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Cantidad de Abonos</p>
                            <p className="text-3xl font-bold text-primary">
                              {historialResumen.cantidad_abonos}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              pagos registrados
                            </p>
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Saldo Pendiente</p>
                            <p className="text-3xl font-bold text-[#D4AF37]">
                              ${formatCurrency(historialResumen.saldo_pendiente)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                    {/* Vista Desktop */}
                    <div className="hidden md:block border rounded-lg">
                      <div className="overflow-x-auto">
                        <div className="max-h-[400px] overflow-y-auto">
                          <Table className="w-full">
                            <TableHeader className="sticky top-0 bg-background z-10">
                              <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold whitespace-nowrap min-w-[160px]">Fecha</TableHead>
                                <TableHead className="font-semibold whitespace-nowrap min-w-[100px]">Factura</TableHead>
                                <TableHead className="font-semibold text-right whitespace-nowrap min-w-[120px]">Monto</TableHead>
                                <TableHead className="font-semibold whitespace-nowrap min-w-[120px]">Método</TableHead>
                                <TableHead className="font-semibold whitespace-nowrap min-w-[120px]">Referencia</TableHead>
                                <TableHead className="font-semibold whitespace-nowrap min-w-[120px]">Notas</TableHead>
                                <TableHead className="font-semibold whitespace-nowrap min-w-[90px]">Usuario</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredAbonos.map((abono) => (
                          <TableRow key={abono.id} className="hover:bg-muted/30">
                            <TableCell className="text-sm whitespace-nowrap font-medium">
                              {new Date(abono.fecha).toLocaleString('es-EC', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>
                              {abono.numero_venta ? (
                                <Badge variant="outline" className="font-mono">
                                  #{abono.numero_venta}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-base font-bold text-green-600 text-right whitespace-nowrap">
                              ${formatCurrency(abono.monto)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {abono.metodoPago}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {abono.referencia ? (
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded break-words">
                                  {abono.referencia}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {abono.notas ? (
                                <div className="break-words" title={abono.notas}>
                                  {abono.notas}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {abono.usuario}
                            </TableCell>
                          </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>

                    {/* Vista Mobile */}
                    <div className="md:hidden space-y-4">
                      {filteredAbonos.map((abono) => (
                      <Card key={abono.id} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-0">
                          {/* Header del Card */}
                          <div className="bg-muted/50 p-3 border-b">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground font-medium mb-1">
                                  {new Date(abono.fecha).toLocaleString('es-EC', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                {abono.numero_venta && (
                                  <Badge variant="outline" className="text-xs font-mono">
                                    #{abono.numero_venta}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-green-600">
                                  ${formatCurrency(abono.monto)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Cuerpo del Card */}
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Método de Pago</p>
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {abono.metodoPago}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Usuario</p>
                                <p className="text-sm font-medium">{abono.usuario}</p>
                              </div>
                            </div>

                            {abono.referencia && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Referencia</p>
                                <p className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
                                  {abono.referencia}
                                </p>
                              </div>
                            )}

                            {abono.notas && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Notas</p>
                                <p className="text-sm bg-muted/50 px-3 py-2 rounded">
                                  {abono.notas}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
                )
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
