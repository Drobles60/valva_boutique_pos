-- ============================================
-- ACTUALIZACIÓN TABLA sesiones_caja
-- Agregar columnas para monto_base, notas y cierre
-- Ejecutar en DBeaver si la tabla ya existe
-- ============================================

USE valva_boutique_pos;

-- Agregar columnas faltantes (ignora si ya existen)
ALTER TABLE sesiones_caja
  MODIFY COLUMN estado VARCHAR(30) DEFAULT 'abierta',
  ADD COLUMN IF NOT EXISTS monto_base DECIMAL(10,2) DEFAULT 0 AFTER estado,
  ADD COLUMN IF NOT EXISTS notas_apertura TEXT AFTER monto_base,
  ADD COLUMN IF NOT EXISTS efectivo_contado DECIMAL(10,2) DEFAULT NULL AFTER notas_apertura,
  ADD COLUMN IF NOT EXISTS notas_cierre TEXT AFTER efectivo_contado;

-- Agregar índice para mejorar consulta de estado
ALTER TABLE sesiones_caja
  ADD INDEX IF NOT EXISTS idx_estado (estado);

-- Verificar resultado
DESCRIBE sesiones_caja;
