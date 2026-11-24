import { createDetalleCompra, getDetalleCompras } from './detalle_compra';
import { getApiUrl } from '../config/apiConfig';
import { getFechaHoraMexico } from '../Reutilizable/timeUtils';

const API_URL = getApiUrl('compra');

const getMetaCompras = () => {
    try {
        const raw = localStorage.getItem('gymton_compras_meta');
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const saveMetaCompra = (id, meta) => {
    if (!id) return;
    try {
        const actual = getMetaCompras();
        actual[String(id)] = { ...(actual[String(id)] || {}), ...meta };
        localStorage.setItem('gymton_compras_meta', JSON.stringify(actual));
    } catch (e) {
        console.warn('No se pudo guardar metadata de compra:', e);
    }
};

export const getCompras = async () => {
    const metaMap = getMetaCompras();
    let localCompras = [];
    try {
        localCompras = JSON.parse(localStorage.getItem('gymton_compras') || '[]');
    } catch {
        localCompras = [];
    }

    try {
        const [resCompras, detallesDB] = await Promise.all([
            fetch(API_URL),
            getDetalleCompras().catch(() => [])
        ]);
        if (!resCompras.ok) throw new Error('Error al obtener compras');
        const data = await resCompras.json();
        if (Array.isArray(data)) {
            // Si la base de datos fue vaciada/reiniciada a 0 registros, limpiar la persistencia local previa
            if (data.length === 0) {
                localStorage.removeItem('gymton_compras');
                localStorage.removeItem('gymton_compras_meta');
                return [];
            }

            const listaDetalles = Array.isArray(detallesDB) ? detallesDB : [];
            const enriquecidas = data.map(c => {
                const meta = metaMap[String(c.id)] ||
                             localCompras.find(lc => Number(lc.id) === Number(c.id)) || {};
                const detDB = listaDetalles.find(d => Number(d.id_compra) === Number(c.id));

                const idProducto = detDB?.id_producto ?? meta.id_producto ?? c.id_producto ?? null;
                const cantidad = Number(detDB?.cantidad ?? meta.cantidad ?? c.cantidad ?? 0);
                const costoUnitario = Number(detDB?.costo_unitario ?? meta.costo_unitario ?? meta.costo ?? c.costo_unitario ?? 0);
                const totalCompra = Number(c.total ?? detDB?.subtotal ?? meta.total ?? (cantidad * costoUnitario) ?? 0);

                return {
                    ...meta,
                    ...c,
                    id_proveedor: Number(c.id_proveedor || meta.id_proveedor || 1),
                    proveedor_nombre: meta.proveedor_nombre || c.proveedor_nombre || null,
                    id_producto: idProducto ? Number(idProducto) : null,
                    producto_nombre: meta.producto_nombre || c.producto_nombre || null,
                    cantidad: cantidad,
                    costo_unitario: costoUnitario,
                    total: totalCompra,
                    fecha: c.fecha || meta.fecha || getFechaHoraMexico()
                };
            });

            const idsEnBD = new Set(enriquecidas.map(e => Number(e.id)).filter(Boolean));
            const localesFaltantes = localCompras.filter(lc => lc.id && !idsEnBD.has(Number(lc.id)));
            const combinadas = [...localesFaltantes, ...enriquecidas];

            localStorage.setItem('gymton_compras', JSON.stringify(combinadas));
            return combinadas;
        }
        return localCompras;
    } catch (error) {
        console.warn('API Compras no disponible, recurriendo a almacenamiento local:', error.message);
        return localCompras;
    }
};

export const createCompra = async (data) => {
    const cant = Number(data.cantidad) || 1;
    const costoUnit = Number(data.costo_unitario ?? data.costo) || 0;
    const totalCalc = Number(data.total) || (cant * costoUnit);
    const fechaSQL = data.fecha || getFechaHoraMexico();

    const compraPayload = {
        id_usuario: data.id_usuario ? Number(data.id_usuario) : 1,
        id_proveedor: data.id_proveedor ? Number(data.id_proveedor) : 1,
        fecha: fechaSQL,
        total: String(totalCalc),
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
    let idCompraReal = compraGuardada?.id;
    if (!idCompraReal) {
        try {
            const resLista = await fetch(API_URL);
            if (resLista.ok) {
                const todas = await resLista.json();
                if (Array.isArray(todas) && todas.length > 0) {
                    idCompraReal = Math.max(...todas.map(item => Number(item.id) || 0));
                }
            }
        } catch {}
    }

    if (idCompraReal && data.id_producto) {
        await createDetalleCompra({
            id_compra: idCompraReal,
            id_producto: Number(data.id_producto),
            cantidad: String(cant),
            costo_unitario: String(costoUnit),
            subtotal: String(totalCalc)
        });
    }

    const compraFinal = {
        ...data,
        id: idCompraReal || Date.now(),
        id_usuario: compraPayload.id_usuario,
        id_proveedor: compraPayload.id_proveedor,
        proveedor_nombre: data.proveedor_nombre || null,
        id_producto: data.id_producto ? Number(data.id_producto) : null,
        producto_nombre: data.producto_nombre || null,
        cantidad: cant,
        costo_unitario: costoUnit,
        total: totalCalc,
        fecha: fechaSQL
    };

    saveMetaCompra(compraFinal.id, {
        id_proveedor: compraFinal.id_proveedor,
        proveedor_nombre: compraFinal.proveedor_nombre,
        id_producto: compraFinal.id_producto,
        producto_nombre: compraFinal.producto_nombre,
        cantidad: compraFinal.cantidad,
        costo_unitario: compraFinal.costo_unitario,
        total: compraFinal.total,
        fecha: compraFinal.fecha
    });

    try {
        const prev = JSON.parse(localStorage.getItem('gymton_compras') || '[]');
        const sinDup = prev.filter(p => Number(p.id) !== Number(compraFinal.id));
        localStorage.setItem('gymton_compras', JSON.stringify([compraFinal, ...sinDup]));
    } catch (e) {
        console.error('Error guardando compra local:', e);
    }

    return compraFinal;
};
