const API_URL = 'http://localhost:8080/api/cliente';
const API_URL_ALT = 'http://127.0.0.1:8080/api/cliente';

const fetchWithFallback = async (path = '', options = {}) => {
  try {
    return await fetch(`${API_URL}${path}`, options);
  } catch (err) {
    try {
      return await fetch(`${API_URL_ALT}${path}`, options);
    } catch {
      throw err;
    }
  }
};

export const getClientes = async () => {
  try {
    const res = await fetchWithFallback();
    if (!res.ok) throw new Error(`HTTP ${res.status}: Error al obtener clientes`);
    return await res.json();
  } catch (error) {
    console.warn('No se pudo conectar con la API de clientes en Spring Boot:', error.message);
    return null;
  }
};

export const createCliente = async (cliente) => {
  try {
    const res = await fetchWithFallback('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente)
    });
    if (!res.ok) throw new Error('Error al registrar cliente en el servidor');
    return await res.json();
  } catch (error) {
    console.warn('API no disponible para crear cliente:', error.message);
    return null;
  }
};

export const updateCliente = async (id, cliente) => {
  try {
    const res = await fetchWithFallback(`/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente)
    });
    if (!res.ok) throw new Error('Error al actualizar cliente en el servidor');
    return await res.json();
  } catch (error) {
    console.warn('API no disponible para actualizar cliente:', error.message);
    return null;
  }
};

export const deleteCliente = async (id) => {
  try {
    const res = await fetchWithFallback(`/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (error) {
    console.warn('API no disponible para eliminar cliente:', error.message);
    return false;
  }
};
