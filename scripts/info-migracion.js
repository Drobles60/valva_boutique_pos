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


    // Verificar proveedores
    const [proveedores] = await connection.query('SELECT * FROM proveedores LIMIT 5');
if (proveedores.length > 0) {
}

    // Verificar tipos de prenda
    const [tipos] = await connection.query('SELECT * FROM tipos_prenda LIMIT 5');
if (tipos.length > 0) {
}

    await connection.end();
    
  } catch (error) {
    console.error('\nâœ— Error:', error.message);
  }
}

migrarProductos();


