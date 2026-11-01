import { createDetalleVenta } from './detalle_venta';

const API_URL = 'http://localhost:8080/api/venta';

export const getVenta = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener ventas');
        const data = await res.json();
        if (Array.isArray(data)) {
            localStorage.setItem('gymton_ventas', JSON.stringify(data));
            return data;
        }
        return [];
    } catch (error) {
        console.warn('API Ventas no disponible, recurriendo a almacenamiento local:', error.message);
        try {
            const local = localStorage.getItem('gymton_ventas');
            return local ? JSON.parse(local) : [];
        } catch {
            return [];
        }
    }
};

export const createVenta = async (data) => {
    // 1. Extraer ID del cliente si viene en formato texto "Nombre (Socio #123)"
    let clienteId = null;
    if (data.id_cliente) {
        clienteId = Number(data.id_cliente);
    } else if (typeof data.cliente === 'string') {
        const match = data.cliente.match(/#(\d+)/);
        if (match) clienteId = Number(match[1]);
    }

    // 2. Estructura exacta compatible con Venta.java del Backend
    const ventaPayload = {
        id_usuario: data.id_usuario ? Number(data.id_usuario) : 1,
        id_cliente: clienteId,
        fecha: data.fecha || new Date().toISOString().replace('T', ' ').slice(0, 19),
        total: String(data.total || 0),
        metodo_pago: String(data.metodo_pago || 'Efectivo'),
        folio: String(data.folio || ''),
        estado: String(data.estado || 'Completada')
    };

    let ventaGuardada = null;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ventaPayload)
        });
        if (res.ok) {
            ventaGuardada = await res.json();
        }
    } catch (error) {
        console.warn('API Venta no disponible, usando registro local:', error.message);
    }

    // 3. Si la venta se registró en el Backend, enviar cada detalle a /api/detalle_venta
    if (ventaGuardada && ventaGuardada.id && Array.isArray(data.detalles)) {
        for (const d of data.detalles) {
            await createDetalleVenta({
                id_venta: ventaGuardada.id,
                id_producto: d.id_producto || null,
                id_plan: d.id_plan || null,
                cantidad: String(d.cantidad || 1),
                precio_unitario: String(d.precio_unitario || 0),
                subtotal: String(d.subtotal || 0)
            });
        }
    }

    // 4. Persistir la venta enriquecida en el localStorage para auditoría y visualización de tickets
    const ventaFinal = {
        id: ventaGuardada?.id || Date.now(),
        ...data,
        id_cliente: clienteId
    };

    try {
        const prev = JSON.parse(localStorage.getItem('gymton_ventas') || '[]');
        localStorage.setItem('gymton_ventas', JSON.stringify([ventaFinal, ...prev]));
    } catch (e) {
        console.error('Error guardando venta local:', e);
    }

    return ventaFinal;
};

export const updateVenta = async (id, data) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (error) {
        console.warn('Error en updateVenta:', error.message);
        return data;
    }
};

export const deleteVenta = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        return res.ok;
    } catch (error) {
        console.warn('Error en deleteVenta:', error.message);
        return false;
    }
};
