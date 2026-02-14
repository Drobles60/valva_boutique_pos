-- =========================================
-- EVENTO PARA DESACTIVAR DESCUENTOS VENCIDOS
-- =========================================
-- Este evento se ejecuta automáticamente cada día a medianoche
-- y desactiva los descuentos cuya fecha de fin ya pasó.

-- Habilitar el programador de eventos (si no está habilitado)
SET GLOBAL event_scheduler = ON;

-- Eliminar el evento si ya existe
DROP EVENT IF EXISTS desactivar_descuentos_vencidos;

-- Crear el evento
DELIMITER $$

CREATE EVENT desactivar_descuentos_vencidos
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY  -- Comienza mañana a medianoche
DO
BEGIN
  -- Actualizar descuentos vencidos a estado inactivo
  UPDATE descuentos 
  SET estado = 'inactivo' 
  WHERE fecha_fin IS NOT NULL 
    AND fecha_fin < CURDATE() 
    AND estado = 'activo';
    
  -- Log opcional: puedes crear una tabla de logs si deseas registrar cuándo se ejecutó
  -- INSERT INTO logs_eventos (evento, fecha, registros_afectados) 
  -- VALUES ('desactivar_descuentos_vencidos', NOW(), ROW_COUNT());
END$$

DELIMITER ;

-- Verificar que el evento está activo
SHOW EVENTS WHERE Name = 'desactivar_descuentos_vencidos';

-- Para ver el estado del programador de eventos
SHOW VARIABLES LIKE 'event_scheduler';

-- NOTAS DE USO:
-- 1. Este evento se ejecutará automáticamente cada día
-- 2. Si necesitas ejecutarlo manualmente antes, ejecuta:
--    UPDATE descuentos SET estado = 'inactivo' 
--    WHERE fecha_fin IS NOT NULL AND fecha_fin < CURDATE() AND estado = 'activo';
-- 3. Para desactivar el evento: DROP EVENT desactivar_descuentos_vencidos;
-- 4. La API también verifica y actualiza descuentos vencidos cada vez que se consultan
