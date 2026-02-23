const mysql = require('mysql2/promise');

async function verificarProductos() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Luciana1510@',
      database: 'valva_boutique'
    });

// Verificar cuÃ¡ntos productos hay
    const [count] = await connection.query('SELECT COUNT(*) as total FROM productos');
if (count[0].total > 0) {
      // Mostrar los primeros 10 productos con sus IDs
      const [productos] = await connection.query(`
        SELECT id, sku, nombre, codigo_barras
        FROM productos
        LIMIT 10
      `);
      
productos.forEach(p => {
});
    } else {
    }

    await connection.end();
    
  } catch (error) {
    console.error('\nâœ— Error:', error.message);
  }
}

verificarProductos();


