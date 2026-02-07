// Script para aplicar actualizaciones de sistema de pagos y créditos
// Ejecutar con: node scripts/actualizar-sistema-pagos.js

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
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
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Conexión exitosa\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'update-sistema-pagos-creditos.sql');
    console.log('📖 Leyendo script SQL:', sqlPath);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`No se encontró el archivo: ${sqlPath}`);
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

    console.log(`📝 Ejecutando ${comandos.length} comandos SQL...\n`);

    let exitosos = 0;
    let errores = 0;

    for (let i = 0; i < comandos.length; i++) {
      const comando = comandos[i];
      
      // Saltar comentarios y comandos vacíos
      if (!comando || comando.startsWith('--')) continue;

      try {
        // Mostrar progreso
        const preview = comando.substring(0, 60).replace(/\n/g, ' ');
        console.log(`[${i + 1}/${comandos.length}] Ejecutando: ${preview}...`);
        
        await connection.query(comando);
        exitosos++;
        console.log('   ✅ Exitoso\n');
      } catch (error) {
        errores++;
        // Algunos errores son esperados (como cuando una columna ya existe)
        if (error.code === 'ER_DUP_FIELDNAME' || 
            error.code === 'ER_DUP_KEYNAME' ||
            error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('   ℹ️  Ya existe (omitido)\n');
          exitosos++;
        } else {
          console.error('   ❌ Error:', error.message);
          console.error('   Comando:', comando.substring(0, 100), '\n');
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE ACTUALIZACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Comandos exitosos: ${exitosos}`);
    console.log(`❌ Comandos con error: ${errores}`);
    console.log('='.repeat(60) + '\n');

    // Verificar cambios
    console.log('🔍 Verificando cambios aplicados...\n');

    // Verificar columnas en ventas
    const [ventasColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'ventas'
        AND COLUMN_NAME IN ('metodo_pago', 'efectivo_recibido', 'cambio')
    `);

    console.log('📋 Tabla VENTAS:');
    ventasColumns.forEach(col => {
      console.log(`   ✓ ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}`);
    });

    // Verificar columnas en abonos
    const [abonosColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'abonos'
        AND COLUMN_NAME = 'metodo_pago'
    `);

    console.log('\n📋 Tabla ABONOS:');
    abonosColumns.forEach(col => {
      console.log(`   ✓ ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}`);
    });

    // Verificar tablas nuevas
    const [pagosMixtos] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('pagos_mixtos_ventas', 'pagos_mixtos_abonos')
    `);

    console.log('\n📋 Tablas de Pagos Mixtos:');
    if (pagosMixtos.length > 0) {
      pagosMixtos.forEach(table => {
        console.log(`   ✓ ${table.TABLE_NAME}`);
      });
    } else {
      console.log('   ⚠️  No se encontraron las tablas de pagos mixtos');
    }

    console.log('\n✅ Actualización completada exitosamente!');
    console.log('💡 Ahora puedes reiniciar tu aplicación para usar las nuevas funcionalidades.');
    console.log('\n📝 IMPORTANTE: El trigger de saldos debe ejecutarse por separado');
    console.log('   Si usas DBeaver:');
    console.log('   - Abre: database/trigger-saldo-cliente-dbeaver.sql');
    console.log('   - Ejecuta cada paso por separado (SIN usar DELIMITER)');
    console.log('   ');
    console.log('   Si usas otro cliente SQL:');
    console.log('   - Lee: database/INSTRUCCIONES-TRIGGER.md');
    console.log('   ');
    console.log('   Desde línea de comandos:');
    console.log('   - mysql -u root -p valva_boutique < database/trigger-saldo-cliente.sql\n');

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:');
    console.error(error.message);
    console.error('\n💡 Verifica:');
    console.error('   - Que la base de datos esté corriendo');
    console.error('   - Que las credenciales sean correctas');
    console.error('   - Que tengas permisos suficientes\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar
console.log('\n' + '='.repeat(60));
console.log('🚀 ACTUALIZACIÓN DE SISTEMA DE PAGOS Y CRÉDITOS');
console.log('='.repeat(60) + '\n');

aplicarActualizaciones();
