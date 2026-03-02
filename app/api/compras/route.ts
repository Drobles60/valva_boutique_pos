// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// ── Generar número de compra ──────────────────────────────────────────────────
async function generarNumeroCompra(): Promise<string> {
    const [row] = await query<any[]>('SELECT COUNT(*) as total FROM compras')
    const n = (Number(row?.total) || 0) + 1
    return `COMP-${String(n).padStart(6, '0')}`
}

// ── GET: listar compras ───────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const estado = searchParams.get('estado')
        const proveedor_id = searchParams.get('proveedor_id')
        const fecha_inicio = searchParams.get('fecha_inicio')
        const fecha_fin = searchParams.get('fecha_fin')

        let where = 'WHERE 1=1'
        const params: any[] = []

        if (estado) { where += ' AND c.estado = ?'; params.push(estado) }
        if (proveedor_id) { where += ' AND c.proveedor_id = ?'; params.push(proveedor_id) }
        if (fecha_inicio) { where += ' AND DATE(c.fecha) >= ?'; params.push(fecha_inicio) }
        if (fecha_fin) { where += ' AND DATE(c.fecha) <= ?'; params.push(fecha_fin) }

        const compras = await query<any[]>(
            `SELECT c.id, c.numero_compra, c.factura_numero, c.fecha, c.fecha_vencimiento,
              c.tipo_pago, c.subtotal, c.descuento_total, c.iva_total, c.total,
              c.estado, c.observaciones, c.created_at,
              p.razon_social AS proveedor_nombre,
              u.nombre       AS usuario_nombre,
              (SELECT COUNT(*) FROM compra_detalle cd WHERE cd.compra_id = c.id) AS total_items
       FROM compras c
       LEFT JOIN proveedores p ON c.proveedor_id = p.id
       LEFT JOIN usuarios    u ON c.usuario_id   = u.id
       ${where}
       ORDER BY c.created_at DESC`,
            params
        )

        return NextResponse.json({ success: true, data: compras })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// ── POST: crear compra (borrador) ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            proveedor_id, factura_numero, fecha, fecha_vencimiento,
            tipo_pago, observaciones, usuario_id, items = [],
            otros_costos = 0, abono_inicial = 0,
        } = body

        if (!proveedor_id) return NextResponse.json({ success: false, error: 'Proveedor requerido' }, { status: 400 })
        if (!fecha) return NextResponse.json({ success: false, error: 'Fecha requerida' }, { status: 400 })
        if (!items.length) return NextResponse.json({ success: false, error: 'Agrega al menos un producto' }, { status: 400 })

        // Calcular totales
        let subtotal = 0, descuento_total = 0, iva_total = 0
        const itemsCalculados = items.map((it: any) => {
            const sub = Number(it.cantidad) * Number(it.costo_unitario)
            const desc = sub * (Number(it.descuento_pct) / 100)
            const base = sub - desc
            const iva = base * (Number(it.iva_pct) / 100)
            const total = base + iva
            subtotal += sub
            descuento_total += desc
            iva_total += iva
            return { ...it, subtotal: sub.toFixed(2), total: total.toFixed(2) }
        })
        const total = subtotal - descuento_total + iva_total + Number(otros_costos)

        const numero_compra = await generarNumeroCompra()

        const result = await query<any>(
            `INSERT INTO compras 
       (numero_compra, proveedor_id, factura_numero, fecha, fecha_vencimiento, tipo_pago,
        subtotal, descuento_total, iva_total, otros_costos, total, abono_inicial, estado, usuario_id, observaciones)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'borrador',?,?)`,
            [numero_compra, proveedor_id, factura_numero || null, fecha, fecha_vencimiento || null,
                tipo_pago || 'contado', subtotal.toFixed(2), descuento_total.toFixed(2),
                iva_total.toFixed(2), Number(otros_costos).toFixed(2), total.toFixed(2),
                Number(abono_inicial).toFixed(2),
                usuario_id || null, observaciones || null]
        )
        const compra_id = result.insertId

        // Insertar detalle
        for (const it of itemsCalculados) {
            await query(
                `INSERT INTO compra_detalle (compra_id, producto_id, cantidad, costo_unitario, descuento_pct, iva_pct, subtotal, total)
         VALUES (?,?,?,?,?,?,?,?)`,
                [compra_id, it.producto_id, it.cantidad, it.costo_unitario,
                    it.descuento_pct || 0, it.iva_pct || 0, it.subtotal, it.total]
            )
        }

        // ── Crear pedido correspondiente automáticamente ──────────────────────
        try {
            const numeroPedido = await generarNumeroPedido()
            const abonoIni = Number(abono_inicial) || 0
            const saldoPendiente = Math.max(total - abonoIni, 0)

            // tipo_pago: contado=pago total, credito/mixto=pago parcial o diferido
            const tipoPagoNorm = (tipo_pago === 'contado') ? 'contado' : 'credito'

            const pedidoResult = await query<any>(
                `INSERT INTO pedidos (
                    numero_pedido, proveedor_id, fecha_pedido, costo_total,
                    total_abonado, saldo_pendiente, tipo_pago, estado, usuario_id, notas
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?)`,
                [
                    numeroPedido, proveedor_id, fecha, total.toFixed(2),
                    abonoIni.toFixed(2), saldoPendiente.toFixed(2), tipoPagoNorm,
                    usuario_id || null,
                    `Generado desde compra ${numero_compra}${factura_numero ? ' - Fact. ' + factura_numero : ''}`
                ]
            )
            const pedidoId = pedidoResult.insertId

            for (const it of itemsCalculados) {
                const [prod] = await query<any[]>('SELECT nombre FROM productos WHERE id = ?', [it.producto_id])
                const nombreProd = prod?.nombre || `Producto #${it.producto_id}`
                await query(
                    `INSERT INTO detalle_pedidos (pedido_id, descripcion, cantidad, precio_total) VALUES (?, ?, ?, ?)`,
                    [pedidoId, nombreProd, it.cantidad, it.total]
                )
            }

            // Registrar abono inicial solo para crédito (en contado ya se marca todo pagado)
            if (abonoIni > 0 && tipoPagoNorm !== 'contado') {
                await query(
                    `INSERT INTO abonos_pedidos (pedido_id, monto, metodo_pago, referencia, usuario_id) VALUES (?, ?, ?, ?, ?)`,
                    [pedidoId, abonoIni.toFixed(2), 'efectivo', numero_compra, usuario_id || null]
                )
            }
        } catch (pedidoErr: any) {
            console.error('Aviso: no se pudo crear el pedido asociado:', pedidoErr.message)
        }

        return NextResponse.json({ success: true, id: compra_id, numero_compra }, { status: 201 })
    } catch (error: any) {
        console.error('Error crear compra:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
