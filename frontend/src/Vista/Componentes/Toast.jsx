import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ alerta, onClose, duracion = 3500 }) {
  useEffect(() => {
    if (!alerta) return;
    const timer = setTimeout(() => {
      onClose();
    }, duracion);
    return () => clearTimeout(timer);
  }, [alerta, onClose, duracion]);

  if (!alerta || !alerta.mensaje) return null;

  const tipo = alerta.tipo || 'success';

  const iconos = {
    success: <CheckCircle2 size={20} className="text-white flex-shrink-0" />,
    error: <AlertCircle size={20} className="text-white flex-shrink-0" />,
    info: <Info size={20} className="text-white flex-shrink-0" />,
    warning: <AlertTriangle size={20} className="text-white flex-shrink-0" />
  };

  const bgColores = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  };

  return (
    <div 
      className="gymton-toast-notification"
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        borderRadius: '0.75rem',
        color: '#ffffff',
        backgroundColor: bgColores[tipo] || '#10b981',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        minWidth: '280px',
        maxWidth: '420px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {iconos[tipo] || iconos.success}
      </div>
      <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 }}>
        {alerta.mensaje}
      </div>
      <button 
        type="button"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '0.375rem',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
        title="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
}
