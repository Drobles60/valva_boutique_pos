const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Luciana1510@',
      database: process.env.DB_NAME || 'valva_boutique'
    });

// Verificar que existan las tablas principales
const [tables] = await connection.execute('SHOW TABLES');
    
    const expectedTables = [
      'usuarios', 'cajas', 'productos', 'clientes', 
      'ventas', 'sesiones_caja', 'categorias'
    ];
    
    const existingTables = tables.map(t => Object.values(t)[0]);
    
const missingTables = expectedTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
    } else {
}
    
    // Verificar usuario admin
const [users] = await connection.execute(
      'SELECT id, username, email, rol FROM usuarios WHERE username = ?',
      ['admin']
    );
    
    if (users.length > 0) {
    } else {
    }
    
    await connection.end();
} catch (error) {
    console.error('\nâŒ Error de conexiÃ³n:', error.message);
    console.error('\nðŸ’¡ Verifica que:');
    console.error('   1. MySQL estÃ© corriendo');
    console.error('   2. Las credenciales en .env.local sean correctas');
    console.error('   3. La base de datos exista');
    console.error('\nðŸ”§ Para crear la base de datos ejecuta:');
    console.error('   mysql -u root -p < database/schema.sql');
    console.error('   mysql -u root -p < database/seed.sql');
    process.exit(1);
  }
}

testConnection();


