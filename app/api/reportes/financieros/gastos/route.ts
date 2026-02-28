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

    // Gastos por categoría
    const gastosPorCategoria = await query<any[]>(`
      SELECT categoria, SUM(monto) as monto, COUNT(*) as cantidad
      FROM gastos WHERE DATE(fecha_gasto) BETWEEN ? AND ?
      GROUP BY categoria ORDER BY monto DESC
    `, [fechaInicio, fechaFin])

    const totalGastos = gastosPorCategoria.reduce((s, g) => s + Number(g.monto), 0)

    // Gastos por día
    const gastosPorDia = await query<any[]>(`
      SELECT DATE(fecha_gasto) as fecha, SUM(monto) as monto, COUNT(*) as cantidad
      FROM gastos WHERE DATE(fecha_gasto) BETWEEN ? AND ?
      GROUP BY DATE(fecha_gasto) ORDER BY fecha
    `, [fechaInicio, fechaFin])

    // Detalle
    const detalleGastos = await query<any[]>(`
      SELECT g.id, g.fecha_gasto as fecha, g.categoria, g.descripcion, g.monto, u.nombre as usuario
      FROM gastos g INNER JOIN usuarios u ON g.usuario_id = u.id
      WHERE DATE(g.fecha_gasto) BETWEEN ? AND ?
      ORDER BY g.fecha_gasto DESC
    `, [fechaInicio, fechaFin])

    return NextResponse.json({
      success: true,
      totalGastos,
      gastosPorCategoria: gastosPorCategoria.map(g => ({
        categoria: g.categoria,
        monto: Number(g.monto),
        porcentaje: totalGastos > 0 ? (Number(g.monto) / totalGastos) * 100 : 0,
        cantidad: Number(g.cantidad),
      })),
      gastosPorDia: gastosPorDia.map(g => ({
        fecha: g.fecha,
        monto: Number(g.monto),
        cantidad: Number(g.cantidad),
      })),
      detalleGastos: detalleGastos.map(g => ({
        id: g.id,
        fecha: g.fecha,
        categoria: g.categoria,
        descripcion: g.descripcion,
        monto: Number(g.monto),
        usuario: g.usuario,
      })),
    })
  } catch (error) {
    console.error('Error generando reporte de gastos:', error)
    return NextResponse.json({ success: false, error: 'Error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
