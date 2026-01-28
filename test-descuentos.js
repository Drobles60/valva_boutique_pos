import { query } from './lib/db.ts'

async function testDescuentos() {
  try {
    console.log('Probando conexión a la base de datos...')
    
    // Verificar si existe la tabla descuentos
    const tables = await query(`SHOW TABLES LIKE 'descuentos'`)
    console.log('Tabla descuentos existe:', tables)
    
    // Intentar insertar un descuento de prueba
    console.log('\nIntentando crear descuento...')
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
      'Descripción de prueba',
      'porcentaje',
      10,
      null,
      null,
      'activo',
      'productos'
    ])
    
    console.log('Resultado:', result)
    console.log('\n✅ Descuento creado exitosamente')
    
  } catch (error) {
    console.error('❌ Error:', error)
    console.error('Mensaje:', error.message)
    console.error('Stack:', error.stack)
  }
}

testDescuentos()
