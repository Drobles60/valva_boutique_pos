// Script de prueba de conexión y endpoints
// Ejecutar con: node --loader tsx scripts/test-api.ts

import { query, checkConnection } from '../lib/db'

async function testDatabase() {
  console.log('🔍 Probando conexión a la base de datos...\n')

  // Test 1: Verificar conexión
  try {
    const connected = await checkConnection()
    console.log('✅ Conexión a la base de datos:', connected ? 'EXITOSA' : 'FALLIDA')
  } catch (error) {
    console.error('❌ Error de conexión:', error)
    return
  }

  // Test 2: Contar categorías padre
  try {
    const result: any = await query(
      "SELECT COUNT(*) as total FROM categorias_padre WHERE estado = 'activo'"
    )
    console.log(`✅ Categorías Padre activas: ${result[0]?.total || 0}`)
  } catch (error) {
    console.error('❌ Error al consultar categorías padre:', error)
  }

  // Test 3: Listar categorías padre
  try {
    const result: any = await query(
      "SELECT id, nombre FROM categorias_padre WHERE estado = 'activo' ORDER BY nombre"
    )
    console.log('\n📋 Lista de categorías padre:')
    result.forEach((cat: any) => {
      console.log(`   ${cat.id}. ${cat.nombre}`)
    })
  } catch (error) {
    console.error('❌ Error al listar categorías:', error)
  }

  // Test 4: Contar tipos de prenda
  try {
    const result: any = await query(
      "SELECT COUNT(*) as total FROM tipos_prenda WHERE estado = 'activo'"
    )
    console.log(`\n✅ Tipos de Prenda activos: ${result[0]?.total || 0}`)
  } catch (error) {
    console.error('❌ Error al consultar tipos de prenda:', error)
  }

  // Test 5: Contar tallas
  try {
    const result: any = await query(
      "SELECT COUNT(*) as total FROM tallas WHERE estado = 'activo'"
    )
    console.log(`✅ Tallas activas: ${result[0]?.total || 0}`)
  } catch (error) {
    console.error('❌ Error al consultar tallas:', error)
  }

  // Test 6: Contar proveedores
  try {
    const result: any = await query(
      "SELECT COUNT(*) as total FROM proveedores WHERE estado = 'activo'"
    )
    console.log(`✅ Proveedores activos: ${result[0]?.total || 0}`)
  } catch (error) {
    console.error('❌ Error al consultar proveedores:', error)
  }

  console.log('\n✨ Pruebas completadas')
}

testDatabase().catch(console.error)
