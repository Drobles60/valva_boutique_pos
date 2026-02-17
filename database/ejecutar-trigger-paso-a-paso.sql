-- =========================================
-- EJECUTAR EL TRIGGER - PASO A PASO
-- =========================================
-- IMPORTANTE: Ejecuta CADA BLOQUE por separado en tu cliente MySQL
-- =========================================


-- =========================================
-- BLOQUE 1: Eliminar trigger existente
-- =========================================
-- Copia y pega SOLO este comando primero:

DROP TRIGGER IF EXISTS actualizar_saldo_cliente_abono;

-- Presiona "Ejecutar" o F5
-- Si todo va bien, verás: "OK, 0 rows affected"


-- =========================================
-- BLOQUE 2: Crear el trigger
-- =========================================
-- Copia y pega TODO este bloque completo (desde DELIMITER hasta el final)
-- NO lo dividas, debe ejecutarse todo junto:

DELIMITER $$

CREATE TRIGGER actualizar_saldo_cliente_abono
AFTER INSERT ON abonos
FOR EACH ROW
BEGIN
  DECLARE cliente_id_var INT UNSIGNED;
  
  -- Obtener el cliente_id de la cuenta por cobrar
  SELECT cliente_id INTO cliente_id_var
  FROM cuentas_por_cobrar
  WHERE id = NEW.cuenta_por_cobrar_id;
  
  -- Actualizar saldo pendiente en cuentas_por_cobrar
  UPDATE cuentas_por_cobrar
  SET saldo_pendiente = saldo_pendiente - NEW.monto,
      estado = CASE 
        WHEN (saldo_pendiente - NEW.monto) = 0 THEN 'pagada'
        ELSE 'pendiente'
      END
  WHERE id = NEW.cuenta_por_cobrar_id;
  
  -- Actualizar saldo_pendiente en clientes
  UPDATE clientes
  SET saldo_pendiente = saldo_pendiente - NEW.monto,
      saldo_actual = saldo_pendiente - NEW.monto
  WHERE id = cliente_id_var;
END$$

DELIMITER ;

-- Presiona "Ejecutar" o F5
-- Si todo va bien, verás: "OK, 0 rows affected"


-- =========================================
-- BLOQUE 3: Verificar que se creó correctamente
-- =========================================
-- Copia y pega este comando para verificar:

SHOW TRIGGERS LIKE 'abonos';

-- Deberías ver el trigger "actualizar_saldo_cliente_abono" en la lista
-- Si lo ves, ¡está listo! ✅


-- =========================================
-- BLOQUE 4 (OPCIONAL): Ver el código del trigger
-- =========================================
-- Para ver el código completo del trigger:

SHOW CREATE TRIGGER actualizar_saldo_cliente_abono;


-- =========================================
-- ¡LISTO!
-- =========================================
-- El trigger ya está funcionando
-- Cada vez que se inserte un abono en la tabla "abonos",
-- se actualizarán automáticamente los saldos del cliente
-- =========================================
