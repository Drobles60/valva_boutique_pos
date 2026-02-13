-- ============================================
-- ACTUALIZAR DESCUENTOS A MAYÚSCULAS
-- ============================================
-- Script simple para DBeaver (sin triggers)
-- El backend ya convierte automáticamente a mayúsculas

USE valva_boutique_pos;

-- Ver datos actuales
SELECT '=== DESCUENTOS ACTUALES ===' AS Info;
SELECT id, nombre, descripcion FROM descuentos LIMIT 10;

-- Actualizar descuentos existentes a mayúsculas
UPDATE descuentos 
SET nombre = UPPER(nombre),
    descripcion = UPPER(descripcion)
WHERE nombre != UPPER(nombre) 
   OR (descripcion IS NOT NULL AND descripcion != UPPER(descripcion));

-- Ver datos actualizados
SELECT '=== DESCUENTOS ACTUALIZADOS ===' AS Info;
SELECT id, nombre, descripcion FROM descuentos LIMIT 10;

-- Mensaje de confirmación
SELECT CONCAT('✓ ', ROW_COUNT(), ' descuentos actualizados a mayúsculas') AS Resultado;
SELECT '✓ El backend garantiza que todo lo nuevo se guarde en mayúsculas' AS Info;
