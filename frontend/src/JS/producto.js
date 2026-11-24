import { getApiUrl } from '../config/apiConfig';

const API_URL = getApiUrl('producto');

export const getProductos = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener productos');
        return await res.json();
    } catch (error) {
        console.error('Error getProductos:', error);
        return [];
    }
};

export const createProductos = async (data) => {
    // Sanitizar datos para enviar solo lo que el modelo Producto espera
    const payload = {
        nombre: data.nombre ? String(data.nombre).trim() : '',
        descripcion: data.descripcion ? String(data.descripcion).trim() : '',
        precio: String(data.precio ?? 0),
        stock: String(data.stock ?? 0),
        categoria: data.categoria ? String(data.categoria).trim() : 'General',
        estado: String(data.estado ?? '1')
    };
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        throw new Error(`Error al registrar producto: ${res.status}`);
    }
    return await res.json();
};

export const updateProductos = async (id, data) => {
    // Sanitizar datos para enviar solo lo que el modelo Producto espera
    const payload = {
        id: parseInt(id),
        nombre: data.nombre ? String(data.nombre).trim() : '',
        descripcion: data.descripcion ? String(data.descripcion).trim() : '',
        precio: String(data.precio ?? 0),
        stock: String(data.stock ?? 0),
        categoria: data.categoria ? String(data.categoria).trim() : 'General',
        estado: String(data.estado ?? '1')
    };
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        throw new Error(`Error al actualizar producto: ${res.status}`);
    }
    return await res.json();
};

export const deleteProductos = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    return res.ok;
};
