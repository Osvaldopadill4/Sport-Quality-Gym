/**
 * Integración centralizada de los Objetos de Base de Datos de `gympos.sql`:
 * - 3 Funciones SQL (`fn_dias_restantes`, `fn_membresia_activa`, `fn_total_gastado_cliente`) + auxiliares
 * - 5 Procedimientos Almacenados (`sp_registrar_acceso`, `sp_renovar_membresia`, `sp_ventas_por_fecha`, `sp_corte_caja_diario`, `sp_productos_mas_vendidos`) + folio
 * - 4 Triggers (`trg_actualizar_stock_venta`, `trg_aumentar_stock_compra`, `trg_evitar_stock_negativo`, `trg_estado_membresia`)
 * - 5 Vistas SQL (`vw_clientes_membresias`, `vw_estado_membresias`, `vw_detalle_ventas`, `vw_historial_accesos`, `vw_inventario_bajo`)
 */

// ============================================================================
import { getFechaMexico, getHoraMexico } from './timeUtils';

// 1. FUNCIONES DE BASE DE DATOS (`fn_*`)
// ============================================================================

/**
 * Función SQL `fn_dias_restantes(p_fecha_vencimiento DATE)`
 * Equivalente a: RETURN DATEDIFF(p_fecha_vencimiento, CURDATE());
 */
export const fn_dias_restantes = (fechaVencimiento) => {
  if (!fechaVencimiento) return 0;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fechaVencimiento);
  venc.setHours(0, 0, 0, 0);
  if (isNaN(venc.getTime())) return 0;
  return Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Función SQL `fn_membresia_activa(p_id_cliente INT)`
 * Equivalente a:
 * SELECT COUNT(*) FROM membresia
 * WHERE id_cliente = p_id_cliente AND estado = 'activa' AND fecha_vencimiento >= CURDATE()
 * Retorna 1 si está activa, 0 si no.
 */
export const fn_membresia_activa = (idCliente, listaMembresias = []) => {
  if (!idCliente || !Array.isArray(listaMembresias)) return 0;
  const tieneActiva = listaMembresias.some((m) => {
    const mismoCliente = Number(m.id_cliente) === Number(idCliente);
    const est = String(m.estado || '').toLowerCase();
    const estadoOk = est === 'activa' || est === 'activo' || est === '1';
    const dias = fn_dias_restantes(m.fecha_vencimiento);
    return mismoCliente && estadoOk && dias >= 0;
  });
  return tieneActiva ? 1 : 0;
};

/**
 * Función SQL `fn_total_gastado_cliente(p_id_cliente INT)`
 * Equivalente a:
 * SELECT IFNULL(SUM(total), 0) FROM venta
 * WHERE id_cliente = p_id_cliente AND estado = 'Completada'
 */
export const fn_total_gastado_cliente = (idCliente, listaVentas = []) => {
  if (!idCliente || !Array.isArray(listaVentas)) return 0;
  const suma = listaVentas.reduce((acc, v) => {
    const idCliVenta = v.id_cliente || (() => {
      const m = String(v.cliente || '').match(/#(\d+)/);
      return m ? Number(m[1]) : null;
    })();
    const estadoOk = !v.estado || String(v.estado).toLowerCase() === 'completada';
    if (Number(idCliVenta) === Number(idCliente) && estadoOk) {
      return acc + (Number(v.total) || 0);
    }
    return acc;
  }, 0);
  return Number(suma.toFixed(2));
};

/**
 * Función auxiliar de estado visual de membresía ('Pendiente' | 'Vencida' | 'Por vencer' | 'Activa')
 */
export const fn_estado_membresia = (fechaInicio, fechaVencimiento, estadoBd) => {
  if (estadoBd) {
    const est = String(estadoBd).trim().toLowerCase();
    if (est === 'inactiva' || est === 'inactivo' || est === 'desactivada' || est === 'desactivado' || est === '0') {
      return 'Inactiva';
    }
  }
  const dias = fn_dias_restantes(fechaVencimiento);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = fechaInicio ? new Date(fechaInicio) : hoy;
  inicio.setHours(0, 0, 0, 0);

  if (hoy < inicio) return 'Pendiente';
  if (dias < 0) return 'Vencida';
  if (dias <= 3) return 'Por vencer';
  return 'Activa';
};

export const fn_calcular_subtotal_producto = (precio, cantidad) => {
  return Number(precio) * Number(cantidad);
};

export const fn_calcular_descuento = (precio, porcentaje) => {
  if (precio < 0 || porcentaje < 0 || porcentaje > 100) return 0;
  return Number(((precio * porcentaje) / 100).toFixed(2));
};

// ============================================================================
// 2. TRIGGERS DE BASE DE DATOS (`trg_*`)
// ============================================================================

/**
 * Trigger SQL `trg_estado_membresia` (BEFORE INSERT ON membresia)
 * IF NEW.fecha_vencimiento < CURDATE() THEN SET NEW.estado = 'vencida'; ELSE SET NEW.estado = 'activa'; END IF;
 */
export const trg_estado_membresia = (fechaVencimiento) =>
  fn_dias_restantes(fechaVencimiento) < 0 ? 'vencida' : 'activa';

/**
 * Trigger SQL `trg_evitar_stock_negativo` / `trg_validar_stock_venta` (BEFORE INSERT ON detalle_venta)
 * Valida si hay stock suficiente. Acepta tanto el objeto producto como el valor numérico directo.
 */
export const trg_evitar_stock_negativo = (stockOProd, cantidadRestar = 0) => {
  const stockNum = typeof stockOProd === 'object' && stockOProd !== null
    ? (Number(stockOProd.stock) || 0)
    : (Number(stockOProd) || 0);
  const nuevoStock = stockNum - (Number(cantidadRestar) || 0);

  if (nuevoStock < 0) {
    return {
      valido: false,
      nuevoStock: stockNum,
      mensaje: 'Stock insuficiente'
    };
  }
  return { valido: true, nuevoStock, mensaje: 'OK' };
};

export const trg_validar_stock = (stockOProd, cantidadRestar = 1) =>
  trg_evitar_stock_negativo(stockOProd, cantidadRestar).valido;

/**
 * Trigger SQL `trg_actualizar_stock_venta` (AFTER INSERT ON detalle_venta)
 * Descuenta stock localmente para actualización inmediata en UI.
 */
export const trg_actualizar_stock_venta = (productos = [], carrito = []) => {
  return productos.map((p) => {
    const enCarro = carrito.find((c) => Number(c.id) === Number(p.id) && !c.es_membresia);
    return enCarro ? { ...p, stock: Math.max(0, (Number(p.stock) || 0) - Number(enCarro.cant || 0)) } : p;
  });
};

/**
 * Trigger SQL `trg_aumentar_stock_compra` (AFTER INSERT ON detalle_compra)
 * Suma stock localmente tras compra a proveedor.
 */
export const trg_aumentar_stock_compra = (productos = [], idProducto, cantidad) => {
  return productos.map((p) =>
    Number(p.id) === Number(idProducto)
      ? { ...p, stock: (Number(p.stock) || 0) + (Number(cantidad) || 0) }
      : p
  );
};

// ============================================================================
// 3. PROCEDIMIENTOS ALMACENADOS (`sp_*`)
// ============================================================================

/**
 * Procedimiento `sp_generar_folio`
 */
export const sp_generar_folio = () => {
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const dd = String(ahora.getDate()).padStart(2, '0');
  const hh = String(ahora.getHours()).padStart(2, '0');
  const mi = String(ahora.getMinutes()).padStart(2, '0');
  const ss = String(ahora.getSeconds()).padStart(2, '0');
  const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
  return `V-${yyyy}${mm}${dd}${hh}${mi}${ss}-${hex}`;
};

/**
 * Procedimiento SQL `sp_registrar_acceso(IN p_id_cliente INT)`
 * Evalua `fn_membresia_activa(p_id_cliente)` y devuelve el registro de acceso con fecha CURDATE(), hora CURTIME()
 * y resultado 'PERMITIDO' / 'CONCEDIDO' o 'DENEGADO'.
 */
export const sp_registrar_acceso = (idCliente, listaMembresias = []) => {
  const ahora = new Date();
  const fecha = getFechaMexico(ahora);
  const hora = getHoraMexico(ahora);
  const activo = fn_membresia_activa(idCliente, listaMembresias);

  return {
    id_cliente: Number(idCliente),
    fecha,
    hora,
    activo: activo === 1,
    resultadoSQL: activo === 1 ? 'PERMITIDO' : 'DENEGADO',
    resultadoAPI: activo === 1 ? 'CONCEDIDO' : 'DENEGADO'
  };
};

/**
 * Procedimiento SQL `sp_renovar_membresia(IN p_id_cliente INT, IN p_id_plan INT)`
 * Calcula la nueva vigencia según `duracion_dias` del plan respetando el tope de 500 días.
 */
export const sp_renovar_membresia = (arg1, arg2, arg3, arg4) => {
  let idCliente = null;
  let idPlan = null;
  let planesCatalogo = [];
  let membresiaActual = null;
  let duracion = 30;

  if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
    membresiaActual = arg1;
    idCliente = membresiaActual.id_cliente;
    if (arg2 && typeof arg2 === 'object') {
      idPlan = arg2.id || arg2.id_plan || 2;
      duracion = Math.min(365, Number(arg2.duracion_dias || membresiaActual?.duracion_dias || 30));
    } else {
      idPlan = Number(arg2) || 2;
      duracion = Math.min(365, Number(membresiaActual?.duracion_dias || 30));
    }
  } else {
    idCliente = arg1;
    idPlan = arg2;
    planesCatalogo = Array.isArray(arg3) ? arg3 : [];
    membresiaActual = arg4 || null;
    const planObj = planesCatalogo.find((p) => Number(p.id) === Number(idPlan));
    duracion = Math.min(365, Number(planObj?.duracion_dias || membresiaActual?.duracion_dias || 30));
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyStr = getFechaMexico(hoy);

  const diasActuales = membresiaActual?.fecha_vencimiento
    ? Math.max(0, fn_dias_restantes(membresiaActual.fecha_vencimiento))
    : 0;

  if (diasActuales + duracion > 500) {
    return {
      exito: false,
      permitido: false,
      diasAcumulados: diasActuales + duracion,
      mensaje: `Restricción: No se pueden acumular más de 500 días de vigencia (acumularía ${diasActuales + duracion} días).`
    };
  }

  const vencActual = membresiaActual?.fecha_vencimiento ? new Date(membresiaActual.fecha_vencimiento) : hoy;
  vencActual.setHours(0, 0, 0, 0);
  const baseFecha = vencActual > hoy ? vencActual : hoy;
  const nuevaFecha = new Date(baseFecha.getTime() + duracion * 24 * 60 * 60 * 1000);
  const nuevaVencimiento = getFechaMexico(nuevaFecha);

  return {
    exito: true,
    permitido: true,
    id_cliente: Number(idCliente),
    id_plan: Number(idPlan),
    duracion_dias: duracion,
    fecha_inicio: hoyStr,
    fecha_vencimiento: nuevaVencimiento,
    estado: trg_estado_membresia(nuevaVencimiento)
  };
};

/**
 * Procedimiento SQL `sp_ventas_por_fecha(IN fecha_inicio DATE, IN fecha_fin DATE)`
 * Soporta ambas firmas:
 * - sp_ventas_por_fecha(listaVentas, fechaInicio, fechaFin)
 * - sp_ventas_por_fecha(fechaInicio, fechaFin, listaVentas)
 * SELECT * FROM venta WHERE DATE(fecha) BETWEEN fecha_inicio AND fecha_fin;
 */
export const sp_ventas_por_fecha = (arg1, arg2, arg3) => {
  let listaVentas = [];
  let fechaInicio = null;
  let fechaFin = null;

  if (Array.isArray(arg1)) {
    listaVentas = arg1;
    fechaInicio = arg2;
    fechaFin = arg3;
  } else if (Array.isArray(arg3)) {
    fechaInicio = arg1;
    fechaFin = arg2;
    listaVentas = arg3;
  } else {
    fechaInicio = arg1;
    fechaFin = arg2;
    listaVentas = Array.isArray(arg3) ? arg3 : [];
  }

  if (!Array.isArray(listaVentas)) return [];
  if (!fechaInicio && !fechaFin) return listaVentas;

  const ini = fechaInicio ? new Date(fechaInicio) : new Date('2000-01-01');
  const fin = fechaFin ? new Date(fechaFin) : new Date('2100-01-01');
  ini.setHours(0, 0, 0, 0);
  fin.setHours(23, 59, 59, 999);

  return listaVentas.filter((v) => {
    if (!v) return false;
    if (!v.fecha) return true;
    const f = new Date(v.fecha);
    if (isNaN(f.getTime())) return true;
    return f >= ini && f <= fin;
  });
};

/**
 * Procedimiento SQL `sp_corte_caja_diario(IN p_fecha DATE)`
 * Soporta sp_corte_caja_diario(fechaStr, listaVentas) o sp_corte_caja_diario(listaVentas, fechaStr)
 * SELECT COUNT(*) AS total_ventas, IFNULL(SUM(total), 0) AS ingresos_totales
 * FROM venta WHERE DATE(fecha) = p_fecha AND estado = 'Completada';
 */
export const sp_corte_caja_diario = (arg1, arg2) => {
  let listaVentas = [];
  let fechaStr = null;

  if (Array.isArray(arg1)) {
    listaVentas = arg1;
    fechaStr = arg2;
  } else {
    fechaStr = arg1;
    listaVentas = Array.isArray(arg2) ? arg2 : [];
  }

  const target = (fechaStr || getFechaMexico()).slice(0, 10);
  let total_ventas = 0;
  let ingresos_totales = 0;
  let totalEfectivo = 0;
  let totalTarjeta = 0;

  listaVentas.forEach((v) => {
    if (!v) return;
    const fVenta = (v.fecha || '').slice(0, 10);
    const estadoOk = !v.estado || String(v.estado).toLowerCase() === 'completada';
    if ((fVenta === target || !v.fecha) && estadoOk) {
      const monto = Number(v.total) || 0;
      total_ventas += 1;
      ingresos_totales += monto;
      if ((v.metodo_pago || '').toLowerCase().includes('tarjeta')) {
        totalTarjeta += monto;
      } else {
        totalEfectivo += monto;
      }
    }
  });

  return {
    total_ventas,
    ingresos_totales: Number(ingresos_totales.toFixed(2)),
    totalVentas: Number(ingresos_totales.toFixed(2)),
    totalEfectivo: Number(totalEfectivo.toFixed(2)),
    totalTarjeta: Number(totalTarjeta.toFixed(2))
  };
};

/**
 * Procedimiento SQL `sp_productos_mas_vendidos()`
 * SELECT p.nombre, SUM(dv.cantidad) AS total_vendido
 * FROM detalle_venta dv JOIN producto p ON dv.id_producto = p.id
 * GROUP BY p.id, p.nombre ORDER BY total_vendido DESC;
 */
export const sp_productos_mas_vendidos = (listaVentas = [], listaProductos = []) => {
  const conteoMap = new Map();

  listaVentas.forEach((v) => {
    if (Array.isArray(v.detalles)) {
      v.detalles.forEach((d) => {
        if (!d.es_membresia && (d.id_producto || d.articulo)) {
          const prodObj = listaProductos.find((p) => Number(p.id) === Number(d.id_producto));
          const key = prodObj ? prodObj.nombre : (d.articulo || `Producto #${d.id_producto}`);
          const cant = Number(d.cantidad) || 1;
          const prev = conteoMap.get(key) || { nombre: key, total_vendido: 0, ingresos: 0 };
          conteoMap.set(key, {
            nombre: key,
            total_vendido: prev.total_vendido + cant,
            ingresos: prev.ingresos + (Number(d.subtotal) || (cant * Number(d.precio_unitario || 0)))
          });
        }
      });
    }
  });

  return Array.from(conteoMap.values()).sort((a, b) => b.total_vendido - a.total_vendido);
};

// ============================================================================
// 4. VISTAS SQL (`vw_*`)
// ============================================================================

/**
 * Vista SQL `vw_inventario_bajo`
 * SELECT id, nombre, stock, stock_minimo FROM producto WHERE stock <= stock_minimo;
 */
export const vw_inventario_bajo = (productos = []) => {
  return productos.filter((p) => {
    const stock = Number(p.stock) || 0;
    const min = Number(p.stock_minimo) || 5;
    return stock <= min || stock <= 5;
  });
};

export const esInventarioBajo = (p) => {
  const stock = Number(p?.stock) || 0;
  const min = Number(p?.stock_minimo) || 5;
  return stock <= min || stock <= 5;
};

/**
 * Vista SQL `vw_estado_membresias` y `vw_clientes_membresias`
 * Une `cliente`, `membresia` y `plan` calculando `dias_restantes` con `DATEDIFF(fecha_vencimiento, CURDATE())`
 */
export const vw_estado_membresias = (membresias = [], clientes = [], planes = []) => {
  return membresias.map((m) => {
    const cli = clientes.find((c) => Number(c.id) === Number(m.id_cliente));
    const pl = planes.find((p) => Number(p.id) === Number(m.id_plan));
    const dias_restantes = fn_dias_restantes(m.fecha_vencimiento);
    return {
      ...m,
      id_cliente: m.id_cliente,
      cliente: cli?.nombre || m.cliente_nombre || 'Socio Registrado',
      telefono: cli?.telefono || '',
      plan: pl?.nombre || m.plan_nombre || 'Plan Estándar',
      precio_plan: Number(pl?.precio || m.precio || 350),
      duracion_dias: Number(pl?.duracion_dias || m.duracion_dias || 30),
      dias_restantes,
      estado_calculado: fn_estado_membresia(m.fecha_inicio, m.fecha_vencimiento, m.estado)
    };
  });
};

/**
 * Vista SQL `vw_historial_accesos`
 * SELECT a.id, c.nombre, a.fecha, a.hora, a.resultado
 * FROM acceso a JOIN cliente c ON a.id_cliente = c.id ORDER BY a.fecha DESC, a.hora DESC;
 */
export const vw_historial_accesos = (accesos = [], clientes = []) => {
  const mapaClientes = new Map(clientes.map((c) => [Number(c.id), c]));
  return accesos.map((a) => {
    const cli = mapaClientes.get(Number(a.id_cliente));
    return {
      ...a,
      nombre: cli?.nombre || a.cliente_nombre || 'Socio Registrado'
    };
  });
};
