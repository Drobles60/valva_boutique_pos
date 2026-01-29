const mysql = require('mysql2/promise');

async function activarProveedor() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luciana1510@',
    database: 'valva_boutique'
  });

  try {
    // Activar proveedor 3
    await connection.query('UPDATE proveedores SET estado = ? WHERE id = ?', ['activo', 3]);
    console.log('✅ Proveedor 3 reactivado correctamente');

    // Mostrar estado actual
    const [rows] = await connection.query('SELECT id, razon_social, estado FROM proveedores ORDER BY id');
    console.log('\n📋 Estado actual de proveedores:');
    console.table(rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

activarProveedor();
