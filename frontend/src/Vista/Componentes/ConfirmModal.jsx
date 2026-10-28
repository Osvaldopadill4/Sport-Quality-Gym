import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = '¿Eliminar Registro?',
  message = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  tipo = 'danger'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center transform transition-all scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Botón cerrar esquina */}
        <button 
          onClick={onCancel}
          type="button"
          className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
        >
          <X size={18} />
        </button>

        {/* Icono de Advertencia Centrado */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
          tipo === 'danger' 
            ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-lg shadow-red-500/10' 
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-lg shadow-amber-500/10'
        }`}>
          {tipo === 'danger' ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
        </div>

        {/* Título y Mensaje */}
        <h3 className="text-xl font-bold text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed px-2">
          {message}
        </p>

        {/* Botones de Acción */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl py-2.5"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn border-none font-bold text-white rounded-xl py-2.5 flex items-center justify-center gap-2 shadow-lg ${
              tipo === 'danger'
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
            }`}
          >
            <Trash2 size={16} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
