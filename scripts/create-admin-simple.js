const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  let connection;
  
  try {
connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

// Verificar si existe la tabla usuarios
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'usuarios'"
    );

    if (tables.length === 0) {
      process.exit(1);
    }

    // Hash de la contraseÃ±a "1234"
    const passwordHash = await bcrypt.hash('1234', 10);

    // Verificar si ya existe el usuario admin
    const [existingUser] = await connection.query(
      'SELECT id FROM usuarios WHERE username = ?',
      ['admin']
    );

    if (existingUser.length > 0) {
await connection.query(
        'UPDATE usuarios SET password_hash = ?, estado = ?, rol = ? WHERE username = ?',
        [passwordHash, 'activo', 'administrador', 'admin']
      );
      
} else {
await connection.query(
        `INSERT INTO usuarios (
          username, 
          password_hash, 
          email, 
          nombre, 
          apellido, 
          rol, 
          estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'admin',
          passwordHash,
          'admin@valbvaboutique.com',
          'Administrador',
          'Sistema',
          'administrador',
          'activo'
        ]
      );
      
}

} catch (error) {
    console.error('');
    console.error('âŒ ERROR:', error.message);
    console.error('');
    
    if (error.code === 'ER_BAD_DB_ERROR') {
    } else if (error.code === 'ECONNREFUSED') {
} else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
}
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdminUser();


