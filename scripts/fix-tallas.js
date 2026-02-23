const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function fixTallas() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Cambia esto si tienes contraseÃ±a
    database: 'valva_boutique_pos',
    multipleStatements: true
  });

  try {
const sqlPath = path.join(__dirname, '../database/fix-tallas-relaciones.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

await connection.query(sql);

    
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

console.table(rows);

  } catch (error) {
    console.error('âŒ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

fixTallas()
  .then(() => {
process.exit(0);
  })
  .catch((error) => {
    console.error('\nâŒ Error fatal:', error);
    process.exit(1);
  });


