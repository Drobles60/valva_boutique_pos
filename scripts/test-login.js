const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function testLogin() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✓ Conectado');
    console.log('');

    // Buscar usuario
    const [users] = await connection.query(
      'SELECT id, username, email, nombre, apellido, rol, estado, password_hash FROM usuarios WHERE username = ?',
      ['admin']
    );

    if (users.length === 0) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    const user = users[0];
    console.log('Usuario encontrado:');
    console.log('  ID:', user.id);
    console.log('  Username:', user.username);
    console.log('  Email:', user.email);
    console.log('  Nombre:', user.nombre, user.apellido);
    console.log('  Rol:', user.rol);
    console.log('  Estado:', user.estado);
    console.log('  Hash (primeros 20 chars):', user.password_hash.substring(0, 20) + '...');
    console.log('');

    // Probar contraseña
    const testPassword = '1234';
    console.log('Probando contraseña "1234"...');
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    
    if (isValid) {
      console.log('✓ Contraseña válida');
    } else {
      console.log('❌ Contraseña inválida');
      
      // Crear nuevo hash
      console.log('');
      console.log('Generando nuevo hash...');
      const newHash = await bcrypt.hash('1234', 10);
      console.log('Nuevo hash:', newHash);
      
      await connection.query(
        'UPDATE usuarios SET password_hash = ? WHERE username = ?',
        [newHash, 'admin']
      );
      
      console.log('✓ Hash actualizado. Intenta hacer login nuevamente.');
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testLogin();
