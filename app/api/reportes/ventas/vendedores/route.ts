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

    // Sales per vendor
    const vendedores = await query(
      `SELECT 
        u.id AS usuario_id,
        u.nombre,
        u.apellido,
        u.rol,
        COUNT(v.id) AS transacciones,
        COALESCE(SUM(v.total), 0) AS total_ventas,
        COALESCE(AVG(v.total), 0) AS ticket_promedio,
        COALESCE(SUM(CASE WHEN v.tipo_venta = 'contado' THEN v.total ELSE 0 END), 0) AS ventas_contado,
        COALESCE(SUM(CASE WHEN v.tipo_venta = 'credito' THEN v.total ELSE 0 END), 0) AS ventas_credito,
        COUNT(DISTINCT DATE(v.fecha_venta)) AS dias_activos
      FROM usuarios u
      LEFT JOIN ventas v ON v.usuario_id = u.id 
        AND v.estado != 'anulada'
        AND DATE(v.fecha_venta) BETWEEN ? AND ?
      WHERE u.estado = 'activo'
      GROUP BY u.id, u.nombre, u.apellido, u.rol
      ORDER BY total_ventas DESC`,
      [fechaInicio, fechaFin]
    )

    // Totals
    const [totales] = await query(
      `SELECT 
        COUNT(*) AS total_transacciones,
        COALESCE(SUM(total), 0) AS total_ventas,
        COALESCE(AVG(total), 0) AS ticket_promedio
      FROM ventas 
      WHERE estado != 'anulada' 
        AND DATE(fecha_venta) BETWEEN ? AND ?`,
      [fechaInicio, fechaFin]
    ) as any[]

    // Best day per vendor
    const mejoresDias = await query(
      `SELECT 
        v.usuario_id,
        DATE_FORMAT(v.fecha_venta, '%Y-%m-%d') AS mejor_dia,
        SUM(v.total) AS venta_dia
      FROM ventas v
      WHERE v.estado != 'anulada'
        AND DATE(v.fecha_venta) BETWEEN ? AND ?
      GROUP BY v.usuario_id, DATE_FORMAT(v.fecha_venta, '%Y-%m-%d')
      ORDER BY v.usuario_id, venta_dia DESC`,
      [fechaInicio, fechaFin]
    ) as any[]

    // Get best day per vendor (first row per user from ordered results)
    const mejorDiaPorVendedor: Record<number, { dia: string; venta: number }> = {}
    for (const row of mejoresDias) {
      if (!mejorDiaPorVendedor[row.usuario_id]) {
        mejorDiaPorVendedor[row.usuario_id] = { dia: row.mejor_dia, venta: Number(row.venta_dia) }
      }
    }

    const vendedoresData = (vendedores as any[]).map((v) => ({
      usuario_id: v.usuario_id,
      nombre: v.nombre,
      apellido: v.apellido,
      rol: v.rol,
      transacciones: Number(v.transacciones),
      total_ventas: Number(v.total_ventas),
      ticket_promedio: Number(v.ticket_promedio),
      ventas_contado: Number(v.ventas_contado),
      ventas_credito: Number(v.ventas_credito),
      dias_activos: Number(v.dias_activos),
      mejor_dia: mejorDiaPorVendedor[v.usuario_id]?.dia || null,
      venta_mejor_dia: mejorDiaPorVendedor[v.usuario_id]?.venta || 0,
      participacion: totales.total_ventas > 0
        ? (Number(v.total_ventas) / Number(totales.total_ventas)) * 100
        : 0,
    }))

    return NextResponse.json({
      success: true,
      vendedores: vendedoresData,
      totalVentas: Number(totales.total_ventas),
      totalTransacciones: Number(totales.total_transacciones),
      ticketPromedio: Number(totales.ticket_promedio),
      totalVendedores: vendedoresData.filter((v) => v.transacciones > 0).length,
    })
  } catch (error) {
    console.error("Error en reporte vendedores:", error)
    return NextResponse.json(
      { success: false, error: "Error al generar reporte de vendedores: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
