// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: obtener compra con su detalle
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id
        const [compra] = await query<any[]>(
            `SELECT c.*, p.razon_social AS proveedor_nombre, u.nombre AS usuario_nombre
       FROM compras c
       LEFT JOIN proveedores p ON c.proveedor_id = p.id
       LEFT JOIN usuarios    u ON c.usuario_id   = u.id
       WHERE c.id = ?`, [id]
        )
        if (!compra) return NextResponse.json({ success: false, error: 'Compra no encontrada' }, { status: 404 })

        const detalle = await query<any[]>(
            `SELECT cd.*, pr.nombre AS producto_nombre, pr.sku,
              t.valor AS talla_valor, pr.color,
              tp.nombre AS tipo_prenda_nombre
       FROM compra_detalle cd
       INNER JOIN productos    pr ON cd.producto_id = pr.id
       LEFT JOIN  tallas        t ON pr.talla_id    = t.id
       LEFT JOIN  tipos_prenda tp ON pr.tipo_prenda_id = tp.id
       WHERE cd.compra_id = ?
       ORDER BY cd.id`, [id]
        )

        return NextResponse.json({ success: true, data: { ...compra, detalle } })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// PUT: actualizar compra borrador
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id
        const body = await request.json()
        const {
            proveedor_id, factura_numero, fecha, fecha_vencimiento,
            tipo_pago, observaciones, usuario_id, items = [], otros_costos = 0, abono_inicial = 0
        } = body

        // Verificar estado
        const [comp] = await query<any[]>('SELECT estado FROM compras WHERE id=?', [id])
        if (!comp) return NextResponse.json({ success: false, error: 'No encontrada' }, { status: 404 })
        if (comp.estado === 'confirmada') return NextResponse.json({ success: false, error: 'No se puede editar una compra confirmada' }, { status: 400 })

        // Calcular totales
        let subtotal = 0, descuento_total = 0, iva_total = 0
        const itemsCalc = items.map((it: any) => {
            const sub = Number(it.cantidad) * Number(it.costo_unitario)
            const desc = sub * (Number(it.descuento_pct) / 100)
            const base = sub - desc
            const iva = base * (Number(it.iva_pct) / 100)
            subtotal += sub; descuento_total += desc; iva_total += iva
            return { ...it, subtotal: sub.toFixed(2), total: (base + iva).toFixed(2) }
        })
        const total = subtotal - descuento_total + iva_total + Number(otros_costos)

        await query(
            `UPDATE compras SET proveedor_id=?, factura_numero=?, fecha=?, fecha_vencimiento=?, tipo_pago=?,
       subtotal=?, descuento_total=?, iva_total=?, otros_costos=?, total=?, abono_inicial=?, usuario_id=?, observaciones=?
       WHERE id=?`,
            [proveedor_id, factura_numero || null, fecha, fecha_vencimiento || null, tipo_pago || 'contado',
                subtotal.toFixed(2), descuento_total.toFixed(2), iva_total.toFixed(2),
                Number(otros_costos).toFixed(2), total.toFixed(2), Number(abono_inicial).toFixed(2),
                usuario_id || null, observaciones || null, id]
        )

        // Reemplazar detalle
        await query('DELETE FROM compra_detalle WHERE compra_id=?', [id])
        for (const it of itemsCalc) {
            await query(
                `INSERT INTO compra_detalle (compra_id, producto_id, cantidad, costo_unitario, descuento_pct, iva_pct, subtotal, total)
         VALUES (?,?,?,?,?,?,?,?)`,
                [id, it.producto_id, it.cantidad, it.costo_unitario, it.descuento_pct || 0, it.iva_pct || 0, it.subtotal, it.total]
            )
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// DELETE: anulaR compra
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id
        const [comp] = await query<any[]>('SELECT estado FROM compras WHERE id=?', [id])
        if (!comp) return NextResponse.json({ success: false, error: 'No encontrada' }, { status: 404 })
        if (comp.estado === 'confirmada') return NextResponse.json({ success: false, error: 'No se puede anular una compra confirmada' }, { status: 400 })
        await query("UPDATE compras SET estado='anulada' WHERE id=?", [id])
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
