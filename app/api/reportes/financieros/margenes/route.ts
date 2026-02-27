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

    // Margen por categoría
    const porCategoria = await query<any[]>(`
      SELECT 
        COALESCE(cp.nombre, 'Sin categoría') as categoria,
        COUNT(DISTINCT dv.producto_id) as productos,
        SUM(dv.cantidad) as unidades,
        SUM(dv.subtotal) as ingresos,
        SUM(dv.cantidad * p.precio_compra) as costo,
        SUM(dv.subtotal) - SUM(dv.cantidad * p.precio_compra) as utilidad
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ? AND v.estado != 'anulada'
      GROUP BY cp.id, cp.nombre
      ORDER BY utilidad DESC
    `, [fechaInicio, fechaFin])

    // Top productos por margen
    const topProductos = await query<any[]>(`
      SELECT 
        p.nombre, p.sku,
        COALESCE(cp.nombre, 'Sin categoría') as categoria,
        SUM(dv.cantidad) as unidades,
        SUM(dv.subtotal) as ingresos,
        SUM(dv.cantidad * p.precio_compra) as costo,
        SUM(dv.subtotal) - SUM(dv.cantidad * p.precio_compra) as utilidad
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ? AND v.estado != 'anulada'
      GROUP BY p.id, p.nombre, p.sku, cp.nombre
      HAVING ingresos > 0
      ORDER BY utilidad DESC
      LIMIT 20
    `, [fechaInicio, fechaFin])

    // Peores márgenes
    const peoresProductos = await query<any[]>(`
      SELECT 
        p.nombre, p.sku,
        COALESCE(cp.nombre, 'Sin categoría') as categoria,
        SUM(dv.cantidad) as unidades,
        SUM(dv.subtotal) as ingresos,
        SUM(dv.cantidad * p.precio_compra) as costo,
        SUM(dv.subtotal) - SUM(dv.cantidad * p.precio_compra) as utilidad
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ? AND v.estado != 'anulada'
      GROUP BY p.id, p.nombre, p.sku, cp.nombre
      HAVING ingresos > 0
      ORDER BY utilidad ASC
      LIMIT 10
    `, [fechaInicio, fechaFin])

    const totalIngresos = porCategoria.reduce((s, c) => s + Number(c.ingresos), 0)
    const totalCosto = porCategoria.reduce((s, c) => s + Number(c.costo), 0)
    const totalUtilidad = totalIngresos - totalCosto
    const margenPromedio = totalIngresos > 0 ? (totalUtilidad / totalIngresos) * 100 : 0

    return NextResponse.json({
      success: true,
      totalIngresos,
      totalCosto,
      totalUtilidad,
      margenPromedio,
      porCategoria: porCategoria.map(c => ({
        categoria: c.categoria,
        productos: Number(c.productos),
        unidades: Number(c.unidades),
        ingresos: Number(c.ingresos),
        costo: Number(c.costo),
        utilidad: Number(c.utilidad),
        margen: Number(c.ingresos) > 0 ? (Number(c.utilidad) / Number(c.ingresos)) * 100 : 0,
      })),
      topProductos: topProductos.map(p => ({
        nombre: p.nombre, sku: p.sku, categoria: p.categoria,
        unidades: Number(p.unidades), ingresos: Number(p.ingresos),
        costo: Number(p.costo), utilidad: Number(p.utilidad),
        margen: Number(p.ingresos) > 0 ? (Number(p.utilidad) / Number(p.ingresos)) * 100 : 0,
      })),
      peoresProductos: peoresProductos.map(p => ({
        nombre: p.nombre, sku: p.sku, categoria: p.categoria,
        unidades: Number(p.unidades), ingresos: Number(p.ingresos),
        costo: Number(p.costo), utilidad: Number(p.utilidad),
        margen: Number(p.ingresos) > 0 ? (Number(p.utilidad) / Number(p.ingresos)) * 100 : 0,
      })),
    })
  } catch (error) {
    console.error("Error en análisis de márgenes:", error)
    return NextResponse.json({ success: false, error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
