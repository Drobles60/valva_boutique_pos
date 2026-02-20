import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { ReporteDiario } from '@/types/reportes'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha')
    const sesionId = searchParams.get('sesionId')

    if (!fecha && !sesionId) {
      return NextResponse.json(
        { error: 'Se requiere fecha o ID de sesión' },
        { status: 400 }
      )
    }

    // Obtener información de la sesión de caja
    let sesion
    if (sesionId) {
      const sesionResult = await query<any[]>(`
        SELECT 
          sc.*,
          u.nombre as usuario
        FROM sesiones_caja sc
        INNER JOIN usuarios u ON sc.usuario_id = u.id
        WHERE sc.id = ?
      `, [sesionId])
      sesion = sesionResult[0]
    } else {
      const sesionResult = await query<any[]>(`
        SELECT 
          sc.*,
          u.nombre as usuario
        FROM sesiones_caja sc
        INNER JOIN usuarios u ON sc.usuario_id = u.id
        WHERE DATE(sc.fecha_apertura) = ?
        ORDER BY sc.fecha_apertura DESC
        LIMIT 1
      `, [fecha])
      sesion = sesionResult[0]
    }

    if (!sesion) {
      return NextResponse.json(
        { error: 'No se encontró sesión de caja para esta fecha' },
        { status: 404 }
      )
    }

    const fechaInicio = sesion.fecha_apertura
    const fechaFin = sesion.fecha_cierre || new Date().toISOString()

    // Ventas en efectivo
    const ventasEfectivoResult = await query<any[]>(`
      SELECT COALESCE(SUM(v.total), 0) as total
      FROM ventas v
      WHERE v.fecha_venta BETWEEN ? AND ?
        AND v.estado = 'completada'
        AND v.metodo_pago = 'efectivo'
    `, [fechaInicio, fechaFin])

    // Ventas con tarjeta
    const ventasTarjetaResult = await query<any[]>(`
      SELECT COALESCE(SUM(v.total), 0) as total
      FROM ventas v
      WHERE v.fecha_venta BETWEEN ? AND ?
        AND v.estado = 'completada'
        AND v.metodo_pago = 'tarjeta'
    `, [fechaInicio, fechaFin])

    // Ventas con transferencia
    const ventasTransferenciaResult = await query<any[]>(`
      SELECT COALESCE(SUM(v.total), 0) as total
      FROM ventas v
      WHERE v.fecha_venta BETWEEN ? AND ?
        AND v.estado = 'completada'
        AND v.metodo_pago = 'transferencia'
    `, [fechaInicio, fechaFin])

    // Abonos en efectivo
    const abonosEfectivoResult = await query<any[]>(`
      SELECT COALESCE(SUM(a.monto), 0) as total
      FROM abonos a
      WHERE a.fecha_abono BETWEEN ? AND ?
        AND a.metodo_pago = 'efectivo'
    `, [fechaInicio, fechaFin])

    // Abonos con tarjeta
    const abonosTarjetaResult = await query<any[]>(`
      SELECT COALESCE(SUM(a.monto), 0) as total
      FROM abonos a
      WHERE a.fecha_abono BETWEEN ? AND ?
        AND a.metodo_pago = 'tarjeta'
    `, [fechaInicio, fechaFin])

    // Abonos con transferencia
    const abonosTransferenciaResult = await query<any[]>(`
      SELECT COALESCE(SUM(a.monto), 0) as total
      FROM abonos a
      WHERE a.fecha_abono BETWEEN ? AND ?
        AND a.metodo_pago = 'transferencia'
    `, [fechaInicio, fechaFin])

    // Gastos
    const gastosResult = await query<any[]>(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM gastos
      WHERE fecha BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    // Contar transacciones
    const transaccionesResult = await query<any[]>(`
      SELECT COUNT(*) as total
      FROM ventas
      WHERE fecha_venta BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    const ventasEfectivo = Number(ventasEfectivoResult[0]?.total || 0)
    const ventasTarjeta = Number(ventasTarjetaResult[0]?.total || 0)
    const ventasTransferencia = Number(ventasTransferenciaResult[0]?.total || 0)
    const abonosEfectivo = Number(abonosEfectivoResult[0]?.total || 0)
    const abonosTarjeta = Number(abonosTarjetaResult[0]?.total || 0)
    const abonosTransferencia = Number(abonosTransferenciaResult[0]?.total || 0)
    const gastos = Number(gastosResult[0]?.total || 0)

    const totalIngresos = ventasEfectivo + ventasTarjeta + ventasTransferencia + 
                          abonosEfectivo + abonosTarjeta + abonosTransferencia
    const totalEgresos = gastos
    const efectivoEsperado = Number(sesion.monto_base || 0) + ventasEfectivo + abonosEfectivo - gastos
    const efectivoContado = Number(sesion.efectivo_contado || 0)
    const diferencia = efectivoContado - efectivoEsperado

    const reporte: ReporteDiario = {
      fecha: sesion.fecha_apertura,
      aperturaBase: Number(sesion.monto_base || 0),
      ingresos: {
        ventasEfectivo,
        ventasTarjeta,
        ventasTransferencia,
        abonosEfectivo,
        abonosTarjeta,
        abonosTransferencia,
        total: totalIngresos
      },
      egresos: {
        gastos,
        retiros: 0,
        total: totalEgresos
      },
      efectivoEsperado,
      efectivoContado,
      diferencia,
      transacciones: Number(transaccionesResult[0]?.total || 0),
      usuario: sesion.usuario
    }

    return NextResponse.json(reporte)
  } catch (error) {
    console.error('Error generando reporte diario:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
