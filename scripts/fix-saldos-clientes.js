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
    console.log('🔧 Iniciando corrección de saldos de clientes...\n');
    
    // Crear conexión a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    console.log('✅ Conectado a la base de datos\n');
    
    // 1. Ver el estado actual
    console.log('📊 ESTADO ANTES DE CORREGIR:');
    console.log('='.repeat(100));
    
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
      console.log('✅ No se encontraron errores. Todos los saldos están correctos.\n');
      return;
    }
    
    console.log(`Clientes con saldos incorrectos: ${clientesConError.length}\n`);
    
    for (const cliente of clientesConError) {
      console.log(`Cliente: ${cliente.nombre} (${cliente.identificacion})`);
      console.log(`  Saldo actual:    $${Number(cliente.saldo_actual).toLocaleString('es-CO', {minimumFractionDigits: 2})}`);
      console.log(`  Saldo calculado: $${Number(cliente.saldo_calculado).toLocaleString('es-CO', {minimumFractionDigits: 2})}`);
      console.log(`  Diferencia:      $${Number(cliente.diferencia).toLocaleString('es-CO', {minimumFractionDigits: 2})}`);
      console.log('');
    }
    
    // 2. Pedir confirmación
    console.log('='.repeat(100));
    console.log('⚠️  Se van a actualizar los saldos de estos clientes.');
    console.log('   Presiona Ctrl+C para cancelar o espera 5 segundos para continuar...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 3. Actualizar los saldos
    console.log('🔄 Actualizando saldos...\n');
    
    const [result] = await connection.execute(
      `UPDATE clientes c
       SET saldo_pendiente = (
           SELECT COALESCE(SUM(cpc.saldo_pendiente), 0)
           FROM cuentas_por_cobrar cpc
           WHERE cpc.cliente_id = c.id
       )
       WHERE c.estado = 'activo'`
    );
    
    console.log(`✅ Saldos actualizados: ${result.affectedRows} clientes\n`);
    
    // 4. Verificar el resultado
    console.log('📊 ESTADO DESPUÉS DE CORREGIR:');
    console.log('='.repeat(100));
    
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
      console.log('✅ Todos los saldos están correctos ahora.\n');
    } else {
      console.log(`⚠️  Aún hay ${clientesAunConError.length} clientes con discrepancias:\n`);
      for (const cliente of clientesAunConError) {
        console.log(`Cliente: ${cliente.nombre} (${cliente.identificacion})`);
        console.log(`  Diferencia: $${Number(cliente.diferencia).toLocaleString('es-CO', {minimumFractionDigits: 2})}`);
        console.log('');
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
    console.log('='.repeat(100));
    console.log('📈 RESUMEN GENERAL:');
    console.log(`  Total clientes activos: ${stats.total_clientes_activos}`);
    console.log(`  Clientes con deuda: ${stats.clientes_con_deuda}`);
    console.log(`  Total saldo pendiente: $${Number(stats.total_saldo_pendiente).toLocaleString('es-CO', {minimumFractionDigits: 2})}`);
    console.log('='.repeat(100));
    
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

fixSaldosClientes();
