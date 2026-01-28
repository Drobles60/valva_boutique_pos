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
  tipo_movimiento ENUM('entrada_inicial', 'entrada_devolucion', 'salida_venta', 'salida_merma', 'ajuste_manual') NOT NULL,
  cantidad INT NOT NULL COMMENT 'Cantidad del movimiento (positivo para entrada, negativo para salida)',
  stock_anterior INT NOT NULL,
  stock_nuevo INT NOT NULL,
  motivo VARCHAR(255),
  venta_id INT UNSIGNED COMMENT 'ID de la venta si es salida por venta',
  usuario_id INT UNSIGNED,
  fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_producto_fecha (producto_id, fecha_movimiento),
  INDEX idx_tipo_movimiento (tipo_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- DESCUENTOS
-- =========================================
CREATE TABLE descuentos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  tipo ENUM('fijo','porcentaje') NOT NULL COMMENT 'fijo: valor en dinero, porcentaje: % del precio',
  valor DECIMAL(10,2) NOT NULL COMMENT 'Valor del descuento (monto fijo o porcentaje)',
  fecha_inicio DATE,
  fecha_fin DATE,
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  aplicable_a ENUM('productos','tipos_prenda') NOT NULL COMMENT 'productos: prendas específicas, tipos_prenda: tipos de prenda',
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

CREATE TABLE descuento_tipos_prenda (
  descuento_id INT UNSIGNED NOT NULL,
  tipo_prenda_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (descuento_id, tipo_prenda_id),
  FOREIGN KEY (descuento_id) REFERENCES descuentos(id) ON DELETE CASCADE,
  FOREIGN KEY (tipo_prenda_id) REFERENCES tipos_prenda(id) ON DELETE CASCADE
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
(1, 'Pantalon', 'cualquier tipo de pantalon', 1, 'activo'),
(2, 'Blusa', 'Cualquier tipo de blusa', 2, 'activo'),
(3, 'Conjunto', 'Prendas que se venden como una sola', 3, 'activo'),
(4, 'Faldas', 'Faldas de diversos estilos', 4, 'activo'),
(5, 'Shorts', 'Toda prenda ', 5, 'activo'),
(6, 'Vestidos', 'Todas clase de vestidos', 6, 'activo'),
(7, 'Bolsos', 'Bolsos de diversos tipos', 7, 'activo');


-- ============================================
-- DATOS INICIALES: TIPOS DE PRENDA (PREDEFINIDOS)
-- ============================================

-- CATEGORÍA 1: PANTALÓN
INSERT INTO tipos_prenda (categoria_padre_id, nombre, descripcion, orden) VALUES
(1, 'Pantalón de Vestir', 'Pantalón formal para ocasiones especiales', 1),
(1, 'Pantalón Casual', 'Pantalón de uso diario', 2),
(1, 'Pantalón Cargo', 'Pantalón con bolsillos laterales', 3),
(1, 'Pantalón Palazzo', 'Pantalón amplio de pierna ancha', 4),
(1, 'Pantalón Capri', 'Pantalón tres cuartos', 5),
(1, 'Leggings', 'Pantalón ajustado elástico', 6),
(1, 'Joggers', 'Pantalón deportivo con puño', 7),
(1, 'Pantalón Acampanado', 'Pantalón con bota ancha', 8),
(1, 'Pantalón Recto', 'Pantalón de corte recto clásico', 9),
(1, 'Pantalón Pitillo', 'Pantalón ajustado tipo skinny', 10),
(1, 'Pantalón Jean', 'Pantalón de mezclilla/denim', 11),
(1, 'Pantalón Lino', 'Pantalón fresco de lino', 12);

-- CATEGORÍA 2: BLUSA
INSERT INTO tipos_prenda (categoria_padre_id, nombre, descripcion, orden) VALUES
(2, 'Blusa Manga Larga', 'Blusa con manga completa', 1),
(2, 'Blusa Manga Corta', 'Blusa con manga corta', 2),
(2, 'Blusa Sin Mangas', 'Blusa tipo chaleco', 3),
(2, 'Blusa de Encaje', 'Blusa con detalles de encaje', 4),
(2, 'Blusa Campesina', 'Blusa con hombros descubiertos', 5),
(2, 'Blusa Crop Top', 'Blusa corta que deja el abdomen al descubierto', 6),
(2, 'Blusa Oversize', 'Blusa holgada de talla grande', 7),
(2, 'Blusa con Botones', 'Blusa tipo camisa con botonadura', 8),
(2, 'Blusa Cuello V', 'Blusa con escote en V', 9),
(2, 'Blusa Cuello Redondo', 'Blusa con cuello circular', 10),
(2, 'Blusa Estampada', 'Blusa con diseños o patrones', 11),
(2, 'Blusa Lisa', 'Blusa de color sólido sin estampados', 12),
(2, 'Blusa Satinada', 'Blusa de tela satinada brillante', 13),
(2, 'Blusa Transparente', 'Blusa de tela semi-transparente', 14);

-- CATEGORÍA 3: CONJUNTO
INSERT INTO tipos_prenda (categoria_padre_id, nombre, descripcion, orden) VALUES
(3, 'Conjunto Deportivo', 'Conjunto para actividades deportivas', 1),
(3, 'Conjunto Casual', 'Conjunto de uso diario', 2),
(3, 'Conjunto de Vestir', 'Conjunto formal elegante', 3),
(3, 'Conjunto Crop Top + Falda', 'Conjunto de dos piezas con crop top', 4),
(3, 'Conjunto Blusa + Pantalón', 'Conjunto coordinado de blusa y pantalón', 5),
(3, 'Conjunto Top + Short', 'Conjunto de top y short', 6),
(3, 'Conjunto Blazer + Pantalón', 'Conjunto ejecutivo', 7),
(3, 'Conjunto Playero', 'Conjunto para playa o piscina', 8);

-- CATEGORÍA 4: FALDAS
INSERT INTO tipos_prenda (categoria_padre_id, nombre, descripcion, orden) VALUES
(4, 'Falda Corta', 'Falda mini por encima de la rodilla', 1),
(4, 'Falda Midi', 'Falda a media pierna', 2),
(4, 'Falda Larga', 'Falda maxi hasta los tobillos', 3),
(4, 'Falda Plisada', 'Falda con pliegues', 4),
(4, 'Falda Tubo', 'Falda ajustada tipo lápiz', 5),
(4, 'Falda Acampanada', 'Falda con vuelo en A', 6),
(4, 'Falda con Vuelo', 'Falda circular amplia', 7),
(4, 'Falda Jean', 'Falda de mezclilla', 8),
(4, 'Falda Asimétrica', 'Falda con largo irregular', 9),
(4, 'Falda Recta', 'Falda de corte recto', 10);

-- CATEGORÍA 5: SHORTS
INSERT INTO tipos_prenda (categoria_padre_id, nombre, descripcion, orden) VALUES
(5, 'Short Jean', 'Short de mezclilla', 1),
(5, 'Short de Tela', 'Short de tela suave', 2),
(5, 'Short Deportivo', 'Short para actividades deportivas', 3),
(5, 'Short Cargo', 'Short con bolsillos laterales', 4),
(5, 'Short Bermuda', 'Short largo tipo bermuda', 5),
(5, 'Short Tiro Alto', 'Short con cintura alta', 6),
(5, 'Short Tiro Medio', 'Short con cintura media', 7),
(5, 'Short Ciclista', 'Short ajustado tipo biker', 8);

-- CATEGORÍA 6: VESTIDOS
INSERT INTO tipos_prenda (categoria_padre_id, nombre, descripcion, orden) VALUES
(6, 'Vestido Casual', 'Vestido de uso diario', 1),
(6, 'Vestido de Fiesta', 'Vestido elegante para eventos', 2),
(6, 'Vestido Formal', 'Vestido de gala o ceremonia', 3),
(6, 'Vestido Midi', 'Vestido a media pierna', 4),
(6, 'Vestido Maxi', 'Vestido largo hasta los tobillos', 5),
(6, 'Vestido Corto', 'Vestido mini por encima de la rodilla', 6),
(6, 'Vestido Cóctel', 'Vestido semi-formal', 7),
(6, 'Vestido Camisero', 'Vestido tipo camisa con botones', 8),
(6, 'Vestido Tubo', 'Vestido ajustado tipo bodycon', 9),
(6, 'Vestido Playero', 'Vestido ligero para playa', 10),
(6, 'Vestido Acampanado', 'Vestido con falda con vuelo', 11);

-- CATEGORÍA 7: BOLSOS
INSERT INTO tipos_prenda (categoria_padre_id, nombre, descripcion, orden) VALUES
(7, 'Bolso de Mano', 'Bolso pequeño con asa corta', 1),
(7, 'Bolso Bandolera', 'Bolso con correa cruzada', 2),
(7, 'Bolso Tote', 'Bolso grande tipo shopping', 3),
(7, 'Mochila', 'Bolso para la espalda', 4),
(7, 'Clutch', 'Bolso de mano pequeño sin asas', 5),
(7, 'Bolso Shopper', 'Bolso amplio para compras', 6),
(7, 'Cartera', 'Billetera o monedero', 7),
(7, 'Riñonera', 'Bolso para la cintura', 8),
(7, 'Bolso Satchel', 'Bolso estructurado con solapa', 9),
(7, 'Bolso Bucket', 'Bolso tipo cubo con cordón', 10);

-- ============================================
-- DATOS INICIALES: SISTEMAS DE TALLAS (PREDEFINIDOS)
-- ============================================
INSERT INTO sistemas_tallas (nombre, descripcion, tipo) VALUES
('Tallas Estándar Mujer (Letras)', 'Sistema de tallas XS, S, M, L, XL, XXL, XXXL para mujer', 'letras'),
('Tallas Numéricas Mujer', 'Tallas numéricas de mujer 2, 4, 6, 8, 10, 12, 14, 16, 18, 20', 'numeros'),
('Tallas Jeans Mujer', 'Tallas de jeans para mujer 24, 26, 28, 30, 32, 34, 36, 38', 'numeros'),
('Tallas Calzado Mujer', 'Tallas de calzado de mujer 34 a 41', 'numeros'),
('Talla Única', 'Talla única para accesorios y bolsos', 'letras');

-- ============================================
-- DATOS INICIALES: TALLAS (PREDEFINIDAS)
-- ============================================
-- Tallas Estándar Mujer (Letras) - ID Sistema: 1
INSERT INTO tallas (sistema_talla_id, valor, descripcion, orden) VALUES
(1, 'XS', 'Extra Small - Talla Extra Pequeña', 1),
(1, 'S', 'Small - Talla Pequeña', 2),
(1, 'M', 'Medium - Talla Mediana', 3),
(1, 'L', 'Large - Talla Grande', 4),
(1, 'XL', 'Extra Large - Talla Extra Grande', 5),
(1, 'XXL', 'Double Extra Large - Talla 2XL', 6),
(1, 'XXXL', 'Triple Extra Large - Talla 3XL', 7);

-- Tallas Numéricas Mujer - ID Sistema: 2
INSERT INTO tallas (sistema_talla_id, valor, descripcion, orden) VALUES
(2, '2', 'Talla 2 - Extra Pequeña', 1),
(2, '4', 'Talla 4 - Pequeña', 2),
(2, '6', 'Talla 6 - Pequeña-Mediana', 3),
(2, '8', 'Talla 8 - Mediana', 4),
(2, '10', 'Talla 10 - Mediana', 5),
(2, '12', 'Talla 12 - Mediana-Grande', 6),
(2, '14', 'Talla 14 - Grande', 7),
(2, '16', 'Talla 16 - Grande', 8),
(2, '18', 'Talla 18 - Extra Grande', 9),
(2, '20', 'Talla 20 - Extra Grande', 10);

-- Tallas Jeans Mujer - ID Sistema: 3
INSERT INTO tallas (sistema_talla_id, valor, descripcion, orden) VALUES
(3, '24', 'Talla 24 - Cintura 61cm', 1),
(3, '26', 'Talla 26 - Cintura 66cm', 2),
(3, '28', 'Talla 28 - Cintura 71cm', 3),
(3, '30', 'Talla 30 - Cintura 76cm', 4),
(3, '32', 'Talla 32 - Cintura 81cm', 5),
(3, '34', 'Talla 34 - Cintura 86cm', 6),
(3, '36', 'Talla 36 - Cintura 91cm', 7),
(3, '38', 'Talla 38 - Cintura 96cm', 8);

-- Tallas Calzado Mujer - ID Sistema: 4
INSERT INTO tallas (sistema_talla_id, valor, descripcion, orden) VALUES
(4, '34', 'Talla 34 - 22cm', 1),
(4, '35', 'Talla 35 - 22.5cm', 2),
(4, '36', 'Talla 36 - 23cm', 3),
(4, '37', 'Talla 37 - 23.5cm', 4),
(4, '38', 'Talla 38 - 24cm', 5),
(4, '39', 'Talla 39 - 24.5cm', 6),
(4, '40', 'Talla 40 - 25cm', 7),
(4, '41', 'Talla 41 - 25.5cm', 8);

-- Talla Única - ID Sistema: 5
INSERT INTO tallas (sistema_talla_id, valor, descripcion, orden) VALUES
(5, 'ÚNICA', 'Talla única para accesorios', 1);

-- ============================================
-- RELACIONES: TIPO PRENDA - SISTEMA TALLA (PREDEFINIDAS)
-- ============================================

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

