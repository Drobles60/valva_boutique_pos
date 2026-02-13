-- ============================================
-- TRIGGERS PARA CONVERTIR A MAYÚSCULAS
-- ============================================
-- Compatible con DBeaver (sin DELIMITER necesario)

USE valva_boutique_pos;

-- =============================================
-- TRIGGERS PARA PRODUCTOS
-- =============================================

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS productos_nombre_mayusculas_insert;
DROP TRIGGER IF EXISTS productos_nombre_mayusculas_update;

-- Trigger para INSERT (ejecutar este bloque completo de una sola vez)
CREATE TRIGGER productos_nombre_mayusculas_insert
BEFORE INSERT ON productos
FOR EACH ROW
SET NEW.nombre = UPPER(NEW.nombre);

-- Trigger para UPDATE (ejecutar este bloque completo de una sola vez)
CREATE TRIGGER productos_nombre_mayusculas_update
BEFORE UPDATE ON productos
FOR EACH ROW
SET NEW.nombre = UPPER(NEW.nombre);

-- =============================================
-- TRIGGERS PARA DESCUENTOS
-- =============================================

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS descuentos_mayusculas_insert;
DROP TRIGGER IF EXISTS descuentos_mayusculas_update;

-- Trigger para INSERT (ejecutar este bloque completo de una sola vez)
CREATE TRIGGER descuentos_mayusculas_insert
BEFORE INSERT ON descuentos
FOR EACH ROW
SET NEW.nombre = UPPER(NEW.nombre), 
    NEW.descripcion = IF(NEW.descripcion IS NOT NULL, UPPER(NEW.descripcion), NEW.descripcion);

-- Trigger para UPDATE (ejecutar este bloque completo de una sola vez)
CREATE TRIGGER descuentos_mayusculas_update
BEFORE UPDATE ON descuentos
FOR EACH ROW
SET NEW.nombre = UPPER(NEW.nombre), 
    NEW.descripcion = IF(NEW.descripcion IS NOT NULL, UPPER(NEW.descripcion), NEW.descripcion);

-- =============================================
-- ACTUALIZAR DATOS EXISTENTES
-- =============================================

-- Actualizar productos existentes para convertir sus nombres a mayúsculas
UPDATE productos 
SET nombre = UPPER(nombre)
WHERE nombre != UPPER(nombre);

-- Actualizar descuentos existentes
UPDATE descuentos 
SET nombre = UPPER(nombre),
    descripcion = UPPER(descripcion)
WHERE nombre != UPPER(nombre) 
   OR (descripcion IS NOT NULL AND descripcion != UPPER(descripcion));

-- =============================================
-- VERIFICACIÓN
-- =============================================

-- Verificar que los triggers se crearon correctamente
SELECT 
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'valva_boutique_pos'
AND (EVENT_OBJECT_TABLE = 'productos' OR EVENT_OBJECT_TABLE = 'descuentos')
AND (TRIGGER_NAME LIKE '%nombre_mayusculas%' OR TRIGGER_NAME LIKE '%mayusculas%')
ORDER BY EVENT_OBJECT_TABLE, TRIGGER_NAME;

-- Mensaje de confirmación
SELECT '✓ Triggers de mayúsculas creados correctamente para productos y descuentos' AS Resultado;
