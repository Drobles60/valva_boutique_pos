import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { ReporteGanancias } from '@/types/reportes'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: 'Fechas de inicio y fin son requeridas' },
        { status: 400 }
      )
    }

    // Calcular ganancias por producto
    const ventasPorProducto = await query<any[]>(`
      SELECT 
        p.id as producto_id,
        p.nombre,
        p.codigo,
        tp.nombre as categoria,
        SUM(dv.cantidad) as cantidad,
        SUM(dv.cantidad * dv.precio_unitario) as ventas,
        SUM(dv.cantidad * p.precio_costo) as costo,
        SUM(dv.cantidad * (dv.precio_unitario - p.precio_costo)) as utilidad,
        CASE 
          WHEN SUM(dv.cantidad * dv.precio_unitario) > 0 
          THEN (SUM(dv.cantidad * (dv.precio_unitario - p.precio_costo)) / SUM(dv.cantidad * dv.precio_unitario)) * 100
          ELSE 0 
        END as margen
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      INNER JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      GROUP BY p.id, p.nombre, p.codigo, tp.nombre
      ORDER BY utilidad DESC
    `, [fechaInicio, fechaFin])

    // Calcular totales
    const totalVentas = ventasPorProducto.reduce((sum, p) => sum + Number(p.ventas), 0)
    const totalCostos = ventasPorProducto.reduce((sum, p) => sum + Number(p.costo), 0)
    const utilidadBruta = totalVentas - totalCostos

    // Obtener gastos del período
    const gastosResult = await query<any[]>(`
      SELECT COALESCE(SUM(monto), 0) as gastos
      FROM gastos
      WHERE DATE(fecha) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    const gastos = gastosResult[0]?.gastos || 0
    const utilidadNeta = utilidadBruta - gastos
    const margenBruto = totalVentas > 0 ? (utilidadBruta / totalVentas) * 100 : 0
    const margenNeto = totalVentas > 0 ? (utilidadNeta / totalVentas) * 100 : 0

    const reporte: ReporteGanancias = {
      periodo: `${fechaInicio} a ${fechaFin}`,
      totalVentas,
      totalCostos,
      utilidadBruta,
      gastos,
      utilidadNeta,
      margenBruto,
      margenNeto,
      ventasPorProducto: ventasPorProducto.map(p => ({
        producto_id: p.producto_id,
        nombre: `${p.codigo} - ${p.nombre}`,
        cantidad: Number(p.cantidad),
        ventas: Number(p.ventas),
        costo: Number(p.costo),
        utilidad: Number(p.utilidad),
        margen: Number(p.margen)
      }))
    }

    return NextResponse.json(reporte)
  } catch (error) {
    console.error('Error generando reporte de ganancias:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
