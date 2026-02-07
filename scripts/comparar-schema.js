const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Luciana1510@',
  database: 'valva_boutique',
};

// Tablas esperadas según el schema.sql
const tablasEsperadas = {
  'usuarios': [
    'id', 'username', 'email', 'password_hash', 'nombre', 'apellido', 
    'telefono', 'rol', 'estado', 'ultimo_acceso', 'created_at', 'updated_at'
  ],
  'categorias_padre': [
    'id', 'nombre', 'descripcion', 'orden', 'estado', 'created_at', 'updated_at'
  ],
  'tipos_prenda': [
    'id', 'categoria_padre_id', 'nombre', 'descripcion', 'orden', 
    'estado', 'created_at', 'updated_at'
  ],
  'sistemas_tallas': [
    'id', 'nombre', 'descripcion', 'tipo', 'created_at', 'updated_at'
  ],
  'tallas': [
    'id', 'sistema_talla_id', 'valor', 'descripcion', 'orden', 
    'estado', 'created_at', 'updated_at'
  ],
  'tipo_prenda_sistema_talla': [
    'tipo_prenda_id', 'sistema_talla_id'
  ],
  'productos': [
    'id', 'codigo_barras', 'sku', 'nombre', 'descripcion', 'categoria_padre_id',
    'tipo_prenda_id', 'talla_id', 'proveedor_id', 'color', 'precio_compra',
    'precio_venta', 'precio_minimo', 'stock_actual', 'estado', 'created_at', 'updated_at'
  ],
  'movimientos_inventario': [
    'id', 'producto_id', 'tipo_movimiento', 'cantidad', 'stock_anterior',
    'stock_nuevo', 'motivo', 'referencia_id', 'venta_id', 'usuario_id', 'fecha_movimiento'
  ],
  'descuentos': [
    'id', 'nombre', 'descripcion', 'tipo', 'valor', 'fecha_inicio',
    'fecha_fin', 'estado', 'aplicable_a', 'created_at', 'updated_at'
  ],
  'descuento_productos': [
    'descuento_id', 'producto_id'
  ],
  'descuento_tipos_prenda': [
    'descuento_id', 'tipo_prenda_id'
  ],
  'clientes': [
    'id', 'nombre', 'identificacion', 'telefono', 'direccion', 'email',
    'tipo_cliente', 'limite_credito', 'saldo_pendiente', 'saldo_actual',
    'estado', 'created_at', 'updated_at'
  ],
  'proveedores': [
    'id', 'codigo', 'ruc', 'razon_social', 'nombre_comercial', 'telefono',
    'celular', 'email', 'direccion', 'ciudad', 'provincia', 'persona_contacto',
    'telefono_contacto', 'estado', 'created_at', 'updated_at'
  ],
  'pedidos': [
    'id', 'numero_pedido', 'proveedor_id', 'fecha_pedido', 'costo_total',
    'total_abonado', 'saldo_pendiente', 'estado', 'fecha_recibido',
    'usuario_id', 'notas', 'created_at', 'updated_at'
  ],
  'detalle_pedidos': [
    'id', 'pedido_id', 'descripcion', 'cantidad', 'precio_total'
  ],
  'abonos_pedidos': [
    'id', 'pedido_id', 'monto', 'fecha_abono', 'metodo_pago', 'referencia',
    'notas', 'usuario_id', 'created_at'
  ],
  'cajas': [
    'id', 'nombre', 'codigo', 'estado', 'created_at', 'updated_at'
  ],
  'ventas': [
    'id', 'numero_venta', 'cliente_id', 'fecha_venta', 'subtotal', 'iva',
    'descuento', 'total', 'estado', 'tipo_venta', 'metodo_pago',
    'efectivo_recibido', 'cambio', 'referencia_transferencia',
    'descuento_id', 'usuario_id', 'caja_id', 'created_at', 'updated_at'
  ],
  'detalle_ventas': [
    'id', 'venta_id', 'producto_id', 'cantidad', 'precio_unitario', 'subtotal'
  ],
  'pagos_mixtos_ventas': [
    'id', 'venta_id', 'monto_efectivo', 'monto_transferencia', 'monto_tarjeta',
    'referencia_transferencia', 'created_at'
  ],
  'cuentas_por_cobrar': [
    'id', 'cliente_id', 'venta_id', 'monto_total', 'saldo_pendiente',
    'fecha_vencimiento', 'estado', 'created_at', 'updated_at'
  ],
  'abonos': [
    'id', 'cuenta_por_cobrar_id', 'monto', 'metodo_pago',
    'referencia_transferencia', 'fecha_abono', 'usuario_id', 'notas', 'created_at'
  ],
  'pagos_mixtos_abonos': [
    'id', 'abono_id', 'monto_efectivo', 'monto_transferencia', 'monto_tarjeta',
    'referencia_transferencia', 'created_at'
  ],
  'sesiones_caja': [
    'id', 'caja_id', 'usuario_id', 'fecha_apertura', 'fecha_cierre', 'estado'
  ],
  'movimientos_caja': [
    'id', 'sesion_caja_id', 'tipo_movimiento', 'monto', 'venta_id',
    'usuario_id', 'fecha_movimiento'
  ],
  'auditoria': [
    'id', 'tabla', 'registro_id', 'accion', 'usuario_id', 'fecha_accion'
  ]
};

async function compararSchema() {
  let connection;
  
  try {
    console.log('🔍 INICIANDO COMPARACIÓN DE SCHEMA\n');
    console.log('='.repeat(80));
    
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos\n');
    
    // Obtener todas las tablas de la base de datos
    const [tablasReales] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    const nombresReales = tablasReales.map(t => t.TABLE_NAME);
    const nombresEsperados = Object.keys(tablasEsperadas);
    
    console.log('📊 COMPARACIÓN DE TABLAS\n');
    console.log(`Tablas esperadas (schema.sql): ${nombresEsperados.length}`);
    console.log(`Tablas en la base de datos: ${nombresReales.length}\n`);
    
    // Buscar tablas faltantes en la BD
    const tablasFaltantes = nombresEsperados.filter(t => !nombresReales.includes(t));
    if (tablasFaltantes.length > 0) {
      console.log('❌ TABLAS FALTANTES EN LA BASE DE DATOS:');
      tablasFaltantes.forEach(tabla => console.log(`   - ${tabla}`));
      console.log();
    }
    
    // Buscar tablas extras en la BD (no están en el schema)
    const tablasExtras = nombresReales.filter(t => !nombresEsperados.includes(t));
    if (tablasExtras.length > 0) {
      console.log('⚠️  TABLAS EXTRAS EN LA BASE DE DATOS (no están en schema.sql):');
      tablasExtras.forEach(tabla => console.log(`   - ${tabla}`));
      console.log();
    }
    
    // Comparar columnas de cada tabla
    console.log('='.repeat(80));
    console.log('🔎 COMPARACIÓN DETALLADA DE COLUMNAS\n');
    
    let totalDiferencias = 0;
    
    for (const tabla of nombresEsperados) {
      if (!nombresReales.includes(tabla)) {
        continue; // Ya la reportamos como faltante
      }
      
      // Obtener columnas reales de la tabla
      const [columnasReales] = await connection.query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_KEY,
          COLUMN_DEFAULT,
          EXTRA,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [dbConfig.database, tabla]);
      
      const nombresColumnasReales = columnasReales.map(c => c.COLUMN_NAME);
      const columnasEsperadas = tablasEsperadas[tabla];
      
      // Buscar columnas faltantes
      const columnasFaltantes = columnasEsperadas.filter(c => !nombresColumnasReales.includes(c));
      
      // Buscar columnas extras
      const columnasExtras = nombresColumnasReales.filter(c => !columnasEsperadas.includes(c));
      
      if (columnasFaltantes.length > 0 || columnasExtras.length > 0) {
        console.log(`\n📋 TABLA: ${tabla}`);
        console.log('-'.repeat(80));
        
        if (columnasFaltantes.length > 0) {
          console.log('  ❌ Columnas FALTANTES en la BD:');
          columnasFaltantes.forEach(col => console.log(`     - ${col}`));
          totalDiferencias += columnasFaltantes.length;
        }
        
        if (columnasExtras.length > 0) {
          console.log('  ⚠️  Columnas EXTRAS en la BD (no están en schema.sql):');
          columnasExtras.forEach(col => {
            const columnaInfo = columnasReales.find(c => c.COLUMN_NAME === col);
            console.log(`     - ${col} (${columnaInfo.DATA_TYPE})`);
          });
          totalDiferencias += columnasExtras.length;
        }
        
        // Mostrar todas las columnas de la BD para referencia
        console.log('\n  📝 Columnas actuales en la BD:');
        columnasReales.forEach(col => {
          let tipo = col.DATA_TYPE;
          if (col.CHARACTER_MAXIMUM_LENGTH) {
            tipo += `(${col.CHARACTER_MAXIMUM_LENGTH})`;
          } else if (col.NUMERIC_PRECISION) {
            tipo += `(${col.NUMERIC_PRECISION}${col.NUMERIC_SCALE ? ',' + col.NUMERIC_SCALE : ''})`;
          }
          
          const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
          const key = col.COLUMN_KEY ? ` [${col.COLUMN_KEY}]` : '';
          const extra = col.EXTRA ? ` ${col.EXTRA}` : '';
          const def = col.COLUMN_DEFAULT !== null ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
          
          console.log(`     ${col.COLUMN_NAME}: ${tipo} ${nullable}${key}${extra}${def}`);
        });
        
        console.log();
      } else {
        console.log(`\n✅ TABLA: ${tabla} - Todas las columnas coinciden`);
      }
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMEN FINAL\n');
    
    if (tablasFaltantes.length === 0 && tablasExtras.length === 0 && totalDiferencias === 0) {
      console.log('✅ ¡PERFECTO! La base de datos coincide exactamente con el schema.sql');
    } else {
      console.log(`⚠️  Se encontraron diferencias:`);
      console.log(`   - Tablas faltantes: ${tablasFaltantes.length}`);
      console.log(`   - Tablas extras: ${tablasExtras.length}`);
      console.log(`   - Diferencias en columnas: ${totalDiferencias}`);
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error durante la comparación:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar la comparación
compararSchema();
