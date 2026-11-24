/**
 * Utilidades centralizadas para Zona Horaria 'America/Mexico_City' (UTC-6)
 * Evita el desfase de +6 horas ocasionado por toISOString() estándar.
 */

export const ZONA_HORARIA_MEXICO = 'America/Mexico_City';

/**
 * Retorna la fecha y hora en formato SQL "YYYY-MM-DD HH:mm:ss" en America/Mexico_City
 * @param {Date|string|number} [date=new Date()]
 * @returns {string} Ej: "2026-11-19 16:05:22"
 */
export function getFechaHoraMexico(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return new Date().toISOString().replace('T', ' ').slice(0, 19);

  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: ZONA_HORARIA_MEXICO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(d).replace('T', ' ');
}

/**
 * Retorna solo la fecha en formato "YYYY-MM-DD" en America/Mexico_City
 * @param {Date|string|number} [date=new Date()]
 * @returns {string} Ej: "2026-11-19"
 */
export function getFechaMexico(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];

  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: ZONA_HORARIA_MEXICO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

/**
 * Retorna solo la hora en formato "HH:mm:ss" en America/Mexico_City (24 horas)
 * @param {Date|string|number} [date=new Date()]
 * @returns {string} Ej: "16:05:22"
 */
export function getHoraMexico(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return new Date().toTimeString().split(' ')[0];

  return new Intl.DateTimeFormat('es-MX', {
    timeZone: ZONA_HORARIA_MEXICO,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(d);
}

/**
 * Formatea una fecha para visualización en reportes y tickets en español México
 * @param {Date|string|number} [date=new Date()]
 * @param {boolean} [conHora=true]
 * @returns {string} Ej: "19/11/2026, 4:05:22 p.m."
 */
export function getFechaLegibleMexico(date = new Date(), conHora = true) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleString('es-MX', {
    timeZone: ZONA_HORARIA_MEXICO,
    hour12: true,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(conHora ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : {})
  });
}
