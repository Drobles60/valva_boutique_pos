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

    // Products with sales data in the period (rotation analysis)
    const productos = await query(
      `SELECT 
        p.id AS producto_id,
        p.nombre,
        p.sku,
        p.stock_actual,
        p.precio_compra,
        p.precio_venta,
        COALESCE(cp.nombre, 'Sin categoría') AS categoria,
        COALESCE(vd.unidades_vendidas, 0) AS unidades_vendidas,
        COALESCE(vd.total_ventas, 0) AS total_ventas,
        COALESCE(vd.dias_con_venta, 0) AS dias_con_venta,
        COALESCE(vd.primera_venta, NULL) AS primera_venta,
        COALESCE(vd.ultima_venta, NULL) AS ultima_venta
      FROM productos p
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      LEFT JOIN (
        SELECT 
          dv.producto_id,
          SUM(dv.cantidad) AS unidades_vendidas,
          SUM(dv.subtotal) AS total_ventas,
          COUNT(DISTINCT DATE(v.fecha_venta)) AS dias_con_venta,
          MIN(DATE_FORMAT(v.fecha_venta, '%Y-%m-%d')) AS primera_venta,
          MAX(DATE_FORMAT(v.fecha_venta, '%Y-%m-%d')) AS ultima_venta
        FROM detalle_ventas dv
        INNER JOIN ventas v ON v.id = dv.venta_id AND v.estado != 'anulada'
        WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        GROUP BY dv.producto_id
      ) vd ON vd.producto_id = p.id
      WHERE p.estado = 'activo'
      ORDER BY unidades_vendidas DESC`,
      [fechaInicio, fechaFin]
    ) as any[]

    // Calculate period days
    const dInicio = new Date(fechaInicio)
    const dFin = new Date(fechaFin)
    const diasPeriodo = Math.max(1, Math.ceil((dFin.getTime() - dInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1)

    const productosData = productos.map((p: any) => {
      const unidades = Number(p.unidades_vendidas)
      const stockActual = Number(p.stock_actual)
      const costoUnitario = Number(p.precio_compra)
      const valorInventario = stockActual * costoUnitario

      // Rotation index: units sold / average stock (simplified: current stock)
      // Higher = faster rotation
      const indiceRotacion = stockActual > 0 ? unidades / stockActual : unidades > 0 ? 999 : 0

      // Days of stock remaining at current sale rate
      const ventaDiaria = unidades / diasPeriodo
      const diasStock = ventaDiaria > 0 ? Math.round(stockActual / ventaDiaria) : stockActual > 0 ? 999 : 0

      // Classification
      let clasificacion: string
      if (unidades === 0) clasificacion = "Sin movimiento"
      else if (indiceRotacion >= 3) clasificacion = "Alta rotación"
      else if (indiceRotacion >= 1) clasificacion = "Media rotación"
      else clasificacion = "Baja rotación"

      return {
        producto_id: p.producto_id,
        nombre: p.nombre,
        sku: p.sku || "",
        categoria: p.categoria,
        stock_actual: stockActual,
        precio_compra: costoUnitario,
        precio_venta: Number(p.precio_venta),
        unidades_vendidas: unidades,
        total_ventas: Number(p.total_ventas),
        valor_inventario: valorInventario,
        indice_rotacion: Math.round(indiceRotacion * 100) / 100,
        dias_stock: diasStock,
        venta_diaria: Math.round(ventaDiaria * 100) / 100,
        dias_con_venta: Number(p.dias_con_venta),
        primera_venta: p.primera_venta,
        ultima_venta: p.ultima_venta,
        clasificacion,
      }
    })

    // Summary stats
    const totalProductos = productosData.length
    const conMovimiento = productosData.filter((p: any) => p.unidades_vendidas > 0).length
    const sinMovimiento = totalProductos - conMovimiento
    const valorInventarioTotal = productosData.reduce((s: number, p: any) => s + p.valor_inventario, 0)
    const totalUnidadesVendidas = productosData.reduce((s: number, p: any) => s + p.unidades_vendidas, 0)

    return NextResponse.json({
      success: true,
      productos: productosData,
      diasPeriodo,
      totalProductos,
      conMovimiento,
      sinMovimiento,
      valorInventarioTotal,
      totalUnidadesVendidas,
    })
  } catch (error) {
    console.error("Error en reporte rotación:", error)
    return NextResponse.json(
      { success: false, error: "Error al generar reporte: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
