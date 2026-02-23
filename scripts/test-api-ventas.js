const fetch = require('node-fetch')

async function testAPI() {
  try {
const response = await fetch('http://localhost:3000/api/productos')
    const result = await response.json()
    
    if (result.success && result.data) {
// Filtrar productos con descuento
      const conDescuento = result.data.filter(p => p.tiene_descuento)
// Mostrar detalles de productos con descuento
      conDescuento.forEach(p => {
if (p.descuento_aplicado) {
}
      })
      
      // Buscar especÃ­ficamente el jean oscuro
      const jeanOscuro = result.data.find(p => p.nombre && p.nombre.toLowerCase().includes('jean oscuro'))
      
      if (jeanOscuro) {
if (jeanOscuro.descuento_aplicado) {
} else {
}
      } else {
}
      
    } else {
      console.error('Error en la respuesta:', result)
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testAPI()


