const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique'
  });

const password = 'Admin123!';
const hashedPassword = await bcrypt.hash(password, 10);

const [result] = await connection.execute(
    'UPDATE usuarios SET password_hash = ? WHERE username = ?',
    [hashedPassword, 'admin']
  );

  if (result.affectedRows > 0) {
  } else {
  }
  
  await connection.end();
}

createAdmin().catch(error => {
  console.error('\nâŒ Error:', error.message);
  console.error('\nðŸ’¡ Verifica que:');
  console.error('   1. MySQL estÃ© corriendo');
  console.error('   2. Las credenciales en .env.local sean correctas');
  console.error('   3. La base de datos exista (ejecuta database/schema.sql y database/seed.sql)');
  process.exit(1);
});


