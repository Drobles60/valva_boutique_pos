-- Script para recalcular y corregir los saldos pendientes de los clientes
-- basados en la suma real de saldos de sus facturas (cuentas_por_cobrar)

-- Ver el estado actual antes de corregir
SELECT 
    'ANTES DE CORREGIR' as estado,
    c.id,
    c.nombre,
    c.identificacion,
    c.saldo_pendiente as saldo_actual,
    COALESCE(SUM(cpc.saldo_pendiente), 0) as saldo_calculado,
    (c.saldo_pendiente - COALESCE(SUM(cpc.saldo_pendiente), 0)) as diferencia
FROM clientes c
LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
WHERE c.estado = 'activo'
GROUP BY c.id, c.nombre, c.identificacion, c.saldo_pendiente
HAVING ABS(c.saldo_pendiente - COALESCE(SUM(cpc.saldo_pendiente), 0)) > 0.01
ORDER BY diferencia DESC;

-- Actualizar los saldos de los clientes
UPDATE clientes c
SET saldo_pendiente = (
    SELECT COALESCE(SUM(cpc.saldo_pendiente), 0)
    FROM cuentas_por_cobrar cpc
    WHERE cpc.cliente_id = c.id
)
WHERE c.estado = 'activo';

-- Ver el estado después de corregir
SELECT 
    'DESPUÉS DE CORREGIR' as estado,
    c.id,
    c.nombre,
    c.identificacion,
    c.saldo_pendiente as saldo_actual,
    COALESCE(SUM(cpc.saldo_pendiente), 0) as saldo_calculado,
    (c.saldo_pendiente - COALESCE(SUM(cpc.saldo_pendiente), 0)) as diferencia
FROM clientes c
LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
WHERE c.estado = 'activo'
GROUP BY c.id, c.nombre, c.identificacion, c.saldo_pendiente
HAVING ABS(c.saldo_pendiente - COALESCE(SUM(cpc.saldo_pendiente), 0)) > 0.01
ORDER BY diferencia DESC;

-- Mensaje de confirmación
SELECT 
    COUNT(*) as total_clientes_activos,
    SUM(saldo_pendiente) as total_saldo_pendiente
FROM clientes
WHERE estado = 'activo';
