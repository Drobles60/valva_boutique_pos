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
import { Search, Plus, DollarSign, Edit, CreditCard, History, AlertCircle } from "lucide-react"
import type { Cliente, Abono } from "@/lib/types"
import { getClientes, saveCliente, deleteCliente, saveAbono, getAbonosByCliente, getCurrentUser } from "@/lib/storage"
import { SidebarToggle } from "./app-sidebar"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function ClientesContent() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [abonoDialogOpen, setAbonoDialogOpen] = useState(false)
  const [historialDialogOpen, setHistorialDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Cliente | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null)
  const [abonos, setAbonos] = useState<Abono[]>([])
  const [currentUser] = useState(getCurrentUser())

  const [formData, setFormData] = useState({
    nombre: "",
    identificacion: "",
    telefono: "",
    email: "",
    direccion: "",
    tipoCliente: "publico" as Cliente["tipoCliente"],
    limiteCredito: "",
  })

  const [abonoData, setAbonoData] = useState({
    monto: "",
    metodoPago: "efectivo",
    referencia: "",
    notas: "",
  })

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = () => {
    setClientes(getClientes())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const cliente: Cliente = {
      id: editingClient?.id || Date.now().toString(),
      nombre: formData.nombre,
      identificacion: formData.identificacion,
      telefono: formData.telefono,
      email: formData.email || undefined,
      direccion: formData.direccion || undefined,
      tipoCliente: formData.tipoCliente,
      limiteCredito: Number.parseFloat(formData.limiteCredito) || 0,
      saldoActual: editingClient?.saldoActual || 0,
      createdAt: editingClient?.createdAt || new Date().toISOString(),
    }

    saveCliente(cliente)
    loadClientes()
    handleCloseDialog()
  }

  const handleAbonoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return

    const monto = Number.parseFloat(abonoData.monto)
    if (monto <= 0 || monto > selectedClient.saldoActual) {
      toast.error("Monto inválido", {
        description: `El monto debe ser mayor a 0 y no puede exceder el saldo actual de $${selectedClient.saldoActual.toLocaleString()}`
      })
      return
    }

    const abono: Abono = {
      id: Date.now().toString(),
      clienteId: selectedClient.id,
      monto,
      fecha: new Date().toISOString(),
      metodoPago: abonoData.metodoPago,
      referencia: abonoData.referencia || undefined,
      notas: abonoData.notas || undefined,
      usuario: currentUser?.nombre || "Usuario",
    }

    saveAbono(abono, selectedClient.id)
    loadClientes()
    handleCloseAbonoDialog()
    toast.success("¡Abono registrado!", {
      description: `Se registró un abono de $${monto.toLocaleString()} para ${selectedClient.nombre}`
    })
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingClient(cliente)
    setFormData({
      nombre: cliente.nombre,
      identificacion: cliente.identificacion,
      telefono: cliente.telefono,
      email: cliente.email || "",
      direccion: cliente.direccion || "",
      tipoCliente: cliente.tipoCliente,
      limiteCredito: cliente.limiteCredito.toString(),
    })
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setClienteToDelete(id)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (clienteToDelete) {
      deleteCliente(clienteToDelete)
      loadClientes()
      toast.success("Cliente eliminado", {
        description: "El cliente ha sido eliminado del sistema"
      })
      setClienteToDelete(null)
    }
  }

  const handleOpenAbono = (cliente: Cliente) => {
    setSelectedClient(cliente)
    setAbonoDialogOpen(true)
  }

  const handleOpenHistorial = (cliente: Cliente) => {
    setSelectedClient(cliente)
    setAbonos(getAbonosByCliente(cliente.id))
    setHistorialDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingClient(null)
    setFormData({
      nombre: "",
      identificacion: "",
      telefono: "",
      email: "",
      direccion: "",
      tipoCliente: "publico",
      limiteCredito: "",
    })
  }

  const handleCloseAbonoDialog = () => {
    setAbonoDialogOpen(false)
    setSelectedClient(null)
    setAbonoData({
      monto: "",
      metodoPago: "efectivo",
      referencia: "",
      notas: "",
    })
  }

  const filteredClientes = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.identificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalClientes = clientes.length
  const clientesCredito = clientes.filter((c) => c.limiteCredito > 0).length
  const totalPorCobrar = clientes.reduce((sum, c) => sum + c.saldoActual, 0)
  const clientesMorosos = clientes.filter((c) => c.saldoActual >= c.limiteCredito * 0.8 && c.limiteCredito > 0).length

  const canManageCredits = currentUser?.permisos.gestionarCreditos

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Clientes</h1>
            <p className="text-sm text-muted-foreground md:text-base">Gestión de clientes y cuentas por cobrar</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes con Crédito</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{clientesCredito}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalPorCobrar.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes en Riesgo</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{clientesMorosos}</div>
            <p className="text-xs text-muted-foreground">80% o más del límite</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar cliente por nombre, documento o teléfono..."
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
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Identificación</TableHead>
                <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
                <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Límite</TableHead>
                <TableHead className="hidden xl:table-cell text-right">Disponible</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => {
                const disponible = cliente.limiteCredito - cliente.saldoActual
                const porcentajeUsado =
                  cliente.limiteCredito > 0 ? (cliente.saldoActual / cliente.limiteCredito) * 100 : 0

                return (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cliente.nombre}</p>
                        <p className="text-sm text-muted-foreground md:hidden">{cliente.identificacion}</p>
                        <p className="text-xs text-muted-foreground">{cliente.email || "Sin email"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{cliente.identificacion}</TableCell>
                    <TableCell className="hidden sm:table-cell">{cliente.telefono || "N/A"}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={cliente.tipoCliente === "publico" ? "secondary" : "default"}>
                        {cliente.tipoCliente === "publico"
                          ? "Público"
                          : cliente.tipoCliente === "mayorista"
                            ? "Mayorista"
                            : "Especial"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cliente.saldoActual > 0 ? "font-semibold text-[#D4AF37]" : ""}>
                        ${cliente.saldoActual.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-right">${cliente.limiteCredito.toLocaleString()}</TableCell>
                    <TableCell className="hidden xl:table-cell text-right">
                      {cliente.limiteCredito > 0 && (
                        <div>
                          <span
                            className={
                              porcentajeUsado >= 80 ? "text-destructive font-semibold" : "text-muted-foreground"
                            }
                          >
                            ${disponible.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cliente)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {cliente.saldoActual > 0 && canManageCredits && (
                          <Button variant="default" size="sm" onClick={() => handleOpenAbono(cliente)}>
                            <DollarSign className="h-4 w-4 mr-1" />
                            Abonar
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleOpenHistorial(cliente)}>
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Client Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
            <DialogDescription>Complete la información del cliente</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="identificacion">Identificación *</Label>
                  <Input
                    id="identificacion"
                    value={formData.identificacion}
                    onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoCliente">Tipo de Cliente *</Label>
                  <Select
                    value={formData.tipoCliente}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipoCliente: value as Cliente["tipoCliente"] })
                    }
                  >
                    <SelectTrigger id="tipoCliente">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publico">Público (Precio Normal)</SelectItem>
                      <SelectItem value="mayorista">Mayorista (Precio Mayorista)</SelectItem>
                      <SelectItem value="especial">Especial (Precio Especial)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limiteCredito">Límite de Crédito</Label>
                  <Input
                    id="limiteCredito"
                    type="number"
                    step="0.01"
                    value={formData.limiteCredito}
                    onChange={(e) => setFormData({ ...formData, limiteCredito: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">{editingClient ? "Guardar Cambios" : "Crear Cliente"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Abono Dialog */}
      <Dialog open={abonoDialogOpen} onOpenChange={setAbonoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Abono</DialogTitle>
            <DialogDescription>
              Cliente: {selectedClient?.nombre}
              <br />
              Saldo Actual: ${selectedClient?.saldoActual.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAbonoSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto del Abono *</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={abonoData.monto}
                  onChange={(e) => setAbonoData({ ...abonoData, monto: e.target.value })}
                  max={selectedClient?.saldoActual}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodoPago">Método de Pago *</Label>
                <Select
                  value={abonoData.metodoPago}
                  onValueChange={(value) => setAbonoData({ ...abonoData, metodoPago: value })}
                >
                  <SelectTrigger id="metodoPago">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referencia">Referencia</Label>
                <Input
                  id="referencia"
                  value={abonoData.referencia}
                  onChange={(e) => setAbonoData({ ...abonoData, referencia: e.target.value })}
                  placeholder="Número de transacción, cheque, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={abonoData.notas}
                  onChange={(e) => setAbonoData({ ...abonoData, notas: e.target.value })}
                  placeholder="Observaciones adicionales"
                />
              </div>

              {abonoData.monto && selectedClient && (
                <div className="rounded-lg bg-secondary p-4">
                  <div className="flex justify-between mb-2">
                    <span>Saldo Actual:</span>
                    <span className="font-bold">${selectedClient.saldoActual.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Abono:</span>
                    <span className="font-bold">-${Number.parseFloat(abonoData.monto).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Nuevo Saldo:</span>
                    <span className="font-bold text-[#D4AF37]">
                      ${(selectedClient.saldoActual - Number.parseFloat(abonoData.monto || "0")).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseAbonoDialog}>
                Cancelar
              </Button>
              <Button type="submit">Registrar Abono</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Historial Dialog */}
      <Dialog open={historialDialogOpen} onOpenChange={setHistorialDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historial de Abonos</DialogTitle>
            <DialogDescription>
              Cliente: {selectedClient?.nombre} | Saldo Actual: ${selectedClient?.saldoActual.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {abonos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay abonos registrados</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abonos.map((abono) => (
                    <TableRow key={abono.id}>
                      <TableCell>{new Date(abono.fecha).toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-[#D4AF37]">${abono.monto.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{abono.metodoPago}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{abono.referencia || "-"}</TableCell>
                      <TableCell className="text-sm">{abono.usuario}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar cliente?"
        description="Esta acción eliminará permanentemente este cliente del sistema. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}
