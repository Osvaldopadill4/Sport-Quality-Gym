import { getApiUrl } from '../config/apiConfig';

const API_URL = getApiUrl('detalle_compra');

export const getDetalleCompras = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener detalles de compra');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn('API Detalle Compra no disponible:', error.message);
        return [];
    }
};

export const createDetalleCompra = async (data) => {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_compra: Number(data.id_compra),
                id_producto: Number(data.id_producto),
                cantidad: String(data.cantidad || 1),
                costo_unitario: String(data.costo_unitario || 0),
                subtotal: String(data.subtotal || 0)
            })
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (error) {
        console.warn('API Detalle Compra error al registrar:', error.message);
    }
    return data;
};
