-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- VersiÃ³n del servidor:         8.0.17 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL VersiÃ³n:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para gympos
CREATE DATABASE IF NOT EXISTS `gympos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `gympos`;

-- Volcando estructura para tabla gympos.acceso
CREATE TABLE IF NOT EXISTS `acceso` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `fecha` varchar(255) DEFAULT NULL,
  `hora` varchar(255) DEFAULT NULL,
  `resultado` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `acceso_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.acceso: ~0 rows (aproximadamente)

-- Volcando estructura para tabla gympos.cliente
CREATE TABLE IF NOT EXISTS `cliente` (
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

-- Volcando datos para la tabla gympos.cliente: ~0 rows (aproximadamente)
INSERT INTO `cliente` (`id`, `nombre`, `telefono`, `contrasena`, `contacto_emergencia`, `telefono_emergencia`, `fecha_registro`, `estado`, `token_qr`) VALUES
	(1, 'Osva', '12312314', '123', '123143', '12314', NULL, '1', '1');

-- Volcando estructura para tabla gympos.compra
CREATE TABLE IF NOT EXISTS `compra` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.compra: ~0 rows (aproximadamente)

-- Volcando estructura para tabla gympos.corte_caja
CREATE TABLE IF NOT EXISTS `corte_caja` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `fecha_apertura` varchar(255) DEFAULT NULL,
  `fecha_cierre` varchar(255) DEFAULT NULL,
  `monto_inicial` decimal(10,2) NOT NULL,
  `total_ventas` varchar(255) DEFAULT NULL,
  `monto_calculado` varchar(255) DEFAULT NULL,
  `monto_real` varchar(255) DEFAULT NULL,
  `diferencia` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `corte_caja_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.corte_caja: ~0 rows (aproximadamente)

-- Volcando estructura para tabla gympos.detalle_compra
CREATE TABLE IF NOT EXISTS `detalle_compra` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.detalle_compra: ~0 rows (aproximadamente)

-- Volcando estructura para tabla gympos.detalle_venta
CREATE TABLE IF NOT EXISTS `detalle_venta` (
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.detalle_venta: ~0 rows (aproximadamente)
INSERT INTO `detalle_venta` (`id`, `id_venta`, `id_producto`, `id_plan`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
	(1, 1, 1, NULL, '1', '1250.00', '1250.00');

-- Volcando estructura para funciÃ³n gympos.fn_calcular_descuento
DELIMITER //
CREATE FUNCTION `fn_calcular_descuento`(
    p_precio DECIMAL(10,2),
    p_porcentaje DECIMAL(5,2)
) RETURNS decimal(10,2)
    NO SQL
    DETERMINISTIC
BEGIN
    IF p_precio < 0 OR p_porcentaje < 0 OR p_porcentaje > 100 THEN
        RETURN NULL;
    END IF;

    RETURN ROUND(p_precio * p_porcentaje / 100, 2);
END//
DELIMITER ;

-- Volcando estructura para funciÃ³n gympos.fn_calcular_subtotal_producto
DELIMITER //
CREATE FUNCTION `fn_calcular_subtotal_producto`(
    p_precio DECIMAL(10,2),
    p_cantidad INT
) RETURNS decimal(10,2)
    NO SQL
    DETERMINISTIC
BEGIN
    RETURN p_precio * p_cantidad;
END//
DELIMITER ;

-- Volcando estructura para funciÃ³n gympos.fn_calcular_total_venta
DELIMITER //
CREATE FUNCTION `fn_calcular_total_venta`(
    p_id_venta INT
) RETURNS decimal(10,2)
    READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);

    SELECT COALESCE(SUM(subtotal), 0)
    INTO v_total
    FROM detalle_venta
    WHERE id_venta = p_id_venta;

    RETURN v_total;
END//
DELIMITER ;

-- Volcando estructura para funciÃ³n gympos.fn_dias_restantes_membresia
DELIMITER //
CREATE FUNCTION `fn_dias_restantes_membresia`(
    p_fecha_vencimiento DATE
) RETURNS int(11)
    NO SQL
BEGIN
    RETURN DATEDIFF(p_fecha_vencimiento, CURDATE());
END//
DELIMITER ;

-- Volcando estructura para funciÃ³n gympos.fn_estado_membresia
DELIMITER //
CREATE FUNCTION `fn_estado_membresia`(
    p_fecha_inicio DATE,
    p_fecha_vencimiento DATE
) RETURNS varchar(20) CHARSET utf8mb4
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
END//
DELIMITER ;

-- Volcando estructura para tabla gympos.membresia
CREATE TABLE IF NOT EXISTS `membresia` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.membresia: ~0 rows (aproximadamente)

-- Volcando estructura para tabla gympos.plan
CREATE TABLE IF NOT EXISTS `plan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio` float DEFAULT NULL,
  `duracion_dias` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `stock` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.plan: ~0 rows (aproximadamente)

-- Volcando estructura para tabla gympos.producto
CREATE TABLE IF NOT EXISTS `producto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio` varchar(255) DEFAULT NULL,
  `stock` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.producto: ~0 rows (aproximadamente)
INSERT INTO `producto` (`id`, `nombre`, `descripcion`, `precio`, `stock`, `categoria`, `estado`) VALUES
	(1, 'Proteina de Limon', 'Limon con cajeta', '560', '2', 'Proteina', '1');

-- Volcando estructura para tabla gympos.proveedor
CREATE TABLE IF NOT EXISTS `proveedor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `nombre_empresa` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.proveedor: ~0 rows (aproximadamente)

-- Volcando estructura para tabla gympos.rol
CREATE TABLE IF NOT EXISTS `rol` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.rol: ~3 rows (aproximadamente)
INSERT INTO `rol` (`id`, `nombre`, `descripcion`) VALUES
	(1, 'Admin', 'Administrador control total'),
	(2, 'Empleado', 'Empleado'),
	(3, 'Inventario', 'Inventario');

-- Volcando estructura para procedimiento gympos.sp_generar_folio
DELIMITER //
CREATE PROCEDURE `sp_generar_folio`(OUT p_folio VARCHAR(40))
BEGIN
    SET p_folio = CONCAT(
        'V-',
        DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'),
        '-',
        UPPER(SUBSTRING(REPLACE(UUID(), '-', ''), 1, 6))
    );
END//
DELIMITER ;

-- Volcando estructura para procedimiento gympos.sp_registrar_acceso
DELIMITER //
CREATE PROCEDURE `sp_registrar_acceso`(
    IN p_id_cliente INT
)
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
END//
DELIMITER ;

-- Volcando estructura para procedimiento gympos.sp_registrar_compra_inventario
DELIMITER //
CREATE PROCEDURE `sp_registrar_compra_inventario`(
    IN p_id_usuario INT,
    IN p_id_proveedor INT,
    IN p_id_producto INT,
    IN p_cantidad INT,
    IN p_costo DECIMAL(10,2)
)
BEGIN
    DECLARE v_id_compra INT;
    DECLARE v_subtotal DECIMAL(10,2);

    IF p_cantidad <= 0 OR p_costo < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cantidad o costo no vÃ¡lido';
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
END//
DELIMITER ;

-- Volcando estructura para procedimiento gympos.sp_registrar_venta
DELIMITER //
CREATE PROCEDURE `sp_registrar_venta`(
    IN p_id_usuario INT,
    IN p_id_cliente INT,
    IN p_id_producto INT,
    IN p_cantidad INT,
    IN p_metodo_pago VARCHAR(30)
)
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
END//
DELIMITER ;

-- Volcando estructura para procedimiento gympos.sp_renovar_membresia
DELIMITER //
CREATE PROCEDURE `sp_renovar_membresia`(
    IN p_id_membresia INT
)
BEGIN
    DECLARE v_duracion INT;
    DECLARE v_fecha DATE;
    DECLARE v_nueva_vencimiento DATE;

    SELECT p.duracion_dias, m.fecha_vencimiento
    INTO v_duracion, v_fecha
    FROM membresia m
    INNER JOIN plan p ON m.id_plan = p.id
    WHERE m.id = p_id_membresia;

    SET v_nueva_vencimiento = DATE_ADD(
        GREATEST(v_fecha, CURDATE()),
        INTERVAL v_duracion DAY
    );

    UPDATE membresia
    SET fecha_inicio = CURDATE(),
        fecha_vencimiento = v_nueva_vencimiento,
        estado = 'activa'
    WHERE id = p_id_membresia;
END//
DELIMITER ;

-- Volcando estructura para tabla gympos.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.usuario: ~0 rows (aproximadamente)
INSERT INTO `usuario` (`id`, `id_rol`, `nombre`, `apellido`, `telefono`, `correo`, `contrasena`, `estado`) VALUES
	(1, 1, 'Fabian', 'Alvarez', '3481084814', 'fabi77@gmail.com', '123', '1');

-- Volcando estructura para tabla gympos.venta
CREATE TABLE IF NOT EXISTS `venta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `fecha` varchar(255) DEFAULT NULL,
  `total` varchar(255) DEFAULT NULL,
  `metodo_pago` varchar(255) DEFAULT NULL,
  `folio` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `folio` (`folio`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.venta: ~4 rows (aproximadamente)
INSERT INTO `venta` (`id`, `id_usuario`, `id_cliente`, `fecha`, `total`, `metodo_pago`, `folio`, `estado`) VALUES
	(1, 1, 1, '2026-10-31 19:30:00', '1250.00', 'Efectivo', 'V-20261031-ABC123', NULL),
	(6, 1, 1, '2026-10-31 19:30:00', '1250.00', 'Efectivo', 'V-20261031-ABC124', NULL),
	(8, 1, 1, '2026-10-31 19:30:00', '1250.00', 'Efectivo', 'V-20261031-ABC125', NULL),
	(10, 1, 1, '2026-10-31 19:30:00', '1250.00', 'Efectivo', 'V-20261031-ABC126', '1'),
	(11, 1, 1, '2026-10-31 19:30:00', '1250.00', 'Efectivo', 'V-20261031-ABC127', 'Completada');

-- Volcando estructura para vista gympos.vw_clientes_membresias
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vw_clientes_membresias` (
	`id_cliente` INT(11) NOT NULL,
	`cliente` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`telefono` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`fecha_registro` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`estado_cliente` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`id_membresia` INT(11) NULL,
	`plan` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`fecha_inicio` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`fecha_vencimiento` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`estado_membresia` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci'
) ENGINE=MyISAM;

-- Volcando estructura para vista gympos.vw_detalle_ventas
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vw_detalle_ventas` (
	`id_venta` INT(11) NOT NULL,
	`fecha` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`empleado` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`cliente` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`articulo` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`cantidad` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`precio_unitario` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`subtotal` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`total` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`metodo_pago` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci'
) ENGINE=MyISAM;

-- Volcando estructura para vista gympos.vw_estado_membresias
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vw_estado_membresias` (
	`id_cliente` INT(11) NOT NULL,
	`cliente` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`plan` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`fecha_inicio` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`fecha_vencimiento` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`estado` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`dias_restantes` INT(7) NULL
) ENGINE=MyISAM;

-- Volcando estructura para vista gympos.vw_historial_accesos
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vw_historial_accesos` (
	`id_acceso` INT(11) NOT NULL,
	`id_cliente` INT(11) NOT NULL,
	`cliente` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`fecha` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`hora` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`resultado` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci'
) ENGINE=MyISAM;

-- Volcando estructura para vista gympos.vw_inventario_bajo
-- Creando tabla temporal para superar errores de dependencia de VIEW
CREATE TABLE `vw_inventario_bajo` (
	`id` INT(11) NOT NULL,
	`nombre` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`categoria` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`stock` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`estado` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci'
) ENGINE=MyISAM;

-- Volcando estructura para disparador gympos.trg_descontar_stock
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_descontar_stock` AFTER INSERT ON `detalle_venta` FOR EACH ROW BEGIN
    IF NEW.id_producto IS NOT NULL THEN
        UPDATE producto
        SET stock = CAST(stock AS UNSIGNED) - NEW.cantidad
        WHERE id = NEW.id_producto;
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_restaurar_stock
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_restaurar_stock` AFTER DELETE ON `detalle_venta` FOR EACH ROW BEGIN
    IF OLD.id_producto IS NOT NULL THEN
        UPDATE producto
        SET stock = CAST(stock AS UNSIGNED) + OLD.cantidad
        WHERE id = OLD.id_producto;
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_validar_cliente
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_validar_cliente` BEFORE INSERT ON `venta` FOR EACH ROW BEGIN
    IF NEW.id_cliente IS NOT NULL
       AND NOT EXISTS (
           SELECT 1
           FROM cliente
           WHERE id = NEW.id_cliente
             AND estado = 1
       ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El cliente no existe o estÃ¡ inactivo';
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_validar_membresia
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_validar_membresia` BEFORE INSERT ON `membresia` FOR EACH ROW BEGIN
    IF NEW.fecha_vencimiento < NEW.fecha_inicio THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La fecha de vencimiento no puede ser anterior al inicio';
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_validar_stock_venta
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_validar_stock_venta` BEFORE INSERT ON `detalle_venta` FOR EACH ROW BEGIN
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
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vw_clientes_membresias`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_clientes_membresias` AS select `c`.`id` AS `id_cliente`,`c`.`nombre` AS `cliente`,`c`.`telefono` AS `telefono`,`c`.`fecha_registro` AS `fecha_registro`,`c`.`estado` AS `estado_cliente`,`m`.`id` AS `id_membresia`,`p`.`nombre` AS `plan`,`m`.`fecha_inicio` AS `fecha_inicio`,`m`.`fecha_vencimiento` AS `fecha_vencimiento`,`m`.`estado` AS `estado_membresia` from ((`cliente` `c` left join `membresia` `m` on((`c`.`id` = `m`.`id_cliente`))) left join `plan` `p` on((`m`.`id_plan` = `p`.`id`)))
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vw_detalle_ventas`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_detalle_ventas` AS select `v`.`id` AS `id_venta`,`v`.`fecha` AS `fecha`,`u`.`nombre` AS `empleado`,`c`.`nombre` AS `cliente`,coalesce(`p`.`nombre`,`pl`.`nombre`) AS `articulo`,`dv`.`cantidad` AS `cantidad`,`dv`.`precio_unitario` AS `precio_unitario`,`dv`.`subtotal` AS `subtotal`,`v`.`total` AS `total`,`v`.`metodo_pago` AS `metodo_pago` from (((((`venta` `v` join `usuario` `u` on((`v`.`id_usuario` = `u`.`id`))) left join `cliente` `c` on((`v`.`id_cliente` = `c`.`id`))) join `detalle_venta` `dv` on((`v`.`id` = `dv`.`id_venta`))) left join `producto` `p` on((`dv`.`id_producto` = `p`.`id`))) left join `plan` `pl` on((`dv`.`id_plan` = `pl`.`id`)))
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vw_estado_membresias`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_estado_membresias` AS select `c`.`id` AS `id_cliente`,`c`.`nombre` AS `cliente`,`p`.`nombre` AS `plan`,`m`.`fecha_inicio` AS `fecha_inicio`,`m`.`fecha_vencimiento` AS `fecha_vencimiento`,`m`.`estado` AS `estado`,(to_days(`m`.`fecha_vencimiento`) - to_days(curdate())) AS `dias_restantes` from ((`membresia` `m` join `cliente` `c` on((`m`.`id_cliente` = `c`.`id`))) join `plan` `p` on((`m`.`id_plan` = `p`.`id`)))
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vw_historial_accesos`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_historial_accesos` AS select `a`.`id` AS `id_acceso`,`c`.`id` AS `id_cliente`,`c`.`nombre` AS `cliente`,`a`.`fecha` AS `fecha`,`a`.`hora` AS `hora`,`a`.`resultado` AS `resultado` from (`acceso` `a` join `cliente` `c` on((`a`.`id_cliente` = `c`.`id`)))
;

-- Eliminando tabla temporal y crear estructura final de VIEW
DROP TABLE IF EXISTS `vw_inventario_bajo`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_inventario_bajo` AS select `producto`.`id` AS `id`,`producto`.`nombre` AS `nombre`,`producto`.`categoria` AS `categoria`,`producto`.`stock` AS `stock`,`producto`.`estado` AS `estado` from `producto` where (cast(`producto`.`stock` as unsigned) <= 5)
;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
