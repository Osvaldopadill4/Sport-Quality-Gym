import React from 'react';
import {
  Search,
  X,
  Calendar,
  CreditCard,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { fn_dias_restantes } from '../../../Reutilizable/objetosSQL';

export function ModalFormMembresia({
  showModal,
  setShowModal,
  modalMode,
  handleSave,
  clienteSeleccionadoModal,
  setClienteSeleccionadoModal,
  busquedaClienteModal,
  setBusquedaClienteModal,
  clientesCatalogo,
  planesCatalogo,
  formData,
  setFormData,
  mostrarAlerta
}) {
  return (
    <dialog className={`modal ${showModal ? 'modal-open' : ''}`}>
      <div className="modal-box bg-zinc-900 border border-zinc-800 text-white p-0 overflow-hidden max-w-md">
        <div className="p-4 bg-zinc-800 border-b border-zinc-700 flex justify-between items-center">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Calendar size={18} className="text-emerald-400" />
            {modalMode === 'create' ? 'Nueva Membresía' : 'Editar Membresía'}
          </h3>
          <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
              Socio / Cliente
            </label>
            {clienteSeleccionadoModal ? (
              <div className="flex items-center justify-between p-3 bg-zinc-950 border border-emerald-500/50 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                    #{clienteSeleccionadoModal.id}
                  </div>
                  <div className="truncate">
                    <span className="text-white text-sm font-bold block truncate">
                      {clienteSeleccionadoModal.nombre}
                    </span>
                    <span className="text-zinc-400 text-xs font-mono">
                      {clienteSeleccionadoModal.telefono ? `Tel: ${clienteSeleccionadoModal.telefono}` : 'Sin teléfono'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setClienteSeleccionadoModal(null);
                    setBusquedaClienteModal('');
                    setFormData({ ...formData, id_cliente: '', cliente_nombre: '' });
                  }}
                  className="btn btn-xs btn-ghost text-zinc-400 hover:text-white shrink-0 ml-2"
                >
                  Cambiar socio
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Escribe para buscar socio por nombre, tel o ID..."
                    className="input input-bordered w-full pl-9 pr-8 bg-zinc-800 border-zinc-700 text-white text-xs placeholder:text-zinc-500"
                    value={busquedaClienteModal}
                    onChange={(e) => setBusquedaClienteModal(e.target.value)}
                    autoFocus
                  />
                  {busquedaClienteModal && (
                    <button
                      type="button"
                      onClick={() => setBusquedaClienteModal('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {busquedaClienteModal.trim().length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-zinc-950 border border-zinc-700 rounded-xl shadow-2xl z-50 divide-y divide-zinc-800">
                    {clientesCatalogo
                      .filter((c) => {
                        const term = busquedaClienteModal.toLowerCase().trim();
                        const nom = (c.nombre || '').toLowerCase();
                        const tel = (c.telefono || '').toLowerCase();
                        const id = String(c.id);
                        return nom.includes(term) || tel.includes(term) || id.includes(term);
                      })
                      .slice(0, 6)
                      .map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setClienteSeleccionadoModal(c);
                            setFormData({
                              ...formData,
                              id_cliente: c.id,
                              cliente_nombre: c.nombre
                            });
                            setBusquedaClienteModal('');
                          }}
                          className="w-full text-left p-2.5 hover:bg-emerald-500/15 flex items-center justify-between transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-white text-xs font-bold block truncate">{c.nombre}</span>
                            <span className="text-zinc-500 text-[11px] font-mono">{c.telefono || 'Sin teléfono'}</span>
                          </div>
                          <span className="badge badge-sm badge-outline text-emerald-400 border-emerald-500/40 text-[10px] shrink-0">
                            Socio
                          </span>
                        </button>
                      ))}
                    {clientesCatalogo.filter((c) => {
                      const term = busquedaClienteModal.toLowerCase().trim();
                      const nom = (c.nombre || '').toLowerCase();
                      const tel = (c.telefono || '').toLowerCase();
                      const id = String(c.id);
                      return nom.includes(term) || tel.includes(term) || id.includes(term);
                    }).length === 0 && (
                      <div className="p-3 text-xs text-zinc-500 italic text-center">
                        No se encontraron socios con "{busquedaClienteModal}".
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
              Tipo de Planes
            </label>
            <select
              className="input input-bordered w-full bg-zinc-800 border-zinc-700 text-white text-xs font-semibold"
              value={formData.id_plan}
              onChange={(e) => {
                const planId = Number(e.target.value);
                const pObj = planesCatalogo.find((p) => Number(p.id) === planId);
                if (pObj) {
                  const d = Number(pObj.duracion_dias) || 30;
                  const inicio = new Date(formData.fecha_inicio);
                  const fin = new Date(inicio.getTime() + d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  setFormData({
                    ...formData,
                    id_plan: pObj.id,
                    plan_nombre: pObj.nombre,
                    duracion_dias: d,
                    fecha_vencimiento: fin
                  });
                }
              }}
            >
              {planesCatalogo.length === 0 ? (
                <option value="">Cargando planes...</option>
              ) : (
                planesCatalogo.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — ${Number(p.precio).toFixed(2)} ({p.duracion_dias ? `${p.duracion_dias} días` : '30 días'})
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Fecha Inicio (Desde hoy)</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="input input-bordered w-full bg-zinc-800 border-zinc-700"
                value={formData.fecha_inicio}
                onChange={(e) => {
                  const hoy = new Date().toISOString().split('T')[0];
                  if (e.target.value && e.target.value < hoy) {
                    mostrarAlerta(`No puedes seleccionar una fecha anterior a hoy (${hoy})`, 'error');
                    return;
                  }
                  const d = formData.duracion_dias || 30;
                  const inicio = new Date(e.target.value);
                  const fin = new Date(inicio.getTime() + d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  setFormData({ ...formData, fecha_inicio: e.target.value, fecha_vencimiento: fin });
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Fecha Vencimiento (Máx. 500d)</label>
              <input
                type="date"
                required
                min={formData.fecha_inicio || new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 500 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="input input-bordered w-full bg-zinc-800 border-zinc-700"
                value={formData.fecha_vencimiento}
                onChange={(e) => {
                  const diasCalculados = fn_dias_restantes(e.target.value);
                  if (diasCalculados > 500) {
                    mostrarAlerta('Restricción: No puedes acumular más de 500 días de vigencia', 'error');
                    return;
                  }
                  setFormData({ ...formData, fecha_vencimiento: e.target.value });
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancelar</button>
            <button type="submit" className="btn btn-primary btn-sm bg-emerald-500 hover:bg-emerald-400 text-black border-none font-bold flex items-center gap-1.5">
              <ShoppingCart size={15} />
              {modalMode === 'create' ? 'Mandar a Caja para Cobrar' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export function ModalRenovacionMembresia({
  renovacionTarget,
  setRenovacionTarget,
  modoVerificacion,
  setModoVerificacion,
  metodoPagoPrevio,
  setMetodoPagoPrevio,
  referenciaPago,
  setReferenciaPago,
  handleMandarAPuntoVenta,
  handleVerificarPagoPrevioYRenovar
}) {
  if (!renovacionTarget) return null;

  return (
    <div className="gym-modal-backdrop">
      <div className="gym-modal-container max-w-lg">
        <div className="gym-modal-header">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                Renovación de Membresía
              </h3>
              <p className="text-xs text-zinc-400">
                Se requiere verificar el cobro previo antes de extender la vigencia.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRenovacionTarget(null)}
            className="text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold block">
                  Socio / Cliente:
                </span>
                <h4 className="text-base font-bold text-white">
                  {renovacionTarget.cliente_nombre || 'Cliente General'}
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {renovacionTarget.plan_nombre || 'Plan Estándar'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-500 block">Duración:</span>
                <strong className="text-zinc-200">{renovacionTarget.duracion} días</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Costo Plan:</span>
                <strong className="text-emerald-400 font-mono text-sm">${renovacionTarget.precio.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block">Nueva Vigencia:</span>
                <strong className="text-white font-mono">{renovacionTarget.nuevaVencimiento}</strong>
              </div>
            </div>
          </div>

          <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setModoVerificacion('caja')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                modoVerificacion === 'caja'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShoppingCart size={15} />
              <span>Cobrar en Punto de Venta</span>
            </button>
            <button
              type="button"
              onClick={() => setModoVerificacion('manual')}
              className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                modoVerificacion === 'manual'
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle2 size={15} />
              <span>Verificar Pago Previo</span>
            </button>
          </div>

          {modoVerificacion === 'caja' ? (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <ShoppingCart size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-sm">Flujo Recomendado: Cobro en Mostrador</h5>
                  <p className="text-zinc-400 mt-1 leading-relaxed">
                    Al presionar el botón inferior, serás transferido automáticamente al <strong>Punto de Venta</strong> con este socio y su plan precargados en el carrito para expedir el ticket oficial y registrar el ingreso en caja.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs space-y-3">
              <span className="font-bold text-zinc-300 block text-xs">
                Comprobación de Pago Recibido Previamente:
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase font-semibold mb-1">
                    Método de Pago:
                  </label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-emerald-500"
                    value={metodoPagoPrevio}
                    onChange={(e) => setMetodoPagoPrevio(e.target.value)}
                  >
                    <option value="Efectivo">Efectivo Recibido</option>
                    <option value="Transferencia">Transferencia / SPEI</option>
                    <option value="Tarjeta">Tarjeta / Terminal</option>
                    <option value="Depósito">Depósito Bancario</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 uppercase font-semibold mb-1">
                    Folio o Referencia:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. REF-8392 o N/A"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-emerald-500 font-mono"
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                  />
                </div>
              </div>

              <p className="text-[11px] text-amber-300/80 flex items-center gap-1.5 pt-1">
                <AlertTriangle size={13} />
                Solo confirmar si el importe total (${renovacionTarget.precio.toFixed(2)}) ya fue acreditado.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setRenovacionTarget(null)}
              className="btn btn-sm btn-ghost text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>

            {modoVerificacion === 'caja' ? (
              <button
                type="button"
                onClick={handleMandarAPuntoVenta}
                className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold border-none flex items-center gap-1.5 shadow-lg"
              >
                <span>Ir a Cobrar a Punto de Venta</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleVerificarPagoPrevioYRenovar}
                className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold border-none flex items-center gap-1.5 shadow-lg"
              >
                <CheckCircle2 size={16} />
                <span>Confirmar Pago y Renovar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
