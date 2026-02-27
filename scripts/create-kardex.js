/**
 * Script de migración: Crear tabla KARDEX
 * ========================================
 * Tabla maestra de movimientos de inventario con trazabilidad completa.
 * Registra: entradas, salidas, ajustes, cambios de precio, cambios de estado,
 * devoluciones, mermas, etc.
 *
 * Relaciones:
 *  - productos.id
 *  - compras.id          (cuando el movimiento viene de una compra)
 *  - ventas.id           (cuando el movimiento viene de una venta)
 *  - usuarios.id         (quién realizó el movimiento)
 *
 * Uso: node scripts/create-kardex.js
 */

const mysql = require('mysql2/promise')

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luciana1510@',
    database: 'valva_boutique',
  })

  console.log('🔌 Conectado a la base de datos\n')

  // ═══════════════════════════════════════════════════════════
  // 1. Crear tabla kardex
  // ═══════════════════════════════════════════════════════════
  console.log('📦 Creando tabla kardex...')

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS kardex (
      id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,

      -- Producto afectado
      producto_id         INT UNSIGNED NOT NULL,

      -- Tipo de movimiento
      tipo_movimiento     ENUM(
                            'entrada_compra',
                            'entrada_devolucion',
                            'entrada_ajuste',
                            'salida_venta',
                            'salida_devolucion',
                            'salida_merma',
                            'salida_ajuste',
                            'ajuste_manual',
                            'cambio_precio',
                            'cambio_estado',
                            'inventario_inicial'
                          ) NOT NULL,

      -- Cantidades
      cantidad            INT NOT NULL DEFAULT 0 COMMENT 'Unidades (+entrada / -salida)',
      stock_anterior      INT NOT NULL DEFAULT 0 COMMENT 'Stock antes del movimiento',
      stock_nuevo         INT NOT NULL DEFAULT 0 COMMENT 'Stock después del movimiento',

      -- Precios unitarios al momento del movimiento
      precio_compra       DECIMAL(12,2) DEFAULT NULL COMMENT 'Costo unitario al momento',
      precio_venta        DECIMAL(12,2) DEFAULT NULL COMMENT 'Precio venta al momento',
      precio_minimo       DECIMAL(12,2) DEFAULT NULL COMMENT 'Precio mínimo al momento',
      costo_total         DECIMAL(12,2) DEFAULT NULL COMMENT 'cantidad × precio_compra',

      -- Saldos acumulados (valorización del inventario)
      saldo_cantidad      INT NOT NULL DEFAULT 0 COMMENT 'Unidades acumuladas en inventario',
      saldo_costo         DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT 'Valor acumulado (saldo_cantidad × precio_compra)',

      -- campos de cambio de precio (para tipo=cambio_precio)
      precio_anterior     DECIMAL(12,2) DEFAULT NULL COMMENT 'Precio antes del cambio',
      precio_nuevo        DECIMAL(12,2) DEFAULT NULL COMMENT 'Precio después del cambio',
      campo_precio        VARCHAR(50) DEFAULT NULL COMMENT 'Campo modificado: precio_compra, precio_venta, precio_minimo',

      -- campos de cambio de estado (para tipo=cambio_estado)
      estado_anterior     VARCHAR(30) DEFAULT NULL,
      estado_nuevo        VARCHAR(30) DEFAULT NULL,

      -- Referencia al documento origen
      compra_id           INT DEFAULT NULL COMMENT 'FK a compras.id',
      venta_id            INT UNSIGNED DEFAULT NULL COMMENT 'FK a ventas.id',
      referencia_doc      VARCHAR(100) DEFAULT NULL COMMENT 'Número de documento (factura, nota, etc.)',

      -- Trazabilidad
      usuario_id          INT UNSIGNED NOT NULL COMMENT 'Quién realizó el movimiento',
      motivo              VARCHAR(500) DEFAULT NULL COMMENT 'Descripción o justificación',
      observaciones       TEXT DEFAULT NULL COMMENT 'Notas adicionales',

      -- Timestamps
      fecha_movimiento    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      -- Índices para consultas frecuentes
      INDEX idx_kardex_producto      (producto_id),
      INDEX idx_kardex_tipo          (tipo_movimiento),
      INDEX idx_kardex_fecha         (fecha_movimiento),
      INDEX idx_kardex_compra        (compra_id),
      INDEX idx_kardex_venta         (venta_id),
      INDEX idx_kardex_usuario       (usuario_id),
      INDEX idx_kardex_prod_fecha    (producto_id, fecha_movimiento),

      -- Foreign keys
      CONSTRAINT fk_kardex_producto  FOREIGN KEY (producto_id)  REFERENCES productos(id)  ON UPDATE CASCADE,
      CONSTRAINT fk_kardex_compra    FOREIGN KEY (compra_id)    REFERENCES compras(id)     ON UPDATE CASCADE ON DELETE SET NULL,
      CONSTRAINT fk_kardex_venta     FOREIGN KEY (venta_id)     REFERENCES ventas(id)      ON UPDATE CASCADE ON DELETE SET NULL,
      CONSTRAINT fk_kardex_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)    ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Kardex de inventario — registro histórico de todos los movimientos de productos'
  `)

  console.log('✅ Tabla kardex creada\n')

  // ═══════════════════════════════════════════════════════════
  // 2. Generar movimiento "inventario_inicial" para todos
  //    los productos activos que ya tienen stock
  // ═══════════════════════════════════════════════════════════
  console.log('📋 Generando movimientos de inventario inicial...')

  // Buscar un usuario administrador para asignar como autor
  const [admins] = await conn.execute(
    "SELECT id FROM usuarios WHERE rol = 'administrador' AND estado = 'activo' ORDER BY id LIMIT 1"
  )
  const adminId = admins.length > 0 ? admins[0].id : 1

  const [productos] = await conn.execute(
    "SELECT id, stock_actual, precio_compra, precio_venta, precio_minimo FROM productos WHERE estado = 'activo' AND stock_actual > 0"
  )

  let insertados = 0
  for (const p of productos) {
    // Verificar que no exista ya un movimiento inicial para este producto
    const [existing] = await conn.execute(
      "SELECT id FROM kardex WHERE producto_id = ? AND tipo_movimiento = 'inventario_inicial' LIMIT 1",
      [p.id]
    )
    if (existing.length > 0) continue

    const costoTotal = (p.stock_actual || 0) * (p.precio_compra || 0)

    await conn.execute(`
      INSERT INTO kardex (
        producto_id, tipo_movimiento,
        cantidad, stock_anterior, stock_nuevo,
        precio_compra, precio_venta, precio_minimo, costo_total,
        saldo_cantidad, saldo_costo,
        usuario_id, motivo
      ) VALUES (?, 'inventario_inicial', ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      p.id,
      p.stock_actual,
      p.stock_actual,
      p.precio_compra || 0,
      p.precio_venta || 0,
      p.precio_minimo || 0,
      costoTotal,
      p.stock_actual,
      costoTotal,
      adminId,
      'Inventario inicial — migración automática'
    ])
    insertados++
  }

  console.log(`✅ ${insertados} movimientos de inventario inicial creados (de ${productos.length} productos con stock)\n`)

  // ═══════════════════════════════════════════════════════════
  // 3. Resumen
  // ═══════════════════════════════════════════════════════════
  const [countResult] = await conn.execute("SELECT COUNT(*) as total FROM kardex")
  console.log(`📊 Total registros en kardex: ${countResult[0].total}`)

  await conn.end()
  console.log('\n🎉 Migración completada exitosamente')
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
