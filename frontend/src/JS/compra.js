import { createDetalleCompra } from './detalle_compra';

const API_URL = 'http://localhost:8080/api/compra';

export const getCompras = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener compras');
        const data = await res.json();
        if (Array.isArray(data)) {
            localStorage.setItem('gymton_compras', JSON.stringify(data));
            return data;
        }
        return [];
    } catch (error) {
        console.warn('API Compras no disponible, recurriendo a almacenamiento local:', error.message);
        try {
            const local = localStorage.getItem('gymton_compras');
            return local ? JSON.parse(local) : [];
        } catch {
            return [];
        }
    }
};

export const createCompra = async (data) => {
    const compraPayload = {
        id_usuario: data.id_usuario ? Number(data.id_usuario) : 1,
        id_proveedor: data.id_proveedor ? Number(data.id_proveedor) : 1,
        fecha: data.fecha || new Date().toISOString().replace('T', ' ').slice(0, 19),
        total: String(data.total || (Number(data.cantidad || 0) * Number(data.costo_unitario || 0)) || 0),
        estado: String(data.estado || 'Completada')
    };

    let compraGuardada = null;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(compraPayload)
        });
        if (res.ok) {
            compraGuardada = await res.json();
        }
    } catch (error) {
        console.warn('API Compra no disponible, persistiendo en almacenamiento local:', error.message);
    }

    // Si la compra se guardó en BD y contiene un producto asociado, registrar el detalle_compra
    if (compraGuardada && compraGuardada.id && data.id_producto) {
        await createDetalleCompra({
            id_compra: compraGuardada.id,
            id_producto: Number(data.id_producto),
            cantidad: String(data.cantidad || 1),
            costo_unitario: String(data.costo_unitario || 0),
            subtotal: String(data.total || (Number(data.cantidad || 0) * Number(data.costo_unitario || 0)) || 0)
        });
    }

    const compraFinal = {
        id: compraGuardada?.id || Date.now(),
        fecha: compraPayload.fecha,
        ...data
    };

    try {
        const prev = JSON.parse(localStorage.getItem('gymton_compras') || '[]');
        localStorage.setItem('gymton_compras', JSON.stringify([compraFinal, ...prev]));
    } catch (e) {
        console.error('Error guardando compra local:', e);
    }

    return compraFinal;
};
