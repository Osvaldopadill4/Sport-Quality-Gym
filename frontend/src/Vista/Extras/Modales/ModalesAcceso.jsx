import React from 'react';
import {
  Key,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  X,
  User
} from 'lucide-react';

export function AlertaFlashAcceso({ alertaFlash, setAlertaFlash, tiempoRestanteFlash, horaActual }) {
  if (!alertaFlash) return null;

  return (
    <div
      className={`acceso-flash-overlay flash-${alertaFlash.color}`}
      onClick={() => setAlertaFlash(null)}
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
          onClick={() => setAlertaFlash(null)}
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

export function ModalSimuladorMovil({
  showSimuladorMovil,
  setShowSimuladorMovil,
  horaActual,
  clienteSimulado,
  setClienteSimulado,
  listaClientes,
  qrJwtToken,
  tokenCountdown,
  tokenCargando,
  pedirQrDinamico,
  procesarAcceso
}) {
  if (!showSimuladorMovil || !clienteSimulado) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="phone-simulator-wrapper">
        <button
          className="phone-modal-close"
          onClick={() => setShowSimuladorMovil(false)}
        >
          <X size={22} />
        </button>

        <div className="phone-device">
          <div className="phone-notch">
            <div className="phone-speaker" />
            <div className="phone-camera" />
          </div>

          <div className="phone-screen">
            <div className="phone-app-header">
              <div className="phone-gym-brand">
                <span>⚡ GYMTON APP</span>
                <span className="text-xs text-zinc-400">Pase Digital</span>
              </div>
              <span className="phone-clock">{horaActual.slice(0, 5)}</span>
            </div>

            <div className="phone-selector-box">
              <label className="text-xs text-gray-400 font-semibold mb-1 block">
                Seleccionar Socio en el Celular:
              </label>
              <select
                className="phone-select"
                value={clienteSimulado.id}
                onChange={(e) => {
                  const sel = listaClientes.find((c) => Number(c.id) === parseInt(e.target.value, 10));
                  if (sel) setClienteSimulado(sel);
                }}
              >
                {listaClientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.plan} - {c.dias_restantes < 0 ? 'Vencido' : `${c.dias_restantes}d`})
                  </option>
                ))}
              </select>
            </div>

            <div className="phone-credential-card">
              <div className="phone-card-top">
                <img
                  src={clienteSimulado.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                  alt="Socio"
                  className="phone-user-avatar"
                />
                <div>
                  <h4 className="phone-user-name">{clienteSimulado.nombre}</h4>
                  <span className="phone-plan-badge">{clienteSimulado.plan}</span>
                </div>
              </div>

              <div className="phone-qr-frame">
                <div className="qr-svg-container relative flex items-center justify-center p-2 bg-white rounded-xl shadow-md min-h-[160px]">
                  {qrJwtToken ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrJwtToken)}&size=150x150&margin=2`}
                      alt="QR Dinámico"
                      className="w-36 h-36 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <QrCode size={130} className="text-zinc-900" />
                  )}
                </div>

                <div className="flex items-center justify-between w-full mt-2 px-1 text-xs">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono">
                    <Clock size={13} />
                    Expira en: {tokenCountdown}s
                  </span>
                  <button
                    onClick={() => pedirQrDinamico(clienteSimulado.id)}
                    title="Regenerar Token QR"
                    type="button"
                    className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw size={12} className={tokenCargando ? 'animate-spin text-emerald-400' : ''} />
                    Renovar
                  </button>
                </div>

                <div className="qr-token-label">
                  <span>TOKEN SEGURO JWT (ANTI-CAPTURA):</span>
                  <code className="text-[10px] break-all block truncate max-w-full font-mono text-emerald-300">
                    {qrJwtToken ? `${qrJwtToken.slice(0, 22)}...${qrJwtToken.slice(-10)}` : clienteSimulado.uuid}
                  </code>
                </div>
              </div>

              <div className="phone-vigencia-info">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Vigencia:</span>
                  <strong>{clienteSimulado.fecha_vencimiento}</strong>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-zinc-400">Estado:</span>
                  <strong
                    className={
                      clienteSimulado.estado === 0 || clienteSimulado.dias_restantes < 0
                        ? 'text-red-400'
                        : clienteSimulado.dias_restantes <= 5 || clienteSimulado.es_invitado
                        ? 'text-amber-300'
                        : 'text-emerald-400'
                    }
                  >
                    {clienteSimulado.estado === 0
                      ? 'Suspendido'
                      : clienteSimulado.dias_restantes < 0
                      ? 'Vencida'
                      : clienteSimulado.es_invitado
                      ? 'Invitado (1 Día)'
                      : `${clienteSimulado.dias_restantes} días restantes`}
                  </strong>
                </div>
              </div>
            </div>

            <button
              className="btn-phone-scan"
              onClick={() => {
                setShowSimuladorMovil(false);
                procesarAcceso(qrJwtToken || clienteSimulado.uuid);
              }}
            >
              <Key size={18} />
              Simular Escaneo en Torniquete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
