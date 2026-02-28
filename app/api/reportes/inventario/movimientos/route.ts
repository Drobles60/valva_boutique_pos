import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const tipo = searchParams.get('tipo')

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json({ success: false, error: 'Fechas requeridas' }, { status: 400 })
    }

    let whereClause = 'DATE(mi.fecha_movimiento) BETWEEN ? AND ?'
    const params: any[] = [fechaInicio, fechaFin]

    if (tipo) {
      whereClause += ' AND mi.tipo_movimiento = ?'
      params.push(tipo)
    }

    // Movimientos
    const movimientos = await query<any[]>(`
      SELECT mi.id, mi.fecha_movimiento as fecha, p.sku, p.nombre as producto,
        mi.tipo_movimiento as tipo, mi.cantidad, mi.stock_anterior, mi.stock_nuevo,
        mi.motivo, u.nombre as usuario
      FROM movimientos_inventario mi
      INNER JOIN productos p ON mi.producto_id = p.id
      INNER JOIN usuarios u ON mi.usuario_id = u.id
      WHERE ${whereClause}
      ORDER BY mi.fecha_movimiento DESC
    `, params)

    // Por tipo
    const porTipo = await query<any[]>(`
      SELECT mi.tipo_movimiento as tipo, COUNT(*) as cantidad, SUM(mi.cantidad) as unidades
      FROM movimientos_inventario mi
      WHERE ${whereClause}
      GROUP BY mi.tipo_movimiento
    `, params)

    const totalMovimientos = movimientos.length

    return NextResponse.json({
      success: true,
      totalMovimientos,
      porTipo: porTipo.map(t => ({
        tipo: t.tipo,
        cantidad: Number(t.cantidad),
        unidades: Number(t.unidades),
        porcentaje: totalMovimientos > 0 ? (Number(t.cantidad) / totalMovimientos) * 100 : 0,
      })),
      movimientos: movimientos.map(m => ({
        id: m.id,
        fecha: m.fecha,
        sku: m.sku,
        producto: m.producto,
        tipo: m.tipo,
        cantidad: Number(m.cantidad),
        stockAnterior: Number(m.stock_anterior),
        stockNuevo: Number(m.stock_nuevo),
        motivo: m.motivo,
        usuario: m.usuario,
      })),
    })
  } catch (error) {
    console.error('Error generando reporte de movimientos:', error)
    return NextResponse.json({ success: false, error: 'Error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
