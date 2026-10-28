import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Search, Receipt, Percent, Printer, User, X } from 'lucide-react';
import '../../CSS/PuntoVenta.css';
import { createVenta } from '../../JS/venta';
import { getProductos, updateProductos } from '../../JS/producto';
import { getClientes } from '../../JS/cliente';
import Toast from '../Componentes/Toast';

// Procedimiento SQL `sp_generar_folio`:
// Retorna 'V-YYYYMMDDHHMMSS-XXXXXX'
export const spGenerarFolio = () => {
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const dd = String(ahora.getDate()).padStart(2, '0');
  const hh = String(ahora.getHours()).padStart(2, '0');
  const mi = String(ahora.getMinutes()).padStart(2, '0');
  const ss = String(ahora.getSeconds()).padStart(2, '0');
  const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
  return `V-${yyyy}${mm}${dd}${hh}${mi}${ss}-${hex}`;
};

// Función SQL `fn_calcular_subtotal_producto`:
export const fnCalcularSubtotal = (precio, cantidad) => {
  return Number(precio) * Number(cantidad);
};

// Función SQL `fn_calcular_descuento`:
export const fnCalcularDescuento = (precio, porcentaje) => {
  if (precio < 0 || porcentaje < 0 || porcentaje > 100) return 0;
  return Number((precio * porcentaje / 100).toFixed(2));
};

export default function PuntoVenta({ loggedUser, renovacionPendiente, onRenovacionCompletada }) {
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
  const [socios, setSocios] = useState([]);
  const [busquedaSocioTicket, setBusquedaSocioTicket] = useState('');
  const [mostrarBuscadorSocios, setMostrarBuscadorSocios] = useState(false);
  const [alerta, setAlerta] = useState(null);

  // Modal de Ticket / Recibo basado en la vista `vw_detalle_ventas`
  const [ticketVenta, setTicketVenta] = useState(null);

  // Manejar renovación transferida desde el módulo de Membresías
  useEffect(() => {
    const datosRenov = renovacionPendiente || (() => {
      try {
        const saved = localStorage.getItem('gymton_renovacion_pendiente');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })();

    if (datosRenov && datosRenov.cliente_nombre) {
      setClienteSeleccionado(`${datosRenov.cliente_nombre} (Socio #${datosRenov.cliente_id})`);
      const itemRenov = {
        id: `renovacion-${datosRenov.id_plan}-${Date.now()}`,
        nombre: `Renovación: Plan ${datosRenov.plan_nombre} (${datosRenov.duracion_dias || 30} días)`,
        precio: Number(datosRenov.precio) || 350,
        stock: 999,
        categoria: 'Membresías',
        cant: 1,
        es_membresia: true,
        membresia_id: datosRenov.membresia_id,
        duracion_dias: datosRenov.duracion_dias || 30
      };

      setCarrito(prev => {
        const yaEsta = prev.find(i => i.membresia_id === datosRenov.membresia_id);
        return yaEsta ? prev : [itemRenov, ...prev];
      });

      setAlerta({
        mensaje: `Renovación de membresía precargada para ${datosRenov.cliente_nombre}. Seleccione Efectivo o Tarjeta para cobrar y renovar.`,
        tipo: 'info'
      });
    }
  }, [renovacionPendiente]);

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
          } catch(e) { console.error(e); }
        }
        setProductos([
          { id: 1, nombre: 'Agua Purificada 500ml', precio: 15, stock: 50, categoria: 'Bebidas' },
          { id: 2, nombre: 'Proteína Whey 1 Scoop', precio: 30, stock: 20, categoria: 'Suplementos' },
          { id: 3, nombre: 'Barra Energética Avena', precio: 25, stock: 15, categoria: 'Snacks' },
          { id: 4, nombre: 'Creatina 1 Scoop 5g', precio: 20, stock: 30, categoria: 'Suplementos' }
        ]);
      }
    });

    // Cargar socios / clientes registrados desde la BD para el ticket
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
    const cantActual = existe ? existe.cant : 0;

    // Validación de stock (equivalente a trg_validar_stock_venta)
    if (cantActual + 1 > Number(prod.stock)) {
      setAlerta({ mensaje: `Stock insuficiente para ${prod.nombre} (Disponibles: ${prod.stock})`, tipo: 'error' });
      return;
    }

    if (existe) {
      setCarrito(carrito.map(item => item.id === prod.id ? { ...item, cant: item.cant + 1 } : item));
    } else {
      setCarrito([...carrito, { ...prod, cant: 1 }]);
    }
  };

  const modificarCant = (id, delta) => {
    const item = carrito.find(c => c.id === id);
    if (!item) return;

    if (delta > 0 && item.cant + delta > Number(item.stock)) {
      setAlerta({ mensaje: `No hay más stock disponible de ${item.nombre}`, tipo: 'warning' });
      return;
    }

    setCarrito(carrito.map(c => {
      if (c.id === id) {
        const nuevaCant = c.cant + delta;
        return nuevaCant > 0 ? { ...c, cant: nuevaCant } : c;
      }
      return c;
    }));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // Cálculo de totales con las funciones SQL:
  const subtotalBruto = carrito.reduce((sum, item) => sum + fnCalcularSubtotal(item.precio, item.cant), 0);
  const montoDescuento = fnCalcularDescuento(subtotalBruto, descuentoPorcentaje);
  const totalPagar = Math.max(0, subtotalBruto - montoDescuento);

  // Ejecución de la lógica del procedimiento `sp_registrar_venta`
  const procesarVenta = async (metodo) => {
    if (carrito.length === 0) return;

    // 1. Genera el folio con sp_generar_folio
    const folioGenerado = spGenerarFolio();
    const ahoraStr = new Date().toLocaleString();

    // 2. Estructura de venta con detalle de venta (vw_detalle_ventas)
    const ventaPayload = {
      folio: folioGenerado,
      empleado: usuarioActivo?.nombre || 'Cajero',
      cliente: clienteSeleccionado,
      fecha: ahoraStr,
      metodo_pago: metodo,
      subtotal: subtotalBruto,
      descuento: montoDescuento,
      descuento_porcentaje: descuentoPorcentaje,
      total: totalPagar,
      detalles: carrito.map(item => ({
        id_producto: item.id,
        articulo: item.nombre,
        cantidad: item.cant,
        precio_unitario: item.precio,
        subtotal: fnCalcularSubtotal(item.precio, item.cant)
      }))
    };

    // 3. Descontar stock (trg_descontar_stock)
    try {
      await createVenta(ventaPayload);
    } catch {
      // Offline fallback
    }

    // 4. Guardar en registro de ventas para alimentar métricas y el corte de caja
    try {
      const vPrevias = JSON.parse(localStorage.getItem('gymton_ventas') || '[]');
      localStorage.setItem('gymton_ventas', JSON.stringify([ventaPayload, ...vPrevias]));
    } catch (e) {
      console.error(e);
    }

    // 5. Si la venta incluye renovación de membresía, extender su vigencia y estado a activa
    const itemsMembresia = carrito.filter(item => item.es_membresia);
    if (itemsMembresia.length > 0) {
      try {
        const membsLocal = JSON.parse(localStorage.getItem('gymton_membresias') || '[]');
        itemsMembresia.forEach(mItem => {
          const mIdx = membsLocal.findIndex(m => m.id === mItem.membresia_id);
          if (mIdx !== -1) {
            const mActual = membsLocal[mIdx];
            const dur = Number(mItem.duracion_dias) || 30;
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const vencActual = mActual.fecha_vencimiento ? new Date(mActual.fecha_vencimiento) : hoy;
            vencActual.setHours(0, 0, 0, 0);
            const baseFecha = vencActual > hoy ? vencActual : hoy;
            const nuevaVenc = new Date(baseFecha.getTime() + dur * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            membsLocal[mIdx] = {
              ...mActual,
              fecha_inicio: hoy.toISOString().split('T')[0],
              fecha_vencimiento: nuevaVenc,
              estado: 'activa'
            };
          }
        });
        localStorage.setItem('gymton_membresias', JSON.stringify(membsLocal));
        localStorage.removeItem('gymton_renovacion_pendiente');
        if (onRenovacionCompletada) onRenovacionCompletada();
      } catch (err) {
        console.error('Error al actualizar membresía tras venta:', err);
      }
    }

    // Actualizar stock local de los productos vendidos
    const productosActualizados = productos.map(p => {
      const enCarro = carrito.find(c => c.id === p.id);
      if (enCarro && !enCarro.es_membresia) {
        const nuevoStock = Math.max(0, (Number(p.stock) || 0) - enCarro.cant);
        updateProductos(p.id, { ...p, stock: nuevoStock }).catch(() => {});
        return { ...p, stock: nuevoStock };
      }
      return p;
    });

    setProductos(productosActualizados);
    try {
      localStorage.setItem('gymton_productos', JSON.stringify(productosActualizados));
    } catch(e) {}

    // Desplegar el ticket para impresión / visualización de la vista
    setTicketVenta(ventaPayload);
    setCarrito([]);
    setDescuentoPorcentaje(0);
    const mensajeExito = itemsMembresia.length > 0
      ? `¡Cobro completado y Membresía renovada con éxito! Folio generado: ${folioGenerado}`
      : `¡Venta registrada con éxito! Folio generado: ${folioGenerado}`;
    setAlerta({ mensaje: mensajeExito, tipo: 'success' });
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria && p.categoria.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="puntoventa-wrapper p-6 bg-zinc-950 min-h-screen text-gray-200">
      {alerta && <Toast mensaje={alerta.mensaje} tipo={alerta.tipo} onClose={() => setAlerta(null)} />}

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Catálogo de Productos (Izquierda) */}
        <div className="w-full lg:w-[58%] xl:w-[60%] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-xl">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="text-emerald-400" /> Punto de Venta / Caja
              </h2>
              <span className="text-xs text-gray-400">
                Cobro rápido y expedición de comprobantes en mostrador.
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                className="input input-bordered w-full pl-10 bg-zinc-800 border-zinc-700 text-sm" 
                placeholder="Buscar por nombre o categoría..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 flex-1 max-h-[70vh]">
            <table className="table table-zebra w-full text-sm">
              <thead className="bg-zinc-800 text-gray-400 text-xs uppercase sticky top-0 z-10 border-b border-zinc-700">
                <tr>
                  <th className="p-4">Producto</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {productosFiltrados.map(p => {
                  const stockBajo = Number(p.stock) <= 5;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 font-bold text-white">{p.nombre}</td>
                      <td className="p-4">
                        <span className="badge badge-outline badge-sm text-xs text-gray-300">
                          {p.categoria || 'General'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`badge ${stockBajo ? 'badge-error text-white font-bold' : 'badge-success text-black font-semibold'} badge-sm`}>
                          {p.stock} uds.
                        </span>
                      </td>
                      <td className="p-4 text-emerald-400 font-bold text-base">${p.precio}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => agregarAlCarrito(p)} 
                          className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold border-none"
                          disabled={Number(p.stock) <= 0}
                        >
                          <Plus size={16} /> Agregar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {productosFiltrados.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-400 italic">No se encontraron productos disponibles.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Carrito de Compra (Derecha) Optimizado sin Deslizante Horizontal */}
        <div className="w-full lg:w-[42%] xl:w-[40%] bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 flex flex-col justify-between overflow-hidden min-w-0">
          <div>
            <div className="bg-emerald-500 text-black p-4 flex items-center justify-between font-black tracking-wide">
              <span className="flex items-center gap-2"><ShoppingCart size={20} /> Cuenta / Ticket Actual</span>
              <span className="badge badge-neutral text-xs">{carrito.length} Items</span>
            </div>

            {/* Asignar Cliente / Buscador de Socios en Tiempo Real */}
            <div className="p-3.5 border-b border-zinc-800 bg-zinc-800/40">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1.5">
                  <User size={14} className="text-emerald-400" /> Cliente / Socio:
                </label>
                {clienteSeleccionado !== 'Público General' && (
                  <button
                    type="button"
                    onClick={() => {
                      setClienteSeleccionado('Público General');
                      setBusquedaSocioTicket('');
                      setMostrarBuscadorSocios(false);
                    }}
                    className="text-[11px] text-zinc-400 hover:text-emerald-400 underline font-medium"
                  >
                    Restablecer a Público General
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setClienteSeleccionado('Público General');
                    setMostrarBuscadorSocios(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    clienteSeleccionado === 'Público General'
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                  }`}
                >
                  Público General
                </button>

                <button
                  type="button"
                  onClick={() => setMostrarBuscadorSocios(!mostrarBuscadorSocios)}
                  className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all truncate ${
                    clienteSeleccionado !== 'Público General'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  <span className="truncate flex items-center gap-1.5">
                    <Search size={13} className="shrink-0" />
                    <span className="truncate">
                      {clienteSeleccionado !== 'Público General' ? clienteSeleccionado : 'Buscar Socio Registrado...'}
                    </span>
                  </span>
                  <span className="text-[10px] text-zinc-500 ml-1 shrink-0">{mostrarBuscadorSocios ? '▲' : '▼'}</span>
                </button>
              </div>

              {/* Desplegable de búsqueda de socios en tiempo real */}
              {mostrarBuscadorSocios && (
                <div className="mt-2 p-2.5 bg-zinc-950 border border-zinc-700 rounded-xl space-y-2 shadow-2xl">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Escribe el nombre o teléfono del socio..."
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 pl-8 pr-7 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
                      value={busquedaSocioTicket}
                      onChange={e => setBusquedaSocioTicket(e.target.value)}
                      autoFocus
                    />
                    {busquedaSocioTicket && (
                      <button
                        type="button"
                        onClick={() => setBusquedaSocioTicket('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <div className="max-h-36 overflow-y-auto divide-y divide-zinc-800">
                    {socios
                      .filter(s => {
                        if (!busquedaSocioTicket.trim()) return true;
                        const term = busquedaSocioTicket.toLowerCase().trim();
                        const nom = (s.nombre || '').toLowerCase();
                        const tel = (s.telefono || '').toLowerCase();
                        const id = String(s.id);
                        return nom.includes(term) || tel.includes(term) || id.includes(term);
                      })
                      .slice(0, 8)
                      .map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setClienteSeleccionado(`${s.nombre} (Socio #${s.id})`);
                            setMostrarBuscadorSocios(false);
                            setBusquedaSocioTicket('');
                          }}
                          className="w-full text-left p-2 hover:bg-emerald-500/15 flex items-center justify-between rounded-lg transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-white text-xs font-bold block truncate">{s.nombre}</span>
                            <span className="text-zinc-500 text-[10px] font-mono">{s.telefono || 'Sin teléfono'}</span>
                          </div>
                          <span className="badge badge-xs badge-outline text-emerald-400 border-emerald-500/40 text-[9px] shrink-0 font-mono">
                            #{s.id}
                          </span>
                        </button>
                      ))}
                    {socios.length === 0 && (
                      <div className="p-2 text-center text-xs text-zinc-500 italic">
                        No hay socios registrados disponibles.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Items del Carrito - Optimizado sin Scroll Horizontal */}
            <div className="p-3.5 space-y-2.5 overflow-y-auto overflow-x-hidden max-h-[40vh]">
              {carrito.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <ShoppingCart size={38} className="mx-auto mb-2 opacity-30" />
                  El carrito de venta está vacío
                </div>
              ) : (
                carrito.map(c => (
                  <div key={c.id} className="bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-700/80 flex flex-col gap-1.5 transition-all hover:border-zinc-600">
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate" title={c.nombre}>{c.nombre}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-zinc-400 font-mono">${Number(c.precio).toFixed(2)} c/u</span>
                          {c.es_membresia && (
                            <span className="badge badge-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px]">
                              Membresía
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => eliminarDelCarrito(c.id)} 
                        className="text-zinc-500 hover:text-red-400 p-1 hover:bg-zinc-700/60 rounded-lg transition-colors shrink-0"
                        title="Quitar del ticket"
                      >
                        <Trash2 size={15}/>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-700/40">
                      <div className="flex items-center gap-1 bg-zinc-950 rounded-lg p-0.5 border border-zinc-700 shrink-0">
                        <button onClick={() => modificarCant(c.id, -1)} className="p-1 hover:bg-zinc-800 rounded text-gray-300 transition-colors">
                          <Minus size={12}/>
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold text-white">{c.cant}</span>
                        <button onClick={() => modificarCant(c.id, 1)} className="p-1 hover:bg-zinc-800 rounded text-gray-300 transition-colors">
                          <Plus size={12}/>
                        </button>
                      </div>
                      <span className="text-emerald-400 text-xs font-mono font-black shrink-0">
                        ${fnCalcularSubtotal(c.precio, c.cant).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel de Cobro y Descuentos */}
          <div className="bg-zinc-950 p-5 border-t border-zinc-800 space-y-3">
            
            {/* Función `fn_calcular_descuento` */}
            <div className="flex items-center justify-between gap-2 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
              <span className="text-xs text-gray-400 flex items-center gap-1 font-semibold">
                <Percent size={14} className="text-emerald-400" /> Descuento ({descuentoPorcentaje}%):
              </span>
              <div className="flex gap-1">
                {[0, 5, 10, 15].map(porc => (
                  <button 
                    key={porc}
                    className={`px-2 py-0.5 rounded text-xs font-bold ${descuentoPorcentaje === porc ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-gray-400 hover:text-white'}`}
                    onClick={() => setDescuentoPorcentaje(porc)}
                  >
                    {porc}%
                  </button>
                ))}
              </div>
            </div>

            {/* Resumen de totales */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal:</span>
                <span>${subtotalBruto.toFixed(2)}</span>
              </div>
              {descuentoPorcentaje > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Descuento ({descuentoPorcentaje}%):</span>
                  <span>-${montoDescuento.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-zinc-800">
                <span className="text-base font-bold text-white">Total a Cobrar:</span>
                <span className="text-3xl font-black text-emerald-400">${totalPagar.toFixed(2)}</span>
              </div>
            </div>

            {/* Botones de Cobro con sp_registrar_venta */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => procesarVenta('Efectivo')} 
                disabled={carrito.length === 0} 
                className="btn bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex gap-2 border-none"
              >
                <Banknote size={18} /> Efectivo
              </button>
              <button 
                onClick={() => procesarVenta('Tarjeta')} 
                disabled={carrito.length === 0} 
                className="btn bg-blue-500 hover:bg-blue-400 text-black font-bold flex gap-2 border-none"
              >
                <CreditCard size={18} /> Tarjeta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ticket de Venta basado en la vista `vw_detalle_ventas` */}
      {ticketVenta && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white text-zinc-900 max-w-sm p-6 rounded-2xl shadow-2xl font-mono">
            <div className="text-center pb-4 border-b border-dashed border-zinc-400">
              <h2 className="text-xl font-black tracking-wider">⚡ GYMTON FITNESS</h2>
              <p className="text-xs text-zinc-600">Comprobante Oficial de Compra</p>
              <div className="text-xs font-bold bg-zinc-200 py-1 px-2 rounded mt-2 inline-block">
                Folio: {ticketVenta.folio}
              </div>
            </div>

            <div className="py-3 text-xs space-y-1 border-b border-dashed border-zinc-400">
              <div className="flex justify-between"><span>Fecha:</span><strong>{ticketVenta.fecha}</strong></div>
              <div className="flex justify-between"><span>Atendió:</span><strong>{ticketVenta.empleado}</strong></div>
              <div className="flex justify-between"><span>Cliente:</span><strong>{ticketVenta.cliente}</strong></div>
              <div className="flex justify-between"><span>Pago:</span><strong>{ticketVenta.metodo_pago}</strong></div>
            </div>

            {/* Detalle de Artículos */}
            <div className="py-3 border-b border-dashed border-zinc-400 space-y-2">
              <div className="flex justify-between font-bold text-xs">
                <span>Cant / Articulo</span>
                <span>Subtotal</span>
              </div>
              {ticketVenta.detalles.map((d, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{d.cantidad}x {d.articulo} (${d.precio_unitario})</span>
                  <strong>${d.subtotal.toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div className="pt-3 text-xs space-y-1">
              <div className="flex justify-between"><span>Subtotal:</span><span>${ticketVenta.subtotal.toFixed(2)}</span></div>
              {ticketVenta.descuento > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Descuento ({ticketVenta.descuento_porcentaje}%):</span>
                  <span>-${ticketVenta.descuento.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black pt-2 border-t border-zinc-900">
                <span>TOTAL:</span>
                <span>${ticketVenta.total.toFixed(2)} MXN</span>
              </div>
            </div>

            <div className="text-center pt-5">
              <p className="text-xs text-zinc-500">¡Gracias por tu compra y buen entrenamiento!</p>
            </div>

            <div className="flex justify-end gap-2 pt-5">
              <button onClick={() => window.print()} className="btn btn-sm btn-outline text-zinc-800">
                <Printer size={15} /> Imprimir
              </button>
              <button onClick={() => setTicketVenta(null)} className="btn btn-sm bg-zinc-900 text-white hover:bg-black">
                Cerrar
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
