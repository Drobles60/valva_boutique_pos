-- Script de verificación rápida de datos
-- Ejecutar en MySQL para verificar que los datos estén cargados

USE valva_boutique_pos;

-- Verificar categorías padre
SELECT 'CATEGORÍAS PADRE' as tabla, COUNT(*) as total FROM categorias_padre;
SELECT * FROM categorias_padre;

-- Verificar tipos de prenda
SELECT 'TIPOS DE PRENDA' as tabla, COUNT(*) as total FROM tipos_prenda;
SELECT categoria_padre_id, COUNT(*) as cantidad FROM tipos_prenda GROUP BY categoria_padre_id;

-- Verificar tallas
SELECT 'TALLAS' as tabla, COUNT(*) as total FROM tallas;

-- Verificar proveedores
SELECT 'PROVEEDORES' as tabla, COUNT(*) as total FROM proveedores;
