import React from 'react';
import { Printer } from 'lucide-react';

export default function ModalTicketVenta({ ticketVenta, setTicketVenta, onClose }) {
  if (!ticketVenta) return null;

  const cerrarModal = () => {
    if (typeof onClose === 'function') onClose();
    if (typeof setTicketVenta === 'function') setTicketVenta(null);
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-white text-zinc-900 max-w-sm p-6 rounded-2xl shadow-2xl font-mono">
        <div className="text-center pb-4 border-b border-dashed border-zinc-400">
          <div className="flex justify-center mb-1">
            <img src="/logo-gym.png" alt="Logo Gym" className="w-16 h-16 object-contain" />
          </div>
          <h2 className="text-base font-black tracking-wider text-black uppercase">GYM SPORT QUALITY CENTER</h2>
          <p className="text-[11px] text-zinc-600 font-bold uppercase">Comprobante Oficial de Venta</p>
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

        <div className="py-3 border-b border-dashed border-zinc-400 space-y-2">
          <div className="flex justify-between font-bold text-xs">
            <span>Cant / Articulo</span>
            <span>Subtotal</span>
          </div>
          {(ticketVenta.detalles || []).map((d, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span>{d.cantidad}x {d.articulo} (${d.precio_unitario})</span>
              <strong>${Number(d.subtotal || 0).toFixed(2)}</strong>
            </div>
          ))}
        </div>

        <div className="pt-3 text-xs space-y-1">
          <div className="flex justify-between"><span>Subtotal:</span><span>${Number(ticketVenta.subtotal || 0).toFixed(2)}</span></div>
          {Number(ticketVenta.descuento || 0) > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Descuento ({ticketVenta.descuento_porcentaje}%):</span>
              <span>-${Number(ticketVenta.descuento || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black pt-2 border-t border-zinc-900">
            <span>TOTAL:</span>
            <span>${Number(ticketVenta.total || 0).toFixed(2)} MXN</span>
          </div>
        </div>

        <div className="text-center pt-5">
          <p className="text-xs text-zinc-500">¡Gracias por tu compra y buen entrenamiento!</p>
        </div>

        <div className="flex justify-end gap-2 pt-5">
          <button onClick={() => window.print()} className="btn btn-sm btn-outline text-zinc-800">
            <Printer size={15} /> Imprimir
          </button>
          <button onClick={cerrarModal} className="btn btn-sm bg-zinc-900 text-white hover:bg-black">
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );
}
