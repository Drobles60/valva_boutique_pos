const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luciana1510@',
    database: 'valva_boutique'
  });

  // 1. Create tipos_gastos table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS tipos_gastos (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      label VARCHAR(150) NOT NULL,
      estado ENUM('activo','inactivo') DEFAULT 'activo',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table tipos_gastos created');

  // 2. Insert default categories
  const vals = [
    ['servicios', 'Servicios (luz, agua, internet)'],
    ['arriendo', 'Arriendo/Alquiler'],
    ['transporte', 'Transporte/Domicilios'],
    ['compras_suministros', 'Compras y Suministros'],
    ['nomina', 'Nómina/Salarios'],
    ['publicidad', 'Publicidad y Marketing'],
    ['mantenimiento', 'Mantenimiento'],
    ['impuestos', 'Impuestos'],
    ['servicios_profesionales', 'Servicios Profesionales'],
    ['otros', 'Otros'],
  ];

  for (const [nombre, label] of vals) {
    const [existing] = await conn.execute('SELECT id FROM tipos_gastos WHERE nombre = ?', [nombre]);
    if (existing.length === 0) {
      await conn.execute('INSERT INTO tipos_gastos (nombre, label) VALUES (?, ?)', [nombre, label]);
      console.log(`  Inserted: ${nombre}`);
    } else {
      console.log(`  Already exists: ${nombre}`);
    }
  }

  // 3. Alter gastos.categoria from ENUM to VARCHAR
  await conn.execute('ALTER TABLE gastos MODIFY COLUMN categoria VARCHAR(100) NOT NULL');
  console.log('Column gastos.categoria changed to VARCHAR(100)');

  // Verify
  const [rows] = await conn.execute('SELECT * FROM tipos_gastos ORDER BY id');
  console.log('\nTipos de gastos:', rows.length);
  rows.forEach(r => console.log(`  ${r.id}: ${r.nombre} -> ${r.label} (${r.estado})`));

  await conn.end();
  console.log('\nDone!');
})();
