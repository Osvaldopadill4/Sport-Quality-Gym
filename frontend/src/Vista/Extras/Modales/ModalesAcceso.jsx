import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  X,
  User
} from 'lucide-react';

export function AlertaFlashAcceso({ alertaFlash, setAlertaFlash, tiempoRestanteFlash, horaActual, onClose }) {
  if (!alertaFlash) return null;

  const handleCerrar = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else if (typeof setAlertaFlash === 'function') {
      setAlertaFlash(null);
    }
  };

  return (
    <div
      className={`acceso-flash-overlay flash-${alertaFlash.color}`}
      onClick={handleCerrar}
    >
      <div className="flash-progress-bar">
        <div
          className="flash-progress-fill"
          style={{ width: `${(tiempoRestanteFlash / 4) * 100}%` }}
        />
      </div>

      <div
        className="flash-content-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="flash-close-btn"
          onClick={handleCerrar}
          title="Cerrar pantalla de acceso (Esc o Espacio)"
        >
          <X size={28} />
        </button>

        <div className="flash-header-badge">
          {alertaFlash.color === 'green' && <CheckCircle2 size={54} className="flash-icon-pulse" />}
          {alertaFlash.color === 'yellow' && <AlertTriangle size={54} className="flash-icon-pulse" />}
          {alertaFlash.color === 'red' && <XCircle size={54} className="flash-icon-pulse flash-icon-shake" />}

          <div>
            <h1 className="flash-title">{alertaFlash.titulo}</h1>
            <p className="flash-subtitle">{alertaFlash.subtitulo}</p>
          </div>
        </div>

        <div className="flash-body-grid">
          <div className="flash-avatar-box">
            {alertaFlash.cliente?.foto ? (
              <img
                src={alertaFlash.cliente.foto}
                alt={alertaFlash.cliente.nombre}
                className="flash-avatar-img"
              />
            ) : (
              <div className="flash-avatar-fallback">
                <User size={80} />
              </div>
            )}
            <div className={`flash-avatar-status-ring ring-${alertaFlash.color}`} />
          </div>

          <div className="flash-details">
            <span className="flash-socio-tag">Socio Registrado</span>
            <h2 className="flash-socio-name">{alertaFlash.cliente?.nombre || 'Desconocido'}</h2>

            <div className="flash-meta-grid">
              <div className="flash-meta-item">
                <span className="meta-label">Plan / Membresía:</span>
                <span className="meta-val font-extrabold">{alertaFlash.cliente?.plan || 'Ninguno'}</span>
              </div>

              <div className="flash-meta-item">
                <span className="meta-label">Días Restantes:</span>
                <span className={`meta-val ${alertaFlash.cliente?.dias_restantes < 0 ? 'text-red-400' : 'text-emerald-300'}`}>
                  {alertaFlash.cliente?.dias_restantes !== undefined
                    ? `${alertaFlash.cliente.dias_restantes} días`
                    : 'N/A'}
                </span>
              </div>

              <div className="flash-meta-item">
                <span className="meta-label">Fecha y Hora:</span>
                <span className="meta-val">{new Date().toLocaleDateString()} - {horaActual}</span>
              </div>

              <div className="flash-meta-item">
                <span className="meta-label">Torniquete:</span>
                <span className="meta-val">
                  {alertaFlash.color === 'red' ? '⛔ BLOQUEADO' : '🟢 DESBLOQUEADO (1 PASE)'}
                </span>
              </div>
            </div>

            <div className={`flash-reason-box reason-${alertaFlash.color}`}>
              <p>{alertaFlash.razon}</p>
            </div>
          </div>
        </div>

        <div className="flash-footer">
          <span className="flash-countdown-tag">
            <Clock size={16} /> Auto-cierre en {tiempoRestanteFlash}s
          </span>
          <span className="flash-dismiss-hint">
            Presiona <strong>[ESC]</strong> o <strong>[ESPACIO]</strong> para continuar
          </span>
        </div>
      </div>
    </div>
  );
}

// Módulo de simulación removido: el sistema ahora valida exclusivamente contra la base de datos real en MySQL
export function ModalSimuladorMovil() {
  return null;
}
