/**
 * Script para limpiar todos los datos de prueba
 * Deja la BD con estructura intacta pero sin registros
 * Uso: node scripts/reset-data.js
 */

const mysql = require('mysql2/promise')

async function resetData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luciana1510@',
    database: 'valva_boutique',
    port: 3306,
  })

  console.log('✅ Conectado a la base de datos: valva_boutique')
  console.log('🗑️  Iniciando limpieza de datos...\n')

  try {
    // Desactivar foreign key checks para truncar en cualquier orden
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0')

    // Tablas de transacciones / datos operativos
    const tablas = [
      // Ventas y pagos
      'detalle_ventas',
      'pagos_mixtos_ventas',
      'pagos_mixtos_abonos',
      'abonos',
      'cuentas_por_cobrar',
      'ventas',

      // Caja
      'movimientos_caja',
      'cajas',

      // Compras y pedidos
      'compra_detalle',
      'compras',
      'abonos_pedidos',
      'detalle_pedidos',
      'pedidos',

      // Inventario / Kardex
      'kardex',
      'movimientos_inventario',

      // Catálogos operativos
      'descuento_productos',
      'descuento_tipos_prenda',
      'descuentos',
      'productos',
      'clientes',
      'gastos',
      'proveedores',
    ]

    console.log('📋 Limpiando tablas de datos:')
    for (const tabla of tablas) {
      try {
        const [result] = await connection.execute(`TRUNCATE TABLE ${tabla}`)
        console.log(`  ✔ ${tabla}`)
      } catch (err) {
        console.warn(`  ⚠ ${tabla} → omitida (${err.message})`)
      }
    }

    // Reactivar foreign keys
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1')

    // Resetear AUTO_INCREMENT
    console.log('\n🔄 Reseteando AUTO_INCREMENT:')
    for (const tabla of tablas) {
      try {
        await connection.execute(`ALTER TABLE ${tabla} AUTO_INCREMENT = 1`)
        console.log(`  ✔ ${tabla}`)
      } catch (err) {
        console.warn(`  ⚠ ${tabla} → ${err.message}`)
      }
    }

    // Conservar solo el usuario administrador, eliminar el resto
    console.log('\n👤 Gestionando usuarios...')
    const [admins] = await connection.execute(
      `SELECT id, username, email FROM usuarios WHERE rol = 'administrador' LIMIT 1`
    )
    if (admins.length > 0) {
      await connection.execute(`DELETE FROM usuarios WHERE rol != 'administrador'`)
      await connection.execute(`ALTER TABLE usuarios AUTO_INCREMENT = 1`)
      console.log(`  ✔ Admin conservado: ${admins[0].email} (${admins[0].username})`)
      console.log(`  ✔ Demás usuarios eliminados`)
    } else {
      console.warn('  ⚠ No se encontró ningún usuario con rol administrador')
    }

    // Tablas de configuración que se conservan (sin tocar)
    console.log('\n🔒 Conservadas (configuración del sistema):')
    console.log('  ✔ categorias_padre')
    console.log('  ✔ tipos_gastos')
    console.log('  ✔ usuarios (solo administrador)')

    console.log('\n🎉 ¡Base de datos limpiada exitosamente!')
    console.log('   → Todos los datos de prueba eliminados')
    console.log('   → Estructura y configuraciones intactas')
    console.log('   → AUTO_INCREMENT reseteado a 1')
    console.log('   → Lista para producción\n')

  } catch (error) {
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1').catch(() => {})
    console.error('\n❌ Error durante la limpieza:', error.message)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

resetData()
