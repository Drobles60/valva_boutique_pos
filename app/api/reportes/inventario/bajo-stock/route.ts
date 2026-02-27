import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const umbral = parseInt(searchParams.get("umbral") || "5")

    // Products with stock at or below threshold
    const productos = await query(
      `SELECT 
        p.id AS producto_id,
        p.nombre,
        p.sku,
        p.stock_actual,
        p.precio_compra,
        p.precio_venta,
        COALESCE(cp.nombre, 'Sin categoría') AS categoria,
        p.updated_at AS ultima_actualizacion
      FROM productos p
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      WHERE p.estado = 'activo' AND p.stock_actual <= ?
      ORDER BY p.stock_actual ASC, p.nombre ASC`,
      [umbral]
    ) as any[]

    // Last sale date per product
    const ultimasVentas = await query(
      `SELECT 
        dv.producto_id,
        MAX(DATE_FORMAT(v.fecha_venta, '%Y-%m-%d')) AS ultima_venta,
        SUM(dv.cantidad) AS vendidos_total
      FROM detalle_ventas dv
      INNER JOIN ventas v ON v.id = dv.venta_id AND v.estado != 'anulada'
      GROUP BY dv.producto_id`
    ) as any[]

    const ventasMap: Record<number, { ultima_venta: string; vendidos_total: number }> = {}
    for (const r of ultimasVentas) {
      ventasMap[r.producto_id] = {
        ultima_venta: r.ultima_venta,
        vendidos_total: Number(r.vendidos_total),
      }
    }

    const productosData = productos.map((p: any) => {
      const stock = Number(p.stock_actual)
      let nivel: string
      if (stock === 0) nivel = "Agotado"
      else if (stock <= 2) nivel = "Crítico"
      else nivel = "Bajo"

      return {
        producto_id: p.producto_id,
        nombre: p.nombre,
        sku: p.sku || "",
        categoria: p.categoria,
        stock_actual: stock,
        precio_compra: Number(p.precio_compra),
        precio_venta: Number(p.precio_venta),
        valor_reposicion: stock > 0 ? 0 : Number(p.precio_compra) * 5, // estimated 5 units restock
        ultima_venta: ventasMap[p.producto_id]?.ultima_venta || null,
        vendidos_total: ventasMap[p.producto_id]?.vendidos_total || 0,
        nivel,
      }
    })

    const agotados = productosData.filter((p: any) => p.stock_actual === 0).length
    const criticos = productosData.filter((p: any) => p.nivel === "Crítico").length
    const bajos = productosData.filter((p: any) => p.nivel === "Bajo").length

    // Total active products for percentage
    const [totalRow] = await query(
      `SELECT COUNT(*) AS total FROM productos WHERE estado = 'activo'`
    ) as any[]
    const totalActivos = Number(totalRow.total)

    return NextResponse.json({
      success: true,
      productos: productosData,
      totalAlerta: productosData.length,
      agotados,
      criticos,
      bajos,
      totalActivos,
      porcentajeAfectado: totalActivos > 0 ? Math.round((productosData.length / totalActivos) * 100 * 10) / 10 : 0,
      umbral,
    })
  } catch (error) {
    console.error("Error en reporte bajo stock:", error)
    return NextResponse.json(
      { success: false, error: "Error al generar reporte: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
