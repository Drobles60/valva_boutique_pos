"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { SidebarToggle } from "@/components/app-sidebar"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import {
    BookOpen, Package, TrendingUp, AlertTriangle, Plus,
    Search, Printer, FileDown, RefreshCw, ChevronDown, ChevronUp, Filter,
    ArrowUpCircle, ArrowDownCircle, X, Keyboard,
} from "lucide-react"

function fmt(d: string) {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

function tipoBadge(tipo: string) {
    if (tipo.includes("Venta") || tipo.includes("Merma")) return "destructive"
    if (tipo.includes("Compra") || tipo.includes("Dev. Entrada")) return "default"
    if (tipo.includes("Ajuste")) return "secondary"
    return "outline"
}

export function KardexContent() {
    const [opciones, setOpciones] = useState<any>({ categorias: [], tallas: [], usuarios: [] })
    const [productos, setProductos] = useState<any[]>([])
    const [filtros, setFiltros] = useState({
        producto_id: "", categoria_id: "", talla: "", color: "",
        fecha_inicio: "", fecha_fin: "", tercero: "", usuario_id: "",
        tipo_movimiento: "", referencia: "",
    })
    const [filtrosOpen, setFiltrosOpen] = useState(true)
    const [movimientos, setMovimientos] = useState<any[]>([])
    const [resumen, setResumen] = useState<any>(null)
    const [consultado, setConsultado] = useState(false)
    const [loading, setLoading] = useState(false)
    const [ajusteOpen, setAjusteOpen] = useState(false)
    const [ajusteData, setAjusteData] = useState({ producto_id: "", tipo_movimiento: "ajuste_manual", cantidad: "", motivo: "" })
    const [ajusteLoading, setAjusteLoading] = useState(false)
    // Búsqueda rápida
    const [busquedaRapida, setBusquedaRapida] = useState("")
    const [busquedaVisible, setBusquedaVisible] = useState(false)
    const busquedaRef = useRef<HTMLInputElement>(null)
    const tableRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch("/api/kardex?action=filtros").then(r => r.json()).then(j => { if (j.success) setOpciones(j) }).catch(() => { })
        fetch("/api/productos").then(r => r.json()).then(j => { if (j.success) setProductos(j.data || []) }).catch(() => { })
    }, [])

    // Atajo de teclado: / o Ctrl+F para búsqueda rápida
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName
            const enInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
            if ((e.key === '/' && !enInput) || (e.key === 'f' && (e.ctrlKey || e.metaKey))) {
                e.preventDefault()
                setBusquedaVisible(true)
                setTimeout(() => busquedaRef.current?.focus(), 50)
            }
            if (e.key === 'Escape') {
                setBusquedaVisible(false)
                setBusquedaRapida("")
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    // Movimientos filtrados por búsqueda rápida
    const movimientosFiltrados = useMemo(() => {
        if (!busquedaRapida.trim()) return movimientos
        const q = busquedaRapida.toLowerCase()
        return movimientos.filter(m =>
            [m.producto, m.sku, m.descripcion, m.tercero, m.referencia, m.tipo_movimiento, m.talla, m.color, m.usuario]
                .some(v => v?.toString().toLowerCase().includes(q))
        )
    }, [movimientos, busquedaRapida])

    const handleConsultar = async () => {
        setLoading(true)
        try {
            const p = new URLSearchParams()
            Object.entries(filtros).forEach(([k, v]) => { if (v) p.set(k, v) })
            const res = await fetch(`/api/kardex?${p.toString()}`)
            const json = await res.json()
            if (!json.success) { toast.error(json.error || "Error al consultar"); return }
            setMovimientos(json.movimientos)
            setResumen(json.resumen)
            setConsultado(true)
            setFiltrosOpen(false)
        } catch { toast.error("Error de conexión") } finally { setLoading(false) }
    }

    const setF = (k: string, v: string) => setFiltros(prev => ({ ...prev, [k]: v }))

    const handleExportarExcel = () => {
        if (!movimientos.length) { toast.error("No hay datos para exportar"); return }
        const headers = ["Fecha", "Referencia", "Descripción", "Tercero", "Producto", "SKU", "Talla", "Color", "Tipo", "Ent.Cant", "Ent.Valor", "Sal.Cant", "Sal.Valor", "Saldo Cant", "Saldo Valor", "Costo Unit.", "Costo Prom."]
        const rows = movimientos.map(m => [
            fmt(m.fecha), m.referencia, m.descripcion, m.tercero,
            m.producto, m.sku, m.talla, m.color, m.tipo_movimiento,
            m.entrada_cant, m.entrada_valor?.toFixed(2),
            m.salida_cant, m.salida_valor?.toFixed(2),
            m.saldo_cant, m.saldo_valor?.toFixed(2),
            m.costo_unitario?.toFixed(2), m.costo_promedio?.toFixed(2),
        ])
        const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ''}"`).join(",")).join("\n")
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url; a.download = `kardex_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
        URL.revokeObjectURL(url)
    }

    const handleAjuste = async () => {
        if (!ajusteData.producto_id || !ajusteData.cantidad || !ajusteData.motivo) { toast.error("Completa todos los campos"); return }
        setAjusteLoading(true)
        try {
            const res = await fetch("/api/kardex", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...ajusteData, cantidad: parseInt(ajusteData.cantidad) })
            })
            const json = await res.json()
            if (!res.ok) { toast.error(json.error || "Error"); return }
            toast.success("Ajuste registrado")
            setAjusteOpen(false)
            setAjusteData({ producto_id: "", tipo_movimiento: "ajuste_manual", cantidad: "", motivo: "" })
            if (consultado) handleConsultar()
        } catch { toast.error("Error") } finally { setAjusteLoading(false) }
    }

    return (
        <div className="flex flex-col h-full gap-3 p-3 md:p-4">

            {/* ── Encabezado compacto ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-2 flex-wrap print:hidden">
                <div className="flex items-center gap-2">
                    <SidebarToggle />
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-[#D4AF37] shrink-0" />
                        <div>
                            <h1 className="text-lg font-bold leading-tight">Kardex e Inventarios</h1>
                            <p className="text-xs text-muted-foreground hidden sm:block">Control de movimientos · Promedio Ponderado</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    <Button size="sm" onClick={handleConsultar} disabled={loading} className="bg-[#D4AF37] hover:bg-[#c4a030] text-black">
                        <Search className="h-3.5 w-3.5 mr-1" />
                        {loading ? "..." : "Consultar"}
                    </Button>
                    {/* Búsqueda rápida */}
                    <Button
                        size="sm" variant="outline"
                        onClick={() => { setBusquedaVisible(v => !v); setTimeout(() => busquedaRef.current?.focus(), 50) }}
                        className={busquedaVisible ? "border-[#D4AF37] text-[#D4AF37]" : ""}
                    >
                        <Keyboard className="h-3.5 w-3.5 mr-1" />
                        <span className="hidden sm:inline">Buscar</span>
                        <kbd className="ml-1 hidden sm:inline-flex items-center rounded bg-muted px-1 text-[9px] text-muted-foreground">/</kbd>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.print()}>
                        <Printer className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleExportarExcel}>
                        <FileDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAjusteOpen(true)}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        <span className="hidden sm:inline">Ajuste</span>
                    </Button>
                </div>
            </div>

            {/* ── Panel de filtros ────────────────────────────────────────────────── */}
            <Card className="print:hidden shrink-0">
                <div
                    className="flex items-center justify-between px-3 py-2 cursor-pointer select-none border-b"
                    onClick={() => setFiltrosOpen(v => !v)}
                >
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                        <Filter className="h-3.5 w-3.5" /> Filtros de búsqueda
                    </span>
                    {filtrosOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>

                {filtrosOpen && (
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {/* Producto — full width */}
                        <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-1">
                            <Label className="text-xs">Producto / SKU</Label>
                            <SearchableSelect
                                value={filtros.producto_id}
                                onValueChange={v => setF("producto_id", v)}
                                items={productos.map(p => ({
                                    value: p.id.toString(),
                                    label: `${p.nombre} | ${p.sku || "Sin SKU"} | T:${p.talla_valor || "—"} | C:${p.color || "—"}`
                                }))}
                                placeholder="Todos los productos"
                                searchPlaceholder="Buscar..."
                                emptyMessage="No encontrado"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Categoría</Label>
                            <Select value={filtros.categoria_id} onValueChange={v => setF("categoria_id", v === "_" ? "" : v)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todas" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_">Todas</SelectItem>
                                    {opciones.categorias.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Talla</Label>
                            <Select value={filtros.talla} onValueChange={v => setF("talla", v === "_" ? "" : v)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todas" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_">Todas</SelectItem>
                                    {opciones.tallas.map((t: any) => (
                                        <SelectItem key={t.id} value={t.valor}>{t.valor}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Color</Label>
                            <Input className="h-8 text-xs" placeholder="Negro..." value={filtros.color} onChange={e => setF("color", e.target.value)} />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Desde</Label>
                            <Input className="h-8 text-xs" type="date" value={filtros.fecha_inicio} onChange={e => setF("fecha_inicio", e.target.value)} />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Hasta</Label>
                            <Input className="h-8 text-xs" type="date" value={filtros.fecha_fin} onChange={e => setF("fecha_fin", e.target.value)} />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Tercero</Label>
                            <Input className="h-8 text-xs" placeholder="Proveedor/Cliente..." value={filtros.tercero} onChange={e => setF("tercero", e.target.value)} />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Usuario</Label>
                            <Select value={filtros.usuario_id} onValueChange={v => setF("usuario_id", v === "_" ? "" : v)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_">Todos</SelectItem>
                                    {opciones.usuarios.map((u: any) => (
                                        <SelectItem key={u.id} value={u.id.toString()}>{u.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Tipo</Label>
                            <Select value={filtros.tipo_movimiento} onValueChange={v => setF("tipo_movimiento", v === "_" ? "" : v)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_">Todos</SelectItem>
                                    <SelectItem value="Compra">Compra</SelectItem>
                                    <SelectItem value="Venta">Venta</SelectItem>
                                    <SelectItem value="Devolucion">Devolución</SelectItem>
                                    <SelectItem value="Ajuste">Ajuste</SelectItem>
                                    <SelectItem value="Merma">Merma</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Referencia</Label>
                            <Input className="h-8 text-xs" placeholder="# Doc..." value={filtros.referencia} onChange={e => setF("referencia", e.target.value)} />
                        </div>

                        <div className="flex items-end">
                            <Button
                                size="sm" variant="ghost"
                                className="w-full h-8 text-xs text-muted-foreground"
                                onClick={() => setFiltros({ producto_id: "", categoria_id: "", talla: "", color: "", fecha_inicio: "", fecha_fin: "", tercero: "", usuario_id: "", tipo_movimiento: "", referencia: "" })}
                            >
                                <RefreshCw className="h-3 w-3 mr-1" /> Limpiar
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* ── Tarjetas resumen ────────────────────────────────────────────────── */}
            {consultado && resumen && (
                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 shrink-0">
                    {[
                        { label: "Entradas", value: resumen.total_entradas, icon: ArrowUpCircle, color: "text-green-600", sub: `$${formatCurrency(resumen.total_entrada_valor)}` },
                        { label: "Salidas", value: resumen.total_salidas, icon: ArrowDownCircle, color: "text-red-600", sub: `$${formatCurrency(resumen.total_salida_valor)}` },
                        { label: "Registros", value: movimientos.length, icon: BookOpen, color: "text-blue-600", sub: "movimientos" },
                        { label: "Stock Final", value: resumen.stock_final, icon: Package, color: "text-[#D4AF37]", sub: "unidades" },
                        { label: "Valor Final", value: `$${formatCurrency(resumen.valor_final)}`, icon: TrendingUp, color: "text-purple-600", sub: "en inventario" },
                        { label: "Alertas", value: resumen.stock_minimos?.length ?? 0, icon: AlertTriangle, color: "text-orange-500", sub: "stock bajo mín." },
                    ].map((c, i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardContent className="p-2.5">
                                <div className="flex items-center gap-1.5">
                                    <c.icon className={`h-4 w-4 shrink-0 ${c.color}`} />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-muted-foreground truncate leading-none mb-0.5">{c.label}</p>
                                        <p className={`text-base font-bold leading-none ${c.color}`}>{c.value}</p>
                                        <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{c.sub}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ── Tabla / estado vacío ────────────────────────────────────────────── */}
            {!consultado ? (
                <Card className="flex-1">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <BookOpen className="h-12 w-12 mb-3 text-[#D4AF37] opacity-25" />
                        <h3 className="font-semibold mb-1">Aplica filtros y presiona Consultar</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mb-4">Filtra por producto, categoría, talla, color, período, tipo de movimiento y más.</p>
                        <Button className="bg-[#D4AF37] hover:bg-[#c4a030] text-black" onClick={handleConsultar} disabled={loading}>
                            <Search className="mr-2 h-4 w-4" />
                            {loading ? "Consultando..." : "Ver todos los movimientos"}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="flex-1 min-h-0 flex flex-col">
                    <CardHeader className="py-1.5 px-3 border-b shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold whitespace-nowrap">Tabla Kardex</span>
                            {/* Búsqueda rápida inline */}
                            <div className={`flex flex-1 items-center gap-1.5 rounded border px-2 py-1 transition-all ${busquedaVisible
                                ? 'border-[#D4AF37]/70 bg-[#D4AF37]/5 shadow-sm'
                                : 'border-transparent bg-muted/40 hover:border-muted-foreground/20'
                                }`}>
                                <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                                <input
                                    ref={busquedaRef}
                                    value={busquedaRapida}
                                    onChange={e => setBusquedaRapida(e.target.value)}
                                    onFocus={() => setBusquedaVisible(true)}
                                    placeholder={busquedaVisible ? 'Producto, SKU, tipo, referencia… (Esc para cerrar)' : 'Buscar en tabla…  /'}
                                    className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground min-w-0"
                                />
                                {busquedaRapida && (
                                    <>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{movimientosFiltrados.length}/{movimientos.length}</span>
                                        <button onClick={() => { setBusquedaRapida(''); busquedaRef.current?.focus() }} className="text-muted-foreground hover:text-foreground">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </>
                                )}
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0 whitespace-nowrap">
                                {busquedaRapida ? `${movimientosFiltrados.length} de ${movimientos.length}` : `${movimientos.length} reg.`}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto flex-1" ref={tableRef}>
                        {movimientosFiltrados.length === 0 ? (
                            <div className="py-10 text-center text-muted-foreground">
                                <p className="text-sm">Sin movimientos con los filtros aplicados.</p>
                            </div>
                        ) : (
                            <Table className="text-[11px]">
                                <TableHeader className="sticky top-0 z-10">
                                    <TableRow className="bg-muted/50">
                                        {/* 1a fila de cabeceras — grupos */}
                                        <TableHead className="py-1 px-2 whitespace-nowrap font-semibold border-r" rowSpan={2}>Fecha</TableHead>
                                        <TableHead className="py-1 px-2 whitespace-nowrap font-semibold border-r" rowSpan={2}>Tipo</TableHead>
                                        <TableHead className="py-1 px-2 font-semibold border-r" rowSpan={2}>Descripción</TableHead>
                                        <TableHead className="py-1 px-2 whitespace-nowrap font-semibold border-r" rowSpan={2}>Producto</TableHead>
                                        <TableHead className="py-1 px-2 whitespace-nowrap font-semibold border-r" rowSpan={2}>SKU</TableHead>
                                        <TableHead className="py-1 px-1 text-center font-semibold border-r" rowSpan={2}>T.</TableHead>
                                        <TableHead className="py-1 px-1 text-center font-semibold border-r" rowSpan={2}>Color</TableHead>
                                        <TableHead className="py-1 px-2 text-center font-semibold border-r bg-green-50 dark:bg-green-950/30" colSpan={2}>↑ Entradas</TableHead>
                                        <TableHead className="py-1 px-2 text-center font-semibold border-r bg-red-50 dark:bg-red-950/30" colSpan={2}>↓ Salidas</TableHead>
                                        <TableHead className="py-1 px-2 text-center font-semibold border-r bg-blue-50 dark:bg-blue-950/30" colSpan={2}>= Saldo</TableHead>
                                        <TableHead className="py-1 px-2 text-right font-semibold whitespace-nowrap" rowSpan={2}>C.Unit.</TableHead>
                                        <TableHead className="py-1 px-2 text-right font-semibold whitespace-nowrap" rowSpan={2}>C.Prom.</TableHead>
                                    </TableRow>
                                    <TableRow className="bg-muted/30 text-[10px] text-muted-foreground">
                                        <TableHead className="py-0.5 px-2 text-right bg-green-50/60 dark:bg-green-950/20">Cant</TableHead>
                                        <TableHead className="py-0.5 px-2 text-right border-r bg-green-50/60 dark:bg-green-950/20">Valor</TableHead>
                                        <TableHead className="py-0.5 px-2 text-right bg-red-50/60 dark:bg-red-950/20">Cant</TableHead>
                                        <TableHead className="py-0.5 px-2 text-right border-r bg-red-50/60 dark:bg-red-950/20">Valor</TableHead>
                                        <TableHead className="py-0.5 px-2 text-right bg-blue-50/60 dark:bg-blue-950/20">Cant</TableHead>
                                        <TableHead className="py-0.5 px-2 text-right border-r bg-blue-50/60 dark:bg-blue-950/20">Valor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movimientosFiltrados.map((m) => (
                                        <TableRow key={m.id} className="hover:bg-muted/30 border-b border-muted/40">
                                            <TableCell className="py-1 px-2 whitespace-nowrap border-r font-medium">{fmt(m.fecha)}</TableCell>
                                            <TableCell className="py-1 px-2 border-r">
                                                <Badge variant={tipoBadge(m.tipo_movimiento) as any} className="text-[9px] py-0 px-1 h-4">
                                                    {m.tipo_movimiento}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-1 px-2 border-r max-w-[130px] truncate" title={m.descripcion}>{m.descripcion}</TableCell>
                                            <TableCell className="py-1 px-2 border-r max-w-[110px] truncate font-medium" title={m.producto}>{m.producto}</TableCell>
                                            <TableCell className="py-1 px-2 border-r font-mono whitespace-nowrap">{m.sku || "—"}</TableCell>
                                            <TableCell className="py-1 px-1 text-center border-r">{m.talla || "—"}</TableCell>
                                            <TableCell className="py-1 px-2 border-r truncate max-w-[70px]">{m.color || "—"}</TableCell>
                                            {/* Entradas */}
                                            <TableCell className="py-1 px-2 text-right font-semibold text-green-700 bg-green-50/30">
                                                {m.entrada_cant > 0 ? m.entrada_cant : <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell className="py-1 px-2 text-right text-green-700 bg-green-50/30 border-r font-mono">
                                                {m.entrada_cant > 0 ? `$${formatCurrency(m.entrada_valor)}` : <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            {/* Salidas */}
                                            <TableCell className="py-1 px-2 text-right font-semibold text-red-700 bg-red-50/30">
                                                {m.salida_cant > 0 ? m.salida_cant : <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell className="py-1 px-2 text-right text-red-700 bg-red-50/30 border-r font-mono">
                                                {m.salida_cant > 0 ? `$${formatCurrency(m.salida_valor)}` : <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            {/* Saldo */}
                                            <TableCell className="py-1 px-2 text-right font-bold text-blue-700 bg-blue-50/30">{m.saldo_cant}</TableCell>
                                            <TableCell className="py-1 px-2 text-right font-semibold text-blue-700 bg-blue-50/30 border-r font-mono">${formatCurrency(m.saldo_valor)}</TableCell>
                                            {/* Costos */}
                                            <TableCell className="py-1 px-2 text-right font-mono">${formatCurrency(m.costo_unitario)}</TableCell>
                                            <TableCell className="py-1 px-2 text-right font-mono text-purple-700">${formatCurrency(m.costo_promedio)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ── Modal ajuste ───────────────────────────────────────────────────── */}
            <Dialog open={ajusteOpen} onOpenChange={setAjusteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Registrar Ajuste</DialogTitle>
                        <DialogDescription>Entrada, salida o devolución manual de inventario.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-1">
                        <div className="space-y-1">
                            <Label className="text-xs">Producto *</Label>
                            <SearchableSelect
                                value={ajusteData.producto_id}
                                onValueChange={v => setAjusteData(d => ({ ...d, producto_id: v }))}
                                items={productos.map(p => ({ value: p.id.toString(), label: `${p.nombre} | ${p.sku || "Sin SKU"}` }))}
                                placeholder="Seleccionar..." searchPlaceholder="Buscar..." emptyMessage="No encontrado"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Tipo *</Label>
                            <Select value={ajusteData.tipo_movimiento} onValueChange={v => setAjusteData(d => ({ ...d, tipo_movimiento: v }))}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ajuste_manual">Ajuste Manual</SelectItem>
                                    <SelectItem value="entrada_inicial">Entrada / Compra</SelectItem>
                                    <SelectItem value="entrada_devolucion">Devolución Entrada</SelectItem>
                                    <SelectItem value="salida_merma">Merma / Baja</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Cantidad *</Label>
                                <Input className="h-8 text-xs" type="number" min="1" value={ajusteData.cantidad} onChange={e => setAjusteData(d => ({ ...d, cantidad: e.target.value }))} placeholder="Ej: 5" />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <Label className="text-xs">Motivo *</Label>
                                <Input className="h-8 text-xs" value={ajusteData.motivo} onChange={e => setAjusteData(d => ({ ...d, motivo: e.target.value }))} placeholder="Ej: Conteo físico..." />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button size="sm" variant="outline" onClick={() => setAjusteOpen(false)}>Cancelar</Button>
                        <Button size="sm" onClick={handleAjuste} disabled={ajusteLoading || !ajusteData.producto_id || !ajusteData.cantidad || !ajusteData.motivo}>
                            {ajusteLoading ? "Guardando..." : "Registrar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
