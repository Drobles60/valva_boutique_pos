const mysql = require('mysql2/promise');

async function actualizarTablasVentas() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique',
    multipleStatements: true
  });

  try {
// 1. Crear tabla cuentas_por_cobrar si no existe
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
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
        FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
        INDEX idx_cliente_id (cliente_id),
        INDEX idx_venta_id (venta_id),
        INDEX idx_estado (estado),
        INDEX idx_fecha_vencimiento (fecha_vencimiento)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
// 2. Agregar campo saldo_actual a clientes si no existe
try {
      await connection.execute(`
        ALTER TABLE clientes 
        ADD COLUMN saldo_actual DECIMAL(10,2) DEFAULT 0.00 AFTER limite_credito
      `);
} catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
} else {
        throw error;
      }
    }

    // 3. Agregar campo identificacion a clientes si no existe
try {
      await connection.execute(`
        ALTER TABLE clientes 
        ADD COLUMN identificacion VARCHAR(50) AFTER nombre
      `);
} catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
} else {
        throw error;
      }
    }

    // 4. Modificar tabla movimientos_inventario para usar ENUM correcto
try {
      await connection.execute(`
        ALTER TABLE movimientos_inventario 
        MODIFY COLUMN tipo_movimiento ENUM(
          'entrada', 'salida', 'ajuste', 
          'venta', 'devolucion', 'merma'
        ) NOT NULL
      `);
} catch (error) {
}

    // 5. Modificar campo referencia_id en movimientos_inventario
try {
      await connection.execute(`
        ALTER TABLE movimientos_inventario 
        ADD COLUMN referencia_id INT UNSIGNED AFTER motivo
      `);
} catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
} else {
        throw error;
      }
    }

    // 6. Modificar campos de movimientos_inventario
// Intentar eliminar stock_anterior si existe
    try {
      await connection.execute(`
        ALTER TABLE movimientos_inventario 
        DROP COLUMN stock_anterior
      `);
} catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
}
    }

    // Intentar eliminar stock_nuevo si existe
    try {
      await connection.execute(`
        ALTER TABLE movimientos_inventario 
        DROP COLUMN stock_nuevo
      `);
} catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
}
    }

// 7. Crear Ã­ndices adicionales en ventas
try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD INDEX idx_fecha_venta (fecha_venta),
        ADD INDEX idx_estado (estado),
        ADD INDEX idx_tipo_venta (tipo_venta)
      `);
} catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
} else {
        throw error;
      }
    }

    // 8. Crear Ã­ndices en detalle_ventas
try {
      await connection.execute(`
        ALTER TABLE detalle_ventas 
        ADD INDEX idx_venta_id (venta_id),
        ADD INDEX idx_producto_id (producto_id)
      `);
} catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
} else {
        throw error;
      }
    }

    // 9. Actualizar valores NULL en clientes
await connection.execute(`
      UPDATE clientes 
      SET saldo_actual = 0.00 
      WHERE saldo_actual IS NULL
    `);
    await connection.execute(`
      UPDATE clientes 
      SET limite_credito = 0.00 
      WHERE limite_credito IS NULL
    `);
// 10. Verificar estructura de sesiones_caja
try {
      await connection.execute(`
        ALTER TABLE sesiones_caja 
        MODIFY COLUMN estado ENUM('abierta', 'cerrada') DEFAULT 'abierta'
      `);
} catch (error) {
}

    // 11. Crear tabla abonos_clientes si no existe (para pagos de crÃ©dito)
await connection.execute(`
      CREATE TABLE IF NOT EXISTS abonos_clientes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        cuenta_por_cobrar_id INT UNSIGNED NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        fecha_abono TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'cheque') DEFAULT 'efectivo',
        referencia VARCHAR(100),
        notas TEXT,
        usuario_id INT UNSIGNED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cuenta_por_cobrar_id) REFERENCES cuentas_por_cobrar(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
        INDEX idx_cuenta_id (cuenta_por_cobrar_id),
        INDEX idx_fecha_abono (fecha_abono)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
// 12. Verificar que exista al menos una caja
const [cajas] = await connection.execute('SELECT COUNT(*) as total FROM cajas');
    if (cajas[0].total === 0) {
      await connection.execute(`
        INSERT INTO cajas (nombre, codigo, estado) 
        VALUES ('Caja Principal', 'CAJA-01', 'activa')
      `);
} else {
}

// Mostrar resumen
} catch (error) {
    console.error('âŒ Error al actualizar base de datos:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

actualizarTablasVentas()
  .then(() => {
process.exit(0);
  })
  .catch((error) => {
    console.error('âŒ Error en el script:', error);
    process.exit(1);
  });


