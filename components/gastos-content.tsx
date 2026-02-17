"use client"

import { useState, useEffect } from "react"
import { Search, DollarSign, Plus, Edit, Trash2, Receipt, Calendar, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { SidebarToggle } from "@/components/app-sidebar"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
import { formatCurrency, normalizeText } from "@/lib/utils"

interface Gasto {
  id: number
  categoria: string
  descripcion: string
  monto: number
  fecha_gasto: string
  metodo_pago: string
  referencia?: string
  notas?: string
  usuario_id: number
  usuario_nombre?: string
  created_at: string
  updated_at: string
}

const CATEGORIAS_GASTOS = [
  { value: "servicios", label: "Servicios (luz, agua, internet)" },
  { value: "arriendo", label: "Arriendo/Alquiler" },
  { value: "transporte", label: "Transporte/Domicilios" },
  { value: "compras_suministros", label: "Compras y Suministros" },
  { value: "nomina", label: "Nómina/Salarios" },
  { value: "publicidad", label: "Publicidad y Marketing" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "impuestos", label: "Impuestos" },
  { value: "servicios_profesionales", label: "Servicios Profesionales" },
  { value: "otros", label: "Otros" }
]

export function GastosContent() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [gastoToDelete, setGastoToDelete] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [showDateFilters, setShowDateFilters] = useState(false)

  const [formData, setFormData] = useState({
    categoria: "servicios",
    descripcion: "",
    monto: "",
    fecha_gasto: new Date().toISOString().split('T')[0],
    metodo_pago: "efectivo",
    referencia: "",
    notas: ""
  })

  useEffect(() => {
    loadGastos()
  }, [])

  const loadGastos = async (fechaInicioParam?: string, fechaFinParam?: string) => {
    try {
      setLoading(true)
      let url = '/api/gastos'
      const params = new URLSearchParams()
      
      if (fechaInicioParam) params.append('fechaInicio', fechaInicioParam)
      if (fechaFinParam) params.append('fechaFin', fechaFinParam)
      
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      if (response.ok) {
        const result = await response.json()
        setGastos(result.data || [])
      } else {
        toast.error('Error al cargar gastos')
      }
    } catch (error) {
      console.error('Error cargando gastos:', error)
      toast.error('Error al cargar gastos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.descripcion || !formData.monto || !formData.fecha_gasto) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    const montoNumerico = parseFloat(formData.monto)
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    try {
      setLoading(true)
      const body = {
        id: editingGasto?.id,
        categoria: formData.categoria,
        descripcion: formData.descripcion,
        monto: montoNumerico,
        fecha_gasto: formData.fecha_gasto,
        metodo_pago: formData.metodo_pago,
        referencia: formData.referencia || null,
        notas: formData.notas || null
      }

      const url = editingGasto ? `/api/gastos/${editingGasto.id}` : '/api/gastos'
      const method = editingGasto ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(editingGasto ? 'Gasto actualizado' : 'Gasto registrado')
        handleCloseDialog()
        loadGastos()
      } else {
        toast.error(result.message || 'Error al guardar gasto')
      }
    } catch (error) {
      console.error('Error guardando gasto:', error)
      toast.error('Error al guardar gasto')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (gasto: Gasto) => {
    setEditingGasto(gasto)
    setFormData({
      categoria: gasto.categoria,
      descripcion: gasto.descripcion,
      monto: gasto.monto.toString(),
      fecha_gasto: gasto.fecha_gasto,
      metodo_pago: gasto.metodo_pago,
      referencia: gasto.referencia || "",
      notas: gasto.notas || ""
    })
    setDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setGastoToDelete(id)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!gastoToDelete) return

    try {
      setLoading(true)
      const response = await fetch(`/api/gastos/${gastoToDelete}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success('Gasto eliminado')
        loadGastos()
      } else {
        toast.error(result.message || 'Error al eliminar gasto')
      }
    } catch (error) {
      console.error('Error eliminando gasto:', error)
      toast.error('Error al eliminar gasto')
    } finally {
      setLoading(false)
      setConfirmDeleteOpen(false)
      setGastoToDelete(null)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingGasto(null)
    setFormData({
      categoria: "servicios",
      descripcion: "",
      monto: "",
      fecha_gasto: new Date().toISOString().split('T')[0],
      metodo_pago: "efectivo",
      referencia: "",
      notas: ""
    })
  }

  const getCategoriaLabel = (categoria: string) => {
    return CATEGORIAS_GASTOS.find(c => c.value === categoria)?.label || categoria
  }

  const filteredGastos = gastos.filter(g => {
    const searchNormalized = normalizeText(searchTerm)
    return (
      normalizeText(g.descripcion).includes(searchNormalized) ||
      normalizeText(getCategoriaLabel(g.categoria)).includes(searchNormalized) ||
      normalizeText(g.referencia || '').includes(searchNormalized) ||
      normalizeText(g.metodo_pago).includes(searchNormalized) ||
      g.monto.toString().includes(searchTerm)
    )
  })

  // Calcular totales
  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0)
  const gastosEfectivo = gastos.filter(g => g.metodo_pago === 'efectivo').reduce((sum, g) => sum + Number(g.monto), 0)
  const gastosTransferencia = gastos.filter(g => g.metodo_pago === 'transferencia').reduce((sum, g) => sum + Number(g.monto), 0)

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gastos</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Registro y control de gastos operativos
            </p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${formatCurrency(totalGastos)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {gastos.length} {gastos.length === 1 ? 'registro' : 'registros'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos en Efectivo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(gastosEfectivo)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos por Transferencia</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatCurrency(gastosTransferencia)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Gasto</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${formatCurrency(gastos.length > 0 ? totalGastos / gastos.length : 0)}
            </div>
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
                  placeholder="Buscar por descripción, categoría, referencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant={showDateFilters ? "default" : "outline"}
                onClick={() => setShowDateFilters(!showDateFilters)}
                className="whitespace-nowrap"
              >
                {showDateFilters ? "Ocultar Fechas" : "Filtrar por Fechas"}
              </Button>
            </div>

            {showDateFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
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
                      loadGastos()
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                  <Button
                    type="button"
                    onClick={() => loadGastos(fechaInicio, fechaFin)}
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
                <TableHead>Fecha</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="hidden md:table-cell">Método Pago</TableHead>
                <TableHead className="hidden lg:table-cell">Referencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && gastos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Cargando gastos...
                  </TableCell>
                </TableRow>
              ) : filteredGastos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron gastos
                  </TableCell>
                </TableRow>
              ) : (
                filteredGastos.map((gasto) => (
                  <TableRow key={gasto.id}>
                    <TableCell className="font-medium">
                      {new Date(gasto.fecha_gasto).toLocaleDateString('es-EC')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoriaLabel(gasto.categoria)}
                      </Badge>
                    </TableCell>
                    <TableCell>{gasto.descripcion}</TableCell>
                    <TableCell className="text-right font-bold text-destructive">
                      ${formatCurrency(gasto.monto)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell capitalize">
                      {gasto.metodo_pago}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {gasto.referencia ? (
                        <span className="text-sm text-muted-foreground">{gasto.referencia}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(gasto)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(gasto.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Dialog: Crear/Editar Gasto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingGasto ? "Editar Gasto" : "Registrar Nuevo Gasto"}
            </DialogTitle>
            <DialogDescription>
              {editingGasto 
                ? "Modifica los datos del gasto" 
                : "Completa la información del gasto a registrar"
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_GASTOS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_gasto">Fecha del Gasto *</Label>
                  <Input
                    id="fecha_gasto"
                    type="date"
                    value={formData.fecha_gasto}
                    onChange={(e) => setFormData({ ...formData, fecha_gasto: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Input
                  id="descripcion"
                  placeholder="Ej: Pago servicio de luz mes de febrero"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto *</Label>
                  <Input
                    id="monto"
                    type="text"
                    placeholder="0"
                    value={formData.monto ? formatCurrency(formData.monto) : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                      setFormData({ ...formData, monto: value })
                    }}
                    onFocus={(e) => {
                      if (formData.monto) {
                        e.target.value = formData.monto
                      }
                    }}
                    onBlur={(e) => {
                      if (formData.monto) {
                        e.target.value = formatCurrency(formData.monto)
                      }
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metodo_pago">Método de Pago *</Label>
                  <Select
                    value={formData.metodo_pago}
                    onValueChange={(value) => setFormData({ ...formData, metodo_pago: value })}
                  >
                    <SelectTrigger id="metodo_pago">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referencia">Referencia (Factura, Comprobante)</Label>
                <Input
                  id="referencia"
                  placeholder="Número de factura o comprobante"
                  value={formData.referencia}
                  onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas u Observaciones</Label>
                <Textarea
                  id="notas"
                  placeholder="Información adicional..."
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : editingGasto ? "Actualizar" : "Registrar"}
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
        title="Eliminar Gasto"
        description="¿Estás seguro de eliminar este gasto? Esta acción no se puede deshacer."
      />
    </div>
  )
}
