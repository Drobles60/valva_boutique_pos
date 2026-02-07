const mysql = require('mysql2/promise');

async function pruebaVentaCompleta() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique'
  });

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 PRUEBA COMPLETA DEL SISTEMA DE VENTAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // 1. Verificar productos disponibles
    console.log('1️⃣  Verificando productos disponibles...');
    const [productos] = await connection.query(`
      SELECT id, nombre, stock_actual, precio_venta 
      FROM productos 
      WHERE stock_actual > 0 
      LIMIT 3
    `);

    if (productos.length === 0) {
      console.log('⚠️  No hay productos con stock disponible');
      console.log('   Ejecuta primero algunos scripts para crear productos');
      process.exit(0);
    }

    console.log(`   ✅ ${productos.length} productos encontrados:`);
    productos.forEach(p => {
      console.log(`      - ${p.nombre} (Stock: ${p.stock_actual}, Precio: $${p.precio_venta})`);
    });
    console.log('');

    // 2. Obtener usuario administrador
    console.log('2️⃣  Obteniendo usuario...');
    const [usuarios] = await connection.query(`
      SELECT id, nombre, apellido 
      FROM usuarios 
      WHERE rol = 'administrador' 
      LIMIT 1
    `);

    if (usuarios.length === 0) {
      console.log('⚠️  No hay usuarios administradores');
      process.exit(0);
    }

    const usuario = usuarios[0];
    console.log(`   ✅ Usuario: ${usuario.nombre} ${usuario.apellido}`);
    console.log('');

    // 3. Obtener caja activa
    console.log('3️⃣  Verificando caja...');
    const [cajas] = await connection.query(`
      SELECT id, nombre 
      FROM cajas 
      WHERE estado = 'activa' 
      LIMIT 1
    `);

    if (cajas.length === 0) {
      console.log('⚠️  No hay cajas activas');
      process.exit(0);
    }

    const caja = cajas[0];
    console.log(`   ✅ Caja: ${caja.nombre}`);
    console.log('');

    // 4. Generar número de venta
    console.log('4️⃣  Generando número de venta...');
    const fecha = new Date();
    const año = fecha.getFullYear();
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

    const numero_venta = `VEN-${año}${mes}${dia}-${String(numeroSecuencial).padStart(4, '0')}`;
    console.log(`   ✅ Número de venta: ${numero_venta}`);
    console.log('');

    // 5. Calcular totales
    console.log('5️⃣  Calculando totales...');
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
    console.log(`   Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`   Total: $${total.toFixed(2)}`);
    console.log('');

    // 6. Registrar venta
    console.log('6️⃣  Registrando venta en base de datos...');
    const [resultVenta] = await connection.execute(`
      INSERT INTO ventas (
        numero_venta, cliente_id, fecha_venta, subtotal, iva, descuento, total,
        estado, usuario_id, caja_id, tipo_venta, metodo_pago
      ) VALUES (?, NULL, NOW(), ?, 0, 0, ?, 'completada', ?, ?, 'contado', 'efectivo')
    `, [numero_venta, subtotal, total, usuario.id, caja.id]);

    const venta_id = resultVenta.insertId;
    console.log(`   ✅ Venta registrada con ID: ${venta_id}`);
    console.log('');

    // 7. Registrar detalles y actualizar stock
    console.log('7️⃣  Registrando detalles y actualizando stock...');
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

      console.log(`   ✅ ${item.nombre}: ${item.cantidad} unidad(es) - Stock actualizado`);
    }
    console.log('');

    // 8. Verificar venta completa
    console.log('8️⃣  Verificando venta registrada...');
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

    console.log('   📋 RESUMEN DE LA VENTA:');
    console.log('   ─────────────────────────');
    console.log(`   Número: ${ventaCompleta[0].numero_venta}`);
    console.log(`   Vendedor: ${ventaCompleta[0].vendedor_nombre} ${ventaCompleta[0].vendedor_apellido}`);
    console.log(`   Fecha: ${ventaCompleta[0].fecha_venta}`);
    console.log(`   Tipo: ${ventaCompleta[0].tipo_venta}`);
    console.log(`   Método de pago: ${ventaCompleta[0].metodo_pago}`);
    console.log(`   Total: $${ventaCompleta[0].total}`);
    console.log('');
    console.log('   📦 PRODUCTOS:');
    detalles.forEach(d => {
      console.log(`      - ${d.producto_nombre}: ${d.cantidad} x $${d.precio_unitario} = $${d.subtotal}`);
    });
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('💡 Ahora puedes:');
    console.log('   1. Ver la venta en el módulo de Ventas');
    console.log('   2. Verificar el stock actualizado en Inventario');
    console.log('   3. Revisar los movimientos de inventario');
    console.log('   4. Generar factura desde la interfaz');
    console.log('');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

pruebaVentaCompleta()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
