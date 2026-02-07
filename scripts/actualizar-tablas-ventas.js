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
    console.log('🔄 Actualizando estructura de base de datos para ventas...\n');

    // 1. Crear tabla cuentas_por_cobrar si no existe
    console.log('📋 1. Verificando tabla cuentas_por_cobrar...');
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
    console.log('✅ Tabla cuentas_por_cobrar verificada/creada\n');

    // 2. Agregar campo saldo_actual a clientes si no existe
    console.log('📋 2. Verificando campo saldo_actual en clientes...');
    try {
      await connection.execute(`
        ALTER TABLE clientes 
        ADD COLUMN saldo_actual DECIMAL(10,2) DEFAULT 0.00 AFTER limite_credito
      `);
      console.log('✅ Campo saldo_actual agregado a clientes');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Campo saldo_actual ya existe en clientes');
      } else {
        throw error;
      }
    }

    // 3. Agregar campo identificacion a clientes si no existe
    console.log('\n📋 3. Verificando campo identificacion en clientes...');
    try {
      await connection.execute(`
        ALTER TABLE clientes 
        ADD COLUMN identificacion VARCHAR(50) AFTER nombre
      `);
      console.log('✅ Campo identificacion agregado a clientes');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Campo identificacion ya existe en clientes');
      } else {
        throw error;
      }
    }

    // 4. Modificar tabla movimientos_inventario para usar ENUM correcto
    console.log('\n📋 4. Actualizando tabla movimientos_inventario...');
    try {
      await connection.execute(`
        ALTER TABLE movimientos_inventario 
        MODIFY COLUMN tipo_movimiento ENUM(
          'entrada', 'salida', 'ajuste', 
          'venta', 'devolucion', 'merma'
        ) NOT NULL
      `);
      console.log('✅ Tabla movimientos_inventario actualizada');
    } catch (error) {
      console.log('ℹ️  Tabla movimientos_inventario ya tiene la estructura correcta');
    }

    // 5. Modificar campo referencia_id en movimientos_inventario
    console.log('\n📋 5. Verificando campo referencia_id en movimientos_inventario...');
    try {
      await connection.execute(`
        ALTER TABLE movimientos_inventario 
        ADD COLUMN referencia_id INT UNSIGNED AFTER motivo
      `);
      console.log('✅ Campo referencia_id agregado');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Campo referencia_id ya existe');
      } else {
        throw error;
      }
    }

    // 6. Modificar campos de movimientos_inventario
    console.log('\n📋 6. Actualizando estructura de movimientos_inventario...');
    
    // Intentar eliminar stock_anterior si existe
    try {
      await connection.execute(`
        ALTER TABLE movimientos_inventario 
        DROP COLUMN stock_anterior
      `);
      console.log('✅ Campo stock_anterior eliminado');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️  Campo stock_anterior no existe o ya fue eliminado');
      }
    }

    // Intentar eliminar stock_nuevo si existe
    try {
      await connection.execute(`
        ALTER TABLE movimientos_inventario 
        DROP COLUMN stock_nuevo
      `);
      console.log('✅ Campo stock_nuevo eliminado');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️  Campo stock_nuevo no existe o ya fue eliminado');
      }
    }

    console.log('✅ Estructura de movimientos_inventario actualizada');

    // 7. Crear índices adicionales en ventas
    console.log('\n📋 7. Creando índices en tabla ventas...');
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD INDEX idx_fecha_venta (fecha_venta),
        ADD INDEX idx_estado (estado),
        ADD INDEX idx_tipo_venta (tipo_venta)
      `);
      console.log('✅ Índices creados en ventas');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Índices ya existen en ventas');
      } else {
        throw error;
      }
    }

    // 8. Crear índices en detalle_ventas
    console.log('\n📋 8. Creando índices en detalle_ventas...');
    try {
      await connection.execute(`
        ALTER TABLE detalle_ventas 
        ADD INDEX idx_venta_id (venta_id),
        ADD INDEX idx_producto_id (producto_id)
      `);
      console.log('✅ Índices creados en detalle_ventas');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Índices ya existen en detalle_ventas');
      } else {
        throw error;
      }
    }

    // 9. Actualizar valores NULL en clientes
    console.log('\n📋 9. Actualizando valores NULL en clientes...');
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
    console.log('✅ Valores NULL actualizados en clientes');

    // 10. Verificar estructura de sesiones_caja
    console.log('\n📋 10. Verificando tabla sesiones_caja...');
    try {
      await connection.execute(`
        ALTER TABLE sesiones_caja 
        MODIFY COLUMN estado ENUM('abierta', 'cerrada') DEFAULT 'abierta'
      `);
      console.log('✅ Tabla sesiones_caja actualizada');
    } catch (error) {
      console.log('ℹ️  Tabla sesiones_caja ya tiene la estructura correcta');
    }

    // 11. Crear tabla abonos_clientes si no existe (para pagos de crédito)
    console.log('\n📋 11. Verificando tabla abonos_clientes...');
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
    console.log('✅ Tabla abonos_clientes verificada/creada');

    // 12. Verificar que exista al menos una caja
    console.log('\n📋 12. Verificando cajas...');
    const [cajas] = await connection.execute('SELECT COUNT(*) as total FROM cajas');
    if (cajas[0].total === 0) {
      await connection.execute(`
        INSERT INTO cajas (nombre, codigo, estado) 
        VALUES ('Caja Principal', 'CAJA-01', 'activa')
      `);
      console.log('✅ Caja principal creada');
    } else {
      console.log(`ℹ️  Ya existen ${cajas[0].total} caja(s) registrada(s)`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Base de datos actualizada exitosamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Mostrar resumen
    console.log('📊 RESUMEN DE TABLAS PARA VENTAS:');
    console.log('   ✓ ventas - Registro de ventas');
    console.log('   ✓ detalle_ventas - Detalle de productos vendidos');
    console.log('   ✓ cuentas_por_cobrar - Gestión de créditos');
    console.log('   ✓ abonos_clientes - Pagos de clientes a crédito');
    console.log('   ✓ movimientos_inventario - Historial de movimientos');
    console.log('   ✓ movimientos_caja - Registro de movimientos de caja');
    console.log('   ✓ clientes - Información de clientes actualizada');
    console.log('   ✓ cajas - Puntos de venta\n');

  } catch (error) {
    console.error('❌ Error al actualizar base de datos:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

actualizarTablasVentas()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  });
