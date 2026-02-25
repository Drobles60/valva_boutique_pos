-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: valva_boutique
-- ------------------------------------------------------
-- Server version	8.4.6

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `abonos`
--

DROP TABLE IF EXISTS `abonos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `abonos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cuenta_por_cobrar_id` int unsigned NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','transferencia','mixto') DEFAULT 'efectivo',
  `referencia_transferencia` varchar(50) DEFAULT NULL COMMENT 'Origen de la transferencia: Nequi, Bancolombia, Daviplata, Otro',
  `fecha_abono` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` int unsigned DEFAULT NULL,
  `notas` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cuenta_por_cobrar_id` (`cuenta_por_cobrar_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `abonos_ibfk_1` FOREIGN KEY (`cuenta_por_cobrar_id`) REFERENCES `cuentas_por_cobrar` (`id`),
  CONSTRAINT `abonos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `abonos`
--

LOCK TABLES `abonos` WRITE;
/*!40000 ALTER TABLE `abonos` DISABLE KEYS */;
/*!40000 ALTER TABLE `abonos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `abonos_pedidos`
--

DROP TABLE IF EXISTS `abonos_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `abonos_pedidos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `pedido_id` int unsigned NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_abono` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `metodo_pago` enum('efectivo','transferencia','cheque','otro') DEFAULT 'efectivo',
  `referencia` varchar(100) DEFAULT NULL,
  `notas` text,
  `usuario_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_pedido_id` (`pedido_id`),
  KEY `idx_fecha_abono` (`fecha_abono`),
  CONSTRAINT `abonos_pedidos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `abonos_pedidos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `abonos_pedidos`
--

LOCK TABLES `abonos_pedidos` WRITE;
/*!40000 ALTER TABLE `abonos_pedidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `abonos_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tabla` varchar(100) DEFAULT NULL,
  `registro_id` int DEFAULT NULL,
  `accion` varchar(30) DEFAULT NULL,
  `usuario_id` int unsigned DEFAULT NULL,
  `fecha_accion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cajas`
--

DROP TABLE IF EXISTS `cajas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cajas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `estado` varchar(30) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cajas`
--

LOCK TABLES `cajas` WRITE;
/*!40000 ALTER TABLE `cajas` DISABLE KEYS */;
INSERT INTO `cajas` VALUES (1,'Caja Principal','CAJA-01','activa','2026-02-15 16:38:22','2026-02-15 16:38:22');
/*!40000 ALTER TABLE `cajas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_padre`
--

DROP TABLE IF EXISTS `categorias_padre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_padre` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `orden` int DEFAULT '0',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_padre`
--

LOCK TABLES `categorias_padre` WRITE;
/*!40000 ALTER TABLE `categorias_padre` DISABLE KEYS */;
INSERT INTO `categorias_padre` VALUES (1,'Pantalon','cualquier tipo de pantalon',1,'activo','2026-02-15 16:47:48','2026-02-15 16:47:48'),(2,'Blusa','Cualquier tipo de blusa',2,'activo','2026-02-15 16:47:48','2026-02-15 16:47:48'),(3,'Conjunto','Prendas que se venden como una sola',3,'activo','2026-02-15 16:47:48','2026-02-15 16:47:48'),(4,'Faldas','Faldas de diversos estilos',4,'activo','2026-02-15 16:47:48','2026-02-15 16:47:48'),(5,'Shorts','Toda prenda ',5,'activo','2026-02-15 16:47:48','2026-02-15 16:47:48'),(6,'Vestidos','Todas clase de vestidos',6,'activo','2026-02-15 16:47:48','2026-02-15 16:47:48'),(7,'Bolsos','Bolsos de diversos tipos',7,'activo','2026-02-15 16:47:48','2026-02-15 16:47:48'),(8,'BLUSAS','Categoría de prueba',0,'activo','2026-02-24 02:00:57','2026-02-24 02:00:57'),(9,'JEANS','Categoría de prueba',0,'activo','2026-02-24 02:00:57','2026-02-24 02:00:57');
/*!40000 ALTER TABLE `categorias_padre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `identificacion` varchar(50) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `direccion` text,
  `email` varchar(150) DEFAULT NULL,
  `tipo_cliente` enum('publico','mayorista','especial') DEFAULT 'publico',
  `limite_credito` decimal(10,2) DEFAULT '0.00',
  `saldo_pendiente` decimal(10,2) DEFAULT '0.00',
  `saldo_actual` decimal(10,2) DEFAULT '0.00',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compra_detalle`
--

DROP TABLE IF EXISTS `compra_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra_detalle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `compra_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `costo_unitario` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento_pct` decimal(5,2) DEFAULT '0.00',
  `iva_pct` decimal(5,2) DEFAULT '0.00',
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `idx_compra` (`compra_id`),
  KEY `idx_producto` (`producto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra_detalle`
--

LOCK TABLES `compra_detalle` WRITE;
/*!40000 ALTER TABLE `compra_detalle` DISABLE KEYS */;
/*!40000 ALTER TABLE `compra_detalle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras`
--

DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_compra` varchar(30) DEFAULT NULL,
  `proveedor_id` int DEFAULT NULL,
  `factura_numero` varchar(100) DEFAULT NULL,
  `fecha` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `tipo_pago` enum('contado','credito','mixto') DEFAULT 'contado',
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `descuento_total` decimal(12,2) DEFAULT '0.00',
  `iva_total` decimal(12,2) DEFAULT '0.00',
  `otros_costos` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) DEFAULT '0.00',
  `abono_inicial` decimal(12,2) DEFAULT '0.00',
  `estado` enum('borrador','confirmada','anulada') DEFAULT 'borrador',
  `usuario_id` int DEFAULT NULL,
  `observaciones` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_compra` (`numero_compra`),
  KEY `idx_proveedor` (`proveedor_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras`
--

LOCK TABLES `compras` WRITE;
/*!40000 ALTER TABLE `compras` DISABLE KEYS */;
/*!40000 ALTER TABLE `compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_sistema`
--

DROP TABLE IF EXISTS `configuracion_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_sistema` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` text,
  `tipo_dato` enum('string','number','boolean','json') DEFAULT 'string',
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sistema`
--

LOCK TABLES `configuracion_sistema` WRITE;
/*!40000 ALTER TABLE `configuracion_sistema` DISABLE KEYS */;
INSERT INTO `configuracion_sistema` VALUES (1,'nombre_negocio','Valva Boutique','string','Nombre del negocio','2026-02-15 16:40:25','2026-02-15 16:40:25'),(2,'ruc','0000000000001','string','RUC del negocio','2026-02-15 16:40:25','2026-02-15 16:40:25'),(3,'direccion','Dirección del negocio','string','Dirección física','2026-02-15 16:40:25','2026-02-15 16:40:25'),(4,'telefono','0999999999','string','Teléfono de contacto','2026-02-15 16:40:25','2026-02-15 16:40:25'),(5,'email','contacto@valvaboutique.com','string','Email de contacto','2026-02-15 16:40:25','2026-02-15 16:40:25'),(6,'iva_porcentaje','15','number','Porcentaje de IVA aplicable','2026-02-15 16:40:25','2026-02-15 16:40:25'),(7,'moneda','USD','string','Moneda del sistema','2026-02-15 16:40:25','2026-02-15 16:40:25'),(8,'formato_numero_venta','VEN-{YYYY}{MM}{DD}-{####}','string','Formato para número de venta','2026-02-15 16:40:25','2026-02-15 16:40:25'),(9,'formato_numero_compra','COM-{YYYY}{MM}{DD}-{####}','string','Formato para número de compra','2026-02-15 16:40:25','2026-02-15 16:40:25'),(10,'permitir_venta_stock_negativo','false','boolean','Permitir ventas con stock negativo','2026-02-15 16:40:25','2026-02-15 16:40:25'),(11,'dias_alerta_vencimiento','30','number','Días para alertar vencimiento de créditos','2026-02-15 16:40:25','2026-02-15 16:40:25');
/*!40000 ALTER TABLE `configuracion_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuentas_por_cobrar`
--

DROP TABLE IF EXISTS `cuentas_por_cobrar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentas_por_cobrar` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int unsigned NOT NULL,
  `venta_id` int unsigned NOT NULL,
  `monto_total` decimal(10,2) NOT NULL,
  `saldo_pendiente` decimal(10,2) NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `estado` enum('pendiente','pagada','vencida') DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `venta_id` (`venta_id`),
  CONSTRAINT `cuentas_por_cobrar_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `cuentas_por_cobrar_ibfk_2` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentas_por_cobrar`
--

LOCK TABLES `cuentas_por_cobrar` WRITE;
/*!40000 ALTER TABLE `cuentas_por_cobrar` DISABLE KEYS */;
/*!40000 ALTER TABLE `cuentas_por_cobrar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `descuento_productos`
--

DROP TABLE IF EXISTS `descuento_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `descuento_productos` (
  `descuento_id` int unsigned NOT NULL,
  `producto_id` int unsigned NOT NULL,
  PRIMARY KEY (`descuento_id`,`producto_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `descuento_productos_ibfk_1` FOREIGN KEY (`descuento_id`) REFERENCES `descuentos` (`id`),
  CONSTRAINT `descuento_productos_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descuento_productos`
--

LOCK TABLES `descuento_productos` WRITE;
/*!40000 ALTER TABLE `descuento_productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `descuento_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `descuento_tipos_prenda`
--

DROP TABLE IF EXISTS `descuento_tipos_prenda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `descuento_tipos_prenda` (
  `descuento_id` int unsigned NOT NULL,
  `tipo_prenda_id` int unsigned NOT NULL,
  PRIMARY KEY (`descuento_id`,`tipo_prenda_id`),
  KEY `tipo_prenda_id` (`tipo_prenda_id`),
  CONSTRAINT `descuento_tipos_prenda_ibfk_1` FOREIGN KEY (`descuento_id`) REFERENCES `descuentos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `descuento_tipos_prenda_ibfk_2` FOREIGN KEY (`tipo_prenda_id`) REFERENCES `tipos_prenda` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descuento_tipos_prenda`
--

LOCK TABLES `descuento_tipos_prenda` WRITE;
/*!40000 ALTER TABLE `descuento_tipos_prenda` DISABLE KEYS */;
/*!40000 ALTER TABLE `descuento_tipos_prenda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `descuentos`
--

DROP TABLE IF EXISTS `descuentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `descuentos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `tipo` enum('fijo','porcentaje') NOT NULL COMMENT 'fijo: valor en dinero, porcentaje: % del precio',
  `valor` decimal(10,2) NOT NULL COMMENT 'Valor del descuento (monto fijo o porcentaje)',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `aplicable_a` enum('productos','tipos_prenda') NOT NULL COMMENT 'productos: prendas específicas, tipos_prenda: tipos de prenda',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descuentos`
--

LOCK TABLES `descuentos` WRITE;
/*!40000 ALTER TABLE `descuentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `descuentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_pedidos`
--

DROP TABLE IF EXISTS `detalle_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_pedidos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `pedido_id` int unsigned NOT NULL,
  `descripcion` varchar(500) NOT NULL,
  `cantidad` int NOT NULL,
  `precio_total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  CONSTRAINT `detalle_pedidos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedidos`
--

LOCK TABLES `detalle_pedidos` WRITE;
/*!40000 ALTER TABLE `detalle_pedidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_ventas`
--

DROP TABLE IF EXISTS `detalle_ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ventas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `venta_id` int unsigned DEFAULT NULL,
  `producto_id` int unsigned DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `venta_id` (`venta_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`),
  CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ventas`
--

LOCK TABLES `detalle_ventas` WRITE;
/*!40000 ALTER TABLE `detalle_ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gastos`
--

DROP TABLE IF EXISTS `gastos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gastos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `categoria` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ej: Servicios, Nómina, Insumos',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha_gasto` date NOT NULL,
  `metodo_pago` enum('efectivo','transferencia','otro') COLLATE utf8mb4_unicode_ci DEFAULT 'efectivo',
  `referencia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Número de factura o comprobante',
  `notas` text COLLATE utf8mb4_unicode_ci COMMENT 'Información adicional opcional',
  `usuario_id` int unsigned DEFAULT NULL COMMENT 'Usuario que registró el gasto',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_gasto_usuario` (`usuario_id`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_fecha_gasto` (`fecha_gasto`),
  CONSTRAINT `fk_gasto_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gastos`
--

LOCK TABLES `gastos` WRITE;
/*!40000 ALTER TABLE `gastos` DISABLE KEYS */;
INSERT INTO `gastos` VALUES (1,'servicios','Luz de FebreroLuz de Febrero',50000.00,'2026-02-24','efectivo','no aplica',NULL,1,'2026-02-24 19:15:11','2026-02-24 19:15:11');
/*!40000 ALTER TABLE `gastos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_caja`
--

DROP TABLE IF EXISTS `movimientos_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_caja` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sesion_caja_id` int unsigned DEFAULT NULL,
  `tipo_movimiento` varchar(30) DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `venta_id` int unsigned DEFAULT NULL,
  `usuario_id` int unsigned DEFAULT NULL,
  `fecha_movimiento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sesion_caja_id` (`sesion_caja_id`),
  KEY `venta_id` (`venta_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `movimientos_caja_ibfk_1` FOREIGN KEY (`sesion_caja_id`) REFERENCES `sesiones_caja` (`id`),
  CONSTRAINT `movimientos_caja_ibfk_2` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`),
  CONSTRAINT `movimientos_caja_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_caja`
--

LOCK TABLES `movimientos_caja` WRITE;
/*!40000 ALTER TABLE `movimientos_caja` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_inventario`
--

DROP TABLE IF EXISTS `movimientos_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_inventario` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `producto_id` int unsigned NOT NULL,
  `tipo_movimiento` enum('entrada_inicial','entrada_devolucion','salida_venta','salida_merma','ajuste_manual') NOT NULL,
  `cantidad` int NOT NULL COMMENT 'Cantidad del movimiento (positivo para entrada, negativo para salida)',
  `stock_anterior` int NOT NULL,
  `stock_nuevo` int NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `referencia_id` int unsigned DEFAULT NULL COMMENT 'ID de referencia adicional',
  `venta_id` int unsigned DEFAULT NULL COMMENT 'ID de la venta si es salida por venta',
  `usuario_id` int unsigned DEFAULT NULL,
  `fecha_movimiento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `venta_id` (`venta_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_producto_fecha` (`producto_id`,`fecha_movimiento`),
  KEY `idx_tipo_movimiento` (`tipo_movimiento`),
  CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `movimientos_inventario_ibfk_2` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`),
  CONSTRAINT `movimientos_inventario_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_inventario`
--

LOCK TABLES `movimientos_inventario` WRITE;
/*!40000 ALTER TABLE `movimientos_inventario` DISABLE KEYS */;
INSERT INTO `movimientos_inventario` VALUES (1,5,'salida_venta',-3,20,17,'Venta mostrador demo',NULL,NULL,NULL,'2026-02-14 02:04:15'),(2,5,'entrada_inicial',10,17,27,'Segunda compra proveedor MODA DEMO',NULL,NULL,NULL,'2026-02-04 02:06:40'),(3,5,'salida_venta',-4,27,23,'Venta mostrador # 00012',NULL,NULL,NULL,'2026-02-09 02:06:40'),(4,5,'entrada_devolucion',1,23,24,'Devolución cliente: talla incorrecta',NULL,NULL,NULL,'2026-02-14 02:06:40'),(5,5,'salida_venta',-2,24,22,'Venta mostrador # 00025',NULL,NULL,NULL,'2026-02-19 02:06:40'),(6,5,'ajuste_manual',3,22,25,'Ajuste físico conteo inventario',NULL,NULL,NULL,'2026-02-24 02:06:40');
/*!40000 ALTER TABLE `movimientos_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos_mixtos_abonos`
--

DROP TABLE IF EXISTS `pagos_mixtos_abonos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos_mixtos_abonos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `abono_id` int unsigned NOT NULL,
  `monto_efectivo` decimal(10,2) DEFAULT '0.00',
  `monto_transferencia` decimal(10,2) DEFAULT '0.00',
  `monto_tarjeta` decimal(10,2) DEFAULT '0.00',
  `referencia_transferencia` varchar(50) DEFAULT NULL COMMENT 'Origen de la transferencia en pagos mixtos',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_abono_id` (`abono_id`),
  CONSTRAINT `pagos_mixtos_abonos_ibfk_1` FOREIGN KEY (`abono_id`) REFERENCES `abonos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_mixtos_abonos`
--

LOCK TABLES `pagos_mixtos_abonos` WRITE;
/*!40000 ALTER TABLE `pagos_mixtos_abonos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagos_mixtos_abonos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos_mixtos_ventas`
--

DROP TABLE IF EXISTS `pagos_mixtos_ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos_mixtos_ventas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `venta_id` int unsigned NOT NULL,
  `monto_efectivo` decimal(10,2) DEFAULT '0.00',
  `monto_transferencia` decimal(10,2) DEFAULT '0.00',
  `monto_tarjeta` decimal(10,2) DEFAULT '0.00',
  `referencia_transferencia` varchar(50) DEFAULT NULL COMMENT 'Origen de la transferencia en pagos mixtos',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_venta_id` (`venta_id`),
  CONSTRAINT `pagos_mixtos_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_mixtos_ventas`
--

LOCK TABLES `pagos_mixtos_ventas` WRITE;
/*!40000 ALTER TABLE `pagos_mixtos_ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagos_mixtos_ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `numero_pedido` varchar(50) DEFAULT NULL,
  `proveedor_id` int unsigned NOT NULL,
  `fecha_pedido` date NOT NULL,
  `costo_total` decimal(10,2) NOT NULL,
  `total_abonado` decimal(10,2) DEFAULT '0.00',
  `saldo_pendiente` decimal(10,2) DEFAULT '0.00',
  `estado` enum('pendiente','recibido') DEFAULT 'pendiente',
  `fecha_recibido` timestamp NULL DEFAULT NULL,
  `usuario_id` int unsigned DEFAULT NULL,
  `notas` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_pedido` (`numero_pedido`),
  KEY `proveedor_id` (`proveedor_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `codigo_barras` varchar(100) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text,
  `categoria_padre_id` int unsigned NOT NULL,
  `tipo_prenda_id` int unsigned NOT NULL,
  `talla_id` int unsigned DEFAULT NULL,
  `proveedor_id` int unsigned NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `precio_compra` decimal(10,2) DEFAULT NULL,
  `precio_venta` decimal(10,2) DEFAULT NULL,
  `precio_minimo` decimal(10,2) DEFAULT NULL,
  `stock_actual` int DEFAULT '0',
  `estado` enum('activo','inactivo','agotado') DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_barras` (`codigo_barras`),
  UNIQUE KEY `sku` (`sku`),
  KEY `categoria_padre_id` (`categoria_padre_id`),
  KEY `tipo_prenda_id` (`tipo_prenda_id`),
  KEY `talla_id` (`talla_id`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_padre_id`) REFERENCES `categorias_padre` (`id`),
  CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`tipo_prenda_id`) REFERENCES `tipos_prenda` (`id`),
  CONSTRAINT `productos_ibfk_3` FOREIGN KEY (`talla_id`) REFERENCES `tallas` (`id`),
  CONSTRAINT `productos_ibfk_4` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (2,NULL,'TST-BLU-S-NEG','BLUSA FLORAL',NULL,8,82,2,2,'NEGRO',15.00,35.00,35.00,20,'activo','2026-02-24 02:00:57','2026-02-24 02:00:57'),(3,NULL,'TST-BLU-M-BLA','BLUSA FLORAL',NULL,8,82,3,2,'BLANCO',15.00,35.00,35.00,15,'activo','2026-02-24 02:01:13','2026-02-24 02:01:13'),(5,NULL,'DEMO-BLU-S-NEG','BLUSA FLORAL',NULL,8,84,2,2,'NEGRO',15.00,35.00,35.00,25,'activo','2026-02-24 02:04:15','2026-02-24 02:06:40'),(9,NULL,'DEMO-JEA-30-NAV','JEAN RECTO',NULL,9,85,18,2,'NAVY',22.00,55.00,55.00,18,'activo','2026-02-24 02:04:15','2026-02-24 02:04:15');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) DEFAULT NULL,
  `ruc` varchar(50) NOT NULL,
  `razon_social` varchar(200) NOT NULL,
  `nombre_comercial` varchar(200) DEFAULT NULL,
  `telefono` varchar(30) NOT NULL,
  `celular` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `direccion` text,
  `ciudad` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `persona_contacto` varchar(100) DEFAULT NULL,
  `telefono_contacto` varchar(30) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ruc` (`ruc`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,NULL,'323423','medayork',NULL,'312313|e412',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'activo','2026-02-24 01:25:37','2026-02-24 01:25:37'),(2,NULL,'1790001122001','DISTRIBUIDORA MODA SAS',NULL,'0998887766',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'activo','2026-02-24 02:00:57','2026-02-24 02:00:57');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones_caja`
--

DROP TABLE IF EXISTS `sesiones_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones_caja` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `caja_id` int unsigned DEFAULT NULL,
  `usuario_id` int unsigned DEFAULT NULL,
  `fecha_apertura` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `estado` varchar(30) DEFAULT 'abierta',
  `monto_base` decimal(10,2) DEFAULT '0.00',
  `notas_apertura` text,
  `efectivo_contado` decimal(10,2) DEFAULT NULL,
  `notas_cierre` text,
  PRIMARY KEY (`id`),
  KEY `caja_id` (`caja_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `sesiones_caja_ibfk_1` FOREIGN KEY (`caja_id`) REFERENCES `cajas` (`id`),
  CONSTRAINT `sesiones_caja_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_caja`
--

LOCK TABLES `sesiones_caja` WRITE;
/*!40000 ALTER TABLE `sesiones_caja` DISABLE KEYS */;
INSERT INTO `sesiones_caja` VALUES (1,1,1,'2026-02-21 20:11:06','2026-02-22 04:43:03','cerrada',50000.00,NULL,NULL,NULL),(2,1,1,'2026-02-24 01:15:08',NULL,'abierta',50000.00,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sesiones_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sistemas_tallas`
--

DROP TABLE IF EXISTS `sistemas_tallas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sistemas_tallas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `tipo` enum('letras','numeros','mixto') DEFAULT 'letras',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sistemas_tallas`
--

LOCK TABLES `sistemas_tallas` WRITE;
/*!40000 ALTER TABLE `sistemas_tallas` DISABLE KEYS */;
INSERT INTO `sistemas_tallas` VALUES (1,'Tallas Estándar Mujer (Letras)','Sistema de tallas XS, S, M, L, XL, XXL, XXXL para mujer','letras','2026-02-15 16:49:26','2026-02-15 16:49:26'),(2,'Tallas Numéricas Mujer','Tallas numéricas de mujer 2, 4, 6, 8, 10, 12, 14, 16, 18, 20','numeros','2026-02-15 16:49:26','2026-02-15 16:49:26'),(3,'Tallas Jeans Mujer','Tallas de jeans para mujer 24, 26, 28, 30, 32, 34, 36, 38','numeros','2026-02-15 16:49:26','2026-02-15 16:49:26'),(4,'Tallas Calzado Mujer','Tallas de calzado de mujer 34 a 41','numeros','2026-02-15 16:49:26','2026-02-15 16:49:26'),(5,'Talla Única','Talla única para accesorios y bolsos','letras','2026-02-15 16:49:26','2026-02-15 16:49:26');
/*!40000 ALTER TABLE `sistemas_tallas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tallas`
--

DROP TABLE IF EXISTS `tallas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tallas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sistema_talla_id` int unsigned NOT NULL,
  `valor` varchar(20) NOT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `orden` int DEFAULT '0',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sistema_talla_id` (`sistema_talla_id`),
  CONSTRAINT `tallas_ibfk_1` FOREIGN KEY (`sistema_talla_id`) REFERENCES `sistemas_tallas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tallas`
--

LOCK TABLES `tallas` WRITE;
/*!40000 ALTER TABLE `tallas` DISABLE KEYS */;
INSERT INTO `tallas` VALUES (1,1,'XS','Extra Small - Talla Extra Pequeña',1,'activo','2026-02-15 16:49:38','2026-02-15 16:49:38'),(2,1,'S','Small - Talla Pequeña',2,'activo','2026-02-15 16:49:38','2026-02-15 16:49:38'),(3,1,'M','Medium - Talla Mediana',3,'activo','2026-02-15 16:49:38','2026-02-15 16:49:38'),(4,1,'L','Large - Talla Grande',4,'activo','2026-02-15 16:49:38','2026-02-15 16:49:38'),(5,1,'XL','Extra Large - Talla Extra Grande',5,'activo','2026-02-15 16:49:38','2026-02-15 16:49:38'),(6,1,'U','Única - Talla Única',6,'activo','2026-02-15 16:49:38','2026-02-15 16:49:38'),(7,2,'4','Talla 4 - Pequeña',1,'activo','2026-02-15 16:49:48','2026-02-15 16:49:48'),(8,2,'6','Talla 6 - Pequeña-Mediana',2,'activo','2026-02-15 16:49:48','2026-02-15 16:49:48'),(9,2,'8','Talla 8 - Mediana',3,'activo','2026-02-15 16:49:48','2026-02-15 16:49:48'),(10,2,'10','Talla 10 - Mediana',4,'activo','2026-02-15 16:49:48','2026-02-15 16:49:48'),(11,2,'12','Talla 12 - Mediana-Grande',5,'activo','2026-02-15 16:49:48','2026-02-15 16:49:48'),(12,2,'14','Talla 14 - Grande',6,'activo','2026-02-15 16:49:48','2026-02-15 16:49:48'),(13,2,'16','Talla 16 - Grande',7,'activo','2026-02-15 16:49:48','2026-02-15 16:49:48'),(14,2,'U','Única - Talla Única',8,'activo','2026-02-15 16:49:48','2026-02-15 16:49:48'),(15,3,'24','Talla 24 - Cintura 61cm',1,'activo','2026-02-15 16:49:58','2026-02-15 16:49:58'),(16,3,'26','Talla 26 - Cintura 66cm',2,'activo','2026-02-15 16:49:58','2026-02-15 16:49:58'),(17,3,'28','Talla 28 - Cintura 71cm',3,'activo','2026-02-15 16:49:58','2026-02-15 16:49:58'),(18,3,'30','Talla 30 - Cintura 76cm',4,'activo','2026-02-15 16:49:58','2026-02-15 16:49:58'),(19,3,'32','Talla 32 - Cintura 81cm',5,'activo','2026-02-15 16:49:58','2026-02-15 16:49:58'),(20,3,'34','Talla 34 - Cintura 86cm',6,'activo','2026-02-15 16:49:58','2026-02-15 16:49:58'),(21,3,'U','Única - Talla Única',7,'activo','2026-02-15 16:49:58','2026-02-15 16:49:58'),(22,4,'34','Talla 34 - 22cm',1,'activo','2026-02-15 16:50:07','2026-02-15 16:50:07'),(23,4,'35','Talla 35 - 22.5cm',2,'activo','2026-02-15 16:50:07','2026-02-15 16:50:07'),(24,4,'36','Talla 36 - 23cm',3,'activo','2026-02-15 16:50:07','2026-02-15 16:50:07'),(25,4,'37','Talla 37 - 23.5cm',4,'activo','2026-02-15 16:50:07','2026-02-15 16:50:07'),(26,4,'38','Talla 38 - 24cm',5,'activo','2026-02-15 16:50:07','2026-02-15 16:50:07'),(27,4,'39','Talla 39 - 24.5cm',6,'activo','2026-02-15 16:50:07','2026-02-15 16:50:07'),(28,4,'40','Talla 40 - 25cm',7,'activo','2026-02-15 16:50:07','2026-02-15 16:50:07'),(29,4,'41','Talla 41 - 25.5cm',8,'activo','2026-02-15 16:50:07','2026-02-15 16:50:07'),(30,4,'U','Única - Talla Única',9,'activo','2026-02-15 16:50:07','2026-02-15 16:50:07'),(31,5,'U','Talla única',1,'activo','2026-02-15 16:50:19','2026-02-15 16:50:19'),(32,1,'U','Única - Talla Única',6,'activo','2026-02-16 13:38:06','2026-02-16 13:38:06'),(33,2,'U','Única - Talla Única',8,'activo','2026-02-16 13:38:06','2026-02-16 13:38:06'),(34,3,'U','Única - Talla Única',7,'activo','2026-02-16 13:38:06','2026-02-16 13:38:06'),(35,4,'U','Única - Talla Única',9,'activo','2026-02-16 13:38:06','2026-02-16 13:38:06');
/*!40000 ALTER TABLE `tallas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_prenda_sistema_talla`
--

DROP TABLE IF EXISTS `tipo_prenda_sistema_talla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_prenda_sistema_talla` (
  `tipo_prenda_id` int unsigned NOT NULL,
  `sistema_talla_id` int unsigned NOT NULL,
  PRIMARY KEY (`tipo_prenda_id`,`sistema_talla_id`),
  KEY `sistema_talla_id` (`sistema_talla_id`),
  CONSTRAINT `tipo_prenda_sistema_talla_ibfk_1` FOREIGN KEY (`tipo_prenda_id`) REFERENCES `tipos_prenda` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tipo_prenda_sistema_talla_ibfk_2` FOREIGN KEY (`sistema_talla_id`) REFERENCES `sistemas_tallas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_prenda_sistema_talla`
--

LOCK TABLES `tipo_prenda_sistema_talla` WRITE;
/*!40000 ALTER TABLE `tipo_prenda_sistema_talla` DISABLE KEYS */;
INSERT INTO `tipo_prenda_sistema_talla` VALUES (4,1),(6,1),(7,1),(13,1),(14,1),(15,1),(16,1),(17,1),(18,1),(19,1),(20,1),(21,1),(22,1),(23,1),(24,1),(25,1),(26,1),(35,1),(38,1),(39,1),(44,1),(45,1),(46,1),(48,1),(49,1),(50,1),(52,1),(54,1),(55,1),(1,2),(2,2),(3,2),(5,2),(8,2),(9,2),(10,2),(12,2),(36,2),(40,2),(41,2),(42,2),(43,2),(45,2),(46,2),(47,2),(48,2),(49,2),(51,2),(53,2),(11,3),(37,3),(56,5),(57,5),(58,5),(59,5),(60,5),(61,5),(62,5),(63,5),(64,5),(65,5),(66,5),(67,5),(68,5),(69,5),(70,5),(71,5),(72,5),(73,5),(74,5),(75,5),(76,5),(77,5),(78,5),(79,5),(80,5),(81,5);
/*!40000 ALTER TABLE `tipo_prenda_sistema_talla` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_prenda`
--

DROP TABLE IF EXISTS `tipos_prenda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_prenda` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `categoria_padre_id` int unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `orden` int DEFAULT '0',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `categoria_padre_id` (`categoria_padre_id`),
  CONSTRAINT `tipos_prenda_ibfk_1` FOREIGN KEY (`categoria_padre_id`) REFERENCES `categorias_padre` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_prenda`
--

LOCK TABLES `tipos_prenda` WRITE;
/*!40000 ALTER TABLE `tipos_prenda` DISABLE KEYS */;
INSERT INTO `tipos_prenda` VALUES (1,1,'Pantalón de Vestir','Pantalón formal para ocasiones especiales',1,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(2,1,'Pantalón Casual','Pantalón de uso diario',2,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(3,1,'Pantalón Cargo','Pantalón con bolsillos laterales',3,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(4,1,'Pantalón Palazzo','Pantalón amplio de pierna ancha',4,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(5,1,'Pantalón Capri','Pantalón tres cuartos',5,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(6,1,'Leggings','Pantalón ajustado elástico',6,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(7,1,'Joggers','Pantalón deportivo con puño',7,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(8,1,'Pantalón Acampanado','Pantalón con bota ancha',8,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(9,1,'Pantalón Recto','Pantalón de corte recto clásico',9,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(10,1,'Pantalón Pitillo','Pantalón ajustado tipo skinny',10,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(11,1,'Pantalón Jean','Pantalón de mezclilla/denim',11,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(12,1,'Pantalón Lino','Pantalón fresco de lino',12,'activo','2026-02-15 16:47:59','2026-02-15 16:47:59'),(13,2,'Blusa Manga Larga','Blusa con manga completa',1,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(14,2,'Blusa Manga Corta','Blusa con manga corta',2,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(15,2,'Blusa Sin Mangas','Blusa tipo chaleco',3,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(16,2,'Blusa de Encaje','Blusa con detalles de encaje',4,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(17,2,'Blusa Campesina','Blusa con hombros descubiertos',5,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(18,2,'Blusa Crop Top','Blusa corta que deja el abdomen al descubierto',6,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(19,2,'Blusa Oversize','Blusa holgada de talla grande',7,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(20,2,'Blusa con Botones','Blusa tipo camisa con botonadura',8,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(21,2,'Blusa Cuello V','Blusa con escote en V',9,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(22,2,'Blusa Cuello Redondo','Blusa con cuello circular',10,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(23,2,'Blusa Estampada','Blusa con diseños o patrones',11,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(24,2,'Blusa Lisa','Blusa de color sólido sin estampados',12,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(25,2,'Blusa Satinada','Blusa de tela satinada brillante',13,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(26,2,'Blusa Transparente','Blusa de tela semi-transparente',14,'activo','2026-02-15 16:48:10','2026-02-15 16:48:10'),(35,4,'Falda Corta','Falda mini por encima de la rodilla',1,'activo','2026-02-15 16:48:32','2026-02-15 16:48:32'),(36,4,'Falda Midi','Falda a media pierna',2,'activo','2026-02-15 16:48:32','2026-02-15 16:48:32'),(37,4,'Falda Larga','Falda maxi hasta los tobillos',3,'activo','2026-02-15 16:48:32','2026-02-15 16:48:32'),(38,4,'Falda Plisada','Falda con pliegues',4,'activo','2026-02-15 16:48:32','2026-02-15 16:48:32'),(39,4,'Falda Tubo','Falda ajustada tipo lápiz',5,'activo','2026-02-15 16:48:32','2026-02-15 16:48:32'),(40,4,'Falda Acampanada','Falda con vuelo en A',6,'activo','2026-02-15 16:48:32','2026-02-15 16:48:32'),(41,4,'Falda con Vuelo','Falda circular amplia',7,'activo','2026-02-15 16:48:32','2026-02-15 16:48:32'),(42,4,'Falda Jean','Falda de mezclilla',8,'activo','2026-02-15 16:48:32','2026-02-15 16:48:32'),(43,4,'Falda Asimétrica','Falda con largo irregular',9,'activo','2026-02-15 16:48:32','2026-02-15 16:48:32'),(44,4,'Falda Recta','Falda de corte recto',10,'activo','2026-02-15 16:48:32','2026-02-15 16:48:32'),(45,5,'Short Jean','Short de mezclilla',1,'activo','2026-02-15 16:48:47','2026-02-15 16:48:47'),(46,5,'Short de Tela','Short de tela suave',2,'activo','2026-02-15 16:48:47','2026-02-15 16:48:47'),(47,5,'Short Deportivo','Short para actividades deportivas',3,'activo','2026-02-15 16:48:47','2026-02-15 16:48:47'),(48,5,'Short Cargo','Short con bolsillos laterales',4,'activo','2026-02-15 16:48:47','2026-02-15 16:48:47'),(49,5,'Short Bermuda','Short largo tipo bermuda',5,'activo','2026-02-15 16:48:47','2026-02-15 16:48:47'),(50,5,'Short Tiro Alto','Short con cintura alta',6,'activo','2026-02-15 16:48:47','2026-02-15 16:48:47'),(51,5,'Short Tiro Medio','Short con cintura media',7,'activo','2026-02-15 16:48:47','2026-02-15 16:48:47'),(52,5,'Short Ciclista','Short ajustado tipo biker',8,'activo','2026-02-15 16:48:47','2026-02-15 16:48:47'),(53,6,'Vestido Casual','Vestido de uso diario',1,'activo','2026-02-15 16:49:02','2026-02-15 16:49:02'),(54,6,'Vestido de Fiesta','Vestido elegante para eventos',2,'activo','2026-02-15 16:49:02','2026-02-15 16:49:02'),(55,6,'Vestido Formal','Vestido de gala o ceremonia',3,'activo','2026-02-15 16:49:02','2026-02-15 16:49:02'),(56,6,'Vestido Midi','Vestido a media pierna',4,'activo','2026-02-15 16:49:02','2026-02-15 16:49:02'),(57,6,'Vestido Maxi','Vestido largo hasta los tobillos',5,'activo','2026-02-15 16:49:02','2026-02-15 16:49:02'),(58,6,'Vestido Corto','Vestido mini por encima de la rodilla',6,'activo','2026-02-15 16:49:02','2026-02-15 16:49:02'),(59,6,'Vestido Cóctel','Vestido semi-formal',7,'activo','2026-02-15 16:49:02','2026-02-15 16:49:02'),(60,6,'Vestido Camisero','Vestido tipo camisa con botones',8,'activo','2026-02-15 16:49:02','2026-02-15 16:49:02'),(61,6,'Vestido Tubo','Vestido ajustado tipo bodycon',9,'activo','2026-02-15 16:49:02','2026-02-15 16:49:02'),(62,6,'Vestido Playero','Vestido ligero para playa',10,'activo','2026-02-15 16:49:02','2026-02-15 16:49:02'),(63,6,'Vestido Acampanado','Vestido con falda con vuelo',11,'activo','2026-02-15 16:49:02','2026-02-15 16:49:02'),(64,7,'Bolso de Mano','Bolso pequeño con asa corta',1,'activo','2026-02-15 16:49:14','2026-02-15 16:49:14'),(65,7,'Bolso Bandolera','Bolso con correa cruzada',2,'activo','2026-02-15 16:49:14','2026-02-15 16:49:14'),(66,7,'Bolso Tote','Bolso grande tipo shopping',3,'activo','2026-02-15 16:49:14','2026-02-15 16:49:14'),(67,7,'Mochila','Bolso para la espalda',4,'activo','2026-02-15 16:49:14','2026-02-15 16:49:14'),(68,7,'Clutch','Bolso de mano pequeño sin asas',5,'activo','2026-02-15 16:49:14','2026-02-15 16:49:14'),(69,7,'Bolso Shopper','Bolso amplio para compras',6,'activo','2026-02-15 16:49:14','2026-02-15 16:49:14'),(70,7,'Cartera','Billetera o monedero',7,'activo','2026-02-15 16:49:14','2026-02-15 16:49:14'),(71,7,'Riñonera','Bolso para la cintura',8,'activo','2026-02-15 16:49:14','2026-02-15 16:49:14'),(72,7,'Bolso Satchel','Bolso estructurado con solapa',9,'activo','2026-02-15 16:49:14','2026-02-15 16:49:14'),(73,7,'Bolso Bucket','Bolso tipo cubo con cordón',10,'activo','2026-02-15 16:49:14','2026-02-15 16:49:14'),(74,3,'Conjunto Deportivo','Conjunto para actividades deportivas',1,'activo','2026-02-15 16:48:22','2026-02-15 16:48:22'),(75,3,'Conjunto Casual','Conjunto de uso diario',2,'activo','2026-02-15 16:48:22','2026-02-15 16:48:22'),(76,3,'Conjunto de Vestir','Conjunto formal elegante',3,'activo','2026-02-15 16:48:22','2026-02-15 16:48:22'),(77,3,'Conjunto Crop Top + Falda','Conjunto de dos piezas con crop top',4,'activo','2026-02-15 16:48:22','2026-02-15 16:48:22'),(78,3,'Conjunto Blusa + Pantalón','Conjunto coordinado de blusa y pantalón',5,'activo','2026-02-15 16:48:22','2026-02-15 16:48:22'),(79,3,'Conjunto Top + Short','Conjunto de top y short',6,'activo','2026-02-15 16:48:22','2026-02-15 16:48:22'),(80,3,'Conjunto Blazer + Pantalón','Conjunto ejecutivo',7,'activo','2026-02-15 16:48:22','2026-02-15 16:48:22'),(81,3,'Conjunto Playero','Conjunto para playa o piscina',8,'activo','2026-02-15 16:48:22','2026-02-15 16:48:22'),(82,8,'BLUSA MANGA CORTA',NULL,0,'activo','2026-02-24 02:00:57','2026-02-24 02:00:57'),(83,9,'JEAN SKINNY',NULL,0,'activo','2026-02-24 02:00:57','2026-02-24 02:00:57'),(84,8,'BLUSA FLORAL',NULL,0,'activo','2026-02-24 02:04:15','2026-02-24 02:04:15'),(85,9,'JEAN RECTO',NULL,0,'activo','2026-02-24 02:04:15','2026-02-24 02:04:15');
/*!40000 ALTER TABLE `tipos_prenda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `rol` varchar(30) DEFAULT NULL,
  `estado` varchar(30) DEFAULT NULL,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','admin@valvaboutique.com','$2b$10$UCgtWDXR6SqBm9pNq1wrUON1mqnYmVQiHkoo9DcLYlLCVczZ.yw0C','Administrador','Sistema','0999999999','administrador','activo','2026-02-24 02:07:54','2026-02-14 01:06:53','2026-02-24 02:07:54'),(2,'admin','admin@valvaboutique.com','$2b$10$UCgtWDXR6SqBm9pNq1wrUON1mqnYmVQiHkoo9DcLYlLCVczZ.yw0C','Administrador','Sistema','0999999999','administrador','activo',NULL,'2026-02-14 01:11:54','2026-02-16 14:45:34'),(3,'admin','admin@valvaboutique.com','$2b$10$UCgtWDXR6SqBm9pNq1wrUON1mqnYmVQiHkoo9DcLYlLCVczZ.yw0C','Administrador','Sistema','0999999999','administrador','activo',NULL,'2026-02-15 16:38:04','2026-02-16 14:45:34');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `numero_venta` varchar(50) DEFAULT NULL,
  `cliente_id` int unsigned DEFAULT NULL,
  `fecha_venta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `subtotal` decimal(10,2) DEFAULT '0.00',
  `iva` decimal(10,2) DEFAULT '0.00',
  `descuento` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `estado` enum('completada','credito','anulada') DEFAULT 'completada',
  `tipo_venta` enum('contado','credito') DEFAULT 'contado',
  `metodo_pago` enum('efectivo','transferencia','mixto') DEFAULT 'efectivo',
  `efectivo_recibido` decimal(10,2) DEFAULT NULL COMMENT 'Monto en efectivo recibido del cliente',
  `cambio` decimal(10,2) DEFAULT NULL COMMENT 'Cambio devuelto al cliente',
  `referencia_transferencia` varchar(50) DEFAULT NULL COMMENT 'Origen de la transferencia: Nequi, Bancolombia, Daviplata, Otro',
  `descuento_id` int unsigned DEFAULT NULL,
  `usuario_id` int unsigned DEFAULT NULL,
  `caja_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_venta` (`numero_venta`),
  KEY `cliente_id` (`cliente_id`),
  KEY `descuento_id` (`descuento_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `caja_id` (`caja_id`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`descuento_id`) REFERENCES `descuentos` (`id`),
  CONSTRAINT `ventas_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `ventas_ibfk_4` FOREIGN KEY (`caja_id`) REFERENCES `cajas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vista_estado_pedidos`
--

DROP TABLE IF EXISTS `vista_estado_pedidos`;
/*!50001 DROP VIEW IF EXISTS `vista_estado_pedidos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_estado_pedidos` AS SELECT 
 1 AS `id`,
 1 AS `numero_pedido`,
 1 AS `proveedor_id`,
 1 AS `proveedor_nombre`,
 1 AS `proveedor_codigo`,
 1 AS `fecha_pedido`,
 1 AS `costo_total`,
 1 AS `total_abonado`,
 1 AS `saldo_pendiente`,
 1 AS `estado`,
 1 AS `fecha_recibido`,
 1 AS `estado_pago`,
 1 AS `porcentaje_pagado`,
 1 AS `cantidad_abonos`,
 1 AS `created_at`,
 1 AS `updated_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vista_estado_pedidos`
--

/*!50001 DROP VIEW IF EXISTS `vista_estado_pedidos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_estado_pedidos` AS select `p`.`id` AS `id`,`p`.`numero_pedido` AS `numero_pedido`,`p`.`proveedor_id` AS `proveedor_id`,`pr`.`razon_social` AS `proveedor_nombre`,`pr`.`codigo` AS `proveedor_codigo`,`p`.`fecha_pedido` AS `fecha_pedido`,`p`.`costo_total` AS `costo_total`,`p`.`total_abonado` AS `total_abonado`,`p`.`saldo_pendiente` AS `saldo_pendiente`,`p`.`estado` AS `estado`,`p`.`fecha_recibido` AS `fecha_recibido`,(case when (`p`.`saldo_pendiente` = 0) then 'pagado' when (`p`.`total_abonado` = 0) then 'sin_pagar' when ((`p`.`saldo_pendiente` > 0) and (`p`.`total_abonado` > 0)) then 'pago_parcial' else 'sin_pagar' end) AS `estado_pago`,round(((`p`.`total_abonado` / `p`.`costo_total`) * 100),2) AS `porcentaje_pagado`,(select count(0) from `abonos_pedidos` where (`abonos_pedidos`.`pedido_id` = `p`.`id`)) AS `cantidad_abonos`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from (`pedidos` `p` left join `proveedores` `pr` on((`p`.`proveedor_id` = `pr`.`id`))) order by `p`.`created_at` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-24 21:21:39
