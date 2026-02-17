-- =========================================
-- CREAR TABLA DE GASTOS
-- =========================================
-- Este script crea la tabla de gastos para registrar
-- todos los gastos operativos del negocio

USE valva_boutique_pos;

CREATE TABLE IF NOT EXISTS gastos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria ENUM(
    'servicios',
    'arriendo',
    'transporte',
    'compras_suministros',
    'nomina',
    'publicidad',
    'mantenimiento',
    'impuestos',
    'servicios_profesionales',
    'otros'
  ) NOT NULL COMMENT 'Categoría del gasto',
  descripcion VARCHAR(255) NOT NULL COMMENT 'Descripción breve del gasto',
  monto DECIMAL(10,2) NOT NULL COMMENT 'Valor del gasto',
  fecha_gasto DATE NOT NULL COMMENT 'Fecha en que se realizó el gasto',
  metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta') DEFAULT 'efectivo',
  referencia VARCHAR(100) COMMENT 'Número de factura, comprobante o referencia',
  notas TEXT COMMENT 'Observaciones adicionales',
  usuario_id INT UNSIGNED COMMENT 'Usuario que registró el gasto',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_fecha_gasto (fecha_gasto),
  INDEX idx_categoria (categoria),
  INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla gastos creada exitosamente' AS mensaje;

-- Ver estructura de la tabla
DESCRIBE gastos;
