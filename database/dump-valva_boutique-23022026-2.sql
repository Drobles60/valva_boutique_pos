-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: valva_boutique
-- ------------------------------------------------------
-- Server version	9.5.0

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
  `fecha_abono` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` int unsigned DEFAULT NULL,
  `notas` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `referencia_transferencia` varchar(50) DEFAULT NULL COMMENT 'Origen de la transferencia: Nequi, Bancolombia, Daviplata, Otro',
  PRIMARY KEY (`id`),
  KEY `cuenta_por_cobrar_id` (`cuenta_por_cobrar_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `abonos_ibfk_1` FOREIGN KEY (`cuenta_por_cobrar_id`) REFERENCES `cuentas_por_cobrar` (`id`),
  CONSTRAINT `abonos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `abonos`
--

LOCK TABLES `abonos` WRITE;
/*!40000 ALTER TABLE `abonos` DISABLE KEYS */;
INSERT INTO `abonos` VALUES (1,1,100000.00,'efectivo','2026-02-07 04:03:39',5,'Abono inicial','2026-02-07 04:03:39',NULL),(2,2,50000.00,'efectivo','2026-02-07 04:15:00',5,'Abono inicial','2026-02-07 04:15:00',NULL),(3,3,100000.00,'efectivo','2026-02-07 04:18:55',5,'Abono inicial','2026-02-07 04:18:55',NULL),(4,4,100000.00,'efectivo','2026-02-07 04:29:38',5,'Abono inicial','2026-02-07 04:29:38',NULL),(5,5,100000.00,'efectivo','2026-02-07 04:44:02',5,'Abono inicial','2026-02-07 04:44:02',NULL),(6,6,10000.00,'efectivo','2026-02-07 04:45:10',5,'Abono inicial','2026-02-07 04:45:10',NULL),(7,8,100000.00,'efectivo','2026-02-14 05:17:30',5,'Abono inicial','2026-02-14 05:17:30',NULL),(8,9,100000.00,'efectivo','2026-02-14 05:23:02',5,'Abono inicial','2026-02-14 05:23:02',NULL),(9,10,60000.00,'efectivo','2026-02-14 05:24:56',5,'Abono inicial','2026-02-14 05:24:56',NULL),(12,10,75000.00,'efectivo','2026-02-16 16:03:46',NULL,NULL,'2026-02-16 16:03:46',NULL),(13,1,50000.00,'efectivo','2026-02-17 19:21:17',NULL,NULL,'2026-02-17 19:21:17',NULL),(14,2,50000.00,'efectivo','2026-02-17 19:21:17',NULL,NULL,'2026-02-17 19:21:17',NULL),(15,3,50000.00,'efectivo','2026-02-17 19:21:17',NULL,NULL,'2026-02-17 19:21:17',NULL),(16,9,25000.00,'efectivo','2026-02-21 03:41:20',NULL,NULL,'2026-02-21 03:41:20',NULL),(17,11,80000.00,'efectivo','2026-02-21 03:45:25',5,'Abono inicial','2026-02-21 03:45:25',NULL),(18,13,20000.00,'efectivo','2026-02-21 22:51:34',5,'Abono inicial','2026-02-21 22:51:34',NULL),(19,4,50000.00,'efectivo','2026-02-21 23:06:12',NULL,NULL,'2026-02-21 23:06:12',NULL),(20,11,50000.00,'efectivo','2026-02-21 23:06:12',NULL,NULL,'2026-02-21 23:06:12',NULL),(21,4,50000.00,'efectivo','2026-02-21 23:07:35',NULL,NULL,'2026-02-21 23:07:35',NULL),(22,11,80000.00,'efectivo','2026-02-21 23:07:35',NULL,NULL,'2026-02-21 23:07:35',NULL),(23,13,85000.00,'efectivo','2026-02-21 23:07:35',NULL,NULL,'2026-02-21 23:07:35',NULL),(24,15,30000.00,'efectivo','2026-02-21 23:30:43',5,'Abono inicial','2026-02-21 23:30:43',NULL),(25,17,80000.00,'efectivo','2026-02-22 02:22:47',5,'Abono inicial','2026-02-22 02:22:47',NULL),(26,19,80000.00,'efectivo','2026-02-22 02:25:39',5,'Abono inicial','2026-02-22 02:25:39',NULL),(27,21,40000.00,'efectivo','2026-02-22 23:18:03',5,'Abono inicial','2026-02-22 23:18:03',NULL),(28,21,25000.00,'transferencia','2026-02-22 23:28:06',NULL,NULL,'2026-02-22 23:28:06',NULL),(29,17,85000.00,'efectivo','2026-02-22 23:33:54',NULL,NULL,'2026-02-22 23:33:54',NULL),(30,19,15000.00,'efectivo','2026-02-22 23:33:54',NULL,NULL,'2026-02-22 23:33:54',NULL),(31,17,85000.00,'efectivo','2026-02-22 23:34:47',NULL,NULL,'2026-02-22 23:34:47',NULL),(32,19,15000.00,'efectivo','2026-02-22 23:34:47',NULL,NULL,'2026-02-22 23:34:47',NULL),(33,19,100000.00,'efectivo','2026-02-22 23:37:44',NULL,NULL,'2026-02-22 23:37:44',NULL),(34,19,90000.00,'efectivo','2026-02-22 23:42:52',NULL,NULL,'2026-02-22 23:42:52',NULL),(35,21,10000.00,'efectivo','2026-02-22 23:42:52',NULL,NULL,'2026-02-22 23:42:52',NULL),(36,21,15000.00,'efectivo','2026-02-22 23:48:12',NULL,NULL,'2026-02-22 23:48:12',NULL),(37,2,50000.00,'transferencia','2026-02-22 23:48:37',NULL,NULL,'2026-02-22 23:48:37',NULL),(38,20,50000.00,'transferencia','2026-02-22 23:48:37',NULL,NULL,'2026-02-22 23:48:37',NULL),(39,20,35000.00,'efectivo','2026-02-22 23:49:06',NULL,NULL,'2026-02-22 23:49:06',NULL),(40,16,100000.00,'transferencia','2026-02-22 23:50:40',NULL,NULL,'2026-02-22 23:50:40','sdfsdfsd'),(41,16,140000.00,'efectivo','2026-02-22 23:51:09',NULL,NULL,'2026-02-22 23:51:09',NULL),(42,5,50000.00,'efectivo','2026-02-23 00:03:03',NULL,NULL,'2026-02-23 00:03:03',NULL),(43,6,30000.00,'efectivo','2026-02-23 00:03:03',NULL,NULL,'2026-02-23 00:03:03',NULL),(44,6,110000.00,'efectivo','2026-02-23 00:04:17',NULL,NULL,'2026-02-23 00:04:17',NULL),(45,23,30000.00,'efectivo','2026-02-23 00:30:22',5,'Abono inicial','2026-02-23 00:30:22',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `abonos_pedidos`
--

LOCK TABLES `abonos_pedidos` WRITE;
/*!40000 ALTER TABLE `abonos_pedidos` DISABLE KEYS */;
INSERT INTO `abonos_pedidos` VALUES (1,5,1000000.00,'2026-01-29 03:58:26','efectivo','efectivo',NULL,NULL,'2026-01-29 03:58:26'),(2,5,1000000.00,'2026-01-29 04:09:15','efectivo','efectivo',NULL,NULL,'2026-01-29 04:09:15'),(3,5,1000000.00,'2026-01-29 04:09:28','efectivo','efectivo',NULL,NULL,'2026-01-29 04:09:28'),(4,2,1000000.00,'2026-01-29 04:17:40','transferencia','12dfgrew',NULL,NULL,'2026-01-29 04:17:40'),(5,3,1000000.00,'2026-01-29 04:17:40','transferencia','12dfgrew',NULL,NULL,'2026-01-29 04:17:40'),(6,4,8000000.00,'2026-01-29 04:17:40','transferencia','12dfgrew',NULL,NULL,'2026-01-29 04:17:40'),(7,4,15000000.00,'2026-02-02 21:56:48','efectivo','12dfgrew',NULL,NULL,'2026-02-02 21:56:48'),(8,4,20000000.00,'2026-02-02 22:26:53','efectivo','12dfgrew',NULL,NULL,'2026-02-02 22:26:53'),(9,4,2222222.00,'2026-02-02 22:27:14','efectivo','12dfgrew',NULL,NULL,'2026-02-02 22:27:14'),(10,6,1000000.00,'2026-02-02 22:27:14','efectivo','12dfgrew',NULL,NULL,'2026-02-02 22:27:14'),(11,7,2777778.00,'2026-02-02 22:27:14','efectivo','12dfgrew',NULL,NULL,'2026-02-02 22:27:14'),(12,9,200000.00,'2026-02-21 03:38:38','efectivo',NULL,NULL,NULL,'2026-02-21 03:38:38'),(13,5,1000000.00,'2026-02-21 03:40:01','transferencia',NULL,NULL,NULL,'2026-02-21 03:40:01'),(14,9,200000.00,'2026-02-22 02:07:46','efectivo',NULL,NULL,NULL,'2026-02-22 02:07:46'),(15,5,1500000.00,'2026-02-22 02:08:40','efectivo',NULL,NULL,NULL,'2026-02-22 02:08:40'),(16,9,480000.00,'2026-02-22 02:08:40','efectivo',NULL,NULL,NULL,'2026-02-22 02:08:40'),(17,5,1500000.00,'2026-02-22 02:08:52','efectivo',NULL,NULL,NULL,'2026-02-22 02:08:52'),(18,9,480000.00,'2026-02-22 02:08:52','efectivo',NULL,NULL,NULL,'2026-02-22 02:08:52'),(19,10,600000.00,'2026-02-22 02:11:25','efectivo',NULL,NULL,NULL,'2026-02-22 02:11:25'),(20,10,600000.00,'2026-02-22 02:12:33','efectivo',NULL,NULL,NULL,'2026-02-22 02:12:33'),(21,10,600000.00,'2026-02-22 02:12:56','efectivo',NULL,NULL,NULL,'2026-02-22 02:12:56'),(22,10,300000.00,'2026-02-23 00:34:39','efectivo',NULL,NULL,NULL,'2026-02-23 00:34:39'),(23,10,300000.00,'2026-02-23 00:36:32','efectivo',NULL,NULL,NULL,'2026-02-23 00:36:32'),(24,5,1500000.00,'2026-02-23 00:37:12','efectivo',NULL,NULL,NULL,'2026-02-23 00:37:12'),(25,9,480000.00,'2026-02-23 00:37:12','efectivo',NULL,NULL,NULL,'2026-02-23 00:37:12'),(26,10,300000.00,'2026-02-23 00:37:49','efectivo',NULL,NULL,NULL,'2026-02-23 00:37:49');
/*!40000 ALTER TABLE `abonos_pedidos` ENABLE KEYS */;
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
INSERT INTO `cajas` VALUES (1,'Caja Principal','CAJA-01','activa','2026-02-04 03:17:48','2026-02-04 03:17:48');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_padre`
--

LOCK TABLES `categorias_padre` WRITE;
/*!40000 ALTER TABLE `categorias_padre` DISABLE KEYS */;
INSERT INTO `categorias_padre` VALUES (1,'Pantalon','cualquier tipo de pantalon',1,'activo','2026-01-16 03:26:03','2026-01-16 03:26:03'),(2,'Blusa','Cualquier tipo de blusa',2,'activo','2026-01-16 03:26:03','2026-01-16 03:26:03'),(3,'Conjunto','Prendas que se venden como una sola',3,'activo','2026-01-16 03:26:03','2026-01-16 03:26:03'),(4,'Faldas','Faldas de diversos estilos',4,'activo','2026-01-16 03:26:03','2026-01-16 03:26:03'),(5,'Shorts','Toda prenda ',5,'activo','2026-01-16 03:26:03','2026-01-16 03:26:03'),(6,'Vestidos','Todas clase de vestidos',6,'activo','2026-01-16 03:26:03','2026-01-16 03:26:03'),(7,'Bolsos','Bolsos de diversos tipos',7,'activo','2026-01-16 03:26:03','2026-01-16 03:26:03');
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
  `tipo_cliente` enum('publico','mayorista','especial') DEFAULT 'publico',
  `nombre` varchar(100) DEFAULT NULL,
  `identificacion` varchar(50) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `direccion` text,
  `limite_credito` decimal(10,2) DEFAULT NULL,
  `saldo_pendiente` decimal(10,2) DEFAULT NULL,
  `saldo_actual` decimal(10,2) DEFAULT '0.00',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'publico','juan perez','15200000','m8p9q2@menaken.com','3162562916','lote 11 manzana 6 transversal 2B, monte lago',0.00,390000.00,390000.00,'activo','2026-02-07 04:03:38','2026-02-23 00:29:08'),(2,'publico','oscar','21845454','julillain@hotmail.com','3162562916','lote 11 manzana 6 transversal 2B, monte lago',0.00,420000.00,320000.00,'activo','2026-02-07 04:44:02','2026-02-21 23:30:43'),(3,'especial','oscar','000000000','m8p9q2@menaken.com','9999999999','lote 11 manzana 6 transversal 2B, monte lago',0.00,375000.00,245000.00,'activo','2026-02-14 04:48:47','2026-02-21 23:30:07'),(4,'publico','valentina',NULL,'jahdcsjdb@gmail.com','13132131',NULL,0.00,310000.00,310000.00,'activo','2026-02-22 02:19:34','2026-02-23 00:30:22'),(5,'publico','juanito','12312414',NULL,'98794651',NULL,0.00,475000.00,475000.00,'activo','2026-02-22 02:22:47','2026-02-22 23:18:03'),(6,'publico','897946',NULL,NULL,'fghfhj',NULL,0.00,300000.00,300000.00,'activo','2026-02-22 02:23:39','2026-02-22 02:23:39');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentas_por_cobrar`
--

LOCK TABLES `cuentas_por_cobrar` WRITE;
/*!40000 ALTER TABLE `cuentas_por_cobrar` DISABLE KEYS */;
INSERT INTO `cuentas_por_cobrar` VALUES (1,1,17,150000.00,0.00,'2026-03-08','pagada','2026-02-07 04:03:39','2026-02-17 19:21:17'),(2,1,19,150000.00,0.00,'2026-03-08','pagada','2026-02-07 04:15:00','2026-02-17 19:21:17'),(3,1,20,150000.00,0.00,'2026-03-08','pagada','2026-02-07 04:18:55','2026-02-17 19:21:17'),(4,1,21,150000.00,50000.00,'2026-03-08','pendiente','2026-02-07 04:29:38','2026-02-17 19:15:07'),(5,2,23,150000.00,50000.00,'2026-03-08','pendiente','2026-02-07 04:44:02','2026-02-17 19:15:07'),(6,2,24,150000.00,130000.00,'2026-03-08','pendiente','2026-02-07 04:45:10','2026-02-07 04:45:10'),(7,3,29,135000.00,135000.00,'2026-03-15','pendiente','2026-02-14 04:48:47','2026-02-14 04:48:47'),(8,3,30,135000.00,65000.00,'2026-03-16','pendiente','2026-02-14 05:17:30','2026-02-17 19:15:07'),(9,3,31,135000.00,35000.00,'2026-03-16','pendiente','2026-02-14 05:23:02','2026-02-17 19:15:07'),(10,3,32,135000.00,0.00,'2026-03-16','pagada','2026-02-14 05:24:56','2026-02-16 16:03:46'),(11,1,34,80000.00,80000.00,'2026-03-22','pendiente','2026-02-21 03:45:25','2026-02-21 03:45:25'),(12,2,36,170000.00,170000.00,'2026-03-22','pendiente','2026-02-21 03:49:31','2026-02-21 03:49:31'),(13,1,41,85000.00,85000.00,'2026-03-23','pendiente','2026-02-21 22:51:34','2026-02-21 22:51:34'),(14,3,44,140000.00,140000.00,'2026-03-23','pendiente','2026-02-21 23:30:07','2026-02-21 23:30:07'),(15,2,45,70000.00,70000.00,'2026-03-23','pendiente','2026-02-21 23:30:43','2026-02-21 23:30:43'),(16,4,46,240000.00,240000.00,'2026-03-23','pendiente','2026-02-22 02:19:34','2026-02-22 02:19:34'),(17,5,47,85000.00,85000.00,'2026-03-23','pendiente','2026-02-22 02:22:47','2026-02-22 02:22:47'),(18,6,48,300000.00,300000.00,'2026-03-23','pendiente','2026-02-22 02:23:39','2026-02-22 02:23:39'),(19,5,49,300000.00,300000.00,'2026-03-23','pendiente','2026-02-22 02:25:39','2026-02-22 02:25:39'),(20,1,52,85000.00,85000.00,'2026-03-24','pendiente','2026-02-22 23:17:26','2026-02-22 23:17:26'),(21,5,53,90000.00,90000.00,'2026-03-24','pendiente','2026-02-22 23:18:03','2026-02-22 23:18:03'),(22,1,56,90000.00,90000.00,'2026-03-24','pendiente','2026-02-23 00:29:08','2026-02-23 00:29:08'),(23,4,57,70000.00,70000.00,'2026-03-24','pendiente','2026-02-23 00:30:22','2026-02-23 00:30:22');
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
INSERT INTO `descuento_productos` VALUES (28,2),(23,9),(30,9),(28,10),(31,10),(25,12),(31,15),(26,16),(31,16),(27,17),(27,18),(28,18),(30,18),(30,43);
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
INSERT INTO `descuento_tipos_prenda` VALUES (29,2),(29,3),(29,5),(29,8),(24,17);
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descuentos`
--

LOCK TABLES `descuentos` WRITE;
/*!40000 ALTER TABLE `descuentos` DISABLE KEYS */;
INSERT INTO `descuentos` VALUES (23,'DESCUENTO 1',NULL,'fijo',50000.00,'2026-01-25','2026-01-29','inactivo','productos','2026-01-28 04:06:22','2026-02-14 04:39:06'),(24,'DESCUENTO 2',NULL,'porcentaje',15.00,'2026-01-26','2026-01-30','inactivo','tipos_prenda','2026-01-28 04:53:58','2026-02-14 04:39:06'),(25,'DESCUENTO 3','DESCUENTO','porcentaje',10.00,'2026-02-12','2026-02-14','inactivo','productos','2026-02-14 04:46:27','2026-02-17 22:42:03'),(26,'TEMPORADA',NULL,'fijo',1.00,'2026-02-21','2026-02-21','inactivo','productos','2026-02-21 03:33:58','2026-02-22 02:37:37'),(27,'LOCURAAA',NULL,'fijo',70000.00,'2026-02-21','2026-02-23','activo','productos','2026-02-21 23:23:12','2026-02-22 02:43:11'),(28,'PRUEBITA CHECK',NULL,'fijo',50000.00,'2026-02-21','2026-02-21','inactivo','productos','2026-02-22 02:40:12','2026-02-22 23:16:47'),(29,'PRUEBITA V2',NULL,'porcentaje',20.00,'2026-02-21','2026-02-21','inactivo','tipos_prenda','2026-02-22 02:46:22','2026-02-22 03:03:28'),(30,'LOQUETE PINGUETE',NULL,'porcentaje',30.00,'2026-02-23','2026-02-27','activo','productos','2026-02-23 21:36:13','2026-02-23 21:36:13'),(31,'BLUSITASSS',NULL,'fijo',40000.00,NULL,NULL,'activo','productos','2026-02-23 22:20:23','2026-02-23 22:20:23');
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedidos`
--

LOCK TABLES `detalle_pedidos` WRITE;
/*!40000 ALTER TABLE `detalle_pedidos` DISABLE KEYS */;
INSERT INTO `detalle_pedidos` VALUES (1,2,'pedido de preubea',50,1000000.00),(2,3,'qwe212e',50,1000000.00),(3,4,'dasdasd',40,45222222.00),(4,5,'wqdqwd',18,4500000.00),(5,6,'pedido de perras ',5,1000000.00),(6,7,'articulo',1,15000000.00),(7,8,'jhhjh',12,1500000.00),(8,9,'blusas',2,200000.00),(9,9,'pantalones',2,200000.00),(10,9,'blusa',1,80000.00),(11,10,'pantalon ',2,150000.00),(12,10,'bolso',3,200000.00),(13,10,'faldas',3,250000.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ventas`
--

LOCK TABLES `detalle_ventas` WRITE;
/*!40000 ALTER TABLE `detalle_ventas` DISABLE KEYS */;
INSERT INTO `detalle_ventas` VALUES (1,3,10,1,60000.00,60000.00),(2,4,10,1,60000.00,60000.00),(3,5,10,1,60000.00,60000.00),(4,6,10,1,60000.00,60000.00),(5,6,9,1,200000.00,200000.00),(6,6,3,1,100000.00,100000.00),(7,7,10,1,60000.00,60000.00),(8,7,9,1,200000.00,200000.00),(9,7,2,1,100000.00,100000.00),(10,8,10,1,60000.00,60000.00),(11,9,3,1,100000.00,100000.00),(12,9,1,1,60000.00,60000.00),(13,10,1,1,60000.00,60000.00),(14,11,3,1,100000.00,100000.00),(15,12,10,1,60000.00,60000.00),(16,13,10,1,60000.00,60000.00),(17,14,10,1,60000.00,60000.00),(18,15,1,2,60000.00,120000.00),(19,16,11,1,150000.00,150000.00),(20,17,11,1,150000.00,150000.00),(21,18,11,1,150000.00,150000.00),(22,19,11,1,150000.00,150000.00),(23,20,11,1,150000.00,150000.00),(24,21,11,1,150000.00,150000.00),(25,22,11,1,150000.00,150000.00),(26,23,11,1,150000.00,150000.00),(27,24,11,1,150000.00,150000.00),(28,25,11,2,150000.00,300000.00),(29,26,11,1,150000.00,150000.00),(30,27,11,1,150000.00,150000.00),(31,28,11,1,145000.00,145000.00),(32,29,12,1,135000.00,135000.00),(33,30,12,1,135000.00,135000.00),(34,31,12,1,135000.00,135000.00),(35,32,12,1,135000.00,135000.00),(36,33,15,1,85000.00,85000.00),(37,34,15,1,80000.00,80000.00),(38,35,15,1,80000.00,80000.00),(39,36,15,1,85000.00,85000.00),(40,36,13,1,85000.00,85000.00),(41,37,15,1,85000.00,85000.00),(42,38,14,1,85000.00,85000.00),(43,39,14,3,80000.00,240000.00),(44,40,16,2,10000.00,20000.00),(45,41,14,1,85000.00,85000.00),(46,42,14,1,85000.00,85000.00),(47,43,18,1,70000.00,70000.00),(48,44,18,2,70000.00,140000.00),(49,45,17,1,70000.00,70000.00),(50,46,14,2,80000.00,160000.00),(51,46,13,1,80000.00,80000.00),(52,47,14,1,85000.00,85000.00),(53,48,12,2,150000.00,300000.00),(54,49,12,2,150000.00,300000.00),(55,50,17,1,70000.00,70000.00),(56,51,32,1,80000.00,80000.00),(57,52,46,1,85000.00,85000.00),(58,53,45,1,90000.00,90000.00),(59,54,41,1,90000.00,90000.00),(60,55,40,1,100000.00,100000.00),(61,56,43,1,90000.00,90000.00),(62,57,18,1,70000.00,70000.00);
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
  `categoria` enum('servicios','arriendo','transporte','compras_suministros','nomina','publicidad','mantenimiento','impuestos','servicios_profesionales','otros') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Categoría del gasto',
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Descripción breve del gasto',
  `monto` decimal(10,2) NOT NULL COMMENT 'Valor del gasto',
  `fecha_gasto` date NOT NULL COMMENT 'Fecha en que se realizó el gasto',
  `metodo_pago` enum('efectivo','transferencia','tarjeta') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'efectivo',
  `referencia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Número de factura, comprobante o referencia',
  `notas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Observaciones adicionales',
  `usuario_id` int unsigned DEFAULT NULL COMMENT 'Usuario que registró el gasto',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fecha_gasto` (`fecha_gasto`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_usuario` (`usuario_id`),
  CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gastos`
--

LOCK TABLES `gastos` WRITE;
/*!40000 ALTER TABLE `gastos` DISABLE KEYS */;
INSERT INTO `gastos` VALUES (1,'servicios','pago de la luz',10000.00,'2026-02-17','efectivo',NULL,'fue en x lugar',5,'2026-02-17 23:24:50','2026-02-17 23:24:50'),(2,'servicios','pago agua',50000.00,'2026-02-17','efectivo','no aplica','pague en otro sitio',5,'2026-02-17 23:29:24','2026-02-17 23:29:24'),(3,'servicios','pago recibo',80000.00,'2026-02-21','efectivo','no aplica',NULL,5,'2026-02-21 03:53:23','2026-02-21 03:53:23'),(4,'servicios','pago recibo',100000.00,'2026-02-21','efectivo','asadada','prueba nicolas',5,'2026-02-21 23:12:12','2026-02-21 23:12:12'),(5,'arriendo','pago recibo',500000.00,'2026-02-23','efectivo','no aplica',NULL,5,'2026-02-23 22:21:47','2026-02-23 22:21:47');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_caja`
--

LOCK TABLES `movimientos_caja` WRITE;
/*!40000 ALTER TABLE `movimientos_caja` DISABLE KEYS */;
INSERT INTO `movimientos_caja` VALUES (1,2,'venta',85000.00,33,5,'2026-02-20 02:50:54'),(2,2,'venta',80000.00,35,5,'2026-02-21 03:47:55'),(3,4,'venta',85000.00,37,5,'2026-02-21 22:47:29'),(4,4,'venta',85000.00,38,5,'2026-02-21 22:48:34'),(5,4,'venta',240000.00,39,5,'2026-02-21 22:48:58'),(6,4,'venta',20000.00,40,5,'2026-02-21 22:50:27'),(7,4,'venta',85000.00,42,5,'2026-02-21 22:54:41'),(8,4,'venta',70000.00,43,5,'2026-02-21 23:27:38'),(9,6,'venta',70000.00,50,5,'2026-02-22 02:43:47'),(10,6,'venta',80000.00,51,5,'2026-02-22 03:02:55'),(11,6,'venta',90000.00,54,5,'2026-02-22 23:24:35'),(12,6,'venta',100000.00,55,5,'2026-02-22 23:25:23');
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
  `referencia_id` int unsigned DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_inventario`
--

LOCK TABLES `movimientos_inventario` WRITE;
/*!40000 ALTER TABLE `movimientos_inventario` DISABLE KEYS */;
INSERT INTO `movimientos_inventario` VALUES (1,10,'salida_venta',-1,7,6,'Venta',NULL,6,5,'2026-02-05 01:01:43'),(2,9,'salida_venta',-1,2,1,'Venta',NULL,6,5,'2026-02-05 01:01:43'),(3,3,'salida_venta',-1,4,3,'Venta',NULL,6,5,'2026-02-05 01:01:44'),(4,10,'salida_venta',-1,6,5,'Venta',NULL,7,5,'2026-02-05 01:05:44'),(5,9,'salida_venta',-1,1,0,'Venta',NULL,7,5,'2026-02-05 01:05:44'),(6,2,'salida_venta',-1,2,1,'Venta',NULL,7,5,'2026-02-05 01:05:44'),(7,10,'salida_venta',-1,5,4,'Venta',NULL,8,5,'2026-02-05 01:09:43'),(8,3,'salida_venta',-1,3,2,'Venta',NULL,9,5,'2026-02-05 02:18:02'),(9,1,'salida_venta',-1,5,4,'Venta',NULL,9,5,'2026-02-05 02:18:02'),(10,1,'salida_venta',-1,4,3,'Venta',NULL,10,5,'2026-02-05 02:20:44'),(11,3,'salida_venta',-1,2,1,'Venta',NULL,11,5,'2026-02-06 21:30:28'),(12,10,'salida_venta',-1,4,3,'Venta',NULL,12,5,'2026-02-06 21:32:00'),(13,10,'salida_venta',-1,3,2,'Venta',NULL,13,5,'2026-02-06 21:33:00'),(14,10,'salida_venta',-1,2,1,'Venta',NULL,14,5,'2026-02-06 21:35:04'),(15,1,'salida_venta',-2,3,1,'Venta',NULL,15,5,'2026-02-06 22:14:06'),(16,11,'salida_venta',-1,15,14,'Venta',NULL,16,5,'2026-02-07 02:58:58'),(17,11,'salida_venta',-1,14,13,'Venta',NULL,17,5,'2026-02-07 04:03:39'),(18,11,'salida_venta',-1,13,12,'Venta',NULL,18,5,'2026-02-07 04:13:32'),(19,11,'salida_venta',-1,12,11,'Venta',NULL,19,5,'2026-02-07 04:15:00'),(20,11,'salida_venta',-1,11,10,'Venta',NULL,20,5,'2026-02-07 04:18:55'),(21,11,'salida_venta',-1,10,9,'Venta',NULL,21,5,'2026-02-07 04:29:38'),(22,11,'salida_venta',-1,9,8,'Venta',NULL,22,5,'2026-02-07 04:42:22'),(23,11,'salida_venta',-1,8,7,'Venta',NULL,23,5,'2026-02-07 04:44:02'),(24,11,'salida_venta',-1,7,6,'Venta',NULL,24,5,'2026-02-07 04:45:10'),(25,11,'salida_venta',-2,6,4,'Venta',NULL,25,5,'2026-02-07 05:05:48'),(26,11,'salida_venta',-1,4,3,'Venta',NULL,26,5,'2026-02-07 20:21:05'),(27,11,'salida_venta',-1,3,2,'Venta',NULL,27,5,'2026-02-07 20:30:19'),(28,11,'salida_venta',-1,2,1,'Venta',NULL,28,5,'2026-02-13 21:35:45'),(29,12,'salida_venta',-1,20,19,'Venta',NULL,29,5,'2026-02-14 04:48:47'),(30,12,'salida_venta',-1,19,18,'Venta',NULL,30,5,'2026-02-14 05:17:30'),(31,12,'salida_venta',-1,18,17,'Venta',NULL,31,5,'2026-02-14 05:23:02'),(32,12,'salida_venta',-1,17,16,'Venta',NULL,32,5,'2026-02-14 05:24:56'),(33,15,'salida_venta',-1,5,4,'Venta',NULL,33,5,'2026-02-20 02:50:54'),(34,15,'salida_venta',-1,4,3,'Venta',NULL,34,5,'2026-02-21 03:45:25'),(35,15,'salida_venta',-1,3,2,'Venta',NULL,35,5,'2026-02-21 03:47:55'),(36,15,'salida_venta',-1,2,1,'Venta',NULL,36,5,'2026-02-21 03:49:31'),(37,13,'salida_venta',-1,3,2,'Venta',NULL,36,5,'2026-02-21 03:49:31'),(38,15,'salida_venta',-1,1,0,'Venta',NULL,37,5,'2026-02-21 22:47:29'),(39,14,'salida_venta',-1,10,9,'Venta',NULL,38,5,'2026-02-21 22:48:34'),(40,14,'salida_venta',-3,9,6,'Venta',NULL,39,5,'2026-02-21 22:48:58'),(41,16,'salida_venta',-2,2,0,'Venta',NULL,40,5,'2026-02-21 22:50:27'),(42,14,'salida_venta',-1,6,5,'Venta',NULL,41,5,'2026-02-21 22:51:34'),(43,14,'salida_venta',-1,5,4,'Venta',NULL,42,5,'2026-02-21 22:54:41'),(44,18,'salida_venta',-1,3,2,'Venta',NULL,43,5,'2026-02-21 23:27:38'),(45,18,'salida_venta',-2,2,0,'Venta',NULL,44,5,'2026-02-21 23:30:07'),(46,17,'salida_venta',-1,2,1,'Venta',NULL,45,5,'2026-02-21 23:30:43'),(47,14,'salida_venta',-2,4,2,'Venta',NULL,46,5,'2026-02-22 02:19:34'),(48,13,'salida_venta',-1,2,1,'Venta',NULL,46,5,'2026-02-22 02:19:34'),(49,14,'salida_venta',-1,2,1,'Venta',NULL,47,5,'2026-02-22 02:22:47'),(50,12,'salida_venta',-2,16,14,'Venta',NULL,48,5,'2026-02-22 02:23:39'),(51,12,'salida_venta',-2,14,12,'Venta',NULL,49,5,'2026-02-22 02:25:39'),(52,17,'salida_venta',-1,1,0,'Venta',NULL,50,5,'2026-02-22 02:43:47'),(53,32,'salida_venta',-1,1,0,'Venta',NULL,51,5,'2026-02-22 03:02:55'),(54,46,'salida_venta',-1,1,0,'Venta',NULL,52,5,'2026-02-22 23:17:26'),(55,45,'salida_venta',-1,2,1,'Venta',NULL,53,5,'2026-02-22 23:18:03'),(56,41,'salida_venta',-1,2,1,'Venta',NULL,54,5,'2026-02-22 23:24:35'),(57,40,'salida_venta',-1,2,1,'Venta',NULL,55,5,'2026-02-22 23:25:23'),(58,43,'salida_venta',-1,1,0,'Venta',NULL,56,5,'2026-02-23 00:29:08'),(59,18,'salida_venta',-1,2,1,'Venta',NULL,57,5,'2026-02-23 00:30:22');
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
  `monto_efectivo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `monto_transferencia` decimal(10,2) NOT NULL DEFAULT '0.00',
  `monto_tarjeta` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `referencia_transferencia` varchar(50) DEFAULT NULL COMMENT 'Origen de la transferencia para el monto de transferencia en pagos mixtos',
  PRIMARY KEY (`id`),
  KEY `idx_pagos_mixtos_abonos_abono` (`abono_id`),
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
  `monto_efectivo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `monto_transferencia` decimal(10,2) NOT NULL DEFAULT '0.00',
  `monto_tarjeta` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `referencia_transferencia` varchar(50) DEFAULT NULL COMMENT 'Origen de la transferencia para el monto de transferencia en pagos mixtos',
  PRIMARY KEY (`id`),
  KEY `venta_id` (`venta_id`),
  CONSTRAINT `pagos_mixtos_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_mixtos_ventas`
--

LOCK TABLES `pagos_mixtos_ventas` WRITE;
/*!40000 ALTER TABLE `pagos_mixtos_ventas` DISABLE KEYS */;
INSERT INTO `pagos_mixtos_ventas` VALUES (1,22,20000.00,140000.00,0.00,'2026-02-07 04:42:22','Nequi');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (2,'PED-001',2,'2026-01-15',1000000.00,1000000.00,0.00,'recibido','2026-01-15 04:59:04',NULL,'pedido pendeinte','2026-01-15 04:42:07','2026-01-29 04:17:40'),(3,'PED-002',2,'2026-01-15',1000000.00,1000000.00,0.00,'recibido','2026-01-15 05:00:00',NULL,'fdsfdasf','2026-01-15 04:59:50','2026-01-29 04:17:40'),(4,'PED-003',2,'2026-01-15',45222222.00,45222222.00,0.00,'recibido','2026-01-15 05:02:07',NULL,'dsasdasds','2026-01-15 05:02:03','2026-02-02 22:27:14'),(5,'PED-004',3,'2026-01-15',4500000.00,4500000.00,0.00,'recibido','2026-01-15 05:07:07',NULL,'dqwqwqwd','2026-01-15 05:07:01','2026-02-23 00:37:12'),(6,'PED-005',2,'2026-02-02',1000000.00,1000000.00,0.00,'recibido','2026-02-02 21:57:23',NULL,'hgfhfggf','2026-02-02 21:55:48','2026-02-02 22:27:14'),(7,'PED-006',2,'2026-02-02',15000000.00,2777778.00,12222222.00,'recibido','2026-02-02 22:27:41',NULL,'este','2026-02-02 22:26:20','2026-02-02 22:27:41'),(8,'PED-007',2,'2026-02-07',1500000.00,0.00,1500000.00,'recibido','2026-02-07 04:53:08',NULL,'hjh','2026-02-07 04:52:55','2026-02-07 04:53:08'),(9,'PED-008',3,'2026-02-21',480000.00,480000.00,0.00,'recibido','2026-02-21 03:37:27',NULL,NULL,'2026-02-21 03:37:10','2026-02-23 00:37:12'),(10,'PED-009',4,'2026-02-22',600000.00,600000.00,0.00,'recibido','2026-02-22 02:11:06',NULL,NULL,'2026-02-22 02:10:48','2026-02-23 00:37:49');
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
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'2040000000011','FAL-FC-XL-0001','prueba','1234',4,27,5,2,'azul',50000.00,60000.00,55000.00,1,'activo','2026-01-18 05:31:04','2026-02-06 22:14:06'),(2,'2020000000013','BLU-BC-M-0001','blusa manga larga azul','blusa',2,17,3,2,'azul',80000.00,100000.00,95000.00,1,'activo','2026-01-18 05:32:00','2026-02-05 01:05:44'),(3,'2010000000014','PAN-PJ-28-0001','jean claro','pantalon',1,11,20,2,'azul claro',50000.00,100000.00,95000.00,1,'activo','2026-01-18 05:32:52','2026-02-06 21:30:28'),(9,'2040000000012','PAN-PJ-34-0001','jean oscuro','pantalon',1,11,23,2,'azul oscuro',100000.00,200000.00,150000.00,0,'activo','2026-01-18 05:43:23','2026-02-05 01:05:44'),(10,'2040000000013','BLU-BC-XXL-0002','blusa satanica',NULL,2,17,5,2,NULL,30000.00,60000.00,50000.00,1,'activo','2026-01-20 02:07:38','2026-02-13 03:01:54'),(11,'2040000000014','SHO-SC-14-0001','SHORT',NULL,5,40,14,2,'azul',100000.00,150000.00,145000.00,1,'activo','2026-02-07 02:25:31','2026-02-13 21:38:17'),(12,'2040000000015','CON-CB+-U-0001','CONJUNTO','conjunto lindo',3,80,34,2,'azul',100000.00,150000.00,145000.00,12,'activo','2026-02-14 04:39:06','2026-02-22 02:25:39'),(13,'2040000000016','BLU-BCT-S-0001','BLUSAS AZUL',NULL,2,18,2,3,'azul',50000.00,85000.00,80000.00,1,'activo','2026-02-20 00:51:51','2026-02-22 02:19:34'),(14,'2040000000017','BLU-BCT-M-0001','BLUSA','bklusa',2,18,3,2,'azul',50000.00,85000.00,80000.00,1,'activo','2026-02-20 02:26:34','2026-02-22 02:22:47'),(15,'100001','BLU-BCB-S-0001','BLUSAS AZUL','skjfdkf',2,20,2,2,'azul',50000.00,85000.00,80000.00,0,'activo','2026-02-20 02:29:55','2026-02-21 22:47:29'),(16,'100002','BLU-BC-XS-0001','BLUSA NEGRA',NULL,2,17,1,3,NULL,50000.00,85000.00,80000.00,0,'activo','2026-02-21 03:30:55','2026-02-21 22:50:27'),(17,'100003','PAN-PC-12-0001','PANTALON NEGRO',NULL,1,5,13,4,'negro',50000.00,90000.00,85000.00,0,'activo','2026-02-21 23:17:48','2026-02-22 02:43:47'),(18,'100004','PAN-PC-10-0001','PANTALON NEGRO',NULL,1,5,12,4,'negro',50000.00,90000.00,85000.00,1,'activo','2026-02-21 23:19:13','2026-02-23 00:30:22'),(19,'100005','BLU-BCB-XS-0001','1231',NULL,2,20,1,4,'123123',50000.00,90000.00,85000.00,2,'activo','2026-02-22 02:27:07','2026-02-22 02:27:07'),(20,'100006','PAN-PC-10-0002','PANTALONES PRUEBA ',NULL,1,5,12,4,'negro',50000.00,90000.00,85000.00,3,'activo','2026-02-22 02:48:12','2026-02-22 02:48:12'),(30,'100007','PAN-PC-6-0001','PANTALON PRUEBADOS',NULL,1,3,10,4,'rojo',70000.00,100000.00,95000.00,3,'activo','2026-02-22 02:52:11','2026-02-22 02:52:11'),(32,'100008','PAN-PC-6-0002','PANTALON PRUEBA 2.1 ',NULL,1,3,10,4,'rojo',70000.00,100000.00,95000.00,0,'activo','2026-02-22 02:54:16','2026-02-22 03:02:55'),(40,'100009','PAN-PC-10-0003','PANTALON PRUEBA 2.12',NULL,1,5,12,3,'rojo',70000.00,100000.00,95000.00,1,'activo','2026-02-22 02:57:54','2026-02-22 23:25:23'),(41,'100010','PAN-PC-10-0004','PANTALON PRUEBA 2.13',NULL,1,5,12,3,'rojo',65000.00,90000.00,85000.00,1,'activo','2026-02-22 02:59:10','2026-02-22 23:24:35'),(43,'100011','PAN-PC-8-0001','PANTALON PRUEBA 2.14',NULL,1,3,11,4,'rojo',65000.00,90000.00,85000.00,0,'activo','2026-02-22 03:00:02','2026-02-23 00:29:08'),(45,'100012','PAN-PC-10-0005','OSCAR',NULL,1,3,12,4,'rojo',50000.00,90000.00,85000.00,1,'activo','2026-02-22 03:11:47','2026-02-22 23:18:03'),(46,'100013','PAN-PC-10-0006','OTRA PRUEBA PANTALON ',NULL,1,3,12,4,'azul',65000.00,85000.00,80000.00,0,'activo','2026-02-22 03:12:23','2026-02-22 23:17:26'),(47,'100014','PAN-PC-10-0007','PANTALON BOTA CAMPANA',NULL,1,3,12,4,NULL,65000.00,105000.00,100000.00,2,'activo','2026-02-23 21:20:57','2026-02-23 21:20:57'),(48,'100015','PAN-PC-10-0008','PANTALON BOTA CAM',NULL,1,3,12,4,'azul',70000.00,120000.00,115000.00,3,'activo','2026-02-23 22:03:03','2026-02-23 22:03:03'),(49,'100016','PAN-PL-6-0001','OTRO HP PANTALON',NULL,1,12,10,4,'negro',50000.00,85000.00,80000.00,2,'activo','2026-02-23 22:17:20','2026-02-23 22:18:28'),(50,'100017','BLU-BCT-U-0001','BLUSITAS CHECK',NULL,2,18,35,2,'azul',45000.00,90000.00,85000.00,2,'activo','2026-02-23 22:19:07','2026-02-23 22:19:07');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (2,'PROV-001','1232424','ropa','este','3162562916','3162562916','oscarjulianllainp@gmail.com','dqwee','Ocaña','norte de santander','elber','2312425423','activo','2026-01-15 03:48:30','2026-02-02 21:54:55'),(3,'PROV-002','123242rewre','sada','weqweewq','123131132','1321231','m8p9q2@menaken.com','FGFDFGD','Ocaña','DFGDF','elber','2312425423','activo','2026-01-15 03:48:56','2026-02-23 00:13:25'),(4,'PROV-003','juanchooo','ropita mi papacho','ropitas juancho\'s','3162562916','546548','jahdcsjdb@gmail.com',NULL,NULL,NULL,NULL,NULL,'activo','2026-02-21 23:16:02','2026-02-21 23:16:56');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones_caja`
--

LOCK TABLES `sesiones_caja` WRITE;
/*!40000 ALTER TABLE `sesiones_caja` DISABLE KEYS */;
INSERT INTO `sesiones_caja` VALUES (1,1,5,'2026-02-18 04:53:32','2026-02-19 03:59:56','cerrada',50000.00,NULL,NULL,NULL),(2,1,5,'2026-02-20 02:49:36','2026-02-21 03:50:02','cerrada',500000.00,NULL,NULL,NULL),(3,1,5,'2026-02-21 03:53:53','2026-02-21 03:57:17','cerrada',500000.00,NULL,NULL,NULL),(4,1,5,'2026-02-21 22:45:39','2026-02-22 02:15:04','cerrada',500000.00,NULL,400000.00,NULL),(5,1,5,'2026-02-22 02:17:27','2026-02-22 02:17:35','cerrada',500000.00,NULL,NULL,NULL),(6,1,5,'2026-02-22 02:18:27',NULL,'abierta',500000.00,NULL,NULL,NULL);
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
INSERT INTO `sistemas_tallas` VALUES (1,'Tallas Estándar Mujer (Letras)','Sistema de tallas XS, S, M, L, XL, XXL, XXXL para mujer','letras','2026-01-16 03:27:19','2026-01-16 03:27:19'),(2,'Tallas Numéricas Mujer','Tallas numéricas de mujer 2, 4, 6, 8, 10, 12, 14, 16, 18, 20','numeros','2026-01-16 03:27:19','2026-01-16 03:27:19'),(3,'Tallas Jeans Mujer','Tallas de jeans para mujer 24, 26, 28, 30, 32, 34, 36, 38','numeros','2026-01-16 03:27:19','2026-01-16 03:27:19'),(4,'Tallas Calzado Mujer','Tallas de calzado de mujer 34 a 41','numeros','2026-01-16 03:27:19','2026-01-16 03:27:19'),(5,'Talla Única','Talla única para accesorios y bolsos','letras','2026-01-16 03:27:19','2026-01-16 03:27:19');
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
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tallas`
--

LOCK TABLES `tallas` WRITE;
/*!40000 ALTER TABLE `tallas` DISABLE KEYS */;
INSERT INTO `tallas` VALUES (1,1,'XS','Extra Small - Talla Extra Pequeña',1,'activo','2026-01-16 03:27:28','2026-01-16 03:27:28'),(2,1,'S','Small - Talla Pequeña',2,'activo','2026-01-16 03:27:28','2026-01-16 03:27:28'),(3,1,'M','Medium - Talla Mediana',3,'activo','2026-01-16 03:27:28','2026-01-16 03:27:28'),(4,1,'L','Large - Talla Grande',4,'activo','2026-01-16 03:27:28','2026-01-16 03:27:28'),(5,1,'XL','Extra Large - Talla Extra Grande',5,'activo','2026-01-16 03:27:28','2026-01-16 03:27:28'),(9,2,'4','Talla 4 - Pequeña',2,'activo','2026-01-16 03:27:34','2026-01-16 03:27:34'),(10,2,'6','Talla 6 - Pequeña-Mediana',3,'activo','2026-01-16 03:27:34','2026-01-16 03:27:34'),(11,2,'8','Talla 8 - Mediana',4,'activo','2026-01-16 03:27:34','2026-01-16 03:27:34'),(12,2,'10','Talla 10 - Mediana',5,'activo','2026-01-16 03:27:34','2026-01-16 03:27:34'),(13,2,'12','Talla 12 - Mediana-Grande',6,'activo','2026-01-16 03:27:34','2026-01-16 03:27:34'),(14,2,'14','Talla 14 - Grande',7,'activo','2026-01-16 03:27:34','2026-01-16 03:27:34'),(15,2,'16','Talla 16 - Grande',8,'activo','2026-01-16 03:27:34','2026-01-16 03:27:34'),(18,3,'24','Talla 24 - Cintura 61cm',1,'activo','2026-01-16 03:27:42','2026-01-16 03:27:42'),(19,3,'26','Talla 26 - Cintura 66cm',2,'activo','2026-01-16 03:27:42','2026-01-16 03:27:42'),(20,3,'28','Talla 28 - Cintura 71cm',3,'activo','2026-01-16 03:27:42','2026-01-16 03:27:42'),(21,3,'30','Talla 30 - Cintura 76cm',4,'activo','2026-01-16 03:27:42','2026-01-16 03:27:42'),(22,3,'32','Talla 32 - Cintura 81cm',5,'activo','2026-01-16 03:27:42','2026-01-16 03:27:42'),(23,3,'34','Talla 34 - Cintura 86cm',6,'activo','2026-01-16 03:27:42','2026-01-16 03:27:42'),(26,4,'34','Talla 34 - 22cm',1,'activo','2026-01-16 03:27:48','2026-01-16 03:27:48'),(27,4,'35','Talla 35 - 22.5cm',2,'activo','2026-01-16 03:27:48','2026-01-16 03:27:48'),(28,4,'36','Talla 36 - 23cm',3,'activo','2026-01-16 03:27:48','2026-01-16 03:27:48'),(29,4,'37','Talla 37 - 23.5cm',4,'activo','2026-01-16 03:27:48','2026-01-16 03:27:48'),(30,4,'38','Talla 38 - 24cm',5,'activo','2026-01-16 03:27:48','2026-01-16 03:27:48'),(31,4,'39','Talla 39 - 24.5cm',6,'activo','2026-01-16 03:27:48','2026-01-16 03:27:48'),(32,4,'40','Talla 40 - 25cm',7,'activo','2026-01-16 03:27:48','2026-01-16 03:27:48'),(33,4,'41','Talla 41 - 25.5cm',8,'activo','2026-01-16 03:27:48','2026-01-16 03:27:48'),(34,5,'U','Talla única',1,'activo','2026-01-16 03:27:56','2026-02-13 03:58:32'),(35,1,'U','Única - Talla Única',6,'activo','2026-02-13 03:04:58','2026-02-13 03:04:58'),(36,2,'U','Única - Talla Única',8,'activo','2026-02-13 03:05:17','2026-02-13 03:05:17'),(37,3,'U','Única - Talla Única',7,'activo','2026-02-13 03:07:04','2026-02-13 03:07:04'),(38,4,'U','Única - Talla Única',9,'activo','2026-02-13 03:07:22','2026-02-13 03:07:22');
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
INSERT INTO `tipo_prenda_sistema_talla` VALUES (4,1),(6,1),(7,1),(13,1),(14,1),(15,1),(16,1),(17,1),(18,1),(19,1),(20,1),(21,1),(22,1),(23,1),(24,1),(25,1),(26,1),(27,1),(28,1),(29,1),(30,1),(32,1),(33,1),(35,1),(38,1),(39,1),(44,1),(45,1),(46,1),(48,1),(49,1),(50,1),(52,1),(54,1),(55,1),(1,2),(2,2),(3,2),(5,2),(8,2),(9,2),(10,2),(12,2),(27,2),(28,2),(29,2),(31,2),(36,2),(40,2),(41,2),(42,2),(43,2),(45,2),(46,2),(47,2),(48,2),(49,2),(51,2),(53,2),(11,3),(34,3),(37,3),(27,5),(28,5),(29,5),(30,5),(31,5),(32,5),(33,5),(34,5),(56,5),(57,5),(58,5),(59,5),(60,5),(61,5),(62,5),(63,5),(64,5),(65,5),(74,5),(75,5),(76,5),(77,5),(78,5),(79,5),(80,5),(81,5);
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
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_prenda`
--

LOCK TABLES `tipos_prenda` WRITE;
/*!40000 ALTER TABLE `tipos_prenda` DISABLE KEYS */;
INSERT INTO `tipos_prenda` VALUES (1,1,'Pantalón de Vestir','Pantalón formal para ocasiones especiales',1,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(2,1,'Pantalón Casual','Pantalón de uso diario',2,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(3,1,'Pantalón Cargo','Pantalón con bolsillos laterales',3,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(4,1,'Pantalón Palazzo','Pantalón amplio de pierna ancha',4,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(5,1,'Pantalón Capri','Pantalón tres cuartos',5,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(6,1,'Leggings','Pantalón ajustado elástico',6,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(7,1,'Joggers','Pantalón deportivo con puño',7,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(8,1,'Pantalón Acampanado','Pantalón con bota ancha',8,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(9,1,'Pantalón Recto','Pantalón de corte recto clásico',9,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(10,1,'Pantalón Pitillo','Pantalón ajustado tipo skinny',10,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(11,1,'Pantalón Jean','Pantalón de mezclilla/denim',11,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(12,1,'Pantalón Lino','Pantalón fresco de lino',12,'activo','2026-01-16 03:26:16','2026-01-16 03:26:16'),(13,2,'Blusa Manga Larga','Blusa con manga completa',1,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(14,2,'Blusa Manga Corta','Blusa con manga corta',2,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(15,2,'Blusa Sin Mangas','Blusa tipo chaleco',3,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(16,2,'Blusa de Encaje','Blusa con detalles de encaje',4,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(17,2,'Blusa Campesina','Blusa con hombros descubiertos',5,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(18,2,'Blusa Crop Top','Blusa corta que deja el abdomen al descubierto',6,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(19,2,'Blusa Oversize','Blusa holgada de talla grande',7,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(20,2,'Blusa con Botones','Blusa tipo camisa con botonadura',8,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(21,2,'Blusa Cuello V','Blusa con escote en V',9,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(22,2,'Blusa Cuello Redondo','Blusa con cuello circular',10,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(23,2,'Blusa Estampada','Blusa con diseños o patrones',11,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(24,2,'Blusa Lisa','Blusa de color sólido sin estampados',12,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(25,2,'Blusa Satinada','Blusa de tela satinada brillante',13,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(26,2,'Blusa Transparente','Blusa de tela semi-transparente',14,'activo','2026-01-16 03:26:24','2026-01-16 03:26:24'),(27,4,'Falda Corta','Falda mini por encima de la rodilla',1,'activo','2026-01-16 03:26:44','2026-01-16 03:26:44'),(28,4,'Falda Midi','Falda a media pierna',2,'activo','2026-01-16 03:26:44','2026-01-16 03:26:44'),(29,4,'Falda Larga','Falda maxi hasta los tobillos',3,'activo','2026-01-16 03:26:44','2026-01-16 03:26:44'),(30,4,'Falda Plisada','Falda con pliegues',4,'activo','2026-01-16 03:26:44','2026-01-16 03:26:44'),(31,4,'Falda Tubo','Falda ajustada tipo lápiz',5,'activo','2026-01-16 03:26:44','2026-01-16 03:26:44'),(32,4,'Falda Acampanada','Falda con vuelo en A',6,'activo','2026-01-16 03:26:44','2026-01-16 03:26:44'),(33,4,'Falda con Vuelo','Falda circular amplia',7,'activo','2026-01-16 03:26:44','2026-01-16 03:26:44'),(34,4,'Falda Jean','Falda de mezclilla',8,'activo','2026-01-16 03:26:44','2026-01-16 03:26:44'),(35,4,'Falda Asimétrica','Falda con largo irregular',9,'activo','2026-01-16 03:26:44','2026-01-16 03:26:44'),(36,4,'Falda Recta','Falda de corte recto',10,'activo','2026-01-16 03:26:44','2026-01-16 03:26:44'),(37,5,'Short Jean','Short de mezclilla',1,'activo','2026-01-16 03:26:52','2026-01-16 03:26:52'),(38,5,'Short de Tela','Short de tela suave',2,'activo','2026-01-16 03:26:52','2026-01-16 03:26:52'),(39,5,'Short Deportivo','Short para actividades deportivas',3,'activo','2026-01-16 03:26:52','2026-01-16 03:26:52'),(40,5,'Short Cargo','Short con bolsillos laterales',4,'activo','2026-01-16 03:26:52','2026-01-16 03:26:52'),(41,5,'Short Bermuda','Short largo tipo bermuda',5,'activo','2026-01-16 03:26:52','2026-01-16 03:26:52'),(42,5,'Short Tiro Alto','Short con cintura alta',6,'activo','2026-01-16 03:26:52','2026-01-16 03:26:52'),(43,5,'Short Tiro Medio','Short con cintura media',7,'activo','2026-01-16 03:26:52','2026-01-16 03:26:52'),(44,5,'Short Ciclista','Short ajustado tipo biker',8,'activo','2026-01-16 03:26:52','2026-01-16 03:26:52'),(45,6,'Vestido Casual','Vestido de uso diario',1,'activo','2026-01-16 03:27:01','2026-01-16 03:27:01'),(46,6,'Vestido de Fiesta','Vestido elegante para eventos',2,'activo','2026-01-16 03:27:01','2026-01-16 03:27:01'),(47,6,'Vestido Formal','Vestido de gala o ceremonia',3,'activo','2026-01-16 03:27:01','2026-01-16 03:27:01'),(48,6,'Vestido Midi','Vestido a media pierna',4,'activo','2026-01-16 03:27:01','2026-01-16 03:27:01'),(49,6,'Vestido Maxi','Vestido largo hasta los tobillos',5,'activo','2026-01-16 03:27:01','2026-01-16 03:27:01'),(50,6,'Vestido Corto','Vestido mini por encima de la rodilla',6,'activo','2026-01-16 03:27:01','2026-01-16 03:27:01'),(51,6,'Vestido Cóctel','Vestido semi-formal',7,'activo','2026-01-16 03:27:01','2026-01-16 03:27:01'),(52,6,'Vestido Camisero','Vestido tipo camisa con botones',8,'activo','2026-01-16 03:27:01','2026-01-16 03:27:01'),(53,6,'Vestido Tubo','Vestido ajustado tipo bodycon',9,'activo','2026-01-16 03:27:01','2026-01-16 03:27:01'),(54,6,'Vestido Playero','Vestido ligero para playa',10,'activo','2026-01-16 03:27:01','2026-01-16 03:27:01'),(55,6,'Vestido Acampanado','Vestido con falda con vuelo',11,'activo','2026-01-16 03:27:01','2026-01-16 03:27:01'),(56,7,'Bolso de Mano','Bolso pequeño con asa corta',1,'activo','2026-01-16 03:27:09','2026-01-16 03:27:09'),(57,7,'Bolso Bandolera','Bolso con correa cruzada',2,'activo','2026-01-16 03:27:09','2026-01-16 03:27:09'),(58,7,'Bolso Tote','Bolso grande tipo shopping',3,'activo','2026-01-16 03:27:09','2026-01-16 03:27:09'),(59,7,'Mochila','Bolso para la espalda',4,'activo','2026-01-16 03:27:09','2026-01-16 03:27:09'),(60,7,'Clutch','Bolso de mano pequeño sin asas',5,'activo','2026-01-16 03:27:09','2026-01-16 03:27:09'),(61,7,'Bolso Shopper','Bolso amplio para compras',6,'activo','2026-01-16 03:27:09','2026-01-16 03:27:09'),(62,7,'Cartera','Billetera o monedero',7,'activo','2026-01-16 03:27:09','2026-01-16 03:27:09'),(63,7,'Riñonera','Bolso para la cintura',8,'activo','2026-01-16 03:27:09','2026-01-16 03:27:09'),(64,7,'Bolso Satchel','Bolso estructurado con solapa',9,'activo','2026-01-16 03:27:09','2026-01-16 03:27:09'),(65,7,'Bolso Bucket','Bolso tipo cubo con cordón',10,'activo','2026-01-16 03:27:09','2026-01-16 03:27:09'),(74,3,'Conjunto Deportivo','Conjunto para actividades deportivas',1,'activo','2026-02-13 03:41:00','2026-02-13 03:41:00'),(75,3,'Conjunto Casual','Conjunto de uso diario',2,'activo','2026-02-13 03:41:00','2026-02-13 03:41:00'),(76,3,'Conjunto de Vestir','Conjunto formal elegante',3,'activo','2026-02-13 03:41:00','2026-02-13 03:41:00'),(77,3,'Conjunto Crop Top + Falda','Conjunto de dos piezas con crop top',4,'activo','2026-02-13 03:41:00','2026-02-13 03:41:00'),(78,3,'Conjunto Blusa + Pantalón','Conjunto coordinado de blusa y pantalón',5,'activo','2026-02-13 03:41:00','2026-02-13 03:41:00'),(79,3,'Conjunto Top + Short','Conjunto de top y short',6,'activo','2026-02-13 03:41:00','2026-02-13 03:41:00'),(80,3,'Conjunto Blazer + Pantalón','Conjunto ejecutivo',7,'activo','2026-02-13 03:41:00','2026-02-13 03:41:00'),(81,3,'Conjunto Playero','Conjunto para playa o piscina',8,'activo','2026-02-13 03:41:00','2026-02-13 03:41:00');
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
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol` enum('administrador','vendedor') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'vendedor',
  `estado` enum('activo','inactivo','suspendido') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'activo',
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_estado` (`estado`),
  KEY `idx_email` (`email`),
  KEY `idx_rol` (`rol`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (5,'admin','admin@valvaboutique.com','$2b$10$2ZbnpJrWKETQKuDo8tMMmOvy.ZZKweRP./LpfdShC8bHbSuGUGZBq','Administrador','Sistema','0999999999','administrador','activo','2026-02-21 22:45:28','2026-01-08 06:57:01','2026-02-21 22:45:28'),(6,'vendedor','oscarju@gmail.com','$2b$10$LlVgvnWKdKzbipkIYey/9.V583o2OlaO9vzptGb/6jPE44aIqIqWa','oscar','llain','3125464878','vendedor','activo','2026-02-18 00:30:44','2026-01-09 05:02:09','2026-02-18 00:30:44'),(7,'vendedor 3','rea1234@gm.com','$2b$10$hmDShqqJHEyFt0jkTJQk0..MZoAvIwhF5EeUB22rrek7h5XvgEvem','ernesto','rosales','15541235423','vendedor','inactivo',NULL,'2026-01-10 01:28:25','2026-01-20 01:45:45'),(8,'vendedor1','vendedor1@valvaboutique.com','$2b$10$i.3WRtvC2DM.EwEu9VKtEOyINQflcEfwK4m9fpQNjZhIMAb0KZfRO','Vendedor','Uno','0987654321','vendedor','activo',NULL,'2026-02-03 21:41:14','2026-02-03 21:41:14'),(9,'vendedor2','esta@gd.com','$2b$10$HC9WeluA1RVNDISK/7gePuyd5AO5w/Ea7yP68fL4l8vLSWPXujoGu','pepe','esta','021321312123','vendedor','activo','2026-02-21 03:54:34','2026-02-03 21:46:09','2026-02-21 03:54:34');
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
  `subtotal` decimal(10,2) DEFAULT NULL,
  `iva` decimal(10,2) DEFAULT NULL,
  `descuento` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `efectivo_recibido` decimal(10,2) DEFAULT NULL,
  `cambio` decimal(10,2) DEFAULT NULL,
  `estado` enum('completada','credito','anulada') DEFAULT 'completada',
  `tipo_venta` enum('contado','credito') DEFAULT 'contado',
  `metodo_pago` enum('efectivo','transferencia','mixto') DEFAULT 'efectivo',
  `descuento_id` int unsigned DEFAULT NULL,
  `usuario_id` int unsigned DEFAULT NULL,
  `caja_id` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `referencia_transferencia` varchar(50) DEFAULT NULL COMMENT 'Origen de la transferencia: Nequi, Bancolombia, Daviplata, Otro',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_numero_venta` (`numero_venta`),
  KEY `cliente_id` (`cliente_id`),
  KEY `descuento_id` (`descuento_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `caja_id` (`caja_id`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`descuento_id`) REFERENCES `descuentos` (`id`),
  CONSTRAINT `ventas_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `ventas_ibfk_4` FOREIGN KEY (`caja_id`) REFERENCES `cajas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (1,'VEN-20260204-0001',NULL,'2026-02-05 00:16:27',260000.00,0.00,0.00,260000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-05 00:16:27','2026-02-05 00:16:27',NULL),(2,'VEN-20260204-0002',NULL,'2026-02-05 00:57:12',260000.00,0.00,0.00,260000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-05 00:57:12','2026-02-05 00:57:12',NULL),(3,'VEN-20260204-0003',NULL,'2026-02-05 00:57:42',260000.00,0.00,0.00,260000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-05 00:57:42','2026-02-05 00:57:42',NULL),(4,'VEN-20260204-0004',NULL,'2026-02-05 00:57:53',260000.00,0.00,0.00,260000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-05 00:57:53','2026-02-05 00:57:53',NULL),(5,'VEN-20260204-0005',NULL,'2026-02-05 00:59:47',260000.00,0.00,0.00,260000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-05 00:59:47','2026-02-05 00:59:47',NULL),(6,'VEN-20260204-0006',NULL,'2026-02-05 01:01:43',360000.00,0.00,0.00,360000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-05 01:01:43','2026-02-05 01:01:43',NULL),(7,'VEN-20260204-0007',NULL,'2026-02-05 01:05:44',360000.00,0.00,0.00,360000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-05 01:05:44','2026-02-05 01:05:44',NULL),(8,'VEN-20260204-0008',NULL,'2026-02-05 01:09:43',60000.00,0.00,0.00,60000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-05 01:09:43','2026-02-05 01:09:43',NULL),(9,'VEN-20260204-0009',NULL,'2026-02-05 02:18:01',160000.00,0.00,0.00,160000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-05 02:18:01','2026-02-05 02:18:01',NULL),(10,'VEN-20260204-0010',NULL,'2026-02-05 02:20:44',60000.00,0.00,0.00,60000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-05 02:20:44','2026-02-05 02:20:44',NULL),(11,'VEN-20260206-0001',NULL,'2026-02-06 21:30:28',100000.00,0.00,0.00,100000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-06 21:30:28','2026-02-06 21:30:28',NULL),(12,'VEN-20260206-0002',NULL,'2026-02-06 21:32:00',60000.00,0.00,0.00,60000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-06 21:32:00','2026-02-06 21:32:00',NULL),(13,'VEN-20260206-0003',NULL,'2026-02-06 21:33:00',60000.00,0.00,0.00,60000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-06 21:33:00','2026-02-06 21:33:00',NULL),(14,'VEN-20260206-0004',NULL,'2026-02-06 21:35:04',60000.00,0.00,0.00,60000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-06 21:35:04','2026-02-06 21:35:04',NULL),(15,'VEN-20260206-0005',NULL,'2026-02-06 22:14:06',120000.00,0.00,0.00,120000.00,NULL,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-06 22:14:06','2026-02-06 22:14:06',NULL),(16,'VEN-20260206-0006',NULL,'2026-02-07 02:58:57',150000.00,0.00,0.00,150000.00,200000.00,50000.00,'completada','contado','efectivo',NULL,5,1,'2026-02-07 02:58:57','2026-02-07 02:58:57',NULL),(17,'VEN-20260206-0007',1,'2026-02-07 04:03:39',150000.00,0.00,0.00,150000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-07 04:03:39','2026-02-07 04:03:39',NULL),(18,'VEN-20260206-0008',NULL,'2026-02-07 04:13:32',150000.00,0.00,0.00,150000.00,200000.00,50000.00,'completada','contado','efectivo',NULL,5,1,'2026-02-07 04:13:32','2026-02-07 04:13:32',NULL),(19,'VEN-20260206-0009',1,'2026-02-07 04:15:00',150000.00,0.00,0.00,150000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-07 04:15:00','2026-02-07 04:15:00',NULL),(20,'VEN-20260206-0010',1,'2026-02-07 04:18:55',150000.00,0.00,0.00,150000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-07 04:18:55','2026-02-07 04:18:55',NULL),(21,'VEN-20260206-0011',1,'2026-02-07 04:29:38',150000.00,0.00,0.00,150000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-07 04:29:38','2026-02-07 04:29:38',NULL),(22,'VEN-20260206-0012',NULL,'2026-02-07 04:42:22',150000.00,0.00,0.00,150000.00,20000.00,10000.00,'completada','contado','mixto',NULL,5,1,'2026-02-07 04:42:22','2026-02-07 04:42:22','Nequi'),(23,'VEN-20260206-0013',2,'2026-02-07 04:44:02',150000.00,0.00,0.00,150000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-07 04:44:02','2026-02-07 04:44:02',NULL),(24,'VEN-20260206-0014',2,'2026-02-07 04:45:10',150000.00,0.00,0.00,150000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-07 04:45:10','2026-02-07 04:45:10',NULL),(25,'VEN-20260207-0001',NULL,'2026-02-07 05:05:48',300000.00,0.00,0.00,300000.00,300000.00,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-07 05:05:48','2026-02-07 05:05:48',NULL),(26,'VEN-20260207-0002',NULL,'2026-02-07 20:21:05',150000.00,0.00,0.00,150000.00,150000.00,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-07 20:21:05','2026-02-07 20:21:05',NULL),(27,'VEN-20260207-0003',NULL,'2026-02-07 20:30:19',150000.00,0.00,0.00,150000.00,150000.00,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-07 20:30:19','2026-02-07 20:30:19',NULL),(28,'VEN-20260213-0001',NULL,'2026-02-13 21:35:45',145000.00,0.00,0.00,145000.00,145000.00,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-13 21:35:45','2026-02-13 21:35:45',NULL),(29,'VEN-20260213-0002',3,'2026-02-14 04:48:47',135000.00,0.00,0.00,135000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-14 04:48:47','2026-02-14 04:48:47',NULL),(30,'VEN-20260214-0001',3,'2026-02-14 05:17:30',135000.00,0.00,0.00,135000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-14 05:17:30','2026-02-14 05:17:30',NULL),(31,'VEN-20260214-0002',3,'2026-02-14 05:23:02',135000.00,0.00,0.00,135000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-14 05:23:02','2026-02-14 05:23:02',NULL),(32,'VEN-20260214-0003',3,'2026-02-14 05:24:56',135000.00,0.00,0.00,135000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-14 05:24:56','2026-02-14 05:24:56',NULL),(33,'VEN-20260219-0001',NULL,'2026-02-20 02:50:54',85000.00,0.00,0.00,85000.00,85000.00,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-20 02:50:54','2026-02-20 02:50:54',NULL),(34,'VEN-20260220-0001',1,'2026-02-21 03:45:25',80000.00,0.00,0.00,80000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-21 03:45:25','2026-02-21 03:45:25',NULL),(35,'VEN-20260220-0002',NULL,'2026-02-21 03:47:55',80000.00,0.00,0.00,80000.00,100000.00,20000.00,'completada','contado','efectivo',NULL,5,1,'2026-02-21 03:47:55','2026-02-21 03:47:55',NULL),(36,'VEN-20260220-0003',2,'2026-02-21 03:49:31',170000.00,0.00,0.00,170000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-21 03:49:31','2026-02-21 03:49:31',NULL),(37,'VEN-20260221-0001',NULL,'2026-02-21 22:47:29',85000.00,0.00,0.00,85000.00,100000.00,15000.00,'completada','contado','efectivo',NULL,5,1,'2026-02-21 22:47:29','2026-02-21 22:47:29',NULL),(38,'VEN-20260221-0002',NULL,'2026-02-21 22:48:34',85000.00,0.00,0.00,85000.00,100000.00,15000.00,'completada','contado','efectivo',NULL,5,1,'2026-02-21 22:48:34','2026-02-21 22:48:34',NULL),(39,'VEN-20260221-0003',NULL,'2026-02-21 22:48:58',240000.00,0.00,0.00,240000.00,250000.00,10000.00,'completada','contado','efectivo',NULL,5,1,'2026-02-21 22:48:58','2026-02-21 22:48:58',NULL),(40,'VEN-20260221-0004',NULL,'2026-02-21 22:50:27',20000.00,0.00,0.00,20000.00,50000.00,30000.00,'completada','contado','efectivo',NULL,5,1,'2026-02-21 22:50:27','2026-02-21 22:50:27',NULL),(41,'VEN-20260221-0005',1,'2026-02-21 22:51:34',85000.00,0.00,0.00,85000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-21 22:51:34','2026-02-21 22:51:34',NULL),(42,'VEN-20260221-0006',NULL,'2026-02-21 22:54:41',85000.00,0.00,0.00,85000.00,85000.00,NULL,'completada','contado','transferencia',NULL,5,1,'2026-02-21 22:54:41','2026-02-21 22:54:41','Nequi'),(43,'VEN-20260221-0007',NULL,'2026-02-21 23:27:38',70000.00,0.00,0.00,70000.00,70000.00,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-21 23:27:38','2026-02-21 23:27:38',NULL),(44,'VEN-20260221-0008',3,'2026-02-21 23:30:07',140000.00,0.00,0.00,140000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-21 23:30:07','2026-02-21 23:30:07',NULL),(45,'VEN-20260221-0009',2,'2026-02-21 23:30:43',70000.00,0.00,0.00,70000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-21 23:30:43','2026-02-21 23:30:43',NULL),(46,'VEN-20260221-0010',4,'2026-02-22 02:19:34',240000.00,0.00,0.00,240000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-22 02:19:34','2026-02-22 02:19:34',NULL),(47,'VEN-20260221-0011',5,'2026-02-22 02:22:47',85000.00,0.00,0.00,85000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-22 02:22:47','2026-02-22 02:22:47',NULL),(48,'VEN-20260221-0012',6,'2026-02-22 02:23:39',300000.00,0.00,0.00,300000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-22 02:23:39','2026-02-22 02:23:39',NULL),(49,'VEN-20260221-0013',5,'2026-02-22 02:25:39',300000.00,0.00,0.00,300000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-22 02:25:39','2026-02-22 02:25:39',NULL),(50,'VEN-20260221-0014',NULL,'2026-02-22 02:43:47',70000.00,0.00,0.00,70000.00,80000.00,10000.00,'completada','contado','efectivo',NULL,5,1,'2026-02-22 02:43:47','2026-02-22 02:43:47',NULL),(51,'VEN-20260221-0015',NULL,'2026-02-22 03:02:55',80000.00,0.00,0.00,80000.00,80000.00,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-22 03:02:55','2026-02-22 03:02:55',NULL),(52,'VEN-20260222-0001',1,'2026-02-22 23:17:26',85000.00,0.00,0.00,85000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-22 23:17:26','2026-02-22 23:17:26',NULL),(53,'VEN-20260222-0002',5,'2026-02-22 23:18:03',90000.00,0.00,0.00,90000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-22 23:18:03','2026-02-22 23:18:03',NULL),(54,'VEN-20260222-0003',NULL,'2026-02-22 23:24:35',90000.00,0.00,0.00,90000.00,90000.00,NULL,'completada','contado','transferencia',NULL,5,1,'2026-02-22 23:24:35','2026-02-22 23:24:35','Nequi - adasda'),(55,'VEN-20260222-0004',NULL,'2026-02-22 23:25:23',100000.00,0.00,0.00,100000.00,100000.00,NULL,'completada','contado','efectivo',NULL,5,1,'2026-02-22 23:25:23','2026-02-22 23:25:23',NULL),(56,'VEN-20260222-0005',1,'2026-02-23 00:29:08',90000.00,0.00,0.00,90000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-23 00:29:08','2026-02-23 00:29:08',NULL),(57,'VEN-20260222-0006',4,'2026-02-23 00:30:22',70000.00,0.00,0.00,70000.00,NULL,NULL,'credito','credito','efectivo',NULL,5,1,'2026-02-23 00:30:22','2026-02-23 00:30:22',NULL);
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'valva_boutique'
--

--
-- Dumping routines for database 'valva_boutique'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-23 17:30:56
