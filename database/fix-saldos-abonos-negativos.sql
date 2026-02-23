-- Corrige cuentas con saldo negativo por sobre-abonos y recalcula saldos de clientes.

-- 1) Ajustar saldo_pendiente en cuentas por cobrar
UPDATE cuentas_por_cobrar cpc
LEFT JOIN (
  SELECT cuenta_por_cobrar_id, COALESCE(SUM(monto), 0) as total_abonado
  FROM abonos
  GROUP BY cuenta_por_cobrar_id
) a ON a.cuenta_por_cobrar_id = cpc.id
SET
  cpc.saldo_pendiente = GREATEST(cpc.monto_total - COALESCE(a.total_abonado, 0), 0),
  cpc.estado = CASE
    WHEN (cpc.monto_total - COALESCE(a.total_abonado, 0)) <= 0 THEN 'pagada'
    ELSE cpc.estado
  END;

-- 2) Recalcular saldo_pendiente y saldo_actual por cliente
UPDATE clientes c
LEFT JOIN (
  SELECT cliente_id, COALESCE(SUM(saldo_pendiente), 0) as saldo_total
  FROM cuentas_por_cobrar
  GROUP BY cliente_id
) s ON s.cliente_id = c.id
SET
  c.saldo_pendiente = COALESCE(s.saldo_total, 0),
  c.saldo_actual = COALESCE(s.saldo_total, 0)
WHERE c.estado = 'activo';
