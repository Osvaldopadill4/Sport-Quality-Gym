-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 21-10-2026 a las 04:28:18
-- Versión del servidor: 8.0.17
-- Versión de PHP: 7.3.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gympos`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_generar_folio` (OUT `p_folio` VARCHAR(40))  BEGIN
    SET p_folio = CONCAT(
        'V-',
        DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'),
        '-',
        UPPER(SUBSTRING(REPLACE(UUID(), '-', ''), 1, 6))
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_acceso` (IN `p_id_cliente` INT)  BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_compra_inventario` (IN `p_id_usuario` INT, IN `p_id_proveedor` INT, IN `p_id_producto` INT, IN `p_cantidad` INT, IN `p_costo` DECIMAL(10,2))  BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_venta` (IN `p_id_usuario` INT, IN `p_id_cliente` INT, IN `p_id_producto` INT, IN `p_cantidad` INT, IN `p_metodo_pago` VARCHAR(30))  BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_renovar_membresia` (IN `p_id_membresia` INT)  BEGIN
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
END$$

--
-- Funciones
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_descuento` (`p_precio` DECIMAL(10,2), `p_porcentaje` DECIMAL(5,2)) RETURNS DECIMAL(10,2) NO SQL
    DETERMINISTIC
BEGIN
    IF p_precio < 0 OR p_porcentaje < 0 OR p_porcentaje > 100 THEN
        RETURN NULL;
    END IF;

    RETURN ROUND(p_precio * p_porcentaje / 100, 2);
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_subtotal_producto` (`p_precio` DECIMAL(10,2), `p_cantidad` INT) RETURNS DECIMAL(10,2) NO SQL
    DETERMINISTIC
BEGIN
    RETURN p_precio * p_cantidad;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_total_venta` (`p_id_venta` INT) RETURNS DECIMAL(10,2) READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);

    SELECT COALESCE(SUM(subtotal), 0)
    INTO v_total
    FROM detalle_venta
    WHERE id_venta = p_id_venta;

    RETURN v_total;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_dias_restantes_membresia` (`p_fecha_vencimiento` DATE) RETURNS INT(11) NO SQL
BEGIN
    RETURN DATEDIFF(p_fecha_vencimiento, CURDATE());
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `fn_estado_membresia` (`p_fecha_inicio` DATE, `p_fecha_vencimiento` DATE) RETURNS VARCHAR(20) CHARSET utf8mb4 NO SQL
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
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `acceso`
--

CREATE TABLE `acceso` (
  `id` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `resultado` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `contrasena` int(50) NOT NULL,
  `contacto_emergencia` varchar(255) DEFAULT NULL,
  `telefono_emergencia` varchar(15) DEFAULT NULL,
  `fecha_registro` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `token_qr` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id`, `nombre`, `telefono`, `contrasena`, `contacto_emergencia`, `telefono_emergencia`, `fecha_registro`, `estado`, `token_qr`) VALUES
(1, 'Andy Qlon', '3471084574', 20704, 'AMA', '348020704', '1998', '1', 'GYM-QR-9299-6925');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra`
--

CREATE TABLE `compra` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `corte_caja`
--

CREATE TABLE `corte_caja` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_apertura` datetime NOT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `monto_inicial` decimal(10,2) NOT NULL,
  `total_ventas` decimal(10,2) DEFAULT NULL,
  `monto_calculado` decimal(10,2) DEFAULT NULL,
  `monto_real` decimal(10,2) DEFAULT NULL,
  `diferencia` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_compra`
--

CREATE TABLE `detalle_compra` (
  `id` int(11) NOT NULL,
  `id_compra` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id` int(11) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_plan` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Disparadores `detalle_venta`
--
DELIMITER $$
CREATE TRIGGER `trg_descontar_stock` AFTER INSERT ON `detalle_venta` FOR EACH ROW BEGIN
    IF NEW.id_producto IS NOT NULL THEN
        UPDATE producto
        SET stock = CAST(stock AS UNSIGNED) - NEW.cantidad
        WHERE id = NEW.id_producto;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_restaurar_stock` AFTER DELETE ON `detalle_venta` FOR EACH ROW BEGIN
    IF OLD.id_producto IS NOT NULL THEN
        UPDATE producto
        SET stock = CAST(stock AS UNSIGNED) + OLD.cantidad
        WHERE id = OLD.id_producto;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `membresia`
--

CREATE TABLE `membresia` (
  `id` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_plan` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Disparadores `membresia`
--
DELIMITER $$
CREATE TRIGGER `trg_validar_membresia` BEFORE INSERT ON `membresia` FOR EACH ROW BEGIN
    IF NEW.fecha_vencimiento < NEW.fecha_inicio THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La fecha de vencimiento no puede ser anterior al inicio';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plan`
--

CREATE TABLE `plan` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio` varchar(255) DEFAULT NULL,
  `duracion_dias` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio` varchar(255) DEFAULT NULL,
  `stock` varchar(255) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT '0',
  `estado` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `id` int(11) NOT NULL,
  `nombre_empresa` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Admin', 'Administrador control total'),
(2, 'Empleado', 'Empleado'),
(3, 'Inventario', 'Inventario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `apellido` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `contrasena` varchar(255) NOT NULL,
  `estado` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `id_rol`, `nombre`, `apellido`, `telefono`, `correo`, `contrasena`, `estado`) VALUES
(1, 1, 'Fabian', 'Alvarez', '3481084815', 'fabi77@gmail.com', '123', '1'),
(2, 1, 'Osvaldo', 'Padilla', '3471012962', 'osvaldivo60@gmail.com', '050705', '1'),
(3, 2, 'Ismael', 'De anda', '3471021512', 'Cr7@gmail.com', '070707', '1'),
(4, 2, 'Andy', 'Qlon', '34854747512', 'Qlito@gmail.com', '123456', '1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Disparadores `venta`
--
DELIMITER $$
CREATE TRIGGER `trg_validar_cliente` BEFORE INSERT ON `venta` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_clientes_membresias`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_clientes_membresias` (
`cliente` varchar(255)
,`estado_cliente` varchar(255)
,`estado_membresia` varchar(20)
,`fecha_inicio` date
,`fecha_registro` varchar(255)
,`fecha_vencimiento` date
,`id_cliente` int(11)
,`id_membresia` int(11)
,`plan` varchar(255)
,`telefono` varchar(255)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_detalle_ventas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_detalle_ventas` (
`articulo` varchar(255)
,`cantidad` int(11)
,`cliente` varchar(255)
,`empleado` varchar(255)
,`fecha` datetime
,`id_venta` int(11)
,`metodo_pago` varchar(30)
,`precio_unitario` decimal(10,2)
,`subtotal` decimal(10,2)
,`total` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_estado_membresias`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_estado_membresias` (
`cliente` varchar(255)
,`dias_restantes` int(7)
,`estado` varchar(20)
,`fecha_inicio` date
,`fecha_vencimiento` date
,`id_cliente` int(11)
,`plan` varchar(255)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_historial_accesos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_historial_accesos` (
`cliente` varchar(255)
,`fecha` date
,`hora` time
,`id_acceso` int(11)
,`id_cliente` int(11)
,`resultado` varchar(20)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_inventario_bajo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_inventario_bajo` (
`id` int(11)
,`nombre` varchar(255)
,`categoria` varchar(255)
,`stock` int(11)
,`stock_minimo` int(11)
,`estado` varchar(255)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_clientes_membresias`
--
DROP TABLE IF EXISTS `vw_clientes_membresias`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_clientes_membresias`  AS  select `c`.`id` AS `id_cliente`,`c`.`nombre` AS `cliente`,`c`.`telefono` AS `telefono`,`c`.`fecha_registro` AS `fecha_registro`,`c`.`estado` AS `estado_cliente`,`m`.`id` AS `id_membresia`,`p`.`nombre` AS `plan`,`m`.`fecha_inicio` AS `fecha_inicio`,`m`.`fecha_vencimiento` AS `fecha_vencimiento`,`m`.`estado` AS `estado_membresia` from ((`cliente` `c` left join `membresia` `m` on((`c`.`id` = `m`.`id_cliente`))) left join `plan` `p` on((`m`.`id_plan` = `p`.`id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_detalle_ventas`
--
DROP TABLE IF EXISTS `vw_detalle_ventas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_detalle_ventas`  AS  select `v`.`id` AS `id_venta`,`v`.`fecha` AS `fecha`,`u`.`nombre` AS `empleado`,`c`.`nombre` AS `cliente`,coalesce(`p`.`nombre`,`pl`.`nombre`) AS `articulo`,`dv`.`cantidad` AS `cantidad`,`dv`.`precio_unitario` AS `precio_unitario`,`dv`.`subtotal` AS `subtotal`,`v`.`total` AS `total`,`v`.`metodo_pago` AS `metodo_pago` from (((((`venta` `v` join `usuario` `u` on((`v`.`id_usuario` = `u`.`id`))) left join `cliente` `c` on((`v`.`id_cliente` = `c`.`id`))) join `detalle_venta` `dv` on((`v`.`id` = `dv`.`id_venta`))) left join `producto` `p` on((`dv`.`id_producto` = `p`.`id`))) left join `plan` `pl` on((`dv`.`id_plan` = `pl`.`id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_estado_membresias`
--
DROP TABLE IF EXISTS `vw_estado_membresias`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_estado_membresias`  AS  select `c`.`id` AS `id_cliente`,`c`.`nombre` AS `cliente`,`p`.`nombre` AS `plan`,`m`.`fecha_inicio` AS `fecha_inicio`,`m`.`fecha_vencimiento` AS `fecha_vencimiento`,`m`.`estado` AS `estado`,(to_days(`m`.`fecha_vencimiento`) - to_days(curdate())) AS `dias_restantes` from ((`membresia` `m` join `cliente` `c` on((`m`.`id_cliente` = `c`.`id`))) join `plan` `p` on((`m`.`id_plan` = `p`.`id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_historial_accesos`
--
DROP TABLE IF EXISTS `vw_historial_accesos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_historial_accesos`  AS  select `a`.`id` AS `id_acceso`,`c`.`id` AS `id_cliente`,`c`.`nombre` AS `cliente`,`a`.`fecha` AS `fecha`,`a`.`hora` AS `hora`,`a`.`resultado` AS `resultado` from (`acceso` `a` join `cliente` `c` on((`a`.`id_cliente` = `c`.`id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_inventario_bajo`
--
DROP TABLE IF EXISTS `vw_inventario_bajo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_inventario_bajo`  AS  select `p`.`id` AS `id`,`p`.`nombre` AS `nombre`,`p`.`categoria` AS `categoria`,cast(`p`.`stock` as unsigned) AS `stock`,`p`.`stock_minimo` AS `stock_minimo`,`p`.`estado` AS `estado` from `producto` `p` where ((cast(`p`.`stock` as unsigned) <= `p`.`stock_minimo`) or (cast(`p`.`stock` as unsigned) <= 5)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `acceso`
--
ALTER TABLE `acceso`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_cliente` (`id_cliente`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `compra`
--
ALTER TABLE `compra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_proveedor` (`id_proveedor`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `corte_caja`
--
ALTER TABLE `corte_caja`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `detalle_compra`
--
ALTER TABLE `detalle_compra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_compra` (`id_compra`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_venta` (`id_venta`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `id_plan` (`id_plan`);

--
-- Indices de la tabla `membresia`
--
ALTER TABLE `membresia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_plan` (`id_plan`);

--
-- Indices de la tabla `plan`
--
ALTER TABLE `plan`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_rol` (`id_rol`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `acceso`
--
ALTER TABLE `acceso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `compra`
--
ALTER TABLE `compra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `corte_caja`
--
ALTER TABLE `corte_caja`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_compra`
--
ALTER TABLE `detalle_compra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `membresia`
--
ALTER TABLE `membresia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plan`
--
ALTER TABLE `plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `acceso`
--
ALTER TABLE `acceso`
  ADD CONSTRAINT `acceso_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`);

--
-- Filtros para la tabla `compra`
--
ALTER TABLE `compra`
  ADD CONSTRAINT `compra_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id`),
  ADD CONSTRAINT `compra_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `corte_caja`
--
ALTER TABLE `corte_caja`
  ADD CONSTRAINT `corte_caja_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `detalle_compra`
--
ALTER TABLE `detalle_compra`
  ADD CONSTRAINT `detalle_compra_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id`),
  ADD CONSTRAINT `detalle_compra_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id`);

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `venta` (`id`),
  ADD CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id`),
  ADD CONSTRAINT `detalle_venta_ibfk_3` FOREIGN KEY (`id_plan`) REFERENCES `plan` (`id`);

--
-- Filtros para la tabla `membresia`
--
ALTER TABLE `membresia`
  ADD CONSTRAINT `membresia_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `membresia_ibfk_2` FOREIGN KEY (`id_plan`) REFERENCES `plan` (`id`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id`);

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id`),
  ADD CONSTRAINT `venta_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
