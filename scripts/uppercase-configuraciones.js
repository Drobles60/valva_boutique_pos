/**
 * Script para convertir a MAYÚSCULAS todos los datos existentes en:
 *  - categorias_padre.nombre
 *  - tipos_prenda.nombre
 *  - tallas.valor
 *  - tipos_gastos.label
 *
 * Uso: node scripts/uppercase-configuraciones.js
 */

const mysql = require('mysql2/promise')

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luciana1510@',
    database: 'valva_boutique',
  })

  console.log('🔌 Conectado a la base de datos\n')

  // 1) Categorías Padre
  const [cats] = await conn.execute("SELECT id, nombre FROM categorias_padre")
  let updated = 0
  for (const row of cats) {
    const upper = row.nombre.toUpperCase()
    if (upper !== row.nombre) {
      await conn.execute("UPDATE categorias_padre SET nombre = ? WHERE id = ?", [upper, row.id])
      console.log(`  categorias_padre: "${row.nombre}" → "${upper}"`)
      updated++
    }
  }
  console.log(`✅ Categorías Padre: ${updated} actualizadas de ${cats.length} registros\n`)

  // 2) Tipos de Prenda
  const [tipos] = await conn.execute("SELECT id, nombre FROM tipos_prenda")
  updated = 0
  for (const row of tipos) {
    const upper = row.nombre.toUpperCase()
    if (upper !== row.nombre) {
      await conn.execute("UPDATE tipos_prenda SET nombre = ? WHERE id = ?", [upper, row.id])
      console.log(`  tipos_prenda: "${row.nombre}" → "${upper}"`)
      updated++
    }
  }
  console.log(`✅ Tipos de Prenda: ${updated} actualizados de ${tipos.length} registros\n`)

  // 3) Tallas
  const [tallas] = await conn.execute("SELECT id, valor FROM tallas")
  updated = 0
  for (const row of tallas) {
    const upper = row.valor.toUpperCase()
    if (upper !== row.valor) {
      await conn.execute("UPDATE tallas SET valor = ? WHERE id = ?", [upper, row.id])
      console.log(`  tallas: "${row.valor}" → "${upper}"`)
      updated++
    }
  }
  console.log(`✅ Tallas: ${updated} actualizadas de ${tallas.length} registros\n`)

  // 4) Tipos de Gastos (label)
  const [gastos] = await conn.execute("SELECT id, label FROM tipos_gastos")
  updated = 0
  for (const row of gastos) {
    const upper = row.label.toUpperCase()
    if (upper !== row.label) {
      await conn.execute("UPDATE tipos_gastos SET label = ? WHERE id = ?", [upper, row.id])
      console.log(`  tipos_gastos: "${row.label}" → "${upper}"`)
      updated++
    }
  }
  console.log(`✅ Tipos de Gastos: ${updated} actualizados de ${gastos.length} registros\n`)

  await conn.end()
  console.log('🎉 Proceso completado')
}

main().catch(err => { console.error('❌ Error:', err.message); process.exit(1) })
