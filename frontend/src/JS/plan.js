import { getApiUrl } from '../config/apiConfig';

const API_URL = getApiUrl('plan');

export const getPlanes = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener planes');
        return await res.json();
    } catch (error) {
        console.error('Error getPlanes:', error);
        return [];
    }
};

export const createPlanes = async (data) => {
    // Sanitizar datos para enviar solo lo que el modelo Plan espera
    const payload = {
        nombre: data.nombre ? String(data.nombre).trim() : '',
        descripcion: data.descripcion ? String(data.descripcion).trim() : '',
        precio: parseFloat(data.precio) || 0,
        duracion_dias: String(data.duracion_dias || 30),
        estado: String(data.estado ?? 'Activo')
    };
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        throw new Error(`Error al registrar plan: ${res.status}`);
    }
    return await res.json();
};

export const updatePlanes = async (id, data) => {
    // Sanitizar datos para enviar solo lo que el modelo Plan espera
    const payload = {
        id: parseInt(id),
        nombre: data.nombre ? String(data.nombre).trim() : '',
        descripcion: data.descripcion ? String(data.descripcion).trim() : '',
        precio: parseFloat(data.precio) || 0,
        duracion_dias: String(data.duracion_dias || 30),
        estado: String(data.estado ?? 'Activo')
    };
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        throw new Error(`Error al actualizar plan: ${res.status}`);
    }
    return await res.json();
};

export const deletePlanes = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    return res.ok;
};
