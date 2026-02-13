-- ============================================
-- LIMPIEZA Y REINSERCIÓN COMPLETA DE CONJUNTOS
-- ============================================
-- Ejecutar este script en DBeaver línea por línea o en bloques

-- PASO 1: Eliminar todos los tipos de prenda de la categoría Conjunto
-- Esto eliminará automáticamente las relaciones en tipo_prenda_sistema_talla
-- gracias al ON DELETE CASCADE
DELETE FROM tipos_prenda WHERE categoria_padre_id = 3;

-- PASO 2: Eliminar tipos de prenda con IDs 27-34 si existen en otras categorías
-- (por si quedaron huérfanos)
DELETE FROM tipos_prenda WHERE id BETWEEN 27 AND 34;

-- PASO 3: Reiniciar el AUTO_INCREMENT de tipos_prenda
-- Primero verificamos cuál es el ID más alto
SELECT MAX(id) FROM tipos_prenda;
-- Si el máximo es menor a 27, podemos ajustar el AUTO_INCREMENT a 27
-- Si es mayor, lo dejamos como está

-- PASO 4: Insertar los tipos de prenda de conjuntos con IDs explícitos
INSERT INTO tipos_prenda (id, categoria_padre_id, nombre, descripcion, orden, estado) VALUES
(27, 3, 'Conjunto Deportivo', 'Conjunto para actividades deportivas', 1, 'activo'),
(28, 3, 'Conjunto Casual', 'Conjunto de uso diario', 2, 'activo'),
(29, 3, 'Conjunto de Vestir', 'Conjunto formal elegante', 3, 'activo'),
(30, 3, 'Conjunto Crop Top + Falda', 'Conjunto de dos piezas con crop top', 4, 'activo'),
(31, 3, 'Conjunto Blusa + Pantalón', 'Conjunto coordinado de blusa y pantalón', 5, 'activo'),
(32, 3, 'Conjunto Top + Short', 'Conjunto de top y short', 6, 'activo'),
(33, 3, 'Conjunto Blazer + Pantalón', 'Conjunto ejecutivo', 7, 'activo'),
(34, 3, 'Conjunto Playero', 'Conjunto para playa o piscina', 8, 'activo');

-- PASO 5: Insertar las relaciones con sistemas de tallas
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
-- Conjunto Deportivo (27)
(27, 1),  -- Tallas Estándar Mujer (Letras)
(27, 2),  -- Tallas Numéricas Mujer
(27, 5),  -- Talla Única

-- Conjunto Casual (28)
(28, 1),  -- Tallas Estándar Mujer (Letras)
(28, 2),  -- Tallas Numéricas Mujer
(28, 5),  -- Talla Única

-- Conjunto de Vestir (29)
(29, 1),  -- Tallas Estándar Mujer (Letras)
(29, 2),  -- Tallas Numéricas Mujer
(29, 5),  -- Talla Única

-- Conjunto Crop Top + Falda (30)
(30, 1),  -- Tallas Estándar Mujer (Letras)
(30, 5),  -- Talla Única

-- Conjunto Blusa + Pantalón (31)
(31, 2),  -- Tallas Numéricas Mujer
(31, 5),  -- Talla Única

-- Conjunto Top + Short (32)
(32, 1),  -- Tallas Estándar Mujer (Letras)
(32, 5),  -- Talla Única

-- Conjunto Blazer + Pantalón (33)
(33, 1),  -- Tallas Estándar Mujer (Letras)
(33, 5),  -- Talla Única

-- Conjunto Playero (34)
(34, 3),  -- Tallas Jeans Mujer
(34, 5);  -- Talla Única

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que se insertaron los 8 tipos de prenda
SELECT 
    tp.id,
    tp.nombre,
    tp.orden,
    tp.estado
FROM tipos_prenda tp
WHERE tp.categoria_padre_id = 3
ORDER BY tp.orden;

-- Verificar que cada conjunto tiene sus sistemas de tallas
SELECT 
    tp.id,
    tp.nombre AS tipo_prenda,
    GROUP_CONCAT(st.nombre ORDER BY st.id SEPARATOR ' | ') AS sistemas_tallas_disponibles,
    COUNT(st.id) AS cantidad_sistemas
FROM tipos_prenda tp
INNER JOIN tipo_prenda_sistema_talla tpst ON tp.id = tpst.tipo_prenda_id
INNER JOIN sistemas_tallas st ON tpst.sistema_talla_id = st.id
WHERE tp.categoria_padre_id = 3
GROUP BY tp.id, tp.nombre
ORDER BY tp.id;

-- Verificar que todos tienen acceso a Talla Única (sistema 5)
SELECT 
    tp.id,
    tp.nombre,
    'Sí' AS tiene_talla_unica
FROM tipos_prenda tp
INNER JOIN tipo_prenda_sistema_talla tpst ON tp.id = tpst.tipo_prenda_id
WHERE tp.categoria_padre_id = 3 
AND tpst.sistema_talla_id = 5
ORDER BY tp.id;
