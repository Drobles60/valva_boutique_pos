// @ts-nocheck
/**
 * POST /api/compras/[id]/confirmar
 * Confirma la compra:
 *  - Cambia estado a 'confirmada'
 *  - Registra movimiento en movimientos_inventario y kardex por cada ítem
 *  - Actualiza stock_actual y precio_compra en productos
 */
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        // 1. Verificar que esté en borrador
        const [compra] = await query<any[]>(
            `SELECT c.*, p.razon_social AS proveedor_nombre
       FROM compras c
       LEFT JOIN proveedores p ON c.proveedor_id = p.id
       WHERE c.id = ?`, [id]
        )
        if (!compra) return NextResponse.json({ success: false, error: 'Compra no encontrada' }, { status: 404 })
        if (compra.estado !== 'borrador') return NextResponse.json({ success: false, error: `La compra ya está ${compra.estado}` }, { status: 400 })

        // 2. Obtener detalle con precios actuales del producto
        const detalle = await query<any[]>(
            `SELECT cd.*, pr.stock_actual, pr.nombre AS producto_nombre,
              pr.precio_compra AS precio_compra_actual, pr.precio_venta, pr.precio_minimo
       FROM compra_detalle cd
       INNER JOIN productos pr ON cd.producto_id = pr.id
       WHERE cd.compra_id = ?`, [id]
        )
        if (!detalle.length) return NextResponse.json({ success: false, error: 'La compra no tiene productos' }, { status: 400 })

        const motivo = `Compra ${compra.numero_compra || ''} - Fact. ${compra.factura_numero || 'S/N'} - ${compra.proveedor_nombre || ''}`.trim()

        // 3. Por cada ítem: actualizar stock + registrar movimiento en Kardex
        for (const item of detalle) {
            const stockAnterior = Number(item.stock_actual)
            const cantidad = Number(item.cantidad)
            const stockNuevo = stockAnterior + cantidad
            const costoUnit = Number(item.costo_unitario)
            const precioVenta = Number(item.precio_venta) || 0
            const precioMinimo = Number(item.precio_minimo) || 0
            const costoTotal = cantidad * costoUnit

            // Calcular saldos acumulados
            const saldoCantidad = stockNuevo
            const saldoCosto = saldoCantidad * costoUnit

            // Actualizar stock y costo de compra
            await query(
                'UPDATE productos SET stock_actual = ?, precio_compra = ? WHERE id = ?',
                [stockNuevo, costoUnit, item.producto_id]
            )

            // Registrar en movimientos_inventario (compatibilidad)
            await query(
                `INSERT INTO movimientos_inventario
         (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, referencia_id, usuario_id, fecha_movimiento)
         VALUES (?, 'entrada_inicial', ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    item.producto_id,
                    cantidad,
                    stockAnterior,
                    stockNuevo,
                    motivo,
                    compra.id,
                    compra.usuario_id || null
                ]
            )

            // Registrar en kardex (tabla nueva - registro completo)
            await query(
                `INSERT INTO kardex (
          producto_id, tipo_movimiento,
          cantidad, stock_anterior, stock_nuevo,
          precio_compra, precio_venta, precio_minimo, costo_total,
          saldo_cantidad, saldo_costo,
          compra_id, referencia_doc,
          usuario_id, motivo
        ) VALUES (?, 'entrada_compra', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    item.producto_id,
                    cantidad,
                    stockAnterior,
                    stockNuevo,
                    costoUnit,
                    precioVenta,
                    precioMinimo,
                    costoTotal,
                    saldoCantidad,
                    saldoCosto,
                    compra.id,
                    compra.factura_numero || compra.numero_compra || null,
                    compra.usuario_id || null,
                    motivo
                ]
            )
        }

        // 4. Confirmar compra
        await query("UPDATE compras SET estado='confirmada' WHERE id=?", [id])

        // 5. Marcar el pedido asociado como recibido (busca por numero_pedido = numero_compra)
        try {
            const pedidosAsociados = await query<any[]>(
                `SELECT id FROM pedidos WHERE numero_pedido = ? AND estado = 'pendiente' LIMIT 1`,
                [compra.numero_compra]
            )
            if (pedidosAsociados.length > 0) {
                await query(
                    `UPDATE pedidos SET estado = 'recibido', fecha_recibido = NOW() WHERE id = ?`,
                    [pedidosAsociados[0].id]
                )
            }
        } catch (pedErr: any) {
            console.error('Aviso: no se pudo marcar el pedido como recibido:', pedErr.message)
        }

        return NextResponse.json({
            success: true,
            message: `Compra ${compra.numero_compra} confirmada. ${detalle.length} producto(s) actualizados en inventario y Kardex.`
        })
    } catch (error: any) {
        console.error('Error confirmar compra:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
