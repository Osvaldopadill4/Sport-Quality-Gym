// =========================================================================
// Configuración Central de Endpoints API - Gym Sport Quality Center
// =========================================================================
// Servidor Cloud Railway en producción:
// https://sport-quality-gym-production.up.railway.app
//
// Prioridad:
// 1. Variable de entorno REACT_APP_API_URL (si está definida en .env)
// 2. Servidor Cloud de Railway por defecto
// =========================================================================

const CLOUD_API_BASE = 'https://sport-quality-gym-production.up.railway.app/api';

export const API_BASE_URL = process.env.REACT_APP_API_URL || CLOUD_API_BASE;

/**
 * Genera la URL completa para cualquier endpoint REST del sistema.
 * @param {string} endpoint - Ejemplo: 'usuario', 'corte_caja', 'producto'
 * @returns {string} - URL completa lista para fetch
 */
export const getApiUrl = (endpoint = '') => {
  if (!endpoint) return API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default API_BASE_URL;
