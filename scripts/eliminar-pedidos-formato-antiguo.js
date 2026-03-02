const mysql = require('mysql2/promise')

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'Luciana1510@', database: 'valva_boutique'
  })

  const [rows] = await conn.execute(
    `SELECT id, numero_pedido FROM pedidos WHERE numero_pedido NOT LIKE 'COMP-%'`
  )

  if (rows.length === 0) {
    console.log('No hay pedidos con formato antiguo.')
    await conn.end()
    return
  }

  console.log(`Eliminando ${rows.length} pedidos:`)
  rows.forEach(r => console.log(`  - ${r.numero_pedido} (id: ${r.id})`))

  const ids = rows.map(r => r.id)
  const ph = ids.map(() => '?').join(',')
  await conn.execute(`DELETE FROM abonos_pedidos WHERE pedido_id IN (${ph})`, ids)
  await conn.execute(`DELETE FROM detalle_pedidos WHERE pedido_id IN (${ph})`, ids)
  await conn.execute(`DELETE FROM pedidos WHERE id IN (${ph})`, ids)

  console.log(`\n✅ ${ids.length} pedidos eliminados.`)
  await conn.end()
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
