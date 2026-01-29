-- Eliminar triggers antiguos
DROP TRIGGER IF EXISTS after_abono_insert;
DROP TRIGGER IF EXISTS after_abono_delete;

-- Crear trigger correcto para insertar abonos
DELIMITER //

CREATE TRIGGER after_abono_insert
AFTER INSERT ON abonos_pedidos
FOR EACH ROW
BEGIN
  -- Actualizar sumando al total abonado y restando del saldo pendiente
  UPDATE pedidos 
  SET total_abonado = total_abonado + NEW.monto,
      saldo_pendiente = saldo_pendiente - NEW.monto
  WHERE id = NEW.pedido_id;
END//

-- Crear trigger correcto para eliminar abonos
CREATE TRIGGER after_abono_delete
AFTER DELETE ON abonos_pedidos
FOR EACH ROW
BEGIN
  -- Actualizar restando del total abonado y sumando al saldo pendiente
  UPDATE pedidos 
  SET total_abonado = total_abonado - OLD.monto,
      saldo_pendiente = saldo_pendiente + OLD.monto
  WHERE id = OLD.pedido_id;
END//

DELIMITER ;

-- Verificar que los triggers se crearon correctamente
SHOW TRIGGERS WHERE `Table` = 'abonos_pedidos';
