"use client"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Plus, Edit, Users, Loader2, Trash2, CheckCircle2, XCircle, AlertCircle, Ban, Check } from "lucide-react"
import type { Usuario, UsuarioFormData } from "@/lib/types"
import { SidebarToggle } from "./app-sidebar"
import { Can } from "@/components/auth/can"
import { ROLE_INFO } from "@/lib/auth/permissions"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function UsuariosContent() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [usuarioToToggle, setUsuarioToToggle] = useState<Usuario | null>(null)
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null)
  
  // Estados separados para crear
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState<UsuarioFormData>({
    username: "",
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    telefono: "",
    rol: "vendedor",
    estado: "activo",
  })
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({})
  const [createSubmitting, setCreateSubmitting] = useState(false)
  
  // Estados separados para editar
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [editFormData, setEditFormData] = useState<UsuarioFormData>({
    username: "",
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    telefono: "",
    rol: "vendedor",
    estado: "activo",
  })
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})
  const [editSubmitting, setEditSubmitting] = useState(false)

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/usuarios')
      
      if (response.status === 401) {
        // No autenticado, redirigir al login
        window.location.href = '/login'
        return
      }
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al cargar usuarios')
      }
      
      const data = await response.json()
      setUsuarios(data)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al cargar', {
        description: error.message || 'No se pudieron cargar los usuarios',
        icon: <XCircle className="h-5 w-5" />
      })
    } finally {
      setLoading(false)
    }
  }

  // Validación para formulario de creación
  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!createFormData.username.trim()) {
      errors.username = 'El username es obligatorio'
    } else if (createFormData.username.length < 3) {
      errors.username = 'El username debe tener al menos 3 caracteres'
    }

    if (!createFormData.email.trim()) {
      errors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email)) {
      errors.email = 'Email inválido'
    }

    if (!createFormData.password) {
      errors.password = 'La contraseña es obligatoria'
    } else if (createFormData.password.length < 4) {
      errors.password = 'La contraseña debe tener al menos 4 caracteres'
    }

    if (!createFormData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio'
    }

    if (!createFormData.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio'
    }

    setCreateFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validación para formulario de edición
  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!editFormData.username.trim()) {
      errors.username = 'El username es obligatorio'
    } else if (editFormData.username.length < 3) {
      errors.username = 'El username debe tener al menos 3 caracteres'
    }

    if (!editFormData.email.trim()) {
      errors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Email inválido'
    }

    if (editFormData.password && editFormData.password.length < 4) {
      errors.password = 'La contraseña debe tener al menos 4 caracteres'
    }

    if (!editFormData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio'
    }

    if (!editFormData.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio'
    }

    setEditFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handler para crear usuario
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCreateForm()) {
      return
    }

    try {
      setCreateSubmitting(true)

      // Preparar datos limpios
      const dataToSend = {
        username: createFormData.username.trim(),
        email: createFormData.email.trim(),
        password: createFormData.password.trim(),
        nombre: createFormData.nombre.trim(),
        apellido: createFormData.apellido.trim(),
        telefono: createFormData.telefono?.trim() || null,
        rol: createFormData.rol,
        estado: 'activo'
      }

      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario')
      }

      toast.success('¡Usuario creado!', {
        description: `${createFormData.nombre} ${createFormData.apellido} ha sido agregado exitosamente`,
        icon: <CheckCircle2 className="h-5 w-5" />,
        duration: 4000
      })
      loadUsuarios()
      handleCloseCreateDialog()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al crear usuario', {
        description: error.message || 'No se pudo crear el usuario. Por favor intenta nuevamente',
        icon: <XCircle className="h-5 w-5" />,
        duration: 5000
      })
    } finally {
      setCreateSubmitting(false)
    }
  }

  // Handler para editar usuario
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEditForm() || !editingUser) {
      return
    }

    try {
      setEditSubmitting(true)

      // Preparar datos limpios: todos los strings vacíos a null
      const dataToSend: any = {
        username: editFormData.username.trim(),
        email: editFormData.email.trim(),
        nombre: editFormData.nombre.trim(),
        apellido: editFormData.apellido.trim(),
        telefono: editFormData.telefono?.trim() || null,
        rol: editFormData.rol,
        estado: editFormData.estado || 'activo'
      }
      
      // Solo agregar password si hay una nueva
      const newPassword = editFormData.password?.trim()
      if (newPassword && newPassword.length > 0) {
        dataToSend.password = newPassword
      }

      const response = await fetch(`/api/usuarios/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar usuario')
      }

      toast.success('¡Usuario actualizado!', {
        description: `Los datos de ${editFormData.nombre} ${editFormData.apellido} han sido actualizados`,
        icon: <CheckCircle2 className="h-5 w-5" />,
        duration: 4000
      })
      loadUsuarios()
      handleCloseEditDialog()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al actualizar', {
        description: error.message || 'No se pudieron guardar los cambios. Por favor intenta nuevamente',
        icon: <XCircle className="h-5 w-5" />,
        duration: 5000
      })
    } finally {
      setEditSubmitting(false)
    }
  }

  // Abrir diálogo para crear
  const handleOpenCreateDialog = () => {
    setCreateFormData({
      username: "",
      email: "",
      password: "",
      nombre: "",
      apellido: "",
      telefono: "",
      rol: "vendedor",
      estado: "activo",
    })
    setCreateFormErrors({})
    setCreateDialogOpen(true)
  }

  // Cerrar diálogo de crear
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false)
    setCreateFormData({
      username: "",
      email: "",
      password: "",
      nombre: "",
      apellido: "",
      telefono: "",
      rol: "vendedor",
      estado: "activo",
    })
    setCreateFormErrors({})
  }

  // Abrir diálogo para editar
  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario)
    setEditFormData({
      username: usuario.username,
      email: usuario.email,
      password: "",
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono || "",
      rol: usuario.rol,
      estado: usuario.estado,
    })
    setEditFormErrors({})
    setEditDialogOpen(true)
  }

  // Cerrar diálogo de editar
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setEditingUser(null)
    setEditFormData({
      username: "",
      email: "",
      password: "",
      nombre: "",
      apellido: "",
      telefono: "",
      rol: "vendedor",
      estado: "activo",
    })
    setEditFormErrors({})
  }

  // Activar/Desactivar usuario
  const handleToggleEstado = (usuario: Usuario) => {
    setUsuarioToToggle(usuario)
    setConfirmToggleOpen(true)
  }

  const confirmToggleEstado = async () => {
    if (!usuarioToToggle) return

    const nuevoEstado = usuarioToToggle.estado === 'activo' ? 'inactivo' : 'activo'
    const accion = nuevoEstado === 'activo' ? 'activar' : 'desactivar'

    try {
      const response = await fetch(`/api/usuarios/${usuarioToToggle.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Error al ${accion} usuario`)
      }

      toast.success(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`, {
        description: `${usuarioToToggle.nombre} ${usuarioToToggle.apellido} ha sido ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`,
        icon: <CheckCircle2 className="h-5 w-5" />,
        duration: 4000
      })
      loadUsuarios()
      setUsuarioToToggle(null)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(`Error al ${accion}`, {
        description: error.message || `No se pudo ${accion} el usuario. Por favor intenta nuevamente`,
        icon: <XCircle className="h-5 w-5" />,
        duration: 5000
      })
    }
  }

  // Eliminar usuario (borrado permanente)
  const handleDelete = (usuario: Usuario) => {
    if (usuario.username === 'admin') {
      toast.warning('Acción no permitida', {
        description: 'No se puede eliminar el usuario administrador principal',
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 4000
      })
      return
    }

    setUsuarioToDelete(usuario)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!usuarioToDelete) return

    try {
      const response = await fetch(`/api/usuarios/${usuarioToDelete.id}?permanente=true`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar usuario')
      }

      toast.success('Usuario eliminado', {
        description: `${usuarioToDelete.nombre} ${usuarioToDelete.apellido} ha sido eliminado permanentemente del sistema`,
        icon: <CheckCircle2 className="h-5 w-5" />,
        duration: 4000
      })
      loadUsuarios()
      setUsuarioToDelete(null)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al eliminar', {
        description: error.message || 'No se pudo eliminar el usuario. Por favor intenta nuevamente',
        icon: <XCircle className="h-5 w-5" />,
        duration: 5000
      })
    }
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      activo: <Badge className="bg-green-500">Activo</Badge>,
      inactivo: <Badge variant="secondary">Inactivo</Badge>,
      suspendido: <Badge variant="destructive">Suspendido</Badge>,
    }
    return badges[estado as keyof typeof badges] || <Badge>{estado}</Badge>
  }

  const getRolBadge = (rol: string) => {
    const info = ROLE_INFO[rol as keyof typeof ROLE_INFO]
    return info ? (
      <Badge className={info.color}>{info.nombre}</Badge>
    ) : (
      <Badge>{rol}</Badge>
    )
  }

  const usuariosActivos = usuarios.filter(u => u.estado === 'activo').length
  const usuariosAdmins = usuarios.filter(u => u.rol === 'administrador').length
  const usuariosVendedores = usuarios.filter(u => u.rol === 'vendedor').length

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />  
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Usuarios del Sistema</h1>
            <p className="text-sm text-muted-foreground md:text-base">Gestión de usuarios y roles</p>
          </div>
        </div>
        <Can permission="usuarios.crear">
          <Button onClick={handleOpenCreateDialog} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </Can>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuarios.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuariosActivos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuariosAdmins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuariosVendedores}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>Administra los usuarios del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay usuarios registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.username}</TableCell>
                      <TableCell>{usuario.nombre} {usuario.apellido}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.telefono || '-'}</TableCell>
                      <TableCell>{getRolBadge(usuario.rol)}</TableCell>
                      <TableCell>{getEstadoBadge(usuario.estado)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Can permission="usuarios.editar">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(usuario)}
                              title="Editar usuario"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Can>
                          <Can permission="usuarios.editar">
                            {usuario.username !== 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleEstado(usuario)}
                                title={usuario.estado === 'activo' ? 'Desactivar usuario' : 'Activar usuario'}
                                className={usuario.estado === 'inactivo' ? 'text-green-600 hover:text-green-700' : ''}
                              >
                                {usuario.estado === 'activo' ? (
                                  <Ban className="h-4 w-4" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </Can>
                          <Can permission="usuarios.eliminar">
                            {usuario.username !== 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(usuario)}
                                title="Eliminar usuario permanentemente"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </Can>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para CREAR Usuario */}
      <Dialog open={createDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa el formulario para crear un nuevo usuario
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-username">Username *</Label>
                <Input
                  id="create-username"
                  value={createFormData.username}
                  onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
                  placeholder="usuario123"
                  disabled={createSubmitting}
                />
                {createFormErrors.username && (
                  <p className="text-sm text-red-500 mt-1">{createFormErrors.username}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-nombre">Nombre *</Label>
                  <Input
                    id="create-nombre"
                    value={createFormData.nombre}
                    onChange={(e) => setCreateFormData({ ...createFormData, nombre: e.target.value })}
                    placeholder="Juan"
                    disabled={createSubmitting}
                  />
                  {createFormErrors.nombre && (
                    <p className="text-sm text-red-500 mt-1">{createFormErrors.nombre}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="create-apellido">Apellido *</Label>
                  <Input
                    id="create-apellido"
                    value={createFormData.apellido}
                    onChange={(e) => setCreateFormData({ ...createFormData, apellido: e.target.value })}
                    placeholder="Pérez"
                    disabled={createSubmitting}
                  />
                  {createFormErrors.apellido && (
                    <p className="text-sm text-red-500 mt-1">{createFormErrors.apellido}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  placeholder="usuario@ejemplo.com"
                  disabled={createSubmitting}
                />
                {createFormErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{createFormErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="create-telefono">Teléfono</Label>
                <Input
                  id="create-telefono"
                  value={createFormData.telefono}
                  onChange={(e) => setCreateFormData({ ...createFormData, telefono: e.target.value })}
                  placeholder="0999999999"
                  disabled={createSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="create-password">Contraseña *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={createSubmitting}
                />
                {createFormErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{createFormErrors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="create-rol">Rol *</Label>
                <Select
                  value={createFormData.rol}
                  onValueChange={(value: any) => setCreateFormData({ ...createFormData, rol: value })}
                  disabled={createSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">
                      <div>
                        <div className="font-medium">Administrador</div>
                        <div className="text-xs text-muted-foreground">
                          {ROLE_INFO.administrador.descripcion}
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="vendedor">
                      <div>
                        <div className="font-medium">Vendedor</div>
                        <div className="text-xs text-muted-foreground">
                          {ROLE_INFO.vendedor.descripcion}
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateDialog}
                disabled={createSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createSubmitting}>
                {createSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para EDITAR Usuario */}
      <Dialog open={editDialogOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Username *</Label>
                <Input
                  id="edit-username"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                  placeholder="usuario123"
                  disabled={editSubmitting}
                />
                {editFormErrors.username && (
                  <p className="text-sm text-red-500 mt-1">{editFormErrors.username}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nombre">Nombre *</Label>
                  <Input
                    id="edit-nombre"
                    value={editFormData.nombre}
                    onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                    placeholder="Juan"
                    disabled={editSubmitting}
                  />
                  {editFormErrors.nombre && (
                    <p className="text-sm text-red-500 mt-1">{editFormErrors.nombre}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-apellido">Apellido *</Label>
                  <Input
                    id="edit-apellido"
                    value={editFormData.apellido}
                    onChange={(e) => setEditFormData({ ...editFormData, apellido: e.target.value })}
                    placeholder="Pérez"
                    disabled={editSubmitting}
                  />
                  {editFormErrors.apellido && (
                    <p className="text-sm text-red-500 mt-1">{editFormErrors.apellido}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="usuario@ejemplo.com"
                  disabled={editSubmitting}
                />
                {editFormErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{editFormErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input
                  id="edit-telefono"
                  value={editFormData.telefono}
                  onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
                  placeholder="0999999999"
                  disabled={editSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="edit-password">
                  Contraseña (dejar vacío para no cambiar)
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={editSubmitting}
                />
                {editFormErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{editFormErrors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-rol">Rol *</Label>
                <Select
                  value={editFormData.rol}
                  onValueChange={(value: any) => setEditFormData({ ...editFormData, rol: value })}
                  disabled={editSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">
                      <div>
                        <div className="font-medium">Administrador</div>
                        <div className="text-xs text-muted-foreground">
                          {ROLE_INFO.administrador.descripcion}
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="vendedor">
                      <div>
                        <div className="font-medium">Vendedor</div>
                        <div className="text-xs text-muted-foreground">
                          {ROLE_INFO.vendedor.descripcion}
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-estado">Estado</Label>
                <Select
                  value={editFormData.estado}
                  onValueChange={(value: any) => setEditFormData({ ...editFormData, estado: value })}
                  disabled={editSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEditDialog}
                disabled={editSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={editSubmitting}>
                {editSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar Usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmToggleOpen}
        onOpenChange={setConfirmToggleOpen}
        onConfirm={confirmToggleEstado}
        title={usuarioToToggle?.estado === 'activo' ? '¿Desactivar usuario?' : '¿Activar usuario?'}
        description={
          usuarioToToggle?.estado === 'activo'
            ? `¿Estás seguro de desactivar a ${usuarioToToggle?.nombre}? El usuario no podrá acceder al sistema hasta que sea reactivado.`
            : `¿Estás seguro de activar a ${usuarioToToggle?.nombre}? El usuario podrá acceder nuevamente al sistema.`
        }
        confirmText={usuarioToToggle?.estado === 'activo' ? 'Desactivar' : 'Activar'}
        cancelText="Cancelar"
        variant={usuarioToToggle?.estado === 'activo' ? 'default' : 'default'}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={confirmDelete}
        title="⚠️ ¿Eliminar usuario permanentemente?"
        description={`Estás a punto de eliminar permanentemente a ${usuarioToDelete?.nombre} ${usuarioToDelete?.apellido} del sistema. Esta acción no se puede deshacer y se perderán todos los datos asociados a este usuario.`}
        confirmText="Eliminar permanentemente"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}
