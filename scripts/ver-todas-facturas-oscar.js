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
    console.log('\n📋 TODAS LAS FACTURAS DE CLIENTES "OSCAR":\n');
    
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
          console.log(`  → Facturas con saldo > 0: ${facturasConSaldo}\n`);
        }
        currentCliente = f.identificacion;
        facturasConSaldo = 0;
        console.log('='.repeat(100));
        console.log(`Cliente: ${f.nombre} | ID: ${f.identificacion}`);
        console.log('='.repeat(100));
      }
      
      if (f.numero_venta) {
        console.log(`\nFactura: #${f.numero_venta} (Cuenta ID: ${f.cuenta_id})`);
        console.log(`  Monto Total:       $${Number(f.monto_total).toLocaleString('es-CO')}`);
        console.log(`  Total Abonado:     $${Number(f.total_abonado).toLocaleString('es-CO')}`);
        console.log(`  Saldo Pendiente:   $${Number(f.saldo_pendiente).toLocaleString('es-CO')}`);
        console.log(`  Estado:            ${f.estado}`);
        console.log(`  Vencimiento:       ${new Date(f.fecha_vencimiento).toLocaleDateString('es-CO')}`);
        
        if (Number(f.saldo_pendiente) > 0) {
          facturasConSaldo++;
        }
      }
    });
    
    if (currentCliente !== null) {
      console.log(`  → Facturas con saldo > 0: ${facturasConSaldo}\n`);
    }
    
    // Resumen por cliente
    console.log('\n' + '='.repeat(100));
    console.log('📊 RESUMEN POR CLIENTE:');
    console.log('='.repeat(100));
    
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
      console.log(`\n${r.nombre} (${r.identificacion})`);
      console.log(`  Total facturas:        ${r.total_facturas}`);
      console.log(`  Facturas con saldo:    ${r.facturas_con_saldo}`);
      console.log(`  Suma saldos facturas:  $${Number(r.suma_saldos).toLocaleString('es-CO')}`);
      console.log(`  Saldo en tabla:        $${Number(r.saldo_pendiente).toLocaleString('es-CO')}`);
    });
    
    console.log('\n');
    
  } finally {
    await connection.end();
  }
}

verTodasFacturas();
