import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    // Current week: Monday to Sunday
    // Previous week: the 7 days before that
    // We compare both

    // Ventas de la semana actual (lunes a hoy)
    const semanaActual = await query<any[]>(`
      SELECT 
        DATE(fecha_venta) as dia,
        COUNT(*) as transacciones,
        COALESCE(SUM(total), 0) as total_ventas,
        COALESCE(SUM(descuento), 0) as total_descuentos
      FROM ventas
      WHERE estado != 'anulada'
        AND YEARWEEK(fecha_venta, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY DATE(fecha_venta)
      ORDER BY dia ASC
    `)

    // Ventas de la semana anterior
    const semanaAnterior = await query<any[]>(`
      SELECT 
        DATE(fecha_venta) as dia,
        COUNT(*) as transacciones,
        COALESCE(SUM(total), 0) as total_ventas,
        COALESCE(SUM(descuento), 0) as total_descuentos
      FROM ventas
      WHERE estado != 'anulada'
        AND YEARWEEK(fecha_venta, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 7 DAY), 1)
      GROUP BY DATE(fecha_venta)
      ORDER BY dia ASC
    `)

    // Totales semana actual
    const totalActual = semanaActual.reduce((acc, d) => ({
      ventas: acc.ventas + Number(d.total_ventas),
      transacciones: acc.transacciones + Number(d.transacciones),
      descuentos: acc.descuentos + Number(d.total_descuentos),
    }), { ventas: 0, transacciones: 0, descuentos: 0 })

    // Totales semana anterior  
    const totalAnterior = semanaAnterior.reduce((acc, d) => ({
      ventas: acc.ventas + Number(d.total_ventas),
      transacciones: acc.transacciones + Number(d.transacciones),
      descuentos: acc.descuentos + Number(d.total_descuentos),
    }), { ventas: 0, transacciones: 0, descuentos: 0 })

    // Top productos semana actual
    const topProductos = await query<any[]>(`
      SELECT 
        p.nombre,
        SUM(dv.cantidad) as unidades,
        SUM(dv.subtotal) as total_venta
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.producto_id = p.id
      INNER JOIN ventas v ON dv.venta_id = v.id
      WHERE v.estado != 'anulada'
        AND YEARWEEK(v.fecha_venta, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY p.id, p.nombre
      ORDER BY unidades DESC
      LIMIT 10
    `)

    // Ventas por método de pago semana actual
    const metodosPago = await query<any[]>(`
      SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE estado != 'anulada'
        AND YEARWEEK(fecha_venta, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY metodo_pago
      ORDER BY total DESC
    `)

    // Ventas por tipo (contado/credito)
    const tiposVenta = await query<any[]>(`
      SELECT 
        tipo_venta,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE estado != 'anulada'
        AND YEARWEEK(fecha_venta, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY tipo_venta
      ORDER BY total DESC
    `)

    const ticketPromedioActual = totalActual.transacciones > 0 ? totalActual.ventas / totalActual.transacciones : 0
    const ticketPromedioAnterior = totalAnterior.transacciones > 0 ? totalAnterior.ventas / totalAnterior.transacciones : 0

    const calcCambio = (actual: number, anterior: number) => {
      if (anterior === 0) return actual > 0 ? 100 : 0
      return ((actual - anterior) / anterior) * 100
    }

    // Format daily data
    const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const ventasPorDia = semanaActual.map((d: any) => {
      const fecha = new Date(d.dia)
      return {
        dia: diasNombres[fecha.getDay()],
        fecha: d.dia,
        ventas: Number(d.total_ventas),
        transacciones: Number(d.transacciones),
      }
    })

    return NextResponse.json({
      success: true,
      resumen: {
        semanaActual: {
          ventas: totalActual.ventas,
          transacciones: totalActual.transacciones,
          ticketPromedio: ticketPromedioActual,
          descuentos: totalActual.descuentos,
        },
        semanaAnterior: {
          ventas: totalAnterior.ventas,
          transacciones: totalAnterior.transacciones,
          ticketPromedio: ticketPromedioAnterior,
          descuentos: totalAnterior.descuentos,
        },
        cambios: {
          ventas: calcCambio(totalActual.ventas, totalAnterior.ventas),
          transacciones: calcCambio(totalActual.transacciones, totalAnterior.transacciones),
          ticketPromedio: calcCambio(ticketPromedioActual, ticketPromedioAnterior),
        },
      },
      ventasPorDia,
      topProductos: topProductos.map((p: any) => ({
        nombre: p.nombre,
        unidades: Number(p.unidades),
        totalVenta: Number(p.total_venta),
      })),
      metodosPago: metodosPago.map((m: any) => ({
        metodo: m.metodo_pago,
        cantidad: Number(m.cantidad),
        total: Number(m.total),
      })),
      tiposVenta: tiposVenta.map((t: any) => ({
        tipo: t.tipo_venta,
        cantidad: Number(t.cantidad),
        total: Number(t.total),
      })),
    })
  } catch (error) {
    console.error('Error generando resumen semanal:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar el resumen: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
