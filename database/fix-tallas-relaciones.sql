-- ============================================
-- FIX: RELACIONES TIPO_PRENDA - SISTEMA_TALLA
-- ============================================
-- Este script corrige las relaciones faltantes

USE valva_boutique_pos;

-- Limpiar relaciones existentes para evitar duplicados
DELETE FROM tipo_prenda_sistema_talla;

-- PANTALONES (IDs 1-12) → Tallas Numéricas y Jeans
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
-- Pantalones formales y casuales → Tallas Numéricas (2-16)
(1, 2),   -- Pantalón de Vestir → Numéricas
(2, 2),   -- Pantalón Casual → Numéricas
(3, 2),   -- Pantalón Cargo → Numéricas
(4, 1),   -- Pantalón Palazzo → Letras (XS-XXL)
(5, 2),   -- Pantalón Capri → Numéricas
(6, 1),   -- Leggings → Letras (XS-XXL)
(7, 1),   -- Joggers → Letras (XS-XXL)
(8, 2),   -- Pantalón Acampanado → Numéricas
(9, 2),   -- Pantalón Recto → Numéricas
(10, 2),  -- Pantalón Pitillo → Numéricas
(11, 3),  -- Pantalón Jean → Tallas Jeans (24-34)
(12, 2);  -- Pantalón Lino → Numéricas

-- BLUSAS (IDs 13-26) → Tallas Estándar (Letras)
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(13, 1),  -- Blusa Manga Larga → Letras (XS-XXL)
(14, 1),  -- Blusa Manga Corta → Letras (XS-XXL)
(15, 1),  -- Blusa Sin Mangas → Letras (XS-XXL)
(16, 1),  -- Blusa de Encaje → Letras (XS-XXL)
(17, 1),  -- Blusa Campesina → Letras (XS-XXL)
(18, 1),  -- Blusa Crop Top → Letras (XS-XXL)
(19, 1),  -- Blusa Oversize → Letras (XS-XXL)
(20, 1),  -- Blusa con Botones → Letras (XS-XXL)
(21, 1),  -- Blusa Cuello V → Letras (XS-XXL)
(22, 1),  -- Blusa Cuello Redondo → Letras (XS-XXL)
(23, 1),  -- Blusa Estampada → Letras (XS-XXL)
(24, 1),  -- Blusa Lisa → Letras (XS-XXL)
(25, 1),  -- Blusa Satinada → Letras (XS-XXL)
(26, 1);  -- Blusa Transparente → Letras (XS-XXL)

-- CONJUNTOS (IDs 27-34) → Tallas Estándar (Letras)
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(27, 1),  -- Conjunto Deportivo → Letras (XS-XXL)
(28, 1),  -- Conjunto Casual → Letras (XS-XXL)
(29, 1),  -- Conjunto de Vestir → Letras (XS-XXL)
(30, 1),  -- Conjunto Crop Top + Falda → Letras (XS-XXL)
(31, 1),  -- Conjunto Blusa + Pantalón → Letras (XS-XXL)
(32, 1),  -- Conjunto Top + Short → Letras (XS-XXL)
(33, 1),  -- Conjunto Blazer + Pantalón → Letras (XS-XXL)
(34, 1);  -- Conjunto Playero → Letras (XS-XXL)

-- FALDAS (IDs 35-44) → Tallas Estándar y Numéricas
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(35, 1),  -- Falda Corta → Letras (XS-XXL)
(35, 2),  -- Falda Corta → Numéricas (2-16)
(36, 1),  -- Falda Midi → Letras (XS-XXL)
(36, 2),  -- Falda Midi → Numéricas (2-16)
(37, 1),  -- Falda Larga → Letras (XS-XXL)
(37, 2),  -- Falda Larga → Numéricas (2-16)
(38, 1),  -- Falda Plisada → Letras (XS-XXL)
(39, 2),  -- Falda Tubo → Numéricas (2-16)
(40, 1),  -- Falda Acampanada → Letras (XS-XXL)
(41, 1),  -- Falda con Vuelo → Letras (XS-XXL)
(42, 3),  -- Falda Jean → Tallas Jeans (24-34)
(43, 1),  -- Falda Asimétrica → Letras (XS-XXL)
(44, 2);  -- Falda Recta → Numéricas (2-16)

-- SHORTS (IDs 45-52) → Tallas Estándar, Numéricas y Jeans
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(45, 3),  -- Short Jean → Tallas Jeans (24-34)
(46, 1),  -- Short de Tela → Letras (XS-XXL)
(47, 1),  -- Short Deportivo → Letras (XS-XXL)
(48, 2),  -- Short Cargo → Numéricas (2-16)
(49, 2),  -- Short Bermuda → Numéricas (2-16)
(50, 2),  -- Short Tiro Alto → Numéricas (2-16)
(51, 2),  -- Short Tiro Medio → Numéricas (2-16)
(52, 1);  -- Short Ciclista → Letras (XS-XXL)

-- VESTIDOS (IDs 53-63) → Tallas Estándar y Numéricas
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(53, 1),  -- Vestido Casual → Letras (XS-XXL)
(53, 2),  -- Vestido Casual → Numéricas (2-16)
(54, 1),  -- Vestido de Fiesta → Letras (XS-XXL)
(54, 2),  -- Vestido de Fiesta → Numéricas (2-16)
(55, 2),  -- Vestido Formal → Numéricas (2-16)
(56, 1),  -- Vestido Midi → Letras (XS-XXL)
(56, 2),  -- Vestido Midi → Numéricas (2-16)
(57, 1),  -- Vestido Maxi → Letras (XS-XXL)
(57, 2),  -- Vestido Maxi → Numéricas (2-16)
(58, 1),  -- Vestido Corto → Letras (XS-XXL)
(59, 2),  -- Vestido Cóctel → Numéricas (2-16)
(60, 1),  -- Vestido Camisero → Letras (XS-XXL)
(61, 2),  -- Vestido Tubo → Numéricas (2-16)
(62, 1),  -- Vestido Playero → Letras (XS-XXL)
(63, 1);  -- Vestido Acampanado → Letras (XS-XXL)

-- BOLSOS (IDs 64-73) → Talla Única
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(64, 5),  -- Bolso de Mano → Única
(65, 5),  -- Bolso Bandolera → Única
(66, 5),  -- Bolso Tote → Única
(67, 5),  -- Mochila → Única
(68, 5),  -- Clutch → Única
(69, 5),  -- Bolso Shopper → Única
(70, 5),  -- Cartera → Única
(71, 5),  -- Riñonera → Única
(72, 5),  -- Bolso Satchel → Única
(73, 5);  -- Bolso Bucket → Única

-- Verificar que se insertaron correctamente
SELECT 
    tp.id,
    tp.nombre as tipo_prenda,
    st.nombre as sistema_talla,
    COUNT(*) as num_tallas
FROM tipo_prenda_sistema_talla tpst
INNER JOIN tipos_prenda tp ON tpst.tipo_prenda_id = tp.id
INNER JOIN sistemas_tallas st ON tpst.sistema_talla_id = st.id
GROUP BY tp.id, tp.nombre, st.nombre
ORDER BY tp.id;
