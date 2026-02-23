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

// Verificar si existe la base de datos
    const [databases] = await connection.query('SHOW DATABASES');

    // Verificar tablas en valva_boutique
    const [tables] = await connection.query('SHOW TABLES');

    // Verificar si existe la tabla descuentos
    const [descuentosTable] = await connection.query("SHOW TABLES LIKE 'descuentos'");
    
    if (descuentosTable.length > 0) {
// Verificar estructura de la tabla
      const [columns] = await connection.query('DESCRIBE descuentos');
columns.forEach(col => {
});
    } else {
    }

    // Verificar tabla descuento_productos
    const [descuentoProductosTable] = await connection.query("SHOW TABLES LIKE 'descuento_productos'");
// Verificar tabla descuento_tipos_prenda
    const [descuentoTiposPrendaTable] = await connection.query("SHOW TABLES LIKE 'descuento_tipos_prenda'");
await connection.end();
    
  } catch (error) {
    console.error('\nâœ— Error:', error.message);
    console.error('CÃ³digo:', error.code);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
    }
  }
}

verificarTablas();


