-- =========================================
-- SCRIPT DE ACTUALIZACION: Sistema de Pagos y Creditos
-- Fecha: 2026-02-06
-- Descripcion: Agregar soporte para pagos mixtos, registro de cambio,
--              y mejoras al sistema de credito con abonos
-- =========================================

-- 1. Agregar opcion 'mixto' a metodo_pago en ventas
ALTER TABLE ventas 
MODIFY COLUMN metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'mixto') DEFAULT 'efectivo';

-- 2. Agregar columnas para registro de efectivo recibido y cambio en ventas
ALTER TABLE ventas 
ADD COLUMN efectivo_recibido DECIMAL(10,2) AFTER total,
ADD COLUMN cambio DECIMAL(10,2) AFTER efectivo_recibido;

-- 3. Agregar opcion 'mixto' a metodo_pago en abonos
ALTER TABLE abonos 
MODIFY COLUMN metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'mixto') DEFAULT 'efectivo';

-- 4. Crear tabla para desglose de pagos mixtos en ventas
CREATE TABLE IF NOT EXISTS pagos_mixtos_ventas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  venta_id INT UNSIGNED NOT NULL,
  monto_efectivo DECIMAL(10,2) NOT NULL DEFAULT 0,
  monto_transferencia DECIMAL(10,2) NOT NULL DEFAULT 0,
  monto_tarjeta DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Crear tabla para desglose de pagos mixtos en abonos
CREATE TABLE IF NOT EXISTS pagos_mixtos_abonos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  abono_id INT UNSIGNED NOT NULL,
  monto_efectivo DECIMAL(10,2) NOT NULL DEFAULT 0,
  monto_transferencia DECIMAL(10,2) NOT NULL DEFAULT 0,
  monto_tarjeta DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (abono_id) REFERENCES abonos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Agregar indices para mejorar performance
CREATE INDEX idx_venta_metodo_pago ON ventas(metodo_pago);
CREATE INDEX idx_abono_metodo_pago ON abonos(metodo_pago);
CREATE INDEX idx_pagos_mixtos_ventas_venta ON pagos_mixtos_ventas(venta_id);
CREATE INDEX idx_pagos_mixtos_abonos_abono ON pagos_mixtos_abonos(abono_id);

-- 7. Actualizar trigger para actualizar saldo de clientes cuando se hacen abonos
-- IMPORTANTE: Este trigger debe ejecutarse POR SEPARADO usando los siguientes pasos:

-- PASO 1: Eliminar el trigger si existe (ejecutar primero este comando)
DROP TRIGGER IF EXISTS actualizar_saldo_cliente_abono;

-- PASO 2: Cambiar el delimitador (ejecutar este comando)
-- DELIMITER $$

-- PASO 3: Crear el trigger (ejecutar todo este bloque completo)
/*
CREATE TRIGGER actualizar_saldo_cliente_abono
AFTER INSERT ON abonos
FOR EACH ROW
BEGIN
  DECLARE cliente_id_var INT UNSIGNED;
  DECLARE saldo_nuevo DECIMAL(10,2);
  
  SELECT cliente_id INTO cliente_id_var
  FROM cuentas_por_cobrar
  WHERE id = NEW.cuenta_por_cobrar_id;
  
  UPDATE cuentas_por_cobrar
  SET saldo_pendiente = saldo_pendiente - NEW.monto
  WHERE id = NEW.cuenta_por_cobrar_id;
  
  SELECT saldo_pendiente INTO saldo_nuevo
  FROM cuentas_por_cobrar
  WHERE id = NEW.cuenta_por_cobrar_id;
  
  UPDATE clientes
  SET saldo_pendiente = saldo_pendiente - NEW.monto,
      saldo_actual = saldo_pendiente - NEW.monto
  WHERE id = cliente_id_var;
  
  IF saldo_nuevo <= 0 THEN
    UPDATE cuentas_por_cobrar
    SET estado = 'pagada'
    WHERE id = NEW.cuenta_por_cobrar_id;
  END IF;
END$$
*/

-- PASO 4: Restaurar el delimitador (ejecutar este comando)
-- DELIMITER ;

-- NOTA: Si usas un cliente SQL visual (Workbench, HeidiSQL, etc), 
-- copia y pega cada PASO por separado en ventanas de consulta diferentes

-- =========================================
-- VERIFICACIONES
-- =========================================

-- Verificar estructura de ventas
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'ventas'
  AND COLUMN_NAME IN ('metodo_pago', 'efectivo_recibido', 'cambio');

-- Verificar estructura de abonos
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'abonos'
  AND COLUMN_NAME = 'metodo_pago';

-- Verificar tablas de pagos mixtos
SELECT 
  TABLE_NAME,
  CREATE_TIME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('pagos_mixtos_ventas', 'pagos_mixtos_abonos');

-- =========================================
-- NOTAS IMPORTANTES
-- =========================================
-- 1. Este script agrega soporte para pagos mixtos en ventas y abonos
-- 2. Se registra el efectivo recibido y cambio en ventas de contado
-- 3. Se mejora el sistema de credito con registro detallado de abonos
-- 4. Los triggers mantienen actualizado el saldo de clientes automaticamente
-- 5. Las foreign keys con ON DELETE CASCADE aseguran integridad referencial
-- =========================================
