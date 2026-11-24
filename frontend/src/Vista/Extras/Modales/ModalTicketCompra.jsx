import React from 'react';
import { Printer, CheckCircle2 } from 'lucide-react';

export default function ModalTicketCompra({ ticketCompra, setTicketCompra, onClose }) {
  if (!ticketCompra) return null;

  const cerrarModal = () => {
    if (typeof onClose === 'function') onClose();
    if (typeof setTicketCompra === 'function') setTicketCompra(null);
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-white text-zinc-900 max-w-md p-6 rounded-2xl shadow-2xl font-mono">
        {/* Cabecera del Ticket con Logo Oficial */}
        <div className="text-center pb-4 border-b border-dashed border-zinc-400">
          <div className="flex justify-center mb-1">
            <img src="/logo-gym.png" alt="Logo Gym" className="w-16 h-16 object-contain" />
          </div>
          <h2 className="text-base font-black tracking-wider text-black uppercase">
            GYM SPORT QUALITY CENTER
          </h2>
          <p className="text-[11px] text-zinc-600 font-bold uppercase">
            Comprobante Oficial de Entrada a Inventario (Reabastecimiento)
          </p>
          <div className="text-xs font-bold bg-zinc-200 py-1 px-3 rounded mt-2 inline-block">
            Folio: {ticketCompra.folio || `COM-${ticketCompra.id || '0001'}`}
          </div>
        </div>

        {/* Metadatos de la Compra */}
        <div className="py-3 text-xs space-y-1 border-b border-dashed border-zinc-400">
          <div className="flex justify-between">
            <span className="text-zinc-600">Fecha y Hora:</span>
            <strong>{ticketCompra.fecha || new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Recibió en Almacén:</span>
            <strong>{ticketCompra.usuario || 'Encargado de Turno'}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Proveedor Suministrador:</span>
            <strong className="text-emerald-700">{ticketCompra.proveedor || 'Proveedor Comercial'}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600">Estado de Recepción:</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
              <CheckCircle2 size={13} /> {ticketCompra.estado || 'Completada'}
            </span>
          </div>
        </div>

        {/* Detalle de Productos Ingresados */}
        <div className="py-3 border-b border-dashed border-zinc-400 space-y-2">
          <div className="flex justify-between font-bold text-xs text-zinc-700">
            <span>Cant. / Artículo</span>
            <span>C. Unit. / Subtotal</span>
          </div>
          {(ticketCompra.detalles || []).map((d, i) => (
            <div key={i} className="flex justify-between items-center text-xs">
              <div className="truncate pr-2">
                <span className="font-bold">{d.cantidad}x</span> {d.articulo || d.nombre}
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="text-zinc-500 mr-2">${Number(d.costo_unitario || 0).toFixed(2)}</span>
                <strong>${Number(d.subtotal || (d.cantidad * d.costo_unitario) || 0).toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Total General */}
        <div className="pt-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-600">Total Artículos Reabastecidos:</span>
            <strong>
              {(ticketCompra.detalles || []).reduce((acc, it) => acc + Number(it.cantidad || 0), 0)} unidades
            </strong>
          </div>
          <div className="flex justify-between text-base font-black pt-2 border-t border-zinc-900">
            <span>INVERSIÓN TOTAL:</span>
            <span className="text-emerald-700">${Number(ticketCompra.total || 0).toFixed(2)} MXN</span>
          </div>
        </div>

        {/* Firmas de Conformidad */}
        <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[10px] text-zinc-500">
          <div>
            <div className="border-b border-zinc-400 mb-1 h-6" />
            <span>Firma de Entrega (Proveedor)</span>
          </div>
          <div>
            <div className="border-b border-zinc-400 mb-1 h-6" />
            <span>Firma de Recepción (Almacén)</span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-2 pt-6">
          <button onClick={() => window.print()} className="btn btn-sm btn-outline text-zinc-800">
            <Printer size={15} /> Imprimir Comprobante
          </button>
          <button onClick={cerrarModal} className="btn btn-sm bg-zinc-900 text-white hover:bg-black">
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );
}
