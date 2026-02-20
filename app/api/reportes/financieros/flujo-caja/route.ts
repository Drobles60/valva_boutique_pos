import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { FlujoCaja } from '@/types/reportes'

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

    const movimientos: FlujoCaja[] = []
    let saldoAcumulado = 0

    // Obtener saldo inicial (caja anterior al período)
    const saldoInicialResult = await query<any[]>(`
      SELECT COALESCE(SUM(
        CASE 
          WHEN tipo = 'ingreso' THEN monto
          WHEN tipo = 'egreso' THEN -monto
          ELSE 0
        END
      ), 0) as saldoInicial
      FROM movimientos_caja
      WHERE DATE(fecha) < ?
    `, [fechaInicio])

    saldoAcumulado = saldoInicialResult[0]?.saldoInicial || 0

    // Ingresos por ventas de contado
    const ventas = await query<any[]>(`
      SELECT 
        v.fecha_venta as fecha,
        'Venta de contado' as concepto,
        'ingreso' as tipo,
        'Ventas' as categoria,
        v.total as monto,
        u.nombre as usuario
      FROM ventas v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.estado = 'completada'
        AND DATE(v.fecha_venta) BETWEEN ? AND ?
      ORDER BY v.fecha_venta
    `, [fechaInicio, fechaFin])

    // Ingresos por abonos
    const abonos = await query<any[]>(`
      SELECT 
        a.fecha_abono as fecha,
        CONCAT('Abono de ', c.nombre) as concepto,
        'ingreso' as tipo,
        'Abonos Crédito' as categoria,
        a.monto as monto,
        u.nombre as usuario
      FROM abonos a
      INNER JOIN cuentas_por_cobrar cpc ON a.cuenta_id = cpc.id
      INNER JOIN clientes c ON cpc.cliente_id = c.id
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE DATE(a.fecha_abono) BETWEEN ? AND ?
      ORDER BY a.fecha_abono
    `, [fechaInicio, fechaFin])

    // Egresos por gastos
    const gastos = await query<any[]>(`
      SELECT 
        g.fecha as fecha,
        g.descripcion as concepto,
        'egreso' as tipo,
        g.categoria as categoria,
        g.monto as monto,
        u.nombre as usuario
      FROM gastos g
      INNER JOIN usuarios u ON g.usuario_id = u.id
      WHERE DATE(g.fecha) BETWEEN ? AND ?
      ORDER BY g.fecha
    `, [fechaInicio, fechaFin])

    // Egresos por abonos a proveedores
    const abonosProveedores = await query<any[]>(`
      SELECT 
        ap.fecha_abono as fecha,
        CONCAT('Pago a proveedor - Pedido #', ap.pedido_id) as concepto,
        'egreso' as tipo,
        'Pagos Proveedores' as categoria,
        ap.monto as monto,
        u.nombre as usuario
      FROM abonos_pedidos ap
      INNER JOIN usuarios u ON ap.usuario_id = u.id
      WHERE DATE(ap.fecha_abono) BETWEEN ? AND ?
      ORDER BY ap.fecha_abono
    `, [fechaInicio, fechaFin])

    // Combinar todos los movimientos y ordenar por fecha
    const todosMovimientos = [
      ...ventas,
      ...abonos,
      ...gastos,
      ...abonosProveedores
    ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    // Calcular saldo acumulado para cada movimiento
    todosMovimientos.forEach(mov => {
      if (mov.tipo === 'ingreso') {
        saldoAcumulado += Number(mov.monto)
      } else {
        saldoAcumulado -= Number(mov.monto)
      }

      movimientos.push({
        fecha: mov.fecha,
        concepto: mov.concepto,
        tipo: mov.tipo,
        categoria: mov.categoria,
        monto: Number(mov.monto),
        saldo: saldoAcumulado,
        usuario: mov.usuario
      })
    })

    return NextResponse.json({
      saldoInicial: saldoInicialResult[0]?.saldoInicial || 0,
      movimientos,
      saldoFinal: saldoAcumulado
    })
  } catch (error) {
    console.error('Error generando flujo de caja:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
