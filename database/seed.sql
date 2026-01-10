-- ============================================
-- DATOS INICIALES DEL SISTEMA
-- ============================================
USE valva_boutique_pos;

-- ============================================
-- 1. CREAR USUARIO ADMINISTRADOR
-- Nota: La contraseña debe ser hasheada con bcrypt desde la aplicación
-- Contraseña temporal: Admin123!
-- ============================================
INSERT INTO usuarios (username, email, password_hash, nombre, apellido, telefono, rol, estado) VALUES
('admin', 'admin@valvaboutique.com', '$2b$10$TEMP_HASH_PLACEHOLDER', 'Administrador', 'Sistema', '0999999999', 'administrador', 'activo');

-- ============================================
-- 2. CREAR CAJA PRINCIPAL
-- ============================================
INSERT INTO cajas (nombre, codigo, estado) VALUES
('Caja Principal', 'CAJA-01', 'activa');

-- ============================================
-- 3. CONFIGURACIONES INICIALES DEL SISTEMA
-- ============================================
INSERT INTO configuracion_sistema (clave, valor, tipo_dato, descripcion) VALUES
('nombre_negocio', 'Valva Boutique', 'string', 'Nombre del negocio'),
('ruc', '0000000000001', 'string', 'RUC del negocio'),
('direccion', 'Dirección del negocio', 'string', 'Dirección física'),
('telefono', '0999999999', 'string', 'Teléfono de contacto'),
('email', 'contacto@valvaboutique.com', 'string', 'Email de contacto'),
('iva_porcentaje', '15', 'number', 'Porcentaje de IVA aplicable'),
('moneda', 'USD', 'string', 'Moneda del sistema'),
('formato_numero_venta', 'VEN-{YYYY}{MM}{DD}-{####}', 'string', 'Formato para número de venta'),
('formato_numero_compra', 'COM-{YYYY}{MM}{DD}-{####}', 'string', 'Formato para número de compra'),
('permitir_venta_stock_negativo', 'false', 'boolean', 'Permitir ventas con stock negativo'),
('dias_alerta_vencimiento', '30', 'number', 'Días para alertar vencimiento de créditos');

-- ============================================
-- 4. CATEGORÍAS DE EJEMPLO
-- ============================================
INSERT INTO categorias (nombre, descripcion, estado) VALUES
('Ropa', 'Prendas de vestir', 'activo'),
('Calzado', 'Zapatos y sandalias', 'activo'),
('Accesorios', 'Bolsos, joyas y complementos', 'activo');

-- ============================================
-- 5. MARCAS DE EJEMPLO
-- ============================================
INSERT INTO marcas (nombre, descripcion, estado) VALUES
('Sin Marca', 'Productos sin marca específica', 'activo'),
('Genérico', 'Productos genéricos', 'activo');

-- Nota: Ejecuta este archivo después de crear el esquema
-- mysql -u root -p valva_boutique_pos < seed.sql
