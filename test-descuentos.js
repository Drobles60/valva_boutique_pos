import { query } from './lib/db.ts'

async function testDescuentos() {
  try {
// Verificar si existe la tabla descuentos
    const tables = await query(`SHOW TABLES LIKE 'descuentos'`)
// Intentar insertar un descuento de prueba
const result = await query(`
      INSERT INTO descuentos (
        nombre, 
        descripcion, 
        tipo, 
        valor, 
        fecha_inicio, 
        fecha_fin, 
        estado, 
        aplicable_a
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Descuento Prueba',
      'DescripciÃ³n de prueba',
      'porcentaje',
      10,
      null,
      null,
      'activo',
      'productos'
    ])
    
    
  } catch (error) {
    console.error('âŒ Error:', error)
    console.error('Mensaje:', error.message)
    console.error('Stack:', error.stack)
  }
}

testDescuentos()


