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
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  orden INT DEFAULT 0,
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY categoria_padre_id (categoria_padre_id),
  CONSTRAINT tipos_prenda_ibfk_1 FOREIGN KEY (categoria_padre_id) REFERENCES categorias_padre(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================
-- SISTEMAS DE TALLAS
-- =========================================
CREATE TABLE sistemas_tallas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  tipo ENUM('letras','numeros','mixto') DEFAULT 'letras',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================
-- TALLAS
-- =========================================
CREATE TABLE tallas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sistema_talla_id INT UNSIGNED NOT NULL,
  valor VARCHAR(20) NOT NULL,
  descripcion VARCHAR(100) DEFAULT NULL,
  orden INT DEFAULT 0,
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY sistema_talla_id (sistema_talla_id),
  CONSTRAINT tallas_ibfk_1 FOREIGN KEY (sistema_talla_id) REFERENCES sistemas_tallas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================
-- RELACIÓN: TIPO PRENDA - SISTEMA TALLA
-- =========================================
CREATE TABLE tipo_prenda_sistema_talla (
  tipo_prenda_id INT UNSIGNED NOT NULL,
  sistema_talla_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (tipo_prenda_id, sistema_talla_id),
  KEY sistema_talla_id (sistema_talla_id),
  CONSTRAINT tipo_prenda_sistema_talla_ibfk_1 FOREIGN KEY (tipo_prenda_id) REFERENCES tipos_prenda(id) ON DELETE CASCADE,
  CONSTRAINT tipo_prenda_sistema_talla_ibfk_2 FOREIGN KEY (sistema_talla_id) REFERENCES sistemas_tallas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  referencia_id INT UNSIGNED COMMENT 'ID de referencia adicional',
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
--pendeinte
-- =========================================
-- CLIENTES
-- =========================================
CREATE TABLE clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  identificacion VARCHAR(50),
  telefono VARCHAR(30),
  direccion TEXT,
  email VARCHAR(150),
  tipo_cliente ENUM('publico', 'mayorista', 'especial') DEFAULT 'publico',
  limite_credito DECIMAL(10,2) DEFAULT 0,
  saldo_pendiente DECIMAL(10,2) DEFAULT 0,
  saldo_actual DECIMAL(10,2) DEFAULT 0,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
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
  total_abonado DECIMAL(10,2) DEFAULT 0.00,
  saldo_pendiente DECIMAL(10,2) DEFAULT 0.00,
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

-- Tabla de abonos a pedidos
CREATE TABLE abonos_pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_abono TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metodo_pago ENUM('efectivo', 'transferencia', 'cheque', 'otro') DEFAULT 'efectivo',
  referencia VARCHAR(100),
  notas TEXT,
  usuario_id INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_pedido_id (pedido_id),
  INDEX idx_fecha_abono (fecha_abono)
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
--pendiente
CREATE TABLE ventas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero_venta VARCHAR(50) UNIQUE,
  cliente_id INT UNSIGNED,
  fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(10,2) DEFAULT 0,
  iva DECIMAL(10,2) DEFAULT 0,
  descuento DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  estado ENUM('completada', 'credito', 'anulada') DEFAULT 'completada',
  tipo_venta ENUM('contado', 'credito') DEFAULT 'contado',
  metodo_pago ENUM('efectivo', 'transferencia', 'mixto') DEFAULT 'efectivo',
  efectivo_recibido DECIMAL(10,2) DEFAULT NULL COMMENT 'Monto en efectivo recibido del cliente',
  cambio DECIMAL(10,2) DEFAULT NULL COMMENT 'Cambio devuelto al cliente',
  referencia_transferencia VARCHAR(50) DEFAULT NULL COMMENT 'Origen de la transferencia: Nequi, Bancolombia, Daviplata, Otro',
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
-- PAGOS MIXTOS PARA VENTAS
-- =========================================
CREATE TABLE pagos_mixtos_ventas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  venta_id INT UNSIGNED NOT NULL,
  monto_efectivo DECIMAL(10,2) DEFAULT 0.00,
  monto_transferencia DECIMAL(10,2) DEFAULT 0.00,
  monto_tarjeta DECIMAL(10,2) DEFAULT 0.00,
  referencia_transferencia VARCHAR(50) DEFAULT NULL COMMENT 'Origen de la transferencia en pagos mixtos',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  INDEX idx_venta_id (venta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--pendiente

-- =========================================
-- CUENTAS POR COBRAR Y ABONOS
-- =========================================
CREATE TABLE cuentas_por_cobrar (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  venta_id INT UNSIGNED NOT NULL,
  monto_total DECIMAL(10,2) NOT NULL,
  saldo_pendiente DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE,
  estado ENUM('pendiente', 'pagada', 'vencida') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (venta_id) REFERENCES ventas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE abonos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cuenta_por_cobrar_id INT UNSIGNED NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('efectivo', 'transferencia', 'mixto') DEFAULT 'efectivo',
  referencia_transferencia VARCHAR(50) DEFAULT NULL COMMENT 'Origen de la transferencia: Nequi, Bancolombia, Daviplata, Otro',
  fecha_abono TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id INT UNSIGNED,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cuenta_por_cobrar_id) REFERENCES cuentas_por_cobrar(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- PAGOS MIXTOS PARA ABONOS
-- =========================================
CREATE TABLE pagos_mixtos_abonos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  abono_id INT UNSIGNED NOT NULL,
  monto_efectivo DECIMAL(10,2) DEFAULT 0.00,
  monto_transferencia DECIMAL(10,2) DEFAULT 0.00,
  monto_tarjeta DECIMAL(10,2) DEFAULT 0.00,
  referencia_transferencia VARCHAR(50) DEFAULT NULL COMMENT 'Origen de la transferencia en pagos mixtos',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (abono_id) REFERENCES abonos(id) ON DELETE CASCADE,
  INDEX idx_abono_id (abono_id)
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
-- Datos reales de la base de datos (72 registros)

INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES
(1, 2),   -- Pantalón de Vestir → Numéricas
(2, 2),   -- Pantalón Casual → Numéricas
(3, 2),   -- Pantalón Cargo → Numéricas
(4, 1),   -- Pantalón Palazzo → Letras
(5, 2),   -- Pantalón Capri → Numéricas
(6, 1),   -- Leggings → Letras
(7, 1),   -- Joggers → Letras
(8, 2),   -- Pantalón Acampanado → Numéricas
(9, 2),   -- Pantalón Recto → Numéricas
(10, 2),  -- Pantalón Pitillo → Numéricas
(11, 3),  -- Pantalón Jean → Tallas Jeans
(12, 2),  -- Pantalón Lino → Numéricas
(13, 1),  -- Blusa Manga Larga → Letras
(14, 1),  -- Blusa Manga Corta → Letras
(15, 1),  -- Blusa Sin Mangas → Letras
(16, 1),  -- Blusa de Encaje → Letras
(17, 1),  -- Blusa Campesina → Letras
(18, 1),  -- Blusa Crop Top → Letras
(19, 1),  -- Blusa Oversize → Letras
(20, 1),  -- Blusa con Botones → Letras
(21, 1),  -- Blusa Cuello V → Letras
(22, 1),  -- Blusa Cuello Redondo → Letras
(23, 1),  -- Blusa Estampada → Letras
(24, 1),  -- Blusa Lisa → Letras
(25, 1),  -- Blusa Satinada → Letras
(26, 1),  -- Blusa Transparente → Letras
(27, 1),  -- Conjunto Deportivo → Letras
(27, 2),  -- Conjunto Deportivo → Numéricas
(28, 1),  -- Conjunto Casual → Letras
(28, 2),  -- Conjunto Casual → Numéricas
(29, 1),  -- Conjunto de Vestir → Letras
(29, 2),  -- Conjunto de Vestir → Numéricas
(30, 1),  -- Conjunto Crop Top + Falda → Letras
(31, 2),  -- Conjunto Blusa + Pantalón → Numéricas
(32, 1),  -- Conjunto Top + Short → Letras
(33, 1),  -- Conjunto Blazer + Pantalón → Letras
(34, 3),  -- Conjunto Playero → Tallas Jeans
(35, 1),  -- Falda Corta → Letras
(36, 2),  -- Falda Midi → Numéricas
(37, 3),  -- Falda Larga → Tallas Jeans
(38, 1),  -- Falda Plisada → Letras
(39, 1),  -- Falda Tubo → Letras
(40, 2),  -- Falda Acampanada → Numéricas
(41, 2),  -- Falda con Vuelo → Numéricas
(42, 2),  -- Falda Jean → Numéricas
(43, 2),  -- Falda Asimétrica → Numéricas
(44, 1),  -- Falda Recta → Letras
(45, 1),  -- Short Jean → Letras
(45, 2),  -- Short Jean → Numéricas
(46, 1),  -- Short de Tela → Letras
(46, 2),  -- Short de Tela → Numéricas
(47, 2),  -- Short Deportivo → Numéricas
(48, 1),  -- Short Cargo → Letras
(48, 2),  -- Short Cargo → Numéricas
(49, 1),  -- Short Bermuda → Letras
(49, 2),  -- Short Bermuda → Numéricas
(50, 1),  -- Short Tiro Alto → Letras
(51, 2),  -- Short Tiro Medio → Numéricas
(52, 1),  -- Short Ciclista → Letras
(53, 2),  -- Vestido Casual → Numéricas
(54, 1),  -- Vestido de Fiesta → Letras
(55, 1),  -- Vestido Formal → Letras
(56, 5),  -- Vestido Midi → Talla Única
(57, 5),  -- Vestido Maxi → Talla Única
(58, 5),  -- Vestido Corto → Talla Única
(59, 5),  -- Vestido Cóctel → Talla Única
(60, 5),  -- Vestido Camisero → Talla Única
(61, 5),  -- Vestido Tubo → Talla Única
(62, 5),  -- Vestido Playero → Talla Única
(63, 5),  -- Vestido Acampanado → Talla Única
(64, 5),  -- Bolso de Mano → Talla Única
(65, 5);  -- Bolso Bandolera → Talla Única

-- =========================================
-- TRIGGERS
-- =========================================
-- Nota: Ejecutar cada trigger por separado en DBeaver

-- Trigger 1: Actualizar saldo del cliente cuando se registra un abono
DROP TRIGGER IF EXISTS actualizar_saldo_cliente_abono;
CREATE TRIGGER actualizar_saldo_cliente_abono
AFTER INSERT ON abonos
FOR EACH ROW
UPDATE cuentas_por_cobrar cpc
INNER JOIN clientes c ON c.id = cpc.cliente_id
SET
  cpc.saldo_pendiente = cpc.saldo_pendiente - NEW.monto,
  cpc.estado = IF((cpc.saldo_pendiente - NEW.monto) <= 0, 'pagada', cpc.estado),
  c.saldo_pendiente = c.saldo_pendiente - NEW.monto,
  c.saldo_actual = c.saldo_pendiente - NEW.monto
WHERE cpc.id = NEW.cuenta_por_cobrar_id;

-- Trigger 2: Actualizar saldos al insertar un abono a pedido
DROP TRIGGER IF EXISTS after_abono_insert;
CREATE TRIGGER after_abono_insert
AFTER INSERT ON abonos_pedidos
FOR EACH ROW
BEGIN
  UPDATE pedidos
  SET total_abonado = total_abonado + NEW.monto,
      saldo_pendiente = saldo_pendiente - NEW.monto
  WHERE id = NEW.pedido_id;
END;

-- Trigger 3: Actualizar saldos al eliminar un abono a pedido
DROP TRIGGER IF EXISTS after_abono_delete;
CREATE TRIGGER after_abono_delete
AFTER DELETE ON abonos_pedidos
FOR EACH ROW
BEGIN
  UPDATE pedidos
  SET total_abonado = total_abonado - OLD.monto,
      saldo_pendiente = saldo_pendiente + OLD.monto
  WHERE id = OLD.pedido_id;
END;

-- =========================================
-- VISTAS
-- =========================================

-- Vista: Resumen de estado de pagos de pedidos
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
