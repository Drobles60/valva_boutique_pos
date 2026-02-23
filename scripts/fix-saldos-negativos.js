// Script para corregir saldos negativos en cuentas_por_cobrar
// Los saldos negativos fueron registrados incorrectamente
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function corregirSaldosNegativos() {
  let connection;
  
  try {
connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
// 1. Identificar facturas con saldo negativo
    
    const [facturasNegativas] = await connection.execute(
      `SELECT 
        cpc.id as cuenta_id,
        v.numero_venta,
        c.nombre as cliente,
        c.identificacion,
        cpc.monto_total,
        cpc.saldo_pendiente,
        cpc.estado,
        (SELECT COALESCE(SUM(a.monto), 0) FROM abonos a WHERE a.cuenta_por_cobrar_id = cpc.id) as total_abonado
      FROM cuentas_por_cobrar cpc
      INNER JOIN ventas v ON cpc.venta_id = v.id
      INNER JOIN clientes c ON cpc.cliente_id = c.id
      WHERE cpc.saldo_pendiente < 0
      ORDER BY c.nombre, v.numero_venta`
    );
    
    if (facturasNegativas.length === 0) {
return;
    }
    
let totalCorregir = 0;
    facturasNegativas.forEach((f, i) => {
totalCorregir += Math.abs(Number(f.saldo_pendiente));
    });
    
    
    // 2. Pedir confirmaciÃ³n
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 3. Corregir saldos negativos
const [resultSaldos] = await connection.execute(
      `UPDATE cuentas_por_cobrar
       SET saldo_pendiente = ABS(saldo_pendiente)
       WHERE saldo_pendiente < 0`
    );
    
// 4. Actualizar estado de facturas que ahora tienen saldo pendiente
    const [resultEstado] = await connection.execute(
      `UPDATE cuentas_por_cobrar
       SET estado = 'pendiente'
       WHERE saldo_pendiente > 0 AND estado = 'pagada'`
    );
    
    if (resultEstado.affectedRows > 0) {
}
    
    // 5. Recalcular saldos de clientes
const [resultClientes] = await connection.execute(
      `UPDATE clientes c
       SET saldo_pendiente = (
           SELECT COALESCE(SUM(cpc.saldo_pendiente), 0)
           FROM cuentas_por_cobrar cpc
           WHERE cpc.cliente_id = c.id
       )
       WHERE c.estado = 'activo'`
    );
    
// 6. Verificar el resultado
const [facturasCorregidas] = await connection.execute(
      `SELECT 
        cpc.id as cuenta_id,
        v.numero_venta,
        c.nombre as cliente,
        c.identificacion,
        cpc.monto_total,
        cpc.saldo_pendiente,
        cpc.estado,
        (SELECT COALESCE(SUM(a.monto), 0) FROM abonos a WHERE a.cuenta_por_cobrar_id = cpc.id) as total_abonado
      FROM cuentas_por_cobrar cpc
      INNER JOIN ventas v ON cpc.venta_id = v.id
      INNER JOIN clientes c ON cpc.cliente_id = c.id
      WHERE cpc.id IN (?)
      ORDER BY c.nombre, v.numero_venta`,
      [facturasNegativas.map(f => f.cuenta_id)]
    );
    
facturasCorregidas.forEach((f, i) => {
    });
    
    // 7. Verificar clientes "oscar"
const [clientesOscar] = await connection.execute(
      `SELECT 
        c.id,
        c.nombre,
        c.identificacion,
        c.saldo_pendiente,
        COUNT(cpc.id) as total_facturas,
        COUNT(CASE WHEN cpc.saldo_pendiente > 0 THEN 1 END) as facturas_pendientes,
        SUM(cpc.saldo_pendiente) as suma_saldos
      FROM clientes c
      LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      WHERE LOWER(c.nombre) LIKE '%oscar%'
      GROUP BY c.id, c.nombre, c.identificacion, c.saldo_pendiente
      ORDER BY c.identificacion`
    );
    
    clientesOscar.forEach(r => {
const discrepancia = Math.abs(Number(r.suma_saldos) - Number(r.saldo_pendiente));
      if (discrepancia > 0.01) {
} else {
}
    });
    
    
  } catch (error) {
    console.error('âŒ Error:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
}
  }
}

corregirSaldosNegativos();


