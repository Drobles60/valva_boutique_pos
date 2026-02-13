-- ============================================
-- SOLUCIÓN DEFINITIVA PARA CONJUNTOS
-- ============================================
-- Ejecutar este script completo en DBeaver

USE valva_boutique_pos;

-- PASO 1: DIAGNÓSTICO
-- ============================================
SELECT '=== PASO 1: DIAGNÓSTICO ===' AS Info;

-- Ver todas las categorías padre
SELECT 'Categorías Padre:' AS Info;
SELECT * FROM categorias_padre ORDER BY id;

-- Ver cuántos tipos de prenda por categoría
SELECT 'Conteo de Tipos por Categoría:' AS Info;
SELECT 
    cp.id AS categoria_id,
    cp.nombre AS categoria,
    COUNT(tp.id) AS cantidad_tipos,
    GROUP_CONCAT(tp.id ORDER BY tp.id) AS ids_tipos_prenda
FROM categorias_padre cp
LEFT JOIN tipos_prenda tp ON cp.id = tp.categoria_padre_id AND tp.estado = 'activo'
GROUP BY cp.id, cp.nombre
ORDER BY cp.id;

-- Ver todos los tipos de prenda existentes relacionados con conjuntos o con IDs 74-81
SELECT 'Tipos de Prenda Existentes (Categoría 3 o IDs 74-81):' AS Info;
SELECT * FROM tipos_prenda 
WHERE categoria_padre_id = 3 OR id BETWEEN 74 AND 81
ORDER BY id;

-- PASO 2: LIMPIEZA
-- ============================================
SELECT '=== PASO 2: LIMPIEZA ===' AS Info;

-- Deshabilitar temporalmente las verificaciones de foreign keys
SET FOREIGN_KEY_CHECKS=0;

-- 1. Actualizar productos que usan tipos de prenda 74-81 (establecerlos a NULL temporalmente)
UPDATE productos 
SET tipo_prenda_id = NULL 
WHERE tipo_prenda_id BETWEEN 74 AND 81;

-- 2. Eliminar relaciones en tipo_prenda_sistema_talla
DELETE FROM tipo_prenda_sistema_talla 
WHERE tipo_prenda_id BETWEEN 74 AND 81;

-- 3. Eliminar relaciones en tipo_prenda_sistema_talla para categoria 3
DELETE tpst FROM tipo_prenda_sistema_talla tpst
INNER JOIN tipos_prenda tp ON tpst.tipo_prenda_id = tp.id
WHERE tp.categoria_padre_id = 3;

-- 4. Eliminar tipos de prenda de categoría 3
DELETE FROM tipos_prenda WHERE categoria_padre_id = 3;

-- 5. Eliminar tipos de prenda con IDs 74-81 (por si están en otra categoría)
DELETE FROM tipos_prenda WHERE id BETWEEN 74 AND 81;

-- Reactivar las verificaciones de foreign keys
SET FOREIGN_KEY_CHECKS=1;

SELECT '✓ Limpieza completada' AS Resultado;

-- PASO 3: INSERCIÓN DE DATOS
-- ============================================
SELECT '=== PASO 3: INSERCIÓN DE TIPOS DE PRENDA ===' AS Info;

-- Insertar tipos de prenda de conjuntos con IDs explícitos
INSERT INTO tipos_prenda (id, categoria_padre_id, nombre, descripcion, orden, estado) VALUES
(74, 3, 'Conjunto Deportivo', 'Conjunto para actividades deportivas', 1, 'activo'),
(75, 3, 'Conjunto Casual', 'Conjunto de uso diario', 2, 'activo'),
(76, 3, 'Conjunto de Vestir', 'Conjunto formal elegante', 3, 'activo'),
(77, 3, 'Conjunto Crop Top + Falda', 'Conjunto de dos piezas con crop top', 4, 'activo'),
(78, 3, 'Conjunto Blusa + Pantalón', 'Conjunto coordinado de blusa y pantalón', 5, 'activo'),
(79, 3, 'Conjunto Top + Short', 'Conjunto de top y short', 6, 'activo'),
(80, 3, 'Conjunto Blazer + Pantalón', 'Conjunto ejecutivo', 7, 'activo'),
(81, 3, 'Conjunto Playero', 'Conjunto para playa o piscina', 8, 'activo');

SELECT CONCAT('✓ Insertados ', ROW_COUNT(), ' tipos de prenda') AS Resultado;

-- ADVERTENCIA: Productos afectados
SELECT '⚠ IMPORTANTE: Productos sin tipo de prenda' AS Info;
SELECT 
    COUNT(*) AS productos_sin_tipo,
    'Estos productos tenían tipos de prenda 74-81 y ahora están en NULL' AS descripcion
FROM productos 
WHERE tipo_prenda_id IS NULL;

SELECT 
    id,
    codigo_barras,
    nombre,
    'Necesita reasignar tipo de prenda' AS accion
FROM productos 
WHERE tipo_prenda_id IS NULL
LIMIT 10;

-- PASO 4: INSERCIÓN DE RELACIONES CON SISTEMAS DE TALLAS
-- ============================================
SELECT '=== PASO 4: RELACIONES CON SISTEMAS DE TALLAS ===' AS Info;

-- Primero eliminar cualquier relación existente para los IDs 74-81
DELETE FROM tipo_prenda_sistema_talla 
WHERE tipo_prenda_id BETWEEN 74 AND 81;

-- Ahora insertar las nuevas relaciones (solo Talla Única para todos los conjuntos)
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
-- Todos los conjuntos solo con Talla Única
(74, 5),  -- Conjunto Deportivo
(75, 5),  -- Conjunto Casual
(76, 5),  -- Conjunto de Vestir
(77, 5),  -- Conjunto Crop Top + Falda
(78, 5),  -- Conjunto Blusa + Pantalón
(79, 5),  -- Conjunto Top + Short
(80, 5),  -- Conjunto Blazer + Pantalón
(81, 5);  -- Conjunto Playero

SELECT CONCAT('✓ Insertadas ', ROW_COUNT(), ' relaciones con sistemas de tallas') AS Resultado;

-- PASO 5: VERIFICACIÓN FINAL
-- ============================================
SELECT '=== PASO 5: VERIFICACIÓN FINAL ===' AS Info;

-- Confirmar tipos de prenda insertados
SELECT '✓ Tipos de Prenda de Conjuntos:' AS Info;
SELECT 
    tp.id,
    tp.categoria_padre_id,
    tp.nombre,
    tp.orden,
    tp.estado
FROM tipos_prenda tp
WHERE tp.categoria_padre_id = 3
ORDER BY tp.orden;

-- Confirmar relaciones con sistemas de tallas
SELECT '✓ Sistemas de Tallas por Conjunto:' AS Info;
SELECT 
    tp.id,
    tp.nombre AS conjunto,
    st.id AS sistema_id,
    st.nombre AS sistema_talla
FROM tipos_prenda tp
INNER JOIN tipo_prenda_sistema_talla tpst ON tp.id = tpst.tipo_prenda_id
INNER JOIN sistemas_tallas st ON tpst.sistema_talla_id = st.id
WHERE tp.categoria_padre_id = 3
ORDER BY tp.id, st.id;

-- Confirmar que todos tienen talla única
SELECT '✓ Conjuntos con Talla Única:' AS Info;
SELECT 
    tp.id,
    tp.nombre,
    'SÍ' AS tiene_talla_unica
FROM tipos_prenda tp
INNER JOIN tipo_prenda_sistema_talla tpst ON tp.id = tpst.tipo_prenda_id
WHERE tp.categoria_padre_id = 3 
AND tpst.sistema_talla_id = 5
ORDER BY tp.id;

-- Conteo final
SELECT '✓ Resumen Final:' AS Info;
SELECT 
    'Conjuntos' AS categoria,
    COUNT(DISTINCT tp.id) AS total_tipos,
    COUNT(DISTINCT tpst.sistema_talla_id) AS total_sistemas_relacionados
FROM tipos_prenda tp
LEFT JOIN tipo_prenda_sistema_talla tpst ON tp.id = tpst.tipo_prenda_id
WHERE tp.categoria_padre_id = 3;

SELECT '=== COMPLETADO ===' AS Info;
