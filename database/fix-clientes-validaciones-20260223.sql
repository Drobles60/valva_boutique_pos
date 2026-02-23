-- ============================================
-- FIX CLIENTES ANTIGUOS - VALIDACIONES NUEVAS
-- Fecha: 2026-02-23
-- Reglas aplicadas:
--   1) Nombre: solo letras y espacios
--   2) Teléfono: solo números
--   3) Cédula/Identificación: solo números
-- ============================================

USE valva_boutique_pos;

-- Diagnóstico inicial
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
  SUM(
    TRIM(IFNULL(identificacion, '')) <> ''
    AND identificacion REGEXP '[^0-9]'
  ) AS identificaciones_invalidas
FROM clientes;

-- Respaldo de clientes que requieren corrección
DROP TABLE IF EXISTS backup_clientes_validaciones_20260223;
CREATE TABLE backup_clientes_validaciones_20260223 AS
SELECT
  id,
  nombre,
  telefono,
  identificacion,
  estado,
  NOW() AS fecha_backup
FROM clientes
WHERE
  TRIM(IFNULL(nombre, '')) = ''
  OR nombre REGEXP '[^A-Za-zÁÉÍÓÚáéíóúÑñÜü[:space:]]'
  OR TRIM(IFNULL(telefono, '')) = ''
  OR telefono REGEXP '[^0-9]'
  OR (TRIM(IFNULL(identificacion, '')) <> '' AND identificacion REGEXP '[^0-9]');

-- Corrección de datos
-- Nota: usa REGEXP_REPLACE (MySQL 8+)
UPDATE clientes
SET
  nombre = CASE
    WHEN TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(IFNULL(nombre, ''), '[^A-Za-zÁÉÍÓÚáéíóúÑñÜü[:space:]]', ''),
        '[[:space:]]+',
        ' '
      )
    ) = ''
    THEN 'CLIENTE SIN NOMBRE'
    ELSE TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(IFNULL(nombre, ''), '[^A-Za-zÁÉÍÓÚáéíóúÑñÜü[:space:]]', ''),
        '[[:space:]]+',
        ' '
      )
    )
  END,
  telefono = CASE
    WHEN TRIM(REGEXP_REPLACE(IFNULL(telefono, ''), '[^0-9]', '')) = ''
    THEN '0000000000'
    ELSE TRIM(REGEXP_REPLACE(IFNULL(telefono, ''), '[^0-9]', ''))
  END,
  identificacion = CASE
    WHEN TRIM(IFNULL(identificacion, '')) = '' THEN NULL
    WHEN TRIM(REGEXP_REPLACE(IFNULL(identificacion, ''), '[^0-9]', '')) = '' THEN NULL
    ELSE TRIM(REGEXP_REPLACE(IFNULL(identificacion, ''), '[^0-9]', ''))
  END
WHERE
  TRIM(IFNULL(nombre, '')) = ''
  OR nombre REGEXP '[^A-Za-zÁÉÍÓÚáéíóúÑñÜü[:space:]]'
  OR TRIM(IFNULL(telefono, '')) = ''
  OR telefono REGEXP '[^0-9]'
  OR (TRIM(IFNULL(identificacion, '')) <> '' AND identificacion REGEXP '[^0-9]');

-- Reporte de cambios aplicados
SELECT
  c.id,
  b.nombre AS nombre_antes,
  c.nombre AS nombre_despues,
  b.telefono AS telefono_antes,
  c.telefono AS telefono_despues,
  b.identificacion AS identificacion_antes,
  c.identificacion AS identificacion_despues,
  c.estado
FROM clientes c
INNER JOIN backup_clientes_validaciones_20260223 b ON b.id = c.id
ORDER BY c.id;

-- Diagnóstico final
SELECT
  COUNT(*) AS total_clientes,
  SUM(
    TRIM(IFNULL(nombre, '')) = ''
    OR nombre REGEXP '[^A-Za-zÁÉÍÓÚáéíóúÑñÜü[:space:]]'
  ) AS nombres_invalidos_restantes,
  SUM(
    TRIM(IFNULL(telefono, '')) = ''
    OR telefono REGEXP '[^0-9]'
  ) AS telefonos_invalidos_restantes,
  SUM(
    TRIM(IFNULL(identificacion, '')) <> ''
    AND identificacion REGEXP '[^0-9]'
  ) AS identificaciones_invalidas_restantes
FROM clientes;

-- Clientes sin identificación (revisión manual)
SELECT
  id,
  nombre,
  telefono,
  identificacion,
  estado
FROM clientes
WHERE TRIM(IFNULL(identificacion, '')) = ''
ORDER BY id;

SELECT 'Corrección de clientes completada. Revisa backup_clientes_validaciones_20260223 para auditoría.' AS resultado;
