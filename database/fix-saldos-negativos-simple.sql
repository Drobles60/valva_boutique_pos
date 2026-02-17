-- ============================================================================
-- CORRECCIÓN RÁPIDA DE SALDOS NEGATIVOS
-- ============================================================================
-- Este script solo ejecuta las correcciones necesarias sin verificaciones
-- Ideal para ejecutar rápidamente en producción
-- ============================================================================

-- 1. Corregir saldos negativos a positivos
UPDATE cuentas_por_cobrar
SET saldo_pendiente = ABS(saldo_pendiente)
WHERE saldo_pendiente < 0;

-- 2. Actualizar estados de facturas a 'pendiente'
UPDATE cuentas_por_cobrar
SET estado = 'pendiente'
WHERE saldo_pendiente > 0 AND estado = 'pagada';

-- 3. Recalcular saldos de clientes
UPDATE clientes c
SET saldo_pendiente = (
    SELECT COALESCE(SUM(cpc.saldo_pendiente), 0)
    FROM cuentas_por_cobrar cpc
    WHERE cpc.cliente_id = c.id
)
WHERE c.estado = 'activo';

-- LISTO! Los saldos han sido corregidos.
