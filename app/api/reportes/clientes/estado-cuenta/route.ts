import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { EstadoCuentaCliente } from '@/types/reportes'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get('clienteId')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    if (!clienteId) {
      return NextResponse.json(
        { error: 'ID de cliente es requerido' },
        { status: 400 }
      )
    }

    // Información del cliente
    const clienteResult = await query<any[]>(`
      SELECT id, nombre, telefono, email
      FROM clientes
      WHERE id = ?
    `, [clienteId])

    if (clienteResult.length === 0) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    const cliente = clienteResult[0]

    // Saldo inicial (antes del período)
    let saldoInicial = 0
    if (fechaInicio) {
      const saldoInicialResult = await query<any[]>(`
        SELECT COALESCE(SUM(
          CASE 
            WHEN v.estado = 'credito' THEN v.total
            ELSE 0
          END
        ), 0) - COALESCE(SUM(a.monto), 0) as saldoInicial
        FROM ventas v
        LEFT JOIN cuentas_por_cobrar cpc ON v.id = cpc.venta_id
        LEFT JOIN abonos a ON cpc.id = a.cuenta_id
        WHERE v.cliente_id = ?
          AND DATE(v.fecha_venta) < ?
      `, [clienteId, fechaInicio])
      saldoInicial = Number(saldoInicialResult[0]?.saldoInicial || 0)
    }

    // Movimientos del período
    const movimientos: any[] = []
    let saldoAcumulado = saldoInicial

    // Obtener ventas a crédito
    const ventas = await query<any[]>(`
      SELECT 
        v.id,
        v.fecha_venta as fecha,
        'venta' as tipo,
        CONCAT('Venta #', v.id) as referencia,
        CONCAT('Productos varios') as descripcion,
        v.total as monto
      FROM ventas v
      WHERE v.cliente_id = ?
        AND v.estado = 'credito'
        ${fechaInicio ? 'AND DATE(v.fecha_venta) >= ?' : ''}
        ${fechaFin ? 'AND DATE(v.fecha_venta) <= ?' : ''}
      ORDER BY v.fecha_venta
    `, [clienteId, fechaInicio, fechaFin].filter(Boolean))

    // Obtener abonos
    const abonos = await query<any[]>(`
      SELECT 
        a.id,
        a.fecha_abono as fecha,
        'abono' as tipo,
        CONCAT('Abono #', a.id) as referencia,
        CONCAT('Pago - ', a.metodo_pago) as descripcion,
        a.monto
      FROM abonos a
      INNER JOIN cuentas_por_cobrar cpc ON a.cuenta_id = cpc.id
      WHERE cpc.cliente_id = ?
        ${fechaInicio ? 'AND DATE(a.fecha_abono) >= ?' : ''}
        ${fechaFin ? 'AND DATE(a.fecha_abono) <= ?' : ''}
      ORDER BY a.fecha_abono
    `, [clienteId, fechaInicio, fechaFin].filter(Boolean))

    // Combinar y ordenar movimientos
    const todosMovimientos = [...ventas, ...abonos].sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )

    let totalCargos = 0
    let totalAbonos = 0

    todosMovimientos.forEach(mov => {
      const cargo = mov.tipo === 'venta' ? Number(mov.monto) : 0
      const abono = mov.tipo === 'abono' ? Number(mov.monto) : 0

      saldoAcumulado += cargo - abono
      totalCargos += cargo
      totalAbonos += abono

      movimientos.push({
        fecha: mov.fecha,
        tipo: mov.tipo,
        referencia: mov.referencia,
        descripcion: mov.descripcion,
        cargo,
        abono,
        saldo: saldoAcumulado
      })
    })

    const estadoCuenta: EstadoCuentaCliente = {
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email
      },
      periodo: fechaInicio && fechaFin ? `${fechaInicio} a ${fechaFin}` : 'Histórico',
      saldoInicial,
      cargos: totalCargos,
      abonos: totalAbonos,
      saldoFinal: saldoAcumulado,
      movimientos
    }

    return NextResponse.json(estadoCuenta)
  } catch (error) {
    console.error('Error generando estado de cuenta:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
