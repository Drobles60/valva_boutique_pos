import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    // Productos con stock e información de inventario
    const productos = await query<any[]>(`
      SELECT
        p.id, p.sku, p.nombre,
        COALESCE(cp.nombre, 'Sin categoría') as categoria,
        p.stock_actual,
        p.precio_compra,
        p.precio_venta,
        (p.stock_actual * p.precio_compra) as valorCosto,
        (p.stock_actual * p.precio_venta) as valorVenta,
        p.estado,
        (
          SELECT MAX(mi.fecha_movimiento)
          FROM movimientos_inventario mi WHERE mi.producto_id = p.id
        ) as ultimoMovimiento
      FROM productos p
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      WHERE p.estado != 'inactivo'
      ORDER BY p.nombre
    `)

    const totalProductos = productos.length
    const valorCostoTotal = productos.reduce((s, p) => s + Number(p.valorCosto || 0), 0)
    const valorVentaTotal = productos.reduce((s, p) => s + Number(p.valorVenta || 0), 0)
    const stockTotal = productos.reduce((s, p) => s + Number(p.stock_actual || 0), 0)
    const sinStock = productos.filter(p => Number(p.stock_actual) <= 0).length
    const agotados = productos.filter(p => p.estado === 'agotado').length

    // Por categoría
    const categoriaMap = new Map<string, { nombre: string; productos: number; unidades: number; valorCosto: number; valorVenta: number }>()
    productos.forEach(p => {
      const cat = p.categoria
      const existing = categoriaMap.get(cat) || { nombre: cat, productos: 0, unidades: 0, valorCosto: 0, valorVenta: 0 }
      existing.productos++
      existing.unidades += Number(p.stock_actual || 0)
      existing.valorCosto += Number(p.valorCosto || 0)
      existing.valorVenta += Number(p.valorVenta || 0)
      categoriaMap.set(cat, existing)
    })

    return NextResponse.json({
      success: true,
      totalProductos,
      stockTotal,
      sinStock,
      agotados,
      valorCostoTotal,
      valorVentaTotal,
      utilidadPotencial: valorVentaTotal - valorCostoTotal,
      porCategoria: Array.from(categoriaMap.values()).sort((a, b) => b.valorCosto - a.valorCosto),
      productos: productos.map(p => ({
        id: p.id,
        sku: p.sku,
        nombre: p.nombre,
        categoria: p.categoria,
        stockActual: Number(p.stock_actual),
        precioCompra: Number(p.precio_compra),
        precioVenta: Number(p.precio_venta),
        valorCosto: Number(p.valorCosto || 0),
        valorVenta: Number(p.valorVenta || 0),
        estado: p.estado,
        ultimoMovimiento: p.ultimoMovimiento,
      })),
    })
  } catch (error) {
    console.error('Error generando reporte de inventario:', error)
    return NextResponse.json({ success: false, error: 'Error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
