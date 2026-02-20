import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { ReporteGastos } from '@/types/reportes'

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

    // Gastos por categoría
    const gastosPorCategoria = await query<any[]>(`
      SELECT 
        categoria,
        SUM(monto) as monto,
        COUNT(*) as cantidad
      FROM gastos
      WHERE DATE(fecha) BETWEEN ? AND ?
      GROUP BY categoria
      ORDER BY monto DESC
    `, [fechaInicio, fechaFin])

    const totalGastos = gastosPorCategoria.reduce((sum, g) => sum + Number(g.monto), 0)

    // Gastos por día
    const gastosPorDia = await query<any[]>(`
      SELECT 
        DATE(fecha) as fecha,
        SUM(monto) as monto,
        COUNT(*) as cantidad
      FROM gastos
      WHERE DATE(fecha) BETWEEN ? AND ?
      GROUP BY DATE(fecha)
      ORDER BY fecha
    `, [fechaInicio, fechaFin])

    // Detalle de gastos
    const detalleGastos = await query<any[]>(`
      SELECT 
        g.id,
        g.fecha,
        g.categoria,
        g.descripcion,
        g.monto,
        u.nombre as usuario
      FROM gastos g
      INNER JOIN usuarios u ON g.usuario_id = u.id
      WHERE DATE(g.fecha) BETWEEN ? AND ?
      ORDER BY g.fecha DESC
    `, [fechaInicio, fechaFin])

    const reporte: ReporteGastos = {
      periodo: `${fechaInicio} a ${fechaFin}`,
      totalGastos,
      gastosPorCategoria: gastosPorCategoria.map(g => ({
        categoria: g.categoria,
        monto: Number(g.monto),
        porcentaje: totalGastos > 0 ? (Number(g.monto) / totalGastos) * 100 : 0,
        cantidad: Number(g.cantidad)
      })),
      gastosPorDia: gastosPorDia.map(g => ({
        fecha: g.fecha,
        monto: Number(g.monto),
        cantidad: Number(g.cantidad)
      })),
      detalleGastos: detalleGastos.map(g => ({
        id: g.id,
        fecha: g.fecha,
        categoria: g.categoria,
        descripcion: g.descripcion,
        monto: Number(g.monto),
        usuario: g.usuario
      }))
    }

    return NextResponse.json(reporte)
  } catch (error) {
    console.error('Error generando reporte de gastos:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
