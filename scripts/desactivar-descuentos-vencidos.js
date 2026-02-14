/**
 * Script para desactivar descuentos vencidos
 * 
 * Este script actualiza el estado de los descuentos cuya fecha de fin
 * ya ha pasado, cambiándolos de 'activo' a 'inactivo'.
 * 
 * Uso:
 *   node scripts/desactivar-descuentos-vencidos.js
 * 
 * O programar con cron (Linux/Mac):
 *   0 0 * * * node /ruta/al/proyecto/scripts/desactivar-descuentos-vencidos.js
 * 
 * O programar con Task Scheduler (Windows):
 *   - Crear tarea que ejecute: node "D:\ruta\scripts\desactivar-descuentos-vencidos.js"
 *   - Programar diariamente a medianoche
 */

const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

async function desactivarDescuentosVencidos() {
  let connection

  try {
    console.log('🔄 Conectando a la base de datos...')
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'valva_boutique_pos',
    })

    console.log('✅ Conexión establecida')

    // Actualizar descuentos vencidos
    console.log('🔄 Verificando descuentos vencidos...')
    
    const [result] = await connection.execute(`
      UPDATE descuentos 
      SET estado = 'inactivo' 
      WHERE fecha_fin IS NOT NULL 
        AND fecha_fin < CURDATE() 
        AND estado = 'activo'
    `)

    const descuentosActualizados = result.affectedRows

    if (descuentosActualizados > 0) {
      console.log(`✅ Se desactivaron ${descuentosActualizados} descuento(s) vencido(s)`)
      
      // Mostrar cuáles fueron
      const [descuentos] = await connection.execute(`
        SELECT id, nombre, fecha_fin 
        FROM descuentos 
        WHERE estado = 'inactivo' 
          AND fecha_fin IS NOT NULL 
          AND fecha_fin < CURDATE()
        ORDER BY fecha_fin DESC
        LIMIT 10
      `)

      console.log('\n📋 Descuentos desactivados recientemente:')
      descuentos.forEach(desc => {
        console.log(`   - ID ${desc.id}: ${desc.nombre} (venció: ${desc.fecha_fin})`)
      })
    } else {
      console.log('ℹ️  No hay descuentos vencidos para desactivar')
    }

    // Mostrar estadísticas
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as inactivos,
        SUM(CASE WHEN estado = 'activo' AND fecha_fin IS NOT NULL AND fecha_fin >= CURDATE() THEN 1 ELSE 0 END) as activos_con_vigencia
      FROM descuentos
    `)

    console.log('\n📊 Estadísticas de descuentos:')
    console.log(`   Total: ${stats[0].total}`)
    console.log(`   Activos: ${stats[0].activos}`)
    console.log(`   Inactivos: ${stats[0].inactivos}`)
    console.log(`   Activos con fecha de vigencia: ${stats[0].activos_con_vigencia}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n✅ Proceso completado')
    }
  }
}

// Ejecutar
desactivarDescuentosVencidos()
