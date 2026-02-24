USE valva_boutique;

CREATE TABLE IF NOT EXISTS gastos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria VARCHAR(100) NOT NULL COMMENT 'Ej: Servicios, Nómina, Insumos',
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha_gasto DATE NOT NULL,
  metodo_pago ENUM('efectivo', 'transferencia', 'otro') DEFAULT 'efectivo',
  referencia VARCHAR(150) COMMENT 'Número de factura o comprobante',
  notas TEXT COMMENT 'Información adicional opcional',
  usuario_id INT UNSIGNED COMMENT 'Usuario que registró el gasto',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Relaciones
  CONSTRAINT fk_gasto_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  
  -- Índices para mejorar rendimiento de filtros comunes
  INDEX idx_categoria (categoria),
  INDEX idx_fecha_gasto (fecha_gasto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
