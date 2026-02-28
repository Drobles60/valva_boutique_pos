import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]

    // Ventas del día por método de pago
    const ventasEfectivo = await query<any[]>(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as n FROM ventas
      WHERE DATE(fecha_venta) = ? AND estado != 'anulada' AND metodo_pago = 'efectivo'
    `, [fecha])

    const ventasTransferencia = await query<any[]>(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as n FROM ventas
      WHERE DATE(fecha_venta) = ? AND estado != 'anulada' AND metodo_pago = 'transferencia'
    `, [fecha])

    const ventasMixto = await query<any[]>(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as n FROM ventas
      WHERE DATE(fecha_venta) = ? AND estado != 'anulada' AND metodo_pago = 'mixto'
    `, [fecha])

    // Ventas a crédito
    const ventasCredito = await query<any[]>(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as n FROM ventas
      WHERE DATE(fecha_venta) = ? AND estado != 'anulada' AND tipo_venta = 'credito'
    `, [fecha])

    // Abonos del día
    const abonosEfectivo = await query<any[]>(`
      SELECT COALESCE(SUM(monto), 0) as total FROM abonos
      WHERE DATE(fecha_abono) = ? AND metodo_pago = 'efectivo'
    `, [fecha])

    const abonosTransferencia = await query<any[]>(`
      SELECT COALESCE(SUM(monto), 0) as total FROM abonos
      WHERE DATE(fecha_abono) = ? AND metodo_pago = 'transferencia'
    `, [fecha])

    // Gastos del día
    const gastosR = await query<any[]>(`
      SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as n FROM gastos WHERE DATE(fecha_gasto) = ?
    `, [fecha])

    // Detalle de gastos
    const detalleGastos = await query<any[]>(`
      SELECT descripcion, categoria, monto FROM gastos WHERE DATE(fecha_gasto) = ? ORDER BY id
    `, [fecha])

    // Total transacciones
    const transR = await query<any[]>(`
      SELECT COUNT(*) as total FROM ventas WHERE DATE(fecha_venta) = ? AND estado != 'anulada'
    `, [fecha])

    // Detalle de ventas del día
    const detalleVentas = await query<any[]>(`
      SELECT v.numero_venta, v.total, v.metodo_pago, v.tipo_venta,
        COALESCE(c.nombre, 'Público general') as cliente, u.nombre as vendedor
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      INNER JOIN usuarios u ON v.usuario_id = u.id
      WHERE DATE(v.fecha_venta) = ? AND v.estado != 'anulada'
      ORDER BY v.fecha_venta DESC
    `, [fecha])

    // Sesión de caja (si aplica)
    const sesiones = await query<any[]>(`
      SELECT sc.*, u.nombre as usuario FROM sesiones_caja sc
      INNER JOIN usuarios u ON sc.usuario_id = u.id
      WHERE DATE(sc.fecha_apertura) = ? ORDER BY sc.fecha_apertura DESC LIMIT 1
    `, [fecha])

    const ef = Number(ventasEfectivo[0]?.total || 0)
    const tr = Number(ventasTransferencia[0]?.total || 0)
    const mx = Number(ventasMixto[0]?.total || 0)
    const abEf = Number(abonosEfectivo[0]?.total || 0)
    const abTr = Number(abonosTransferencia[0]?.total || 0)
    const gs = Number(gastosR[0]?.total || 0)

    const totalIngresos = ef + tr + mx + abEf + abTr
    const sesion = sesiones[0] || null
    const montoBase = sesion ? Number(sesion.monto_base || 0) : 0
    const efectivoEsperado = montoBase + ef + abEf - gs
    const efectivoContado = sesion ? Number(sesion.efectivo_contado || 0) : 0

    return NextResponse.json({
      success: true,
      fecha,
      sesion: sesion ? {
        usuario: sesion.usuario,
        apertura: sesion.fecha_apertura,
        cierre: sesion.fecha_cierre,
        estado: sesion.estado,
        montoBase,
        efectivoContado,
      } : null,
      ingresos: {
        ventasEfectivo: ef,
        ventasTransferencia: tr,
        ventasMixto: mx,
        ventasCredito: Number(ventasCredito[0]?.total || 0),
        abonosEfectivo: abEf,
        abonosTransferencia: abTr,
        total: totalIngresos,
      },
      egresos: { gastos: gs, detalleGastos: detalleGastos.map(g => ({ descripcion: g.descripcion, categoria: g.categoria, monto: Number(g.monto) })) },
      transacciones: Number(transR[0]?.total || 0),
      efectivoEsperado,
      efectivoContado,
      diferencia: efectivoContado > 0 ? efectivoContado - efectivoEsperado : 0,
      detalleVentas: detalleVentas.map(v => ({
        numero: v.numero_venta,
        total: Number(v.total),
        metodoPago: v.metodo_pago,
        tipoVenta: v.tipo_venta,
        cliente: v.cliente,
        vendedor: v.vendedor,
      })),
    })
  } catch (error) {
    console.error('Error generando reporte diario:', error)
    return NextResponse.json({ success: false, error: 'Error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
