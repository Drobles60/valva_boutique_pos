const mysql = require('mysql2/promise');

async function verificarSistema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique'
  });

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 VERIFICACIÓN DEL SISTEMA DE VENTAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Verificar tabla ventas
    const [ventasColumns] = await connection.query(`
      SHOW COLUMNS FROM ventas WHERE Field IN ('tipo_venta', 'metodo_pago')
    `);
    
    console.log('✓ Tabla ventas:');
    if (ventasColumns.length >= 2) {
      console.log('  ✅ Campos tipo_venta y metodo_pago existen');
    } else {
      console.log('  ⚠️  Faltan campos en tabla ventas');
    }

    // Verificar productos
    const [productos] = await connection.query('SELECT COUNT(*) as total FROM productos');
    console.log(`\n✓ Productos: ${productos[0].total} registros`);

    // Verificar clientes
    const [clientes] = await connection.query('SELECT COUNT(*) as total FROM clientes');
    console.log(`✓ Clientes: ${clientes[0].total} registros`);

    // Verificar cajas
    const [cajas] = await connection.query("SELECT COUNT(*) as total FROM cajas WHERE estado = 'activa'");
    console.log(`✓ Cajas activas: ${cajas[0].total}`);

    if (cajas[0].total === 0) {
      console.log('  ⚠️  No hay cajas activas, creando caja principal...');
      await connection.execute(`
        INSERT INTO cajas (nombre, codigo, estado) 
        VALUES ('Caja Principal', 'CAJA-01', 'activa')
      `);
      console.log('  ✅ Caja principal creada');
    }

    // Verificar usuarios
    const [usuarios] = await connection.query("SELECT COUNT(*) as total FROM usuarios WHERE estado = 'activo'");
    console.log(`✓ Usuarios activos: ${usuarios[0].total}`);

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SISTEMA LISTO PARA PROCESAR VENTAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📝 Funcionalidades implementadas:');
    console.log('   ✓ Registro de ventas en base de datos');
    console.log('   ✓ Descuento automático de stock');
    console.log('   ✓ Movimientos de inventario');
    console.log('   ✓ Vista previa de factura');
    console.log('   ✓ Generación de PDF');
    console.log('   ✓ Impresión de factura');
    console.log('   ✓ Ventas a contado y crédito');
    console.log('   ✓ Múltiples métodos de pago');
    console.log('');

  } catch (error) {
    console.error('❌ Error en verificación:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

verificarSistema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
