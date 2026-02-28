// Script para verificar facturas pendientes directamente en la base de datos
// Ejecutar con: node scripts/verificar-facturas-oscar.js

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function verificarFacturas() {
  let connection;
  
  try {
    // Crear conexiÃ³n a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
// 1. Obtener todos los clientes llamados "oscar"
const [clientes] = await connection.execute(
      `SELECT id, nombre, identificacion, telefono, saldo_pendiente, estado
       FROM clientes 
       WHERE LOWER(nombre) LIKE '%oscar%'
       ORDER BY id`
    );
    
for (const cliente of clientes) {
// 2. Obtener todas las facturas de este cliente
      const [todasFacturas] = await connection.execute(
        `SELECT 
          cpc.id,
          cpc.venta_id,
          v.numero_venta,
          cpc.monto_total,
          cpc.saldo_pendiente,
          cpc.estado,
          cpc.fecha_vencimiento,
          cpc.created_at
         FROM cuentas_por_cobrar cpc
         LEFT JOIN ventas v ON cpc.venta_id = v.id
         WHERE cpc.cliente_id = ?
         ORDER BY cpc.created_at ASC`,
        [cliente.id]
      );
      
// Contar por estado
      const facturasConSaldo = todasFacturas.filter(f => Number(f.saldo_pendiente) > 0);
      const facturasPendientes = todasFacturas.filter(f => f.estado === 'pendiente');
      const facturasVencidas = todasFacturas.filter(f => f.estado === 'vencida');
      const facturasPagadas = todasFacturas.filter(f => f.estado === 'pagada');
      
      
      // Mostrar cada factura con saldo pendiente
      if (facturasConSaldo.length > 0) {
        
        for (const factura of facturasConSaldo) {
// Obtener abonos de esta factura
          const [abonos] = await connection.execute(
            `SELECT id, monto, fecha_abono, metodo_pago
             FROM abonos
             WHERE cuenta_por_cobrar_id = ?
             ORDER BY fecha_abono DESC`,
            [factura.id]
          );
          
          if (abonos.length > 0) {
            const totalAbonado = abonos.reduce((sum, a) => sum + Number(a.monto), 0);
} else {
}
}
      }
      
      // Verificar suma de saldos
      const sumaSaldos = facturasConSaldo.reduce((sum, f) => sum + Number(f.saldo_pendiente), 0);
      
      if (Math.abs(sumaSaldos - Number(cliente.saldo_pendiente)) > 0.01) {
} else {
}
      
}
    
    // 3. Mostrar quÃ© devolverÃ­a la query del API
const [resultadoAPI] = await connection.execute(
      `SELECT 
        c.id,
        c.nombre,
        c.identificacion,
        c.telefono,
        c.saldo_pendiente,
        COUNT(DISTINCT cpc.id) as total_cuentas,
        COUNT(DISTINCT CASE WHEN cpc.saldo_pendiente > 0 THEN cpc.id END) as cuentas_pendientes,
        COUNT(DISTINCT CASE WHEN cpc.estado = 'vencida' AND cpc.saldo_pendiente > 0 THEN cpc.id END) as cuentas_vencidas
      FROM clientes c
      INNER JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      WHERE c.estado = 'activo' 
        AND LOWER(c.nombre) LIKE '%oscar%'
        AND cpc.saldo_pendiente > 0
      GROUP BY c.id, c.nombre, c.identificacion, c.telefono, c.saldo_pendiente
      ORDER BY c.id`
    );
    
resultadoAPI.forEach((cliente, i) => {
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

verificarFacturas();


