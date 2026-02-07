const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function updateDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique',
    multipleStatements: true
  });

  try {
    console.log('🔄 Actualizando tabla ventas...');

    // Verificar y agregar campo tipo_venta
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD COLUMN tipo_venta ENUM('contado', 'credito') DEFAULT 'contado' 
        AFTER estado
      `);
      console.log('✅ Campo tipo_venta agregado');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Campo tipo_venta ya existe');
      } else {
        throw error;
      }
    }

    // Verificar y agregar campo metodo_pago
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD COLUMN metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'mixto') DEFAULT 'efectivo' 
        AFTER tipo_venta
      `);
      console.log('✅ Campo metodo_pago agregado');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Campo metodo_pago ya existe');
      } else {
        throw error;
      }
    }

    // Modificar campo estado
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        MODIFY COLUMN estado ENUM('completada', 'credito', 'anulada') DEFAULT 'completada'
      `);
      console.log('✅ Campo estado actualizado');
    } catch (error) {
      console.log('ℹ️  Campo estado ya está actualizado');
    }

    // Agregar índice único a numero_venta
    try {
      await connection.execute(`
        ALTER TABLE ventas 
        ADD UNIQUE INDEX idx_numero_venta (numero_venta)
      `);
      console.log('✅ Índice único agregado a numero_venta');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Índice único ya existe en numero_venta');
      } else {
        throw error;
      }
    }

    // Actualizar registros existentes
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

    console.log('✅ Registros existentes actualizados');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Tabla ventas actualizada exitosamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error al actualizar base de datos:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

updateDatabase()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  });
