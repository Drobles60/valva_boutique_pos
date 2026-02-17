-- Diagnóstico de facturas pendientes por cliente
-- Para verificar qué facturas tiene cada cliente llamado "oscar"

-- 1. Ver todos los clientes llamados "oscar"
SELECT 
    id,
    nombre,
    identificacion,
    telefono,
    saldo_pendiente,
    estado
FROM clientes 
WHERE LOWER(nombre) LIKE '%oscar%'
ORDER BY id;

-- 2. Ver todas las facturas (cuentas_por_cobrar) de estos clientes
SELECT 
    c.id as cliente_id,
    c.nombre,
    c.identificacion,
    c.saldo_pendiente as saldo_cliente,
    cpc.id as cuenta_id,
    cpc.venta_id,
    cpc.numero_venta,
    cpc.monto_total,
    cpc.saldo_pendiente as saldo_factura,
    cpc.estado as estado_factura,
    cpc.fecha_vencimiento
FROM clientes c
INNER JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
WHERE LOWER(c.nombre) LIKE '%oscar%'
ORDER BY c.id, cpc.fecha_vencimiento;

-- 3. Ver el conteo de facturas pendientes por cada cliente oscar
SELECT 
    c.id as cliente_id,
    c.nombre,
    c.identificacion,
    c.saldo_pendiente as saldo_cliente,
    COUNT(DISTINCT cpc.id) as total_facturas,
    COUNT(DISTINCT CASE WHEN cpc.saldo_pendiente > 0 THEN cpc.id END) as facturas_con_saldo,
    COUNT(DISTINCT CASE WHEN cpc.estado = 'pendiente' THEN cpc.id END) as facturas_estado_pendiente,
    COUNT(DISTINCT CASE WHEN cpc.estado = 'vencida' THEN cpc.id END) as facturas_estado_vencida,
    SUM(cpc.saldo_pendiente) as suma_saldos_facturas
FROM clientes c
INNER JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
WHERE LOWER(c.nombre) LIKE '%oscar%'
GROUP BY c.id, c.nombre, c.identificacion, c.saldo_pendiente
ORDER BY c.id;

-- 4. Ver abonos de cada factura para verificar cálculos
SELECT 
    c.nombre,
    c.identificacion,
    cpc.numero_venta,
    cpc.monto_total,
    cpc.saldo_pendiente,
    cpc.estado,
    COUNT(a.id) as cantidad_abonos,
    COALESCE(SUM(a.monto), 0) as total_abonado_suma,
    (cpc.monto_total - COALESCE(SUM(a.monto), 0)) as saldo_calculado
FROM clientes c
INNER JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
LEFT JOIN abonos a ON a.cuenta_por_cobrar_id = cpc.id
WHERE LOWER(c.nombre) LIKE '%oscar%'
GROUP BY c.nombre, c.identificacion, cpc.numero_venta, cpc.monto_total, cpc.saldo_pendiente, cpc.estado
ORDER BY c.identificacion, cpc.numero_venta;
