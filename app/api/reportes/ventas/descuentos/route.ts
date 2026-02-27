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

    // Ventas con descuento
    const ventasConDescuento = await query<any[]>(`
      SELECT 
        v.id, v.numero_venta, v.fecha_venta, v.subtotal, v.descuento, v.total,
        d.nombre as descuento_nombre, d.tipo as descuento_tipo, d.valor as descuento_valor,
        c.nombre as cliente
      FROM ventas v
      LEFT JOIN descuentos d ON v.descuento_id = d.id
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND v.estado != 'anulada'
        AND v.descuento > 0
      ORDER BY v.fecha_venta DESC
    `, [fechaInicio, fechaFin])

    // Resumen por descuento
    const porDescuento = await query<any[]>(`
      SELECT 
        COALESCE(d.nombre, 'Descuento manual') as nombre,
        d.tipo, d.valor,
        COUNT(*) as vecesAplicado,
        COALESCE(SUM(v.descuento), 0) as montoTotal,
        COALESCE(SUM(v.total), 0) as ventasTotal
      FROM ventas v
      LEFT JOIN descuentos d ON v.descuento_id = d.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND v.estado != 'anulada'
        AND v.descuento > 0
      GROUP BY d.id, d.nombre, d.tipo, d.valor
      ORDER BY montoTotal DESC
    `, [fechaInicio, fechaFin])

    // Totales
    const totalVentasPeriodo = await query<any[]>(`
      SELECT COUNT(*) as total, COALESCE(SUM(v.total), 0) as montoTotal
      FROM ventas v
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ? AND v.estado != 'anulada'
    `, [fechaInicio, fechaFin])

    const totalDescuentoMonto = ventasConDescuento.reduce((s, v) => s + Number(v.descuento), 0)
    const totalVentasConDesc = ventasConDescuento.length
    const totalVentasTodas = Number(totalVentasPeriodo[0]?.total || 0)

    return NextResponse.json({
      success: true,
      totalDescuentoMonto,
      totalVentasConDescuento: totalVentasConDesc,
      totalVentasPeriodo: totalVentasTodas,
      porcentajeVentasConDescuento: totalVentasTodas > 0 ? (totalVentasConDesc / totalVentasTodas) * 100 : 0,
      porDescuento: porDescuento.map(d => ({
        nombre: d.nombre,
        tipo: d.tipo,
        valor: Number(d.valor),
        vecesAplicado: Number(d.vecesAplicado),
        montoTotal: Number(d.montoTotal),
        ventasTotal: Number(d.ventasTotal),
      })),
      detalle: ventasConDescuento.map(v => ({
        id: v.id,
        numeroVenta: v.numero_venta,
        fecha: v.fecha_venta,
        cliente: v.cliente || "Público general",
        subtotal: Number(v.subtotal),
        descuento: Number(v.descuento),
        total: Number(v.total),
        descuentoNombre: v.descuento_nombre || "Manual",
        descuentoTipo: v.descuento_tipo,
        descuentoValor: Number(v.descuento_valor || 0),
      })),
    })
  } catch (error) {
    console.error("Error en reporte de descuentos:", error)
    return NextResponse.json({ success: false, error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
