/**
 * Script: Elimina los pedidos auto-generados con numeración PED-XXX
 * que vienen de compras, y los recrea usando el número de compra (COMP-XXXXXX).
 * Uso: node scripts/fix-numeracion-pedidos-compras.js
 */
const mysql = require('mysql2/promise')

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'Luciana1510@', database: 'valva_boutique'
  })
  console.log('🔌 Conectado a la base de datos\n')

  // 1. Buscar pedidos auto-generados desde compras (tienen la nota "Generado desde compra COMP-")
  // pero cuyo numero_pedido NO empieza con COMP- (numeración vieja PED-XXX)
  const [pedidosViejos] = await conn.execute(
    `SELECT id, numero_pedido, notas FROM pedidos
     WHERE notas LIKE 'Generado desde compra COMP-%'
       AND numero_pedido NOT LIKE 'COMP-%'`
  )

  if (pedidosViejos.length === 0) {
    console.log('ℹ️  No hay pedidos con numeración incorrecta que eliminar.\n')
  } else {
    console.log(`🗑️  Eliminando ${pedidosViejos.length} pedidos con numeración incorrecta:\n`)
    for (const p of pedidosViejos) {
      console.log(`   - ${p.numero_pedido} (notas: ${p.notas?.substring(0, 50)}...)`)
    }
    const ids = pedidosViejos.map(p => p.id)
    const placeholders = ids.map(() => '?').join(',')
    await conn.execute(`DELETE FROM abonos_pedidos WHERE pedido_id IN (${placeholders})`, ids)
    await conn.execute(`DELETE FROM detalle_pedidos WHERE pedido_id IN (${placeholders})`, ids)
    await conn.execute(`DELETE FROM pedidos WHERE id IN (${placeholders})`, ids)
    console.log('\n✅ Pedidos incorrectos eliminados\n')
  }
  const [todasCompras] = await conn.execute(
    `SELECT c.id, c.numero_compra, c.factura_numero, c.fecha, c.proveedor_id,
            c.total, c.abono_inicial, c.tipo_pago, c.estado, c.usuario_id
     FROM compras c
     ORDER BY c.id ASC`
  )

  // Obtener números de pedido existentes en JS para evitar error de collation
  const [pedidosExist] = await conn.execute(`SELECT numero_pedido FROM pedidos`)
  const numerosExistentes = new Set(pedidosExist.map(p => p.numero_pedido))

  const comprasSinPedido = todasCompras.filter(c => !numerosExistentes.has(c.numero_compra))

  if (comprasSinPedido.length === 0) {
    console.log('✅ Todos los pedidos ya tienen el número de compra correcto.')
    await conn.end()
    return
  }

  console.log(`📦 Recreando ${comprasSinPedido.length} pedidos con el número de compra:\n`)

  for (const compra of comprasSinPedido) {
    const abonoIni = Number(compra.abono_inicial) || 0
    const total = Number(compra.total) || 0
    const tipoPago = (compra.tipo_pago === 'contado') ? 'contado' : 'credito'
    const saldoPendiente = tipoPago === 'contado' ? 0 : Math.max(total - abonoIni, 0)
    const totalAbonado = tipoPago === 'contado' ? total : abonoIni
    const estadoPedido = compra.estado === 'confirmada' ? 'recibido' : 'pendiente'

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
        totalAbonado.toFixed(2),
        saldoPendiente.toFixed(2),
        tipoPago,
        estadoPedido,
        compra.usuario_id || null,
        `Generado desde compra ${compra.numero_compra}${compra.factura_numero ? ' - Fact. ' + compra.factura_numero : ''}`
      ]
    )
    const pedidoId = pedidoResult.insertId

    if (estadoPedido === 'recibido') {
      await conn.execute(`UPDATE pedidos SET fecha_recibido = NOW() WHERE id = ?`, [pedidoId])
    }

    // Insertar detalles desde compra_detalle
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

    // Abono inicial solo en crédito
    if (abonoIni > 0 && tipoPago !== 'contado') {
      await conn.execute(
        `INSERT INTO abonos_pedidos (pedido_id, monto, metodo_pago, referencia, usuario_id) VALUES (?, ?, ?, ?, ?)`,
        [pedidoId, abonoIni.toFixed(2), 'efectivo', compra.numero_compra, compra.usuario_id || null]
      )
    }

    console.log(`  ✅ ${compra.numero_compra} (${compra.estado}) → Pedido #${pedidoId} con número ${compra.numero_compra}`)
  }

  console.log('\n🎉 Listo. Los pedidos ahora usan el mismo número que la compra.')
  await conn.end()
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
