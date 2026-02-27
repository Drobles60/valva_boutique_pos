import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

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

    // Total de ventas (excluir anuladas)
    const ventasResult = await query<any[]>(`
      SELECT 
        COUNT(*) as transacciones,
        COALESCE(SUM(total), 0) as totalVentas,
        COALESCE(SUM(CASE WHEN estado = 'completada' THEN total ELSE 0 END), 0) as ventasContado,
        COALESCE(SUM(CASE WHEN estado = 'credito' THEN total ELSE 0 END), 0) as ventasCredito
      FROM ventas
      WHERE DATE(fecha_venta) BETWEEN ? AND ?
        AND estado != 'anulada'
    `, [fechaInicio, fechaFin])

    const totalTransacciones = Number(ventasResult[0]?.transacciones || 0)
    const totalVentas = Number(ventasResult[0]?.totalVentas || 0)
    const ventasContado = Number(ventasResult[0]?.ventasContado || 0)
    const ventasCredito = Number(ventasResult[0]?.ventasCredito || 0)
    const ticketPromedio = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0

    // Utilidad bruta (ventas - costos)
    const utilidadResult = await query<any[]>(`
      SELECT 
        COALESCE(SUM(dv.cantidad * dv.precio_unitario), 0) as totalVentaItems,
        COALESCE(SUM(dv.cantidad * p.precio_compra), 0) as totalCosto
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND v.estado != 'anulada'
    `, [fechaInicio, fechaFin])

    const totalCosto = Number(utilidadResult[0]?.totalCosto || 0)
    const utilidadBruta = totalVentas - totalCosto
    const margenUtilidad = totalVentas > 0 ? (utilidadBruta / totalVentas) * 100 : 0

    // Ventas por día
    const ventasPorDia = await query<any[]>(`
      SELECT 
        DATE_FORMAT(fecha_venta, '%Y-%m-%d') as fecha,
        COUNT(*) as transacciones,
        COALESCE(SUM(total), 0) as ventas
      FROM ventas
      WHERE DATE(fecha_venta) BETWEEN ? AND ?
        AND estado != 'anulada'
      GROUP BY DATE_FORMAT(fecha_venta, '%Y-%m-%d')
      ORDER BY fecha
    `, [fechaInicio, fechaFin])

    // Ventas por forma de pago
    const ventasPorFormaPago = await query<any[]>(`
      SELECT 
        metodo_pago as formaPago,
        COUNT(*) as transacciones,
        COALESCE(SUM(total), 0) as monto
      FROM ventas
      WHERE DATE(fecha_venta) BETWEEN ? AND ?
        AND estado != 'anulada'
      GROUP BY metodo_pago
    `, [fechaInicio, fechaFin])

    // Top productos vendidos (con costo y utilidad)
    const topProductos = await query<any[]>(`
      SELECT 
        p.id as producto_id,
        p.nombre,
        p.sku,
        SUM(dv.cantidad) as cantidad,
        SUM(dv.cantidad * dv.precio_unitario) as ventas,
        SUM(dv.cantidad * p.precio_compra) as costo,
        SUM(dv.cantidad * dv.precio_unitario) - SUM(dv.cantidad * p.precio_compra) as utilidad
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND v.estado != 'anulada'
      GROUP BY p.id, p.nombre, p.sku
      ORDER BY ventas DESC
      LIMIT 10
    `, [fechaInicio, fechaFin])

    // Top productos más rentables
    const topRentables = await query<any[]>(`
      SELECT 
        p.id as producto_id,
        p.nombre,
        p.sku,
        SUM(dv.cantidad) as cantidad,
        SUM(dv.cantidad * dv.precio_unitario) as ventas,
        SUM(dv.cantidad * p.precio_compra) as costo,
        SUM(dv.cantidad * dv.precio_unitario) - SUM(dv.cantidad * p.precio_compra) as utilidad
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND v.estado != 'anulada'
      GROUP BY p.id, p.nombre, p.sku
      ORDER BY utilidad DESC
      LIMIT 10
    `, [fechaInicio, fechaFin])

    return NextResponse.json({
      success: true,
      periodo: `${fechaInicio} a ${fechaFin}`,
      totalVentas,
      totalTransacciones,
      ticketPromedio,
      ventasContado,
      ventasCredito,
      utilidadBruta,
      totalCosto,
      margenUtilidad,
      ventasPorDia: ventasPorDia.map(v => ({
        fecha: v.fecha,
        ventas: Number(v.ventas),
        transacciones: Number(v.transacciones)
      })),
      ventasPorFormaPago: ventasPorFormaPago.map(v => ({
        formaPago: v.formaPago || 'efectivo',
        monto: Number(v.monto),
        transacciones: Number(v.transacciones),
        porcentaje: totalVentas > 0 ? (Number(v.monto) / totalVentas) * 100 : 0
      })),
      topProductos: topProductos.map(p => ({
        producto_id: p.producto_id,
        nombre: p.nombre,
        sku: p.sku,
        cantidad: Number(p.cantidad),
        ventas: Number(p.ventas),
        costo: Number(p.costo),
        utilidad: Number(p.utilidad),
        margen: Number(p.ventas) > 0 ? (Number(p.utilidad) / Number(p.ventas)) * 100 : 0
      })),
      topRentables: topRentables.map(p => ({
        producto_id: p.producto_id,
        nombre: p.nombre,
        sku: p.sku,
        cantidad: Number(p.cantidad),
        ventas: Number(p.ventas),
        costo: Number(p.costo),
        utilidad: Number(p.utilidad),
        margen: Number(p.ventas) > 0 ? (Number(p.utilidad) / Number(p.ventas)) * 100 : 0
      }))
    })
  } catch (error) {
    console.error('Error generando reporte de ventas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
