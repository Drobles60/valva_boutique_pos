import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { ReporteInventario } from '@/types/reportes'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoriaId = searchParams.get('categoriaId')
    const mostrarBajoStock = searchParams.get('bajoStock') === 'true'
    const mostrarSinMovimiento = searchParams.get('sinMovimiento') === 'true'

    let whereClause = '1=1'
    const params: any[] = []

    if (categoriaId) {
      whereClause += ' AND p.tipo_prenda_id = ?'
      params.push(categoriaId)
    }

    // Obtener productos con información de inventario
    const productos = await query<any[]>(`
      SELECT 
        p.id,
        p.codigo,
        p.nombre,
        tp.nombre as categoria,
        p.stock,
        p.stock_minimo,
        p.precio_costo,
        p.precio_venta,
        (p.stock * p.precio_costo) as valorInventario,
        (
          SELECT MAX(mi.fecha)
          FROM movimientos_inventario mi
          WHERE mi.producto_id = p.id
        ) as ultimoMovimiento,
        CASE 
          WHEN p.stock <= p.stock_minimo THEN 'bajo_stock'
          WHEN (
            SELECT MAX(mi.fecha)
            FROM movimientos_inventario mi
            WHERE mi.producto_id = p.id
          ) < DATE_SUB(CURDATE(), INTERVAL 90 DAY) THEN 'sin_movimiento'
          ELSE 'normal'
        END as estado
      FROM productos p
      INNER JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      WHERE ${whereClause}
      ${mostrarBajoStock ? 'AND p.stock <= p.stock_minimo' : ''}
      ${mostrarSinMovimiento ? `AND (
        SELECT MAX(mi.fecha)
        FROM movimientos_inventario mi
        WHERE mi.producto_id = p.id
      ) < DATE_SUB(CURDATE(), INTERVAL 90 DAY)` : ''}
      ORDER BY p.nombre
    `, params)

    const totalProductos = productos.length
    const valorInventario = productos.reduce((sum, p) => sum + Number(p.valorInventario), 0)
    const productosBajoStock = productos.filter(p => p.estado === 'bajo_stock').length
    const productosSinMovimiento = productos.filter(p => p.estado === 'sin_movimiento').length

    const reporte: ReporteInventario = {
      fecha: new Date().toISOString(),
      totalProductos,
      valorInventario,
      productosBajoStock,
      productosSinMovimiento,
      detalleProductos: productos.map(p => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria,
        stock: Number(p.stock),
        stockMinimo: Number(p.stock_minimo),
        precioCosto: Number(p.precio_costo),
        precioVenta: Number(p.precio_venta),
        valorInventario: Number(p.valorInventario),
        ultimoMovimiento: p.ultimoMovimiento,
        estado: p.estado
      }))
    }

    return NextResponse.json(reporte)
  } catch (error) {
    console.error('Error generando reporte de inventario:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
