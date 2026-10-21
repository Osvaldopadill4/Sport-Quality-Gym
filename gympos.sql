-- MySQL dump 10.13  Distrib 8.0.17, for Win64 (x86_64)
--
-- Host: localhost    Database: gympos
-- ------------------------------------------------------
-- Server version	8.0.17

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
-- Table structure for table `acceso`
--

DROP TABLE IF EXISTS `acceso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acceso` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `fecha` varchar(255) DEFAULT NULL,
  `hora` varchar(255) DEFAULT NULL,
  `resultado` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `acceso_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acceso`
--

LOCK TABLES `acceso` WRITE;
/*!40000 ALTER TABLE `acceso` DISABLE KEYS */;
/*!40000 ALTER TABLE `acceso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `contacto_emergencia` varchar(255) DEFAULT NULL,
  `telefono_emergencia` varchar(255) DEFAULT NULL,
  `fecha_registro` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `token_qr` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Andy Qlon','3471084574','20704','AMA','348020704','1998','1','GYM-QR-9299-6925');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compra`
--

DROP TABLE IF EXISTS `compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_proveedor` (`id_proveedor`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `compra_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id`),
  CONSTRAINT `compra_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra`
--

LOCK TABLES `compra` WRITE;
/*!40000 ALTER TABLE `compra` DISABLE KEYS */;
/*!40000 ALTER TABLE `compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `corte_caja`
--

DROP TABLE IF EXISTS `corte_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `corte_caja` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `fecha_apertura` datetime NOT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `monto_inicial` decimal(10,2) NOT NULL,
  `total_ventas` decimal(10,2) DEFAULT NULL,
  `monto_calculado` decimal(10,2) DEFAULT NULL,
  `monto_real` decimal(10,2) DEFAULT NULL,
  `diferencia` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `corte_caja_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `corte_caja`
--

LOCK TABLES `corte_caja` WRITE;
/*!40000 ALTER TABLE `corte_caja` DISABLE KEYS */;
/*!40000 ALTER TABLE `corte_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_compra`
--

DROP TABLE IF EXISTS `detalle_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_compra` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_compra` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_compra` (`id_compra`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_compra_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id`),
  CONSTRAINT `detalle_compra_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_compra`
--

LOCK TABLES `detalle_compra` WRITE;
/*!40000 ALTER TABLE `detalle_compra` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_plan` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_venta` (`id_venta`),
  KEY `id_producto` (`id_producto`),
  KEY `id_plan` (`id_plan`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id`),
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id`),
  CONSTRAINT `detalle_venta_ibfk_3` FOREIGN KEY (`id_plan`) REFERENCES `plan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_validar_stock_venta` BEFORE INSERT ON `detalle_venta` FOR EACH ROW BEGIN
    DECLARE v_stock INT DEFAULT NULL;

    IF NEW.id_producto IS NOT NULL THEN
        SELECT CAST(stock AS UNSIGNED)
        INTO v_stock
        FROM producto
        WHERE id = NEW.id_producto;

        IF v_stock IS NULL OR NEW.cantidad <= 0
           OR v_stock < NEW.cantidad THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Stock insuficiente o producto inexistente';
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_descontar_stock` AFTER INSERT ON `detalle_venta` FOR EACH ROW BEGIN
    IF NEW.id_producto IS NOT NULL THEN
        UPDATE producto
        SET stock = CAST(stock AS UNSIGNED) - NEW.cantidad
        WHERE id = NEW.id_producto;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_restaurar_stock` AFTER DELETE ON `detalle_venta` FOR EACH ROW BEGIN
    IF OLD.id_producto IS NOT NULL THEN
        UPDATE producto
        SET stock = CAST(stock AS UNSIGNED) + OLD.cantidad
        WHERE id = OLD.id_producto;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `membresia`
--

DROP TABLE IF EXISTS `membresia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membresia` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `id_plan` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_plan` (`id_plan`),
  CONSTRAINT `membresia_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  CONSTRAINT `membresia_ibfk_2` FOREIGN KEY (`id_plan`) REFERENCES `plan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membresia`
--

LOCK TABLES `membresia` WRITE;
/*!40000 ALTER TABLE `membresia` DISABLE KEYS */;
/*!40000 ALTER TABLE `membresia` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_validar_membresia` BEFORE INSERT ON `membresia` FOR EACH ROW BEGIN
    IF NEW.fecha_vencimiento < NEW.fecha_inicio THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La fecha de vencimiento no puede ser anterior al inicio';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `plan`
--

DROP TABLE IF EXISTS `plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio` float DEFAULT NULL,
  `duracion_dias` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `stock` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan`
--

LOCK TABLES `plan` WRITE;
/*!40000 ALTER TABLE `plan` DISABLE KEYS */;
INSERT INTO `plan` VALUES (1,'Semanal','Acceso total durante 7 días continuos al área de pesas y cardio.',150,'7','Activo',NULL,NULL),(2,'Mensual','Acceso ilimitado por 1 mes (30 días). El plan más solicitado.',350,'30','Activo',NULL,NULL),(3,'Anual','Membresía anual completa. Solo  MXN al mes. Máximo ahorro.',2100,'365','Activo',NULL,NULL),(4,'Estudiantil','Tarifa preferencial de $200 MXN/mes con credencial de estudiante vigente.',200,'30','Activo',NULL,NULL),(5,'Invitado','Pase temporal de cortesía o prueba por 24 horas para acceso a torniquetes.',30,'1','Activo',NULL,NULL),(6,'Proteína Whey Isolate','2kg Vainilla Gold Standard',1250,NULL,'Activo','Suplementos','18'),(7,'Creatina Monohidratada','Creapure 300g Micronizada',550,NULL,'Activo','Suplementos','4'),(8,'Bebida Energética Pre-Workout','Lata 473ml Sabor Blue Berry',65,NULL,'Activo','Bebidas','35'),(9,'Correas de Levantamiento (Straps)','Algodón reforzado antideslizante',220,NULL,'Activo','Accesorios','12'),(10,'Shaker Mezclador 700ml','Vaso con bola mezcladora de acero',140,NULL,'Inactivo','Accesorios','2'),(11,'Creatina Julio','Te va a hacer un tinaco man',100,NULL,'Activo','Snacks','498');
/*!40000 ALTER TABLE `plan` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sync_plan_a_producto_insert` AFTER INSERT ON `plan` FOR EACH ROW BEGIN
    IF (NEW.categoria IS NOT NULL OR NEW.stock IS NOT NULL) THEN
        INSERT INTO `producto` (`id`, `nombre`, `descripcion`, `precio`, `stock`, `stock_minimo`, `estado`, `categoria`)
        VALUES (NEW.id, NEW.nombre, NEW.descripcion, NEW.precio, IFNULL(NEW.stock, '0'), 5, IFNULL(NEW.estado, 'Activo'), IFNULL(NEW.categoria, 'General'))
        ON DUPLICATE KEY UPDATE
            nombre = VALUES(nombre),
            descripcion = VALUES(descripcion),
            precio = VALUES(precio),
            stock = VALUES(stock),
            estado = VALUES(estado),
            categoria = VALUES(categoria);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sync_plan_a_producto_update` AFTER UPDATE ON `plan` FOR EACH ROW BEGIN
    IF (NEW.categoria IS NOT NULL OR NEW.stock IS NOT NULL) THEN
        INSERT INTO `producto` (`id`, `nombre`, `descripcion`, `precio`, `stock`, `stock_minimo`, `estado`, `categoria`)
        VALUES (NEW.id, NEW.nombre, NEW.descripcion, NEW.precio, IFNULL(NEW.stock, '0'), 5, IFNULL(NEW.estado, 'Activo'), IFNULL(NEW.categoria, 'General'))
        ON DUPLICATE KEY UPDATE
            nombre = VALUES(nombre),
            descripcion = VALUES(descripcion),
            precio = VALUES(precio),
            stock = VALUES(stock),
            estado = VALUES(estado),
            categoria = VALUES(categoria);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sync_plan_a_producto_delete` AFTER DELETE ON `plan` FOR EACH ROW BEGIN
    DELETE FROM `producto` WHERE id = OLD.id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio` varchar(255) DEFAULT NULL,
  `stock` varchar(255) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT '0',
  `estado` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'Proteína Whey Isolate','2kg Vainilla Gold Standard','1250','18',5,'Activo','Suplementos'),(2,'Creatina Monohidratada','Creapure 300g Micronizada','550','4',6,'Activo','Suplementos'),(3,'Bebida Energética Pre-Workout','Lata 473ml Sabor Blue Berry','65','35',10,'Activo','Bebidas'),(4,'Correas de Levantamiento (Straps)','Algodón reforzado antideslizante','220','12',3,'Activo','Accesorios'),(5,'Shaker Mezclador 700ml','Vaso con bola mezcladora de acero','140','2',5,'Inactivo','Accesorios'),(6,'Proteína Whey Isolate','2kg Vainilla Gold Standard','1250','18',5,'Activo','Suplementos'),(8,'Bebida Energética Pre-Workout','Lata 473ml Sabor Blue Berry','65','35',5,'Activo','Bebidas'),(9,'Correas de Levantamiento (Straps)','Algodón reforzado antideslizante','220','12',5,'Activo','Accesorios');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_empresa` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (1,'Tacos lira|','3471015956','osva@gmail.com','1','Osvaldo');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Admin','Administrador control total'),(2,'Empleado','Empleado'),(3,'Inventario','Inventario');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_rol` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `apellido` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `contrasena` varchar(255) NOT NULL,
  `estado` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,1,'Fabian','Alvarez','3481084815','fabi77@gmail.com','123','1'),(2,1,'Osvaldo','Padilla','3471012962','osvaldivo60@gmail.com','050705','1'),(3,2,'Ismael','De anda','3471021512','Cr7@gmail.com','7','0'),(4,2,'Andy','Qlon','34854747512','Qlito@gmail.com','123456','1');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `venta` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_validar_cliente` BEFORE INSERT ON `venta` FOR EACH ROW BEGIN
    IF NEW.id_cliente IS NOT NULL
       AND NOT EXISTS (
           SELECT 1
           FROM cliente
           WHERE id = NEW.id_cliente
             AND estado = 1
       ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El cliente no existe o está inactivo';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Temporary view structure for view `vw_clientes_membresias`
--

DROP TABLE IF EXISTS `vw_clientes_membresias`;
/*!50001 DROP VIEW IF EXISTS `vw_clientes_membresias`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_clientes_membresias` AS SELECT 
 1 AS `id_cliente`,
 1 AS `cliente`,
 1 AS `telefono`,
 1 AS `fecha_registro`,
 1 AS `estado_cliente`,
 1 AS `id_membresia`,
 1 AS `plan`,
 1 AS `fecha_inicio`,
 1 AS `fecha_vencimiento`,
 1 AS `estado_membresia`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_detalle_ventas`
--

DROP TABLE IF EXISTS `vw_detalle_ventas`;
/*!50001 DROP VIEW IF EXISTS `vw_detalle_ventas`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_detalle_ventas` AS SELECT 
 1 AS `id_venta`,
 1 AS `fecha`,
 1 AS `empleado`,
 1 AS `cliente`,
 1 AS `articulo`,
 1 AS `cantidad`,
 1 AS `precio_unitario`,
 1 AS `subtotal`,
 1 AS `total`,
 1 AS `metodo_pago`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_estado_membresias`
--

DROP TABLE IF EXISTS `vw_estado_membresias`;
/*!50001 DROP VIEW IF EXISTS `vw_estado_membresias`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_estado_membresias` AS SELECT 
 1 AS `id_cliente`,
 1 AS `cliente`,
 1 AS `plan`,
 1 AS `fecha_inicio`,
 1 AS `fecha_vencimiento`,
 1 AS `estado`,
 1 AS `dias_restantes`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_historial_accesos`
--

DROP TABLE IF EXISTS `vw_historial_accesos`;
/*!50001 DROP VIEW IF EXISTS `vw_historial_accesos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_historial_accesos` AS SELECT 
 1 AS `id_acceso`,
 1 AS `id_cliente`,
 1 AS `cliente`,
 1 AS `fecha`,
 1 AS `hora`,
 1 AS `resultado`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_inventario_bajo`
--

DROP TABLE IF EXISTS `vw_inventario_bajo`;
/*!50001 DROP VIEW IF EXISTS `vw_inventario_bajo`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_inventario_bajo` AS SELECT 
 1 AS `id`,
 1 AS `nombre`,
 1 AS `categoria`,
 1 AS `stock`,
 1 AS `stock_minimo`,
 1 AS `estado`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'gympos'
--
/*!50003 DROP FUNCTION IF EXISTS `fn_calcular_descuento` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_descuento`(`p_precio` DECIMAL(10,2), `p_porcentaje` DECIMAL(5,2)) RETURNS decimal(10,2)
    NO SQL
    DETERMINISTIC
BEGIN
    IF p_precio < 0 OR p_porcentaje < 0 OR p_porcentaje > 100 THEN
        RETURN NULL;
    END IF;

    RETURN ROUND(p_precio * p_porcentaje / 100, 2);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_calcular_subtotal_producto` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_subtotal_producto`(`p_precio` DECIMAL(10,2), `p_cantidad` INT) RETURNS decimal(10,2)
    NO SQL
    DETERMINISTIC
BEGIN
    RETURN p_precio * p_cantidad;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_calcular_total_venta` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_total_venta`(`p_id_venta` INT) RETURNS decimal(10,2)
    READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);

    SELECT COALESCE(SUM(subtotal), 0)
    INTO v_total
    FROM detalle_venta
    WHERE id_venta = p_id_venta;

    RETURN v_total;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_dias_restantes_membresia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_dias_restantes_membresia`(`p_fecha_vencimiento` DATE) RETURNS int(11)
    NO SQL
BEGIN
    RETURN DATEDIFF(p_fecha_vencimiento, CURDATE());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_estado_membresia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_estado_membresia`(`p_fecha_inicio` DATE, `p_fecha_vencimiento` DATE) RETURNS varchar(20) CHARSET utf8mb4
    NO SQL
BEGIN
    IF CURDATE() < p_fecha_inicio THEN
        RETURN 'Pendiente';
    ELSEIF CURDATE() > p_fecha_vencimiento THEN
        RETURN 'Vencida';
    ELSEIF DATEDIFF(p_fecha_vencimiento, CURDATE()) <= 3 THEN
        RETURN 'Por vencer';
    ELSE
        RETURN 'Activa';
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_generar_folio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_generar_folio`(OUT `p_folio` VARCHAR(40))
BEGIN
    SET p_folio = CONCAT(
        'V-',
        DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'),
        '-',
        UPPER(SUBSTRING(REPLACE(UUID(), '-', ''), 1, 6))
    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_acceso` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_acceso`(IN `p_id_cliente` INT)
BEGIN
    DECLARE v_activo INT DEFAULT 0;
    DECLARE v_resultado VARCHAR(20);

    SELECT COUNT(*)
    INTO v_activo
    FROM cliente c
    INNER JOIN membresia m ON c.id = m.id_cliente
    WHERE c.id = p_id_cliente
      AND c.estado = 1
      AND m.estado = 'activa'
      AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_vencimiento;

    IF v_activo > 0 THEN
        SET v_resultado = 'Permitido';
    ELSE
        SET v_resultado = 'Rechazado';
    END IF;

    INSERT INTO acceso (id_cliente, fecha, hora, resultado)
    VALUES (p_id_cliente, CURDATE(), CURTIME(), v_resultado);

    SELECT v_resultado AS resultado_acceso;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_compra_inventario` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_compra_inventario`(IN `p_id_usuario` INT, IN `p_id_proveedor` INT, IN `p_id_producto` INT, IN `p_cantidad` INT, IN `p_costo` DECIMAL(10,2))
BEGIN
    DECLARE v_id_compra INT;
    DECLARE v_subtotal DECIMAL(10,2);

    IF p_cantidad <= 0 OR p_costo < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cantidad o costo no válido';
    END IF;

    SET v_subtotal = p_cantidad * p_costo;

    INSERT INTO compra (
        id_usuario, id_proveedor, fecha, total, estado
    )
    VALUES (
        p_id_usuario, p_id_proveedor, NOW(), v_subtotal, 'Registrada'
    );

    SET v_id_compra = LAST_INSERT_ID();

    INSERT INTO detalle_compra (
        id_compra, id_producto, cantidad, costo_unitario, subtotal
    )
    VALUES (
        v_id_compra, p_id_producto, p_cantidad, p_costo, v_subtotal
    );

    UPDATE producto
    SET stock = CAST(stock AS UNSIGNED) + p_cantidad
    WHERE id = p_id_producto;

    SELECT v_id_compra AS id_compra, v_subtotal AS total_compra;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_venta` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_venta`(IN `p_id_usuario` INT, IN `p_id_cliente` INT, IN `p_id_producto` INT, IN `p_cantidad` INT, IN `p_metodo_pago` VARCHAR(30))
BEGIN
    DECLARE v_precio DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_id_venta INT;
    DECLARE v_folio VARCHAR(40);

    IF p_cantidad <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La cantidad debe ser mayor que cero';
    END IF;

    SELECT CAST(precio AS DECIMAL(10,2))
    INTO v_precio
    FROM producto
    WHERE id = p_id_producto AND estado = 'activo';

    SET v_total = v_precio * p_cantidad;

    CALL sp_generar_folio(v_folio);

    INSERT INTO venta (
        id_usuario, id_cliente, fecha, total, metodo_pago, folio
    )
    VALUES (
        p_id_usuario, p_id_cliente, NOW(), v_total, p_metodo_pago, v_folio
    );

    SET v_id_venta = LAST_INSERT_ID();

    INSERT INTO detalle_venta (
        id_venta, id_producto, id_plan,
        cantidad, precio_unitario, subtotal
    )
    VALUES (
        v_id_venta, p_id_producto, NULL,
        p_cantidad, v_precio, v_total
    );

    SELECT v_id_venta AS id_venta, v_folio AS folio, v_total AS total;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_renovar_membresia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_renovar_membresia`(IN `p_id_membresia` INT)
BEGIN
    DECLARE v_duracion INT;
    DECLARE v_fecha DATE;

    SELECT p.duracion_dias, m.fecha_vencimiento
    INTO v_duracion, v_fecha
    FROM membresia m
    INNER JOIN plan p ON m.id_plan = p.id
    WHERE m.id = p_id_membresia;

    UPDATE membresia
    SET fecha_inicio = CURDATE(),
        fecha_vencimiento = DATE_ADD(
            GREATEST(COALESCE(v_fecha, CURDATE()), CURDATE()),
            INTERVAL v_duracion DAY
        ),
        estado = 'activa'
    WHERE id = p_id_membresia;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `vw_clientes_membresias`
--

/*!50001 DROP VIEW IF EXISTS `vw_clientes_membresias`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_clientes_membresias` AS select `c`.`id` AS `id_cliente`,`c`.`nombre` AS `cliente`,`c`.`telefono` AS `telefono`,`c`.`fecha_registro` AS `fecha_registro`,`c`.`estado` AS `estado_cliente`,`m`.`id` AS `id_membresia`,`p`.`nombre` AS `plan`,`m`.`fecha_inicio` AS `fecha_inicio`,`m`.`fecha_vencimiento` AS `fecha_vencimiento`,`m`.`estado` AS `estado_membresia` from ((`cliente` `c` left join `membresia` `m` on((`c`.`id` = `m`.`id_cliente`))) left join `plan` `p` on((`m`.`id_plan` = `p`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_detalle_ventas`
--

/*!50001 DROP VIEW IF EXISTS `vw_detalle_ventas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_detalle_ventas` AS select `v`.`id` AS `id_venta`,`v`.`fecha` AS `fecha`,`u`.`nombre` AS `empleado`,`c`.`nombre` AS `cliente`,coalesce(`p`.`nombre`,`pl`.`nombre`) AS `articulo`,`dv`.`cantidad` AS `cantidad`,`dv`.`precio_unitario` AS `precio_unitario`,`dv`.`subtotal` AS `subtotal`,`v`.`total` AS `total`,`v`.`metodo_pago` AS `metodo_pago` from (((((`venta` `v` join `usuario` `u` on((`v`.`id_usuario` = `u`.`id`))) left join `cliente` `c` on((`v`.`id_cliente` = `c`.`id`))) join `detalle_venta` `dv` on((`v`.`id` = `dv`.`id_venta`))) left join `producto` `p` on((`dv`.`id_producto` = `p`.`id`))) left join `plan` `pl` on((`dv`.`id_plan` = `pl`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_estado_membresias`
--

/*!50001 DROP VIEW IF EXISTS `vw_estado_membresias`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_estado_membresias` AS select `c`.`id` AS `id_cliente`,`c`.`nombre` AS `cliente`,`p`.`nombre` AS `plan`,`m`.`fecha_inicio` AS `fecha_inicio`,`m`.`fecha_vencimiento` AS `fecha_vencimiento`,`m`.`estado` AS `estado`,(to_days(`m`.`fecha_vencimiento`) - to_days(curdate())) AS `dias_restantes` from ((`membresia` `m` join `cliente` `c` on((`m`.`id_cliente` = `c`.`id`))) join `plan` `p` on((`m`.`id_plan` = `p`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_historial_accesos`
--

/*!50001 DROP VIEW IF EXISTS `vw_historial_accesos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_historial_accesos` AS select `a`.`id` AS `id_acceso`,`c`.`id` AS `id_cliente`,`c`.`nombre` AS `cliente`,`a`.`fecha` AS `fecha`,`a`.`hora` AS `hora`,`a`.`resultado` AS `resultado` from (`acceso` `a` join `cliente` `c` on((`a`.`id_cliente` = `c`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_inventario_bajo`
--

/*!50001 DROP VIEW IF EXISTS `vw_inventario_bajo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_inventario_bajo` AS select `producto`.`id` AS `id`,`producto`.`nombre` AS `nombre`,`producto`.`categoria` AS `categoria`,cast(`producto`.`stock` as signed) AS `stock`,`producto`.`stock_minimo` AS `stock_minimo`,`producto`.`estado` AS `estado` from `producto` where ((cast(`producto`.`stock` as signed) <= `producto`.`stock_minimo`) or (cast(`producto`.`stock` as signed) <= 5)) */;
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

-- Dump completed on 2026-10-21 12:25:06
