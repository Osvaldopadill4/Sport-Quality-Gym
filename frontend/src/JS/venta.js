import { createDetalleVenta, getDetalleVentas } from './detalle_venta';

const API_URL = 'http://localhost:8080/api/venta';

const getMetaVentas = () => {
    try {
        const raw = localStorage.getItem('gymton_ventas_meta');
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const saveMetaVenta = (key, meta) => {
    if (!key) return;
    try {
        const actual = getMetaVentas();
        actual[String(key)] = { ...(actual[String(key)] || {}), ...meta };
        localStorage.setItem('gymton_ventas_meta', JSON.stringify(actual));
    } catch (e) {
        console.warn('No se pudo guardar metadata de venta:', e);
    }
};

export const getVenta = async () => {
    const metaMap = getMetaVentas();
    let localVentas = [];
    try {
        localVentas = JSON.parse(localStorage.getItem('gymton_ventas') || '[]');
    } catch {
        localVentas = [];
    }

    try {
        const [resVentas, detallesDB] = await Promise.all([
            fetch(API_URL),
            getDetalleVentas().catch(() => [])
        ]);
        if (!resVentas.ok) throw new Error('Error al obtener ventas');
        const data = await resVentas.json();
        if (Array.isArray(data)) {
            // Si la base de datos fue vaciada/reiniciada a 0 registros, limpiar la persistencia local previa
            if (data.length === 0) {
                localStorage.removeItem('gymton_ventas');
                localStorage.removeItem('gymton_ventas_meta');
                return [];
            }

            const listaDetalles = Array.isArray(detallesDB) ? detallesDB : [];
            const enriquecidas = data.map(v => {
                const meta = metaMap[String(v.id)] || (v.folio ? metaMap[String(v.folio)] : null) ||
                             localVentas.find(lv => (v.folio && lv.folio === v.folio) || Number(lv.id) === Number(v.id)) || {};
                const detsDB = listaDetalles.filter(d => Number(d.id_venta) === Number(v.id));

                let detallesFinales = [];
                if (Array.isArray(meta.detalles) && meta.detalles.length > 0) {
                    detallesFinales = meta.detalles;
                } else if (detsDB.length > 0) {
                    detallesFinales = detsDB.map(d => ({
                        id: d.id,
                        id_venta: d.id_venta,
                        id_producto: d.id_producto || null,
                        id_plan: d.id_plan || null,
                        es_membresia: Boolean(d.id_plan && !d.id_producto),
                        articulo: d.id_plan ? `Membresía / Plan #${d.id_plan}` : `Producto #${d.id_producto}`,
                        cantidad: Number(d.cantidad) || 1,
                        precio_unitario: Number(d.precio_unitario) || 0,
                        subtotal: Number(d.subtotal) || 0
                    }));
                }

                const tieneMembresia = Boolean(
                    meta.es_membresia ||
                    detallesFinales.some(d => d.es_membresia || d.id_plan || String(d.articulo || '').toLowerCase().match(/membres|plan|renov/))
                );

                const modoPagoNombre = Number(v.id_modopago) === 2 ? 'Tarjeta' : (meta.metodo_pago || 'Efectivo');

                return {
                    ...meta,
                    ...v,
                    id_cliente: v.id_cliente ?? meta.id_cliente ?? null,
                    id_modopago: v.id_modopago ?? (meta.id_modopago || (modoPagoNombre === 'Tarjeta' ? 2 : 1)),
                    metodo_pago: modoPagoNombre,
                    cliente: meta.cliente || (v.id_cliente ? `Socio #${v.id_cliente}` : 'Público General'),
                    empleado: meta.empleado || (v.id_usuario ? `Usuario #${v.id_usuario}` : 'Cajero'),
                    subtotal: meta.subtotal ?? Number(v.total || 0),
                    descuento: meta.descuento ?? 0,
                    descuento_porcentaje: meta.descuento_porcentaje ?? 0,
                    es_membresia: tieneMembresia,
                    tipo_venta: meta.tipo_venta || (tieneMembresia ? 'Membresía' : 'Tienda / Mostrador'),
                    detalles: detallesFinales
                };
            });

            // Agregar ventas que solo existan localmente
            const foliosEnBD = new Set(enriquecidas.map(e => e.folio).filter(Boolean));
            const idsEnBD = new Set(enriquecidas.map(e => Number(e.id)).filter(Boolean));
            const localesFaltantes = localVentas.filter(lv => {
                if (lv.folio && foliosEnBD.has(lv.folio)) return false;
                if (lv.id && idsEnBD.has(Number(lv.id))) return false;
                return true;
            });

            const combinadas = [...localesFaltantes, ...enriquecidas];
            const unicas = combinadas.filter((item, idx, self) =>
                idx === self.findIndex(t => (t.folio && item.folio && t.folio === item.folio) || (t.id && item.id && Number(t.id) === Number(item.id)))
            );

            localStorage.setItem('gymton_ventas', JSON.stringify(unicas));
            return unicas;
        }
        return localVentas;
    } catch (error) {
        console.warn('API Ventas no disponible, recurriendo a almacenamiento local:', error.message);
        return localVentas;
    }
};

export const createVenta = async (data) => {
    // 1. Extraer ID del cliente si viene en formato texto "Nombre (Socio #123)"
    let clienteId = null;
    if (data.id_cliente !== undefined && data.id_cliente !== null && data.id_cliente !== '') {
        clienteId = Number(data.id_cliente);
    } else if (typeof data.cliente === 'string') {
        const match = data.cliente.match(/#(\d+)/);
        if (match) clienteId = Number(match[1]);
    }
    if (clienteId && clienteId <= 0) clienteId = null;

    const fechaSQL = (data.fecha && /^\d{4}-\d{2}-\d{2}/.test(data.fecha))
        ? data.fecha
        : new Date().toISOString().replace('T', ' ').slice(0, 19);

    const modoPagoId = (data.id_modopago && Number(data.id_modopago))
        ? Number(data.id_modopago)
        : (String(data.metodo_pago || '').toLowerCase() === 'tarjeta' ? 2 : 1);

    // 2. Estructura compatible EXACTA con Venta.java del Backend y DB
    const ventaPayload = {
        id_usuario: (data.id_usuario && Number(data.id_usuario) > 0) ? Number(data.id_usuario) : 1,
        id_cliente: clienteId,
        id_modopago: modoPagoId,
        fecha: fechaSQL,
        total: String(data.total || 0),
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
        } else {
            console.warn('API Venta devolvió error HTTP:', res.status);
        }
    } catch (error) {
        console.warn('API Venta no disponible, usando registro local:', error.message);
    }

    // 3. Si la venta se registró en el Backend, enviar cada detalle a /api/detalle_venta
    if (ventaGuardada && ventaGuardada.id && Array.isArray(data.detalles)) {
        for (const d of data.detalles) {
            try {
                await createDetalleVenta({
                    id_venta: ventaGuardada.id,
                    id_producto: (d.id_producto && Number(d.id_producto) > 0) ? Number(d.id_producto) : null,
                    id_plan: (d.id_plan && Number(d.id_plan) > 0) ? Number(d.id_plan) : null,
                    cantidad: String(d.cantidad || 1),
                    precio_unitario: String(d.precio_unitario || 0),
                    subtotal: String(d.subtotal || 0)
                });
            } catch (errDet) {
                console.warn('Error al registrar detalle_venta:', errDet);
            }
        }
    }

    const tieneMembresia = Boolean(
        data.es_membresia ||
        (Array.isArray(data.detalles) && data.detalles.some(d => d.es_membresia || d.id_plan || String(d.articulo || '').toLowerCase().match(/membres|plan|renov/)))
    );

    // 4. Persistir la venta enriquecida en el localStorage y en gymton_ventas_meta
    const ventaFinal = {
        ...data,
        id: ventaGuardada?.id || data.id || Date.now(),
        fecha: fechaSQL,
        id_usuario: ventaPayload.id_usuario,
        id_cliente: clienteId,
        id_modopago: modoPagoId,
        metodo_pago: modoPagoId === 2 ? 'Tarjeta' : 'Efectivo',
        es_membresia: tieneMembresia,
        tipo_venta: data.tipo_venta || (tieneMembresia ? 'Membresía' : 'Tienda / Mostrador')
    };

    const metaObj = {
        id_cliente: clienteId,
        cliente: ventaFinal.cliente || 'Público General',
        empleado: ventaFinal.empleado || 'Cajero',
        subtotal: ventaFinal.subtotal ?? Number(ventaFinal.total || 0),
        descuento: ventaFinal.descuento ?? 0,
        descuento_porcentaje: ventaFinal.descuento_porcentaje ?? 0,
        id_modopago: modoPagoId,
        metodo_pago: modoPagoId === 2 ? 'Tarjeta' : 'Efectivo',
        es_membresia: tieneMembresia,
        tipo_venta: ventaFinal.tipo_venta,
        detalles: ventaFinal.detalles || []
    };

    saveMetaVenta(ventaFinal.id, metaObj);
    if (ventaFinal.folio) {
        saveMetaVenta(ventaFinal.folio, metaObj);
    }

    try {
        const prev = JSON.parse(localStorage.getItem('gymton_ventas') || '[]');
        const sinDuplicado = prev.filter(p => !(p.folio && ventaFinal.folio && p.folio === ventaFinal.folio) && Number(p.id) !== Number(ventaFinal.id));
        localStorage.setItem('gymton_ventas', JSON.stringify([ventaFinal, ...sinDuplicado]));
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
