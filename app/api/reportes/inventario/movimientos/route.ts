import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { ReporteMovimientos } from '@/types/reportes'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const productoId = searchParams.get('productoId')
    const tipo = searchParams.get('tipo')

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: 'Fechas de inicio y fin son requeridas' },
        { status: 400 }
      )
    }

    let whereClause = 'DATE(mi.fecha) BETWEEN ? AND ?'
    const params: any[] = [fechaInicio, fechaFin]

    if (productoId) {
      whereClause += ' AND mi.producto_id = ?'
      params.push(productoId)
    }

    if (tipo) {
      whereClause += ' AND mi.tipo = ?'
      params.push(tipo)
    }

    // Obtener movimientos
    const movimientos = await query<any[]>(`
      SELECT 
        mi.id,
        mi.fecha,
        p.codigo,
        p.nombre as producto,
        mi.tipo,
        mi.cantidad,
        mi.referencia,
        u.nombre as usuario
      FROM movimientos_inventario mi
      INNER JOIN productos p ON mi.producto_id = p.id
      INNER JOIN usuarios u ON mi.usuario_id = u.id
      WHERE ${whereClause}
      ORDER BY mi.fecha DESC
    `, params)

    // Movimientos por tipo
    const movimientosPorTipo = await query<any[]>(`
      SELECT 
        tipo,
        COUNT(*) as cantidad
      FROM movimientos_inventario mi
      WHERE ${whereClause}
      GROUP BY tipo
    `, params)

    const totalMovimientos = movimientos.length
    const porcentajes = movimientosPorTipo.map(m => ({
      tipo: m.tipo,
      cantidad: Number(m.cantidad),
      porcentaje: totalMovimientos > 0 ? (Number(m.cantidad) / totalMovimientos) * 100 : 0
    }))

    const reporte: ReporteMovimientos = {
      periodo: `${fechaInicio} a ${fechaFin}`,
      totalMovimientos,
      movimientosPorTipo: porcentajes,
      detalleMovimientos: movimientos.map(m => ({
        id: m.id,
        fecha: m.fecha,
        producto: `${m.codigo} - ${m.producto}`,
        tipo: m.tipo,
        cantidad: Number(m.cantidad),
        referencia: m.referencia,
        usuario: m.usuario
      }))
    }

    return NextResponse.json(reporte)
  } catch (error) {
    console.error('Error generando reporte de movimientos:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
