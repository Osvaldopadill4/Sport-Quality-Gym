const API_URL = 'http://localhost:8080/api/cliente';

export const getClientes = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al obtener clientes');
    return await res.json();
  } catch (error) {
    console.warn('No se pudo conectar con la API de clientes:', error.message);
    return null;
  }
};

export const createCliente = async (cliente) => {
  try {
    const res = await fetch(API_URL, {
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
    const res = await fetch(`${API_URL}/${id}`, {
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
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (error) {
    console.warn('API no disponible para eliminar cliente:', error.message);
    return false;
  }
};
