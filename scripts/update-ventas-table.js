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
// Verificar y agregar campo tipo_venta
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

    // Verificar y agregar campo metodo_pago
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

    // Modificar campo estado
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

} catch (error) {
    console.error('âŒ Error al actualizar base de datos:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

updateDatabase()
  .then(() => {
process.exit(0);
  })
  .catch((error) => {
    console.error('âŒ Error en el script:', error);
    process.exit(1);
  });


