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

    // Ventas anuladas
    const anuladas = await query<any[]>(`
      SELECT 
        v.id, v.numero_venta, v.fecha_venta, v.total, v.metodo_pago,
        c.nombre as cliente, u.nombre as usuario
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND v.estado = 'anulada'
      ORDER BY v.fecha_venta DESC
    `, [fechaInicio, fechaFin])

    // Devoluciones de inventario (entrada_devolucion)
    const devoluciones = await query<any[]>(`
      SELECT 
        mi.id, mi.fecha_movimiento as fecha, p.nombre as producto, p.sku,
        mi.cantidad, mi.motivo, u.nombre as usuario
      FROM movimientos_inventario mi
      INNER JOIN productos p ON mi.producto_id = p.id
      INNER JOIN usuarios u ON mi.usuario_id = u.id
      WHERE mi.tipo_movimiento = 'entrada_devolucion'
        AND DATE(mi.fecha_movimiento) BETWEEN ? AND ?
      ORDER BY mi.fecha_movimiento DESC
    `, [fechaInicio, fechaFin])

    // Totales período
    const totalesPeriodo = await query<any[]>(`
      SELECT COUNT(*) as totalVentas, COALESCE(SUM(total), 0) as montoTotal
      FROM ventas WHERE DATE(fecha_venta) BETWEEN ? AND ? AND estado != 'anulada'
    `, [fechaInicio, fechaFin])

    const montoAnulado = anuladas.reduce((s, v) => s + Number(v.total), 0)
    const totalVentas = Number(totalesPeriodo[0]?.totalVentas || 0)
    const montoVentas = Number(totalesPeriodo[0]?.montoTotal || 0)

    return NextResponse.json({
      success: true,
      totalAnuladas: anuladas.length,
      montoAnulado,
      totalDevoluciones: devoluciones.length,
      unidadesDevueltas: devoluciones.reduce((s, d) => s + Number(d.cantidad), 0),
      totalVentasPeriodo: totalVentas,
      montoVentasPeriodo: montoVentas,
      tasaAnulacion: totalVentas > 0 ? (anuladas.length / (totalVentas + anuladas.length)) * 100 : 0,
      anuladas: anuladas.map(v => ({
        id: v.id,
        numeroVenta: v.numero_venta,
        fecha: v.fecha_venta,
        total: Number(v.total),
        metodoPago: v.metodo_pago,
        cliente: v.cliente || "Público general",
        usuario: v.usuario,
      })),
      devoluciones: devoluciones.map(d => ({
        id: d.id,
        fecha: d.fecha,
        producto: d.producto,
        sku: d.sku,
        cantidad: Number(d.cantidad),
        motivo: d.motivo || "Sin motivo",
        usuario: d.usuario,
      })),
    })
  } catch (error) {
    console.error("Error en reporte de devoluciones:", error)
    return NextResponse.json({ success: false, error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
