const API_URL = 'http://localhost:8080/api/corte_caja';

const getMetaCortes = () => {
    try {
        const raw = localStorage.getItem('gymton_cortes_meta');
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const saveMetaCorte = (id, meta) => {
    if (!id) return;
    try {
        const actual = getMetaCortes();
        actual[String(id)] = { ...(actual[String(id)] || {}), ...meta };
        localStorage.setItem('gymton_cortes_meta', JSON.stringify(actual));
    } catch (e) {
        console.warn('No se pudo guardar metadata de corte:', e);
    }
};

// Obtener todos los cortes de caja (con persistencia local en fallback y enriquecimiento de cajero y monto_inicial)
export const getCorteCaja = async () => {
    const metaMap = getMetaCortes();
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener cortes de caja');
        const data = await res.json();
        if (Array.isArray(data)) {
            const enriquecidos = data.map(c => {
                const meta = metaMap[String(c.id)] || {};
                const montoInicial = Number(c.monto_inicial ?? meta.monto_inicial ?? 500) || 500;
                return {
                    ...meta,
                    ...c,
                    monto_inicial: montoInicial,
                    cajero_nombre: c.cajero_nombre || meta.cajero_nombre || null
                };
            });
            localStorage.setItem('gymton_cortes_caja', JSON.stringify(enriquecidos));
            return enriquecidos;
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
                const conFondo = { ...activo, monto_inicial: Number(activo.monto_inicial) || 500 };
                localStorage.setItem('gymton_corte_activo', JSON.stringify(conFondo));
                return conFondo;
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
    const montoInicial = 500;

    const payloadParaBackend = {
        id_usuario: (datos.id_usuario && Number(datos.id_usuario) > 0) ? Number(datos.id_usuario) : 1,
        fecha_apertura: datos.fecha_apertura || hoyStr,
        fecha_cierre: null,
        total_ventas: "0.00",
        monto_calculado: "500.00",
        monto_real: "0.00",
        diferencia: "0.00"
    };

    const payload = {
        ...payloadParaBackend,
        monto_inicial: montoInicial,
        total_gastos: 0,
        tarjeta: 0,
        efectivo: 0
    };

    let corteCreado = null;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadParaBackend)
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
        monto_inicial: montoInicial,
        cajero_nombre: datos.cajero_nombre || null
    };

    saveMetaCorte(nuevoCorte.id, {
        id_usuario: nuevoCorte.id_usuario,
        cajero_nombre: nuevoCorte.cajero_nombre,
        monto_inicial: montoInicial
    });

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

    const montoInicial = 500;
    const totalVentas = Number(datosCierre.total_ventas || 0);
    const montoCalculado = montoInicial + totalVentas;
    const montoReal = Number(datosCierre.monto_real || 0);
    const diferencia = montoReal - montoCalculado;

    const idUsr = (datosCierre.id_usuario && Number(datosCierre.id_usuario) > 0) ? Number(datosCierre.id_usuario) : (corteActual?.id_usuario ? Number(corteActual.id_usuario) : 1);
    const payloadCierreBackend = {
        id_usuario: idUsr,
        fecha_apertura: corteActual?.fecha_apertura || hoyStr,
        fecha_cierre: hoyStr,
        total_ventas: String(totalVentas.toFixed(2)),
        monto_calculado: String(montoCalculado.toFixed(2)),
        monto_real: String(montoReal.toFixed(2)),
        diferencia: String(diferencia.toFixed(2))
    };

    const payloadCierre = {
        ...payloadCierreBackend,
        id: Number(id),
        monto_inicial: montoInicial,
        total_gastos: Number(datosCierre.total_gastos || 0),
        tarjeta: Number(datosCierre.tarjeta || datosCierre.ventas_tarjeta || 0),
        efectivo: Number(datosCierre.efectivo || datosCierre.ventas_efectivo || 0)
    };

    let corteActualizado = null;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadCierreBackend)
        });
        if (res.ok) {
            corteActualizado = await res.json();
        }
    } catch (error) {
        console.warn('Registrando cierre en almacenamiento local:', error.message);
    }

    const nombreCajero = datosCierre.cajero_nombre || corteActual?.cajero_nombre || null;

    const corteCerrado = {
        ...(corteActual || {}),
        ...payloadCierre,
        id: corteActualizado?.id || id,
        monto_inicial: montoInicial,
        cajero_nombre: nombreCajero,
        estado: diferencia === 0 ? 'cuadrada' : (diferencia > 0 ? 'sobrante' : 'faltante')
    };

    saveMetaCorte(corteCerrado.id, {
        id_usuario: corteCerrado.id_usuario,
        cajero_nombre: nombreCajero,
        monto_inicial: montoInicial,
        observaciones: datosCierre.observaciones || ''
    });

    localStorage.removeItem('gymton_corte_activo');

    try {
        const list = JSON.parse(localStorage.getItem('gymton_cortes_caja') || '[]');
        const updatedList = list.map(c => Number(c.id) === Number(corteCerrado.id) ? corteCerrado : c);
        if (!updatedList.some(c => Number(c.id) === Number(corteCerrado.id))) {
            updatedList.unshift(corteCerrado);
        }
        localStorage.setItem('gymton_cortes_caja', JSON.stringify(updatedList));
    } catch {}

    return { success: true, corte: corteCerrado };
};
