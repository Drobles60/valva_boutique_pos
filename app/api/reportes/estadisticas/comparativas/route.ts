import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fechaInicio1 = searchParams.get("fechaInicio1")
    const fechaFin1 = searchParams.get("fechaFin1")
    const fechaInicio2 = searchParams.get("fechaInicio2")
    const fechaFin2 = searchParams.get("fechaFin2")

    if (!fechaInicio1 || !fechaFin1 || !fechaInicio2 || !fechaFin2)
      return NextResponse.json({ error: "Se requieren ambos períodos de fechas" }, { status: 400 })

    const getMetricas = async (fi: string, ff: string) => {
      const [resumen] = await query<any[]>(`
        SELECT
          COUNT(*) as transacciones,
          COALESCE(SUM(v.total), 0) as totalVentas,
          COALESCE(AVG(v.total), 0) as ticketPromedio,
          COUNT(DISTINCT v.cliente_id) as clientesUnicos,
          COALESCE(SUM(v.descuento), 0) as descuentosAplicados
        FROM ventas v
        WHERE v.estado != 'anulada'
          AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      `, [fi, ff])

      const [costoResult] = await query<any[]>(`
        SELECT COALESCE(SUM(dv.cantidad * p.precio_compra), 0) as totalCosto
        FROM detalle_ventas dv
        INNER JOIN productos p ON p.id = dv.producto_id
        INNER JOIN ventas v ON v.id = dv.venta_id
        WHERE v.estado != 'anulada'
          AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      `, [fi, ff])

      const ventasDiarias = await query<any[]>(`
        SELECT DATE(v.fecha_venta) as fecha, COUNT(*) as transacciones, COALESCE(SUM(v.total), 0) as total
        FROM ventas v
        WHERE v.estado != 'anulada' AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
        GROUP BY DATE(v.fecha_venta) ORDER BY fecha
      `, [fi, ff])

      const topCategorias = await query<any[]>(`
        SELECT COALESCE(cp.nombre, 'Sin categoría') as categoria,
          COALESCE(SUM(dv.subtotal), 0) as monto
        FROM detalle_ventas dv
        INNER JOIN productos p ON p.id = dv.producto_id
        LEFT JOIN categorias_padre cp ON cp.id = p.categoria_padre_id
        INNER JOIN ventas v ON v.id = dv.venta_id
        WHERE v.estado != 'anulada' AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
        GROUP BY cp.id, cp.nombre ORDER BY monto DESC LIMIT 10
      `, [fi, ff])

      const porMetodo = await query<any[]>(`
        SELECT v.metodo_pago as metodo, COUNT(*) as transacciones, COALESCE(SUM(v.total), 0) as monto
        FROM ventas v
        WHERE v.estado != 'anulada' AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
        GROUP BY v.metodo_pago
      `, [fi, ff])

      const totalVentas = Number(resumen.totalVentas)
      const totalCosto = Number(costoResult.totalCosto)

      return {
        transacciones: Number(resumen.transacciones),
        totalVentas,
        ticketPromedio: Number(resumen.ticketPromedio),
        clientesUnicos: Number(resumen.clientesUnicos),
        descuentosAplicados: Number(resumen.descuentosAplicados),
        totalCosto,
        utilidad: totalVentas - totalCosto,
        margen: totalVentas > 0 ? ((totalVentas - totalCosto) / totalVentas) * 100 : 0,
        ventasDiarias: ventasDiarias.map((d: any) => ({ fecha: d.fecha, transacciones: Number(d.transacciones), total: Number(d.total) })),
        topCategorias: topCategorias.map((c: any) => ({ categoria: c.categoria, monto: Number(c.monto) })),
        porMetodo: porMetodo.map((m: any) => ({ metodo: m.metodo, transacciones: Number(m.transacciones), monto: Number(m.monto) })),
      }
    }

    const periodo1 = await getMetricas(fechaInicio1, fechaFin1)
    const periodo2 = await getMetricas(fechaInicio2, fechaFin2)

    const calcVariacion = (actual: number, anterior: number) => {
      if (anterior === 0) return actual > 0 ? 100 : 0
      return ((actual - anterior) / anterior) * 100
    }

    return NextResponse.json({
      success: true,
      periodo1: { rango: `${fechaInicio1} al ${fechaFin1}`, ...periodo1 },
      periodo2: { rango: `${fechaInicio2} al ${fechaFin2}`, ...periodo2 },
      variaciones: {
        ventas: calcVariacion(periodo1.totalVentas, periodo2.totalVentas),
        transacciones: calcVariacion(periodo1.transacciones, periodo2.transacciones),
        ticketPromedio: calcVariacion(periodo1.ticketPromedio, periodo2.ticketPromedio),
        clientes: calcVariacion(periodo1.clientesUnicos, periodo2.clientesUnicos),
        utilidad: calcVariacion(periodo1.utilidad, periodo2.utilidad),
        margen: periodo1.margen - periodo2.margen,
      }
    })
  } catch (error) {
    console.error("Error en comparativas:", error)
    return NextResponse.json({ error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
