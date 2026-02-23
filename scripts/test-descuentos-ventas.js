const mysql = require('mysql2/promise')

async function testDescuentosVentas() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luciana1510@',
    database: 'valva_boutique'
  })

  try {
const [descuentos] = await connection.execute(`
      SELECT id, nombre, tipo, valor, estado, fecha_inicio, fecha_fin
      FROM descuentos 
      WHERE estado = 'activo'
      ORDER BY id
    `)
    
descuentos.forEach(d => {
})

// Obtener productos con descuentos directos
    const [prodDirectos] = await connection.execute(`
      SELECT DISTINCT p.id, p.nombre, p.precio_venta, d.nombre as descuento_nombre, d.tipo, d.valor
      FROM productos p
      JOIN descuento_productos dp ON p.id = dp.producto_id
      JOIN descuentos d ON dp.descuento_id = d.id
      WHERE d.estado = 'activo'
      ORDER BY p.nombre
    `)
    
prodDirectos.forEach(p => {
if (p.tipo === 'porcentaje') {
        const descuento = (p.precio_venta * p.valor) / 100
        const precioFinal = p.precio_venta - descuento
      } else {
}
    })

    // Obtener productos con descuentos por tipo de prenda
    const [prodTipoPrenda] = await connection.execute(`
      SELECT DISTINCT p.id, p.nombre, p.precio_venta, tp.nombre as tipo_prenda, d.nombre as descuento_nombre, d.tipo, d.valor
      FROM productos p
      JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      JOIN descuento_tipos_prenda dtp ON tp.id = dtp.tipo_prenda_id
      JOIN descuentos d ON dtp.descuento_id = d.id
      WHERE d.estado = 'activo'
      ORDER BY p.nombre
    `)
    
prodTipoPrenda.forEach(p => {
if (p.tipo === 'porcentaje') {
        const descuento = (p.precio_venta * p.valor) / 100
        const precioFinal = p.precio_venta - descuento
      } else {
}
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await connection.end()
  }
}

testDescuentosVentas()


