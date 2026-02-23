// Script para aplicar actualizaciones de sistema de pagos y crÃ©ditos
// Ejecutar con: node scripts/actualizar-sistema-pagos.js

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// ConfiguraciÃ³n de la base de datos
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'valva_boutique',
  multipleStatements: true
};

async function aplicarActualizaciones() {
  let connection;

  try {
connection = await mysql.createConnection(DB_CONFIG);
// Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'update-sistema-pagos-creditos.sql');
if (!fs.existsSync(sqlPath)) {
      throw new Error(`No se encontrÃ³ el archivo: ${sqlPath}`);
    }

    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el script en comandos individuales
    const comandos = sqlScript
      .split(/;\s*$$/m)
      .map(cmd => cmd.trim())
      .filter(cmd => 
        cmd.length > 0 && 
        !cmd.startsWith('--') && 
        !cmd.match(/^\/\*/) &&
        !cmd.match(/DELIMITER/)
      );

let exitosos = 0;
    let errores = 0;

    for (let i = 0; i < comandos.length; i++) {
      const comando = comandos[i];
      
      // Saltar comentarios y comandos vacÃ­os
      if (!comando || comando.startsWith('--')) continue;

      try {
        // Mostrar progreso
        const preview = comando.substring(0, 60).replace(/\n/g, ' ');
await connection.query(comando);
        exitosos++;
} catch (error) {
        errores++;
        // Algunos errores son esperados (como cuando una columna ya existe)
        if (error.code === 'ER_DUP_FIELDNAME' || 
            error.code === 'ER_DUP_KEYNAME' ||
            error.code === 'ER_TABLE_EXISTS_ERROR') {
exitosos++;
        } else {
          console.error('   âŒ Error:', error.message);
          console.error('   Comando:', comando.substring(0, 100), '\n');
        }
      }
    }


    // Verificar cambios
// Verificar columnas en ventas
    const [ventasColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'ventas'
        AND COLUMN_NAME IN ('metodo_pago', 'efectivo_recibido', 'cambio')
    `);

ventasColumns.forEach(col => {
});

    // Verificar columnas en abonos
    const [abonosColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'abonos'
        AND COLUMN_NAME = 'metodo_pago'
    `);

abonosColumns.forEach(col => {
});

    // Verificar tablas nuevas
    const [pagosMixtos] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('pagos_mixtos_ventas', 'pagos_mixtos_abonos')
    `);

if (pagosMixtos.length > 0) {
      pagosMixtos.forEach(table => {
});
    } else {
}


  } catch (error) {
    console.error('\nâŒ ERROR CRÃTICO:');
    console.error(error.message);
    console.error('\nðŸ’¡ Verifica:');
    console.error('   - Que la base de datos estÃ© corriendo');
    console.error('   - Que las credenciales sean correctas');
    console.error('   - Que tengas permisos suficientes\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
}
  }
}

// Ejecutar
aplicarActualizaciones();


