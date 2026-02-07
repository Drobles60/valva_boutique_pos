-- ============================================
-- FIX TABLA CLIENTES - ELIMINAR CAMPOS EXTRAS
-- ============================================
USE valva_boutique_pos;

-- Eliminar columnas una por una (ignora errores si no existen)
SET @query = 'ALTER TABLE clientes DROP COLUMN tipo_documento';
SET @check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='valva_boutique_pos' AND TABLE_NAME='clientes' AND COLUMN_NAME='tipo_documento');
SET @query = IF(@check > 0, @query, 'SELECT "tipo_documento no existe"');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @query = 'ALTER TABLE clientes DROP COLUMN numero_documento';
SET @check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='valva_boutique_pos' AND TABLE_NAME='clientes' AND COLUMN_NAME='numero_documento');
SET @query = IF(@check > 0, @query, 'SELECT "numero_documento no existe"');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @query = 'ALTER TABLE clientes DROP COLUMN apellido';
SET @check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='valva_boutique_pos' AND TABLE_NAME='clientes' AND COLUMN_NAME='apellido');
SET @query = IF(@check > 0, @query, 'SELECT "apellido no existe"');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @query = 'ALTER TABLE clientes DROP COLUMN razon_social';
SET @check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='valva_boutique_pos' AND TABLE_NAME='clientes' AND COLUMN_NAME='razon_social');
SET @query = IF(@check > 0, @query, 'SELECT "razon_social no existe"');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @query = 'ALTER TABLE clientes DROP COLUMN celular';
SET @check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='valva_boutique_pos' AND TABLE_NAME='clientes' AND COLUMN_NAME='celular');
SET @query = IF(@check > 0, @query, 'SELECT "celular no existe"');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @query = 'ALTER TABLE clientes DROP COLUMN ciudad';
SET @check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='valva_boutique_pos' AND TABLE_NAME='clientes' AND COLUMN_NAME='ciudad');
SET @query = IF(@check > 0, @query, 'SELECT "ciudad no existe"');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @query = 'ALTER TABLE clientes DROP COLUMN provincia';
SET @check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='valva_boutique_pos' AND TABLE_NAME='clientes' AND COLUMN_NAME='provincia');
SET @query = IF(@check > 0, @query, 'SELECT "provincia no existe"');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @query = 'ALTER TABLE clientes DROP COLUMN codigo_postal';
SET @check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='valva_boutique_pos' AND TABLE_NAME='clientes' AND COLUMN_NAME='codigo_postal');
SET @query = IF(@check > 0, @query, 'SELECT "codigo_postal no existe"');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @query = 'ALTER TABLE clientes DROP COLUMN fecha_nacimiento';
SET @check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='valva_boutique_pos' AND TABLE_NAME='clientes' AND COLUMN_NAME='fecha_nacimiento');
SET @query = IF(@check > 0, @query, 'SELECT "fecha_nacimiento no existe"');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @query = 'ALTER TABLE clientes DROP COLUMN puntos_acumulados';
SET @check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='valva_boutique_pos' AND TABLE_NAME='clientes' AND COLUMN_NAME='puntos_acumulados');
SET @query = IF(@check > 0, @query, 'SELECT "puntos_acumulados no existe"');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ajustar tipos de datos correctos
ALTER TABLE clientes MODIFY COLUMN nombre VARCHAR(200) NOT NULL;
ALTER TABLE clientes MODIFY COLUMN identificacion VARCHAR(50) NULL;
ALTER TABLE clientes MODIFY COLUMN telefono VARCHAR(30) NULL;
ALTER TABLE clientes MODIFY COLUMN direccion TEXT NULL;
ALTER TABLE clientes MODIFY COLUMN email VARCHAR(150) NULL;
ALTER TABLE clientes MODIFY COLUMN tipo_cliente ENUM('publico', 'mayorista', 'especial') DEFAULT 'publico';
ALTER TABLE clientes MODIFY COLUMN limite_credito DECIMAL(10,2) DEFAULT 0;
ALTER TABLE clientes MODIFY COLUMN saldo_pendiente DECIMAL(10,2) DEFAULT 0;
ALTER TABLE clientes MODIFY COLUMN saldo_actual DECIMAL(10,2) DEFAULT 0;
ALTER TABLE clientes MODIFY COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo';

-- Actualizar valores NULL a defaults
UPDATE clientes SET limite_credito = 0 WHERE limite_credito IS NULL;
UPDATE clientes SET saldo_pendiente = 0 WHERE saldo_pendiente IS NULL;
UPDATE clientes SET saldo_actual = 0 WHERE saldo_actual IS NULL;

SELECT 'Tabla clientes actualizada correctamente' as mensaje;
