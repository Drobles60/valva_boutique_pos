import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json({ success: false, error: "Fechas requeridas" }, { status: 400 })
    }

    // Ventas por método de pago
    const ventasPorMetodo = await query<any[]>(`
      SELECT metodo_pago, COUNT(*) as cantidad, COALESCE(SUM(total), 0) as monto
      FROM ventas
      WHERE DATE(fecha_venta) BETWEEN ? AND ? AND estado != 'anulada'
      GROUP BY metodo_pago
    `, [fechaInicio, fechaFin])

    // Sesiones de caja cerradas en período
    const sesiones = await query<any[]>(`
      SELECT sc.id, sc.fecha_apertura, sc.fecha_cierre, sc.monto_base,
        sc.efectivo_contado, u.nombre as usuario, c.id as caja_id
      FROM sesiones_caja sc
      INNER JOIN usuarios u ON sc.usuario_id = u.id
      INNER JOIN cajas c ON sc.caja_id = c.id
      WHERE DATE(sc.fecha_apertura) BETWEEN ? AND ?
        AND sc.estado = 'cerrada'
      ORDER BY sc.fecha_apertura DESC
    `, [fechaInicio, fechaFin])

    // Movimientos de caja en período
    const movimientos = await query<any[]>(`
      SELECT mc.tipo_movimiento, COALESCE(SUM(mc.monto), 0) as total, COUNT(*) as cantidad
      FROM movimientos_caja mc
      INNER JOIN sesiones_caja sc ON mc.sesion_caja_id = sc.id
      WHERE DATE(mc.fecha_movimiento) BETWEEN ? AND ?
      GROUP BY mc.tipo_movimiento
    `, [fechaInicio, fechaFin])

    // Abonos recibidos en período
    const abonos = await query<any[]>(`
      SELECT COUNT(*) as cantidad, COALESCE(SUM(monto), 0) as total
      FROM abonos
      WHERE DATE(fecha_abono) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    // Gastos en efectivo
    const gastosEfectivo = await query<any[]>(`
      SELECT COUNT(*) as cantidad, COALESCE(SUM(monto), 0) as total
      FROM gastos
      WHERE fecha_gasto BETWEEN ? AND ? AND metodo_pago = 'efectivo'
    `, [fechaInicio, fechaFin])

    const efectivoVentas = Number(ventasPorMetodo.find(v => v.metodo_pago === 'efectivo')?.monto || 0)
    const transferenciaVentas = Number(ventasPorMetodo.find(v => v.metodo_pago === 'transferencia')?.monto || 0)
    const mixtoVentas = Number(ventasPorMetodo.find(v => v.metodo_pago === 'mixto')?.monto || 0)
    const totalVentas = ventasPorMetodo.reduce((s, v) => s + Number(v.monto), 0)
    const totalAbonos = Number(abonos[0]?.total || 0)
    const totalGastosEfectivo = Number(gastosEfectivo[0]?.total || 0)

    // Total efectivo contado en cierres
    const totalEfectivoContado = sesiones.reduce((s, sc) => s + Number(sc.efectivo_contado || 0), 0)
    const totalMontosBase = sesiones.reduce((s, sc) => s + Number(sc.monto_base || 0), 0)

    return NextResponse.json({
      success: true,
      resumen: {
        totalVentas,
        efectivoVentas,
        transferenciaVentas,
        mixtoVentas,
        totalAbonos,
        totalGastosEfectivo,
        totalEfectivoContado,
        totalMontosBase,
        sesionesCerradas: sesiones.length,
      },
      ventasPorMetodo: ventasPorMetodo.map(v => ({
        metodo: v.metodo_pago, cantidad: Number(v.cantidad), monto: Number(v.monto),
      })),
      sesiones: sesiones.map(s => ({
        id: s.id,
        fechaApertura: s.fecha_apertura,
        fechaCierre: s.fecha_cierre,
        montoBase: Number(s.monto_base),
        efectivoContado: Number(s.efectivo_contado || 0),
        usuario: s.usuario,
      })),
      movimientosCaja: movimientos.map(m => ({
        tipo: m.tipo_movimiento, total: Number(m.total), cantidad: Number(m.cantidad),
      })),
    })
  } catch (error) {
    console.error("Error en conciliación de pagos:", error)
    return NextResponse.json({ success: false, error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
