const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function testLogin() {
  let connection;
  
  try {
connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });


    // Buscar usuario
    const [users] = await connection.query(
      'SELECT id, username, email, nombre, apellido, rol, estado, password_hash FROM usuarios WHERE username = ?',
      ['admin']
    );

    if (users.length === 0) {
return;
    }

    const user = users[0];
// Probar contraseÃ±a
    const testPassword = '1234';
const isValid = await bcrypt.compare(testPassword, user.password_hash);
    
    if (isValid) {
} else {
// Crear nuevo hash
      const newHash = await bcrypt.hash('1234', 10);
await connection.query(
        'UPDATE usuarios SET password_hash = ? WHERE username = ?',
        [newHash, 'admin']
      );
      
}

  } catch (error) {
    console.error('âŒ ERROR:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testLogin();


