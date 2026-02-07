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
    console.log('🔑 Creando usuario vendedor...');

    // Datos del vendedor
    const username = 'vendedor1';
    const password = '1234';  // Contraseña simple para pruebas
    const email = 'vendedor1@valvaboutique.com';
    const nombre = 'Vendedor';
    const apellido = 'Uno';
    const telefono = '0987654321';

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar si el usuario ya existe
    const [existingUser] = await connection.execute(
      'SELECT id FROM usuarios WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      console.log('⚠️  El usuario vendedor1 ya existe');
      console.log('🗑️  Eliminando usuario existente...');
      await connection.execute('DELETE FROM usuarios WHERE username = ?', [username]);
    }

    // Insertar el nuevo usuario vendedor
    const [result] = await connection.execute(
      `INSERT INTO usuarios (username, email, password_hash, nombre, apellido, telefono, rol, estado) 
       VALUES (?, ?, ?, ?, ?, ?, 'vendedor', 'activo')`,
      [username, email, hashedPassword, nombre, apellido, telefono]
    );

    console.log('✅ Usuario vendedor creado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 CREDENCIALES DE ACCESO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Usuario:     ${username}`);
    console.log(`   Contraseña:  ${password}`);
    console.log(`   Rol:         vendedor`);
    console.log(`   Estado:      activo`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🔐 PERMISOS DEL VENDEDOR:');
    console.log('   ✓ Abrir/Cerrar Caja');
    console.log('   ✓ Realizar Ventas');
    console.log('   ✓ Ver Clientes');
    console.log('   ✗ No puede acceder a otras secciones');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error al crear usuario vendedor:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Ejecutar la función
createVendedor()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  });
