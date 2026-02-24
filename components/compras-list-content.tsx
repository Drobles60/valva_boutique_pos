"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarToggle } from "@/components/app-sidebar"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { ShoppingCart, Plus, RefreshCw, Eye, CheckCircle, Clock, XCircle } from "lucide-react"

function estadoBadge(estado: string) {
    if (estado === "confirmada") return <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px]"><CheckCircle className="h-2.5 w-2.5 mr-1" />Confirmada</Badge>
    if (estado === "anulada") return <Badge variant="destructive" className="text-[10px]"><XCircle className="h-2.5 w-2.5 mr-1" />Anulada</Badge>
    return <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-400"><Clock className="h-2.5 w-2.5 mr-1" />Borrador</Badge>
}

export function ComprasListContent() {
    const router = useRouter()
    const [compras, setCompras] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [proveedores, setProveedores] = useState<any[]>([])
    const [filtros, setFiltros] = useState({ estado: "", proveedor_id: "", fecha_inicio: "", fecha_fin: "" })

    const cargar = async () => {
        setLoading(true)
        try {
            const p = new URLSearchParams()
            Object.entries(filtros).forEach(([k, v]) => { if (v) p.set(k, v) })
            const res = await fetch(`/api/compras?${p}`)
            const json = await res.json()
            if (json.success) setCompras(json.data || [])
            else toast.error(json.error)
        } catch { toast.error("Error de conexión") } finally { setLoading(false) }
    }

    useEffect(() => {
        fetch("/api/proveedores").then(r => r.json()).then(j => { if (j.success) setProveedores(j.data || []) })
        cargar()
    }, [])

    return (
        <div className="flex flex-col h-full gap-3 p-3 md:p-4">

            {/* Encabezado */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <SidebarToggle />
                    <ShoppingCart className="h-5 w-5 text-[#D4AF37]" />
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Facturas de Compra</h1>
                        <p className="text-xs text-muted-foreground">Registro de compras a proveedores</p>
                    </div>
                </div>
                <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c4a030] text-black" onClick={() => router.push("/inventario/compras/nueva")}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Nueva Compra
                </Button>
            </div>

            {/* Filtros */}
            <Card>
                <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="space-y-1">
                        <Label className="text-xs">Estado</Label>
                        <Select value={filtros.estado || "_"} onValueChange={v => setFiltros(f => ({ ...f, estado: v === "_" ? "" : v }))}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_">Todos</SelectItem>
                                <SelectItem value="borrador">Borrador</SelectItem>
                                <SelectItem value="confirmada">Confirmada</SelectItem>
                                <SelectItem value="anulada">Anulada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Proveedor</Label>
                        <Select value={filtros.proveedor_id || "_"} onValueChange={v => setFiltros(f => ({ ...f, proveedor_id: v === "_" ? "" : v }))}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_">Todos</SelectItem>
                                {proveedores.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.razon_social}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Desde</Label>
                        <Input className="h-8 text-xs" type="date" value={filtros.fecha_inicio} onChange={e => setFiltros(f => ({ ...f, fecha_inicio: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Hasta</Label>
                        <Input className="h-8 text-xs" type="date" value={filtros.fecha_fin} onChange={e => setFiltros(f => ({ ...f, fecha_fin: e.target.value }))} />
                    </div>
                </div>
                <div className="px-3 pb-3 flex gap-2">
                    <Button size="sm" className="bg-[#D4AF37] hover:bg-[#c4a030] text-black h-7 text-xs" onClick={cargar} disabled={loading}>
                        {loading ? "Cargando..." : "Consultar"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setFiltros({ estado: "", proveedor_id: "", fecha_inicio: "", fecha_fin: "" })}>
                        <RefreshCw className="h-3 w-3 mr-1" /> Limpiar
                    </Button>
                </div>
            </Card>

            {/* Tabla */}
            <Card className="flex-1 min-h-0 overflow-auto">
                <table className="w-full text-[11px]">
                    <thead className="bg-muted/40 sticky top-0">
                        <tr>
                            <th className="text-left py-2 px-3 font-semibold">N° Compra</th>
                            <th className="text-left py-2 px-2 font-semibold">Proveedor</th>
                            <th className="text-left py-2 px-2 font-semibold">Factura Prov.</th>
                            <th className="text-left py-2 px-2 font-semibold">Fecha</th>
                            <th className="text-center py-2 px-2 font-semibold">Productos</th>
                            <th className="text-center py-2 px-2 font-semibold">Pago</th>
                            <th className="text-right py-2 px-3 font-semibold">Total</th>
                            <th className="text-center py-2 px-2 font-semibold">Estado</th>
                            <th className="text-center py-2 px-2 font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {compras.length === 0 ? (
                            <tr><td colSpan={9} className="py-12 text-center text-muted-foreground">
                                <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>No hay compras registradas.</p>
                                <Button size="sm" className="mt-3 bg-[#D4AF37] hover:bg-[#c4a030] text-black" onClick={() => router.push("/inventario/compras/nueva")}>
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Nueva Compra
                                </Button>
                            </td></tr>
                        ) : compras.map(c => (
                            <tr key={c.id} className="border-b border-muted/30 hover:bg-muted/20">
                                <td className="py-1.5 px-3 font-mono font-semibold">{c.numero_compra || `#${c.id}`}</td>
                                <td className="py-1.5 px-2 max-w-[150px] truncate" title={c.proveedor_nombre}>{c.proveedor_nombre}</td>
                                <td className="py-1.5 px-2 text-muted-foreground">{c.factura_numero || "—"}</td>
                                <td className="py-1.5 px-2 whitespace-nowrap">{c.fecha ? new Date(c.fecha).toLocaleDateString("es-EC") : "—"}</td>
                                <td className="py-1.5 px-2 text-center">{c.total_items || 0}</td>
                                <td className="py-1.5 px-2 text-center capitalize">{c.tipo_pago}</td>
                                <td className="py-1.5 px-3 text-right font-mono font-semibold">${formatCurrency(c.total)}</td>
                                <td className="py-1.5 px-2 text-center">{estadoBadge(c.estado)}</td>
                                <td className="py-1.5 px-2 text-center">
                                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => router.push(`/inventario/compras/${c.id}`)}>
                                        <Eye className="h-3 w-3 mr-1" /> Ver
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    )
}
