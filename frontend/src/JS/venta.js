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
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            return await res.json();
        }
        throw new Error('Servidor no respondió con éxito para la venta');
    } catch (error) {
        console.warn('Persistiendo venta en almacenamiento local y sincronización:', error.message);
        try {
            const prev = JSON.parse(localStorage.getItem('gymton_ventas') || '[]');
            const nuevaVenta = {
                id: Date.now(),
                ...data
            };
            localStorage.setItem('gymton_ventas', JSON.stringify([nuevaVenta, ...prev]));
            return nuevaVenta;
        } catch (e) {
            console.error('Error guardando venta local:', e);
            return data;
        }
    }
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
