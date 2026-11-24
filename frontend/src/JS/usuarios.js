import { getApiUrl } from '../config/apiConfig';

const API_URL = getApiUrl('usuario');

export const getUsuarios = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return await res.json();
  } catch (error) {
    console.warn('No se pudo conectar con la API de usuarios:', error.message);
    return null;
  }
};

export const createUsuario = async (usuario) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });
    if (!res.ok) throw new Error('Error al registrar usuario en el servidor');
    return await res.json();
  } catch (error) {
    console.warn('API no disponible para crear usuario:', error.message);
    return null;
  }
};

export const updateUsuario = async (id, usuario) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });
    if (!res.ok) throw new Error('Error al actualizar usuario en el servidor');
    return await res.json();
  } catch (error) {
    console.warn('API no disponible para actualizar usuario:', error.message);
    return null;
  }
};

export const deleteUsuario = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (error) {
    console.warn('API no disponible para eliminar usuario:', error.message);
    return false;
  }
};
