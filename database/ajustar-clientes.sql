USE valva_boutique_pos;

ALTER TABLE clientes MODIFY COLUMN nombre VARCHAR(200) NOT NULL;
ALTER TABLE clientes MODIFY COLUMN identificacion VARCHAR(50) NULL;
ALTER TABLE clientes MODIFY COLUMN telefono VARCHAR(30) NULL;
ALTER TABLE clientes MODIFY COLUMN direccion TEXT NULL;
ALTER TABLE clientes MODIFY COLUMN email VARCHAR(150) NULL;
ALTER TABLE clientes MODIFY COLUMN tipo_cliente ENUM('publico', 'mayorista', 'especial') DEFAULT 'publico';
ALTER TABLE clientes MODIFY COLUMN limite_credito DECIMAL(10,2) DEFAULT 0;
ALTER TABLE clientes MODIFY COLUMN saldo_pendiente DECIMAL(10,2) DEFAULT 0;
ALTER TABLE clientes MODIFY COLUMN saldo_actual DECIMAL(10,2) DEFAULT 0;
ALTER TABLE clientes MODIFY COLUMN estado ENUM('activo', 'inactivo') DEFAULT 'activo';
UPDATE clientes SET limite_credito = 0 WHERE limite_credito IS NULL;
UPDATE clientes SET saldo_pendiente = 0 WHERE saldo_pendiente IS NULL;
UPDATE clientes SET saldo_actual = 0 WHERE saldo_actual IS NULL;


