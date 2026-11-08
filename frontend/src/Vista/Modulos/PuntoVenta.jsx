import React from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Search,
  Receipt,
  Percent,
  User,
  X,
  DollarSign
} from 'lucide-react';
import '../../CSS/PuntoVenta.css';
import Toast from '../Extras/Toast';
import ConfirmModal from '../Extras/ConfirmModal';
import ModalTicketVenta from '../Extras/Modales/ModalTicketVenta';
import { usePuntoVenta } from '../../Reutilizable/usePuntoVenta';
import {
  sp_generar_folio,
  fn_calcular_subtotal_producto,
  fn_calcular_descuento
} from '../../Reutilizable/objetosSQL';

export const spGenerarFolio = sp_generar_folio;
export const fnCalcularSubtotal = fn_calcular_subtotal_producto;
export const fnCalcularDescuento = fn_calcular_descuento;

export default function PuntoVenta({ loggedUser, renovacionPendiente, onRenovacionCompletada }) {
  const {
    productosFiltrados,
    carrito,
    busqueda,
    setBusqueda,
    descuentoPorcentaje,
    setDescuentoPorcentaje,
    clienteSeleccionado,
    setClienteSeleccionado,
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
    fnCalcularSubtotal: calcSubtotal
  } = usePuntoVenta({ loggedUser, renovacionPendiente, onRenovacionCompletada });

  const [cobroConfirmacion, setCobroConfirmacion] = React.useState({
    isOpen: false,
    metodo: 'Efectivo'
  });
  const [cargandoCobro, setCargandoCobro] = React.useState(false);

  return (
    <div className="puntoventa-wrapper p-6 bg-zinc-950 min-h-screen text-gray-200">
      {alerta && <Toast alerta={alerta} mensaje={alerta?.mensaje} tipo={alerta?.tipo} onClose={() => setAlerta(null)} />}

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
                maxLength={50}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 flex-1 max-h-[70vh]">
            <table className="table table-zebra w-full min-w-[540px] text-sm">
              <thead className="bg-zinc-800 text-gray-400 text-xs uppercase sticky top-0 z-10 border-b border-zinc-700">
                <tr>
                  <th className="py-3.5 px-4 text-left whitespace-nowrap">Producto</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">Categoría</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">Stock</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">Precio</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {productosFiltrados.map(p => {
                  const stockBajo = Number(p.stock) <= 5;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{p.nombre}</td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="badge badge-outline badge-sm text-xs text-gray-300">
                          {p.categoria || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center font-bold font-mono text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
                          stockBajo
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {p.stock} uds.
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap text-emerald-400 font-bold text-base">${p.precio}</td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => agregarAlCarrito(p)}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                          disabled={Number(p.stock) <= 0}
                        >
                          <Plus size={15} className="shrink-0" /> Agregar
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

        {/* Carrito de Compra (Derecha) */}
        <div className="w-full lg:w-[42%] xl:w-[40%] bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 flex flex-col justify-between overflow-hidden min-w-0">
          <div>
            <div className="bg-emerald-500 text-black p-4 flex items-center justify-between font-black tracking-wide">
              <span className="flex items-center gap-2"><ShoppingCart size={20} /> Cuenta / Ticket Actual</span>
              <span className="badge badge-neutral text-xs">{carrito.length} Items</span>
            </div>

            {/* Asignar Cliente / Buscador de Socios */}
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
                      setClienteIdSeleccionado(null);
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
                    setClienteIdSeleccionado(null);
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

              {mostrarBuscadorSocios && (
                <div className="mt-2 p-2.5 bg-zinc-950 border border-zinc-700 rounded-xl space-y-2 shadow-2xl">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      maxLength={50}
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
                        return (s.nombre || '').toLowerCase().includes(term) ||
                               (s.telefono || '').toLowerCase().includes(term) ||
                               String(s.id).includes(term);
                      })
                      .slice(0, 8)
                      .map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setClienteIdSeleccionado(s.id);
                            setClienteSeleccionado(s.nombre);
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
                            Socio
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

            {/* Items del Carrito */}
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
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-700/40">
                      <div className="flex items-center gap-1 bg-zinc-950 rounded-lg p-0.5 border border-zinc-700 shrink-0">
                        <button
                          type="button"
                          onClick={() => modificarCant(c.id, -1)}
                          className="p-1 hover:bg-zinc-800 rounded text-gray-300 transition-colors"
                          title="Restar 1"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={2}
                          value={c.cant}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                            establecerCantidad(c.id, val);
                          }}
                          onBlur={() => {
                            if (!c.cant || Number(c.cant) < 1) {
                              establecerCantidad(c.id, 1);
                            }
                          }}
                          className="w-7 text-center text-xs font-mono font-bold text-white bg-transparent outline-none focus:bg-zinc-800 rounded py-0.5"
                          title="Cantidad (1 a 99)"
                        />
                        <button
                          type="button"
                          onClick={() => modificarCant(c.id, 1)}
                          className="p-1 hover:bg-zinc-800 rounded text-gray-300 transition-colors"
                          title="Sumar 1"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-emerald-400 text-xs font-mono font-black shrink-0">
                        ${calcSubtotal(c.precio, c.cant).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel de Cobro y Descuentos */}
          <div className="bg-zinc-950 p-5 border-t border-zinc-800 space-y-3">
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

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (carrito.length === 0) return;
                  setCobroConfirmacion({ isOpen: true, metodo: 'Efectivo' });
                }}
                disabled={carrito.length === 0}
                className="btn w-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-black flex items-center justify-center gap-2 border-none shadow-xl active:scale-[0.98] py-3.5 h-auto transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <DollarSign size={18} /> Cobrar Ticket (${totalPagar.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación y Selección de Modo de Pago */}
      <ConfirmModal
        isOpen={cobroConfirmacion.isOpen}
        title="Confirmar Cobro"
        message={
          <div className="space-y-4 text-left pt-1">
            {/* Resumen del ticket */}
            <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Cliente / Socio:</span>
                <span className="font-semibold text-emerald-400 truncate max-w-[200px]">{clienteSeleccionado}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Artículos en ticket:</span>
                <span className="font-mono text-zinc-300 font-bold">{carrito.reduce((acc, c) => acc + (Number(c.cant) || 1), 0)} ítems</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80">
                <span className="text-zinc-300 font-bold text-sm">Total a cobrar:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">${totalPagar.toFixed(2)}</span>
              </div>
            </div>

            {/* Selector interactivo de Modo de Pago (Efectivo vs Tarjeta) */}
            <div>
              <label className="text-xs font-bold uppercase text-zinc-400 block mb-2">
                Selecciona el Modo de Pago:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCobroConfirmacion(prev => ({ ...prev, metodo: 'Efectivo' }))}
                  className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-2xl text-xs font-black transition-all border ${
                    cobroConfirmacion.metodo === 'Efectivo'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500 scale-[1.02]'
                      : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Banknote size={18} />
                  <span>Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCobroConfirmacion(prev => ({ ...prev, metodo: 'Tarjeta' }))}
                  className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-2xl text-xs font-black transition-all border ${
                    cobroConfirmacion.metodo === 'Tarjeta'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500 scale-[1.02]'
                      : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <CreditCard size={18} />
                  <span>Tarjeta</span>
                </button>
              </div>
            </div>
          </div>
        }
        confirmText={cargandoCobro ? "Procesando cobro..." : `Confirmar Cobro con ${cobroConfirmacion.metodo || 'Efectivo'}`}
        cancelText="Volver al Ticket"
        tipo="success"
        onConfirm={async () => {
          if (cargandoCobro) return;
          const met = cobroConfirmacion.metodo || 'Efectivo';
          try {
            setCargandoCobro(true);
            await procesarVenta(met);
          } finally {
            setCargandoCobro(false);
            setCobroConfirmacion({ isOpen: false, metodo: 'Efectivo' });
          }
        }}
        onCancel={() => {
          if (!cargandoCobro) {
            setCobroConfirmacion({ isOpen: false, metodo: 'Efectivo' });
          }
        }}
      />

      {/* Modal Ticket de Venta extraído en `Vista/Extras/Modales/ModalTicketVenta.jsx` */}
      <ModalTicketVenta
        ticketVenta={ticketVenta}
        setTicketVenta={setTicketVenta}
        onClose={() => setTicketVenta(null)}
      />
    </div>
  );
}
