// Script para corregir saldos negativos en cuentas_por_cobrar
// Los saldos negativos fueron registrados incorrectamente
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function corregirSaldosNegativos() {
  let connection;
  
  try {
    console.log('🔧 Iniciando corrección de saldos negativos...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    console.log('✅ Conectado a la base de datos\n');
    
    // 1. Identificar facturas con saldo negativo
    console.log('📊 FACTURAS CON SALDO NEGATIVO (ANTES DE CORREGIR):');
    console.log('='.repeat(100));
    
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
      console.log('\n✅ No se encontraron facturas con saldo negativo.\n');
      return;
    }
    
    console.log(`\nFacturas encontradas: ${facturasNegativas.length}\n`);
    
    let totalCorregir = 0;
    facturasNegativas.forEach((f, i) => {
      console.log(`${i + 1}. Factura #${f.numero_venta} | Cliente: ${f.cliente} (${f.identificacion})`);
      console.log(`   Monto Total: $${Number(f.monto_total).toLocaleString('es-CO')}`);
      console.log(`   Total Abonado: $${Number(f.total_abonado).toLocaleString('es-CO')}`);
      console.log(`   Saldo NEGATIVO: $${Number(f.saldo_pendiente).toLocaleString('es-CO')}`);
      console.log(`   Corregir a: $${Number(Math.abs(f.saldo_pendiente)).toLocaleString('es-CO')}`);
      console.log(`   Estado actual: ${f.estado}`);
      console.log('');
      totalCorregir += Math.abs(Number(f.saldo_pendiente));
    });
    
    console.log('='.repeat(100));
    console.log(`\nTotal a corregir: $${totalCorregir.toLocaleString('es-CO', {minimumFractionDigits: 0})}`);
    
    // 2. Pedir confirmación
    console.log('\n⚠️  Se corregirán los saldos negativos convirtiéndolos a positivos.');
    console.log('   Presiona Ctrl+C para cancelar o espera 5 segundos para continuar...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 3. Corregir saldos negativos
    console.log('🔄 Corrigiendo saldos negativos...\n');
    
    const [resultSaldos] = await connection.execute(
      `UPDATE cuentas_por_cobrar
       SET saldo_pendiente = ABS(saldo_pendiente)
       WHERE saldo_pendiente < 0`
    );
    
    console.log(`✅ Saldos corregidos: ${resultSaldos.affectedRows} facturas\n`);
    
    // 4. Actualizar estado de facturas que ahora tienen saldo pendiente
    const [resultEstado] = await connection.execute(
      `UPDATE cuentas_por_cobrar
       SET estado = 'pendiente'
       WHERE saldo_pendiente > 0 AND estado = 'pagada'`
    );
    
    if (resultEstado.affectedRows > 0) {
      console.log(`✅ Estados actualizados: ${resultEstado.affectedRows} facturas cambiadas a 'pendiente'\n`);
    }
    
    // 5. Recalcular saldos de clientes
    console.log('🔄 Recalculando saldos de clientes...\n');
    
    const [resultClientes] = await connection.execute(
      `UPDATE clientes c
       SET saldo_pendiente = (
           SELECT COALESCE(SUM(cpc.saldo_pendiente), 0)
           FROM cuentas_por_cobrar cpc
           WHERE cpc.cliente_id = c.id
       )
       WHERE c.estado = 'activo'`
    );
    
    console.log(`✅ Saldos de clientes actualizados: ${resultClientes.affectedRows} clientes\n`);
    
    // 6. Verificar el resultado
    console.log('='.repeat(100));
    console.log('📊 ESTADO DESPUÉS DE CORREGIR:');
    console.log('='.repeat(100));
    
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
    
    console.log(`\nFacturas corregidas: ${facturasCorregidas.length}\n`);
    
    facturasCorregidas.forEach((f, i) => {
      console.log(`${i + 1}. Factura #${f.numero_venta} | Cliente: ${f.cliente} (${f.identificacion})`);
      console.log(`   Monto Total: $${Number(f.monto_total).toLocaleString('es-CO')}`);
      console.log(`   Total Abonado: $${Number(f.total_abonado).toLocaleString('es-CO')}`);
      console.log(`   Saldo Pendiente: $${Number(f.saldo_pendiente).toLocaleString('es-CO')} ✅`);
      console.log(`   Estado: ${f.estado}`);
      console.log('');
    });
    
    // 7. Verificar clientes "oscar"
    console.log('='.repeat(100));
    console.log('📊 CLIENTES "OSCAR" DESPUÉS DE CORREGIR:');
    console.log('='.repeat(100));
    
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
      console.log(`\n${r.nombre} (${r.identificacion})`);
      console.log(`  Total facturas:        ${r.total_facturas}`);
      console.log(`  Facturas pendientes:   ${r.facturas_pendientes}`);
      console.log(`  Suma saldos facturas:  $${Number(r.suma_saldos).toLocaleString('es-CO')}`);
      console.log(`  Saldo en tabla:        $${Number(r.saldo_pendiente).toLocaleString('es-CO')}`);
      
      const discrepancia = Math.abs(Number(r.suma_saldos) - Number(r.saldo_pendiente));
      if (discrepancia > 0.01) {
        console.log(`  ⚠️  Discrepancia: $${discrepancia.toLocaleString('es-CO')}`);
      } else {
        console.log(`  ✅ Saldos coinciden`);
      }
    });
    
    console.log('\n' + '='.repeat(100));
    console.log('\n✅ Corrección completada exitosamente\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Conexión cerrada\n');
    }
  }
}

corregirSaldosNegativos();
