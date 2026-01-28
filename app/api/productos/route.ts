import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getDescuentosForProduct, calcularPrecioConDescuento } from '@/lib/descuentos'

// GET: Obtener todos los productos con descuentos aplicados
export async function GET() {
  try {
    console.log('[API PRODUCTOS] Iniciando obtención de productos con descuentos')
    
    const productos = await query<any[]>(`
      SELECT 
        p.id,
        p.codigo_barras,
        p.sku,
        p.nombre,
        p.descripcion,
        p.color,
        p.precio_venta,
        p.precio_compra,
        p.precio_minimo,
        p.stock_actual,
        p.estado,
        p.categoria_padre_id,
        p.tipo_prenda_id,
        p.talla_id,
        p.proveedor_id,
        cp.nombre as categoria_nombre,
        tp.nombre as tipo_prenda_nombre,
        t.valor as talla_valor,
        prov.razon_social as proveedor_nombre
      FROM productos p
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      LEFT JOIN proveedores prov ON p.proveedor_id = prov.id
      ORDER BY p.created_at DESC
    `)

    console.log(`[API PRODUCTOS] Productos obtenidos: ${productos.length}`)

    // Para cada producto, aplicar descuentos activos
    const productosConDescuentos = await Promise.all(
      productos.map(async (producto) => {
        const descuentos = await getDescuentosForProduct(producto.id)
        const { precioFinal, descuentoAplicado, montoDescuento } = calcularPrecioConDescuento(
          producto.precio_venta,
          descuentos
        )

        const productoConDescuento = {
          ...producto,
          precio_original: producto.precio_venta,
          precio_final: precioFinal,
          tiene_descuento: descuentoAplicado !== null,
          descuento_aplicado: descuentoAplicado,
          monto_descuento: montoDescuento,
          // Mantener precio_venta como el precio final para compatibilidad
          precio_venta: precioFinal
        }

        if (descuentoAplicado) {
          console.log(`[API PRODUCTOS] ✓ Producto "${producto.nombre}" con descuento: $${producto.precio_venta} → $${precioFinal}`)
        }

        return productoConDescuento
      })
    )

    const productosConDescuentoCount = productosConDescuentos.filter(p => p.tiene_descuento).length
    console.log(`[API PRODUCTOS] Total productos con descuento: ${productosConDescuentoCount}/${productos.length}`)

    return NextResponse.json({ success: true, data: productosConDescuentos })
  } catch (error: any) {
    console.error('[API PRODUCTOS] Error obteniendo productos:', error)
    console.error('[API PRODUCTOS] Stack:', error.stack)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener productos',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo producto
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Creando producto:', body)
    
    const {
      codigo_barras,
      sku,
      nombre,
      descripcion,
      categoria_padre_id,
      tipo_prenda_id,
      talla_id,
      proveedor_id,
      color,
      precio_compra,
      precio_venta,
      precio_minimo,
      stock_actual,
      estado
    } = body

    // Validaciones
    if (!nombre || !sku || !categoria_padre_id || !tipo_prenda_id || !proveedor_id) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const result = await query<any>(`
      INSERT INTO productos (
        codigo_barras,
        sku,
        nombre,
        descripcion,
        categoria_padre_id,
        tipo_prenda_id,
        talla_id,
        proveedor_id,
        color,
        precio_compra,
        precio_venta,
        precio_minimo,
        stock_actual,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo_barras,
      sku,
      nombre,
      descripcion || null,
      categoria_padre_id,
      tipo_prenda_id,
      talla_id || null,
      proveedor_id,
      color || null,
      precio_compra || 0,
      precio_venta || 0,
      precio_minimo || precio_venta || 0,
      stock_actual || 0,
      estado || 'activo'
    ])

    console.log('Producto creado con ID:', result.insertId)

    return NextResponse.json({
      success: true,
      data: { id: result.insertId, ...body }
    })
  } catch (error: any) {
    console.error('Error creando producto:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear producto',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}

// PUT: Actualizar producto
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    console.log('Actualizando producto:', body)
    
    const {
      id,
      codigo_barras,
      sku,
      nombre,
      descripcion,
      categoria_padre_id,
      tipo_prenda_id,
      talla_id,
      proveedor_id,
      color,
      precio_compra,
      precio_venta,
      precio_minimo,
      stock_actual,
      estado
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de producto requerido' },
        { status: 400 }
      )
    }

    await query(`
      UPDATE productos SET
        codigo_barras = ?,
        sku = ?,
        nombre = ?,
        descripcion = ?,
        categoria_padre_id = ?,
        tipo_prenda_id = ?,
        talla_id = ?,
        proveedor_id = ?,
        color = ?,
        precio_compra = ?,
        precio_venta = ?,
        precio_minimo = ?,
        stock_actual = ?,
        estado = ?
      WHERE id = ?
    `, [
      codigo_barras,
      sku,
      nombre,
      descripcion || null,
      categoria_padre_id,
      tipo_prenda_id,
      talla_id || null,
      proveedor_id,
      color || null,
      precio_compra || 0,
      precio_venta || 0,
      precio_minimo || precio_venta || 0,
      stock_actual || 0,
      estado || 'activo',
      id
    ])

    return NextResponse.json({
      success: true,
      data: body
    })
  } catch (error: any) {
    console.error('Error actualizando producto:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar producto',
        details: error.message
      },
      { status: 500 }
    )
  }
}
