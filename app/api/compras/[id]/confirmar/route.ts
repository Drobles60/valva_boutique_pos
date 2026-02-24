// @ts-nocheck
/**
 * POST /api/compras/[id]/confirmar
 * Confirma la compra:
 *  - Cambia estado a 'confirmada'
 *  - Registra movimiento 'entrada_inicial' en movimientos_inventario por cada ítem
 *  - Actualiza stock_actual y precio_compra en productos
 */
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id

        // 1. Verificar que esté en borrador
        const [compra] = await query<any[]>(
            `SELECT c.*, p.razon_social AS proveedor_nombre
       FROM compras c
       LEFT JOIN proveedores p ON c.proveedor_id = p.id
       WHERE c.id = ?`, [id]
        )
        if (!compra) return NextResponse.json({ success: false, error: 'Compra no encontrada' }, { status: 404 })
        if (compra.estado !== 'borrador') return NextResponse.json({ success: false, error: `La compra ya está ${compra.estado}` }, { status: 400 })

        // 2. Obtener detalle
        const detalle = await query<any[]>(
            `SELECT cd.*, pr.stock_actual, pr.nombre AS producto_nombre
       FROM compra_detalle cd
       INNER JOIN productos pr ON cd.producto_id = pr.id
       WHERE cd.compra_id = ?`, [id]
        )
        if (!detalle.length) return NextResponse.json({ success: false, error: 'La compra no tiene productos' }, { status: 400 })

        // 3. Por cada ítem: actualizar stock + registrar movimiento en Kardex
        for (const item of detalle) {
            const stockAnterior = Number(item.stock_actual)
            const cantidad = Number(item.cantidad)
            const stockNuevo = stockAnterior + cantidad
            const costoUnit = Number(item.costo_unitario)

            // Actualizar stock y costo de compra
            await query(
                'UPDATE productos SET stock_actual = ?, precio_compra = ? WHERE id = ?',
                [stockNuevo, costoUnit, item.producto_id]
            )

            // Registrar en movimientos_inventario
            await query(
                `INSERT INTO movimientos_inventario
         (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
         VALUES (?, 'entrada_inicial', ?, ?, ?, ?, NOW())`,
                [
                    item.producto_id,
                    cantidad,
                    stockAnterior,
                    stockNuevo,
                    `Compra ${compra.numero_compra || ''} - Fact. ${compra.factura_numero || 'S/N'} - ${compra.proveedor_nombre || ''}`.trim()
                ]
            )
        }

        // 4. Confirmar compra
        await query("UPDATE compras SET estado='confirmada' WHERE id=?", [id])

        return NextResponse.json({
            success: true,
            message: `Compra ${compra.numero_compra} confirmada. ${detalle.length} producto(s) actualizados en inventario y Kardex.`
        })
    } catch (error: any) {
        console.error('Error confirmar compra:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
