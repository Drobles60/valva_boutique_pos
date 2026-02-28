// Script de prueba de conexiÃ³n y endpoints
// Ejecutar con: node --loader tsx scripts/test-api.ts

import { query, checkConnection } from '../lib/db'

async function testDatabase() {
// Test 1: Verificar conexiÃ³n
  try {
    const connected = await checkConnection()
} catch (error) {
    console.error('âŒ Error de conexiÃ³n:', error)
    return
  }

  // Test 2: Contar categorÃ­as padre
  try {
    const result: any = await query(
      "SELECT COUNT(*) as total FROM categorias_padre WHERE estado = 'activo'"
    )
} catch (error) {
    console.error('âŒ Error al consultar categorÃ­as padre:', error)
  }

  // Test 3: Listar categorÃ­as padre
  try {
    const result: any = await query(
      "SELECT id, nombre FROM categorias_padre WHERE estado = 'activo' ORDER BY nombre"
    )
result.forEach((cat: any) => {
})
  } catch (error) {
    console.error('âŒ Error al listar categorÃ­as:', error)
  }

  // Test 4: Contar tipos de prenda
  try {
    const result: any = await query(
      "SELECT COUNT(*) as total FROM tipos_prenda WHERE estado = 'activo'"
    )
} catch (error) {
    console.error('âŒ Error al consultar tipos de prenda:', error)
  }

  // Test 5: Contar tallas
  try {
    const result: any = await query(
      "SELECT COUNT(*) as total FROM tallas WHERE estado = 'activo'"
    )
} catch (error) {
    console.error('âŒ Error al consultar tallas:', error)
  }

  // Test 6: Contar proveedores
  try {
    const result: any = await query(
      "SELECT COUNT(*) as total FROM proveedores WHERE estado = 'activo'"
    )
} catch (error) {
    console.error('âŒ Error al consultar proveedores:', error)
  }

}

testDatabase().catch(console.error)

