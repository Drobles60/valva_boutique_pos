// Script para crear un usuario vendedor
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createVendedor() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique'
  });

  try {
// Datos del vendedor
    const username = 'vendedor1';
    const password = '1234';  // ContraseÃ±a simple para pruebas
    const email = 'vendedor1@valvaboutique.com';
    const nombre = 'Vendedor';
    const apellido = 'Uno';
    const telefono = '0987654321';

    // Hashear la contraseÃ±a
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar si el usuario ya existe
    const [existingUser] = await connection.execute(
      'SELECT id FROM usuarios WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      await connection.execute('DELETE FROM usuarios WHERE username = ?', [username]);
    }

    // Insertar el nuevo usuario vendedor
    const [result] = await connection.execute(
      `INSERT INTO usuarios (username, email, password_hash, nombre, apellido, telefono, rol, estado) 
       VALUES (?, ?, ?, ?, ?, ?, 'vendedor', 'activo')`,
      [username, email, hashedPassword, nombre, apellido, telefono]
    );


  } catch (error) {
    console.error('âŒ Error al crear usuario vendedor:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Ejecutar la funciÃ³n
createVendedor()
  .then(() => {
process.exit(0);
  })
  .catch((error) => {
    console.error('âŒ Error en el script:', error);
    process.exit(1);
  });


