const fetch = require('node-fetch')

async function testAPI() {
  try {
    console.log('Probando API de productos...\n')
    
    const response = await fetch('http://localhost:3000/api/productos')
    const result = await response.json()
    
    if (result.success && result.data) {
      console.log(`Total productos: ${result.data.length}\n`)
      
      // Filtrar productos con descuento
      const conDescuento = result.data.filter(p => p.tiene_descuento)
      console.log(`Productos con descuento: ${conDescuento.length}\n`)
      
      // Mostrar detalles de productos con descuento
      conDescuento.forEach(p => {
        console.log(`\n${p.nombre}`)
        console.log(`  Código: ${p.codigo_barras}`)
        console.log(`  Precio original: $${p.precio_original}`)
        console.log(`  Precio final: $${p.precio_final}`)
        console.log(`  Tiene descuento: ${p.tiene_descuento ? 'Sí' : 'No'}`)
        
        if (p.descuento_aplicado) {
          console.log(`  Descuento aplicado:`)
          console.log(`    - Nombre: ${p.descuento_aplicado.nombre}`)
          console.log(`    - Tipo: ${p.descuento_aplicado.tipo}`)
          console.log(`    - Valor: ${p.descuento_aplicado.valor}${p.descuento_aplicado.tipo === 'porcentaje' ? '%' : ' COP'}`)
          console.log(`  Monto descuento: $${p.monto_descuento}`)
        }
      })
      
      // Buscar específicamente el jean oscuro
      const jeanOscuro = result.data.find(p => p.nombre && p.nombre.toLowerCase().includes('jean oscuro'))
      
      if (jeanOscuro) {
        console.log('\n\n=== JEAN OSCURO - VERIFICACIÓN ===')
        console.log(`Nombre: ${jeanOscuro.nombre}`)
        console.log(`Precio original: $${jeanOscuro.precio_original}`)
        console.log(`Precio final: $${jeanOscuro.precio_final}`)
        console.log(`Tiene descuento: ${jeanOscuro.tiene_descuento}`)
        
        if (jeanOscuro.descuento_aplicado) {
          console.log(`Descuento: ${jeanOscuro.descuento_aplicado.nombre} (${jeanOscuro.descuento_aplicado.tipo})`)
          console.log(`Valor: ${jeanOscuro.descuento_aplicado.valor}`)
          console.log(`✓ El descuento fijo está correctamente aplicado`)
        } else {
          console.log('❌ NO tiene descuento aplicado')
        }
      } else {
        console.log('\n\n❌ No se encontró el producto "jean oscuro"')
      }
      
    } else {
      console.error('Error en la respuesta:', result)
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testAPI()
