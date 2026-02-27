import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mes = searchParams.get("mes") // formato: 2026-02
    if (!mes) {
      return NextResponse.json({ success: false, error: "Mes requerido (formato: YYYY-MM)" }, { status: 400 })
    }

    const [year, month] = mes.split("-")
    const fechaInicio = `${year}-${month}-01`
    const fechaFin = new Date(Number(year), Number(month), 0).toISOString().split("T")[0]

    // Ventas del mes
    const ventasMes = await query<any[]>(`
      SELECT COUNT(*) as transacciones, COALESCE(SUM(total), 0) as totalVentas,
        COALESCE(SUM(CASE WHEN metodo_pago='efectivo' THEN total ELSE 0 END), 0) as efectivo,
        COALESCE(SUM(CASE WHEN metodo_pago='transferencia' THEN total ELSE 0 END), 0) as transferencia,
        COALESCE(SUM(CASE WHEN metodo_pago='mixto' THEN total ELSE 0 END), 0) as mixto,
        COALESCE(SUM(CASE WHEN tipo_venta='credito' THEN total ELSE 0 END), 0) as credito,
        COALESCE(SUM(descuento), 0) as totalDescuentos
      FROM ventas WHERE DATE(fecha_venta) BETWEEN ? AND ? AND estado != 'anulada'
    `, [fechaInicio, fechaFin])

    // Gastos del mes
    const gastosMes = await query<any[]>(`
      SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as cantidad
      FROM gastos WHERE fecha_gasto BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    // Abonos recibidos
    const abonosMes = await query<any[]>(`
      SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as cantidad
      FROM abonos WHERE DATE(fecha_abono) BETWEEN ? AND ?
    `, [fechaInicio, fechaFin])

    // Sesiones de caja
    const sesionesMes = await query<any[]>(`
      SELECT sc.id, sc.fecha_apertura, sc.fecha_cierre, sc.monto_base,
        sc.efectivo_contado, u.nombre as usuario, sc.estado
      FROM sesiones_caja sc
      INNER JOIN usuarios u ON sc.usuario_id = u.id
      WHERE DATE(sc.fecha_apertura) BETWEEN ? AND ?
      ORDER BY sc.fecha_apertura
    `, [fechaInicio, fechaFin])

    // Ventas por día del mes
    const ventasPorDia = await query<any[]>(`
      SELECT DATE(fecha_venta) as fecha, COUNT(*) as transacciones, 
        COALESCE(SUM(total), 0) as total
      FROM ventas WHERE DATE(fecha_venta) BETWEEN ? AND ? AND estado != 'anulada'
      GROUP BY DATE(fecha_venta) ORDER BY fecha
    `, [fechaInicio, fechaFin])

    const vt = ventasMes[0] || {}
    const totalVentas = Number(vt.totalVentas || 0)
    const totalGastos = Number(gastosMes[0]?.total || 0)
    const totalAbonos = Number(abonosMes[0]?.total || 0)

    return NextResponse.json({
      success: true,
      mes,
      periodo: `${fechaInicio} al ${fechaFin}`,
      ventas: {
        total: totalVentas,
        transacciones: Number(vt.transacciones || 0),
        efectivo: Number(vt.efectivo || 0),
        transferencia: Number(vt.transferencia || 0),
        mixto: Number(vt.mixto || 0),
        credito: Number(vt.credito || 0),
        descuentos: Number(vt.totalDescuentos || 0),
      },
      gastos: { total: totalGastos, cantidad: Number(gastosMes[0]?.cantidad || 0) },
      abonos: { total: totalAbonos, cantidad: Number(abonosMes[0]?.cantidad || 0) },
      utilidadBruta: totalVentas - totalGastos,
      flujoNeto: totalVentas + totalAbonos - totalGastos,
      sesiones: sesionesMes.map(s => ({
        id: s.id, fechaApertura: s.fecha_apertura, fechaCierre: s.fecha_cierre,
        montoBase: Number(s.monto_base), efectivoContado: Number(s.efectivo_contado || 0),
        usuario: s.usuario, estado: s.estado,
      })),
      ventasPorDia: ventasPorDia.map(d => ({
        fecha: d.fecha, transacciones: Number(d.transacciones), total: Number(d.total),
      })),
    })
  } catch (error) {
    console.error("Error en corte mensual:", error)
    return NextResponse.json({ success: false, error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
