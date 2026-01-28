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
import { Search, Plus, Edit, Trash2, Building2, Phone, Mail, Ban, CheckCircle } from "lucide-react"
import { SidebarToggle } from "./app-sidebar"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type Proveedor = {
  id: number
  codigo?: string
  ruc: string
  razon_social: string
  nombre_comercial?: string
  telefono: string
  celular?: string
  email?: string
  direccion?: string
  ciudad?: string
  provincia?: string
  persona_contacto?: string
  telefono_contacto?: string
  estado: 'activo' | 'inactivo'
  created_at: string
  updated_at: string
}

export function ProveedoresContent() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [proveedorToDelete, setProveedorToDelete] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    codigo: "",
    razonSocial: "",
    nombreComercial: "",
    ruc: "",
    email: "",
    telefono: "",
    celular: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    personaContacto: "",
    telefonoContacto: "",
  })

  useEffect(() => {
    loadProveedores()
  }, [])

  const loadProveedores = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/proveedores')
      if (!response.ok) throw new Error('Error al cargar proveedores')
      const result = await response.json()
      // La API retorna { success: true, data: [...] }
      const data = result.data || result
      setProveedores(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error al cargar proveedores:', error)
      toast.error('Error al cargar proveedores', {
        description: error.message
      })
      setProveedores([])
    } finally {
      setLoading(false)
    }
  }

  const generarCodigoProveedor = () => {
    if (proveedores.length === 0) {
      return "PROV-001"
    }
    
    // El código ya no se usa, pero mantenemos la función por compatibilidad
    return `PROV-${(proveedores.length + 1).toString().padStart(3, '0')}`
  }

  const saveProveedor = (proveedor: Proveedor) => {
    const stored = localStorage.getItem("proveedores")
    const proveedores = stored ? JSON.parse(stored) : []
    
    const index = proveedores.findIndex((p: Proveedor) => p.id === proveedor.id)
    if (index >= 0) {
      proveedores[index] = proveedor
    } else {
      proveedores.push(proveedor)
    }
    
    localStorage.setItem("proveedores", JSON.stringify(proveedores))
  }

  const deleteProveedor = (id: string) => {
    const stored = localStorage.getItem("proveedores")
    if (stored) {
      const proveedores = JSON.parse(stored)
      const filtered = proveedores.filter((p: Proveedor) => p.id !== id)
      localStorage.setItem("proveedores", JSON.stringify(filtered))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      
      const proveedorData = {
        id: editingProveedor?.id,
        codigo: formData.codigo || generarCodigoProveedor(),
        ruc: formData.ruc,
        razonSocial: formData.razonSocial,
        nombreComercial: formData.nombreComercial || undefined,
        telefono: formData.telefono,
        celular: formData.celular || undefined,
        email: formData.email || undefined,
        direccion: formData.direccion || undefined,
        ciudad: formData.ciudad || undefined,
        provincia: formData.provincia || undefined,
        personaContacto: formData.personaContacto || undefined,
        telefonoContacto: formData.telefonoContacto || undefined,
      }

      const url = '/api/proveedores'
      const method = editingProveedor ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proveedorData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar proveedor')
      }

      await loadProveedores()
      handleCloseDialog()
      
      toast.success(editingProveedor ? "Proveedor actualizado" : "Proveedor creado", {
        description: `${formData.razonSocial} ha sido ${editingProveedor ? "actualizado" : "registrado"} correctamente`
      })
    } catch (error: any) {
      console.error('Error al guardar proveedor:', error)
      toast.error('Error al guardar proveedor', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setFormData({
      codigo: proveedor.codigo || "",
      ruc: proveedor.ruc,
      razonSocial: proveedor.razon_social,
      nombreComercial: proveedor.nombre_comercial || "",
      telefono: proveedor.telefono,
      celular: proveedor.celular || "",
      email: proveedor.email || "",
      direccion: proveedor.direccion || "",
      ciudad: proveedor.ciudad || "",
      provincia: proveedor.provincia || "",
      personaContacto: proveedor.persona_contacto || "",
      telefonoContacto: proveedor.telefono_contacto || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setProveedorToDelete(id)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (proveedorToDelete) {
      try {
        setLoading(true)
        const response = await fetch(`/api/proveedores?id=${proveedorToDelete}`, {
          method: 'DELETE',
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al eliminar proveedor')
        }

        await loadProveedores()
        toast.success("Proveedor eliminado", {
          description: "El proveedor ha sido eliminado del sistema"
        })
        setProveedorToDelete(null)
      } catch (error: any) {
        console.error('Error al eliminar proveedor:', error)
        toast.error('Error al eliminar proveedor', {
          description: error.message
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const toggleEstado = async (proveedor: Proveedor) => {
    try {
      setLoading(true)
      const nuevoEstado = proveedor.estado === 'activo' ? 'inactivo' : 'activo'
      
      const response = await fetch('/api/proveedores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: proveedor.id,
          ruc: proveedor.ruc,
          razonSocial: proveedor.razon_social,
          nombreComercial: proveedor.nombre_comercial,
          telefono: proveedor.telefono,
          celular: proveedor.celular,
          email: proveedor.email,
          direccion: proveedor.direccion,
          ciudad: proveedor.ciudad,
          provincia: proveedor.provincia,
          personaContacto: proveedor.persona_contacto,
          telefonoContacto: proveedor.telefono_contacto,
          estado: nuevoEstado
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar estado')
      }

      await loadProveedores()
      toast.success(`Proveedor ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`, {
        description: `${proveedor.razon_social} está ahora ${nuevoEstado}`
      })
    } catch (error: any) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar estado', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingProveedor(null)
    setFormData({
      codigo: "",
      razonSocial: "",
      nombreComercial: "",
      ruc: "",
      email: "",
      telefono: "",
      celular: "",
      direccion: "",
      ciudad: "",
      provincia: "",
      personaContacto: "",
      telefonoContacto: "",
    })
  }

  const filteredProveedores = (Array.isArray(proveedores) ? proveedores : []).filter(
    (p) =>
      p.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ruc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nombre_comercial && p.nombre_comercial.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalProveedores = Array.isArray(proveedores) ? proveedores.length : 0
  const proveedoresActivos = Array.isArray(proveedores) ? proveedores.filter((p) => p.estado === 'activo').length : 0

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Proveedores</h1>
            <p className="text-sm text-muted-foreground md:text-base">Gestión de proveedores y cuentas por pagar</p>
          </div>
        </div>
        <Button onClick={() => {
          setFormData({ ...formData, codigo: generarCodigoProveedor() })
          setDialogOpen(true)
        }} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProveedores}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{proveedoresActivos}</div>
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
                placeholder="Buscar proveedor por nombre o RUC..."
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
                <TableHead>Código</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="hidden md:table-cell">RUC</TableHead>
                <TableHead className="hidden lg:table-cell">Contacto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && proveedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Cargando proveedores...
                  </TableCell>
                </TableRow>
              ) : filteredProveedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron proveedores
                  </TableCell>
                </TableRow>
              ) : (
                filteredProveedores.map((proveedor) => (
                  <TableRow key={proveedor.id}>
                    <TableCell>
                      <div className="font-mono text-sm text-muted-foreground">
                        {proveedor.codigo || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{proveedor.razon_social}</p>
                        {proveedor.nombre_comercial && (
                          <p className="text-sm text-muted-foreground">{proveedor.nombre_comercial}</p>
                        )}
                        <p className="text-xs text-muted-foreground md:hidden">{proveedor.ruc}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{proveedor.ruc}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {proveedor.persona_contacto && (
                        <div className="text-sm">
                          <p className="font-medium">{proveedor.persona_contacto}</p>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{proveedor.telefono}</span>
                          </div>
                          {proveedor.email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{proveedor.email}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {!proveedor.persona_contacto && (
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{proveedor.telefono}</span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Badge variant={proveedor.estado === 'activo' ? 'default' : 'secondary'}>
                          {proveedor.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleEdit(proveedor)} 
                          disabled={loading}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleEstado(proveedor)}
                          disabled={loading}
                          title={proveedor.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        >
                          {proveedor.estado === 'activo' ? (
                            <Ban className="h-4 w-4 text-orange-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(proveedor.id)}
                          disabled={loading}
                          title="Eliminar"
                        >
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

      {/* Add/Edit Proveedor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
            <DialogDescription>Complete la información del proveedor</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de Proveedor</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  disabled
                  placeholder="Se genera automáticamente (ej: PROV-001)"
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruc">RUC *</Label>
                <Input
                  id="ruc"
                  value={formData.ruc}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  required
                  disabled={!!editingProveedor}
                  className={editingProveedor ? "bg-muted" : ""}
                />
                {editingProveedor && (
                  <p className="text-xs text-muted-foreground">El RUC no se puede modificar</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón Social *</Label>
                  <Input
                    id="razonSocial"
                    value={formData.razonSocial}
                    onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombreComercial">Nombre Comercial</Label>
                  <Input
                    id="nombreComercial"
                    value={formData.nombreComercial}
                    onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.celular}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
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
                <Textarea
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input
                    id="provincia"
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Información de Contacto</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="personaContacto">Persona de Contacto</Label>
                    <Input
                      id="personaContacto"
                      value={formData.personaContacto}
                      onChange={(e) => setFormData({ ...formData, personaContacto: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefonoContacto">Teléfono de Contacto</Label>
                    <Input
                      id="telefonoContacto"
                      value={formData.telefonoContacto}
                      onChange={(e) => setFormData({ ...formData, telefonoContacto: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : editingProveedor ? "Actualizar" : "Crear"} Proveedor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar proveedor?"
        description="Esta acción no se puede deshacer. El proveedor será eliminado permanentemente del sistema."
      />
    </div>
  )
}
