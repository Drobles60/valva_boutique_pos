import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")
    const agrupacion = searchParams.get("agrupacion") || "diario" // diario | semanal | mensual

    if (!fechaInicio || !fechaFin)
      return NextResponse.json({ error: "Fechas requeridas" }, { status: 400 })

    let dateFormat: string
    let dateLabel: string
    if (agrupacion === "mensual") {
      dateFormat = "%Y-%m"
      dateLabel = "DATE_FORMAT(v.fecha_venta, '%Y-%m')"
    } else if (agrupacion === "semanal") {
      dateFormat = "%x-W%v"
      dateLabel = "DATE_FORMAT(v.fecha_venta, '%x-W%v')"
    } else {
      dateFormat = "%Y-%m-%d"
      dateLabel = "DATE(v.fecha_venta)"
    }

    // Ventas agrupadas por período
    const ventasPorPeriodo = await query<any[]>(`
      SELECT 
        ${dateLabel} as periodo,
        COUNT(*) as transacciones,
        COALESCE(SUM(v.total), 0) as totalVentas,
        COALESCE(AVG(v.total), 0) as ticketPromedio,
        COALESCE(SUM(dv.cantidad * p.precio_compra), 0) as totalCosto
      FROM ventas v
      LEFT JOIN detalle_ventas dv ON dv.venta_id = v.id
      LEFT JOIN productos p ON p.id = dv.producto_id
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY periodo
      ORDER BY periodo ASC
    `, [fechaInicio, fechaFin])

    // Top 10 productos más vendidos en el período
    const topProductos = await query<any[]>(`
      SELECT 
        p.nombre, p.sku,
        COALESCE(SUM(dv.cantidad), 0) as cantidadVendida,
        COALESCE(SUM(dv.subtotal), 0) as montoVentas
      FROM detalle_ventas dv
      INNER JOIN productos p ON p.id = dv.producto_id
      INNER JOIN ventas v ON v.id = dv.venta_id
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY p.id, p.nombre, p.sku
      ORDER BY cantidadVendida DESC
      LIMIT 10
    `, [fechaInicio, fechaFin])

    // Ventas por categoría
    const ventasPorCategoria = await query<any[]>(`
      SELECT 
        COALESCE(cp.nombre, 'Sin categoría') as categoria,
        COALESCE(SUM(dv.cantidad), 0) as cantidadVendida,
        COALESCE(SUM(dv.subtotal), 0) as montoVentas
      FROM detalle_ventas dv
      INNER JOIN productos p ON p.id = dv.producto_id
      LEFT JOIN categorias_padre cp ON cp.id = p.categoria_padre_id
      INNER JOIN ventas v ON v.id = dv.venta_id
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY cp.id, cp.nombre
      ORDER BY montoVentas DESC
    `, [fechaInicio, fechaFin])

    // Ventas por método de pago
    const ventasPorMetodo = await query<any[]>(`
      SELECT 
        v.metodo_pago as metodo,
        COUNT(*) as transacciones,
        COALESCE(SUM(v.total), 0) as monto
      FROM ventas v
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY v.metodo_pago
      ORDER BY monto DESC
    `, [fechaInicio, fechaFin])

    // Calcular promedio móvil (3 períodos)
    const datos = ventasPorPeriodo.map((r: any, i: number) => {
      const total = Number(r.totalVentas)
      const prev1 = i >= 1 ? Number(ventasPorPeriodo[i - 1].totalVentas) : total
      const prev2 = i >= 2 ? Number(ventasPorPeriodo[i - 2].totalVentas) : prev1
      const promedioMovil = (total + prev1 + prev2) / Math.min(i + 1, 3)
      return {
        periodo: r.periodo,
        transacciones: Number(r.transacciones),
        totalVentas: total,
        ticketPromedio: Number(r.ticketPromedio),
        totalCosto: Number(r.totalCosto),
        utilidad: total - Number(r.totalCosto),
        promedioMovil: Math.round(promedioMovil * 100) / 100,
      }
    })

    const totalGeneral = datos.reduce((s, d) => s + d.totalVentas, 0)
    const totalTransacciones = datos.reduce((s, d) => s + d.transacciones, 0)
    const totalUtilidad = datos.reduce((s, d) => s + d.utilidad, 0)

    return NextResponse.json({
      success: true,
      periodo: `${fechaInicio} al ${fechaFin}`,
      agrupacion,
      resumen: {
        totalVentas: totalGeneral,
        totalTransacciones,
        ticketPromedio: totalTransacciones > 0 ? totalGeneral / totalTransacciones : 0,
        totalUtilidad,
        margenPromedio: totalGeneral > 0 ? (totalUtilidad / totalGeneral) * 100 : 0,
        periodosAnalizados: datos.length,
      },
      tendencia: datos,
      topProductos: topProductos.map(p => ({
        nombre: p.nombre,
        sku: p.sku,
        cantidadVendida: Number(p.cantidadVendida),
        montoVentas: Number(p.montoVentas),
      })),
      ventasPorCategoria: ventasPorCategoria.map(c => ({
        categoria: c.categoria,
        cantidadVendida: Number(c.cantidadVendida),
        montoVentas: Number(c.montoVentas),
      })),
      ventasPorMetodo: ventasPorMetodo.map(m => ({
        metodo: m.metodo,
        transacciones: Number(m.transacciones),
        monto: Number(m.monto),
      })),
    })
  } catch (error) {
    console.error("Error en tendencias:", error)
    return NextResponse.json({ error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
