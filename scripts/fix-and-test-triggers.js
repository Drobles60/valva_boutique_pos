const mysql = require('mysql2/promise');

async function fixTriggers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luciana1510@',
    database: 'valva_boutique',
    multipleStatements: true
  });

  try {
    console.log('🔧 Eliminando triggers antiguos...');
    await connection.query('DROP TRIGGER IF EXISTS after_abono_insert');
    await connection.query('DROP TRIGGER IF EXISTS after_abono_delete');
    console.log('✅ Triggers eliminados');

    console.log('\n🔧 Creando trigger para INSERT...');
    await connection.query(`
      CREATE TRIGGER after_abono_insert
      AFTER INSERT ON abonos_pedidos
      FOR EACH ROW
      BEGIN
        UPDATE pedidos 
        SET total_abonado = total_abonado + NEW.monto,
            saldo_pendiente = saldo_pendiente - NEW.monto
        WHERE id = NEW.pedido_id;
      END
    `);
    console.log('✅ Trigger after_abono_insert creado');

    console.log('\n🔧 Creando trigger para DELETE...');
    await connection.query(`
      CREATE TRIGGER after_abono_delete
      AFTER DELETE ON abonos_pedidos
      FOR EACH ROW
      BEGIN
        UPDATE pedidos 
        SET total_abonado = total_abonado - OLD.monto,
            saldo_pendiente = saldo_pendiente + OLD.monto
        WHERE id = OLD.pedido_id;
      END
    `);
    console.log('✅ Trigger after_abono_delete creado');

    console.log('\n📋 Verificando triggers...');
    const [triggers] = await connection.query("SHOW TRIGGERS WHERE `Table` = 'abonos_pedidos'");
    console.log(`✅ Encontrados ${triggers.length} triggers:`);
    triggers.forEach(t => {
      console.log(`   - ${t.Trigger} (${t.Event} ${t.Timing})`);
    });

    // Verificar estado de pedidos
    console.log('\n📊 Estado actual de pedidos:');
    const [pedidos] = await connection.query(`
      SELECT id, numero_pedido, costo_total, total_abonado, saldo_pendiente
      FROM pedidos
      ORDER BY id
    `);
    console.table(pedidos);

    // Obtener abonos existentes
    console.log('\n💰 Abonos registrados:');
    const [abonos] = await connection.query(`
      SELECT a.id, a.pedido_id, p.numero_pedido, a.monto, a.fecha_abono
      FROM abonos_pedidos a
      JOIN pedidos p ON a.pedido_id = p.id
      ORDER BY a.pedido_id, a.fecha_abono
    `);
    if (abonos.length > 0) {
      console.table(abonos);
    } else {
      console.log('   (No hay abonos registrados)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixTriggers();
