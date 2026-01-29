const mysql = require('mysql2/promise')

async function aplicarCambios() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luciana1510@',
    database: 'valva_boutique',
    multipleStatements: true
  })

  try {
    console.log('Aplicando cambios a la base de datos...\n')
    
    // Verificar si las columnas ya existen
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'valva_boutique' 
        AND TABLE_NAME = 'pedidos' 
        AND COLUMN_NAME IN ('total_abonado', 'saldo_pendiente')
    `)
    
    if (columns.length > 0) {
      console.log('⚠ Las columnas ya existen. Saltando ALTER TABLE...')
    } else {
      console.log('1. Agregando columnas total_abonado y saldo_pendiente...')
      await connection.execute(`
        ALTER TABLE pedidos 
        ADD COLUMN total_abonado DECIMAL(10,2) DEFAULT 0.00 AFTER costo_total,
        ADD COLUMN saldo_pendiente DECIMAL(10,2) DEFAULT 0.00 AFTER total_abonado
      `)
      console.log('✓ Columnas agregadas')
    }
    
    // Actualizar registros existentes
    console.log('\n2. Actualizando registros existentes...')
    await connection.execute(`
      UPDATE pedidos 
      SET total_abonado = 0.00,
          saldo_pendiente = costo_total
      WHERE total_abonado IS NULL OR saldo_pendiente IS NULL
    `)
    console.log('✓ Registros actualizados')
    
    // Verificar si la tabla abonos_pedidos existe
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'abonos_pedidos'
    `)
    
    if (tables.length > 0) {
      console.log('\n⚠ La tabla abonos_pedidos ya existe. Saltando creación...')
    } else {
      console.log('\n3. Creando tabla abonos_pedidos...')
      await connection.execute(`
        CREATE TABLE abonos_pedidos (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          pedido_id INT UNSIGNED NOT NULL,
          monto DECIMAL(10,2) NOT NULL,
          fecha_abono TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro') DEFAULT 'efectivo',
          referencia VARCHAR(100),
          notas TEXT,
          usuario_id INT UNSIGNED,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
          INDEX idx_pedido_id (pedido_id),
          INDEX idx_fecha_abono (fecha_abono)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `)
      console.log('✓ Tabla creada')
    }
    
    // Verificar si los triggers existen
    const [triggers] = await connection.execute(`
      SHOW TRIGGERS WHERE \`Trigger\` IN ('after_abono_insert', 'after_abono_delete')
    `)
    
    if (triggers.length === 0) {
      console.log('\n4. Creando triggers...')
      
      // Trigger para inserción (usar query en lugar de execute)
      await connection.query(`
        CREATE TRIGGER after_abono_insert
        AFTER INSERT ON abonos_pedidos
        FOR EACH ROW
        BEGIN
          UPDATE pedidos 
          SET total_abonado = total_abonado + NEW.monto,
              saldo_pendiente = costo_total - (total_abonado + NEW.monto)
          WHERE id = NEW.pedido_id;
        END
      `)
      
      // Trigger para eliminación (usar query en lugar de execute)
      await connection.query(`
        CREATE TRIGGER after_abono_delete
        AFTER DELETE ON abonos_pedidos
        FOR EACH ROW
        BEGIN
          UPDATE pedidos 
          SET total_abonado = total_abonado - OLD.monto,
              saldo_pendiente = costo_total - (total_abonado - OLD.monto)
          WHERE id = OLD.pedido_id;
        END
      `)
      console.log('✓ Triggers creados')
    } else {
      console.log('\n⚠ Los triggers ya existen. Saltando creación...')
    }
    
    // Verificar estructura final
    console.log('\n5. Verificando estructura final...')
    const [finalColumns] = await connection.execute(`
      DESCRIBE pedidos
    `)
    
    const relevantColumns = finalColumns.filter(col => 
      ['costo_total', 'total_abonado', 'saldo_pendiente'].includes(col.Field)
    )
    
    console.log('\nColumnas financieras de pedidos:')
    relevantColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`)
    })
    
    // Mostrar resumen de pedidos
    const [pedidos] = await connection.execute(`
      SELECT COUNT(*) as total FROM pedidos
    `)
    console.log(`\n✓ Total de pedidos en la base de datos: ${pedidos[0].total}`)
    
    console.log('\n✅ Todos los cambios aplicados correctamente')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await connection.end()
  }
}

aplicarCambios()
