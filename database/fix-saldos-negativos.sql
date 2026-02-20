-- ============================================================================
-- Script para corregir saldos negativos en cuentas_por_cobrar
-- ============================================================================
-- PROPÓSITO: Los saldos negativos fueron registrados incorrectamente
--            Este script los convierte a positivos y actualiza estados
-- 
-- EJECUCIÓN: Copiar y pegar en DBeaver, MySQL Workbench o cualquier cliente SQL
-- ============================================================================

-- ============================================================================
-- PASO 1: Ver el estado ANTES de corregir (CONSULTA - NO MODIFICA DATOS)
-- ============================================================================
SELECT 
    '=== FACTURAS CON SALDO NEGATIVO (ANTES DE CORREGIR) ===' as titulo;

SELECT 
    cpc.id as cuenta_id,
    v.numero_venta,
    c.nombre as cliente,
    c.identificacion,
    cpc.monto_total,
    (SELECT COALESCE(SUM(a.monto), 0) FROM abonos a WHERE a.cuenta_por_cobrar_id = cpc.id) as total_abonado,
    cpc.saldo_pendiente as saldo_actual_negativo,
    ABS(cpc.saldo_pendiente) as sera_corregido_a,
    cpc.estado
FROM cuentas_por_cobrar cpc
INNER JOIN ventas v ON cpc.venta_id = v.id
INNER JOIN clientes c ON cpc.cliente_id = c.id
WHERE cpc.saldo_pendiente < 0
ORDER BY c.nombre, v.numero_venta;

SELECT 
    COUNT(*) as total_facturas_con_saldo_negativo
FROM cuentas_por_cobrar
WHERE saldo_pendiente < 0;

-- ============================================================================
-- PASO 2: CORREGIR SALDOS NEGATIVOS A POSITIVOS
-- ============================================================================
-- ⚠️ ATENCIÓN: Esta línea MODIFICA la base de datos
-- ============================================================================

UPDATE cuentas_por_cobrar
SET saldo_pendiente = ABS(saldo_pendiente)
WHERE saldo_pendiente < 0;

-- Mensaje de confirmación
SELECT CONCAT('✓ Se corrigieron ', ROW_COUNT(), ' facturas con saldo negativo') as resultado;

-- ============================================================================
-- PASO 3: ACTUALIZAR ESTADOS DE FACTURAS
-- ============================================================================
-- Cambiar a 'pendiente' las facturas que ahora tienen saldo > 0
-- ============================================================================

UPDATE cuentas_por_cobrar
SET estado = 'pendiente'
WHERE saldo_pendiente > 0 AND estado = 'pagada';

SELECT CONCAT('✓ Se actualizaron ', ROW_COUNT(), ' facturas a estado pendiente') as resultado;

-- ============================================================================
-- PASO 4: RECALCULAR SALDOS DE CLIENTES
-- ============================================================================
-- Actualizar el saldo_pendiente de cada cliente sumando sus facturas
-- ============================================================================

UPDATE clientes c
SET saldo_pendiente = (
    SELECT COALESCE(SUM(cpc.saldo_pendiente), 0)
    FROM cuentas_por_cobrar cpc
    WHERE cpc.cliente_id = c.id
)
WHERE c.estado = 'activo';

SELECT CONCAT('✓ Se recalcularon los saldos de ', ROW_COUNT(), ' clientes activos') as resultado;

-- ============================================================================
-- PASO 5: VERIFICAR EL RESULTADO (CONSULTA - NO MODIFICA DATOS)
-- ============================================================================
SELECT 
    '=== ESTADO DESPUÉS DE CORREGIR ===' as titulo;

-- Verificar que no queden saldos negativos
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ EXITOSO: No hay saldos negativos'
        ELSE CONCAT('⚠ ADVERTENCIA: Aún hay ', COUNT(*), ' facturas con saldo negativo')
    END as verificacion
FROM cuentas_por_cobrar
WHERE saldo_pendiente < 0;

-- Mostrar clientes "oscar" para verificación
SELECT 
    '=== VERIFICACIÓN CLIENTES OSCAR ===' as titulo;

SELECT 
    c.nombre,
    c.identificacion,
    c.saldo_pendiente as saldo_cliente,
    COUNT(cpc.id) as total_facturas,
    COUNT(CASE WHEN cpc.saldo_pendiente > 0 THEN 1 END) as facturas_pendientes,
    SUM(cpc.saldo_pendiente) as suma_saldos_facturas,
    CASE 
        WHEN ABS(c.saldo_pendiente - COALESCE(SUM(cpc.saldo_pendiente), 0)) < 0.01 
        THEN '✓ Saldos coinciden'
        ELSE '⚠ DISCREPANCIA'
    END as estado_validacion
FROM clientes c
LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
WHERE LOWER(c.nombre) LIKE '%oscar%'
GROUP BY c.id, c.nombre, c.identificacion, c.saldo_pendiente
ORDER BY c.identificacion;

-- ============================================================================
-- RESUMEN FINAL
-- ============================================================================
SELECT 
    '=== RESUMEN GENERAL ===' as titulo;

SELECT 
    (SELECT COUNT(*) FROM clientes WHERE estado = 'activo') as total_clientes_activos,
    (SELECT COUNT(*) FROM clientes WHERE estado = 'activo' AND saldo_pendiente > 0) as clientes_con_deuda,
    (SELECT COUNT(*) FROM cuentas_por_cobrar WHERE saldo_pendiente > 0) as facturas_pendientes,
    (SELECT SUM(saldo_pendiente) FROM clientes WHERE estado = 'activo') as total_saldo_pendiente;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Si todo está correcto, deberías ver:
-- ✓ No hay saldos negativos
-- ✓ Los saldos de clientes coinciden con la suma de sus facturas
-- ✓ El conteo de facturas pendientes es correcto
-- ============================================================================
