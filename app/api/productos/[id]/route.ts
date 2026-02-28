import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// GET - Obtener un producto específico
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const producto = await queryOne<any>(
            `SELECT p.*, cp.nombre as categoria_nombre, tp.nombre as tipo_prenda_nombre, 
              t.valor as talla_valor, prov.razon_social as proveedor_nombre
       FROM productos p
       LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
       LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
       LEFT JOIN tallas t ON p.talla_id = t.id
       LEFT JOIN proveedores prov ON p.proveedor_id = prov.id
       WHERE p.id = ?`,
            [id]
        );

        if (!producto) {
            return NextResponse.json(
                { success: false, error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: producto });
    } catch (error: any) {
        console.error('Error al obtener producto:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener producto', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar producto
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Validar id
        if (!id || id === 'undefined' || id === 'null' || isNaN(Number(id))) {
            return NextResponse.json(
                { success: false, error: 'ID de producto inválido' },
                { status: 400 }
            );
        }

        // 1. Verificar si el producto tiene movimientos de inventario, ventas, compras o descuentos asociados
        const dependencias = await queryOne<any>(
            `SELECT 
        (SELECT COUNT(*) FROM detalle_ventas WHERE producto_id = ?) as ventas,
        (SELECT COUNT(*) FROM movimientos_inventario WHERE producto_id = ?) as movimientos,
        (SELECT COUNT(*) FROM compra_detalle WHERE producto_id = ?) as compras,
        (SELECT COUNT(*) FROM descuento_productos WHERE producto_id = ?) as descuentos`,
            [id, id, id, id]
        );

        if (dependencias.ventas > 0 || dependencias.movimientos > 0 || dependencias.compras > 0 || dependencias.descuentos > 0) {
            // Si tiene dependencias, no eliminar físicamente para mantener integridad, 
            // sugerir inactivar o devolver error.
            return NextResponse.json(
                {
                    success: false,
                    error: 'No se puede eliminar el producto porque tiene historial (ventas, compras o movimientos).',
                    details: 'Se recomienda cambiar el estado del producto a "Inactivo" en lugar de eliminarlo.',
                    canInactivate: true
                },
                { status: 400 }
            );
        }

        // 2. Si no tiene dependencias, proceder con la eliminación física
        const result = await query('DELETE FROM productos WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    } catch (error: any) {
        console.error('Error al eliminar producto:', error);
        return NextResponse.json(
            { success: false, error: 'Error al eliminar producto', details: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}

// PUT - Actualizar producto
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();

        const {
            codigo_barras,
            sku,
            nombre,
            descripcion,
            categoria_padre_id,
            tipo_prenda_id,
            talla_id,
            proveedor_id,
            color,
            precio_compra,
            precio_venta,
            precio_minimo,
            stock_actual,
            estado
        } = body;

        // Validaciones básicas
        if (!nombre || !sku || !categoria_padre_id || !tipo_prenda_id || !proveedor_id) {
            return NextResponse.json(
                { success: false, error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        await query(`
            UPDATE productos SET
                codigo_barras = ?,
                sku = ?,
                nombre = ?,
                descripcion = ?,
                categoria_padre_id = ?,
                tipo_prenda_id = ?,
                talla_id = ?,
                proveedor_id = ?,
                color = ?,
                precio_compra = ?,
                precio_venta = ?,
                precio_minimo = ?,
                stock_actual = ?,
                estado = ?
            WHERE id = ?
        `, [
            codigo_barras,
            sku,
            nombre.toUpperCase(),
            descripcion || null,
            categoria_padre_id,
            tipo_prenda_id,
            talla_id || null,
            proveedor_id,
            color || null,
            precio_compra || 0,
            precio_venta || 0,
            precio_minimo || precio_venta || 0,
            stock_actual || 0,
            estado || 'activo',
            id
        ]);

        return NextResponse.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: body
        });
    } catch (error: any) {
        console.error('Error al actualizar producto:', error);
        return NextResponse.json(
            { success: false, error: 'Error al actualizar producto', details: error.message },
            { status: 500 }
        );
    }
}
