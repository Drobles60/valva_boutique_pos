import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json({ success: false, error: "Fechas requeridas" }, { status: 400 })
    }

    // Clients ranked by purchases in the period
    const clientes = await query(
      `SELECT 
        c.id AS cliente_id,
        c.nombre,
        c.identificacion,
        c.tipo_cliente,
        c.telefono,
        c.email,
        c.saldo_pendiente,
        COUNT(v.id) AS total_compras,
        COALESCE(SUM(v.total), 0) AS total_gastado,
        COALESCE(AVG(v.total), 0) AS ticket_promedio,
        COALESCE(MAX(DATE_FORMAT(v.fecha_venta, '%Y-%m-%d')), NULL) AS ultima_compra,
        COALESCE(MIN(DATE_FORMAT(v.fecha_venta, '%Y-%m-%d')), NULL) AS primera_compra,
        COUNT(DISTINCT DATE(v.fecha_venta)) AS dias_con_compras,
        COALESCE(SUM(CASE WHEN v.tipo_venta = 'credito' THEN v.total ELSE 0 END), 0) AS compras_credito,
        COALESCE(SUM(CASE WHEN v.tipo_venta = 'contado' THEN v.total ELSE 0 END), 0) AS compras_contado
      FROM clientes c
      INNER JOIN ventas v ON v.cliente_id = c.id 
        AND v.estado != 'anulada'
        AND DATE(v.fecha_venta) BETWEEN ? AND ?
      WHERE c.estado = 'activo'
      GROUP BY c.id, c.nombre, c.identificacion, c.tipo_cliente, c.telefono, c.email, c.saldo_pendiente
      ORDER BY total_gastado DESC`,
      [fechaInicio, fechaFin]
    ) as any[]

    // General totals
    const [totales] = await query(
      `SELECT 
        COUNT(DISTINCT v.cliente_id) AS clientes_activos,
        COUNT(*) AS total_transacciones,
        COALESCE(SUM(v.total), 0) AS total_ventas,
        COALESCE(AVG(v.total), 0) AS ticket_promedio
      FROM ventas v
      WHERE v.estado != 'anulada'
        AND DATE(v.fecha_venta) BETWEEN ? AND ?
        AND v.cliente_id IS NOT NULL`,
      [fechaInicio, fechaFin]
    ) as any[]

    const totalVentas = Number(totales.total_ventas)

    const clientesData = clientes.map((c: any) => ({
      cliente_id: c.cliente_id,
      nombre: c.nombre,
      identificacion: c.identificacion || "",
      tipo_cliente: c.tipo_cliente,
      telefono: c.telefono || "",
      email: c.email || "",
      saldo_pendiente: Number(c.saldo_pendiente),
      total_compras: Number(c.total_compras),
      total_gastado: Number(c.total_gastado),
      ticket_promedio: Number(c.ticket_promedio),
      ultima_compra: c.ultima_compra,
      primera_compra: c.primera_compra,
      dias_con_compras: Number(c.dias_con_compras),
      compras_credito: Number(c.compras_credito),
      compras_contado: Number(c.compras_contado),
      participacion: totalVentas > 0 ? Math.round((Number(c.total_gastado) / totalVentas) * 100 * 10) / 10 : 0,
    }))

    return NextResponse.json({
      success: true,
      clientes: clientesData,
      totalClientes: clientesData.length,
      totalVentas,
      totalTransacciones: Number(totales.total_transacciones),
      ticketPromedio: Number(totales.ticket_promedio),
      clientesActivos: Number(totales.clientes_activos),
    })
  } catch (error) {
    console.error("Error en reporte clientes frecuentes:", error)
    return NextResponse.json(
      { success: false, error: "Error al generar reporte: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
