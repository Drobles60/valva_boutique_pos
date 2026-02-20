import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { EstadoResultados } from '@/types/reportes'

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

    // Calcular ingresos por ventas de contado
    const ventasContadoResult = await query<any[]>(`
      SELECT 
        COALESCE(SUM(CASE WHEN v.estado = 'completada' THEN v.total ELSE 0 END), 0) as ventasContado
      FROM ventas v
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    // Calcular ingresos por abonos a crédito
    const abonosResult = await query<any[]>(`
      SELECT 
        COALESCE(SUM(monto), 0) as abonosCredito
      FROM abonos
      WHERE DATE(fecha_abono) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    // Calcular costo de ventas
    const costoVentasResult = await query<any[]>(`
      SELECT 
        COALESCE(SUM(dv.cantidad * p.precio_costo), 0) as costoVentas
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    // Calcular gastos
    const gastosResult = await query<any[]>(`
      SELECT 
        COALESCE(SUM(monto), 0) as gastos
      FROM gastos
      WHERE DATE(fecha) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    const ventasContado = ventasContadoResult[0]?.ventasContado || 0
    const abonosCredito = abonosResult[0]?.abonosCredito || 0
    const costoVentas = costoVentasResult[0]?.costoVentas || 0
    const gastos = gastosResult[0]?.gastos || 0

    const totalIngresos = ventasContado + abonosCredito
    const totalEgresos = costoVentas + gastos
    const utilidadBruta = totalIngresos - costoVentas
    const utilidadNeta = totalIngresos - totalEgresos
    const margenUtilidad = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0

    const estadoResultados: EstadoResultados = {
      periodo: `${fechaInicio} a ${fechaFin}`,
      ingresos: {
        ventasContado,
        abonosCredito,
        total: totalIngresos
      },
      egresos: {
        costoVentas,
        gastos,
        total: totalEgresos
      },
      utilidadBruta,
      utilidadNeta,
      margenUtilidad
    }

    return NextResponse.json(estadoResultados)
  } catch (error) {
    console.error('Error generando estado de resultados:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
