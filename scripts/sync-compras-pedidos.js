/**
 * Script: Sincronizar compras existentes → crear pedidos correspondientes
 * Uso: node scripts/sync-compras-pedidos.js
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

  // Obtener todas las compras
  const [todasCompras] = await conn.execute(`
    SELECT c.id, c.numero_compra, c.factura_numero, c.fecha, c.proveedor_id,
           c.total, c.abono_inicial, c.tipo_pago, c.estado, c.usuario_id
    FROM compras c
    ORDER BY c.id ASC
  `)

  // Obtener números de pedido ya existentes (en JS para evitar conflictos de collation)
  const [pedidosExist] = await conn.execute('SELECT numero_pedido FROM pedidos')
  const numerosExistentes = new Set(pedidosExist.map(p => p.numero_pedido))

  // Filtrar compras que NO tienen pedido asociado (compara por numero_compra)
  const compras = todasCompras.filter(c => !numerosExistentes.has(c.numero_compra))

  if (compras.length === 0) {
    console.log('✅ Todas las compras ya tienen pedido asociado.')
    await conn.end()
    return
  }

  console.log(`📦 Se encontraron ${compras.length} compras sin pedido. Creando...\n`)

  for (const compra of compras) {
    const abonoIni = Number(compra.abono_inicial) || 0
    const total = Number(compra.total) || 0
    const tipoPago = (compra.tipo_pago === 'contado') ? 'contado' : 'credito'
    const saldoPendienteInicial = tipoPago === 'contado' ? 0 : Math.max(total - abonoIni, 0)
    const totalAbonadoInicial = tipoPago === 'contado' ? total : abonoIni

    // Crear pedido usando el mismo número que la compra
    const [pedidoResult] = await conn.execute(
      `INSERT INTO pedidos (
        numero_pedido, proveedor_id, fecha_pedido, costo_total,
        total_abonado, saldo_pendiente, tipo_pago, estado, usuario_id, notas
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        compra.numero_compra,
        compra.proveedor_id,
        compra.fecha,
        total.toFixed(2),
        totalAbonadoInicial.toFixed(2),
        saldoPendienteInicial.toFixed(2),
        tipoPago,
        compra.estado === 'confirmada' ? 'recibido' : 'pendiente',
        compra.usuario_id || null,
        `Generado desde compra ${compra.numero_compra}${compra.factura_numero ? ' - Fact. ' + compra.factura_numero : ''}`
      ]
    )
    const pedidoId = pedidoResult.insertId

    // Si está confirmada, poner fecha_recibido
    if (compra.estado === 'confirmada') {
      await conn.execute(
        `UPDATE pedidos SET fecha_recibido = NOW() WHERE id = ?`,
        [pedidoId]
      )
    }

    // Obtener detalle de la compra
    const [items] = await conn.execute(
      `SELECT cd.cantidad, cd.total, pr.nombre
       FROM compra_detalle cd
       INNER JOIN productos pr ON cd.producto_id = pr.id
       WHERE cd.compra_id = ?`,
      [compra.id]
    )

    for (const item of items) {
      await conn.execute(
        `INSERT INTO detalle_pedidos (pedido_id, descripcion, cantidad, precio_total) VALUES (?, ?, ?, ?)`,
        [pedidoId, item.nombre, item.cantidad, Number(item.total).toFixed(2)]
      )
    }

    // Registrar abono inicial solo para crédito (en contado ya se marca total_abonado=total)
    if (abonoIni > 0 && tipoPago !== 'contado') {
      await conn.execute(
        `INSERT INTO abonos_pedidos (pedido_id, monto, metodo_pago, referencia, usuario_id) VALUES (?, ?, ?, ?, ?)`,
        [pedidoId, abonoIni.toFixed(2), 'efectivo', compra.numero_compra, compra.usuario_id || null]
      )
    }

    console.log(`  ✅ ${compra.numero_compra} (${compra.estado}) → Pedido con número ${compra.numero_compra}`)
  }

  console.log('\n🎉 Sincronización completada.')
  await conn.end()
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
