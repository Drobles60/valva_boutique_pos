const mysql = require('mysql2/promise');

async function recalcularSaldos() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luciana1510@',
    database: 'valva_boutique'
  });

  try {
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

    }

const [pedidosFinal] = await connection.query(`
      SELECT id, numero_pedido, costo_total, total_abonado, saldo_pendiente
      FROM pedidos
      ORDER BY id
    `);
    console.table(pedidosFinal);

  } catch (error) {
    console.error('âŒ Error:', error.message);
  } finally {
    await connection.end();
  }
}

recalcularSaldos();


