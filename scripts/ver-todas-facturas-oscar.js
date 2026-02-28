// Ver TODAS las facturas de oscar sin filtros
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function verTodasFacturas() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  try {
const [facturas] = await connection.execute(
      `SELECT 
        c.id as cliente_id,
        c.nombre,
        c.identificacion,
        v.numero_venta,
        v.total as venta_total,
        cpc.id as cuenta_id,
        cpc.monto_total,
        cpc.saldo_pendiente,
        cpc.estado,
        cpc.fecha_vencimiento,
        cpc.created_at,
        COALESCE(SUM(a.monto), 0) as total_abonado
      FROM clientes c
      LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      LEFT JOIN ventas v ON cpc.venta_id = v.id
      LEFT JOIN abonos a ON a.cuenta_por_cobrar_id = cpc.id
      WHERE LOWER(c.nombre) LIKE '%oscar%'
      GROUP BY c.id, c.nombre, c.identificacion, v.numero_venta, v.total, cpc.id, 
               cpc.monto_total, cpc.saldo_pendiente, cpc.estado, cpc.fecha_vencimiento, cpc.created_at
      ORDER BY c.identificacion, v.numero_venta DESC`
    );
    
    let currentCliente = null;
    let facturasConSaldo = 0;
    
    facturas.forEach(f => {
      if (currentCliente !== f.identificacion) {
        if (currentCliente !== null) {
}
        currentCliente = f.identificacion;
        facturasConSaldo = 0;
}
      
      if (f.numero_venta) {
        
        if (Number(f.saldo_pendiente) > 0) {
          facturasConSaldo++;
        }
      }
    });
    
    if (currentCliente !== null) {
}
    
    // Resumen por cliente
const [resumen] = await connection.execute(
      `SELECT 
        c.id,
        c.nombre,
        c.identificacion,
        c.saldo_pendiente,
        COUNT(cpc.id) as total_facturas,
        COUNT(CASE WHEN cpc.saldo_pendiente > 0 THEN 1 END) as facturas_con_saldo,
        SUM(cpc.saldo_pendiente) as suma_saldos
      FROM clientes c
      LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      WHERE LOWER(c.nombre) LIKE '%oscar%'
      GROUP BY c.id, c.nombre, c.identificacion, c.saldo_pendiente
      ORDER BY c.identificacion`
    );
    
    resumen.forEach(r => {
});
    
} finally {
    await connection.end();
  }
}

verTodasFacturas();


