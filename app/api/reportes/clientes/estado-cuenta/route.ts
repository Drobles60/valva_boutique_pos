import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get('clienteId')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    if (!clienteId) {
      // Si no hay clienteId, retornar lista de clientes con saldo
      const clientes = await query<any[]>(`
        SELECT c.id, c.nombre, c.telefono, c.email,
          COUNT(DISTINCT cpc.id) as totalCuentas,
          COALESCE(SUM(cpc.monto_total), 0) as totalCredito,
          COALESCE(SUM(cpc.monto_total - cpc.saldo_pendiente), 0) as totalAbonado,
          COALESCE(SUM(cpc.saldo_pendiente), 0) as saldoPendiente
        FROM clientes c
        LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
        GROUP BY c.id, c.nombre, c.telefono, c.email
        HAVING totalCuentas > 0
        ORDER BY saldoPendiente DESC
      `)

      return NextResponse.json({
        success: true,
        clientes: clientes.map(c => ({
          id: c.id,
          nombre: c.nombre,
          telefono: c.telefono,
          email: c.email,
          totalCuentas: Number(c.totalCuentas),
          totalCredito: Number(c.totalCredito),
          totalAbonado: Number(c.totalAbonado),
          saldoPendiente: Number(c.saldoPendiente),
        })),
      })
    }

    // Información del cliente
    const clienteResult = await query<any[]>(`SELECT id, nombre, telefono, email FROM clientes WHERE id = ?`, [clienteId])
    if (clienteResult.length === 0) {
      return NextResponse.json({ success: false, error: 'Cliente no encontrado' }, { status: 404 })
    }
    const cliente = clienteResult[0]

    // Ventas a crédito del cliente
    const params: any[] = [clienteId]
    let fechaWhere = ''
    if (fechaInicio) { fechaWhere += ' AND DATE(v.fecha_venta) >= ?'; params.push(fechaInicio) }
    if (fechaFin) { fechaWhere += ' AND DATE(v.fecha_venta) <= ?'; params.push(fechaFin) }

    const ventas = await query<any[]>(`
      SELECT v.id, v.fecha_venta as fecha, 'cargo' as tipo,
        CONCAT('Venta #', v.numero_venta) as referencia,
        'Venta a crédito' as descripcion, v.total as monto
      FROM ventas v
      WHERE v.cliente_id = ? AND v.tipo_venta = 'credito' ${fechaWhere}
      ORDER BY v.fecha_venta
    `, params)

    // Abonos del cliente
    const params2: any[] = [clienteId]
    let fechaWhere2 = ''
    if (fechaInicio) { fechaWhere2 += ' AND DATE(a.fecha_abono) >= ?'; params2.push(fechaInicio) }
    if (fechaFin) { fechaWhere2 += ' AND DATE(a.fecha_abono) <= ?'; params2.push(fechaFin) }

    const abonos = await query<any[]>(`
      SELECT a.id, a.fecha_abono as fecha, 'abono' as tipo,
        CONCAT('Abono #', a.id) as referencia,
        CONCAT('Pago ', a.metodo_pago) as descripcion, a.monto
      FROM abonos a
      INNER JOIN cuentas_por_cobrar cpc ON a.cuenta_por_cobrar_id = cpc.id
      WHERE cpc.cliente_id = ? ${fechaWhere2}
      ORDER BY a.fecha_abono
    `, params2)

    // Combine + sort
    const todos = [...ventas, ...abonos].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    let saldo = 0
    let totalCargos = 0
    let totalAbonos = 0
    const movimientos = todos.map(m => {
      const monto = Number(m.monto)
      if (m.tipo === 'cargo') { saldo += monto; totalCargos += monto }
      else { saldo -= monto; totalAbonos += monto }
      return { fecha: m.fecha, tipo: m.tipo, referencia: m.referencia, descripcion: m.descripcion, monto, saldo }
    })

    return NextResponse.json({
      success: true,
      cliente: { id: cliente.id, nombre: cliente.nombre, telefono: cliente.telefono, email: cliente.email },
      periodo: fechaInicio && fechaFin ? `${fechaInicio} al ${fechaFin}` : 'Histórico',
      totalCargos,
      totalAbonos,
      saldoFinal: saldo,
      movimientos,
    })
  } catch (error) {
    console.error('Error generando estado de cuenta:', error)
    return NextResponse.json({ success: false, error: 'Error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
