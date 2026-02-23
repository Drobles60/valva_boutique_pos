const mysql = require('mysql2/promise');

async function pruebaVentaCompleta() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique'
  });

  try {

    // 1. Verificar productos disponibles
const [productos] = await connection.query(`
      SELECT id, nombre, stock_actual, precio_venta 
      FROM productos 
      WHERE stock_actual > 0 
      LIMIT 3
    `);

    if (productos.length === 0) {
      process.exit(0);
    }

productos.forEach(p => {
});
// 2. Obtener usuario administrador
const [usuarios] = await connection.query(`
      SELECT id, nombre, apellido 
      FROM usuarios 
      WHERE rol = 'administrador' 
      LIMIT 1
    `);

    if (usuarios.length === 0) {
process.exit(0);
    }

    const usuario = usuarios[0];

    // 3. Obtener caja activa
const [cajas] = await connection.query(`
      SELECT id, nombre 
      FROM cajas 
      WHERE estado = 'activa' 
      LIMIT 1
    `);

    if (cajas.length === 0) {
process.exit(0);
    }

    const caja = cajas[0];

    // 4. Generar nÃºmero de venta
const fecha = new Date();
    const aÃ±o = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    const [ultimaVenta] = await connection.query(`
      SELECT numero_venta 
      FROM ventas 
      WHERE DATE(fecha_venta) = CURDATE() 
      ORDER BY id DESC 
      LIMIT 1
    `);

    let numeroSecuencial = 1;
    if (ultimaVenta.length > 0 && ultimaVenta[0].numero_venta) {
      const match = ultimaVenta[0].numero_venta.match(/-(\d+)$/);
      if (match) {
        numeroSecuencial = parseInt(match[1]) + 1;
      }
    }

    const numero_venta = `VEN-${aÃ±o}${mes}${dia}-${String(numeroSecuencial).padStart(4, '0')}`;

    // 5. Calcular totales
let subtotal = 0;
    const items = [];
    
    for (let i = 0; i < Math.min(2, productos.length); i++) {
      const producto = productos[i];
      const cantidad = 1;
      const precio = parseFloat(producto.precio_venta);
      const itemSubtotal = cantidad * precio;
      subtotal += itemSubtotal;
      
      items.push({
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad,
        precio_unitario: precio,
        subtotal: itemSubtotal
      });
    }

    const total = subtotal;
// 6. Registrar venta
const [resultVenta] = await connection.execute(`
      INSERT INTO ventas (
        numero_venta, cliente_id, fecha_venta, subtotal, iva, descuento, total,
        estado, usuario_id, caja_id, tipo_venta, metodo_pago
      ) VALUES (?, NULL, NOW(), ?, 0, 0, ?, 'completada', ?, ?, 'contado', 'efectivo')
    `, [numero_venta, subtotal, total, usuario.id, caja.id]);

    const venta_id = resultVenta.insertId;

    // 7. Registrar detalles y actualizar stock
for (const item of items) {
      // Insertar detalle
      await connection.execute(`
        INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `, [venta_id, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]);

      // Actualizar stock
      await connection.execute(`
        UPDATE productos 
        SET stock_actual = stock_actual - ? 
        WHERE id = ?
      `, [item.cantidad, item.producto_id]);

      // Registrar movimiento de inventario
      await connection.execute(`
        INSERT INTO movimientos_inventario (
          producto_id, tipo_movimiento, cantidad, motivo, 
          referencia_id, usuario_id, fecha_movimiento
        ) VALUES (?, 'salida', ?, 'venta', ?, ?, NOW())
      `, [item.producto_id, item.cantidad, venta_id, usuario.id]);

}
// 8. Verificar venta completa
const [ventaCompleta] = await connection.query(`
      SELECT v.*, u.nombre as vendedor_nombre, u.apellido as vendedor_apellido
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = ?
    `, [venta_id]);

    const [detalles] = await connection.query(`
      SELECT dv.*, p.nombre as producto_nombre
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = ?
    `, [venta_id]);

    detalles.forEach(d => {
});
} catch (error) {
    console.error('âŒ Error en la prueba:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

pruebaVentaCompleta()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('âŒ Error:', error);
    process.exit(1);
  });


