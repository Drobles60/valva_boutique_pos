-- =========================================
-- ARREGLAR ESTADO DE CUENTAS POR COBRAR
-- =========================================
-- Este script corrige el estado de las cuentas por cobrar
-- para que solo muestren "pagada" cuando el saldo_pendiente sea exactamente 0
-- =========================================

-- PASO 1: Ver cuántas cuentas tienen estado incorrecto
SELECT 
  COUNT(*) as total_incorrectas,
  SUM(CASE WHEN estado = 'pagada' AND saldo_pendiente > 0 THEN 1 ELSE 0 END) as marcadas_pagadas_con_saldo,
  SUM(CASE WHEN estado = 'pendiente' AND saldo_pendiente = 0 THEN 1 ELSE 0 END) as marcadas_pendientes_sin_saldo
FROM cuentas_por_cobrar;

-- PASO 2: Ver detalles de las cuentas con estado incorrecto
SELECT 
  cpc.id,
  cpc.venta_id,
  v.numero_venta,
  c.nombre as cliente,
  cpc.monto_total,
  cpc.saldo_pendiente,
  cpc.estado,
  CASE 
    WHEN cpc.saldo_pendiente = 0 THEN 'Debería ser PAGADA'
    WHEN cpc.saldo_pendiente > 0 THEN 'Debería ser PENDIENTE'
    ELSE 'ERROR: Saldo negativo'
  END as estado_correcto
FROM cuentas_por_cobrar cpc
INNER JOIN ventas v ON cpc.venta_id = v.id
INNER JOIN clientes c ON cpc.cliente_id = c.id
WHERE 
  (cpc.estado = 'pagada' AND cpc.saldo_pendiente <> 0)
  OR (cpc.estado = 'pendiente' AND cpc.saldo_pendiente = 0)
ORDER BY cpc.id;

-- PASO 3: Corregir los estados incorrectos
-- Marcar como 'pagada' solo cuando saldo_pendiente = 0
-- Marcar como 'pendiente' cuando saldo_pendiente > 0
UPDATE cuentas_por_cobrar
SET estado = CASE 
  WHEN saldo_pendiente = 0 THEN 'pagada'
  ELSE 'pendiente'
END
WHERE 
  (estado = 'pagada' AND saldo_pendiente <> 0)
  OR (estado = 'pendiente' AND saldo_pendiente = 0);

-- PASO 4: Verificar que se corrigieron
SELECT 
  estado,
  COUNT(*) as total,
  MIN(saldo_pendiente) as saldo_minimo,
  MAX(saldo_pendiente) as saldo_maximo,
  AVG(saldo_pendiente) as saldo_promedio
FROM cuentas_por_cobrar
GROUP BY estado;

-- PASO 5: Actualizar el trigger con la nueva lógica
DROP TRIGGER IF EXISTS actualizar_saldo_cliente_abono;

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

-- PASO 6: Verificar que el trigger se creó correctamente
SHOW TRIGGERS LIKE 'abonos';

-- =========================================
-- INSTRUCCIONES DE USO
-- =========================================
-- 1. Ejecuta PASO 1 para ver cuántas cuentas tienen estado incorrecto
-- 2. Ejecuta PASO 2 para ver el detalle de las cuentas incorrectas
-- 3. Ejecuta PASO 3 para corregir los estados
-- 4. Ejecuta PASO 4 para verificar la corrección
-- 5. Ejecuta PASO 5 para actualizar el trigger con la nueva lógica
-- 6. Ejecuta PASO 6 para verificar que el trigger se creó correctamente
-- =========================================
