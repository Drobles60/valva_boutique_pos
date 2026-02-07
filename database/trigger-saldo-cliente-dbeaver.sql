-- =========================================
-- EJECUTAR EN DBEAVER - VERSIÓN SIMPLE
-- =========================================
-- Ejecuta CADA comando con Ctrl+Enter
-- =========================================

-- PASO 1: Eliminar trigger anterior
DROP TRIGGER IF EXISTS actualizar_saldo_cliente_abono;

-- PASO 2: Crear el trigger (ejecuta TODO este bloque junto)
CREATE TRIGGER actualizar_saldo_cliente_abono
AFTER INSERT ON abonos
FOR EACH ROW
UPDATE cuentas_por_cobrar cpc
INNER JOIN clientes c ON c.id = cpc.cliente_id
SET 
  cpc.saldo_pendiente = cpc.saldo_pendiente - NEW.monto,
  cpc.estado = IF((cpc.saldo_pendiente - NEW.monto) <= 0, 'pagada', cpc.estado),
  c.saldo_pendiente = c.saldo_pendiente - NEW.monto,
  c.saldo_actual = c.saldo_pendiente - NEW.monto
WHERE cpc.id = NEW.cuenta_por_cobrar_id;

-- PASO 3: Verificar que se creó
SHOW TRIGGERS LIKE 'abonos';

-- =========================================
-- INSTRUCCIONES:
-- =========================================
-- 1. Ejecuta PASO 1 (solo esa línea)
-- 2. Ejecuta PASO 2 (todo el CREATE TRIGGER)
-- 3. Ejecuta PASO 3 (SHOW TRIGGERS)
-- Usa Ctrl+Enter para cada paso
-- =========================================
