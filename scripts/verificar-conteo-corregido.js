// Verificar conteo correcto despuÃ©s de los cambios
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function verificarConteoCorregido() {
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
        COUNT(cpc.id) as total_facturas,
        COUNT(CASE WHEN cpc.saldo_pendiente > 0 THEN 1 END) as facturas_pendientes,
        COUNT(CASE WHEN cpc.saldo_pendiente = 0 THEN 1 END) as facturas_pagadas,
        COUNT(CASE WHEN cpc.saldo_pendiente < 0 THEN 1 END) as facturas_credito_favor
      FROM clientes c
      LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      WHERE LOWER(c.nombre) LIKE '%oscar%'
      GROUP BY c.id, c.nombre, c.identificacion
      ORDER BY c.identificacion`
    );
    
    result.forEach(r => {
});
    
    
  } finally {
    await connection.end();
  }
}

verificarConteoCorregido();


