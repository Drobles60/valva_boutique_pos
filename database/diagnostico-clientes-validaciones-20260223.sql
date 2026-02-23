-- ============================================
-- DIAGNÓSTICO CLIENTES - VALIDACIONES NUEVAS
-- Fecha: 2026-02-23
-- Este script NO modifica datos.
-- ============================================

USE valva_boutique_pos;

-- Resumen general
SELECT
  COUNT(*) AS total_clientes,
  SUM(
    TRIM(IFNULL(nombre, '')) = ''
    OR nombre REGEXP '[^A-Za-zÁÉÍÓÚáéíóúÑñÜü[:space:]]'
  ) AS nombres_invalidos,
  SUM(
    TRIM(IFNULL(telefono, '')) = ''
    OR telefono REGEXP '[^0-9]'
  ) AS telefonos_invalidos,
  SUM(TRIM(IFNULL(identificacion, '')) = '') AS identificaciones_vacias,
  SUM(
    TRIM(IFNULL(identificacion, '')) <> ''
    AND identificacion REGEXP '[^0-9]'
  ) AS identificaciones_invalidas_no_numericas
FROM clientes;

-- Detalle de nombres inválidos
SELECT
  id,
  nombre,
  telefono,
  identificacion,
  estado,
  CASE
    WHEN TRIM(IFNULL(nombre, '')) = '' THEN 'VACIO'
    WHEN nombre REGEXP '[^A-Za-zÁÉÍÓÚáéíóúÑñÜü[:space:]]' THEN 'CARACTERES_INVALIDOS'
    ELSE 'OK'
  END AS motivo_nombre
FROM clientes
WHERE
  TRIM(IFNULL(nombre, '')) = ''
  OR nombre REGEXP '[^A-Za-zÁÉÍÓÚáéíóúÑñÜü[:space:]]'
ORDER BY id;

-- Detalle de teléfonos inválidos
SELECT
  id,
  nombre,
  telefono,
  identificacion,
  estado,
  CASE
    WHEN TRIM(IFNULL(telefono, '')) = '' THEN 'VACIO'
    WHEN telefono REGEXP '[^0-9]' THEN 'CARACTERES_INVALIDOS'
    ELSE 'OK'
  END AS motivo_telefono,
  REGEXP_REPLACE(IFNULL(telefono, ''), '[^0-9]', '') AS telefono_sugerido
FROM clientes
WHERE
  TRIM(IFNULL(telefono, '')) = ''
  OR telefono REGEXP '[^0-9]'
ORDER BY id;

-- Clientes sin identificación (para completar manualmente)
SELECT
  id,
  nombre,
  telefono,
  identificacion,
  estado
FROM clientes
WHERE TRIM(IFNULL(identificacion, '')) = ''
ORDER BY id;

-- Clientes con identificación no numérica
SELECT
  id,
  nombre,
  telefono,
  identificacion,
  REGEXP_REPLACE(IFNULL(identificacion, ''), '[^0-9]', '') AS identificacion_sugerida,
  estado
FROM clientes
WHERE
  TRIM(IFNULL(identificacion, '')) <> ''
  AND identificacion REGEXP '[^0-9]'
ORDER BY id;

SELECT 'Diagnóstico completado. No se realizaron cambios.' AS resultado;
