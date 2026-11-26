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
    hourCycle: 'h23'
  }).format(d);
}

/**
 * Convierte una fecha ("YYYY-MM-DD") y hora ("HH:mm:ss") almacenadas por el servidor MySQL
 * en Railway (zona horaria UTC+1 / CET, +7 horas respecto a México)
 * a su fecha y hora equivalente en America/Mexico_City (UTC-6).
 * @param {string} fechaServidor
 * @param {string} horaServidor
 * @returns {{ fecha: string, hora: string }}
 */
export function convertirFechaHoraUtcAMexico(fechaServidor, horaServidor) {
  if (!fechaServidor || !horaServidor) {
    return {
      fecha: fechaServidor || getFechaMexico(),
      hora: horaServidor || '00:00:00'
    };
  }
  const fechaSolo = String(fechaServidor).trim().slice(0, 10);
  const partesHora = String(horaServidor).trim().split(':');
  const hh = (partesHora[0] || '00').padStart(2, '0');
  const mm = (partesHora[1] || '00').padStart(2, '0');
  const ss = (partesHora[2] || '00').slice(0, 2).padStart(2, '0');

  const fechaObj = new Date(`${fechaSolo}T${hh}:${mm}:${ss}+01:00`);
  if (isNaN(fechaObj.getTime())) {
    return { fecha: fechaSolo, hora: `${hh}:${mm}:${ss}` };
  }

  return {
    fecha: getFechaMexico(fechaObj),
    hora: getHoraMexico(fechaObj)
  };
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
