-- =========================================
-- ELIMINAR OPCIÓN 'TARJETA' DE MÉTODOS DE PAGO
-- =========================================
-- Este script modifica las tablas existentes para
-- eliminar la opción 'tarjeta' de los métodos de pago
-- =========================================

-- PASO 1: Modificar tabla ventas
ALTER TABLE ventas 
MODIFY COLUMN metodo_pago ENUM('efectivo', 'transferencia', 'mixto') DEFAULT 'efectivo';

-- PASO 2: Modificar tabla abonos
ALTER TABLE abonos 
MODIFY COLUMN metodo_pago ENUM('efectivo', 'transferencia', 'mixto') DEFAULT 'efectivo';

-- PASO 3: Modificar tabla abonos_pedidos (si existe)
ALTER TABLE abonos_pedidos 
MODIFY COLUMN metodo_pago ENUM('efectivo', 'transferencia', 'cheque', 'otro') DEFAULT 'efectivo';

-- =========================================
-- VERIFICAR CAMBIOS
-- =========================================
DESCRIBE ventas;
DESCRIBE abonos;
DESCRIBE abonos_pedidos;

-- =========================================
-- INSTRUCCIONES PARA DBEAVER:
-- =========================================
-- 1. Selecciona los 3 ALTER TABLE (PASO 1, 2 y 3)
-- 2. Presiona Ctrl+Enter para ejecutar
-- 3. Luego selecciona los DESCRIBE y presiona Ctrl+Enter para verificar
-- =========================================
