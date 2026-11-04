const API_URL = 'http://localhost:8080/api/membresia';
const API_URL_ALT = 'http://127.0.0.1:8080/api/membresia';

const guardarMetaMembresia = (membresia) => {
    if (!membresia) return;
    try {
        const meta = JSON.parse(localStorage.getItem('gymton_membresias_meta') || '{}');
        const key = membresia.id ? `id_${membresia.id}` : `cli_${membresia.id_cliente}`;
        meta[key] = {
            ...(meta[key] || {}),
            cliente_nombre: membresia.cliente_nombre || meta[key]?.cliente_nombre,
            plan_nombre: membresia.plan_nombre || meta[key]?.plan_nombre,
            duracion_dias: membresia.duracion_dias || meta[key]?.duracion_dias
        };
        if (membresia.id_cliente) {
            meta[`cli_${membresia.id_cliente}`] = {
                ...(meta[`cli_${membresia.id_cliente}`] || {}),
                cliente_nombre: membresia.cliente_nombre || meta[`cli_${membresia.id_cliente}`]?.cliente_nombre
            };
        }
        localStorage.setItem('gymton_membresias_meta', JSON.stringify(meta));
    } catch (e) {
        console.warn('Error guardando metadata de membresía:', e);
    }
};

export const getMembresias = async () => {
    try {
        let res;
        try {
            res = await fetch(API_URL);
        } catch {
            res = await fetch(API_URL_ALT);
        }
        if (!res.ok) throw new Error('Error al obtener membresías');
        const data = await res.json();
        if (Array.isArray(data)) {
            const meta = JSON.parse(localStorage.getItem('gymton_membresias_meta') || '{}');
            return data.map(m => {
                const infoId = meta[`id_${m.id}`] || {};
                const infoCli = meta[`cli_${m.id_cliente}`] || {};
                return {
                    ...m,
                    cliente_nombre: m.cliente_nombre || infoId.cliente_nombre || infoCli.cliente_nombre,
                    plan_nombre: m.plan_nombre || infoId.plan_nombre,
                    duracion_dias: m.duracion_dias || infoId.duracion_dias
                };
            });
        }
        return [];
    } catch (error) {
        console.warn('API de membresías no disponible:', error.message);
        try {
            const local = localStorage.getItem('gymton_membresias');
            return local ? JSON.parse(local) : [];
        } catch {
            return [];
        }
    }
};

export const createMembresias = async (data) => {
    const payload = {
        id_cliente: Number(data.id_cliente),
        id_plan: Number(data.id_plan),
        fecha_inicio: String(data.fecha_inicio),
        fecha_vencimiento: String(data.fecha_vencimiento),
        estado: String(data.estado || 'activa')
    };

    try {
        let res;
        try {
            res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch {
            res = await fetch(API_URL_ALT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
        if (!res.ok) throw new Error('Error al crear membresía');
        const creada = await res.json();
        const enriquecida = {
            ...data,
            ...creada,
            id: creada?.id || data.id || Date.now()
        };
        guardarMetaMembresia(enriquecida);
        return enriquecida;
    } catch (error) {
        console.warn('API de membresías no disponible para crear:', error.message);
        const fallback = { ...data, id: data.id || Date.now() };
        guardarMetaMembresia(fallback);
        return fallback;
    }
};

export const updateMembresias = async (id, data) => {
    const payload = {
        id: Number(id),
        id_cliente: Number(data.id_cliente),
        id_plan: Number(data.id_plan),
        fecha_inicio: String(data.fecha_inicio),
        fecha_vencimiento: String(data.fecha_vencimiento),
        estado: String(data.estado || 'activa')
    };

    try {
        let res;
        try {
            res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch {
            res = await fetch(`${API_URL_ALT}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
        if (!res.ok) throw new Error('Error al actualizar membresía');
        const actualizada = await res.json();
        const enriquecida = { ...data, ...actualizada, id: Number(id) };
        guardarMetaMembresia(enriquecida);
        return enriquecida;
    } catch (error) {
        console.warn('API de membresías no disponible para actualizar:', error.message);
        const fallback = { ...data, id: Number(id) };
        guardarMetaMembresia(fallback);
        return fallback;
    }
};

export const deleteMembresias = async (id) => {
    try {
        let res;
        try {
            res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        } catch {
            res = await fetch(`${API_URL_ALT}/${id}`, { method: 'DELETE' });
        }
        return res.ok;
    } catch (error) {
        console.warn('API de membresías no disponible para eliminar:', error.message);
        return true;
    }
};
