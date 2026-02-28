"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SidebarToggle } from "@/components/app-sidebar"
import { toast } from "sonner"
import {
    Settings, FolderTree, Shirt, Ruler, Plus, Pencil, Search, Save,
    ChevronRight, Receipt, ArrowLeft, Trash2,
} from "lucide-react"

/* ═══════════════════════════════ Tipos ═══════════════════════════════ */
interface Categoria { id: number; nombre: string; descripcion?: string }
interface TipoPrenda { id: number; nombre: string; categoria_padre_id: number; descripcion?: string }
interface Talla { id: number; valor: string; sistema_talla_id: number }
interface SistemaTalla { id: number; nombre: string; descripcion?: string; tipo?: string }
interface TipoGasto { id: number; nombre: string; label: string; estado?: string }

type ActiveView = "menu" | "categorias" | "tipos" | "tallas" | "gastos"

/* ═══════════════════════════════ Principal ═══════════════════════════════ */
export function ConfiguracionesContent() {
    const [activeView, setActiveView] = useState<ActiveView>("menu")
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [tiposPrenda, setTiposPrenda] = useState<TipoPrenda[]>([])
    const [tallas, setTallas] = useState<Talla[]>([])
    const [sistemasTalla, setSistemasTalla] = useState<SistemaTalla[]>([])
    const [asignaciones, setAsignaciones] = useState<{ tipo_prenda_id: number; sistema_talla_id: number }[]>([])
    const [tiposGasto, setTiposGasto] = useState<TipoGasto[]>([])

    const loadAll = useCallback(() => {
        fetch("/api/categorias-padre").then(r => r.json()).then(j => { if (j.success) setCategorias(j.data || []) })
        fetch("/api/tipos-prenda").then(r => r.json()).then(j => { if (j.success) setTiposPrenda(j.data || []) })
        fetch("/api/tallas").then(r => r.json()).then(j => { if (j.success) setTallas(j.data || []) })
        fetch("/api/sistemas-tallas").then(r => r.json()).then(j => { if (j.success) setSistemasTalla(j.data || []) })
        fetch("/api/tipo-prenda-tallas").then(r => r.json()).then(j => { if (j.success) setAsignaciones(j.data || []) })
        fetch("/api/tipos-gastos").then(r => r.json()).then(j => { if (j.success) setTiposGasto(j.data || []) })
    }, [])

    useEffect(() => { loadAll() }, [loadAll])

    const goBack = () => setActiveView("menu")

    const menuItems = [
        {
            key: "categorias" as ActiveView,
            icon: FolderTree,
            title: "Categorías Padre",
            desc: "Agrupa los tipos de prenda en categorías principales",
            count: categorias.length,
            color: "emerald",
            bgClass: "bg-emerald-50 dark:bg-emerald-950",
            iconClass: "text-emerald-600",
            borderClass: "hover:border-emerald-300 hover:shadow-emerald-100",
            badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
        },
        {
            key: "tipos" as ActiveView,
            icon: Shirt,
            title: "Tipos de Prenda",
            desc: "Define los tipos de prenda y asigna sistemas de tallas",
            count: tiposPrenda.length,
            color: "blue",
            bgClass: "bg-blue-50 dark:bg-blue-950",
            iconClass: "text-blue-600",
            borderClass: "hover:border-blue-300 hover:shadow-blue-100",
            badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        },
        {
            key: "tallas" as ActiveView,
            icon: Ruler,
            title: "Tallas",
            desc: "Gestiona las tallas por sistema (letras, numérica, jeans, calzado)",
            count: tallas.length,
            color: "purple",
            bgClass: "bg-purple-50 dark:bg-purple-950",
            iconClass: "text-purple-600",
            borderClass: "hover:border-purple-300 hover:shadow-purple-100",
            badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        },
        {
            key: "gastos" as ActiveView,
            icon: Receipt,
            title: "Tipos de Gastos",
            desc: "Categorías disponibles al registrar un gasto",
            count: tiposGasto.length,
            color: "amber",
            bgClass: "bg-amber-50 dark:bg-amber-950",
            iconClass: "text-amber-600",
            borderClass: "hover:border-amber-300 hover:shadow-amber-100",
            badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
        },
    ]

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="flex items-center gap-3 border-b px-4 py-2 bg-background shrink-0">
                <SidebarToggle />
                {activeView !== "menu" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <Settings className="h-5 w-5 text-emerald-600" />
                <div>
                    <h1 className="text-lg font-bold leading-tight">
                        {activeView === "menu" && "Configuraciones"}
                        {activeView === "categorias" && "Categorías Padre"}
                        {activeView === "tipos" && "Tipos de Prenda"}
                        {activeView === "tallas" && "Tallas"}
                        {activeView === "gastos" && "Tipos de Gastos"}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {activeView === "menu" && "Selecciona una sección para administrar"}
                        {activeView === "categorias" && "Agrupa los tipos de prenda en categorías principales"}
                        {activeView === "tipos" && "Define tipos de prenda y asigna sistemas de tallas"}
                        {activeView === "tallas" && "Gestiona las tallas organizadas por sistema"}
                        {activeView === "gastos" && "Categorías disponibles al registrar un gasto"}
                    </p>
                </div>
            </header>

            <div className="flex-1 overflow-auto">
                <div className="max-w-5xl mx-auto p-4 pb-12">

                    {/* ══════ Vista Principal: Menú de tarjetas ══════ */}
                    {activeView === "menu" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            {menuItems.map(item => (
                                <Card
                                    key={item.key}
                                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${item.borderClass}`}
                                    onClick={() => setActiveView(item.key)}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${item.bgClass} shrink-0`}>
                                                <item.icon className={`h-6 w-6 ${item.iconClass}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-sm">{item.title}</h3>
                                                    <Badge className={`text-[10px] px-2 border-0 ${item.badgeClass}`}>
                                                        {item.count}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground/40 mt-1 shrink-0" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* ══════ Vista Detalle: Categorías ══════ */}
                    {activeView === "categorias" && (
                        <CategoriasView categorias={categorias} onReload={loadAll} />
                    )}

                    {/* ══════ Vista Detalle: Tipos de Prenda ══════ */}
                    {activeView === "tipos" && (
                        <TiposPrendaView
                            tipos={tiposPrenda}
                            categorias={categorias}
                            sistemasTalla={sistemasTalla}
                            asignaciones={asignaciones}
                            onReload={loadAll}
                        />
                    )}

                    {/* ══════ Vista Detalle: Tallas ══════ */}
                    {activeView === "tallas" && (
                        <TallasView tallas={tallas} sistemasTalla={sistemasTalla} onReload={loadAll} />
                    )}

                    {/* ══════ Vista Detalle: Tipos de Gastos ══════ */}
                    {activeView === "gastos" && (
                        <TiposGastoView tiposGasto={tiposGasto} onReload={loadAll} />
                    )}

                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   VISTA: Categorías Padre
   ═══════════════════════════════════════════════════════════════════════════ */
function CategoriasView({ categorias, onReload }: { categorias: Categoria[]; onReload: () => void }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Categoria | null>(null)
    const [nombre, setNombre] = useState("")
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState("")
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const filtered = categorias.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()))

    const openCreate = () => { setEditing(null); setNombre(""); setDialogOpen(true) }
    const openEdit = (c: Categoria) => { setEditing(c); setNombre(c.nombre); setDialogOpen(true) }

    const handleSave = async () => {
        if (!nombre.trim()) { toast.error("El nombre es obligatorio"); return }
        setSaving(true)
        try {
            const method = editing ? "PUT" : "POST"
            const body = editing ? { id: editing.id, nombre: nombre.trim() } : { nombre: nombre.trim() }
            const res = await fetch("/api/categorias-padre", {
                method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
            })
            const json = await res.json()
            if (json.success) { toast.success(editing ? "Categoría actualizada" : "Categoría creada"); setDialogOpen(false); onReload() }
            else toast.error(json.error || "Error al guardar")
        } catch { toast.error("Error de conexión") }
        finally { setSaving(false) }
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8 h-9 text-sm" placeholder="Buscar categoría..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-1.5" /> Nueva Categoría
                </Button>
            </div>

            {/* Total */}
            <p className="text-xs text-muted-foreground">{filtered.length} categoría{filtered.length !== 1 ? "s" : ""}</p>

            {/* Listado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filtered.length === 0 && <p className="text-sm text-muted-foreground py-8 col-span-full text-center">No hay categorías que coincidan</p>}
                {filtered.map(c => (
                    <Card key={c.id} className="group hover:border-emerald-300 transition-all cursor-pointer hover:shadow-sm" onClick={() => openEdit(c)}>
                        <CardContent className="p-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                                    <FolderTree className="h-4 w-4 text-emerald-600" />
                                </div>
                                <span className="text-sm font-medium">{c.nombre}</span>
                            </div>
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                        <DialogDescription>{editing ? "Modifica el nombre de la categoría." : "Ingresa el nombre para la nueva categoría."}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Nombre *</Label>
                            <Input value={nombre} onChange={e => setNombre(e.target.value.toUpperCase())} placeholder="Ej: BLUSAS, PANTALONES..." onKeyDown={e => e.key === "Enter" && handleSave()} autoFocus />
                        </div>
                    </div>
                    <DialogFooter>
                        {editing && (
                            <Button variant="destructive" size="sm" className="mr-auto" onClick={() => setDeleteConfirm(true)}>
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={saving}>
                            <Save className="h-3.5 w-3.5 mr-1" /> {saving ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm delete */}
            <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará <strong>{editing?.nombre}</strong>. Si tiene tipos de prenda asociados, no se podrá eliminar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={deleting}
                            onClick={async (e) => {
                                e.preventDefault()
                                setDeleting(true)
                                try {
                                    const res = await fetch(`/api/categorias-padre?id=${editing!.id}`, { method: "DELETE" })
                                    const json = await res.json()
                                    if (json.success) {
                                        toast.success("Categoría eliminada")
                                        setDeleteConfirm(false); setDialogOpen(false); onReload()
                                    } else toast.error(json.error || "Error al eliminar")
                                } catch { toast.error("Error de conexión") }
                                finally { setDeleting(false) }
                            }}
                        >
                            {deleting ? "Eliminando..." : "Sí, eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   VISTA: Tipos de Prenda
   ═══════════════════════════════════════════════════════════════════════════ */
function TiposPrendaView({ tipos, categorias, sistemasTalla, asignaciones, onReload }: {
    tipos: TipoPrenda[]; categorias: Categoria[]; sistemasTalla: SistemaTalla[];
    asignaciones: { tipo_prenda_id: number; sistema_talla_id: number }[];
    onReload: () => void
}) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<TipoPrenda | null>(null)
    const [nombre, setNombre] = useState("")
    const [catId, setCatId] = useState("")
    const [selectedSistemas, setSelectedSistemas] = useState<number[]>([])
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState("")
    const [filterCat, setFilterCat] = useState("")
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const filtered = tipos.filter(t => {
        const matchSearch = t.nombre.toLowerCase().includes(search.toLowerCase())
        const matchCat = !filterCat || filterCat === "all" || t.categoria_padre_id.toString() === filterCat
        return matchSearch && matchCat
    })

    const getCatNombre = (catPadreId: number) => categorias.find(c => c.id === catPadreId)?.nombre || "—"

    const getSistemasForTipo = (tipoId: number) =>
        asignaciones.filter(a => a.tipo_prenda_id === tipoId).map(a =>
            sistemasTalla.find(s => s.id === a.sistema_talla_id)?.nombre || `ID:${a.sistema_talla_id}`
        )

    const openCreate = () => { setEditing(null); setNombre(""); setCatId(""); setSelectedSistemas([]); setDialogOpen(true) }
    const openEdit = (t: TipoPrenda) => {
        setEditing(t); setNombre(t.nombre); setCatId(t.categoria_padre_id.toString())
        setSelectedSistemas(asignaciones.filter(a => a.tipo_prenda_id === t.id).map(a => a.sistema_talla_id))
        setDialogOpen(true)
    }

    const toggleSistema = (stId: number) => {
        setSelectedSistemas(prev => prev.includes(stId) ? prev.filter(id => id !== stId) : [...prev, stId])
    }

    const handleSave = async () => {
        if (!nombre.trim()) { toast.error("El nombre es obligatorio"); return }
        if (!catId) { toast.error("Debe seleccionar una categoría padre"); return }
        setSaving(true)
        try {
            const method = editing ? "PUT" : "POST"
            const body: any = editing
                ? { id: editing.id, nombre: nombre.trim(), categoria_padre_id: catId, sistemas_talla_ids: selectedSistemas }
                : { nombre: nombre.trim(), categoria_padre_id: catId }

            const res = await fetch("/api/tipos-prenda", {
                method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
            })
            const json = await res.json()
            if (!json.success) { toast.error(json.error || "Error al guardar"); return }

            if (!editing && json.data?.id && selectedSistemas.length > 0) {
                await fetch("/api/tipo-prenda-tallas", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tipo_prenda_id: json.data.id, sistemas_talla_ids: selectedSistemas }),
                })
            }
            toast.success(editing ? "Tipo de prenda actualizado" : "Tipo de prenda creado")
            setDialogOpen(false); onReload()
        } catch { toast.error("Error de conexión") }
        finally { setSaving(false) }
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8 h-9 text-sm" placeholder="Buscar tipo de prenda..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={filterCat} onValueChange={setFilterCat}>
                    <SelectTrigger className="h-9 text-xs w-48"><SelectValue placeholder="Todas las categorías" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categorias.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-1.5" /> Nuevo Tipo
                </Button>
            </div>

            {/* Total */}
            <p className="text-xs text-muted-foreground">{filtered.length} tipo{filtered.length !== 1 ? "s" : ""} de prenda</p>

            {/* Listado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filtered.length === 0 && <p className="text-sm text-muted-foreground py-8 col-span-full text-center">No hay tipos de prenda que coincidan</p>}
                {filtered.map(t => (
                    <Card key={t.id} className="group hover:border-blue-300 transition-all cursor-pointer hover:shadow-sm" onClick={() => openEdit(t)}>
                        <CardContent className="p-3.5">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 shrink-0">
                                        <Shirt className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium truncate">{t.nombre}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Badge variant="outline" className="text-[10px]">{getCatNombre(t.categoria_padre_id)}</Badge>
                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                            <div className="flex gap-1 flex-wrap ml-[42px]">
                                {getSistemasForTipo(t.id).map((s, i) => (
                                    <Badge key={i} variant="secondary" className="text-[9px] px-1.5">{s}</Badge>
                                ))}
                                {getSistemasForTipo(t.id).length === 0 && (
                                    <span className="text-[10px] text-muted-foreground italic">Sin tallas asignadas</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Editar Tipo de Prenda" : "Nuevo Tipo de Prenda"}</DialogTitle>
                        <DialogDescription>{editing ? "Modifica los datos del tipo de prenda." : "Completa los datos para el nuevo tipo."}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Nombre *</Label>
                            <Input value={nombre} onChange={e => setNombre(e.target.value.toUpperCase())} placeholder="Ej: BLUSA MANGA LARGA..." autoFocus />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Categoría Padre *</Label>
                            <Select value={catId} onValueChange={setCatId}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Seleccionar categoría..." /></SelectTrigger>
                                <SelectContent>
                                    {categorias.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Sistemas de Tallas</Label>
                            <div className="space-y-2 border rounded-md p-2 max-h-40 overflow-auto">
                                {sistemasTalla.map(st => (
                                    <label key={st.id} className="flex items-start gap-2 cursor-pointer hover:bg-muted/50 rounded p-1.5 transition-colors">
                                        <Checkbox checked={selectedSistemas.includes(st.id)} onCheckedChange={() => toggleSistema(st.id)} className="mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-medium">{st.nombre}</span>
                                            {st.descripcion && <p className="text-[10px] text-muted-foreground">{st.descripcion}</p>}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        {editing && (
                            <Button variant="destructive" size="sm" className="mr-auto" onClick={() => setDeleteConfirm(true)}>
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={saving}>
                            <Save className="h-3.5 w-3.5 mr-1" /> {saving ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm delete */}
            <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar tipo de prenda?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará <strong>{editing?.nombre}</strong>. Si tiene productos asociados, no se podrá eliminar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={deleting}
                            onClick={async (e) => {
                                e.preventDefault()
                                setDeleting(true)
                                try {
                                    const res = await fetch(`/api/tipos-prenda?id=${editing!.id}`, { method: "DELETE" })
                                    const json = await res.json()
                                    if (json.success) {
                                        toast.success("Tipo de prenda eliminado")
                                        setDeleteConfirm(false); setDialogOpen(false); onReload()
                                    } else toast.error(json.error || "Error al eliminar")
                                } catch { toast.error("Error de conexión") }
                                finally { setDeleting(false) }
                            }}
                        >
                            {deleting ? "Eliminando..." : "Sí, eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   VISTA: Tallas
   ═══════════════════════════════════════════════════════════════════════════ */
function TallasView({ tallas, sistemasTalla, onReload }: {
    tallas: Talla[]; sistemasTalla: SistemaTalla[]; onReload: () => void
}) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Talla | null>(null)
    const [valor, setValor] = useState("")
    const [sistemaId, setSistemaId] = useState("")
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState("")
    const [filterSistema, setFilterSistema] = useState("")
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const filtered = tallas.filter(t => {
        const matchSearch = t.valor.toLowerCase().includes(search.toLowerCase())
        const matchSistema = !filterSistema || filterSistema === "all" || t.sistema_talla_id.toString() === filterSistema
        return matchSearch && matchSistema
    })

    const getSistemaNombre = (stId: number) => sistemasTalla.find(s => s.id === stId)?.nombre || `ID:${stId}`

    const grouped = filtered.reduce((acc, t) => {
        const key = t.sistema_talla_id
        if (!acc[key]) acc[key] = []
        acc[key].push(t)
        return acc
    }, {} as Record<number, Talla[]>)

    const openCreate = () => { setEditing(null); setValor(""); setSistemaId(""); setDialogOpen(true) }
    const openEdit = (t: Talla) => { setEditing(t); setValor(t.valor); setSistemaId(t.sistema_talla_id.toString()); setDialogOpen(true) }

    const handleSave = async () => {
        if (!valor.trim()) { toast.error("El valor es obligatorio"); return }
        if (!sistemaId) { toast.error("Debe seleccionar un sistema de talla"); return }
        setSaving(true)
        try {
            const method = editing ? "PUT" : "POST"
            const body = editing
                ? { id: editing.id, valor: valor.trim(), sistema_talla_id: parseInt(sistemaId) }
                : { valor: valor.trim(), sistema_talla_id: parseInt(sistemaId) }

            const res = await fetch("/api/tallas", {
                method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
            })
            const json = await res.json()
            if (json.success) { toast.success(editing ? "Talla actualizada" : "Talla creada"); setDialogOpen(false); onReload() }
            else toast.error(json.error || "Error al guardar")
        } catch { toast.error("Error de conexión") }
        finally { setSaving(false) }
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8 h-9 text-sm" placeholder="Buscar talla..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={filterSistema} onValueChange={setFilterSistema}>
                    <SelectTrigger className="h-9 text-xs w-56"><SelectValue placeholder="Todos los sistemas" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los sistemas</SelectItem>
                        {sistemasTalla.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-1.5" /> Nueva Talla
                </Button>
            </div>

            {/* Total */}
            <p className="text-xs text-muted-foreground">{filtered.length} talla{filtered.length !== 1 ? "s" : ""}</p>

            {/* Listado agrupado */}
            <div className="space-y-4">
                {Object.keys(grouped).length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No hay tallas que coincidan</p>}
                {Object.entries(grouped).map(([stId, tallasGroup]) => (
                    <Card key={stId} className="overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-50/50 dark:bg-purple-950/30 border-b">
                            <Ruler className="h-3.5 w-3.5 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">{getSistemaNombre(Number(stId))}</span>
                            <Badge variant="secondary" className="text-[9px] ml-auto">{tallasGroup.length} tallas</Badge>
                        </div>
                        <CardContent className="p-3">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
                                {tallasGroup.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => openEdit(t)}
                                        className="flex items-center justify-between px-3 py-2 rounded-md border hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-300 transition-all text-left group"
                                    >
                                        <span className="text-sm font-medium">{t.valor}</span>
                                        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Editar Talla" : "Nueva Talla"}</DialogTitle>
                        <DialogDescription>{editing ? "Modifica el valor de la talla." : "Ingresa los datos de la nueva talla."}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Valor *</Label>
                            <Input value={valor} onChange={e => setValor(e.target.value.toUpperCase())} placeholder="Ej: XL, 38, U..." autoFocus />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Sistema de Talla *</Label>
                            <Select value={sistemaId} onValueChange={setSistemaId}>
                                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Seleccionar sistema..." /></SelectTrigger>
                                <SelectContent>
                                    {sistemasTalla.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        {editing && (
                            <Button variant="destructive" size="sm" className="mr-auto" onClick={() => setDeleteConfirm(true)}>
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSave} disabled={saving}>
                            <Save className="h-3.5 w-3.5 mr-1" /> {saving ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm delete */}
            <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar talla?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará la talla <strong>{editing?.valor}</strong>. Si tiene productos asociados, no se podrá eliminar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={deleting}
                            onClick={async (e) => {
                                e.preventDefault()
                                setDeleting(true)
                                try {
                                    const res = await fetch(`/api/tallas?id=${editing!.id}`, { method: "DELETE" })
                                    const json = await res.json()
                                    if (json.success) {
                                        toast.success("Talla eliminada")
                                        setDeleteConfirm(false); setDialogOpen(false); onReload()
                                    } else toast.error(json.error || "Error al eliminar")
                                } catch { toast.error("Error de conexión") }
                                finally { setDeleting(false) }
                            }}
                        >
                            {deleting ? "Eliminando..." : "Sí, eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════════
   VISTA: Tipos de Gastos
   ═══════════════════════════════════════════════════════════════════════════ */
function TiposGastoView({ tiposGasto, onReload }: { tiposGasto: TipoGasto[]; onReload: () => void }) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<TipoGasto | null>(null)
    const [label, setLabel] = useState("")
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState("")
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const filtered = tiposGasto.filter(t => t.label.toLowerCase().includes(search.toLowerCase()))

    const openCreate = () => { setEditing(null); setLabel(""); setDialogOpen(true) }
    const openEdit = (t: TipoGasto) => { setEditing(t); setLabel(t.label); setDialogOpen(true) }

    const handleSave = async () => {
        if (!label.trim()) { toast.error("El nombre es obligatorio"); return }
        setSaving(true)
        try {
            const method = editing ? "PUT" : "POST"
            const slug = label.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
            const body = editing
                ? { id: editing.id, nombre: slug, label: label.trim() }
                : { nombre: slug, label: label.trim() }

            const res = await fetch("/api/tipos-gastos", {
                method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
            })
            const json = await res.json()
            if (json.success) { toast.success(editing ? "Tipo de gasto actualizado" : "Tipo de gasto creado"); setDialogOpen(false); onReload() }
            else toast.error(json.error || "Error al guardar")
        } catch { toast.error("Error de conexión") }
        finally { setSaving(false) }
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8 h-9 text-sm" placeholder="Buscar tipo de gasto..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-1.5" /> Nuevo Tipo
                </Button>
            </div>

            {/* Total */}
            <p className="text-xs text-muted-foreground">{filtered.length} tipo{filtered.length !== 1 ? "s" : ""} de gasto</p>

            {/* Listado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filtered.length === 0 && <p className="text-sm text-muted-foreground py-8 col-span-full text-center">No hay tipos de gasto que coincidan</p>}
                {filtered.map(t => (
                    <Card key={t.id} className="group hover:border-amber-300 transition-all cursor-pointer hover:shadow-sm" onClick={() => openEdit(t)}>
                        <CardContent className="p-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950 shrink-0">
                                    <Receipt className="h-4 w-4 text-amber-600" />
                                </div>
                                <span className="text-sm font-medium truncate">{t.label}</span>
                            </div>
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editing ? "Editar Tipo de Gasto" : "Nuevo Tipo de Gasto"}</DialogTitle>
                        <DialogDescription>{editing ? "Modifica el nombre del tipo de gasto." : "Ingresa el nombre para el nuevo tipo de gasto."}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Nombre *</Label>
                            <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Ej: Servicios Públicos, Arriendo..." onKeyDown={e => e.key === "Enter" && handleSave()} autoFocus />
                        </div>
                    </div>
                    <DialogFooter>
                        {editing && (
                            <Button variant="destructive" size="sm" className="mr-auto" onClick={() => setDeleteConfirm(true)}>
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSave} disabled={saving}>
                            <Save className="h-3.5 w-3.5 mr-1" /> {saving ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm delete */}
            <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar tipo de gasto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará <strong>{editing?.label}</strong>. Si tiene gastos registrados con este tipo, no se podrá eliminar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={deleting}
                            onClick={async (e) => {
                                e.preventDefault()
                                setDeleting(true)
                                try {
                                    const res = await fetch(`/api/tipos-gastos?id=${editing!.id}`, { method: "DELETE" })
                                    const json = await res.json()
                                    if (json.success) {
                                        toast.success("Tipo de gasto eliminado")
                                        setDeleteConfirm(false); setDialogOpen(false); onReload()
                                    } else toast.error(json.error || "Error al eliminar")
                                } catch { toast.error("Error de conexión") }
                                finally { setDeleting(false) }
                            }}
                        >
                            {deleting ? "Eliminando..." : "Sí, eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
