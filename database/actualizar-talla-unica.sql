-- ============================================
-- ACTUALIZAR TALLA ÚNICA A "U"
-- ============================================
-- Ejecutar este script en DBeaver para cambiar ÚNICA por U

USE valva_boutique_pos;

-- Ver talla actual
SELECT '=== TALLA ACTUAL ===' AS Info;
SELECT * FROM tallas WHERE sistema_talla_id = 5;

-- Actualizar la talla del sistema 5 de 'ÚNICA' a 'U'
UPDATE tallas 
SET valor = 'U',
    descripcion = 'Talla única'
WHERE sistema_talla_id = 5;

-- Verificar cambio
SELECT '=== TALLA ACTUALIZADA ===' AS Info;
SELECT * FROM tallas WHERE sistema_talla_id = 5;

-- Mensaje de confirmación
SELECT '✓ Talla única actualizada correctamente a "U"' AS Resultado;
