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
USE gympos;

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acceso`
--

LOCK TABLES `acceso` WRITE;
/*!40000 ALTER TABLE `acceso` DISABLE KEYS */;
INSERT INTO `acceso` VALUES (1,1,'2026-10-21','21:48:35','Rechazado'),(2,2,'2026-11-06','13:07:53','Permitido'),(3,1,'2026-11-06','13:08:18','Rechazado'),(4,4,'2026-11-06','14:46:38','Permitido'),(5,1,'2026-11-06','14:47:17','Rechazado'),(6,2,'2026-11-06','14:48:03','Permitido'),(7,2,'2026-11-06','14:52:10','Permitido'),(8,2,'2026-11-06','14:53:54','Permitido'),(9,2,'2026-11-06','14:57:45','Permitido'),(10,5,'2026-11-06','15:46:24','Permitido'),(11,5,'2026-11-06','15:46:37','Permitido'),(12,6,'2026-11-06','19:27:47','Permitido'),(13,6,'2026-11-06','19:28:14','Permitido'),(14,1,'2026-11-08','01:19:50','Rechazado'),(15,2,'2026-11-08','01:19:50','Permitido'),(16,1,'2026-11-08','01:29:48','Permitido'),(17,1,'2026-11-08','01:30:09','Rechazado');
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
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Andy Qlon','3471084574','20704','AMA','348020704','2026-11-02','1','GYM-QR-9299-6925'),(2,'Osvaldivo jeje','3471012962','050705','Señora Padilla','3471012588','2026-10-31','1','GYM-QR-9179-QKCT5H'),(4,'Niño','45629849034','ajna','ghishoigio','35356076307','2026-11-01','1','GYM-QR-5714-CT4EWW'),(5,'guero','3481516939','123456789','osva','3471012906','2026-11-06','1','GYM-QR-9477-4FPIVJ'),(6,'Nancy Gutierrez Pedr','3471120413','120417','Arnulfo Padilla Padi','3471012733','2026-11-06','1','GYM-QR-5817-YTBABQ');
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
  `fecha` varchar(255) DEFAULT NULL,
  `total` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_proveedor` (`id_proveedor`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `compra_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id`),
  CONSTRAINT `compra_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra`
--

LOCK TABLES `compra` WRITE;
/*!40000 ALTER TABLE `compra` DISABLE KEYS */;
INSERT INTO `compra` VALUES (1,1,1,'2026-11-05 20:01:41','410','Completada'),(2,1,1,'2026-11-06 18:09:24','30','Completada');
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
  `fecha_apertura` varchar(255) DEFAULT NULL,
  `fecha_cierre` varchar(255) DEFAULT NULL,
  `monto_inicial` decimal(38,2) NOT NULL DEFAULT '500.00',
  `total_ventas` varchar(255) DEFAULT NULL,
  `monto_calculado` varchar(255) DEFAULT NULL,
  `monto_real` varchar(255) DEFAULT NULL,
  `diferencia` varchar(255) DEFAULT NULL,
  `total_gastos` decimal(20,6) DEFAULT NULL,
  `tarjeta` decimal(20,6) DEFAULT NULL,
  `efectivo` decimal(20,6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `corte_caja_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `corte_caja`
--

LOCK TABLES `corte_caja` WRITE;
/*!40000 ALTER TABLE `corte_caja` DISABLE KEYS */;
INSERT INTO `corte_caja` VALUES (1,1,'2026-10-31 03:49:56','2026-10-30 21:50:58',500.00,'0.000000','500.000000','500.000000','0.000000',NULL,NULL,NULL),(4,1,'2026-11-06 21:35:37','2026-11-06 21:37:03',500.00,'866.35','1366.35','970.00','-396.35',NULL,NULL,NULL);
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
  `cantidad` varchar(255) DEFAULT NULL,
  `costo_unitario` varchar(255) DEFAULT NULL,
  `subtotal` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_compra` (`id_compra`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_compra_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id`),
  CONSTRAINT `detalle_compra_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_compra`
--

LOCK TABLES `detalle_compra` WRITE;
/*!40000 ALTER TABLE `detalle_compra` DISABLE KEYS */;
INSERT INTO `detalle_compra` VALUES (1,1,13,'10','41','410'),(2,2,2,'1','30','30');
/*!40000 ALTER TABLE `detalle_compra` ENABLE KEYS */;
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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_validar_detalle_compra` BEFORE INSERT ON `detalle_compra` FOR EACH ROW BEGIN

    DECLARE v_producto_existe INT;

    

    -- Validar que el producto exista

    SELECT COUNT(*)

    INTO v_producto_existe

    FROM producto

    WHERE id = NEW.id_producto;

    

    IF v_producto_existe = 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'El producto no existe';

    END IF;

    

    -- Validar cantidad positiva

    IF NEW.cantidad <= 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'La cantidad debe ser mayor que cero';

    END IF;

    

    -- Validar costo positivo

    IF NEW.costo_unitario < 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'El costo unitario no puede ser negativo';

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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_incrementar_stock_compra` AFTER INSERT ON `detalle_compra` FOR EACH ROW BEGIN

    UPDATE producto

    SET stock = CAST(stock AS UNSIGNED) + NEW.cantidad

    WHERE id = NEW.id_producto;

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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ajustar_stock_compra_update` AFTER UPDATE ON `detalle_compra` FOR EACH ROW BEGIN

    UPDATE producto

    SET stock = CAST(stock AS UNSIGNED) - (OLD.cantidad - NEW.cantidad)

    WHERE id = NEW.id_producto;

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
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_decrementar_stock_compra` AFTER DELETE ON `detalle_compra` FOR EACH ROW BEGIN

    UPDATE producto

    SET stock = CAST(stock AS UNSIGNED) - OLD.cantidad

    WHERE id = OLD.id_producto;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
  `cantidad` varchar(255) DEFAULT NULL,
  `precio_unitario` varchar(255) DEFAULT NULL,
  `subtotal` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_venta` (`id_venta`),
  KEY `id_producto` (`id_producto`),
  KEY `id_plan` (`id_plan`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id`),
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id`),
  CONSTRAINT `detalle_venta_ibfk_3` FOREIGN KEY (`id_plan`) REFERENCES `plan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
INSERT INTO `detalle_venta` VALUES (5,7,NULL,2,'1','350','350'),(6,8,NULL,5,'1','30','30'),(7,8,NULL,5,'1','30','30'),(8,8,NULL,5,'1','30','30'),(9,8,NULL,5,'1','30','30'),(10,9,13,NULL,'5','67.67','338.35'),(11,9,15,NULL,'1','15','15'),(12,9,16,NULL,'1','43','43'),(13,10,NULL,1,'1','150','150');
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
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_generar_membresia_venta` AFTER INSERT ON `detalle_venta` FOR EACH ROW BEGIN
    DECLARE v_id_cliente INT;
    DECLARE v_duracion_dias INT;
    DECLARE v_fecha_inicio DATE;
    DECLARE v_fecha_vencimiento DATE;
    DECLARE v_tiene_membresia_activa INT;
    DECLARE v_ultima_fecha_vencimiento DATE;
    
    IF NEW.id_plan IS NOT NULL THEN
        SELECT id_cliente INTO v_id_cliente FROM venta WHERE id = NEW.id_venta;
        
        IF v_id_cliente IS NOT NULL THEN
            SELECT CAST(duracion_dias AS UNSIGNED) INTO v_duracion_dias FROM plan WHERE id = NEW.id_plan;
            
            SELECT COUNT(*), MAX(fecha_vencimiento)
            INTO v_tiene_membresia_activa, v_ultima_fecha_vencimiento
            FROM membresia
            WHERE id_cliente = v_id_cliente
            AND id_plan = NEW.id_plan
            AND estado = 'activa'
            AND fecha_vencimiento >= CURDATE();
            
            IF v_tiene_membresia_activa > 0 AND v_ultima_fecha_vencimiento IS NOT NULL THEN
                SET v_fecha_inicio = v_ultima_fecha_vencimiento + INTERVAL 1 DAY;
                SET v_fecha_vencimiento = v_fecha_inicio + INTERVAL v_duracion_dias DAY;
                
                UPDATE membresia
                SET fecha_vencimiento = v_fecha_vencimiento
                WHERE id_cliente = v_id_cliente
                AND id_plan = NEW.id_plan
                AND estado = 'activa'
                AND fecha_vencimiento = v_ultima_fecha_vencimiento;
            ELSE
                SELECT MAX(fecha_vencimiento) INTO v_ultima_fecha_vencimiento
                FROM membresia
                WHERE id_cliente = v_id_cliente
                AND estado = 'activa'
                AND fecha_vencimiento >= CURDATE();

                IF v_ultima_fecha_vencimiento IS NOT NULL THEN
                    SET v_fecha_inicio = v_ultima_fecha_vencimiento + INTERVAL 1 DAY;
                ELSE
                    SET v_fecha_inicio = CURDATE();
                END IF;

                SET v_fecha_vencimiento = v_fecha_inicio + INTERVAL v_duracion_dias DAY;
                
                INSERT INTO membresia (id_cliente, id_plan, fecha_inicio, fecha_vencimiento, estado)
                VALUES (v_id_cliente, NEW.id_plan, v_fecha_inicio, v_fecha_vencimiento, 'activa');
            END IF;
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
  `fecha_inicio` varchar(255) DEFAULT NULL,
  `fecha_vencimiento` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_plan` (`id_plan`),
  CONSTRAINT `membresia_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  CONSTRAINT `membresia_ibfk_2` FOREIGN KEY (`id_plan`) REFERENCES `plan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membresia`
--

LOCK TABLES `membresia` WRITE;
/*!40000 ALTER TABLE `membresia` DISABLE KEYS */;
INSERT INTO `membresia` VALUES (2,1,1,'2026-11-08','2026-11-15','activa'),(3,2,2,'2026-11-05','2026-12-05','activa'),(5,4,2,'2026-11-06','2026-12-11','activa'),(7,5,5,'2026-11-06','2026-11-13','activa'),(8,6,1,'2026-11-06','2026-11-13','activa');
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

    DECLARE v_cliente_existe INT;

    DECLARE v_plan_existe INT;

    DECLARE v_membresia_duplicada INT;

    

    -- Validar que el cliente exista y esté activo

    SELECT COUNT(*)

    INTO v_cliente_existe

    FROM cliente

    WHERE id = NEW.id_cliente 

    AND (estado = '1' OR estado = 1 OR LOWER(estado) = 'activo');

    

    IF v_cliente_existe = 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'El cliente no existe o está inactivo';

    END IF;

    

    -- Validar que el plan exista y esté activo

    SELECT COUNT(*)

    INTO v_plan_existe

    FROM plan

    WHERE id = NEW.id_plan 

    AND (estado = 'activo' OR estado = 'Activo');

    

    IF v_plan_existe = 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'El plan no existe o está inactivo';

    END IF;

    

    -- Validar que la fecha de vencimiento no sea anterior al inicio

    IF NEW.fecha_vencimiento < NEW.fecha_inicio THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'La fecha de vencimiento no puede ser anterior al inicio';

    END IF;

    

    -- Validar que no haya una membresía activa duplicada para el mismo cliente

    SELECT COUNT(*)

    INTO v_membresia_duplicada

    FROM membresia

    WHERE id_cliente = NEW.id_cliente

    AND id_plan = NEW.id_plan

    AND estado = 'activa'

    AND fecha_inicio = NEW.fecha_inicio;

    

    IF v_membresia_duplicada > 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'Ya existe una membresía activa con el mismo plan y fecha de inicio';

    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `modo_pago`
--

DROP TABLE IF EXISTS `modo_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modo_pago` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modo_pago`
--

LOCK TABLES `modo_pago` WRITE;
/*!40000 ALTER TABLE `modo_pago` DISABLE KEYS */;
INSERT INTO `modo_pago` VALUES (1,'Efectivo'),(2,'Tarjeta');
/*!40000 ALTER TABLE `modo_pago` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan`
--

LOCK TABLES `plan` WRITE;
/*!40000 ALTER TABLE `plan` DISABLE KEYS */;
INSERT INTO `plan` VALUES (1,'Semanal','Acceso total durante 7 días continuos al área de pesas y cardio.',150,'7','Activo',NULL,NULL),(2,'Mensual','Acceso ilimitado por 1 mes (30 días). El plan más solicitado.',350,'30','Activo',NULL,NULL),(3,'Anual','Membresía anual completa. Solo  MXN al mes. Máximo ahorro.',2100,'365','Activo',NULL,NULL),(4,'Estudiantil','Tarifa preferencial de $200 MXN/mes con credencial de estudiante vigente.',200,'30','Activo',NULL,NULL),(5,'Invitado','Pase temporal de cortesía o prueba por 24 horas para acceso a torniquetes.',30,'1','Activo',NULL,NULL);
/*!40000 ALTER TABLE `plan` ENABLE KEYS */;
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
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
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
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sync_plan_a_producto_delete` AFTER DELETE ON `plan` FOR EACH ROW BEGIN

    IF (OLD.categoria IS NOT NULL OR OLD.stock IS NOT NULL) THEN

        DELETE FROM producto WHERE id = OLD.id;

    END IF;

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'Proteína Whey Isolate','2kg Vainilla Gold Standard','1250','28',5,'1','Suplementos'),(2,'Creatina Monohidratada','Creapure 300g Micronizada','550','5',6,'Activo','Suplementos'),(3,'Bebida Energética Pre-Workout','Lata 473ml Sabor Blue Berry','65','35',10,'Activo','Bebidas'),(4,'Correas de Levantamiento (Straps)','Algodón reforzado antideslizante','220','11',3,'Activo','Accesorios'),(5,'Shaker Mezclador 700ml','Vaso con bola mezcladora de acero','140','2',5,'1','Accesorios'),(13,'Fabi coito','Te va a dar un follada express con influencia y SIDA','67.67','76',0,'1','Snacks'),(14,'Awita','awita','10','500',0,'1','Bebidas'),(15,'leche','es leche','15','9',0,'1','Suplementos'),(16,'chocho','hola te voy a chochar','43','99',0,'1','Suplementos'),(17,'tacos de sal','tacos de sal','67','3',0,'0','Snacks');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,1,'Fabian','Alvarez','3481084815','fabi77@gmail.com','123','1'),(2,1,'Osvaldo','Padilla','3471012962','osvaldivo60@gmail.com','050705','1'),(3,2,'Ismael','De anda','3471021512','Cr7@gmail.com','7','0'),(4,2,'Andy','Qlon','34854747512','Qlito@gmail.com','123456','1'),(5,2,'farmeador de aura','aura farmer','67676767676','farmersixsevenbro@gmail.com','6767','1');
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
  `id_modopago` int(11) DEFAULT NULL,
  `fecha` varchar(255) DEFAULT NULL,
  `total` varchar(255) DEFAULT NULL,
  `folio` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `metodo_pago` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_usuario` (`id_usuario`),
  KEY `modopago_ibfk_1` (`id_modopago`),
  CONSTRAINT `modopago_ibfk_1` FOREIGN KEY (`id_modopago`) REFERENCES `modo_pago` (`id`),
  CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=99904 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
INSERT INTO `venta` VALUES (7,1,4,1,'2026-11-06 12:37:02','350','V-20261106123702-A2F23E','Completada',NULL),(8,1,5,1,'2026-11-06 15:32:21','120','V-20261106153221-C4FACF','Completada',NULL),(9,1,5,2,'2026-11-06 15:33:14','396.35','V-20261106153314-05DBAE','Completada',NULL),(10,1,6,1,'2026-11-06 19:24:33','150','V-20261106192433-74D561','Completada',NULL);
/*!40000 ALTER TABLE `venta` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_validar_cliente_venta` BEFORE INSERT ON `venta` FOR EACH ROW BEGIN

    IF NEW.id_cliente IS NOT NULL

       AND NOT EXISTS (

           SELECT 1

           FROM cliente

           WHERE id = NEW.id_cliente

             AND (estado = '1' OR estado = 1 OR LOWER(estado) = 'activo')

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
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_sync_id_modopago` BEFORE INSERT ON `venta` FOR EACH ROW SET NEW.id_modopago = IF(NEW.id_modopago IS NOT NULL, NEW.id_modopago, IF(LOWER(IFNULL(NEW.metodo_pago, '')) LIKE '%tarjeta%', 2, 1)) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `vw_clientes_membresias`
--

DROP TABLE IF EXISTS `vw_clientes_membresias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vw_clientes_membresias` (
  `id_cliente` int(11) NOT NULL,
  `cliente` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `fecha_registro` varchar(255) DEFAULT NULL,
  `estado_cliente` varchar(255) DEFAULT NULL,
  `id_membresia` int(11) DEFAULT NULL,
  `plan` varchar(255) DEFAULT NULL,
  `fecha_inicio` varchar(255) DEFAULT NULL,
  `fecha_vencimiento` varchar(255) DEFAULT NULL,
  `estado_membresia` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vw_clientes_membresias`
--

LOCK TABLES `vw_clientes_membresias` WRITE;
/*!40000 ALTER TABLE `vw_clientes_membresias` DISABLE KEYS */;
/*!40000 ALTER TABLE `vw_clientes_membresias` ENABLE KEYS */;
UNLOCK TABLES;

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
 1 AS `id_modopago`*/;
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
-- Final view structure for view `vw_detalle_ventas`
--

/*!50001 DROP VIEW IF EXISTS `vw_detalle_ventas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_detalle_ventas` AS select `v`.`id` AS `id_venta`,`v`.`fecha` AS `fecha`,`u`.`nombre` AS `empleado`,`c`.`nombre` AS `cliente`,coalesce(`p`.`nombre`,`pl`.`nombre`) AS `articulo`,`dv`.`cantidad` AS `cantidad`,`dv`.`precio_unitario` AS `precio_unitario`,`dv`.`subtotal` AS `subtotal`,`v`.`total` AS `total`,`v`.`id_modopago` AS `id_modopago` from (((((`venta` `v` join `usuario` `u` on((`v`.`id_usuario` = `u`.`id`))) left join `cliente` `c` on((`v`.`id_cliente` = `c`.`id`))) join `detalle_venta` `dv` on((`v`.`id` = `dv`.`id_venta`))) left join `producto` `p` on((`dv`.`id_producto` = `p`.`id`))) left join `plan` `pl` on((`dv`.`id_plan` = `pl`.`id`))) */;
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
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
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
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
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
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_inventario_bajo` AS select `producto`.`id` AS `id`,`producto`.`nombre` AS `nombre`,`producto`.`categoria` AS `categoria`,`producto`.`stock` AS `stock`,`producto`.`estado` AS `estado` from `producto` where (cast(`producto`.`stock` as unsigned) <= 5) */;
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

-- Dump completed on 2026-11-08  2:29:36
