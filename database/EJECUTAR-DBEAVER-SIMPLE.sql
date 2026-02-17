-- =========================================
-- EJECUTAR EN DBEAVER - COMANDO POR COMANDO
-- =========================================
-- Copia y pega CADA COMANDO por separado
-- Presiona Ctrl+Enter después de cada uno
-- =========================================


-- ========== COMANDO 1 ==========
-- Copia SOLO esta línea, pégala en DBeaver y presiona Ctrl+Enter:

DROP TRIGGER IF EXISTS actualizar_saldo_cliente_abono;

-- Si ves "OK" o "Query executed successfully", continúa con el siguiente comando


-- ========== COMANDO 2 (COMPLETO - TODO JUNTO) ==========
-- Copia TODO este bloque (desde CREATE hasta el último punto y coma)
-- Pégalo en DBeaver y presiona Ctrl+Enter:

CREATE TRIGGER actualizar_saldo_cliente_abono
AFTER INSERT ON abonos
FOR EACH ROW
UPDATE cuentas_por_cobrar cpc
INNER JOIN clientes c ON c.id = cpc.cliente_id
SET 
  cpc.saldo_pendiente = cpc.saldo_pendiente - NEW.monto,
  cpc.estado = IF((cpc.saldo_pendiente - NEW.monto) = 0, 'pagada', 'pendiente'),
  c.saldo_pendiente = c.saldo_pendiente - NEW.monto,
  c.saldo_actual = c.saldo_pendiente - NEW.monto
WHERE cpc.id = NEW.cuenta_por_cobrar_id;

-- Si ves algún error, cópialo y dímelo
-- Si ves "OK" o "Query executed successfully", continúa con la verificación


-- ========== COMANDO 3 (VERIFICAR) ==========
-- Copia esta línea y presiona Ctrl+Enter para verificar:

SHOW TRIGGERS LIKE 'abonos';

-- Deberías ver en los resultados: actualizar_saldo_cliente_abono
-- Si lo ves, ¡LISTO! El trigger está funcionando


-- =========================================
-- RESUMEN:
-- =========================================
-- 1. Ejecuta COMANDO 1 (DROP TRIGGER)
-- 2. Ejecuta COMANDO 2 (CREATE TRIGGER - es UN SOLO trigger sin BEGIN END)
-- 3. Ejecuta COMANDO 3 (SHOW TRIGGERS) para verificar
-- =========================================
-- Este trigger NO usa BEGIN...END, por eso funciona en DBeaver
-- Hace lo mismo pero en una sola consulta UPDATE con JOIN
-- =========================================
