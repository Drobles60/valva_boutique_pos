-- ============================================
-- BASE DE DATOS SIMPLIFICADA: valva_boutique_pos
-- Sistema POS para Boutique
-- ============================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS valva_boutique_pos 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE valva_boutique_pos;

-- =========================================
-- TABLA USUARIOS
-- =========================================
CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  telefono VARCHAR(30),
  rol VARCHAR(30),
  estado VARCHAR(30),
  ultimo_acceso TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- CATEGORÍAS PADRE (Preestablecidas)
-- =========================================
CREATE TABLE categorias_padre (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  orden INT DEFAULT 0,
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- TIPOS DE PRENDA (Subcategorías)
-- =========================================
CREATE TABLE tipos_prenda (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria_padre_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  orden INT DEFAULT 0,
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_padre_id) REFERENCES categorias_padre(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- SISTEMAS DE TALLAS
-- =========================================
CREATE TABLE sistemas_tallas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  tipo ENUM('letras','numeros','mixto') DEFAULT 'letras',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- TALLAS
-- =========================================
CREATE TABLE tallas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sistema_talla_id INT UNSIGNED NOT NULL,
  valor VARCHAR(20) NOT NULL,
  descripcion VARCHAR(100),
  orden INT DEFAULT 0,
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sistema_talla_id) REFERENCES sistemas_tallas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- RELACIÓN: TIPO PRENDA - SISTEMA TALLA
-- =========================================
CREATE TABLE tipo_prenda_sistema_talla (
  tipo_prenda_id INT UNSIGNED NOT NULL,
  sistema_talla_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (tipo_prenda_id, sistema_talla_id),
  FOREIGN KEY (tipo_prenda_id) REFERENCES tipos_prenda(id) ON DELETE CASCADE,
  FOREIGN KEY (sistema_talla_id) REFERENCES sistemas_tallas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- PRODUCTOS
-- =========================================
CREATE TABLE productos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo_barras VARCHAR(100) UNIQUE,
  sku VARCHAR(100) UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  categoria_padre_id INT UNSIGNED NOT NULL,
  tipo_prenda_id INT UNSIGNED NOT NULL,
  talla_id INT UNSIGNED,
  proveedor_id INT UNSIGNED NOT NULL,
  color VARCHAR(50),
  precio_compra DECIMAL(10,2),
  precio_venta DECIMAL(10,2),
  precio_minimo DECIMAL(10,2),
  stock_actual INT DEFAULT 0,
  estado ENUM('activo','inactivo','agotado') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_padre_id) REFERENCES categorias_padre(id),
  FOREIGN KEY (tipo_prenda_id) REFERENCES tipos_prenda(id),
  FOREIGN KEY (talla_id) REFERENCES tallas(id),
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================
-- MOVIMIENTOS INVENTARIO
-- =========================================
CREATE TABLE movimientos_inventario (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  producto_id INT UNSIGNED NOT NULL,
  tipo_movimiento VARCHAR(30),
  cantidad INT,
  stock_anterior INT,
  stock_nuevo INT,
  motivo VARCHAR(255),
  usuario_id INT UNSIGNED,
  fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- DESCUENTOS
-- =========================================
CREATE TABLE descuentos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50),
  nombre VARCHAR(100),
  descripcion TEXT,
  tipo VARCHAR(30),
  valor DECIMAL(10,2),
  fecha_inicio DATE,
  fecha_fin DATE,
  estado VARCHAR(30),
  uso_maximo INT,
  uso_actual INT DEFAULT 0,
  aplicable_a VARCHAR(30),
  monto_minimo_compra DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE descuento_productos (
  descuento_id INT UNSIGNED,
  producto_id INT UNSIGNED,
  PRIMARY KEY (descuento_id, producto_id),
  FOREIGN KEY (descuento_id) REFERENCES descuentos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE descuento_categorias (
  descuento_id INT UNSIGNED,
  categoria_id INT UNSIGNED,
  PRIMARY KEY (descuento_id, categoria_id),
  FOREIGN KEY (descuento_id) REFERENCES descuentos(id),
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- CLIENTES
-- =========================================
CREATE TABLE clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo_cliente VARCHAR(30),
  tipo_documento VARCHAR(30),
  numero_documento VARCHAR(50),
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  razon_social VARCHAR(200),
  email VARCHAR(150),
  telefono VARCHAR(30),
  celular VARCHAR(30),
  direccion TEXT,
  ciudad VARCHAR(100),
  provincia VARCHAR(100),
  codigo_postal VARCHAR(20),
  fecha_nacimiento DATE,
  limite_credito DECIMAL(10,2),
  saldo_pendiente DECIMAL(10,2),
  puntos_acumulados INT DEFAULT 0,
  estado VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- PROVEEDORES
-- =========================================
CREATE TABLE proveedores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE AFTER id,
  ruc VARCHAR(50) NOT NULL UNIQUE,
  razon_social VARCHAR(200) NOT NULL,
  nombre_comercial VARCHAR(200),
  telefono VARCHAR(30) NOT NULL,
  celular VARCHAR(30),
  email VARCHAR(150),
  direccion TEXT,
  ciudad VARCHAR(100),
  provincia VARCHAR(100),
  persona_contacto VARCHAR(100),
  telefono_contacto VARCHAR(30),
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =========================================
-- PEDIDOS A PROVEEDORES
-- =========================================
CREATE TABLE pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero_pedido VARCHAR(50) UNIQUE,
  proveedor_id INT UNSIGNED NOT NULL,
  fecha_pedido DATE NOT NULL,
  costo_total DECIMAL(10,2) NOT NULL,
  estado ENUM('pendiente', 'recibido') DEFAULT 'pendiente',
  fecha_recibido TIMESTAMP NULL,
  usuario_id INT UNSIGNED,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE detalle_pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  descripcion VARCHAR(500) NOT NULL,
  cantidad INT NOT NULL,
  precio_total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- CAJAS Y VENTAS
-- =========================================
CREATE TABLE cajas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  codigo VARCHAR(50),
  estado VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ventas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero_venta VARCHAR(50),
  cliente_id INT UNSIGNED,
  fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(10,2),
  iva DECIMAL(10,2),
  descuento DECIMAL(10,2),
  total DECIMAL(10,2),
  estado VARCHAR(30),
  descuento_id INT UNSIGNED,
  usuario_id INT UNSIGNED,
  caja_id INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (descuento_id) REFERENCES descuentos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (caja_id) REFERENCES cajas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE detalle_ventas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  venta_id INT UNSIGNED,
  producto_id INT UNSIGNED,
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- SESIONES Y MOVIMIENTOS DE CAJA
-- =========================================
CREATE TABLE sesiones_caja (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  caja_id INT UNSIGNED,
  usuario_id INT UNSIGNED,
  fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre TIMESTAMP NULL,
  estado VARCHAR(30),
  FOREIGN KEY (caja_id) REFERENCES cajas(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE movimientos_caja (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sesion_caja_id INT UNSIGNED,
  tipo_movimiento VARCHAR(30),
  monto DECIMAL(10,2),
  venta_id INT UNSIGNED,
  usuario_id INT UNSIGNED,
  fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sesion_caja_id) REFERENCES sesiones_caja(id),
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- AUDITORÍA
-- =========================================
CREATE TABLE auditoria (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tabla VARCHAR(100),
  registro_id INT,
  accion VARCHAR(30),
  usuario_id INT UNSIGNED,
  fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- DATOS INICIALES: CATEGORÍAS PADRE
-- ============================================
-- DATOS INICIALES: CATEGORÍAS PADRE (PREDEFINIDAS - SOLO MUJER)
-- ============================================
INSERT INTO categorias_padre (id, nombre, descripcion, orden, estado) VALUES
(1, 'Prendas de Vestir', 'Ropa y prendas para mujer', 1, 'activo'),
(2, 'Accesorios', 'Complementos y accesorios de moda', 2, 'activo'),
(3, 'Calzado', 'Zapatos y calzado para mujer', 3, 'activo');

-- ============================================
-- DATOS INICIALES: TIPOS DE PRENDA (PREDEFINIDOS)
-- ============================================
-- Prendas de Vestir
INSERT INTO tipos_prenda (categoria_padre_id, nombre, descripcion, orden) VALUES
(1, 'Blusas', 'Blusas y camisas', 1),
(1, 'Pantalones', 'Pantalones de tela', 2),
(1, 'Vestidos', 'Vestidos casuales y formales', 3),
(1, 'Faldas', 'Faldas de diversos estilos', 4),
(1, 'Chaquetas', 'Chaquetas y abrigos', 5),
(1, 'Jeans', 'Pantalones de mezclilla', 6),
(1, 'Shorts', 'Shorts y bermudas', 7),
(1, 'Conjuntos', 'Conjuntos de dos piezas', 8),
(1, 'Ropa Interior', 'Lencería y ropa interior', 9),
(1, 'Ropa Deportiva', 'Prendas deportivas', 10);

-- Accesorios
INSERT INTO tipos_prenda (categoria_padre_id, nombre, descripcion, orden) VALUES
(2, 'Carteras', 'Carteras y billeteras', 1),
(2, 'Bolsos', 'Bolsos de mano y mochilas', 2),
(2, 'Cinturones', 'Cinturones de cuero y tela', 3),
(2, 'Bufandas', 'Bufandas y pañuelos', 4),
(2, 'Gorros', 'Gorros y sombreros', 5),
(2, 'Bisutería', 'Collares, aretes, pulseras', 6),
(2, 'Gafas', 'Gafas de sol', 7),
(2, 'Relojes', 'Relojes y accesorios', 8);

-- Calzado
INSERT INTO tipos_prenda (categoria_padre_id, nombre, descripcion, orden) VALUES
(3, 'Zapatos Casuales', 'Zapatos de uso diario', 1),
(3, 'Zapatos Formales', 'Zapatos de vestir', 2),
(3, 'Sandalias', 'Sandalias y chancletas', 3),
(3, 'Botas', 'Botas y botines', 4),
(3, 'Zapatillas', 'Zapatillas deportivas', 5),
(3, 'Tacones', 'Zapatos de tacón', 6);

-- ============================================
-- DATOS INICIALES: SISTEMAS DE TALLAS (PREDEFINIDOS)
-- ============================================
INSERT INTO sistemas_tallas (nombre, descripcion, tipo) VALUES
('Tallas Estándar (Letras)', 'Sistema de tallas XS, S, M, L, XL, XXL', 'letras'),
('Tallas Numéricas Pantalón', 'Tallas numéricas 2, 4, 6, 8, 10, 12, 14, 16', 'numeros'),
('Tallas Jeans', 'Tallas 24, 26, 28, 30, 32, 34', 'numeros'),
('Tallas Calzado', 'Tallas de calzado 35 a 40', 'numeros'),
('Talla Única', 'Talla única para accesorios', 'letras');

-- ============================================
-- DATOS INICIALES: TALLAS (PREDEFINIDAS)
-- ============================================
-- Tallas Estándar (Letras) - ID Sistema: 1
INSERT INTO tallas (sistema_talla_id, valor, descripcion, orden) VALUES
(1, 'XS', 'Extra Small', 1),
(1, 'S', 'Small', 2),
(1, 'M', 'Medium', 3),
(1, 'L', 'Large', 4),
(1, 'XL', 'Extra Large', 5),
(1, 'XXL', 'Double Extra Large', 6);

-- Tallas Numéricas Pantalón - ID Sistema: 2
INSERT INTO tallas (sistema_talla_id, valor, descripcion, orden) VALUES
(2, '2', 'Talla 2', 1),
(2, '4', 'Talla 4', 2),
(2, '6', 'Talla 6', 3),
(2, '8', 'Talla 8', 4),
(2, '10', 'Talla 10', 5),
(2, '12', 'Talla 12', 6),
(2, '14', 'Talla 14', 7),
(2, '16', 'Talla 16', 8);

-- Tallas Jeans - ID Sistema: 3
INSERT INTO tallas (sistema_talla_id, valor, descripcion, orden) VALUES
(3, '24', 'Talla 24', 1),
(3, '26', 'Talla 26', 2),
(3, '28', 'Talla 28', 3),
(3, '30', 'Talla 30', 4),
(3, '32', 'Talla 32', 5),
(3, '34', 'Talla 34', 6);

-- Tallas Calzado - ID Sistema: 4
INSERT INTO tallas (sistema_talla_id, valor, descripcion, orden) VALUES
(4, '35', 'Talla 35', 1),
(4, '36', 'Talla 36', 2),
(4, '37', 'Talla 37', 3),
(4, '38', 'Talla 38', 4),
(4, '39', 'Talla 39', 5),
(4, '40', 'Talla 40', 6);

-- Talla Única - ID Sistema: 5
INSERT INTO tallas (sistema_talla_id, valor, descripcion, orden) VALUES
(5, 'ÚNICA', 'Talla única', 1);

-- ============================================
-- RELACIONES: TIPO PRENDA - SISTEMA TALLA (PREDEFINIDAS)
-- ============================================
-- Prendas de Vestir con Tallas Estándar (Letras)
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(1, 1),  -- Blusas → Letras (XS-XXL)
(4, 1),  -- Faldas → Letras (XS-XXL)
(5, 1),  -- Chaquetas → Letras (XS-XXL)
(7, 1),  -- Shorts → Letras (XS-XXL)
(8, 1),  -- Conjuntos → Letras (XS-XXL)
(9, 1),  -- Ropa Interior → Letras (XS-XXL)
(10, 1); -- Ropa Deportiva → Letras (XS-XXL)

-- Vestidos con Tallas Estándar y Numéricas
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(3, 1),  -- Vestidos → Letras (XS-XXL)
(3, 2);  -- Vestidos → Numéricas (2-16)

-- Pantalones con Tallas Numéricas
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(2, 2);  -- Pantalones → Numéricas (2-16)

-- Jeans con Tallas Jeans
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(6, 3);  -- Jeans → Tallas Jeans (24-34)

-- Accesorios con Talla Única
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(11, 5), -- Carteras → Única
(12, 5), -- Bolsos → Única
(13, 5), -- Cinturones → Única
(14, 5), -- Bufandas → Única
(15, 5), -- Gorros → Única
(16, 5), -- Bisutería → Única
(17, 5), -- Gafas → Única
(18, 5); -- Relojes → Única

-- Calzado con Tallas de Calzado
INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(19, 4), -- Zapatos Casuales → Tallas 35-40
(20, 4), -- Zapatos Formales → Tallas 35-40
(21, 4), -- Sandalias → Tallas 35-40
(22, 4), -- Botas → Tallas 35-40
(23, 4), -- Zapatillas → Tallas 35-40
(24, 4); -- Tacones → Tallas 35-40

