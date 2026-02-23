// Script para recalcular y corregir saldos de clientes
// Ejecutar con: node scripts/fix-saldos-clientes.js

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function fixSaldosClientes() {
  let connection;
  
  try {
// Crear conexiÃ³n a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
// 1. Ver el estado actual
    
    const [clientesConError] = await connection.execute(
      `SELECT 
        c.id,
        c.nombre,
        c.identificacion,
        c.saldo_pendiente as saldo_actual,
        COALESCE(SUM(cpc.saldo_pendiente), 0) as saldo_calculado,
        (c.saldo_pendiente - COALESCE(SUM(cpc.saldo_pendiente), 0)) as diferencia
      FROM clientes c
      LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      WHERE c.estado = 'activo'
      GROUP BY c.id, c.nombre, c.identificacion, c.saldo_pendiente
      HAVING ABS(c.saldo_pendiente - COALESCE(SUM(cpc.saldo_pendiente), 0)) > 0.01
      ORDER BY ABS(diferencia) DESC`
    );
    
    if (clientesConError.length === 0) {
return;
    }
    
for (const cliente of clientesConError) {
}
    
    // 2. Pedir confirmaciÃ³n
await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 3. Actualizar los saldos
const [result] = await connection.execute(
      `UPDATE clientes c
       SET saldo_pendiente = (
           SELECT COALESCE(SUM(cpc.saldo_pendiente), 0)
           FROM cuentas_por_cobrar cpc
           WHERE cpc.cliente_id = c.id
       )
       WHERE c.estado = 'activo'`
    );
    
// 4. Verificar el resultado
    
    const [clientesAunConError] = await connection.execute(
      `SELECT 
        c.id,
        c.nombre,
        c.identificacion,
        c.saldo_pendiente as saldo_actual,
        COALESCE(SUM(cpc.saldo_pendiente), 0) as saldo_calculado,
        (c.saldo_pendiente - COALESCE(SUM(cpc.saldo_pendiente), 0)) as diferencia
      FROM clientes c
      LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      WHERE c.estado = 'activo'
      GROUP BY c.id, c.nombre, c.identificacion, c.saldo_pendiente
      HAVING ABS(c.saldo_pendiente - COALESCE(SUM(cpc.saldo_pendiente), 0)) > 0.01
      ORDER BY ABS(diferencia) DESC`
    );
    
    if (clientesAunConError.length === 0) {
} else {
for (const cliente of clientesAunConError) {
}
    }
    
    // 5. Mostrar resumen
    const [resumen] = await connection.execute(
      `SELECT 
        COUNT(*) as total_clientes_activos,
        SUM(saldo_pendiente) as total_saldo_pendiente,
        COUNT(CASE WHEN saldo_pendiente > 0 THEN 1 END) as clientes_con_deuda
      FROM clientes
      WHERE estado = 'activo'`
    );
    
    const stats = resumen[0];
    
  } catch (error) {
    console.error('âŒ Error:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
}
  }
}

fixSaldosClientes();


