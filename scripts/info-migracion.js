const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrarProductos() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Luciana1510@',
      database: 'valva_boutique'
    });

    console.log('✓ Conexión exitosa\n');

    console.log('NOTA: Los productos en localStorage no se pueden acceder desde Node.js');
    console.log('Los productos deben registrarse directamente en la aplicación.');
    console.log('\nOpciones:');
    console.log('1. Registra productos nuevamente usando la interfaz web');
    console.log('2. O crea descuentos por tipos de prenda en lugar de productos específicos\n');

    // Verificar proveedores
    const [proveedores] = await connection.query('SELECT * FROM proveedores LIMIT 5');
    console.log('Proveedores disponibles:', proveedores.length);
    if (proveedores.length > 0) {
      console.log('  Ejemplo:', proveedores[0].razon_social);
    }

    // Verificar tipos de prenda
    const [tipos] = await connection.query('SELECT * FROM tipos_prenda LIMIT 5');
    console.log('Tipos de prenda disponibles:', tipos.length);
    if (tipos.length > 0) {
      tipos.forEach(t => console.log(`  - ${t.nombre}`));
    }

    await connection.end();
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
  }
}

migrarProductos();
