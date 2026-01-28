const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function fixTallas() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Cambia esto si tienes contraseña
    database: 'valva_boutique_pos',
    multipleStatements: true
  });

  try {
    console.log('📁 Leyendo script SQL...');
    const sqlPath = path.join(__dirname, '../database/fix-tallas-relaciones.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔄 Ejecutando script...');
    await connection.query(sql);

    console.log('✅ Script ejecutado exitosamente');
    console.log('\n📊 Verificando relaciones...');
    
    const [rows] = await connection.query(`
      SELECT 
        tp.id,
        tp.nombre as tipo_prenda,
        st.nombre as sistema_talla,
        GROUP_CONCAT(t.valor ORDER BY t.orden SEPARATOR ', ') as tallas
      FROM tipo_prenda_sistema_talla tpst
      INNER JOIN tipos_prenda tp ON tpst.tipo_prenda_id = tp.id
      INNER JOIN sistemas_tallas st ON tpst.sistema_talla_id = st.id
      INNER JOIN tallas t ON t.sistema_talla_id = st.id
      WHERE t.estado = 'activo'
      GROUP BY tp.id, tp.nombre, st.nombre
      ORDER BY tp.id
      LIMIT 20
    `);

    console.log('\nPrimeras 20 relaciones:');
    console.table(rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

fixTallas()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
