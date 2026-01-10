const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
  console.log('🔄 Conectando a la base de datos...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique'
  });

  console.log('✅ Conexión establecida');

  const password = 'Admin123!';
  console.log('🔐 Generando hash de contraseña...');
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('💾 Actualizando usuario admin...');
  const [result] = await connection.execute(
    'UPDATE usuarios SET password_hash = ? WHERE username = ?',
    [hashedPassword, 'admin']
  );

  if (result.affectedRows > 0) {
    console.log('\n✅ Usuario admin creado exitosamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@valvaboutique.com');
    console.log('👤 Username: admin');
    console.log('🔑 Password: Admin123!');
    console.log('👑 Rol:      Administrador');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');
  } else {
    console.log('\n❌ No se encontró el usuario admin en la base de datos');
    console.log('💡 Asegúrate de haber ejecutado database/seed.sql primero');
  }
  
  await connection.end();
  console.log('\n🔌 Conexión cerrada');
}

createAdmin().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.error('\n💡 Verifica que:');
  console.error('   1. MySQL esté corriendo');
  console.error('   2. Las credenciales en .env.local sean correctas');
  console.error('   3. La base de datos exista (ejecuta database/schema.sql y database/seed.sql)');
  process.exit(1);
});
