-- ============================================
-- DIAGNÓSTICO COMPLETO DE CONJUNTOS
-- ============================================

-- 1. Ver todas las categorías padre
SELECT * FROM categorias_padre ORDER BY id;

-- 2. Ver cuántos tipos de prenda hay por categoría
SELECT 
    cp.id,
    cp.nombre AS categoria,
    cp.estado AS categoria_estado,
    COUNT(tp.id) AS cantidad_tipos
FROM categorias_padre cp
LEFT JOIN tipos_prenda tp ON cp.id = tp.categoria_padre_id
GROUP BY cp.id, cp.nombre, cp.estado
ORDER BY cp.id;

-- 3. Ver TODOS los tipos de prenda de conjuntos (incluyendo inactivos)
SELECT 
    tp.id,
    tp.categoria_padre_id,
    tp.nombre,
    tp.descripcion,
    tp.orden,
    tp.estado
FROM tipos_prenda tp
WHERE tp.categoria_padre_id = 3
ORDER BY tp.id;

-- 4. Ver si existen tipos de prenda con IDs 27-34
SELECT 
    tp.id,
    tp.categoria_padre_id,
    cp.nombre AS categoria,
    tp.nombre AS tipo_prenda,
    tp.estado
FROM tipos_prenda tp
LEFT JOIN categorias_padre cp ON tp.categoria_padre_id = cp.id
WHERE tp.id BETWEEN 27 AND 34
ORDER BY tp.id;

-- 5. Ver las relaciones de tallas para conjuntos
SELECT 
    tp.id,
    tp.nombre AS tipo_prenda,
    st.id AS sistema_id,
    st.nombre AS sistema_talla
FROM tipos_prenda tp
LEFT JOIN tipo_prenda_sistema_talla tpst ON tp.id = tpst.tipo_prenda_id
LEFT JOIN sistemas_tallas st ON tpst.sistema_talla_id = st.id
WHERE tp.categoria_padre_id = 3
ORDER BY tp.id, st.id;

-- 6. Ver el AUTO_INCREMENT actual de tipos_prenda
SELECT AUTO_INCREMENT 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'tipos_prenda';
