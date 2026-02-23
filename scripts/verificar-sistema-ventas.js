const mysql = require('mysql2/promise');

async function verificarSistema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique'
  });

  try {

    // Verificar tabla ventas
    const [ventasColumns] = await connection.query(`
      SHOW COLUMNS FROM ventas WHERE Field IN ('tipo_venta', 'metodo_pago')
    `);
    
if (ventasColumns.length >= 2) {
} else {
}

    // Verificar productos
    const [productos] = await connection.query('SELECT COUNT(*) as total FROM productos');
// Verificar clientes
    const [clientes] = await connection.query('SELECT COUNT(*) as total FROM clientes');
// Verificar cajas
    const [cajas] = await connection.query("SELECT COUNT(*) as total FROM cajas WHERE estado = 'activa'");
if (cajas[0].total === 0) {
await connection.execute(`
        INSERT INTO cajas (nombre, codigo, estado) 
        VALUES ('Caja Principal', 'CAJA-01', 'activa')
      `);
}

    // Verificar usuarios
    const [usuarios] = await connection.query("SELECT COUNT(*) as total FROM usuarios WHERE estado = 'activo'");

  } catch (error) {
    console.error('âŒ Error en verificaciÃ³n:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

verificarSistema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('âŒ Error:', error);
    process.exit(1);
  });


