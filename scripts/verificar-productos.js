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

    console.log('✓ Conexión exitosa\n');

    // Verificar cuántos productos hay
    const [count] = await connection.query('SELECT COUNT(*) as total FROM productos');
    console.log('Total de productos en la BD:', count[0].total);

    if (count[0].total > 0) {
      // Mostrar los primeros 10 productos con sus IDs
      const [productos] = await connection.query(`
        SELECT id, sku, nombre, codigo_barras
        FROM productos
        LIMIT 10
      `);
      
      console.log('\nPrimeros 10 productos:');
      productos.forEach(p => {
        console.log(`  ID: ${p.id} | SKU: ${p.sku || 'N/A'} | Nombre: ${p.nombre} | Código: ${p.codigo_barras || 'N/A'}`);
      });
    } else {
      console.log('\n⚠ No hay productos registrados en la base de datos');
      console.log('Debes registrar productos primero antes de crear descuentos');
    }

    await connection.end();
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
  }
}

verificarProductos();
