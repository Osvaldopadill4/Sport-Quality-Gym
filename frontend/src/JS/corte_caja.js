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
        const todos = await getCorteCaja();
        if (Array.isArray(todos)) {
            const activo = todos.find(c => !c.fecha_cierre || c.fecha_cierre === 'null' || c.fecha_cierre === '');
            if (activo) {
                localStorage.setItem('gymton_corte_activo', JSON.stringify(activo));
                return activo;
            }
        }
    } catch (error) {
        console.warn('Error al consultar corte activo en Backend:', error.message);
    }

    try {
        const local = localStorage.getItem('gymton_corte_activo');
        return local ? JSON.parse(local) : null;
    } catch {
        return null;
    }
};

// Abrir nuevo turno / caja (Fondo inicial de 500 pesos siempre)
export const abrirCorteCaja = async (datos) => {
    const hoyStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const montoInicial = Number(datos.monto_inicial || 500);

    const payload = {
        id_usuario: datos.id_usuario ? Number(datos.id_usuario) : 1,
        fecha_apertura: datos.fecha_apertura || hoyStr,
        fecha_cierre: null,
        total_ventas: "0",
        monto_calculado: String(montoInicial),
        monto_real: "0",
        diferencia: "0"
    };

    let corteCreado = null;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            corteCreado = await res.json();
        }
    } catch (error) {
        console.warn('Registrando apertura en almacenamiento local:', error.message);
    }

    const nuevoCorte = {
        id: corteCreado?.id || Date.now(),
        ...payload,
        monto_inicial: montoInicial
    };

    localStorage.setItem('gymton_corte_activo', JSON.stringify(nuevoCorte));
    
    try {
        const list = JSON.parse(localStorage.getItem('gymton_cortes_caja') || '[]');
        localStorage.setItem('gymton_cortes_caja', JSON.stringify([nuevoCorte, ...list]));
    } catch {}

    return { success: true, corte: nuevoCorte };
};

// Cerrar turno / arqueo de caja con monto real y cálculo de diferencias
export const cerrarCorteCaja = async (id, datosCierre) => {
    const hoyStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    
    let corteActual = null;
    try {
        corteActual = JSON.parse(localStorage.getItem('gymton_corte_activo'));
    } catch {}

    const montoInicial = corteActual ? Number(corteActual.monto_inicial || corteActual.monto_calculado || 500) : Number(datosCierre.monto_inicial || 500);
    const totalVentas = Number(datosCierre.total_ventas || 0);
    const montoCalculado = montoInicial + totalVentas;
    const montoReal = Number(datosCierre.monto_real || 0);
    const diferencia = montoReal - montoCalculado;

    const payloadCierre = {
        id: Number(id),
        id_usuario: corteActual?.id_usuario ? Number(corteActual.id_usuario) : 1,
        fecha_apertura: corteActual?.fecha_apertura || hoyStr,
        fecha_cierre: hoyStr,
        total_ventas: String(totalVentas),
        monto_calculado: String(montoCalculado),
        monto_real: String(montoReal),
        diferencia: String(diferencia)
    };

    let corteActualizado = null;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadCierre)
        });
        if (res.ok) {
            corteActualizado = await res.json();
        }
    } catch (error) {
        console.warn('Registrando cierre en almacenamiento local:', error.message);
    }

    const corteCerrado = {
        ...(corteActual || {}),
        ...payloadCierre,
        id: corteActualizado?.id || id,
        monto_inicial: montoInicial,
        estado: diferencia === 0 ? 'cuadrada' : (diferencia > 0 ? 'sobrante' : 'faltante')
    };

    localStorage.removeItem('gymton_corte_activo');

    try {
        const list = JSON.parse(localStorage.getItem('gymton_cortes_caja') || '[]');
        const updatedList = list.map(c => c.id === corteCerrado.id ? corteCerrado : c);
        if (!updatedList.some(c => c.id === corteCerrado.id)) {
            updatedList.unshift(corteCerrado);
        }
        localStorage.setItem('gymton_cortes_caja', JSON.stringify(updatedList));
    } catch {}

    return { success: true, corte: corteCerrado };
};
