const mysql = require('mysql2/promise');

async function verificarTablas() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Luciana1510@',
      database: 'valva_boutique'
    });

    console.log('✓ Conexión exitosa a la base de datos');

    // Verificar si existe la base de datos
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('\nBases de datos disponibles:');
    databases.forEach(db => console.log(' -', Object.values(db)[0]));

    // Verificar tablas en valva_boutique
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\nTablas en valva_boutique:');
    tables.forEach(table => console.log(' -', Object.values(table)[0]));

    // Verificar si existe la tabla descuentos
    const [descuentosTable] = await connection.query("SHOW TABLES LIKE 'descuentos'");
    
    if (descuentosTable.length > 0) {
      console.log('\n✓ Tabla descuentos existe');
      
      // Verificar estructura de la tabla
      const [columns] = await connection.query('DESCRIBE descuentos');
      console.log('\nEstructura de la tabla descuentos:');
      columns.forEach(col => {
        console.log(` - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('\n✗ Tabla descuentos NO existe');
      console.log('\nDebes ejecutar el archivo schema.sql para crear las tablas');
    }

    // Verificar tabla descuento_productos
    const [descuentoProductosTable] = await connection.query("SHOW TABLES LIKE 'descuento_productos'");
    console.log(`\n${descuentoProductosTable.length > 0 ? '✓' : '✗'} Tabla descuento_productos ${descuentoProductosTable.length > 0 ? 'existe' : 'NO existe'}`);

    // Verificar tabla descuento_tipos_prenda
    const [descuentoTiposPrendaTable] = await connection.query("SHOW TABLES LIKE 'descuento_tipos_prenda'");
    console.log(`${descuentoTiposPrendaTable.length > 0 ? '✓' : '✗'} Tabla descuento_tipos_prenda ${descuentoTiposPrendaTable.length > 0 ? 'existe' : 'NO existe'}`);

    await connection.end();
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('Código:', error.code);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n⚠ La base de datos "valva_boutique" no existe.');
      console.log('Debes crearla ejecutando el schema.sql');
    }
  }
}

verificarTablas();
