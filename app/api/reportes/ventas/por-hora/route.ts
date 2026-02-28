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

    // Ventas agrupadas por hora
    const porHora = await query<any[]>(`
      SELECT 
        HOUR(v.fecha_venta) as hora,
        COUNT(*) as transacciones,
        COALESCE(SUM(v.total), 0) as total,
        COALESCE(AVG(v.total), 0) as ticketPromedio
      FROM ventas v
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND v.estado != 'anulada'
      GROUP BY HOUR(v.fecha_venta)
      ORDER BY hora
    `, [fechaInicio, fechaFin])

    // Ventas por día de la semana
    const porDiaSemana = await query<any[]>(`
      SELECT 
        DAYOFWEEK(v.fecha_venta) as diaSemana,
        COUNT(*) as transacciones,
        COALESCE(SUM(v.total), 0) as total
      FROM ventas v
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND v.estado != 'anulada'
      GROUP BY DAYOFWEEK(v.fecha_venta)
      ORDER BY diaSemana
    `, [fechaInicio, fechaFin])

    const diasNombre = ["", "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

    const totalVentas = porHora.reduce((s, h) => s + Number(h.total), 0)
    const totalTransacciones = porHora.reduce((s, h) => s + Number(h.transacciones), 0)
    const horaPico = porHora.length > 0 ? porHora.reduce((max, h) => Number(h.transacciones) > Number(max.transacciones) ? h : max, porHora[0]) : null

    return NextResponse.json({
      success: true,
      totalVentas,
      totalTransacciones,
      horaPico: horaPico ? { hora: Number(horaPico.hora), transacciones: Number(horaPico.transacciones), total: Number(horaPico.total) } : null,
      porHora: porHora.map(h => ({
        hora: Number(h.hora),
        horaLabel: `${String(h.hora).padStart(2, "0")}:00`,
        transacciones: Number(h.transacciones),
        total: Number(h.total),
        ticketPromedio: Number(h.ticketPromedio),
      })),
      porDiaSemana: porDiaSemana.map(d => ({
        dia: Number(d.diaSemana),
        nombre: diasNombre[Number(d.diaSemana)],
        transacciones: Number(d.transacciones),
        total: Number(d.total),
      })),
    })
  } catch (error) {
    console.error("Error en reporte ventas por hora:", error)
    return NextResponse.json({ success: false, error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
