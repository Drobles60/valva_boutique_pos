-- ============================================
-- ARCHIVO DE PRUEBAS Y MODIFICACIONES
-- ============================================
USE valva_boutique_pos;

-- ============================================
-- ALTER TABLE: Agregar campo estado a proveedores
-- ============================================
ALTER TABLE proveedores 
ADD COLUMN estado ENUM('activo','inactivo') DEFAULT 'activo' AFTER telefono_contacto;

-- Verificar la estructura actualizada
DESCRIBE proveedores;

-- ============================================
-- DATOS DE PRUEBA - Usuario Admin
-- ============================================

-- Insertar usuario administrador de prueba
-- Username: admin
-- Password: 1234
-- Email: admin@valvaboutique.com
INSERT INTO usuarios (username, email, password_hash, nombre, apellido, telefono, rol, estado) 
VALUES (
    'admin', 
    'admin@valvaboutique.com', 
    '$2b$10$rV8PqJJE6P5h5yGKxJxQYuX8TJKl3kGn.5oC8qI7Y6pYFcGXHN1Ge',  -- Hash de "1234"
    'Administrador', 
    'Sistema', 
    '0999999999', 
    'administrador', 
    'activo'
);

-- Verificar que se creó correctamente
SELECT id, username, email, rol, estado FROM usuarios WHERE username = 'admin';

-- ============================================
-- NOTA: El password_hash es el resultado de bcrypt.hash('1234', 10)
-- Si necesitas cambiar la contraseña, usa este código:
--
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('1234', 10);
-- console.log(hash);
-- ============================================

-- ============================================
-- MODIFICACIONES PARA CONTROL DE PAGOS EN PEDIDOS
-- Sistema de control de costo total, saldo pendiente y abonos
-- ============================================

-- Agregar campos de control financiero a la tabla pedidos
-- NOTA: Si las columnas ya existen, estas líneas darán error. 
-- Puedes comentarlas o saltarlas si ya fueron creadas.

-- Verificar si las columnas ya existen
SELECT 
    COUNT(*) as columnas_existentes
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'valva_boutique' 
  AND TABLE_NAME = 'pedidos' 
  AND COLUMN_NAME IN ('total_abonado', 'saldo_pendiente');
-- Si el resultado es 2, las columnas ya existen. Si es 0, ejecuta el ALTER TABLE siguiente:

-- Solo ejecuta este ALTER TABLE si las columnas NO existen:
-- ALTER TABLE pedidos 
-- ADD COLUMN total_abonado DECIMAL(10,2) DEFAULT 0.00 AFTER costo_total,
-- ADD COLUMN saldo_pendiente DECIMAL(10,2) DEFAULT 0.00 AFTER total_abonado;

-- Actualizar los registros existentes
UPDATE pedidos 
SET total_abonado = 0.00,
    saldo_pendiente = costo_total
WHERE total_abonado IS NULL OR saldo_pendiente IS NULL;

-- Crear tabla para registrar los abonos a pedidos
CREATE TABLE IF NOT EXISTS abonos_pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_abono TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro') DEFAULT 'efectivo',
  referencia VARCHAR(100),
  notas TEXT,
  usuario_id INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_pedido_id ON abonos_pedidos(pedido_id);
CREATE INDEX idx_fecha_abono ON abonos_pedidos(fecha_abono);

-- Verificar la estructura actualizada
DESCRIBE pedidos;
DESCRIBE abonos_pedidos;

-- ============================================
-- TRIGGER: Actualizar saldos automáticamente al insertar abono
-- ============================================
DELIMITER //

CREATE TRIGGER after_abono_insert
AFTER INSERT ON abonos_pedidos
FOR EACH ROW
BEGIN
  -- Actualizar el total abonado y saldo pendiente del pedido
  UPDATE pedidos 
  SET total_abonado = total_abonado + NEW.monto,
      saldo_pendiente = saldo_pendiente - NEW.monto
  WHERE id = NEW.pedido_id;
END//

DELIMITER ;

-- ============================================
-- TRIGGER: Actualizar saldos al eliminar un abono
-- ============================================
DELIMITER //

CREATE TRIGGER after_abono_delete
AFTER DELETE ON abonos_pedidos
FOR EACH ROW
BEGIN
  -- Actualizar el total abonado y saldo pendiente del pedido
  UPDATE pedidos 
  SET total_abonado = total_abonado - OLD.monto,
      saldo_pendiente = saldo_pendiente + OLD.monto
  WHERE id = OLD.pedido_id;
END//

DELIMITER ;

-- ============================================
-- VISTA: Resumen de estado de pagos de pedidos
-- ============================================
CREATE OR REPLACE VIEW vista_estado_pedidos AS
SELECT 
  p.id,
  p.numero_pedido,
  p.proveedor_id,
  pr.razon_social as proveedor_nombre,
  pr.codigo as proveedor_codigo,
  p.fecha_pedido,
  p.costo_total,
  p.total_abonado,
  p.saldo_pendiente,
  p.estado,
  p.fecha_recibido,
  CASE 
    WHEN p.saldo_pendiente = 0 THEN 'pagado'
    WHEN p.total_abonado = 0 THEN 'sin_pagar'
    WHEN p.saldo_pendiente > 0 AND p.total_abonado > 0 THEN 'pago_parcial'
    ELSE 'sin_pagar'
  END as estado_pago,
  ROUND((p.total_abonado / p.costo_total) * 100, 2) as porcentaje_pagado,
  (SELECT COUNT(*) FROM abonos_pedidos WHERE pedido_id = p.id) as cantidad_abonos,
  p.created_at,
  p.updated_at
FROM pedidos p
LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
ORDER BY p.created_at DESC;

-- ============================================
-- CONSULTAS DE VERIFICACIÓN
-- ============================================

-- Ver todos los pedidos con su estado de pago
SELECT * FROM vista_estado_pedidos;

-- Ver pedidos con saldo pendiente
SELECT 
  numero_pedido,
  proveedor_nombre,
  costo_total,
  total_abonado,
  saldo_pendiente,
  estado_pago,
  porcentaje_pagado
FROM vista_estado_pedidos 
WHERE saldo_pendiente > 0;

-- Ver abonos de un pedido específico (cambiar el ID según sea necesario)
-- SELECT * FROM abonos_pedidos WHERE pedido_id = 1;

-- ============================================
-- EJEMPLOS DE USO
-- ============================================

-- Ejemplo 1: Insertar un abono a un pedido (el trigger actualizará automáticamente los saldos)
/*
INSERT INTO abonos_pedidos (pedido_id, monto, metodo_pago, referencia, notas, usuario_id)
VALUES (1, 50000.00, 'transferencia', 'TRANS-123456', 'Primer abono del pedido', 1);
*/

-- Ejemplo 2: Ver el historial de abonos de un pedido
/*
SELECT 
  ap.id,
  ap.monto,
  ap.fecha_abono,
  ap.metodo_pago,
  ap.referencia,
  ap.notas,
  u.nombre as usuario_nombre
FROM abonos_pedidos ap
LEFT JOIN usuarios u ON ap.usuario_id = u.id
WHERE ap.pedido_id = 1
ORDER BY ap.fecha_abono DESC;
*/

-- Ejemplo 3: Verificar el estado de pago de todos los pedidos
/*
SELECT 
  numero_pedido,
  proveedor_nombre,
  FORMAT(costo_total, 2) as costo_total,
  FORMAT(total_abonado, 2) as total_abonado,
  FORMAT(saldo_pendiente, 2) as saldo_pendiente,
  CONCAT(porcentaje_pagado, '%') as porcentaje_pagado,
  estado_pago,
  cantidad_abonos
FROM vista_estado_pedidos;
*/
