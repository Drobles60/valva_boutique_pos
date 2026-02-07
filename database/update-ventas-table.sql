-- ============================================
-- ACTUALIZACIÓN DE TABLA VENTAS
-- Agregar campos tipo_venta y metodo_pago
-- ============================================
USE valva_boutique_pos;

-- Verificar si los campos ya existen antes de agregarlos
SET @dbname = 'valva_boutique_pos';
SET @tablename = 'ventas';
SET @columnname1 = 'tipo_venta';
SET @columnname2 = 'metodo_pago';

SET @preparedStatement1 = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = @columnname1
  ) > 0,
  "SELECT 'Column tipo_venta already exists'",
  "ALTER TABLE ventas ADD COLUMN tipo_venta ENUM('contado', 'credito') DEFAULT 'contado' AFTER estado"
));
PREPARE alterStatement1 FROM @preparedStatement1;
EXECUTE alterStatement1;
DEALLOCATE PREPARE alterStatement1;

SET @preparedStatement2 = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = @columnname2
  ) > 0,
  "SELECT 'Column metodo_pago already exists'",
  "ALTER TABLE ventas ADD COLUMN metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'mixto') DEFAULT 'efectivo' AFTER tipo_venta"
));
PREPARE alterStatement2 FROM @preparedStatement2;
EXECUTE alterStatement2;
DEALLOCATE PREPARE alterStatement2;

-- Modificar campo estado para usar ENUM si aún no lo es
ALTER TABLE ventas MODIFY COLUMN estado ENUM('completada', 'credito', 'anulada') DEFAULT 'completada';

-- Agregar UNIQUE a numero_venta si aún no lo tiene
-- Nota: Esto puede fallar si ya existe un índice, pero no causará problemas
ALTER TABLE ventas ADD UNIQUE INDEX idx_numero_venta (numero_venta);

-- Actualizar registros existentes con valores por defecto
UPDATE ventas SET tipo_venta = 'contado' WHERE tipo_venta IS NULL;
UPDATE ventas SET metodo_pago = 'efectivo' WHERE metodo_pago IS NULL;

SELECT 'Tabla ventas actualizada exitosamente' as mensaje;

-- ============================================
-- ACTUALIZACIÓN DE TABLA CLIENTES
-- Eliminar campos extras y ajustar a schema.sql
-- ============================================

SET @dbname = 'valva_boutique_pos';
SET @tablename = 'clientes';

-- ELIMINAR CAMPOS QUE NO ESTÁN EN EL SCHEMA
-- ============================================

-- Eliminar tipo_documento si existe
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'tipo_documento') > 0,
  "ALTER TABLE clientes DROP COLUMN tipo_documento",
  "SELECT 'Column tipo_documento does not exist'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Eliminar numero_documento si existe
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'numero_documento') > 0,
  "ALTER TABLE clientes DROP COLUMN numero_documento",
  "SELECT 'Column numero_documento does not exist'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Eliminar apellido si existe
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'apellido') > 0,
  "ALTER TABLE clientes DROP COLUMN apellido",
  "SELECT 'Column apellido does not exist'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Eliminar razon_social si existe
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'razon_social') > 0,
  "ALTER TABLE clientes DROP COLUMN razon_social",
  "SELECT 'Column razon_social does not exist'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Eliminar celular si existe
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'celular') > 0,
  "ALTER TABLE clientes DROP COLUMN celular",
  "SELECT 'Column celular does not exist'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Eliminar ciudad si existe
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'ciudad') > 0,
  "ALTER TABLE clientes DROP COLUMN ciudad",
  "SELECT 'Column ciudad does not exist'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Eliminar provincia si existe
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'provincia') > 0,
  "ALTER TABLE clientes DROP COLUMN provincia",
  "SELECT 'Column provincia does not exist'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Eliminar codigo_postal si existe
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'codigo_postal') > 0,
  "ALTER TABLE clientes DROP COLUMN codigo_postal",
  "SELECT 'Column codigo_postal does not exist'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Eliminar fecha_nacimiento si existe
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'fecha_nacimiento') > 0,
  "ALTER TABLE clientes DROP COLUMN fecha_nacimiento",
  "SELECT 'Column fecha_nacimiento does not exist'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Eliminar puntos_acumulados si existe
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'puntos_acumulados') > 0,
  "ALTER TABLE clientes DROP COLUMN puntos_acumulados",
  "SELECT 'Column puntos_acumulados does not exist'"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- AJUSTAR TIPOS DE DATOS Y VALORES POR DEFECTO
-- ============================================

-- Modificar nombre para que sea NOT NULL
ALTER TABLE clientes MODIFY COLUMN nombre VARCHAR(200) NOT NULL;

-- Modificar identificacion
ALTER TABLE clientes MODIFY COLUMN identificacion VARCHAR(50);

-- Modificar telefono
ALTER TABLE clientes MODIFY COLUMN telefono VARCHAR(30);

-- Modificar direccion
ALTER TABLE clientes MODIFY COLUMN direccion TEXT;

-- Modificar email
ALTER TABLE clientes MODIFY COLUMN email VARCHAR(150);

-- Modificar tipo_cliente con ENUM correcto
ALTER TABLE clientes MODIFY COLUMN tipo_cliente ENUM('publico', 'mayorista', 'especial') DEFAULT 'publico';

-- Modificar limite_credito
ALTER TABLE clientes MODIFY COLUMN limite_credito DECIMAL(10,2) DEFAULT 0;

-- Modificar saldo_pendiente
ALTER TABLE clientes MODIFY COLUMN saldo_pendiente DECIMAL(10,2) DEFAULT 0;

-- Modificar saldo_actual
ALTER TABLE clientes MODIFY COLUMN saldo_actual DECIMAL(10,2) DEFAULT 0;

-- Modificar estado con ENUM correcto
ALTER TABLE clientes MODIFY COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo';

-- Actualizar registros existentes con valores por defecto
UPDATE clientes SET limite_credito = 0 WHERE limite_credito IS NULL;
UPDATE clientes SET saldo_pendiente = 0 WHERE saldo_pendiente IS NULL;
UPDATE clientes SET saldo_actual = 0 WHERE saldo_actual IS NULL;

SELECT 'Tabla clientes actualizada exitosamente - coincide con schema.sql' as mensaje;
