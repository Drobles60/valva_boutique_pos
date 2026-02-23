// Verificar discrepancias de saldos
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function verificarDiscrepancias() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  try {
    const [result] = await connection.execute(
      `SELECT 
        c.id,
        c.nombre,
        c.identificacion,
        c.saldo_pendiente as saldo_tabla,
        COALESCE(SUM(cpc.saldo_pendiente), 0) as saldo_calculado,
        (c.saldo_pendiente - COALESCE(SUM(cpc.saldo_pendiente), 0)) as diferencia,
        COUNT(cpc.id) as facturas_totales,
        COUNT(CASE WHEN cpc.saldo_pendiente > 0 THEN 1 END) as facturas_con_saldo
      FROM clientes c
      LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      WHERE LOWER(c.nombre) LIKE '%oscar%'
      GROUP BY c.id, c.nombre, c.identificacion, c.saldo_pendiente
      ORDER BY c.id`
    );
    
result.forEach(r => {
    });
    
  } finally {
    await connection.end();
  }
}

verificarDiscrepancias();


