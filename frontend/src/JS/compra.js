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
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            return await res.json();
        }
        throw new Error('Servidor no respondió con éxito para la compra');
    } catch (error) {
        console.warn('Persistiendo compra en almacenamiento local:', error.message);
        try {
            const prev = JSON.parse(localStorage.getItem('gymton_compras') || '[]');
            const nuevaCompra = {
                id: Date.now(),
                fecha: new Date().toISOString().replace('T', ' ').slice(0, 19),
                ...data
            };
            localStorage.setItem('gymton_compras', JSON.stringify([nuevaCompra, ...prev]));
            return nuevaCompra;
        } catch (e) {
            console.error('Error guardando compra local:', e);
            return data;
        }
    }
};
