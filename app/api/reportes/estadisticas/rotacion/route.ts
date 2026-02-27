import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")
    const categoriaId = searchParams.get("categoriaId")

    if (!fechaInicio || !fechaFin)
      return NextResponse.json({ error: "Fechas requeridas" }, { status: 400 })

    const catFilter = categoriaId && categoriaId !== "todas" ? "AND p.categoria_padre_id = ?" : ""
    const params = categoriaId && categoriaId !== "todas"
      ? [fechaInicio, fechaFin, categoriaId] : [fechaInicio, fechaFin]

    // Productos con ventas en el período (rotación activa)
    const productosVendidos = await query<any[]>(`
      SELECT 
        p.id, p.nombre, p.sku, p.stock_actual, p.precio_compra, p.precio_venta,
        COALESCE(cp.nombre, 'Sin categoría') as categoria,
        COALESCE(SUM(dv.cantidad), 0) as cantidadVendida,
        COALESCE(SUM(dv.subtotal), 0) as montoVentas,
        COALESCE(SUM(dv.cantidad * p.precio_compra), 0) as costoVentas
      FROM productos p
      LEFT JOIN categorias_padre cp ON cp.id = p.categoria_padre_id
      LEFT JOIN detalle_ventas dv ON dv.producto_id = p.id
      LEFT JOIN ventas v ON v.id = dv.venta_id 
        AND v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      WHERE p.estado = 'activo' ${catFilter}
      GROUP BY p.id, p.nombre, p.sku, p.stock_actual, p.precio_compra, p.precio_venta, cp.nombre
      ORDER BY cantidadVendida DESC
    `, params)

    // Rotación por categoría
    const rotacionCategoria = await query<any[]>(`
      SELECT 
        COALESCE(cp.nombre, 'Sin categoría') as categoria,
        COUNT(DISTINCT p.id) as totalProductos,
        COALESCE(SUM(dv.cantidad), 0) as cantidadVendida,
        COALESCE(SUM(dv.subtotal), 0) as montoVentas,
        COALESCE(SUM(p.stock_actual), 0) as stockTotal
      FROM productos p
      LEFT JOIN categorias_padre cp ON cp.id = p.categoria_padre_id
      LEFT JOIN detalle_ventas dv ON dv.producto_id = p.id
      LEFT JOIN ventas v ON v.id = dv.venta_id
        AND v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      WHERE p.estado = 'activo' ${catFilter}
      GROUP BY cp.id, cp.nombre
      ORDER BY montoVentas DESC
    `, params)

    // Lista de categorías para el filtro
    const categorias = await query<any[]>(`
      SELECT id, nombre FROM categorias_padre WHERE estado = 'activo' ORDER BY nombre
    `)

    // Procesamiento
    const conVentas = productosVendidos.filter((p: any) => Number(p.cantidadVendida) > 0)
    const sinVentas = productosVendidos.filter((p: any) => Number(p.cantidadVendida) === 0)

    // Clasificar rotación
    const clasificar = (prod: any) => {
      const vendido = Number(prod.cantidadVendida)
      const stock = Number(prod.stock_actual)
      if (vendido === 0) return "sin-movimiento"
      const ratio = stock > 0 ? vendido / stock : vendido
      if (ratio >= 2) return "alta"
      if (ratio >= 0.5) return "media"
      return "baja"
    }

    const productos = productosVendidos.map((p: any) => ({
      id: p.id, nombre: p.nombre, sku: p.sku,
      stockActual: Number(p.stock_actual),
      precioCompra: Number(p.precio_compra),
      precioVenta: Number(p.precio_venta),
      categoria: p.categoria,
      cantidadVendida: Number(p.cantidadVendida),
      montoVentas: Number(p.montoVentas),
      costoVentas: Number(p.costoVentas),
      rotacion: clasificar(p),
      ratioRotacion: Number(p.stock_actual) > 0 ? Number(p.cantidadVendida) / Number(p.stock_actual) : Number(p.cantidadVendida),
    }))

    const totalProductos = productos.length
    const altaRotacion = productos.filter(p => p.rotacion === "alta").length
    const mediaRotacion = productos.filter(p => p.rotacion === "media").length
    const bajaRotacion = productos.filter(p => p.rotacion === "baja").length
    const sinMovimiento = productos.filter(p => p.rotacion === "sin-movimiento").length
    const valorStockParado = sinVentas.reduce((s, p) => s + Number(p.stock_actual) * Number(p.precio_compra), 0)

    return NextResponse.json({
      success: true,
      periodo: `${fechaInicio} al ${fechaFin}`,
      resumen: {
        totalProductos, altaRotacion, mediaRotacion, bajaRotacion, sinMovimiento, valorStockParado,
        totalVendido: conVentas.reduce((s, p) => s + Number(p.cantidadVendida), 0),
        montoTotalVentas: conVentas.reduce((s, p) => s + Number(p.montoVentas), 0),
      },
      productos,
      rotacionCategoria: rotacionCategoria.map(c => ({
        categoria: c.categoria,
        totalProductos: Number(c.totalProductos),
        cantidadVendida: Number(c.cantidadVendida),
        montoVentas: Number(c.montoVentas),
        stockTotal: Number(c.stockTotal),
      })),
      categorias: categorias.map((c: any) => ({ id: c.id, nombre: c.nombre })),
    })
  } catch (error) {
    console.error("Error en rotación inventario:", error)
    return NextResponse.json({ error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
