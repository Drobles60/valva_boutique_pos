const mysql = require('mysql2/promise')

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'Luciana1510@', database: 'valva_boutique'
  })

  // Verificar si la columna ya existe
  const [cols] = await conn.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'valva_boutique' AND TABLE_NAME = 'pedidos' AND COLUMN_NAME = 'tipo_pago'`
  )

  if (cols.length === 0) {
    await conn.execute(
      `ALTER TABLE pedidos ADD COLUMN tipo_pago ENUM('contado','credito','mixto') DEFAULT 'contado' AFTER saldo_pendiente`
    )
    console.log('✅ Columna tipo_pago agregada a la tabla pedidos')
  } else {
    console.log('ℹ️  La columna tipo_pago ya existe')
  }

  // Actualizar pedidos existentes: si saldo_pendiente > 0 → credito, si no → contado
  const [res] = await conn.execute(
    `UPDATE pedidos SET tipo_pago = CASE WHEN saldo_pendiente > 0 THEN 'credito' ELSE 'contado' END`
  )
  console.log(`✅ ${res.affectedRows} pedidos actualizados con tipo_pago`)

  await conn.end()
  console.log('🎉 Migración completada')
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
