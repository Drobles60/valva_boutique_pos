const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔄 Probando conexión a MySQL...\n');
  
  console.log('📋 Configuración:');
  console.log(`   Host:     ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Port:     ${process.env.DB_PORT || '3306'}`);
  console.log(`   User:     ${process.env.DB_USER || 'root'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'valva_boutique_pos'}`);
  console.log('');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Luciana1510@',
      database: process.env.DB_NAME || 'valva_boutique'
    });

    console.log('✅ Conexión exitosa!');
    
    // Verificar que existan las tablas principales
    console.log('\n🔍 Verificando estructura de la base de datos...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    const expectedTables = [
      'usuarios', 'cajas', 'productos', 'clientes', 
      'ventas', 'sesiones_caja', 'categorias'
    ];
    
    const existingTables = tables.map(t => Object.values(t)[0]);
    
    console.log(`\n📊 Tablas encontradas: ${existingTables.length}`);
    
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Tablas faltantes:', missingTables.join(', '));
      console.log('💡 Ejecuta: mysql -u root -p < database/schema.sql');
    } else {
      console.log('✅ Todas las tablas principales existen');
    }
    
    // Verificar usuario admin
    console.log('\n🔍 Verificando usuario admin...');
    const [users] = await connection.execute(
      'SELECT id, username, email, rol FROM usuarios WHERE username = ?',
      ['admin']
    );
    
    if (users.length > 0) {
      console.log('✅ Usuario admin encontrado');
      console.log(`   ID:    ${users[0].id}`);
      console.log(`   Email: ${users[0].email}`);
      console.log(`   Rol:   ${users[0].rol}`);
    } else {
      console.log('⚠️  Usuario admin NO encontrado');
      console.log('💡 Ejecuta: mysql -u root -p < database/seed.sql');
    }
    
    await connection.end();
    console.log('\n🎉 Todo listo para usar!');
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    console.error('\n💡 Verifica que:');
    console.error('   1. MySQL esté corriendo');
    console.error('   2. Las credenciales en .env.local sean correctas');
    console.error('   3. La base de datos exista');
    console.error('\n🔧 Para crear la base de datos ejecuta:');
    console.error('   mysql -u root -p < database/schema.sql');
    console.error('   mysql -u root -p < database/seed.sql');
    process.exit(1);
  }
}

testConnection();
