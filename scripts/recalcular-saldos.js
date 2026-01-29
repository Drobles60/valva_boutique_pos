const mysql = require('mysql2/promise');

async function recalcularSaldos() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luciana1510@',
    database: 'valva_boutique'
  });

  try {
    console.log('🔧 Recalculando saldos de todos los pedidos...\n');

    // Obtener todos los pedidos
    const [pedidos] = await connection.query('SELECT id, numero_pedido, costo_total FROM pedidos');

    for (const pedido of pedidos) {
      // Calcular total abonado correctamente
      const [result] = await connection.query(
        'SELECT COALESCE(SUM(monto), 0) as total FROM abonos_pedidos WHERE pedido_id = ?',
        [pedido.id]
      );
      
      const totalAbonado = parseFloat(result[0].total);
      const saldoPendiente = parseFloat(pedido.costo_total) - totalAbonado;

      // Actualizar el pedido
      await connection.query(
        'UPDATE pedidos SET total_abonado = ?, saldo_pendiente = ? WHERE id = ?',
        [totalAbonado, saldoPendiente, pedido.id]
      );

      console.log(`✅ ${pedido.numero_pedido}:`);
      console.log(`   Costo Total: $${parseFloat(pedido.costo_total).toLocaleString()}`);
      console.log(`   Total Abonado: $${totalAbonado.toLocaleString()}`);
      console.log(`   Saldo Pendiente: $${saldoPendiente.toLocaleString()}\n`);
    }

    console.log('📊 Estado final de pedidos:');
    const [pedidosFinal] = await connection.query(`
      SELECT id, numero_pedido, costo_total, total_abonado, saldo_pendiente
      FROM pedidos
      ORDER BY id
    `);
    console.table(pedidosFinal);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

recalcularSaldos();
