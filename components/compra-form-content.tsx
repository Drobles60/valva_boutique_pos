"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { SidebarToggle } from "@/components/app-sidebar"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import {
    ShoppingCart, Plus, Trash2, Save, CheckCircle, Printer,
    Package, Calculator, AlertTriangle, ChevronDown, ChevronUp, PackagePlus,
} from "lucide-react"

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ItemCompra {
    _key: string
    producto_id: string
    producto_nombre: string
    sku: string
    talla: string
    color: string
    tipo_prenda: string
    cantidad: number
    costo_unitario: number
    descuento_pct: number
    iva_pct: number
    subtotal: number
    total: number
}

function calcItem(it: Partial<ItemCompra>): Partial<ItemCompra> {
    const sub = (Number(it.cantidad) || 0) * (Number(it.costo_unitario) || 0)
    const desc = sub * ((Number(it.descuento_pct) || 0) / 100)
    const base = sub - desc
    const iva = base * ((Number(it.iva_pct) || 0) / 100)
    return { ...it, subtotal: sub, total: base + iva }
}

function newItem(): ItemCompra {
    return {
        _key: Math.random().toString(36).slice(2),
        producto_id: "", producto_nombre: "", sku: "", talla: "", color: "", tipo_prenda: "",
        cantidad: 1, costo_unitario: 0, descuento_pct: 0, iva_pct: 0, subtotal: 0, total: 0
    } as ItemCompra
}

// ─── Componente ───────────────────────────────────────────────────────────────
interface CompraFormProps {
    compraId?: number     // si es edición
}

export function CompraFormContent({ compraId }: CompraFormProps) {
    const router = useRouter()
    const skuInputRef = useRef<HTMLInputElement>(null)

    // Datos de referencia
    const [proveedores, setProveedores] = useState<any[]>([])
    const [productos, setProductos] = useState<any[]>([])
    const [categorias, setCategorias] = useState<any[]>([])
    const [tiposPrenda, setTiposPrenda] = useState<any[]>([])
    const [tallas, setTallas] = useState<any[]>([])

    // Encabezado
    const [form, setForm] = useState({
        proveedor_id: "", factura_numero: "", fecha: new Date().toISOString().slice(0, 10),
        fecha_vencimiento: "", tipo_pago: "contado", observaciones: "", otros_costos: "0",
        abono_inicial: "0",
    })

    // Items
    const [items, setItems] = useState<ItemCompra[]>([newItem()])
    const [skuBusqueda, setSkuBusqueda] = useState("")

    // Estado de la compra
    const [estado, setEstado] = useState<"borrador" | "confirmada" | "anulada">("borrador")
    const [saving, setSaving] = useState(false)
    const [confirming, setConfirming] = useState(false)

    // UX
    const [ivaGlobal, setIvaGlobal] = useState("15")
    const [descGlobal, setDescGlobal] = useState("0")
    const [seccionAbierta, setSeccionAbierta] = useState<"encabezado" | "resumen" | null>(null)

    // Modal nuevo producto
    const [nuevoProductoOpen, setNuevoProductoOpen] = useState(false)
    const [nuevoProductoSaving, setNuevoProductoSaving] = useState(false)
    const [npForm, setNpForm] = useState({
        nombre: "", sku: "", color: "", categoria_padre_id: "",
        tipo_prenda_id: "", talla_id: "", precio_compra: "", precio_venta: "",
        precio_minimo: "", stock_actual: "0", proveedor_id: "",
    })
    const [tiposFiltrados, setTiposFiltrados] = useState<any[]>([])
    // Creación inline
    const [nuevaCat, setNuevaCat] = useState({ show: false, valor: "", saving: false })
    const [nuevoTipo, setNuevoTipo] = useState({ show: false, valor: "", saving: false })
    const [nuevaTalla, setNuevaTalla] = useState({ show: false, valor: "", saving: false })

    // Generar SKU automático
    const generarSku = useCallback((f: typeof npForm, cats: any[], tipos: any[], talls: any[]) => {
        const cat = cats.find((c: any) => c.id.toString() === f.categoria_padre_id)
        const tipo = tipos.find((t: any) => t.id.toString() === f.tipo_prenda_id)
        const talla = talls.find((t: any) => t.id.toString() === f.talla_id)
        const partes = [
            cat ? cat.nombre.replace(/\s+/g, '').substring(0, 3).toUpperCase() : '',
            tipo ? tipo.nombre.replace(/\s+/g, '').substring(0, 3).toUpperCase() : '',
            talla ? talla.valor.toUpperCase() : '',
            f.color ? f.color.replace(/\s+/g, '').substring(0, 3).toUpperCase() : '',
        ].filter(Boolean)
        if (partes.length < 2) return f.sku // no suficientes datos aún
        const base = partes.join('-')
        const num = String(Math.floor(Math.random() * 900) + 100)
        return `${base}-${num}`
    }, [])

    // Cargar datos
    useEffect(() => {
        fetch("/api/proveedores").then(r => r.json()).then(j => { if (j.success) setProveedores(j.data || []) })
        fetch("/api/productos").then(r => r.json()).then(j => { if (j.success) setProductos(j.data || []) })
        fetch("/api/categorias-padre").then(r => r.json()).then(j => { if (j.success || j.data) setCategorias(j.data || j || []) }).catch(() => { })
        fetch("/api/tipos-prenda").then(r => r.json()).then(j => { if (j.success || j.data) setTiposPrenda(j.data || j || []) }).catch(() => { })
        fetch("/api/tallas").then(r => r.json()).then(j => { if (j.success || j.data) setTallas(j.data || j || []) }).catch(() => { })
    }, [])

    // Filtrar tipos de prenda por categoría
    useEffect(() => {
        if (npForm.categoria_padre_id) {
            setTiposFiltrados(tiposPrenda.filter((t: any) => t.categoria_padre_id?.toString() === npForm.categoria_padre_id))
        } else {
            setTiposFiltrados(tiposPrenda)
        }
    }, [npForm.categoria_padre_id, tiposPrenda])

    // Recalcular SKU automático cuando cambian los campos clave
    useEffect(() => {
        const sku = generarSku(npForm, categorias, tiposPrenda, tallas)
        setNpForm(f => ({ ...f, sku }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [npForm.categoria_padre_id, npForm.tipo_prenda_id, npForm.talla_id, npForm.color, categorias, tiposPrenda, tallas])

    // Helpers de creación inline
    const crearCategoria = async () => {
        if (!nuevaCat.valor.trim()) return
        setNuevaCat(s => ({ ...s, saving: true }))
        const res = await fetch('/api/categorias-padre', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: nuevaCat.valor }) })
        const j = await res.json()
        if (j.success) {
            setCategorias(prev => [...prev, j.data])
            setNpForm(f => ({ ...f, categoria_padre_id: j.data.id.toString(), tipo_prenda_id: '' }))
            setNuevaCat({ show: false, valor: '', saving: false })
            toast.success(`Categoría "${j.data.nombre}" creada`)
        } else { toast.error(j.error); setNuevaCat(s => ({ ...s, saving: false })) }
    }

    const crearTipo = async () => {
        if (!nuevoTipo.valor.trim() || !npForm.categoria_padre_id) return
        setNuevoTipo(s => ({ ...s, saving: true }))
        const res = await fetch('/api/tipos-prenda', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: nuevoTipo.valor, categoria_padre_id: npForm.categoria_padre_id }) })
        const j = await res.json()
        if (j.success) {
            setTiposPrenda(prev => [...prev, j.data])
            setNpForm(f => ({ ...f, tipo_prenda_id: j.data.id.toString() }))
            setNuevoTipo({ show: false, valor: '', saving: false })
            toast.success(`Tipo "${j.data.nombre}" creado`)
        } else { toast.error(j.error); setNuevoTipo(s => ({ ...s, saving: false })) }
    }

    const crearTalla = async () => {
        if (!nuevaTalla.valor.trim()) return
        setNuevaTalla(s => ({ ...s, saving: true }))
        const res = await fetch('/api/tallas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: nuevaTalla.valor }) })
        const j = await res.json()
        if (j.success) {
            setTallas(prev => [...prev, j.data])
            setNpForm(f => ({ ...f, talla_id: j.data.id.toString() }))
            setNuevaTalla({ show: false, valor: '', saving: false })
            toast.success(`Talla "${j.data.valor}" creada`)
        } else { toast.error(j.error); setNuevaTalla(s => ({ ...s, saving: false })) }
    }

    // Crear nuevo producto rápido
    const handleCrearProducto = async () => {
        const { nombre, sku, categoria_padre_id, tipo_prenda_id, precio_compra, precio_venta, proveedor_id } = npForm
        if (!nombre || !sku || !categoria_padre_id || !tipo_prenda_id || !precio_compra || !precio_venta || !proveedor_id) {
            toast.error("Completa: Nombre, SKU, Categoría, Tipo, Proveedor, Precio Compra y Precio Venta")
            return
        }
        setNuevoProductoSaving(true)
        try {
            const payload = {
                ...npForm,
                proveedor_id: npForm.proveedor_id || undefined,
                precio_minimo: npForm.precio_minimo || npForm.precio_venta,
                stock_actual: Number(npForm.stock_actual) || 0,
                estado: 'activo',
            }
            const res = await fetch("/api/productos", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
            const json = await res.json()
            if (!json.success) { toast.error(json.error || "Error al crear producto"); return }

            toast.success(`Producto "${nombre}" creado`)
            // Recargar lista de productos
            const prodRes = await fetch("/api/productos")
            const prodJson = await prodRes.json()
            if (prodJson.success) setProductos(prodJson.data || [])

            // Agregar al grid automáticamente
            const newProd = (prodJson.data || []).find((p: any) => p.sku === sku)
            if (newProd) {
                const nuevoItem: ItemCompra = {
                    _key: Math.random().toString(36).slice(2),
                    producto_id: newProd.id.toString(),
                    producto_nombre: newProd.nombre,
                    sku: newProd.sku || "",
                    talla: newProd.talla_valor || "",
                    color: newProd.color || "",
                    tipo_prenda: newProd.tipo_prenda_nombre || "",
                    cantidad: 1,
                    costo_unitario: Number(newProd.precio_compra) || 0,
                    descuento_pct: Number(descGlobal) || 0,
                    iva_pct: Number(ivaGlobal) || 0,
                    subtotal: 0, total: 0,
                }
                const calc = calcItem(nuevoItem) as ItemCompra
                setItems(prev => {
                    const empty = prev.find(i => !i.producto_id)
                    if (empty) return prev.map(i => i._key === empty._key ? calc : i)
                    return [...prev, calc]
                })
            }

            // Resetear y cerrar
            setNpForm({ nombre: "", sku: "", color: "", categoria_padre_id: "", tipo_prenda_id: "", talla_id: "", precio_compra: "", precio_venta: "", precio_minimo: "", stock_actual: "0", proveedor_id: form.proveedor_id })
            setNuevoProductoOpen(false)
        } catch { toast.error("Error de conexión") } finally { setNuevoProductoSaving(false) }
    }

    // Cargar compra existente si es edición
    useEffect(() => {
        if (!compraId) return
        fetch(`/api/compras/${compraId}`)
            .then(r => r.json())
            .then(j => {
                if (!j.success) return
                const c = j.data
                setForm({
                    proveedor_id: c.proveedor_id?.toString() || "",
                    factura_numero: c.factura_numero || "",
                    fecha: c.fecha?.slice(0, 10) || "",
                    fecha_vencimiento: c.fecha_vencimiento?.slice(0, 10) || "",
                    tipo_pago: c.tipo_pago || "contado",
                    observaciones: c.observaciones || "",
                    otros_costos: c.otros_costos?.toString() || "0",
                    abono_inicial: c.abono_inicial?.toString() || "0",
                })
                setEstado(c.estado)
                if (c.detalle?.length) {
                    setItems(c.detalle.map((d: any) => ({
                        _key: Math.random().toString(36).slice(2),
                        producto_id: d.producto_id?.toString(),
                        producto_nombre: d.producto_nombre,
                        sku: d.sku,
                        talla: d.talla_valor || "",
                        color: d.color || "",
                        tipo_prenda: d.tipo_prenda_nombre || "",
                        cantidad: Number(d.cantidad),
                        costo_unitario: Number(d.costo_unitario),
                        descuento_pct: Number(d.descuento_pct),
                        iva_pct: Number(d.iva_pct),
                        subtotal: Number(d.subtotal),
                        total: Number(d.total),
                    })))
                }
            })
    }, [compraId])

    // ─── Buscar producto por SKU (Enter) ─────────────────────────────────────
    const handleSkuEnter = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return
        const sku = skuBusqueda.trim().toUpperCase()
        if (!sku) return
        const prod = productos.find(p => p.sku?.toUpperCase() === sku)
        if (!prod) { toast.error(`SKU "${sku}" no encontrado`); return }
        const nuevoItem: ItemCompra = {
            _key: Math.random().toString(36).slice(2),
            producto_id: prod.id.toString(),
            producto_nombre: prod.nombre,
            sku: prod.sku || "",
            talla: prod.talla_valor || "",
            color: prod.color || "",
            tipo_prenda: prod.tipo_prenda_nombre || "",
            cantidad: 1,
            costo_unitario: Number(prod.precio_compra) || 0,
            descuento_pct: Number(descGlobal) || 0,
            iva_pct: Number(ivaGlobal) || 0,
            subtotal: 0, total: 0,
        }
        const calc = calcItem(nuevoItem) as ItemCompra
        setItems(prev => {
            const empty = prev.find(i => !i.producto_id)
            if (empty) return prev.map(i => i._key === empty._key ? calc : i)
            return [...prev, calc]
        })
        setSkuBusqueda("")
        toast.success(`"${prod.nombre}" agregado`)
    }, [skuBusqueda, productos, ivaGlobal, descGlobal])

    // ─── Cambiar campo de un item ──────────────────────────────────────────────
    const updateItem = (key: string, field: keyof ItemCompra, value: any) => {
        setItems(prev => prev.map(it => {
            if (it._key !== key) return it
            const updated = { ...it, [field]: value }
            return calcItem(updated) as ItemCompra
        }))
    }

    // ─── Agregar / quitar fila ────────────────────────────────────────────────
    const addItem = () => setItems(prev => [...prev, newItem()])
    const removeItem = (key: string) => { if (items.length > 1) setItems(prev => prev.filter(i => i._key !== key)) }

    // ─── Aplicar IVA / Descuento global ──────────────────────────────────────
    const aplicarIvaGlobal = () => setItems(prev => prev.map(it => calcItem({ ...it, iva_pct: Number(ivaGlobal) }) as ItemCompra))
    const aplicarDescGlobal = () => setItems(prev => prev.map(it => calcItem({ ...it, descuento_pct: Number(descGlobal) }) as ItemCompra))

    // ─── Seleccionar producto por selector ───────────────────────────────────
    const seleccionarProducto = (key: string, prodId: string) => {
        const prod = productos.find(p => p.id.toString() === prodId)
        if (!prod) return
        const updated: Partial<ItemCompra> = {
            producto_id: prodId,
            producto_nombre: prod.nombre,
            sku: prod.sku || "",
            talla: prod.talla_valor || "",
            color: prod.color || "",
            tipo_prenda: prod.tipo_prenda_nombre || "",
            costo_unitario: Number(prod.precio_compra) || 0,
            iva_pct: Number(ivaGlobal) || 0,
            descuento_pct: Number(descGlobal) || 0,
        }
        setItems(prev => prev.map(it => it._key === key ? calcItem({ ...it, ...updated }) as ItemCompra : it))
    }

    // ─── Totales ──────────────────────────────────────────────────────────────
    const validItems = items.filter(i => i.producto_id && i.cantidad > 0)
    const subtotal = validItems.reduce((s, i) => s + i.subtotal, 0)
    const descTotal = validItems.reduce((s, i) => s + i.subtotal * (i.descuento_pct / 100), 0)
    const ivaTotal = validItems.reduce((s, i) => s + (i.subtotal - i.subtotal * (i.descuento_pct / 100)) * (i.iva_pct / 100), 0)
    const otrosCostos = Number(form.otros_costos) || 0
    const total = subtotal - descTotal + ivaTotal + otrosCostos
    const abonoInicial = Number(form.abono_inicial) || 0
    const saldoPendiente = total - abonoInicial

    // ─── Payload helper ───────────────────────────────────────────────────────
    const buildPayload = () => ({
        ...form,
        otros_costos: otrosCostos,
        abono_inicial: abonoInicial,
        items: validItems.map(i => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
            costo_unitario: i.costo_unitario,
            descuento_pct: i.descuento_pct,
            iva_pct: i.iva_pct,
        }))
    })

    // ─── Guardar borrador ─────────────────────────────────────────────────────
    const handleGuardar = async () => {
        if (!form.proveedor_id) { toast.error("Selecciona un proveedor"); return }
        if (!validItems.length) { toast.error("Agrega al menos un producto válido"); return }
        setSaving(true)
        try {
            const url = compraId ? `/api/compras/${compraId}` : "/api/compras"
            const method = compraId ? "PUT" : "POST"
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload()) })
            const json = await res.json()
            if (!json.success) { toast.error(json.error || "Error al guardar"); return }
            toast.success("Borrador guardado")
            if (!compraId && json.id) router.push(`/inventario/compras/${json.id}`)
        } catch { toast.error("Error de conexión") } finally { setSaving(false) }
    }

    // ─── Confirmar compra ─────────────────────────────────────────────────────
    const handleConfirmar = async () => {
        if (!form.proveedor_id) { toast.error("Selecciona un proveedor"); return }
        if (!validItems.length) { toast.error("Agrega al menos un producto válido"); return }
        const sinTalla = validItems.filter(i => !i.talla)
        if (sinTalla.length) { toast.error(`Productos sin talla: ${sinTalla.map(i => i.producto_nombre).join(", ")}`); return }
        setConfirming(true)
        try {
            // 1. Guardar/actualizar primero
            const url = compraId ? `/api/compras/${compraId}` : "/api/compras"
            const method = compraId ? "PUT" : "POST"
            const saveRes = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload()) })
            const saveJson = await saveRes.json()
            if (!saveJson.success) { toast.error(saveJson.error || "Error al guardar"); return }
            const id = compraId || saveJson.id

            // 2. Confirmar
            const confRes = await fetch(`/api/compras/${id}/confirmar`, { method: "POST" })
            const confJson = await confRes.json()
            if (!confJson.success) { toast.error(confJson.error || "Error al confirmar"); return }
            toast.success(confJson.message || "¡Compra confirmada!")
            setEstado("confirmada")
            router.push(`/inventario/compras/${id}`)
        } catch { toast.error("Error de conexión") } finally { setConfirming(false) }
    }

    const esConfirmada = estado === "confirmada"

    return (
        <div className="flex flex-col h-full gap-3 p-3 md:p-4">

            {/* ── Encabezado ─────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-2 flex-wrap print:hidden">
                <div className="flex items-center gap-2">
                    <SidebarToggle />
                    <ShoppingCart className="h-5 w-5 text-[#D4AF37]" />
                    <div>
                        <h1 className="text-lg font-bold leading-tight">
                            {compraId ? `Compra #${compraId}` : "Nueva Factura de Compra"}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {esConfirmada
                                ? <span className="text-green-600 font-medium">✓ Confirmada · Inventario actualizado</span>
                                : "Completa los datos y confirma para mover inventario"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {!esConfirmada && (
                        <>
                            <Button size="sm" variant="outline" onClick={handleGuardar} disabled={saving}>
                                <Save className="h-3.5 w-3.5 mr-1" />
                                {saving ? "Guardando..." : "Guardar borrador"}
                            </Button>
                            <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c4a030] text-black" onClick={handleConfirmar} disabled={confirming}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                {confirming ? "Confirmando..." : "Confirmar compra"}
                            </Button>
                        </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => window.print()}>
                        <Printer className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => router.push("/inventario/compras")}>← Lista</Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">

                {/* ── Columna principal ───────────────────────────────────────────── */}
                <div className="flex flex-col gap-3 flex-1 min-w-0">

                    {/* Encabezado de la compra (colapsable) */}
                    <Card>
                        <div
                            className="flex items-center justify-between px-3 py-2 cursor-pointer border-b"
                            onClick={() => setSeccionAbierta(s => s === "encabezado" ? null : "encabezado")}
                        >
                            <span className="text-xs font-semibold flex items-center gap-1.5">
                                📋 Datos de la Factura
                                {form.proveedor_id && form.factura_numero && (
                                    <Badge variant="outline" className="text-[10px] ml-1">{form.factura_numero}</Badge>
                                )}
                            </span>
                            {seccionAbierta === "encabezado" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </div>
                        {seccionAbierta === "encabezado" && (
                            <CardContent className="pt-3 pb-3">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                    <div className="space-y-1 col-span-2 sm:col-span-2">
                                        <Label className="text-xs">Proveedor *</Label>
                                        <SearchableSelect
                                            value={form.proveedor_id}
                                            onValueChange={v => setForm(f => ({ ...f, proveedor_id: v }))}
                                            items={proveedores.map(p => ({ value: p.id.toString(), label: p.razon_social }))}
                                            placeholder="Seleccionar proveedor..." searchPlaceholder="Buscar..." emptyMessage="No encontrado"
                                            disabled={esConfirmada}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">N° Factura proveedor</Label>
                                        <Input className="h-8 text-xs" value={form.factura_numero} onChange={e => setForm(f => ({ ...f, factura_numero: e.target.value }))} placeholder="FAC-001..." disabled={esConfirmada} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Tipo de Pago</Label>
                                        <Select value={form.tipo_pago} onValueChange={v => setForm(f => ({ ...f, tipo_pago: v }))} disabled={esConfirmada}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="contado">Contado</SelectItem>
                                                <SelectItem value="credito">Crédito</SelectItem>
                                                <SelectItem value="mixto">Mixto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Fecha *</Label>
                                        <Input className="h-8 text-xs" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} disabled={esConfirmada} />
                                    </div>
                                    {(form.tipo_pago === "credito" || form.tipo_pago === "mixto") && (
                                        <div className="space-y-1">
                                            <Label className="text-xs">Fecha Vencimiento</Label>
                                            <Input className="h-8 text-xs" type="date" value={form.fecha_vencimiento} onChange={e => setForm(f => ({ ...f, fecha_vencimiento: e.target.value }))} disabled={esConfirmada} />
                                        </div>
                                    )}
                                    <div className="space-y-1 col-span-2">
                                        <Label className="text-xs">Observaciones</Label>
                                        <Textarea className="text-xs min-h-[52px]" value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} placeholder="Notas adicionales..." disabled={esConfirmada} rows={2} />
                                    </div>
                                </div>
                            </CardContent>
                        )}
                        {seccionAbierta !== "encabezado" && (
                            <div className="px-3 py-2 grid grid-cols-4 gap-4 text-xs text-muted-foreground">
                                <span><strong>Proveedor:</strong> {proveedores.find(p => p.id.toString() === form.proveedor_id)?.razon_social || "—"}</span>
                                <span><strong>Factura:</strong> {form.factura_numero || "—"}</span>
                                <span><strong>Fecha:</strong> {form.fecha || "—"}</span>
                                <span><strong>Pago:</strong> {form.tipo_pago}</span>
                            </div>
                        )}
                    </Card>

                    {/* Grid de productos */}
                    <Card className="flex-1 min-h-0 flex flex-col">
                        <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
                            <span className="text-xs font-semibold flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5" /> Productos ({validItems.length})
                            </span>
                            <div className="flex items-center gap-2">
                                {/* IVA global */}
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-muted-foreground">IVA%</span>
                                    <Input className="h-6 w-14 text-xs px-1" value={ivaGlobal} onChange={e => setIvaGlobal(e.target.value)} disabled={esConfirmada} />
                                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-1.5" onClick={aplicarIvaGlobal} disabled={esConfirmada}>Aplicar IVA</Button>
                                </div>
                                {/* Desc global */}
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-muted-foreground">Desc%</span>
                                    <Input className="h-6 w-14 text-xs px-1" value={descGlobal} onChange={e => setDescGlobal(e.target.value)} disabled={esConfirmada} />
                                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-1.5" onClick={aplicarDescGlobal} disabled={esConfirmada}>Aplicar Desc.</Button>
                                </div>
                            </div>
                        </div>

                        {/* Búsqueda rápida por SKU */}
                        {!esConfirmada && (
                            <div className="px-3 py-2 border-b shrink-0 flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">SKU + Enter:</span>
                                <Input
                                    ref={skuInputRef}
                                    className="h-7 text-xs flex-1"
                                    placeholder="Escribe SKU y presiona Enter para agregar..."
                                    value={skuBusqueda}
                                    onChange={e => setSkuBusqueda(e.target.value.toUpperCase())}
                                    onKeyDown={handleSkuEnter}
                                />
                                <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={addItem} disabled={esConfirmada}>
                                    <Plus className="h-3 w-3 mr-1" /> Fila
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-7 text-xs shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => setNuevoProductoOpen(true)}
                                    disabled={esConfirmada}
                                >
                                    <PackagePlus className="h-3 w-3 mr-1" /> Nuevo
                                </Button>
                            </div>
                        )}

                        {/* Tabla de items */}
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-[11px]">
                                <thead className="bg-muted/40 sticky top-0">
                                    <tr>
                                        <th className="text-left py-1.5 px-2 font-medium">Producto</th>
                                        <th className="text-center py-1.5 px-1 font-medium w-10">Talla</th>
                                        <th className="text-left py-1.5 px-1 font-medium w-20">Color</th>
                                        <th className="text-right py-1.5 px-2 font-medium w-16">Cant.</th>
                                        <th className="text-right py-1.5 px-2 font-medium w-20">Costo U.</th>
                                        <th className="text-right py-1.5 px-1 font-medium w-14">Desc.%</th>
                                        <th className="text-right py-1.5 px-1 font-medium w-14">IVA%</th>
                                        <th className="text-right py-1.5 px-2 font-medium w-20">Subtotal</th>
                                        <th className="text-right py-1.5 px-2 font-medium w-20">Total</th>
                                        {!esConfirmada && <th className="w-8" />}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it, idx) => (
                                        <tr key={it._key} className={`border-b border-muted/30 ${it.producto_id ? "" : "bg-muted/10"}`}>
                                            <td className="py-1 px-2">
                                                <SearchableSelect
                                                    value={it.producto_id}
                                                    onValueChange={v => seleccionarProducto(it._key, v)}
                                                    items={productos.map(p => ({ value: p.id.toString(), label: `${p.nombre} | ${p.sku || ""}` }))}
                                                    placeholder="Buscar producto..."
                                                    searchPlaceholder="Nombre o SKU..."
                                                    emptyMessage="No encontrado"
                                                    disabled={esConfirmada}
                                                />
                                            </td>
                                            <td className="py-1 px-1 text-center text-muted-foreground">{it.talla || "—"}</td>
                                            <td className="py-1 px-1 text-muted-foreground truncate max-w-[80px]">{it.color || "—"}</td>
                                            <td className="py-1 px-2">
                                                <Input className="h-6 text-xs text-right px-1 w-full" type="number" min="1"
                                                    value={it.cantidad} onChange={e => updateItem(it._key, "cantidad", Number(e.target.value))}
                                                    disabled={esConfirmada} />
                                            </td>
                                            <td className="py-1 px-2">
                                                <Input className="h-6 text-xs text-right px-1 w-full" type="number" min="0" step="0.01"
                                                    value={it.costo_unitario} onChange={e => updateItem(it._key, "costo_unitario", Number(e.target.value))}
                                                    disabled={esConfirmada} />
                                            </td>
                                            <td className="py-1 px-1">
                                                <Input className="h-6 text-xs text-right px-1 w-full" type="number" min="0" max="100" step="0.1"
                                                    value={it.descuento_pct} onChange={e => updateItem(it._key, "descuento_pct", Number(e.target.value))}
                                                    disabled={esConfirmada} />
                                            </td>
                                            <td className="py-1 px-1">
                                                <Input className="h-6 text-xs text-right px-1 w-full" type="number" min="0" max="100" step="0.1"
                                                    value={it.iva_pct} onChange={e => updateItem(it._key, "iva_pct", Number(e.target.value))}
                                                    disabled={esConfirmada} />
                                            </td>
                                            <td className="py-1 px-2 text-right font-mono">${formatCurrency(it.subtotal)}</td>
                                            <td className="py-1 px-2 text-right font-mono font-semibold">${formatCurrency(it.total)}</td>
                                            {!esConfirmada && (
                                                <td className="py-1 px-1 text-center">
                                                    <button onClick={() => removeItem(it._key)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* ── Panel de liquidación ────────────────────────────────────────── */}
                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
                    <Card>
                        <CardHeader className="pb-2 pt-3 px-3">
                            <CardTitle className="text-xs flex items-center gap-1.5">
                                <Calculator className="h-3.5 w-3.5 text-[#D4AF37]" /> Resumen de Liquidación
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono">${formatCurrency(subtotal)}</span>
                            </div>
                            {descTotal > 0 && (
                                <div className="flex justify-between text-orange-600">
                                    <span>- Descuento</span>
                                    <span className="font-mono">-${formatCurrency(descTotal)}</span>
                                </div>
                            )}
                            {ivaTotal > 0 && (
                                <div className="flex justify-between text-blue-600">
                                    <span>+ IVA</span>
                                    <span className="font-mono">${formatCurrency(ivaTotal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center gap-1">
                                <span className="text-muted-foreground">+ Otros costos</span>
                                <Input className="h-6 text-xs text-right px-1 w-24 font-mono" type="number" min="0" step="0.01"
                                    value={form.otros_costos} onChange={e => setForm(f => ({ ...f, otros_costos: e.target.value }))}
                                    disabled={esConfirmada} />
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-sm">
                                <span>TOTAL</span>
                                <span className="text-[#D4AF37] font-mono">${formatCurrency(total)}</span>
                            </div>

                            {(form.tipo_pago === "credito" || form.tipo_pago === "mixto") && (
                                <>
                                    <div className="border-t pt-2 flex justify-between items-center gap-1">
                                        <span className="text-muted-foreground">Abono inicial</span>
                                        <Input className="h-6 text-xs text-right px-1 w-24 font-mono" type="number" min="0" step="0.01"
                                            value={form.abono_inicial} onChange={e => setForm(f => ({ ...f, abono_inicial: e.target.value }))}
                                            disabled={esConfirmada} />
                                    </div>
                                    <div className="flex justify-between font-semibold text-red-600">
                                        <span>Saldo pendiente</span>
                                        <span className="font-mono">${formatCurrency(Math.max(0, saldoPendiente))}</span>
                                    </div>
                                    {form.fecha_vencimiento && (
                                        <p className="text-[10px] text-muted-foreground">Vence: {form.fecha_vencimiento}</p>
                                    )}
                                </>
                            )}

                            <div className="pt-2 border-t space-y-1 text-[10px] text-muted-foreground">
                                <div className="flex justify-between"><span>Productos</span><span>{validItems.length} ítems</span></div>
                                <div className="flex justify-between"><span>Unidades totales</span><span>{validItems.reduce((s, i) => s + i.cantidad, 0)}</span></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alertas */}
                    {validItems.some(i => !i.talla) && !esConfirmada && (
                        <div className="rounded-lg border border-orange-300 bg-orange-50 p-2 text-xs flex items-start gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                            <span>Hay productos sin talla. No podrás confirmar hasta completarlos.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal: Crear nuevo producto ──────────────────────────────────── */}
            <Dialog open={nuevoProductoOpen} onOpenChange={open => {
                setNuevoProductoOpen(open)
                if (open) {
                    setNpForm(f => ({ ...f, proveedor_id: form.proveedor_id }))
                } else {
                    setNpForm({ nombre: '', sku: '', color: '', categoria_padre_id: '', tipo_prenda_id: '', talla_id: '', precio_compra: '', precio_venta: '', precio_minimo: '', stock_actual: '0', proveedor_id: '' })
                    setNuevaCat({ show: false, valor: '', saving: false })
                    setNuevoTipo({ show: false, valor: '', saving: false })
                    setNuevaTalla({ show: false, valor: '', saving: false })
                }
            }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PackagePlus className="h-4 w-4 text-emerald-600" /> Nuevo Producto
                        </DialogTitle>
                        <DialogDescription>Crea un producto rápidamente. Se agregará al grid automáticamente.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-2 py-1">

                        {/* Nombre */}
                        <div className="space-y-1 col-span-2">
                            <Label className="text-xs">Nombre *</Label>
                            <Input className="h-8 text-xs" value={npForm.nombre} onChange={e => setNpForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Blusa floral manga larga..." />
                        </div>

                        {/* Categoría */}
                        <div className="space-y-1">
                            <Label className="text-xs flex items-center justify-between">
                                Categoría *
                                <button type="button" className="text-emerald-600 hover:underline text-[10px]" onClick={() => setNuevaCat(s => ({ ...s, show: !s.show, valor: '' }))}>
                                    {nuevaCat.show ? '✕ Cancelar' : '+ Nueva'}
                                </button>
                            </Label>
                            {nuevaCat.show ? (
                                <div className="flex gap-1">
                                    <Input className="h-8 text-xs flex-1" placeholder="Nombre categoría..." value={nuevaCat.valor} onChange={e => setNuevaCat(s => ({ ...s, valor: e.target.value.toUpperCase() }))} onKeyDown={e => e.key === 'Enter' && crearCategoria()} autoFocus />
                                    <Button size="sm" className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={crearCategoria} disabled={nuevaCat.saving}>{nuevaCat.saving ? '...' : '✓'}</Button>
                                </div>
                            ) : (
                                <Select value={npForm.categoria_padre_id} onValueChange={v => setNpForm(f => ({ ...f, categoria_padre_id: v, tipo_prenda_id: '' }))}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>{categorias.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>)}</SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Tipo de prenda */}
                        <div className="space-y-1">
                            <Label className="text-xs flex items-center justify-between">
                                Tipo de prenda *
                                <button type="button" className={`text-emerald-600 hover:underline text-[10px] ${!npForm.categoria_padre_id ? 'opacity-30 pointer-events-none' : ''}`} onClick={() => setNuevoTipo(s => ({ ...s, show: !s.show, valor: '' }))}>
                                    {nuevoTipo.show ? '✕ Cancelar' : '+ Nuevo'}
                                </button>
                            </Label>
                            {nuevoTipo.show ? (
                                <div className="flex gap-1">
                                    <Input className="h-8 text-xs flex-1" placeholder="Nombre tipo..." value={nuevoTipo.valor} onChange={e => setNuevoTipo(s => ({ ...s, valor: e.target.value.toUpperCase() }))} onKeyDown={e => e.key === 'Enter' && crearTipo()} autoFocus />
                                    <Button size="sm" className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={crearTipo} disabled={nuevoTipo.saving}>{nuevoTipo.saving ? '...' : '✓'}</Button>
                                </div>
                            ) : (
                                <Select value={npForm.tipo_prenda_id} onValueChange={v => setNpForm(f => ({ ...f, tipo_prenda_id: v }))} disabled={!npForm.categoria_padre_id}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={npForm.categoria_padre_id ? 'Seleccionar...' : 'Elige categoría primero'} /></SelectTrigger>
                                    <SelectContent>{tiposFiltrados.map((t: any) => <SelectItem key={t.id} value={t.id.toString()}>{t.nombre}</SelectItem>)}</SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Talla */}
                        <div className="space-y-1">
                            <Label className="text-xs flex items-center justify-between">
                                Talla
                                <button type="button" className="text-emerald-600 hover:underline text-[10px]" onClick={() => setNuevaTalla(s => ({ ...s, show: !s.show, valor: '' }))}>
                                    {nuevaTalla.show ? '✕ Cancelar' : '+ Nueva'}
                                </button>
                            </Label>
                            {nuevaTalla.show ? (
                                <div className="flex gap-1">
                                    <Input className="h-8 text-xs flex-1" placeholder="XL, 38, 10-12..." value={nuevaTalla.valor} onChange={e => setNuevaTalla(s => ({ ...s, valor: e.target.value.toUpperCase() }))} onKeyDown={e => e.key === 'Enter' && crearTalla()} autoFocus />
                                    <Button size="sm" className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={crearTalla} disabled={nuevaTalla.saving}>{nuevaTalla.saving ? '...' : '✓'}</Button>
                                </div>
                            ) : (
                                <Select value={npForm.talla_id} onValueChange={v => setNpForm(f => ({ ...f, talla_id: v }))}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>{tallas.map((t: any) => <SelectItem key={t.id} value={t.id.toString()}>{t.valor}</SelectItem>)}</SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Proveedor */}
                        <div className="space-y-1">
                            <Label className="text-xs">Proveedor *</Label>
                            <Select value={npForm.proveedor_id} onValueChange={v => setNpForm(f => ({ ...f, proveedor_id: v }))}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                <SelectContent>
                                    {proveedores.map((p: any) => <SelectItem key={p.id} value={p.id.toString()}>{p.razon_social}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Color */}
                        <div className="space-y-1">
                            <Label className="text-xs">Color</Label>
                            <Input className="h-8 text-xs" value={npForm.color} onChange={e => setNpForm(f => ({ ...f, color: e.target.value.toUpperCase() }))} placeholder="NEGRO, ROJO..." />
                        </div>

                        {/* SKU auto */}
                        <div className="space-y-1 col-span-2">
                            <Label className="text-xs flex items-center gap-1">
                                SKU <span className="text-[10px] text-emerald-600 font-normal">(generado automáticamente, editable)</span>
                            </Label>
                            <Input className="h-8 text-xs font-mono" value={npForm.sku} onChange={e => setNpForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))} placeholder="CAT-TIP-TAL-COL-###" />
                        </div>

                        {/* Precio compra */}
                        <div className="space-y-1">
                            <Label className="text-xs">Precio compra *</Label>
                            <Input className="h-8 text-xs" type="number" min="0" step="0.01" value={npForm.precio_compra} onChange={e => setNpForm(f => ({ ...f, precio_compra: e.target.value }))} placeholder="0.00" />
                        </div>

                        {/* Precio venta */}
                        <div className="space-y-1">
                            <Label className="text-xs">Precio venta *</Label>
                            <Input className="h-8 text-xs" type="number" min="0" step="0.01" value={npForm.precio_venta} onChange={e => setNpForm(f => ({ ...f, precio_venta: e.target.value, precio_minimo: e.target.value }))} placeholder="0.00" />
                        </div>

                    </div>

                    <DialogFooter>
                        <Button size="sm" variant="outline" onClick={() => setNuevoProductoOpen(false)}>Cancelar</Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCrearProducto} disabled={nuevoProductoSaving}>
                            {nuevoProductoSaving ? 'Creando...' : 'Crear y agregar al pedido'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
