const mysql = require('mysql2/promise');

async function probarInsert() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Luciana1510@',
      database: 'valva_boutique'
    });

    console.log('✓ Conexión exitosa');

    // Intentar insertar un descuento de prueba
    console.log('\nIntentando insertar descuento de prueba...');
    
    const [result] = await connection.execute(`
      INSERT INTO descuentos (
        nombre, 
        descripcion, 
        tipo, 
        valor, 
        fecha_inicio, 
        fecha_fin, 
        estado, 
        aplicable_a
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Descuento Prueba',
      'Esto es una prueba',
      'porcentaje',
      10.00,
      null,
      null,
      'activo',
      'productos'
    ]);

    console.log('✓ Descuento insertado exitosamente');
    console.log('ID generado:', result.insertId);

    // Eliminar el descuento de prueba
    await connection.execute('DELETE FROM descuentos WHERE id = ?', [result.insertId]);
    console.log('✓ Descuento de prueba eliminado');

    await connection.end();
    console.log('\n✓ Prueba completada exitosamente');
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('Código:', error.code);
    console.error('SQL State:', error.sqlState);
    console.error('Stack:', error.stack);
  }
}

probarInsert();
