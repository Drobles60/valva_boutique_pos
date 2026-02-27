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

    // Ventas (ingresos)
    const ventas = await query<any[]>(`
      SELECT v.fecha_venta as fecha, CONCAT('Venta #', v.numero_venta) as concepto, 'ingreso' as tipo,
        CASE v.metodo_pago WHEN 'efectivo' THEN 'Efectivo' WHEN 'transferencia' THEN 'Transferencia' ELSE 'Mixto' END as categoria,
        v.total as monto, u.nombre as usuario
      FROM ventas v INNER JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.estado = 'completada' AND DATE(v.fecha_venta) BETWEEN ? AND ?
      ORDER BY v.fecha_venta
    `, [fechaInicio, fechaFin])

    // Abonos (ingresos)
    const abonos = await query<any[]>(`
      SELECT a.fecha_abono as fecha, CONCAT('Abono de ', c.nombre) as concepto, 'ingreso' as tipo,
        'Abonos Crédito' as categoria, a.monto as monto, u.nombre as usuario
      FROM abonos a
      INNER JOIN cuentas_por_cobrar cpc ON a.cuenta_por_cobrar_id = cpc.id
      INNER JOIN clientes c ON cpc.cliente_id = c.id
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE DATE(a.fecha_abono) BETWEEN ? AND ?
      ORDER BY a.fecha_abono
    `, [fechaInicio, fechaFin])

    // Gastos (egresos)
    const gastos = await query<any[]>(`
      SELECT g.fecha_gasto as fecha, g.descripcion as concepto, 'egreso' as tipo,
        g.categoria as categoria, g.monto as monto, u.nombre as usuario
      FROM gastos g INNER JOIN usuarios u ON g.usuario_id = u.id
      WHERE DATE(g.fecha_gasto) BETWEEN ? AND ?
      ORDER BY g.fecha_gasto
    `, [fechaInicio, fechaFin])

    // Abonos a proveedores (egresos)
    const abonosProv = await query<any[]>(`
      SELECT ap.fecha_abono as fecha, CONCAT('Pago proveedor - Pedido #', ap.pedido_id) as concepto, 'egreso' as tipo,
        'Pagos Proveedores' as categoria, ap.monto as monto, u.nombre as usuario
      FROM abonos_pedidos ap INNER JOIN usuarios u ON ap.usuario_id = u.id
      WHERE DATE(ap.fecha_abono) BETWEEN ? AND ?
      ORDER BY ap.fecha_abono
    `, [fechaInicio, fechaFin])

    // Combine + sort
    const todos = [...ventas, ...abonos, ...gastos, ...abonosProv]
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    let saldo = 0
    const movimientos = todos.map(m => {
      const monto = Number(m.monto)
      saldo += m.tipo === 'ingreso' ? monto : -monto
      return { fecha: m.fecha, concepto: m.concepto, tipo: m.tipo, categoria: m.categoria, monto, saldo, usuario: m.usuario }
    })

    const totalIngresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
    const totalEgresos = movimientos.filter(m => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0)

    return NextResponse.json({
      success: true,
      movimientos,
      totalIngresos,
      totalEgresos,
      saldoFinal: saldo,
    })
  } catch (error) {
    console.error('Error generando flujo de caja:', error)
    return NextResponse.json({ success: false, error: 'Error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
