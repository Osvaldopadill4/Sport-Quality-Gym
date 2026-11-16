import React from 'react';
import { Calculator, Plus, Printer, X, DollarSign, User } from 'lucide-react';

export function ModalAperturaTurno({
  showModalApertura,
  setShowModalApertura,
  handleAbrirTurno,
  nombreCajeroActivo,
  formApertura,
  setFormApertura
}) {
  if (!showModalApertura) return null;

  return (
    <div className="gym-modal-backdrop">
      <div className="gym-modal-container max-w-md">
        <div className="gym-modal-header">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
            <Plus size={20} className="text-emerald-400" />
            Apertura de Turno / Caja
          </h3>
          <button onClick={() => setShowModalApertura(false)} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAbrirTurno} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
              Cajero Responsable:
            </label>
            <div className="flex items-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-semibold">
              <User size={16} className="text-emerald-400" />
              <span>{nombreCajeroActivo}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
              Fondo Inicial en Efectivo ($ MXN):
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
              <input
                type="number"
                step="0.01"
                readOnly
                className="w-full bg-zinc-950 border border-emerald-500/50 rounded-xl py-2.5 pl-10 pr-4 text-emerald-400 text-base font-extrabold cursor-not-allowed outline-none select-none"
                value={500}
              />
            </div>
            <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
              ✓ El monto inicial es obligatorio y está fijado permanentemente en $500.00 MXN para dar cambio.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
              Observaciones (Máx. 200 car.):
            </label>
            <textarea
              maxLength={200}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none"
              rows={2}
              value={formApertura.observaciones}
              onChange={(e) => setFormApertura({ ...formApertura, observaciones: e.target.value.slice(0, 200) })}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModalApertura(false)}
              className="btn btn-sm btn-ghost text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold border-none"
            >
              Iniciar Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ModalCierreTurno({
  showModalCierre,
  setShowModalCierre,
  corteActivo,
  fondoActual,
  metricasVentas,
  dineroEsperadoEnCaja,
  formCierre,
  setFormCierre,
  handleCerrarTurno
}) {
  if (!showModalCierre || !corteActivo) return null;

  const dif = Number(formCierre.monto_real) - dineroEsperadoEnCaja;
  const esExacto = Math.abs(dif) < 0.01;
  const esSobrante = dif > 0.01;

  return (
    <div className="gym-modal-backdrop">
      <div className="gym-modal-container max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="gym-modal-header sticky top-0 z-10 backdrop-blur-md">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
            <Calculator size={20} className="text-amber-400" />
            Cierre de Turno #{corteActivo.id} (Arqueo)
          </h3>
          <button onClick={() => setShowModalCierre(false)} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Fondo Inicial</span>
              <span className="text-sm sm:text-base font-extrabold text-white">${fondoActual.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Ventas Efectivo</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400">+${Number(metricasVentas.totalEfectivo || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Compras / Gastos</span>
              <span className="text-sm sm:text-base font-extrabold text-red-400">-${Number(metricasVentas.totalGastos || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Monto Esperado</span>
              <span className="text-sm sm:text-base font-black text-amber-300">${dineroEsperadoEnCaja.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
              Efectivo Total Real Contado en Caja ($ MXN) (máx. 999999):
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                max="999999"
                required
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-lg font-black focus:border-amber-400 outline-none"
                value={formCierre.monto_real}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (Number(val) >= 0 && Number(val) <= 999999 && val.length <= 10)) {
                    setFormCierre({ ...formCierre, monto_real: val === '' ? '' : parseFloat(val) || 0 });
                  }
                }}
              />
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${
            esExacto
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
              : esSobrante
              ? 'bg-blue-950/30 border-blue-500/40 text-blue-400'
              : 'bg-red-950/30 border-red-500/40 text-red-400'
          }`}>
            <div className="flex justify-between items-center font-bold text-sm">
              <span>Resultado del Arqueo:</span>
              <span className="text-base font-black font-mono">
                {esExacto ? '✓ CAJA CUADRADA ($0.00)' : esSobrante ? `+$${dif.toFixed(2)} (SOBRANTE)` : `-$${Math.abs(dif).toFixed(2)} (FALTANTE)`}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
              Notas de Cierre / Justificación de Diferencia (Máx. 200 car.):
            </label>
            <textarea
              maxLength={200}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:border-amber-400 outline-none"
              rows={2}
              placeholder="Ej. Sin novedad en el turno, caja cuadrada al 100%..."
              value={formCierre.observaciones}
              onChange={(e) => setFormCierre({ ...formCierre, observaciones: e.target.value.slice(0, 200) })}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowModalCierre(false)}
              className="btn btn-sm btn-ghost text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCerrarTurno}
              className="btn btn-sm bg-amber-500 hover:bg-amber-400 text-black font-extrabold border-none"
            >
              Confirmar y Cerrar Caja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalTicketCorte({ ticketCorte, setTicketCorte }) {
  if (!ticketCorte) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-white text-zinc-900 max-w-sm p-6 rounded-2xl shadow-2xl font-mono">
        <div className="text-center pb-4 border-b border-dashed border-zinc-400">
          <div className="flex justify-center mb-1">
            <img src="/logo-gym.png" alt="Logo" className="w-14 h-14 object-contain" />
          </div>
          <h2 className="text-base font-black tracking-wider">GYM SPORT QUALITY CENTER</h2>
          <p className="text-[10px] text-zinc-600 font-semibold uppercase">Comprobante Oficial de Corte Z</p>
          <div className="text-xs font-bold bg-zinc-200 py-1 px-3 rounded mt-2 inline-block">
            Turno #{ticketCorte.id}
          </div>
        </div>

        <div className="py-3 text-xs space-y-1 border-b border-dashed border-zinc-400">
          <div className="flex justify-between"><span>Cajero:</span><strong>{ticketCorte.cajero}</strong></div>
          <div className="flex justify-between"><span>Apertura:</span><span>{ticketCorte.fecha_apertura}</span></div>
          <div className="flex justify-between"><span>Cierre:</span><span>{ticketCorte.fecha_cierre}</span></div>
        </div>

        <div className="py-3 text-xs space-y-1.5 border-b border-dashed border-zinc-400">
          <div className="flex justify-between">
            <span>Fondo Inicial:</span>
            <strong>${Number(ticketCorte.monto_inicial || 0).toFixed(2)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Ventas Efectivo:</span>
            <strong className="text-emerald-700">+${Number(ticketCorte.ventas_efectivo || 0).toFixed(2)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Compras / Gastos:</span>
            <strong className="text-red-700">-${Number(ticketCorte.total_gastos || 0).toFixed(2)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Ventas Tarjeta:</span>
            <strong className="text-blue-700">${Number(ticketCorte.ventas_tarjeta || 0).toFixed(2)}</strong>
          </div>
          <div className="flex justify-between pt-1 border-t border-zinc-300">
            <span>Total Ventas Turno:</span>
            <strong>${Number(ticketCorte.total_ventas || 0).toFixed(2)}</strong>
          </div>
        </div>

        <div className="py-3 text-xs space-y-1.5 border-b border-dashed border-zinc-400">
          <div className="flex justify-between font-bold">
            <span>Efectivo Calculado:</span>
            <span>${Number(ticketCorte.monto_calculado || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black text-sm">
            <span>Efectivo Real en Caja:</span>
            <span>${Number(ticketCorte.monto_real || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold pt-1 border-t border-zinc-300">
            <span>Diferencia:</span>
            <strong className={Number(ticketCorte.diferencia) < 0 ? 'text-red-600' : 'text-emerald-700'}>
              {Number(ticketCorte.diferencia) === 0 ? '$0.00 (Cuadrada)' : `$${Number(ticketCorte.diferencia).toFixed(2)}`}
            </strong>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-[11px] text-zinc-500">Firma del Cajero Responsable:</p>
          <div className="h-10 border-b border-zinc-400 mt-2 mx-8" />
        </div>

        <div className="flex justify-end gap-2 pt-5">
          <button onClick={() => window.print()} className="btn btn-sm btn-outline text-zinc-800">
            <Printer size={15} /> Imprimir
          </button>
          <button onClick={() => setTicketCorte(null)} className="btn btn-sm bg-zinc-900 text-white hover:bg-black">
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );
}
