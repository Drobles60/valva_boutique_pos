const mysql = require('mysql2/promise');

async function actualizarBaseDatos() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique'
  });

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 ACTUALIZANDO BASE DE DATOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // 1. ACTUALIZAR TABLA VENTAS
    console.log('1️⃣  Actualizando tabla VENTAS...');
    
    // Agregar tipo_venta si no existe
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD COLUMN tipo_venta ENUM('contado', 'credito') DEFAULT 'contado' 
        AFTER estado
      `);
      console.log('   ✅ Campo tipo_venta agregado');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ℹ️  Campo tipo_venta ya existe');
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
      console.log('   ✅ Campo metodo_pago agregado');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ℹ️  Campo metodo_pago ya existe');
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
      console.log('   ✅ Campo estado actualizado a ENUM');
    } catch (error) {
      console.log('   ℹ️  Campo estado ya está en formato ENUM');
    }

    // Agregar índice único a numero_venta
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD UNIQUE INDEX idx_numero_venta (numero_venta)
      `);
      console.log('   ✅ Índice único agregado a numero_venta');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ℹ️  Índice único ya existe en numero_venta');
      } else {
        throw error;
      }
    }

    console.log('');

    // 2. ACTUALIZAR TABLA CLIENTES
    console.log('2️⃣  Actualizando tabla CLIENTES...');

    // Agregar campo saldo_actual si no existe
    try {
      await connection.execute(`
        ALTER TABLE clientes 
        ADD COLUMN saldo_actual DECIMAL(10,2) DEFAULT 0 
        AFTER saldo_pendiente
      `);
      console.log('   ✅ Campo saldo_actual agregado');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ℹ️  Campo saldo_actual ya existe');
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
      console.log('   ✅ Campo identificacion agregado');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ℹ️  Campo identificacion ya existe');
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
      console.log('   ✅ Campo tipo_cliente actualizado a ENUM');
    } catch (error) {
      console.log('   ℹ️  Campo tipo_cliente ya está en formato ENUM');
    }

    // Modificar estado a ENUM
    try {
      await connection.execute(`
        ALTER TABLE clientes 
        MODIFY COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo'
      `);
      console.log('   ✅ Campo estado actualizado a ENUM');
    } catch (error) {
      console.log('   ℹ️  Campo estado ya está en formato ENUM');
    }

    console.log('');

    // 3. CREAR TABLA CUENTAS_POR_COBRAR
    console.log('3️⃣  Creando tabla CUENTAS_POR_COBRAR...');
    
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
    console.log('   ✅ Tabla cuentas_por_cobrar creada/verificada');
    console.log('');

    // 4. CREAR TABLA ABONOS
    console.log('4️⃣  Creando tabla ABONOS...');
    
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
    console.log('   ✅ Tabla abonos creada/verificada');
    console.log('');

    // 5. ACTUALIZAR TABLA MOVIMIENTOS_INVENTARIO
    console.log('5️⃣  Verificando tabla MOVIMIENTOS_INVENTARIO...');
    
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
      console.log('   ✅ Campo referencia_id agregado');
    } else {
      console.log('   ℹ️  Campo referencia_id ya existe');
    }
    console.log('');

    // 6. VERIFICAR CAJAS
    console.log('6️⃣  Verificando CAJAS...');
    const [cajas] = await connection.query(`
      SELECT COUNT(*) as count FROM cajas WHERE estado = 'activa'
    `);

    if (cajas[0].count === 0) {
      await connection.execute(`
        INSERT INTO cajas (nombre, codigo, estado) 
        VALUES ('Caja Principal', 'CAJA-01', 'activa')
      `);
      console.log('   ✅ Caja principal creada');
    } else {
      console.log('   ℹ️  Ya existe al menos una caja activa');
    }
    console.log('');

    // 7. ACTUALIZAR REGISTROS EXISTENTES
    console.log('7️⃣  Actualizando registros existentes...');
    
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

    console.log('   ✅ Registros existentes actualizados');
    console.log('');

    // 8. RESUMEN FINAL
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ BASE DE DATOS ACTUALIZADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📋 TABLAS ACTUALIZADAS:');
    console.log('   ✓ ventas (tipo_venta, metodo_pago, estado)');
    console.log('   ✓ clientes (saldo_actual, identificacion, tipo_cliente, estado)');
    console.log('   ✓ cuentas_por_cobrar (nueva tabla)');
    console.log('   ✓ abonos (nueva tabla)');
    console.log('   ✓ movimientos_inventario (referencia_id)');
    console.log('   ✓ cajas (verificada)');
    console.log('');
    console.log('🎉 El schema.sql está actualizado con todos estos cambios');
    console.log('   Puedes usarlo para instalar en otro equipo');
    console.log('');

  } catch (error) {
    console.error('❌ Error al actualizar base de datos:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

actualizarBaseDatos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
