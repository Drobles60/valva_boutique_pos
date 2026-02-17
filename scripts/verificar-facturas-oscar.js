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
    // Crear conexión a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    console.log('✅ Conectado a la base de datos\n');
    
    // 1. Obtener todos los clientes llamados "oscar"
    console.log('🔍 Buscando clientes con "oscar" en el nombre...\n');
    const [clientes] = await connection.execute(
      `SELECT id, nombre, identificacion, telefono, saldo_pendiente, estado
       FROM clientes 
       WHERE LOWER(nombre) LIKE '%oscar%'
       ORDER BY id`
    );
    
    console.log(`Encontrados ${clientes.length} cliente(s):\n`);
    
    for (const cliente of clientes) {
      console.log('='.repeat(70));
      console.log(`Cliente: ${cliente.nombre}`);
      console.log(`ID: ${cliente.id} | Identificación: ${cliente.identificacion}`);
      console.log(`Teléfono: ${cliente.telefono || 'N/A'}`);
      console.log(`Saldo en tabla clientes: $${Number(cliente.saldo_pendiente).toLocaleString('es-CO')}`);
      console.log(`Estado: ${cliente.estado}`);
      console.log('='.repeat(70));
      
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
      
      console.log(`\n📊 Total de facturas en cuentas_por_cobrar: ${todasFacturas.length}\n`);
      
      // Contar por estado
      const facturasConSaldo = todasFacturas.filter(f => Number(f.saldo_pendiente) > 0);
      const facturasPendientes = todasFacturas.filter(f => f.estado === 'pendiente');
      const facturasVencidas = todasFacturas.filter(f => f.estado === 'vencida');
      const facturasPagadas = todasFacturas.filter(f => f.estado === 'pagada');
      
      console.log(`  Facturas con saldo > 0: ${facturasConSaldo.length}`);
      console.log(`  Estado 'pendiente': ${facturasPendientes.length}`);
      console.log(`  Estado 'vencida': ${facturasVencidas.length}`);
      console.log(`  Estado 'pagada': ${facturasPagadas.length}\n`);
      
      // Mostrar cada factura con saldo pendiente
      if (facturasConSaldo.length > 0) {
        console.log('📋 Facturas con saldo pendiente:');
        console.log('-'.repeat(70));
        
        for (const factura of facturasConSaldo) {
          console.log(`  Factura #${factura.numero_venta} (ID: ${factura.id})`);
          console.log(`    Monto Total: $${Number(factura.monto_total).toLocaleString('es-CO')}`);
          console.log(`    Saldo Pendiente: $${Number(factura.saldo_pendiente).toLocaleString('es-CO')}`);
          console.log(`    Estado: ${factura.estado}`);
          console.log(`    Fecha Vencimiento: ${factura.fecha_vencimiento}`);
          
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
            console.log(`    Abonos: ${abonos.length} (Total: $${totalAbonado.toLocaleString('es-CO')})`);
          } else {
            console.log(`    Abonos: 0`);
          }
          console.log('');
        }
      }
      
      // Verificar suma de saldos
      const sumaSaldos = facturasConSaldo.reduce((sum, f) => sum + Number(f.saldo_pendiente), 0);
      console.log(`\n💰 Suma de saldos de facturas: $${sumaSaldos.toLocaleString('es-CO')}`);
      console.log(`💰 Saldo en tabla clientes: $${Number(cliente.saldo_pendiente).toLocaleString('es-CO')}`);
      
      if (Math.abs(sumaSaldos - Number(cliente.saldo_pendiente)) > 0.01) {
        console.log(`⚠️  DISCREPANCIA: Los saldos no coinciden!`);
      } else {
        console.log(`✅ Los saldos coinciden`);
      }
      
      console.log('\n\n');
    }
    
    // 3. Mostrar qué devolvería la query del API
    console.log('='.repeat(70));
    console.log('🔍 Simulando query del API (con filtros aplicados)');
    console.log('='.repeat(70));
    
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
    
    console.log(`\nResultado del API:\n`);
    resultadoAPI.forEach((cliente, i) => {
      console.log(`${i + 1}. ${cliente.nombre} (${cliente.identificacion})`);
      console.log(`   Total cuentas: ${cliente.total_cuentas}`);
      console.log(`   Cuentas pendientes: ${cliente.cuentas_pendientes}`);
      console.log(`   Cuentas vencidas: ${cliente.cuentas_vencidas}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexión cerrada');
    }
  }
}

verificarFacturas();
