import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    // Date filter - default to last 30 days
    let dateFilter = "v.fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)"
    const params: any[] = []
    if (fechaInicio && fechaFin) {
      dateFilter = "DATE(v.fecha_venta) BETWEEN ? AND ?"
      params.push(fechaInicio, fechaFin)
    }

    // Sales by category
    const categorias = await query<any[]>(`
      SELECT 
        COALESCE(cp.nombre, 'SIN CATEGORÍA') as categoria,
        COALESCE(cp.id, 0) as categoria_id,
        COUNT(DISTINCT v.id) as ventas,
        SUM(dv.cantidad) as unidades,
        SUM(dv.subtotal) as total_venta,
        SUM(dv.cantidad * p.precio_compra) as total_costo,
        SUM(dv.subtotal - (dv.cantidad * p.precio_compra)) as utilidad,
        COUNT(DISTINCT p.id) as productos_distintos
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      WHERE v.estado != 'anulada' AND ${dateFilter}
      GROUP BY cp.id, cp.nombre
      ORDER BY total_venta DESC
    `, params)

    // Totals
    const totalVentas = categorias.reduce((s, c) => s + Number(c.total_venta), 0)
    const totalUnidades = categorias.reduce((s, c) => s + Number(c.unidades), 0)
    const totalCosto = categorias.reduce((s, c) => s + Number(c.total_costo), 0)
    const totalUtilidad = categorias.reduce((s, c) => s + Number(c.utilidad), 0)

    return NextResponse.json({
      success: true,
      categorias: categorias.map((c: any) => ({
        categoria: c.categoria,
        categoriaId: Number(c.categoria_id),
        ventas: Number(c.ventas),
        unidades: Number(c.unidades),
        totalVenta: Number(c.total_venta),
        totalCosto: Number(c.total_costo),
        utilidad: Number(c.utilidad),
        margen: Number(c.total_venta) > 0
          ? ((Number(c.utilidad) / Number(c.total_venta)) * 100)
          : 0,
        productosDistintos: Number(c.productos_distintos),
        participacion: totalVentas > 0
          ? ((Number(c.total_venta) / totalVentas) * 100)
          : 0,
      })),
      totales: {
        ventas: totalVentas,
        unidades: totalUnidades,
        costo: totalCosto,
        utilidad: totalUtilidad,
        margen: totalVentas > 0 ? ((totalUtilidad / totalVentas) * 100) : 0,
        categorias: categorias.length,
      },
    })
  } catch (error) {
    console.error('Error generando reporte de categorías:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar el reporte: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
