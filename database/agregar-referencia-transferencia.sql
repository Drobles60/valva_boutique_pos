-- =========================================
-- AGREGAR REFERENCIA DE TRANSFERENCIA
-- =========================================
-- Este script agrega el campo para registrar
-- de dónde viene la transferencia (Nequi, Bancolombia, etc.)
-- =========================================

-- PASO 1: Agregar campo a la tabla ventas
ALTER TABLE ventas 
ADD COLUMN referencia_transferencia VARCHAR(50) NULL 
COMMENT 'Origen de la transferencia: Nequi, Bancolombia, Daviplata, Otro';

-- PASO 2: Agregar campo a la tabla abonos
ALTER TABLE abonos 
ADD COLUMN referencia_transferencia VARCHAR(50) NULL 
COMMENT 'Origen de la transferencia: Nequi, Bancolombia, Daviplata, Otro';

-- PASO 3: También necesitamos agregar a pagos_mixtos_ventas
ALTER TABLE pagos_mixtos_ventas 
ADD COLUMN referencia_transferencia VARCHAR(50) NULL 
COMMENT 'Origen de la transferencia para el monto de transferencia en pagos mixtos';

-- PASO 4: Y a pagos_mixtos_abonos
ALTER TABLE pagos_mixtos_abonos 
ADD COLUMN referencia_transferencia VARCHAR(50) NULL 
COMMENT 'Origen de la transferencia para el monto de transferencia en pagos mixtos';

-- =========================================
-- VERIFICAR CAMBIOS
-- =========================================
-- Verifica que los campos se agregaron correctamente
DESCRIBE ventas;
DESCRIBE abonos;
DESCRIBE pagos_mixtos_ventas;
DESCRIBE pagos_mixtos_abonos;

-- =========================================
-- INSTRUCCIONES PARA DBEAVER:
-- =========================================
-- 1. Selecciona desde PASO 1 hasta PASO 4 (las 4 ALTER TABLE)
-- 2. Presiona Ctrl+Enter para ejecutar
-- 3. Luego selecciona los DESCRIBE y presiona Ctrl+Enter para verificar
-- =========================================
