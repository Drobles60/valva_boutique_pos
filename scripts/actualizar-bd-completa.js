const mysql = require('mysql2/promise');

async function actualizarBaseDatos() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique'
  });

  try {

    // 1. ACTUALIZAR TABLA VENTAS
// Agregar tipo_venta si no existe
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD COLUMN tipo_venta ENUM('contado', 'credito') DEFAULT 'contado' 
        AFTER estado
      `);
} catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
} else {
        throw error;
      }
    }

    // Agregar metodo_pago si no existe
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD COLUMN metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'mixto') DEFAULT 'efectivo' 
        AFTER tipo_venta
      `);
} catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
} else {
        throw error;
      }
    }

    // Modificar estado a ENUM
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        MODIFY COLUMN estado ENUM('completada', 'credito', 'anulada') DEFAULT 'completada'
      `);
} catch (error) {
}

    // Agregar Ã­ndice Ãºnico a numero_venta
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD UNIQUE INDEX idx_numero_venta (numero_venta)
      `);
} catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
} else {
        throw error;
      }
    }

// 2. ACTUALIZAR TABLA CLIENTES
// Agregar campo saldo_actual si no existe
    try {
      await connection.execute(`
        ALTER TABLE clientes 
        ADD COLUMN saldo_actual DECIMAL(10,2) DEFAULT 0 
        AFTER saldo_pendiente
      `);
} catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
} else {
        throw error;
      }
    }

    // Agregar campo identificacion si no existe
    try {
      await connection.execute(`
        ALTER TABLE clientes 
        ADD COLUMN identificacion VARCHAR(50) 
        AFTER nombre
      `);
} catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
} else {
        throw error;
      }
    }

    // Modificar tipo_cliente a ENUM si no lo es
    try {
      await connection.execute(`
        ALTER TABLE clientes 
        MODIFY COLUMN tipo_cliente ENUM('publico', 'mayorista', 'especial') DEFAULT 'publico'
      `);
} catch (error) {
}

    // Modificar estado a ENUM
    try {
      await connection.execute(`
        ALTER TABLE clientes 
        MODIFY COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo'
      `);
} catch (error) {
}

// 3. CREAR TABLA CUENTAS_POR_COBRAR
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

    // 4. CREAR TABLA ABONOS
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

    // 5. ACTUALIZAR TABLA MOVIMIENTOS_INVENTARIO
// Verificar si la columna referencia_id existe
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM movimientos_inventario LIKE 'referencia_id'
    `);

    if (columns.length === 0) {
      // Si no existe, agregar columna referencia_id
      await connection.execute(`
        ALTER TABLE movimientos_inventario 
        ADD COLUMN referencia_id INT UNSIGNED 
        AFTER motivo
      `);
} else {
}
// 6. VERIFICAR CAJAS
const [cajas] = await connection.query(`
      SELECT COUNT(*) as count FROM cajas WHERE estado = 'activa'
    `);

    if (cajas[0].count === 0) {
      await connection.execute(`
        INSERT INTO cajas (nombre, codigo, estado) 
        VALUES ('Caja Principal', 'CAJA-01', 'activa')
      `);
} else {
}
// 7. ACTUALIZAR REGISTROS EXISTENTES
await connection.execute(`
      UPDATE ventas 
      SET tipo_venta = 'contado' 
      WHERE tipo_venta IS NULL
    `);

    await connection.execute(`
      UPDATE ventas 
      SET metodo_pago = 'efectivo' 
      WHERE metodo_pago IS NULL
    `);

    await connection.execute(`
      UPDATE clientes 
      SET saldo_actual = 0 
      WHERE saldo_actual IS NULL
    `);

    await connection.execute(`
      UPDATE clientes 
      SET tipo_cliente = 'publico' 
      WHERE tipo_cliente IS NULL OR tipo_cliente = ''
    `);

    await connection.execute(`
      UPDATE clientes 
      SET estado = 'activo' 
      WHERE estado IS NULL OR estado = ''
    `);


    // 8. RESUMEN FINAL
} catch (error) {
    console.error('âŒ Error al actualizar base de datos:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

actualizarBaseDatos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('âŒ Error:', error);
    process.exit(1);
  });


