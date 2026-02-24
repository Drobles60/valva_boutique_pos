-- =============================================================================
-- MODULO DE COMPRAS (DICIEMBRE 2023 - FEBRERO 2026)
-- Tablas creadas para el sistema de Liquidación y Facturación de Compras
-- =============================================================================

USE valva_boutique_pos;

-- 1. TABLA DE COMPRAS (CABECERA)
-- Almacena la información general de la factura del proveedor
CREATE TABLE IF NOT EXISTS compras (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  numero_compra    VARCHAR(30) UNIQUE COMMENT 'Número interno generado por el sistema',
  proveedor_id     INT UNSIGNED NOT NULL,
  factura_numero   VARCHAR(100) COMMENT 'Número de factura física del proveedor',
  fecha            DATE NOT NULL,
  fecha_vencimiento DATE,
  tipo_pago        ENUM('contado','credito','mixto') DEFAULT 'contado',
  subtotal         DECIMAL(12,2) DEFAULT 0,
  descuento_total  DECIMAL(12,2) DEFAULT 0,
  iva_total        DECIMAL(12,2) DEFAULT 0,
  otros_costos     DECIMAL(12,2) DEFAULT 0,
  total            DECIMAL(12,2) DEFAULT 0,
  abono_inicial    DECIMAL(12,2) DEFAULT 0,
  estado           ENUM('borrador','confirmada','anulada') DEFAULT 'borrador',
  usuario_id       INT UNSIGNED,
  observaciones    TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relaciones
  CONSTRAINT fk_compra_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
  CONSTRAINT fk_compra_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  
  -- Índices para optimización
  INDEX idx_proveedor (proveedor_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. TABLA DE DETALLE DE COMPRAS
-- Almacena los ítems específicos de cada factura de compra
CREATE TABLE IF NOT EXISTS compra_detalle (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  compra_id      INT NOT NULL,
  producto_id    INT UNSIGNED NOT NULL,
  cantidad       INT NOT NULL DEFAULT 1,
  costo_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  descuento_pct  DECIMAL(5,2) DEFAULT 0,
  iva_pct        DECIMAL(5,2) DEFAULT 0,
  subtotal       DECIMAL(12,2) DEFAULT 0,
  total          DECIMAL(12,2) DEFAULT 0,
  
  -- Relaciones
  CONSTRAINT fk_detalle_compra FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  
  -- Índices
  INDEX idx_compra (compra_id),
  INDEX idx_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 3. INTEGRACIÓN CON INVENTARIO (KARDEX)
-- Los registros de compra alimentan la tabla de movimientos_inventario 
-- con el tipo_movimiento 'entrada_inicial' al ser confirmadas.

/* 
  RELACIONES TRABAJADAS:
  - Compras -> Proveedores (puntos de contacto para facturación)
  - Compras -> Usuarios (quien registra la compra)
  - Compra Detalle -> Productos (actualización de stock_actual y precio_compra)
  - Compra Detalle -> Movimientos Inventario (trazabilidad en Kardex)
*/
