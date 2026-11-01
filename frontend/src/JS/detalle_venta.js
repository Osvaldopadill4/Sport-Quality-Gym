const API_URL = 'http://localhost:8080/api/detalle_venta';

export const getDetalleVentas = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener detalles de venta');
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn('API Detalle Venta no disponible:', error.message);
        return [];
    }
};

export const createDetalleVenta = async (data) => {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_venta: Number(data.id_venta),
                id_producto: data.id_producto !== null && data.id_producto !== undefined ? Number(data.id_producto) : null,
                id_plan: data.id_plan !== null && data.id_plan !== undefined ? Number(data.id_plan) : null,
                cantidad: String(data.cantidad || 1),
                precio_unitario: String(data.precio_unitario || 0),
                subtotal: String(data.subtotal || 0)
            })
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (error) {
        console.warn('API Detalle Venta error al registrar:', error.message);
    }
    return data;
};
