-- =========================================
-- TRIGGER: Actualizar saldo de clientes
-- =========================================
-- NOTA: Este trigger es OPCIONAL
-- La lógica de actualización de saldos ya está implementada en el código de la API
-- Solo ejecuta este trigger si quieres que la base de datos maneje automáticamente
-- la actualización de saldos (útil para abonos manuales directos en la BD)
-- =========================================

-- Para ejecutar este archivo desde línea de comandos:
-- mysql -u root -p valva_boutique < database/trigger-saldo-cliente.sql

DELIMITER $$

DROP TRIGGER IF EXISTS actualizar_saldo_cliente_abono$$

CREATE TRIGGER actualizar_saldo_cliente_abono
AFTER INSERT ON abonos
FOR EACH ROW
BEGIN
  DECLARE cliente_id_var INT UNSIGNED;
  
  -- Obtener el cliente_id de la cuenta por cobrar
  SELECT cliente_id INTO cliente_id_var
  FROM cuentas_por_cobrar
  WHERE id = NEW.cuenta_por_cobrar_id;
  
  -- Actualizar saldo pendiente y estado en cuentas_por_cobrar
  UPDATE cuentas_por_cobrar
  SET saldo_pendiente = saldo_pendiente - NEW.monto,
      estado = CASE 
        WHEN (saldo_pendiente - NEW.monto) <= 0 THEN 'pagada'
        ELSE estado
      END
  WHERE id = NEW.cuenta_por_cobrar_id;
  
  -- Actualizar saldo_pendiente en clientes
  UPDATE clientes
  SET saldo_pendiente = saldo_pendiente - NEW.monto,
      saldo_actual = saldo_pendiente - NEW.monto
  WHERE id = cliente_id_var;
END$$

DELIMITER ;

-- Verificar que el trigger se creó correctamente
SHOW TRIGGERS LIKE 'abonos';

-- =========================================
-- NOTAS
-- =========================================
-- 1. Este trigger se ejecuta automáticamente después de cada INSERT en la tabla abonos
-- 2. Actualiza el saldo_pendiente en cuentas_por_cobrar
-- 3. Actualiza el saldo_pendiente y saldo_actual en clientes
-- 4. Marca la cuenta como 'pagada' si el saldo llega a cero o menos
-- 5. La API ya implementa esta lógica, por lo que el trigger es redundante pero puede ser útil
--    para abonos que se registren manualmente en la base de datos
-- =========================================
