import { getApiUrl } from '../config/apiConfig';

const API_URL = getApiUrl('proveedor');

export const getProveedores = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener proveedores');
        return await res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const createProveedor = async (proveedor) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proveedor)
    });
    return await res.json();
};

export const updateProveedor = async (id, proveedor) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proveedor)
    });
    return await res.json();
};

export const deleteProveedor = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    return res.ok;
};
