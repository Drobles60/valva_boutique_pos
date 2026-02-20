import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { ReporteVentas } from '@/types/reportes'

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

    // Total de ventas
    const ventasResult = await query<any[]>(`
      SELECT 
        COUNT(*) as transacciones,
        COALESCE(SUM(total), 0) as totalVentas,
        COALESCE(SUM(CASE WHEN estado = 'completada' THEN total ELSE 0 END), 0) as ventasContado,
        COALESCE(SUM(CASE WHEN estado = 'credito' THEN total ELSE 0 END), 0) as ventasCredito
      FROM ventas
      WHERE DATE(fecha_venta) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    const totalTransacciones = Number(ventasResult[0]?.transacciones || 0)
    const totalVentas = Number(ventasResult[0]?.totalVentas || 0)
    const ticketPromedio = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0

    // Ventas por día
    const ventasPorDia = await query<any[]>(`
      SELECT 
        DATE(fecha_venta) as fecha,
        COUNT(*) as transacciones,
        SUM(total) as ventas
      FROM ventas
      WHERE DATE(fecha_venta) BETWEEN ? AND ?
      GROUP BY DATE(fecha_venta)
      ORDER BY fecha
    `, [fechaInicio, fechaFin])

    // Ventas por forma de pago
    const ventasPorFormaPago = await query<any[]>(`
      SELECT 
        metodo_pago as formaPago,
        COUNT(*) as transacciones,
        SUM(total) as monto
      FROM ventas
      WHERE DATE(fecha_venta) BETWEEN ? AND ?
        AND estado = 'completada'
      GROUP BY metodo_pago
    `, [fechaInicio, fechaFin])

    // Top productos vendidos
    const topProductos = await query<any[]>(`
      SELECT 
        p.id as producto_id,
        CONCAT(p.codigo, ' - ', p.nombre) as nombre,
        SUM(dv.cantidad) as cantidad,
        SUM(dv.cantidad * dv.precio_unitario) as ventas
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      GROUP BY p.id, p.codigo, p.nombre
      ORDER BY cantidad DESC
      LIMIT 10
    `, [fechaInicio, fechaFin])

    const reporte: ReporteVentas = {
      periodo: `${fechaInicio} a ${fechaFin}`,
      totalVentas,
      totalTransacciones,
      ticketPromedio,
      ventasContado: Number(ventasResult[0]?.ventasContado || 0),
      ventasCredito: Number(ventasResult[0]?.ventasCredito || 0),
      ventasPorDia: ventasPorDia.map(v => ({
        fecha: v.fecha,
        ventas: Number(v.ventas),
        transacciones: Number(v.transacciones)
      })),
      ventasPorFormaPago: ventasPorFormaPago.map(v => ({
        formaPago: v.formaPago,
        monto: Number(v.monto),
        transacciones: Number(v.transacciones),
        porcentaje: totalVentas > 0 ? (Number(v.monto) / totalVentas) * 100 : 0
      })),
      topProductos: topProductos.map(p => ({
        producto_id: p.producto_id,
        nombre: p.nombre,
        cantidad: Number(p.cantidad),
        ventas: Number(p.ventas)
      }))
    }

    return NextResponse.json(reporte)
  } catch (error) {
    console.error('Error generando reporte de ventas:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
