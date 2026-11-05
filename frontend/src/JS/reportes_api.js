const BASE_URL = 'http://localhost:8080/api/reporte';

/**
 * Consulta la vista SQL `vw_detalle_ventas` vía Backend Spring Boot.
 * Retorna las ventas desglosadas con cliente, empleado, producto/plan y método de pago ya resueltos.
 */
export const getReporteVentas = async () => {
  try {
    const res = await fetch(`${BASE_URL}/ventas`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('API /api/reporte/ventas no disponible:', error.message);
    return null;
  }
};

/**
 * Filtra ventas por rango de fechas directamente en el motor MySQL
 */
export const getReporteVentasPorFecha = async (fechaInicio, fechaFin) => {
  try {
    const res = await fetch(`${BASE_URL}/ventas/fechas?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('API /api/reporte/ventas/fechas no disponible:', error.message);
    return null;
  }
};

/**
 * Consulta la vista `vw_estado_membresias` con `dias_restantes` calculados
 */
export const getReporteEstadoMembresias = async () => {
  try {
    const res = await fetch(`${BASE_URL}/estado_membresias`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('API /api/reporte/estado_membresias no disponible:', error.message);
    return null;
  }
};

/**
 * Consulta la vista `vw_clientes_membresias` con la relación socio-membresía resuelta
 */
export const getReporteClientesMembresias = async () => {
  try {
    const res = await fetch(`${BASE_URL}/clientes_membresias`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('API /api/reporte/clientes_membresias no disponible:', error.message);
    return null;
  }
};

/**
 * Consulta la vista `vw_historial_accesos` con clientes formateados
 */
export const getReporteAccesos = async () => {
  try {
    const res = await fetch(`${BASE_URL}/accesos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('API /api/reporte/accesos no disponible:', error.message);
    return null;
  }
};

/**
 * Consulta la vista `vw_inventario_bajo` con productos en stock crítico
 */
export const getReporteInventarioBajo = async () => {
  try {
    const res = await fetch(`${BASE_URL}/inventario_bajo`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('API /api/reporte/inventario_bajo no disponible:', error.message);
    return null;
  }
};
