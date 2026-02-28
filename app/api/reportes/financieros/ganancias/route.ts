import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json({ success: false, error: 'Fechas requeridas' }, { status: 400 })
    }

    // Ganancias por producto
    const productos = await query<any[]>(`
      SELECT p.id as producto_id, p.nombre, p.sku,
        COALESCE(cp.nombre, 'Sin categoría') as categoria,
        SUM(dv.cantidad) as cantidad,
        SUM(dv.subtotal) as ventas,
        SUM(dv.cantidad * p.precio_compra) as costo,
        SUM(dv.subtotal - (dv.cantidad * p.precio_compra)) as utilidad,
        CASE WHEN SUM(dv.subtotal) > 0 
          THEN (SUM(dv.subtotal - (dv.cantidad * p.precio_compra)) / SUM(dv.subtotal)) * 100 ELSE 0 END as margen
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      WHERE v.estado != 'anulada' AND DATE(v.fecha_venta) BETWEEN ? AND ?
      GROUP BY p.id, p.nombre, p.sku, cp.nombre
      ORDER BY utilidad DESC
    `, [fechaInicio, fechaFin])

    const totalVentas = productos.reduce((s: number, p: any) => s + Number(p.ventas), 0)
    const totalCostos = productos.reduce((s: number, p: any) => s + Number(p.costo), 0)
    const utilidadBruta = totalVentas - totalCostos

    // Gastos del período
    const [gastosR] = await query<any[]>(`
      SELECT COALESCE(SUM(monto), 0) as gastos FROM gastos WHERE DATE(fecha_gasto) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    const gastos = Number(gastosR.gastos || 0)
    const utilidadNeta = utilidadBruta - gastos
    const margenBruto = totalVentas > 0 ? (utilidadBruta / totalVentas) * 100 : 0
    const margenNeto = totalVentas > 0 ? (utilidadNeta / totalVentas) * 100 : 0

    return NextResponse.json({
      success: true,
      totalVentas,
      totalCostos,
      utilidadBruta,
      gastos,
      utilidadNeta,
      margenBruto,
      margenNeto,
      productos: productos.map((p: any) => ({
        producto_id: Number(p.producto_id),
        nombre: p.nombre,
        sku: p.sku,
        categoria: p.categoria,
        cantidad: Number(p.cantidad),
        ventas: Number(p.ventas),
        costo: Number(p.costo),
        utilidad: Number(p.utilidad),
        margen: Number(p.margen),
      })),
    })
  } catch (error) {
    console.error('Error generando reporte de ganancias:', error)
    return NextResponse.json({ success: false, error: 'Error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
