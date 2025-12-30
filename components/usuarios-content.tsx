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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Plus, Edit, UserCog, Users } from "lucide-react"
import type { Usuario } from "@/lib/types"
import { getUsuarios, saveUsuario, getCurrentUser, setCurrentUser } from "@/lib/storage"

const rolesConfig = {
  administrador: {
    label: "Administrador",
    color: "bg-red-500",
    description: "Acceso completo al sistema",
  },
  vendedor: {
    label: "Vendedor",
    color: "bg-blue-500",
    description: "Acceso a ventas y clientes",
  },
  contador: {
    label: "Contador",
    color: "bg-green-500",
    description: "Acceso a reportes y finanzas",
  },
  inventario: {
    label: "Inventario",
    color: "bg-purple-500",
    description: "Gestión de productos",
  },
}

export function UsuariosContent() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [currentUser, setCurrentUserState] = useState<Usuario | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "vendedor" as Usuario["rol"],
    permisos: {
      verCostos: false,
      editarPrecios: false,
      gestionarCreditos: false,
      verReportes: false,
      gestionarUsuarios: false,
      abrirCaja: false,
      hacerDescuentos: false,
    },
  })

  useEffect(() => {
    loadUsuarios()
    setCurrentUserState(getCurrentUser())
  }, [])

  const loadUsuarios = () => {
    setUsuarios(getUsuarios())
  }

  const handleRolChange = (rol: Usuario["rol"]) => {
    const permisosPreset = {
      administrador: {
        verCostos: true,
        editarPrecios: true,
        gestionarCreditos: true,
        verReportes: true,
        gestionarUsuarios: true,
        abrirCaja: true,
        hacerDescuentos: true,
      },
      vendedor: {
        verCostos: false,
        editarPrecios: false,
        gestionarCreditos: false,
        verReportes: false,
        gestionarUsuarios: false,
        abrirCaja: true,
        hacerDescuentos: false,
      },
      contador: {
        verCostos: true,
        editarPrecios: false,
        gestionarCreditos: false,
        verReportes: true,
        gestionarUsuarios: false,
        abrirCaja: false,
        hacerDescuentos: false,
      },
      inventario: {
        verCostos: true,
        editarPrecios: true,
        gestionarCreditos: false,
        verReportes: false,
        gestionarUsuarios: false,
        abrirCaja: false,
        hacerDescuentos: true,
      },
    }

    setFormData({
      ...formData,
      rol,
      permisos: permisosPreset[rol],
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const usuario: Usuario = {
      id: editingUser?.id || Date.now().toString(),
      nombre: formData.nombre,
      email: formData.email,
      rol: formData.rol,
      permisos: formData.permisos,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
    }

    saveUsuario(usuario)
    loadUsuarios()
    handleCloseDialog()
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario)
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      permisos: usuario.permisos,
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingUser(null)
    setFormData({
      nombre: "",
      email: "",
      rol: "vendedor",
      permisos: {
        verCostos: false,
        editarPrecios: false,
        gestionarCreditos: false,
        verReportes: false,
        gestionarUsuarios: false,
        abrirCaja: false,
        hacerDescuentos: false,
      },
    })
  }

  const handleSetCurrentUser = (usuario: Usuario) => {
    setCurrentUser(usuario)
    setCurrentUserState(usuario)
    alert(`Sesión cambiada a: ${usuario.nombre}`)
  }

  const canManageUsers = currentUser?.permisos.gestionarUsuarios

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios y Roles</h1>
          <p className="text-muted-foreground">Gestión de usuarios y permisos del sistema</p>
        </div>
        {canManageUsers && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Current User Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Usuario Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser && (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-lg">{currentUser.nombre}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                <Badge className={rolesConfig[currentUser.rol].color}>{rolesConfig[currentUser.rol].label}</Badge>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium mb-2">Permisos Activos:</p>
                <div className="flex flex-wrap gap-1 justify-end">
                  {Object.entries(currentUser.permisos)
                    .filter(([_, value]) => value)
                    .map(([key]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
        {Object.entries(rolesConfig).map(([key, config]) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{config.label}s</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usuarios.filter((u) => u.rol === key).length}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>Lista de usuarios registrados y sus roles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nombre}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Badge className={rolesConfig[usuario.rol].color}>{rolesConfig[usuario.rol].label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(usuario.permisos)
                        .filter(([_, value]) => value)
                        .slice(0, 3)
                        .map(([key]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}
                          </Badge>
                        ))}
                      {Object.values(usuario.permisos).filter((v) => v).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{Object.values(usuario.permisos).filter((v) => v).length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(usuario.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleSetCurrentUser(usuario)}>
                        Usar
                      </Button>
                      {canManageUsers && (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(usuario)}>
                          <Edit className="h-4 w-4" />
                        </Button>
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
            <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
            <DialogDescription>Configure el rol y permisos del usuario</DialogDescription>
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol del Usuario *</Label>
                <Select value={formData.rol} onValueChange={handleRolChange}>
                  <SelectTrigger id="rol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(rolesConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="font-medium">{config.label}</span>
                          <span className="text-xs text-muted-foreground">{config.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-[#D4AF37]">Permisos Específicos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verCostos"
                      checked={formData.permisos.verCostos}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          permisos: { ...formData.permisos, verCostos: checked as boolean },
                        })
                      }
                    />
                    <label
                      htmlFor="verCostos"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ver Costos
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="editarPrecios"
                      checked={formData.permisos.editarPrecios}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          permisos: { ...formData.permisos, editarPrecios: checked as boolean },
                        })
                      }
                    />
                    <label
                      htmlFor="editarPrecios"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Editar Precios
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gestionarCreditos"
                      checked={formData.permisos.gestionarCreditos}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          permisos: { ...formData.permisos, gestionarCreditos: checked as boolean },
                        })
                      }
                    />
                    <label
                      htmlFor="gestionarCreditos"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Gestionar Créditos
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verReportes"
                      checked={formData.permisos.verReportes}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          permisos: { ...formData.permisos, verReportes: checked as boolean },
                        })
                      }
                    />
                    <label
                      htmlFor="verReportes"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ver Reportes
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gestionarUsuarios"
                      checked={formData.permisos.gestionarUsuarios}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          permisos: { ...formData.permisos, gestionarUsuarios: checked as boolean },
                        })
                      }
                    />
                    <label
                      htmlFor="gestionarUsuarios"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Gestionar Usuarios
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="abrirCaja"
                      checked={formData.permisos.abrirCaja}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          permisos: { ...formData.permisos, abrirCaja: checked as boolean },
                        })
                      }
                    />
                    <label
                      htmlFor="abrirCaja"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Abrir Caja
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hacerDescuentos"
                      checked={formData.permisos.hacerDescuentos}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          permisos: { ...formData.permisos, hacerDescuentos: checked as boolean },
                        })
                      }
                    />
                    <label
                      htmlFor="hacerDescuentos"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Hacer Descuentos
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">{editingUser ? "Guardar Cambios" : "Crear Usuario"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
