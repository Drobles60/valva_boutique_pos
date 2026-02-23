const mysql = require('mysql2/promise');

async function createTableCuentasPorCobrar() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique'
  });

  try {
await connection.execute(`
      CREATE TABLE IF NOT EXISTS cuentas_por_cobrar (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT UNSIGNED NOT NULL,
        venta_id INT UNSIGNED NOT NULL,
        monto_total DECIMAL(10,2) NOT NULL,
        saldo_pendiente DECIMAL(10,2) NOT NULL,
        fecha_vencimiento DATE,
        estado ENUM('pendiente', 'pagada', 'vencida') DEFAULT 'pendiente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        FOREIGN KEY (venta_id) REFERENCES ventas(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

// Crear tabla abonos si no existe
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS abonos (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        cuenta_por_cobrar_id INT UNSIGNED NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta') DEFAULT 'efectivo',
        fecha_abono TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usuario_id INT UNSIGNED,
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cuenta_por_cobrar_id) REFERENCES cuentas_por_cobrar(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

// Verificar y agregar campo saldo_actual a clientes si no existe
    try {
      await connection.execute(`
        ALTER TABLE clientes 
        ADD COLUMN saldo_actual DECIMAL(10,2) DEFAULT 0 AFTER saldo_pendiente
      `);
} catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
} else {
        throw error;
      }
    }


  } catch (error) {
    console.error('âŒ Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createTableCuentasPorCobrar()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('âŒ Error:', error);
    process.exit(1);
  });


