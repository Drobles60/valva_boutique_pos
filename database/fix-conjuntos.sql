-- ============================================
-- SCRIPT PARA SOLUCIONAR TIPOS DE PRENDA FALTANTES
-- ============================================

-- Verificar cuántos tipos de prenda hay por categoría
SELECT 
    cp.id,
    cp.nombre AS categoria,
    COUNT(tp.id) AS cantidad_tipos
FROM categorias_padre cp
LEFT JOIN tipos_prenda tp ON cp.id = tp.categoria_padre_id
GROUP BY cp.id, cp.nombre
ORDER BY cp.id;

-- Ver específicamente los conjuntos
SELECT * FROM tipos_prenda WHERE categoria_padre_id = 3;

-- ============================================
-- INSERTAR TIPOS DE PRENDA FALTANTES PARA CONJUNTOS
-- ============================================
-- Usar INSERT IGNORE para no duplicar si ya existen

INSERT IGNORE INTO tipos_prenda (id, categoria_padre_id, nombre, descripcion, orden, estado) VALUES
(27, 3, 'Conjunto Deportivo', 'Conjunto para actividades deportivas', 1, 'activo'),
(28, 3, 'Conjunto Casual', 'Conjunto de uso diario', 2, 'activo'),
(29, 3, 'Conjunto de Vestir', 'Conjunto formal elegante', 3, 'activo'),
(30, 3, 'Conjunto Crop Top + Falda', 'Conjunto de dos piezas con crop top', 4, 'activo'),
(31, 3, 'Conjunto Blusa + Pantalón', 'Conjunto coordinado de blusa y pantalón', 5, 'activo'),
(32, 3, 'Conjunto Top + Short', 'Conjunto de top y short', 6, 'activo'),
(33, 3, 'Conjunto Blazer + Pantalón', 'Conjunto ejecutivo', 7, 'activo'),
(34, 3, 'Conjunto Playero', 'Conjunto para playa o piscina', 8, 'activo');

-- ============================================
-- INSERTAR RELACIONES CON SISTEMAS DE TALLAS PARA CONJUNTOS
-- ============================================

INSERT IGNORE INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
-- Conjunto Deportivo
(27, 1),  -- Letras
(27, 2),  -- Numéricas
(27, 5),  -- Talla Única

-- Conjunto Casual
(28, 1),  -- Letras
(28, 2),  -- Numéricas
(28, 5),  -- Talla Única

-- Conjunto de Vestir
(29, 1),  -- Letras
(29, 2),  -- Numéricas
(29, 5),  -- Talla Única

-- Conjunto Crop Top + Falda
(30, 1),  -- Letras
(30, 5),  -- Talla Única

-- Conjunto Blusa + Pantalón
(31, 2),  -- Numéricas
(31, 5),  -- Talla Única

-- Conjunto Top + Short
(32, 1),  -- Letras
(32, 5),  -- Talla Única

-- Conjunto Blazer + Pantalón
(33, 1),  -- Letras
(33, 5),  -- Talla Única

-- Conjunto Playero
(34, 3),  -- Tallas Jeans
(34, 5);  -- Talla Única

-- ============================================
-- VERIFICAR QUE SE INSERTARON CORRECTAMENTE
-- ============================================

-- Verificar los tipos de prenda de conjuntos
SELECT 
    tp.id,
    tp.nombre,
    tp.descripcion,
    tp.estado
FROM tipos_prenda tp
WHERE tp.categoria_padre_id = 3
ORDER BY tp.orden;

-- Verificar las relaciones de conjuntos con sistemas de tallas
SELECT 
    tp.id,
    tp.nombre AS tipo_prenda,
    st.id AS sistema_id,
    st.nombre AS sistema_talla
FROM tipos_prenda tp
INNER JOIN tipo_prenda_sistema_talla tpst ON tp.id = tpst.tipo_prenda_id
INNER JOIN sistemas_tallas st ON tpst.sistema_talla_id = st.id
WHERE tp.categoria_padre_id = 3
ORDER BY tp.id, st.id;
