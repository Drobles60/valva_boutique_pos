const mysql = require('mysql2/promise')

async function testDescuentosVentas() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luciana1510@',
    database: 'valva_boutique'
  })

  try {
    console.log('=== DESCUENTOS ACTIVOS ===\n')
    const [descuentos] = await connection.execute(`
      SELECT id, nombre, tipo, valor, estado, fecha_inicio, fecha_fin
      FROM descuentos 
      WHERE estado = 'activo'
      ORDER BY id
    `)
    
    console.log('Total descuentos activos:', descuentos.length)
    descuentos.forEach(d => {
      console.log(`\nID: ${d.id}`)
      console.log(`  Nombre: ${d.nombre}`)
      console.log(`  Tipo: ${d.tipo}`)
      console.log(`  Valor: ${d.valor}${d.tipo === 'porcentaje' ? '%' : ' COP'}`)
      console.log(`  Vigencia: ${d.fecha_inicio || 'Sin fecha inicio'} - ${d.fecha_fin || 'Sin fecha fin'}`)
    })

    console.log('\n=== PRODUCTOS CON DESCUENTOS ===\n')
    
    // Obtener productos con descuentos directos
    const [prodDirectos] = await connection.execute(`
      SELECT DISTINCT p.id, p.nombre, p.precio_venta, d.nombre as descuento_nombre, d.tipo, d.valor
      FROM productos p
      JOIN descuento_productos dp ON p.id = dp.producto_id
      JOIN descuentos d ON dp.descuento_id = d.id
      WHERE d.estado = 'activo'
      ORDER BY p.nombre
    `)
    
    console.log('Productos con descuentos directos:', prodDirectos.length)
    prodDirectos.forEach(p => {
      console.log(`\n${p.nombre}`)
      console.log(`  Precio original: $${p.precio_venta}`)
      console.log(`  Descuento: ${p.descuento_nombre}`)
      if (p.tipo === 'porcentaje') {
        const descuento = (p.precio_venta * p.valor) / 100
        const precioFinal = p.precio_venta - descuento
        console.log(`  ${p.valor}% de descuento = -$${descuento}`)
        console.log(`  Precio final: $${precioFinal}`)
      } else {
        console.log(`  Precio fijo: $${p.valor}`)
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
    
    console.log('\n\nProductos con descuentos por tipo de prenda:', prodTipoPrenda.length)
    prodTipoPrenda.forEach(p => {
      console.log(`\n${p.nombre} (${p.tipo_prenda})`)
      console.log(`  Precio original: $${p.precio_venta}`)
      console.log(`  Descuento: ${p.descuento_nombre}`)
      if (p.tipo === 'porcentaje') {
        const descuento = (p.precio_venta * p.valor) / 100
        const precioFinal = p.precio_venta - descuento
        console.log(`  ${p.valor}% de descuento = -$${descuento}`)
        console.log(`  Precio final: $${precioFinal}`)
      } else {
        console.log(`  Precio fijo: $${p.valor}`)
      }
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await connection.end()
  }
}

testDescuentosVentas()
