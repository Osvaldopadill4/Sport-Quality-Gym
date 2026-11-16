import { getApiUrl } from '../config/apiConfig';

const API_URL = getApiUrl('acceso');

// Obtener historial completo de accesos desde la base de datos MySQL
export const getAcceso = async () => {
    try {
        const res = await fetch(`${API_URL}/historial`);
        if (!res.ok) {
            const resFallback = await fetch(API_URL);
            if (!resFallback.ok) throw new Error('Error al obtener accesos');
            return await resFallback.json();
        }
        return await res.json();
    } catch (error) {
        console.warn('API de acceso no disponible (usando local/fallback):', error.message);
        return [];
    }
};

// Generar token JWT temporal para el cliente (expira en 60 segundos)
export const generarQrCliente = async (clienteId) => {
    try {
        const res = await fetch(`${API_URL}/generar-qr/${clienteId}`);
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.mensaje || 'Error al generar QR dinámico');
        }
        return await res.json(); // { error: false, token: "...", clienteNombre: "...", mensaje: "..." }
    } catch (error) {
        console.warn('No se pudo generar QR dinámico desde backend:', error.message);
        return null;
    }
};

// Validar token QR en recepción / torniquete y registrar el acceso en MySQL
export const validarQrAcceso = async (token) => {
    try {
        const res = await fetch(`${API_URL}/validar-qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return {
                acceso: false,
                mensaje: data.mensaje || 'Acceso denegado: Código QR expirado o inválido'
            };
        }
        return data; // { acceso: true, clienteId, clienteNombre, horaEntrada, mensaje }
    } catch (error) {
        console.warn('Error al conectar con validador de QR en backend:', error.message);
        return null;
    }
};

// Validar token QR ejecutando el Stored Procedure `sp_registrar_acceso` en MySQL
export const validarQrAccesoConProcedure = async (token) => {
    try {
        const res = await fetch(`${API_URL}/validar-qr-con-procedure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return {
                acceso: false,
                mensaje: data.mensaje || 'Acceso denegado: Código QR expirado o inválido'
            };
        }
        return data; // { acceso: boolean, clienteId, clienteNombre, mensaje, resultado }
    } catch (error) {
        console.warn('Error al conectar con validador de procedure en backend:', error.message);
        return null;
    }
};

// Obtener historial de accesos de un cliente específico
export const getHistorialPorCliente = async (clienteId) => {
    try {
        const res = await fetch(`${API_URL}/historial/${clienteId}`);
        if (!res.ok) throw new Error('Error al obtener historial del cliente');
        return await res.json();
    } catch (error) {
        console.warn('Error al consultar historial del cliente:', error.message);
        return [];
    }
};

export const createAcceso = async (data) => {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.warn('Error en createAcceso:', error.message);
        return null;
    }
};

export const updateAcceso = async (id, data) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
};

export const deleteAcceso = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    return res.ok;
};
