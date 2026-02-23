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
// Verificar si las columnas ya existen
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'valva_boutique' 
        AND TABLE_NAME = 'pedidos' 
        AND COLUMN_NAME IN ('total_abonado', 'saldo_pendiente')
    `)
    
    if (columns.length > 0) {
} else {
await connection.execute(`
        ALTER TABLE pedidos 
        ADD COLUMN total_abonado DECIMAL(10,2) DEFAULT 0.00 AFTER costo_total,
        ADD COLUMN saldo_pendiente DECIMAL(10,2) DEFAULT 0.00 AFTER total_abonado
      `)
}
    
    // Actualizar registros existentes
await connection.execute(`
      UPDATE pedidos 
      SET total_abonado = 0.00,
          saldo_pendiente = costo_total
      WHERE total_abonado IS NULL OR saldo_pendiente IS NULL
    `)
// Verificar si la tabla abonos_pedidos existe
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'abonos_pedidos'
    `)
    
    if (tables.length > 0) {
} else {
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
}
    
    // Verificar si los triggers existen
    const [triggers] = await connection.execute(`
      SHOW TRIGGERS WHERE \`Trigger\` IN ('after_abono_insert', 'after_abono_delete')
    `)
    
    if (triggers.length === 0) {
// Trigger para inserciÃ³n (usar query en lugar de execute)
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
      
      // Trigger para eliminaciÃ³n (usar query en lugar de execute)
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
} else {
}
    
    // Verificar estructura final
const [finalColumns] = await connection.execute(`
      DESCRIBE pedidos
    `)
    
    const relevantColumns = finalColumns.filter(col => 
      ['costo_total', 'total_abonado', 'saldo_pendiente'].includes(col.Field)
    )
    
relevantColumns.forEach(col => {
})
    
    // Mostrar resumen de pedidos
    const [pedidos] = await connection.execute(`
      SELECT COUNT(*) as total FROM pedidos
    `)
    
  } catch (error) {
    console.error('âŒ Error:', error.message)
    throw error
  } finally {
    await connection.end()
  }
}

aplicarCambios()


