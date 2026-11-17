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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.acceso: ~18 rows (aproximadamente)
INSERT INTO `acceso` (`id`, `id_cliente`, `fecha`, `hora`, `resultado`) VALUES
	(1, 1, '2026-10-21', '21:48:35', 'Rechazado'),
	(2, 2, '2026-11-06', '13:07:53', 'Permitido'),
	(3, 1, '2026-11-06', '13:08:18', 'Rechazado'),
	(4, 4, '2026-11-06', '14:46:38', 'Permitido'),
	(5, 1, '2026-11-06', '14:47:17', 'Rechazado'),
	(6, 2, '2026-11-06', '14:48:03', 'Permitido'),
	(7, 2, '2026-11-06', '14:52:10', 'Permitido'),
	(8, 2, '2026-11-06', '14:53:54', 'Permitido'),
	(9, 2, '2026-11-06', '14:57:45', 'Permitido'),
	(10, 5, '2026-11-06', '15:46:24', 'Permitido'),
	(11, 5, '2026-11-06', '15:46:37', 'Permitido'),
	(12, 6, '2026-11-06', '19:27:47', 'Permitido'),
	(13, 6, '2026-11-06', '19:28:14', 'Permitido'),
	(14, 1, '2026-11-08', '01:19:50', 'Rechazado'),
	(15, 2, '2026-11-08', '01:19:50', 'Permitido'),
	(16, 1, '2026-11-08', '01:29:48', 'Permitido'),
	(17, 1, '2026-11-08', '01:30:09', 'Rechazado'),
	(19, 1, '2026-11-14', '12:21:06', 'Permitido');

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
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.cliente: ~5 rows (aproximadamente)
INSERT INTO `cliente` (`id`, `nombre`, `telefono`, `contrasena`, `contacto_emergencia`, `telefono_emergencia`, `fecha_registro`, `estado`, `token_qr`) VALUES
	(1, 'Andy Qlon', '3471084574', '20704', 'AMA', '348020704', '2026-11-02', '1', 'GYM-QR-9299-6925'),
	(2, 'Osvaldivo jeje', '3471012962', '050705', 'SeÃ±ora Padilla', '3471012588', '2026-10-31', '1', 'GYM-QR-9179-QKCT5H'),
	(4, 'NiÃ±o', '45629849034', 'ajna', 'ghishoigio', '35356076307', '2026-11-01', '1', 'GYM-QR-5714-CT4EWW'),
	(5, 'guero', '3481516939', '123456789', 'osva', '3471012906', '2026-11-06', '1', 'GYM-QR-9477-4FPIVJ'),
	(6, 'Nancy Gutierrez Pedr', '3471120413', '120417', 'Arnulfo Padilla Padi', '3471012733', '2026-11-06', '1', 'GYM-QR-5817-YTBABQ');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.compra: ~2 rows (aproximadamente)
INSERT INTO `compra` (`id`, `id_usuario`, `id_proveedor`, `fecha`, `total`, `estado`) VALUES
	(1, 1, 1, '2026-11-05 20:01:41', '410', 'Completada'),
	(2, 1, 1, '2026-11-06 18:09:24', '30', 'Completada');

-- Volcando estructura para tabla gympos.corte_caja
CREATE TABLE IF NOT EXISTS `corte_caja` (
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.corte_caja: ~2 rows (aproximadamente)
INSERT INTO `corte_caja` (`id`, `id_usuario`, `fecha_apertura`, `fecha_cierre`, `monto_inicial`, `total_ventas`, `monto_calculado`, `monto_real`, `diferencia`, `total_gastos`, `tarjeta`, `efectivo`) VALUES
	(1, 1, '2026-10-31 03:49:56', '2026-10-30 21:50:58', 500.00, '0.000000', '500.000000', '500.000000', '0.000000', NULL, NULL, NULL),
	(4, 1, '2026-11-06 21:35:37', '2026-11-06 21:37:03', 500.00, '866.35', '1366.35', '970.00', '-396.35', NULL, NULL, NULL),
	(5, 1, '2026-11-11 04:08:09', '2026-11-11 04:10:04', 500.00, '0.00', '500.00', '500.00', '0.00', NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.detalle_compra: ~2 rows (aproximadamente)
INSERT INTO `detalle_compra` (`id`, `id_compra`, `id_producto`, `cantidad`, `costo_unitario`, `subtotal`) VALUES
	(1, 1, 13, '10', '41', '410'),
	(2, 2, 2, '1', '30', '30');

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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.detalle_venta: ~9 rows (aproximadamente)
INSERT INTO `detalle_venta` (`id`, `id_venta`, `id_producto`, `id_plan`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
	(5, 7, NULL, 2, '1', '350', '350'),
	(6, 8, NULL, 5, '1', '30', '30'),
	(7, 8, NULL, 5, '1', '30', '30'),
	(8, 8, NULL, 5, '1', '30', '30'),
	(9, 8, NULL, 5, '1', '30', '30'),
	(10, 9, 13, NULL, '5', '67.67', '338.35'),
	(11, 9, 15, NULL, '1', '15', '15'),
	(12, 9, 16, NULL, '1', '43', '43'),
	(13, 10, NULL, 1, '1', '150', '150'),
	(19, 99904, 1, NULL, '1', '1250', '1250'),
	(20, 99905, 1, NULL, '1', '1250', '1250');

-- Volcando estructura para tabla gympos.ejercicio
CREATE TABLE IF NOT EXISTS `ejercicio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_rutina` int(11) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `series` varchar(255) DEFAULT NULL,
  `repeticiones` varchar(255) DEFAULT NULL,
  `orden` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ejercicio_fk1` (`id_rutina`),
  CONSTRAINT `ejercicio_fk1` FOREIGN KEY (`id_rutina`) REFERENCES `rutina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.ejercicio: ~0 rows (aproximadamente)

-- Volcando estructura para funciÃ³n gympos.fn_calcular_descuento
DELIMITER //
CREATE FUNCTION `fn_calcular_descuento`(`p_precio` DECIMAL(10,2), `p_porcentaje` DECIMAL(5,2)) RETURNS decimal(10,2)
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
CREATE FUNCTION `fn_calcular_subtotal_producto`(`p_precio` DECIMAL(10,2), `p_cantidad` INT) RETURNS decimal(10,2)
    NO SQL
    DETERMINISTIC
BEGIN

    RETURN p_precio * p_cantidad;

END//
DELIMITER ;

-- Volcando estructura para funciÃ³n gympos.fn_calcular_total_venta
DELIMITER //
CREATE FUNCTION `fn_calcular_total_venta`(`p_id_venta` INT) RETURNS decimal(10,2)
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
CREATE FUNCTION `fn_dias_restantes_membresia`(`p_fecha_vencimiento` DATE) RETURNS int(11)
    NO SQL
BEGIN

    RETURN DATEDIFF(p_fecha_vencimiento, CURDATE());

END//
DELIMITER ;

-- Volcando estructura para funciÃ³n gympos.fn_estado_membresia
DELIMITER //
CREATE FUNCTION `fn_estado_membresia`(`p_fecha_inicio` DATE, `p_fecha_vencimiento` DATE) RETURNS varchar(20) CHARSET utf8mb4
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.membresia: ~5 rows (aproximadamente)
INSERT INTO `membresia` (`id`, `id_cliente`, `id_plan`, `fecha_inicio`, `fecha_vencimiento`, `estado`) VALUES
	(2, 1, 1, '2026-11-08', '2026-11-15', 'activa'),
	(3, 2, 2, '2026-11-05', '2026-12-05', 'activa'),
	(5, 4, 2, '2026-11-06', '2026-12-11', 'activa'),
	(7, 5, 5, '2026-11-06', '2026-11-13', 'activa'),
	(8, 6, 1, '2026-11-06', '2026-11-13', 'activa');

-- Volcando estructura para tabla gympos.modo_pago
CREATE TABLE IF NOT EXISTS `modo_pago` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.modo_pago: ~2 rows (aproximadamente)
INSERT INTO `modo_pago` (`id`, `nombre`) VALUES
	(1, 'Efectivo'),
	(2, 'Tarjeta');

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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.plan: ~5 rows (aproximadamente)
INSERT INTO `plan` (`id`, `nombre`, `descripcion`, `precio`, `duracion_dias`, `estado`, `categoria`, `stock`) VALUES
	(1, 'Semanal', 'Acceso total durante 7 dÃ­as continuos al Ã¡rea de pesas y cardio.', 150, '7', 'Activo', NULL, NULL),
	(2, 'Mensual', 'Acceso ilimitado por 1 mes (30 dÃ­as). El plan mÃ¡s solicitado.', 350, '30', 'Activo', NULL, NULL),
	(3, 'Anual', 'MembresÃ­a anual completa. Solo  MXN al mes. MÃ¡ximo ahorro.', 2100, '365', 'Activo', NULL, NULL),
	(4, 'Estudiantil', 'Tarifa preferencial de $200 MXN/mes con credencial de estudiante vigente.', 200, '30', 'Activo', NULL, NULL),
	(5, 'Invitado', 'Pase temporal de cortesÃ­a o prueba por 24 horas para acceso a torniquetes.', 30, '1', 'Activo', NULL, NULL);

-- Volcando estructura para tabla gympos.producto
CREATE TABLE IF NOT EXISTS `producto` (
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

-- Volcando datos para la tabla gympos.producto: ~10 rows (aproximadamente)
INSERT INTO `producto` (`id`, `nombre`, `descripcion`, `precio`, `stock`, `stock_minimo`, `estado`, `categoria`) VALUES
	(1, 'ProteÃ­na Whey Isolate', '2kg Vainilla Gold Standard', '1250', '26', 5, '1', 'Suplementos'),
	(2, 'Creatina Monohidratada', 'Creapure 300g Micronizada', '550', '5', 6, 'Activo', 'Suplementos'),
	(3, 'Bebida EnergÃ©tica Pre-Workout', 'Lata 473ml Sabor Blue Berry', '65', '35', 10, 'Activo', 'Bebidas'),
	(4, 'Correas de Levantamiento (Straps)', 'AlgodÃ³n reforzado antideslizante', '220', '11', 3, 'Activo', 'Accesorios'),
	(5, 'Shaker Mezclador 700ml', 'Vaso con bola mezcladora de acero', '140', '2', 5, '1', 'Accesorios'),
	(13, 'Fabi coito', 'Te va a dar un follada express con influencia y SIDA', '67.67', '76', 0, '1', 'Snacks'),
	(14, 'Awita', 'awita', '10', '500', 0, '1', 'Bebidas'),
	(15, 'leche', 'es leche', '15', '9', 0, '1', 'Suplementos'),
	(16, 'chocho', 'hola te voy a chochar', '43', '99', 0, '1', 'Suplementos'),
	(17, 'tacos de sal', 'tacos de sal', '67', '3', 0, '0', 'Snacks');

-- Volcando estructura para tabla gympos.proveedor
CREATE TABLE IF NOT EXISTS `proveedor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_empresa` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.proveedor: ~0 rows (aproximadamente)
INSERT INTO `proveedor` (`id`, `nombre_empresa`, `telefono`, `correo`, `estado`, `nombre`) VALUES
	(1, 'Tacos lira|', '3471015956', 'osva@gmail.com', '1', 'Osvaldo');

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

-- Volcando estructura para tabla gympos.rutina
CREATE TABLE IF NOT EXISTS `rutina` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `dia_semana` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rutina_fk1` (`id_cliente`),
  CONSTRAINT `rutina_fk1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.rutina: ~0 rows (aproximadamente)

-- Volcando estructura para procedimiento gympos.sp_generar_folio
DELIMITER //
CREATE PROCEDURE `sp_generar_folio`(OUT `p_folio` VARCHAR(40))
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
CREATE PROCEDURE `sp_registrar_acceso`(IN `p_id_cliente` INT)
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
CREATE PROCEDURE `sp_registrar_compra_inventario`(IN `p_id_usuario` INT, IN `p_id_proveedor` INT, IN `p_id_producto` INT, IN `p_cantidad` INT, IN `p_costo` DECIMAL(10,2))
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
CREATE PROCEDURE `sp_registrar_venta`(IN `p_id_usuario` INT, IN `p_id_cliente` INT, IN `p_id_producto` INT, IN `p_cantidad` INT, IN `p_metodo_pago` VARCHAR(30))
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
CREATE PROCEDURE `sp_renovar_membresia`(IN `p_id_membresia` INT)
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.usuario: ~5 rows (aproximadamente)
INSERT INTO `usuario` (`id`, `id_rol`, `nombre`, `apellido`, `telefono`, `correo`, `contrasena`, `estado`) VALUES
	(1, 1, 'Fabian', 'Alvarez', '3481084815', 'fabi77@gmail.com', '123', '1'),
	(2, 1, 'Osvaldo', 'Padilla', '3471012962', 'osvaldivo60@gmail.com', '050705', '1'),
	(3, 2, 'Ismael', 'De anda', '3471021512', 'Cr7@gmail.com', '7', '0'),
	(4, 2, 'Andy', 'Qlon', '34854747512', 'Qlito@gmail.com', '123456', '1'),
	(5, 2, 'farmeador de aura', 'aura farmer', '67676767676', 'farmersixsevenbro@gmail.com', '6767', '1');

-- Volcando estructura para tabla gympos.venta
CREATE TABLE IF NOT EXISTS `venta` (
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
) ENGINE=InnoDB AUTO_INCREMENT=99906 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla gympos.venta: ~6 rows (aproximadamente)
INSERT INTO `venta` (`id`, `id_usuario`, `id_cliente`, `id_modopago`, `fecha`, `total`, `folio`, `estado`, `metodo_pago`) VALUES
	(7, 1, 4, 1, '2026-11-06 12:37:02', '350', 'V-20261106123702-A2F23E', 'Completada', NULL),
	(8, 1, 5, 1, '2026-11-06 15:32:21', '120', 'V-20261106153221-C4FACF', 'Completada', NULL),
	(9, 1, 5, 2, '2026-11-06 15:33:14', '396.35', 'V-20261106153314-05DBAE', 'Completada', NULL),
	(10, 1, 6, 1, '2026-11-06 19:24:33', '150', 'V-20261106192433-74D561', 'Completada', NULL),
	(99904, 1, NULL, 1, '2026-11-10 22:05:52', '1250', 'V-20261110220552-186DAB', 'Completada', NULL),
	(99905, 1, NULL, 1, '2026-11-10 22:08:36', '1250', 'V-20261110220836-994C8D', 'Completada', NULL);

-- Volcando estructura para tabla gympos.vw_clientes_membresias
CREATE TABLE IF NOT EXISTS `vw_clientes_membresias` (
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

-- Volcando datos para la tabla gympos.vw_clientes_membresias: 0 rows
/*!40000 ALTER TABLE `vw_clientes_membresias` DISABLE KEYS */;
/*!40000 ALTER TABLE `vw_clientes_membresias` ENABLE KEYS */;

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
	`id_modopago` INT(11) NULL
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

-- Volcando estructura para disparador gympos.trg_ajustar_stock_compra_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `trg_ajustar_stock_compra_update` AFTER UPDATE ON `detalle_compra` FOR EACH ROW BEGIN

    UPDATE producto

    SET stock = CAST(stock AS UNSIGNED) - (OLD.cantidad - NEW.cantidad)

    WHERE id = NEW.id_producto;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_decrementar_stock_compra
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `trg_decrementar_stock_compra` AFTER DELETE ON `detalle_compra` FOR EACH ROW BEGIN

    UPDATE producto

    SET stock = CAST(stock AS UNSIGNED) - OLD.cantidad

    WHERE id = OLD.id_producto;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_descontar_stock
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
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

-- Volcando estructura para disparador gympos.trg_generar_membresia_venta
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_generar_membresia_venta` AFTER INSERT ON `detalle_venta` FOR EACH ROW BEGIN
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
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_incrementar_stock_compra
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `trg_incrementar_stock_compra` AFTER INSERT ON `detalle_compra` FOR EACH ROW BEGIN

    UPDATE producto

    SET stock = CAST(stock AS UNSIGNED) + NEW.cantidad

    WHERE id = NEW.id_producto;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_restaurar_stock
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
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

-- Volcando estructura para disparador gympos.trg_sync_id_modopago
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_sync_id_modopago` BEFORE INSERT ON `venta` FOR EACH ROW SET NEW.id_modopago = IF(NEW.id_modopago IS NOT NULL, NEW.id_modopago, IF(LOWER(IFNULL(NEW.metodo_pago, '')) LIKE '%tarjeta%', 2, 1))//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_sync_plan_a_producto_delete
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `trg_sync_plan_a_producto_delete` AFTER DELETE ON `plan` FOR EACH ROW BEGIN

    IF (OLD.categoria IS NOT NULL OR OLD.stock IS NOT NULL) THEN

        DELETE FROM producto WHERE id = OLD.id;

    END IF;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_sync_plan_a_producto_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `trg_sync_plan_a_producto_insert` AFTER INSERT ON `plan` FOR EACH ROW BEGIN

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

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_sync_plan_a_producto_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `trg_sync_plan_a_producto_update` AFTER UPDATE ON `plan` FOR EACH ROW BEGIN

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

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_validar_cliente_venta
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='';
DELIMITER //
CREATE TRIGGER `trg_validar_cliente_venta` BEFORE INSERT ON `venta` FOR EACH ROW BEGIN

    IF NEW.id_cliente IS NOT NULL

       AND NOT EXISTS (

           SELECT 1

           FROM cliente

           WHERE id = NEW.id_cliente

             AND (estado = '1' OR estado = 1 OR LOWER(estado) = 'activo')

       ) THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'El cliente no existe o estÃ¡ inactivo';

    END IF;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_validar_detalle_compra
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `trg_validar_detalle_compra` BEFORE INSERT ON `detalle_compra` FOR EACH ROW BEGIN

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

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_validar_membresia
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER `trg_validar_membresia` BEFORE INSERT ON `membresia` FOR EACH ROW BEGIN

    DECLARE v_cliente_existe INT;

    DECLARE v_plan_existe INT;

    DECLARE v_membresia_duplicada INT;

    

    -- Validar que el cliente exista y estÃ© activo

    SELECT COUNT(*)

    INTO v_cliente_existe

    FROM cliente

    WHERE id = NEW.id_cliente 

    AND (estado = '1' OR estado = 1 OR LOWER(estado) = 'activo');

    

    IF v_cliente_existe = 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'El cliente no existe o estÃ¡ inactivo';

    END IF;

    

    -- Validar que el plan exista y estÃ© activo

    SELECT COUNT(*)

    INTO v_plan_existe

    FROM plan

    WHERE id = NEW.id_plan 

    AND (estado = 'activo' OR estado = 'Activo');

    

    IF v_plan_existe = 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'El plan no existe o estÃ¡ inactivo';

    END IF;

    

    -- Validar que la fecha de vencimiento no sea anterior al inicio

    IF NEW.fecha_vencimiento < NEW.fecha_inicio THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'La fecha de vencimiento no puede ser anterior al inicio';

    END IF;

    

    -- Validar que no haya una membresÃ­a activa duplicada para el mismo cliente

    SELECT COUNT(*)

    INTO v_membresia_duplicada

    FROM membresia

    WHERE id_cliente = NEW.id_cliente

    AND id_plan = NEW.id_plan

    AND estado = 'activa'

    AND fecha_inicio = NEW.fecha_inicio;

    

    IF v_membresia_duplicada > 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT = 'Ya existe una membresÃ­a activa con el mismo plan y fecha de inicio';

    END IF;

END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Volcando estructura para disparador gympos.trg_validar_stock_venta
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
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
DROP TABLE IF EXISTS `vw_detalle_ventas`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `vw_detalle_ventas` AS select `v`.`id` AS `id_venta`,`v`.`fecha` AS `fecha`,`u`.`nombre` AS `empleado`,`c`.`nombre` AS `cliente`,coalesce(`p`.`nombre`,`pl`.`nombre`) AS `articulo`,`dv`.`cantidad` AS `cantidad`,`dv`.`precio_unitario` AS `precio_unitario`,`dv`.`subtotal` AS `subtotal`,`v`.`total` AS `total`,`v`.`id_modopago` AS `id_modopago` from (((((`venta` `v` join `usuario` `u` on((`v`.`id_usuario` = `u`.`id`))) left join `cliente` `c` on((`v`.`id_cliente` = `c`.`id`))) join `detalle_venta` `dv` on((`v`.`id` = `dv`.`id_venta`))) left join `producto` `p` on((`dv`.`id_producto` = `p`.`id`))) left join `plan` `pl` on((`dv`.`id_plan` = `pl`.`id`)))
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
