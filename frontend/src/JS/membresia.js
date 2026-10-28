const API_URL = 'http://localhost:8080/api/membresia';
const API_URL_ALT = 'http://127.0.0.1:8080/api/membresia';

export const getMembresias = async () => {
    try {
        let res;
        try {
            res = await fetch(API_URL);
        } catch {
            res = await fetch(API_URL_ALT);
        }
        if (!res.ok) throw new Error('Error al obtener membresías');
        return await res.json();
    } catch (error) {
        console.warn('API de membresías no disponible:', error.message);
        return [];
    }
};

export const createMembresias = async (data) => {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Error al crear membresía');
        return await res.json();
    } catch (error) {
        console.warn('API de membresías no disponible para crear:', error.message);
        return data;
    }
};

export const updateMembresias = async (id, data) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Error al actualizar membresía');
        return await res.json();
    } catch (error) {
        console.warn('API de membresías no disponible para actualizar:', error.message);
        return data;
    }
};

export const deleteMembresias = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        return res.ok;
    } catch (error) {
        console.warn('API de membresías no disponible para eliminar:', error.message);
        return true;
    }
};
