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

    // Ventas completadas (contado)
    const [ventasR] = await query<any[]>(`
      SELECT COALESCE(SUM(CASE WHEN estado = 'completada' THEN total ELSE 0 END), 0) as ventasContado,
             COALESCE(SUM(total), 0) as ventasTotales,
             COALESCE(SUM(CASE WHEN tipo_venta = 'credito' THEN total ELSE 0 END), 0) as ventasCredito
      FROM ventas WHERE estado != 'anulada' AND DATE(fecha_venta) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    // Abonos recibidos
    const [abonosR] = await query<any[]>(`
      SELECT COALESCE(SUM(monto), 0) as abonosCredito FROM abonos WHERE DATE(fecha_abono) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    // Costo de ventas
    const [costoR] = await query<any[]>(`
      SELECT COALESCE(SUM(dv.cantidad * p.precio_compra), 0) as costoVentas
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE v.estado != 'anulada' AND DATE(v.fecha_venta) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    // Gastos
    const [gastosR] = await query<any[]>(`
      SELECT COALESCE(SUM(monto), 0) as gastos FROM gastos WHERE DATE(fecha_gasto) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    const ventasTotales = Number(ventasR.ventasTotales || 0)
    const ventasContado = Number(ventasR.ventasContado || 0)
    const ventasCredito = Number(ventasR.ventasCredito || 0)
    const abonosCredito = Number(abonosR.abonosCredito || 0)
    const costoVentas = Number(costoR.costoVentas || 0)
    const gastos = Number(gastosR.gastos || 0)

    const totalIngresos = ventasContado + abonosCredito
    const totalEgresos = costoVentas + gastos
    const utilidadBruta = totalIngresos - costoVentas
    const utilidadNeta = totalIngresos - totalEgresos
    const margenBruto = totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0
    const margenNeto = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0

    return NextResponse.json({
      success: true,
      periodo: `${fechaInicio} a ${fechaFin}`,
      ingresos: { ventasTotales, ventasContado, ventasCredito, abonosCredito, total: totalIngresos },
      egresos: { costoVentas, gastos, total: totalEgresos },
      utilidadBruta,
      utilidadNeta,
      margenBruto,
      margenNeto,
    })
  } catch (error) {
    console.error('Error generando estado de resultados:', error)
    return NextResponse.json({ success: false, error: 'Error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
