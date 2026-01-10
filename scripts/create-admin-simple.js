const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✓ Conectado a la base de datos');

    // Verificar si existe la tabla usuarios
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'usuarios'"
    );

    if (tables.length === 0) {
      console.log('');
      console.log('❌ ERROR: La tabla "usuarios" no existe.');
      console.log('');
      console.log('Debes ejecutar primero el script de la base de datos:');
      console.log('1. Abre MySQL Workbench o la consola de MySQL');
      console.log('2. Ejecuta el archivo: database/schema.sql');
      console.log('3. Luego ejecuta este script nuevamente');
      console.log('');
      process.exit(1);
    }

    // Hash de la contraseña "1234"
    const passwordHash = await bcrypt.hash('1234', 10);

    // Verificar si ya existe el usuario admin
    const [existingUser] = await connection.query(
      'SELECT id FROM usuarios WHERE username = ?',
      ['admin']
    );

    if (existingUser.length > 0) {
      console.log('⚠️  El usuario admin ya existe. Actualizando contraseña...');
      
      await connection.query(
        'UPDATE usuarios SET password_hash = ?, estado = ?, rol = ? WHERE username = ?',
        [passwordHash, 'activo', 'administrador', 'admin']
      );
      
      console.log('✓ Usuario admin actualizado exitosamente');
    } else {
      console.log('Creando usuario admin...');
      
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
      
      console.log('✓ Usuario admin creado exitosamente');
    }

    console.log('');
    console.log('==========================================');
    console.log('   CREDENCIALES DE ACCESO');
    console.log('==========================================');
    console.log('  Usuario:    admin');
    console.log('  Contraseña: 1234');
    console.log('  URL:        http://localhost:3000/login');
    console.log('==========================================');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('La base de datos "' + process.env.DB_NAME + '" no existe.');
      console.log('');
      console.log('Para crearla, ejecuta estos comandos en MySQL:');
      console.log('');
      console.log('  CREATE DATABASE ' + process.env.DB_NAME + ';');
      console.log('  USE ' + process.env.DB_NAME + ';');
      console.log('  SOURCE database/schema.sql;');
      console.log('');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('No se pudo conectar a MySQL.');
      console.log('Asegúrate de que MySQL esté corriendo.');
      console.log('');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('Credenciales de base de datos incorrectas.');
      console.log('Verifica tu archivo .env.local');
      console.log('');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdminUser();
