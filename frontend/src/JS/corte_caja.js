const API_URL = 'http://localhost:8080/api/corte_caja';

// Obtener todos los cortes de caja (con persistencia local en fallback)
export const getCorteCaja = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener cortes de caja');
        const data = await res.json();
        if (Array.isArray(data)) {
            localStorage.setItem('gymton_cortes_caja', JSON.stringify(data));
            return data;
        }
        return [];
    } catch (error) {
        console.warn('API Corte de Caja no disponible, recurriendo a almacenamiento local:', error.message);
        try {
            const local = localStorage.getItem('gymton_cortes_caja');
            return local ? JSON.parse(local) : [];
        } catch {
            return [];
        }
    }
};

// Obtener el turno de caja actualmente activo (abierto sin fecha de cierre)
export const getCorteActivo = async () => {
    try {
        const res = await fetch(`${API_URL}/activo`);
        if (!res.ok) throw new Error('Error al consultar corte activo');
        const data = await res.json();
        return data.activo ? data.corte : null;
    } catch (error) {
        console.warn('Fallback local para getCorteActivo:', error.message);
        try {
            const local = localStorage.getItem('gymton_corte_activo');
            return local ? JSON.parse(local) : null;
        } catch {
            return null;
        }
    }
};

// Abrir nuevo turno / caja
export const abrirCorteCaja = async (datos) => {
    try {
        const res = await fetch(`${API_URL}/abrir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.mensaje || 'Error al abrir turno de caja');
        }
        const corte = await res.json();
        localStorage.setItem('gymton_corte_activo', JSON.stringify(corte));
        return { success: true, corte };
    } catch (error) {
        console.warn('Registrando apertura en almacenamiento local:', error.message);
        const hoyStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const nuevoCorte = {
            id: Date.now(),
            id_usuario: datos.id_usuario || 1,
            fecha_apertura: datos.fecha_apertura || hoyStr,
            fecha_cierre: null,
            monto_inicial: Number(datos.monto_inicial) || 0,
            total_ventas: 0,
            monto_calculado: Number(datos.monto_inicial) || 0,
            monto_real: 0,
            diferencia: 0
        };
        localStorage.setItem('gymton_corte_activo', JSON.stringify(nuevoCorte));
        
        // Agregar a la lista general
        try {
            const list = JSON.parse(localStorage.getItem('gymton_cortes_caja') || '[]');
            localStorage.setItem('gymton_cortes_caja', JSON.stringify([nuevoCorte, ...list]));
        } catch {}

        return { success: true, corte: nuevoCorte };
    }
};

// Cerrar turno / arqueo de caja con monto real y cálculo de diferencias
export const cerrarCorteCaja = async (id, datosCierre) => {
    try {
        const res = await fetch(`${API_URL}/cerrar/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCierre)
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.mensaje || 'Error al cerrar caja');
        }
        const corte = await res.json();
        localStorage.removeItem('gymton_corte_activo');
        return { success: true, corte };
    } catch (error) {
        console.warn('Registrando cierre en almacenamiento local:', error.message);
        const hoyStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
        
        let corteActual = null;
        try {
            corteActual = JSON.parse(localStorage.getItem('gymton_corte_activo'));
        } catch {}

        const montoInicial = corteActual ? Number(corteActual.monto_inicial) : Number(datosCierre.monto_inicial || 0);
        const totalVentas = Number(datosCierre.total_ventas || 0);
        const montoCalculado = montoInicial + totalVentas;
        const montoReal = Number(datosCierre.monto_real || 0);
        const diferencia = montoReal - montoCalculado;

        const corteCerrado = {
            ...(corteActual || {}),
            id: id || Date.now(),
            fecha_cierre: hoyStr,
            total_ventas: totalVentas,
            monto_calculado: montoCalculado,
            monto_real: montoReal,
            diferencia: diferencia
        };

        localStorage.removeItem('gymton_corte_activo');

        // Actualizar en el historial
        try {
            let list = JSON.parse(localStorage.getItem('gymton_cortes_caja') || '[]');
            list = list.map(c => c.id === id ? corteCerrado : c);
            localStorage.setItem('gymton_cortes_caja', JSON.stringify(list));
        } catch {}

        return { success: true, corte: corteCerrado };
    }
};

// CRUD estándar
export const createCorteCaja = async (data) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
};

export const updateCorteCaja = async (id, data) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
};

export const deleteCorteCaja = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        return res.ok;
    } catch {
        return false;
    }
};
