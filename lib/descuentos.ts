import { query } from '@/lib/db'

/**
 * Obtiene los descuentos aplicables a un producto específico
 */
export async function getDescuentosForProduct(productoId: number) {
  try {
    console.log(`[DESCUENTOS] Buscando descuentos para producto ID: ${productoId}`)
    
    // Primero, actualizar el estado de descuentos vencidos
    await query(`
      UPDATE descuentos 
      SET estado = 'inactivo' 
      WHERE fecha_fin IS NOT NULL 
        AND fecha_fin < CURDATE() 
        AND estado = 'activo'
    `)
    
    // Obtener el producto con su tipo de prenda
    const producto = await query<any[]>(`
      SELECT p.*, p.tipo_prenda_id, tp.id as tipo_prenda_id_join
      FROM productos p
      LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      WHERE p.id = ?
    `, [productoId])

    if (!producto || producto.length === 0) {
      console.log(`[DESCUENTOS] Producto ${productoId} no encontrado`)
      return []
    }

    const prod = producto[0]
    console.log(`[DESCUENTOS] Producto: ${prod.nombre}, Tipo Prenda ID: ${prod.tipo_prenda_id}`)
    const descuentos = []

    // Buscar descuentos directos al producto (solo activos)
    const descuentosProducto = await query<any[]>(`
      SELECT d.* 
      FROM descuentos d
      JOIN descuento_productos dp ON d.id = dp.descuento_id
      WHERE dp.producto_id = ? 
        AND d.estado = 'activo'
        AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
        AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
    `, [productoId])

    console.log(`[DESCUENTOS] Descuentos directos encontrados: ${descuentosProducto.length}`)
    if (descuentosProducto.length > 0) {
      console.log(`[DESCUENTOS] Detalles:`, descuentosProducto.map(d => ({ id: d.id, nombre: d.nombre, tipo: d.tipo, valor: d.valor })))
    }
    descuentos.push(...descuentosProducto)

    // Buscar descuentos por tipo de prenda (solo activos)
    if (prod.tipo_prenda_id) {
      const descuentosTipoPrenda = await query<any[]>(`
        SELECT d.*
        FROM descuentos d
        JOIN descuento_tipos_prenda dtp ON d.id = dtp.descuento_id
        WHERE dtp.tipo_prenda_id = ?
          AND d.estado = 'activo'
          AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
          AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
      `, [prod.tipo_prenda_id])

      console.log(`[DESCUENTOS] Descuentos por tipo de prenda encontrados: ${descuentosTipoPrenda.length}`)
      if (descuentosTipoPrenda.length > 0) {
        console.log(`[DESCUENTOS] Detalles:`, descuentosTipoPrenda.map(d => ({ id: d.id, nombre: d.nombre, tipo: d.tipo, valor: d.valor })))
      }
      descuentos.push(...descuentosTipoPrenda)
    } else {
      console.log(`[DESCUENTOS] Producto sin tipo_prenda_id, no se buscaron descuentos por tipo`)
    }

    console.log(`[DESCUENTOS] Total descuentos aplicables: ${descuentos.length}`)
    return descuentos
  } catch (error) {
    console.error('[DESCUENTOS] Error obteniendo descuentos para producto:', error)
    return []
  }
}

/**
 * Calcula el precio final de un producto aplicando el mejor descuento disponible
 */
export function calcularPrecioConDescuento(
  precioOriginal: number, 
  descuentos: any[]
): { precioFinal: number; descuentoAplicado: any | null; montoDescuento: number } {
  if (!descuentos || descuentos.length === 0) {
    return {
      precioFinal: precioOriginal,
      descuentoAplicado: null,
      montoDescuento: 0
    }
  }

  console.log(`[CALC] Calculando descuento para precio: $${precioOriginal}, descuentos disponibles: ${descuentos.length}`)

  // Calcular el precio final para cada descuento
  const descuentosCalculados = descuentos.map(descuento => {
    let precioFinal = precioOriginal
    let montoDescuento = 0
    
    if (descuento.tipo === 'fijo') {
      // Para descuento fijo, el valor ES el precio final
      precioFinal = descuento.valor
      montoDescuento = precioOriginal - descuento.valor
    } else if (descuento.tipo === 'porcentaje') {
      // Para porcentaje: aplicar el porcentaje al precio de venta
      // 1. Calcular el monto del descuento: precio_venta * (porcentaje / 100)
      montoDescuento = (precioOriginal * descuento.valor) / 100
      // 2. Calcular el precio final: precio_venta - monto_descuento
      precioFinal = precioOriginal - montoDescuento
    }

    // Asegurar que el precio nunca sea negativo
    precioFinal = Math.max(0, precioFinal)
    
    console.log(`[CALC] Descuento "${descuento.nombre}" (${descuento.tipo}): ${descuento.tipo === 'fijo' ? `Precio fijo $${descuento.valor}` : `${descuento.valor}% sobre $${precioOriginal} = -$${montoDescuento.toFixed(2)}`} → Precio final: $${precioFinal.toFixed(2)}`)

    return {
      ...descuento,
      montoDescuento,
      precioFinal
    }
  })

  // Obtener el descuento que da el menor precio final (mejor descuento para el cliente)
  const mejorDescuento = descuentosCalculados.reduce((mejor, actual) => {
    return actual.precioFinal < mejor.precioFinal ? actual : mejor
  })

  console.log(`[CALC] Mejor descuento seleccionado: "${mejorDescuento.nombre}" - Precio final: $${mejorDescuento.precioFinal}`)

  return {
    precioFinal: mejorDescuento.precioFinal,
    descuentoAplicado: mejorDescuento,
    montoDescuento: mejorDescuento.montoDescuento
  }
}

/**
 * Obtiene todos los productos con sus descuentos aplicados
 */
export async function getProductosConDescuentos() {
  try {
    const productos = await query<any[]>(`
      SELECT p.*, 
        cp.nombre as categoria_nombre,
        tp.nombre as tipo_prenda_nombre,
        t.valor as talla_valor
      FROM productos p
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      WHERE p.estado = 'activo'
    `)

    // Para cada producto, obtener sus descuentos y calcular precio final
    const productosConDescuentos = await Promise.all(
      productos.map(async (producto) => {
        const descuentos = await getDescuentosForProduct(producto.id)
        const { precioFinal, descuentoAplicado, montoDescuento } = calcularPrecioConDescuento(
          producto.precio_venta,
          descuentos
        )

        return {
          ...producto,
          descuentos_disponibles: descuentos,
          descuento_aplicado: descuentoAplicado,
          monto_descuento: montoDescuento,
          precio_original: producto.precio_venta,
          precio_final: precioFinal
        }
      })
    )

    return productosConDescuentos
  } catch (error) {
    console.error('Error obteniendo productos con descuentos:', error)
    throw error
  }
}
