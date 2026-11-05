import { useState, useEffect } from 'react';
import { createVenta } from '../JS/venta';
import { getProductos, updateProductos } from '../JS/producto';
import { getClientes } from '../JS/cliente';
import { getMembresias, updateMembresias, createMembresias } from '../JS/membresia';
import {
  sp_generar_folio,
  fn_calcular_subtotal_producto,
  fn_calcular_descuento,
  trg_evitar_stock_negativo,
  trg_actualizar_stock_venta,
  sp_renovar_membresia
} from './objetosSQL';

/**
 * Hook Reutilizable `usePuntoVenta`:
 * Centraliza las consultas, carrito, cobro y sincronización con objetos SQL:
 * - Procedimiento: `sp_generar_folio`, `sp_renovar_membresia`
 * - Funciones: `fn_calcular_subtotal_producto`, `fn_calcular_descuento`
 * - Triggers: `trg_evitar_stock_negativo`, `trg_actualizar_stock_venta`
 */
export function usePuntoVenta({ loggedUser, renovacionPendiente, onRenovacionCompletada }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return { id: 1, nombre: 'Operador Caja' };
    }
  })();

  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('Público General');
  const [clienteIdSeleccionado, setClienteIdSeleccionado] = useState(null);
  const [socios, setSocios] = useState([]);
  const [busquedaSocioTicket, setBusquedaSocioTicket] = useState('');
  const [mostrarBuscadorSocios, setMostrarBuscadorSocios] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [ticketVenta, setTicketVenta] = useState(null);

  // Manejar renovación transferida desde el módulo de Membresías o Clientes
  useEffect(() => {
    const datosRenov = renovacionPendiente || (() => {
      try {
        const saved = localStorage.getItem('gymton_renovacion_pendiente');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })();

    if (datosRenov && (datosRenov.cliente_id || datosRenov.cliente_nombre)) {
      const idCli = Number(datosRenov.cliente_id) || null;
      const socioEnCatalogo = socios.find(s => Number(s.id) === idCli);
      const nombreSocioReal = (socioEnCatalogo && socioEnCatalogo.nombre)
        ? socioEnCatalogo.nombre
        : (datosRenov.cliente_nombre || 'Socio');

      setClienteIdSeleccionado(idCli);
      setClienteSeleccionado(nombreSocioReal);

      const durDias = Math.min(365, Number(datosRenov.duracion_dias) || 30);
      const prefijo = datosRenov.es_nueva ? 'Alta' : 'Renovación';
      const itemRenov = {
        id: `renovacion-${datosRenov.id_plan || 1}-${datosRenov.membresia_id || idCli}`,
        nombre: `${prefijo}: Plan ${datosRenov.plan_nombre || 'Membresía'} (${durDias} días)`,
        precio: Math.min(9999, Number(datosRenov.precio) || 350),
        stock: 999,
        categoria: 'Membresías',
        cant: 1,
        es_membresia: true,
        id_plan: Number(datosRenov.id_plan) || 2,
        plan_nombre: datosRenov.plan_nombre || 'Membresía',
        cliente_id: idCli,
        cliente_nombre: nombreSocioReal,
        membresia_id: Number(datosRenov.membresia_id) || null,
        duracion_dias: durDias
      };

      setCarrito(prev => {
        const filtrados = prev.filter(i => !(i.es_membresia && Number(i.membresia_id) === Number(datosRenov.membresia_id)));
        return [itemRenov, ...filtrados];
      });

      setAlerta({
        mensaje: `${prefijo} de membresía cargada para ${nombreSocioReal}. Seleccione Cobrar Ticket para recibir el pago en Caja.`,
        tipo: 'info'
      });
    }
  }, [renovacionPendiente, socios]);

  useEffect(() => {
    getProductos().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setProductos(data.filter(p => p.estado === 1 || p.estado === 'Activo' || p.estado === '1'));
      } else {
        const local = localStorage.getItem('gymton_productos');
        if (local) {
          try {
            setProductos(JSON.parse(local).filter(p => p.estado === 1 || p.estado === 'Activo' || p.estado === '1'));
            return;
          } catch (e) { console.error(e); }
        }
        setProductos([
          { id: 1, nombre: 'Agua Purificada 500ml', precio: 15, stock: 50, categoria: 'Bebidas' },
          { id: 2, nombre: 'Proteína Whey 1 Scoop', precio: 30, stock: 20, categoria: 'Suplementos' },
          { id: 3, nombre: 'Barra Energética Avena', precio: 25, stock: 15, categoria: 'Snacks' },
          { id: 4, nombre: 'Creatina 1 Scoop 5g', precio: 20, stock: 30, categoria: 'Suplementos' }
        ]);
      }
    });

    getClientes().then(data => {
      const lista = Array.isArray(data) ? data :
                    (data && Array.isArray(data.content)) ? data.content :
                    (data && Array.isArray(data.data)) ? data.data : null;
      if (Array.isArray(lista) && lista.length > 0) {
        setSocios(lista);
      } else {
        const local = localStorage.getItem('gymton_clientes');
        if (local) {
          try { setSocios(JSON.parse(local)); } catch {}
        }
      }
    }).catch(() => {});
  }, []);

  const agregarAlCarrito = (prod) => {
    const existe = carrito.find(item => item.id === prod.id);
    const cantActual = existe ? (Number(existe.cant) || 0) : 0;

    // Trigger SQL `trg_evitar_stock_negativo`
    const checkStock = trg_evitar_stock_negativo(prod.stock ?? prod, cantActual + 1);
    if (!checkStock.valido) {
      setAlerta({ mensaje: `Stock insuficiente (${prod.nombre} - Disponibles: ${prod.stock})`, tipo: 'error' });
      return;
    }

    if (existe) {
      setCarrito(carrito.map(item => item.id === prod.id ? { ...item, cant: Math.min(99, cantActual + 1) } : item));
    } else {
      setCarrito([...carrito, { ...prod, cant: 1 }]);
    }
  };

  const modificarCant = (id, delta) => {
    const item = carrito.find(c => c.id === id);
    if (!item) return;

    const cantActual = Number(item.cant) || 1;
    const nuevaCant = cantActual + delta;

    if (delta > 0) {
      if (nuevaCant > 99) return;
      const checkStock = trg_evitar_stock_negativo(item.stock ?? item, nuevaCant);
      if (!checkStock.valido) {
        setAlerta({ mensaje: `No hay más stock disponible de ${item.nombre} (Disponibles: ${item.stock})`, tipo: 'warning' });
        return;
      }
    }

    setCarrito(carrito.map(c => {
      if (c.id === id) {
        return nuevaCant > 0 ? { ...c, cant: Math.min(99, nuevaCant) } : c;
      }
      return c;
    }));
  };

  // Permite ingresar la cantidad directamente como texto en el carrito (máximo 2 dígitos: 1 a 99)
  const establecerCantidad = (id, nuevaCantidad) => {
    const item = carrito.find(c => c.id === id);
    if (!item) return;

    if (nuevaCantidad === '' || nuevaCantidad === null || nuevaCantidad === undefined) {
      setCarrito(carrito.map(c => c.id === id ? { ...c, cant: '' } : c));
      return;
    }

    let cantNum = parseInt(nuevaCantidad, 10);
    if (isNaN(cantNum) || cantNum < 1) cantNum = 1;
    if (cantNum > 99) cantNum = 99;

    if (!item.es_membresia && item.stock !== undefined && item.stock !== null) {
      const checkStock = trg_evitar_stock_negativo(item.stock, cantNum);
      if (!checkStock.valido) {
        setAlerta({
          mensaje: `Stock insuficiente para ${item.nombre} (Disponibles: ${item.stock})`,
          tipo: 'warning'
        });
        cantNum = Math.min(Number(item.stock) || 1, 99);
      }
    }

    setCarrito(carrito.map(c => c.id === id ? { ...c, cant: cantNum } : c));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // Cálculo de totales con las funciones SQL `fn_calcular_subtotal_producto` y `fn_calcular_descuento`
  const subtotalBruto = carrito.reduce((sum, item) => sum + fn_calcular_subtotal_producto(item.precio, Number(item.cant) || 0), 0);
  const montoDescuento = fn_calcular_descuento(subtotalBruto, descuentoPorcentaje);
  const totalPagar = Math.max(0, subtotalBruto - montoDescuento);

  const procesarVenta = async (metodo) => {
    if (carrito.length === 0) return;

    // Normalizar cualquier cantidad vacía a 1
    const carritoNormalizado = carrito.map(item => ({
      ...item,
      cant: Number(item.cant) > 0 ? Number(item.cant) : 1
    }));

    const itemsMembresia = carritoNormalizado.filter(item => item.es_membresia);
    const idClienteResuelto = clienteIdSeleccionado || itemsMembresia[0]?.cliente_id || (() => {
      const m = String(clienteSeleccionado || '').match(/#(\d+)/);
      return m ? Number(m[1]) : null;
    })();

    const socioObj = socios.find(s => Number(s.id) === Number(idClienteResuelto));
    const nombreClienteLimpio = socioObj?.nombre || itemsMembresia[0]?.cliente_nombre || String(clienteSeleccionado).replace(/\s*\(Socio #\d+\)/, '').trim();
    const etiquetaClienteFinal = idClienteResuelto
      ? nombreClienteLimpio
      : clienteSeleccionado;

    let listaMembresiasBD = [];
    if (itemsMembresia.length > 0) {
      try {
        const resM = await getMembresias();
        if (Array.isArray(resM)) listaMembresiasBD = resM;
      } catch {
        try {
          listaMembresiasBD = JSON.parse(localStorage.getItem('gymton_membresias') || '[]');
        } catch {}
      }

      for (const mItem of itemsMembresia) {
        const mActual = listaMembresiasBD.find(m => Number(m.id) === Number(mItem.membresia_id)) ||
                        listaMembresiasBD.find(m => Number(m.id_cliente) === Number(idClienteResuelto));
        const dur = Math.min(365, Number(mItem.duracion_dias) || 30) * (Number(mItem.cant) || 1);
        const calcRenov = sp_renovar_membresia(mActual, { id: mItem.id_plan, nombre: mItem.plan_nombre, duracion_dias: dur });
        if (!calcRenov.permitido) {
          setAlerta({ mensaje: calcRenov.mensaje, tipo: 'error' });
          return;
        }
      }
    }

    // 1. Generar folio con procedimiento `sp_generar_folio`
    const folioGenerado = sp_generar_folio();
    const ahora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fechaSQL = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())} ${pad(ahora.getHours())}:${pad(ahora.getMinutes())}:${pad(ahora.getSeconds())}`;

    const subtotalFinal = carritoNormalizado.reduce((sum, item) => sum + fn_calcular_subtotal_producto(item.precio, item.cant), 0);
    const montoDescuentoFinal = fn_calcular_descuento(subtotalFinal, descuentoPorcentaje);
    const totalPagarFinal = Math.max(0, subtotalFinal - montoDescuentoFinal);

    const ventaPayload = {
      folio: folioGenerado,
      id_usuario: usuarioActivo?.id || 1,
      empleado: usuarioActivo ? `${usuarioActivo.nombre} ${usuarioActivo.apellido || ''}`.trim() : 'Cajero',
      id_cliente: idClienteResuelto,
      cliente: etiquetaClienteFinal,
      fecha: fechaSQL,
      metodo_pago: metodo,
      id_modopago: metodo === 'Tarjeta' ? 2 : 1,
      subtotal: subtotalFinal,
      descuento: montoDescuentoFinal,
      descuento_porcentaje: descuentoPorcentaje,
      total: totalPagarFinal,
      es_membresia: itemsMembresia.length > 0,
      tipo_venta: itemsMembresia.length > 0 && itemsMembresia.length === carritoNormalizado.length
        ? 'Membresía'
        : (itemsMembresia.length > 0 ? 'Mixta (Membresía + Tienda)' : 'Tienda / Mostrador'),
      detalles: carritoNormalizado.map(item => ({
        id_producto: item.es_membresia ? null : Number(item.id),
        id_plan: item.es_membresia ? Number(item.id_plan || 2) : null,
        es_membresia: Boolean(item.es_membresia),
        articulo: item.nombre,
        cantidad: item.cant,
        precio_unitario: item.precio,
        subtotal: fn_calcular_subtotal_producto(item.precio, item.cant)
      }))
    };

    let ventaPersistidaEnBD = false;
    try {
      const resVenta = await createVenta(ventaPayload);
      ventaPersistidaEnBD = Boolean(resVenta && resVenta.id && Number(resVenta.id) < 1000000000);
    } catch (errV) {
      console.warn('Fallback local en venta:', errV);
    }

    // Si la venta incluye membresía, asegurar sincronización local y de base de datos
    if (itemsMembresia.length > 0) {
      try {
        const membsLocal = listaMembresiasBD.length > 0
          ? [...listaMembresiasBD]
          : JSON.parse(localStorage.getItem('gymton_membresias') || '[]');

        for (const mItem of itemsMembresia) {
          const mIdx = membsLocal.findIndex(m =>
            (mItem.membresia_id && Number(m.id) === Number(mItem.membresia_id)) ||
            (idClienteResuelto && Number(m.id_cliente) === Number(idClienteResuelto))
          );

          const dur = Math.min(365, Number(mItem.duracion_dias) || 30) * (Number(mItem.cant) || 1);

          if (mIdx !== -1) {
            const mActual = membsLocal[mIdx];
            const calcRenov = sp_renovar_membresia(mActual, { id: mItem.id_plan, nombre: mItem.plan_nombre, duracion_dias: dur });

            const membresiaActualizada = {
              ...mActual,
              id: mActual.id,
              id_cliente: Number(idClienteResuelto || mActual.id_cliente),
              cliente_nombre: nombreClienteLimpio || mActual.cliente_nombre,
              id_plan: Number(mItem.id_plan || mActual.id_plan),
              plan_nombre: mItem.plan_nombre || mActual.plan_nombre,
              duracion_dias: dur,
              fecha_inicio: calcRenov.fecha_inicio,
              fecha_vencimiento: calcRenov.fecha_vencimiento,
              estado: 'activa'
            };

            membsLocal[mIdx] = membresiaActualizada;
            await updateMembresias(mActual.id, membresiaActualizada);
          } else if (idClienteResuelto) {
            const calcNueva = sp_renovar_membresia(null, { id: mItem.id_plan, nombre: mItem.plan_nombre, duracion_dias: dur });
            const nuevaMemb = {
              id_cliente: Number(idClienteResuelto),
              cliente_nombre: nombreClienteLimpio,
              id_plan: Number(mItem.id_plan || 2),
              plan_nombre: mItem.plan_nombre || 'Mensual',
              duracion_dias: dur,
              fecha_inicio: calcNueva.fecha_inicio,
              fecha_vencimiento: calcNueva.fecha_vencimiento,
              estado: 'activa'
            };
            const creada = await createMembresias(nuevaMemb);
            membsLocal.unshift(creada || { ...nuevaMemb, id: Date.now() });
          }
        }

        localStorage.setItem('gymton_membresias', JSON.stringify(membsLocal));
        localStorage.removeItem('gymton_renovacion_pendiente');
        if (onRenovacionCompletada) onRenovacionCompletada();
      } catch (err) {
        console.error('Error al actualizar membresía tras venta:', err);
      }
    }

    // Trigger SQL `trg_actualizar_stock_venta`:
    const productosActualizados = trg_actualizar_stock_venta(productos, carritoNormalizado);
    if (!ventaPersistidaEnBD) {
      productosActualizados.forEach(p => {
        const enCarro = carritoNormalizado.find(c => c.id === p.id);
        if (enCarro && !enCarro.es_membresia) {
          updateProductos(p.id, p).catch(() => {});
        }
      });
    }

    setProductos(productosActualizados);
    try {
      localStorage.setItem('gymton_productos', JSON.stringify(productosActualizados));
    } catch {}

    setTicketVenta(ventaPayload);
    setCarrito([]);
    setDescuentoPorcentaje(0);
    const mensajeExito = itemsMembresia.length > 0
      ? `¡Cobro completado y Membresía activada con éxito! Folio generado: ${folioGenerado}`
      : `¡Venta registrada con éxito! Folio generado: ${folioGenerado}`;
    setAlerta({ mensaje: mensajeExito, tipo: 'success' });
  };

  const productosUnicos = productos.filter((p, index, self) =>
    index === self.findIndex(t => t.id === p.id || (t.nombre && p.nombre && t.nombre.toLowerCase().trim() === p.nombre.toLowerCase().trim() && Number(t.precio) === Number(p.precio)))
  );

  const productosFiltrados = productosUnicos.filter(p =>
    (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
    (p.categoria && p.categoria.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return {
    productosFiltrados,
    carrito,
    busqueda,
    setBusqueda,
    descuentoPorcentaje,
    setDescuentoPorcentaje,
    clienteSeleccionado,
    setClienteSeleccionado,
    clienteIdSeleccionado,
    setClienteIdSeleccionado,
    socios,
    busquedaSocioTicket,
    setBusquedaSocioTicket,
    mostrarBuscadorSocios,
    setMostrarBuscadorSocios,
    alerta,
    setAlerta,
    ticketVenta,
    setTicketVenta,
    subtotalBruto,
    montoDescuento,
    totalPagar,
    agregarAlCarrito,
    modificarCant,
    establecerCantidad,
    eliminarDelCarrito,
    procesarVenta,
    fnCalcularSubtotal: fn_calcular_subtotal_producto
  };
}
