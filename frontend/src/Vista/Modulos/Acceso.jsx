import React from 'react';
import {
  Key,
  Search,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  X,
  Volume2,
  VolumeX,
  History,
  TrendingUp,
  User
} from 'lucide-react';
import '../../CSS/Acceso.css';
import Toast from '../Extras/Toast';
import { AlertaFlashAcceso } from '../Extras/Modales/ModalesAcceso';
import { useAcceso } from '../../Reutilizable/useAcceso';

export default function Acceso({ loggedUser }) {
  const {
    usuarioActivo,
    inputCodigo,
    setInputCodigo,
    busqueda,
    setBusqueda,
    filtroResultado,
    setFiltroResultado,
    alerta,
    setAlerta,
    sonidoHabilitado,
    setSonidoHabilitado,
    alertaFlash,
    setAlertaFlash,
    tiempoRestanteFlash,
    horaActual,
    inputRef,
    procesarAcceso,
    accesosFiltrados,
    totalHoy,
    permitidosHoy,
    atencionesHoy,
    denegadosHoy
  } = useAcceso({ loggedUser });

  return (
    <div className="acceso-module-wrapper">
      {alerta && (
        <Toast
          mensaje={alerta.mensaje}
          tipo={alerta.tipo}
          onClose={() => setAlerta(null)}
        />
      )}

      {/* Modal Flash de Torniquete extraído en `Vista/Extras/Modales/ModalesAcceso.jsx` */}
      <AlertaFlashAcceso
        alertaFlash={alertaFlash}
        tiempoRestanteFlash={tiempoRestanteFlash}
        horaActual={horaActual}
        onClose={() => setAlertaFlash(null)}
      />

      {/* Encabezado y Estado de la Terminal */}
      <div className="acceso-hero-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Key size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center gap-3">
                  Control de Acceso y Torniquetes
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                  Recepción automatizada con validación por token QR y destello visual.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="status-radar-pill">
              <span className="status-radar-dot" />
              <span className="text-xs font-bold text-emerald-400">Torniquete Principal En Línea</span>
            </div>

            <div className="status-clock-pill">
              <Clock size={16} className="text-zinc-400" />
              <span className="text-sm font-mono font-bold text-white">{horaActual}</span>
            </div>

            {usuarioActivo && (
              <div className="status-clock-pill hidden sm:flex">
                <User size={15} className="text-emerald-400" />
                <span className="text-xs text-zinc-300 font-medium">Recepción: {usuarioActivo.nombre || usuarioActivo.usuario}</span>
              </div>
            )}

            <button
              className={`p-2.5 rounded-xl border transition-all ${sonidoHabilitado ? 'bg-zinc-800 border-zinc-700 text-emerald-400 hover:bg-zinc-700' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
              onClick={() => setSonidoHabilitado(!sonidoHabilitado)}
              title={sonidoHabilitado ? 'Sonido activado' : 'Sonido silenciado'}
            >
              {sonidoHabilitado ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Grid Superior: Escáner de Entrada */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="scanner-glow-bar" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <QrCode size={16} /> Lector Óptico / Entrada QR
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Auto-focus activo
            </span>
          </div>

          <p className="text-zinc-300 text-sm mb-6">
            Pase el código QR del celular del socio frente al lector USB, o ingrese manualmente su token:
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              procesarAcceso();
            }}
            className="relative"
          >
            <div className="scanner-input-container">
              <input
                ref={inputRef}
                type="text"
                className="scanner-main-input"
                placeholder="Escanee QR o ingrese código..."
                value={inputCodigo}
                onChange={(e) => setInputCodigo(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="scanner-submit-btn"
                title="Validar Acceso"
              >
                <span>Validar</span>
                <Key size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Tarjetas de Estadísticas de Hoy */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="acceso-stat-card border-zinc-800 bg-zinc-900">
            <div className="stat-icon-wrapper bg-blue-500/10 text-blue-400">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="stat-label">Total Accesos Hoy</span>
              <h3 className="stat-number text-white">{totalHoy}</h3>
              <span className="stat-hint text-zinc-400">Entradas al gym</span>
            </div>
          </div>

          <div className="acceso-stat-card border-emerald-900/50 bg-emerald-950/20">
            <div className="stat-icon-wrapper bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="stat-label">Permitidos (Verde)</span>
              <h3 className="stat-number text-emerald-400">{permitidosHoy}</h3>
              <span className="stat-hint text-emerald-500/80">Membresía activa</span>
            </div>
          </div>

          <div className="acceso-stat-card border-amber-900/50 bg-amber-950/20">
            <div className="stat-icon-wrapper bg-amber-500/10 text-amber-400">
              <AlertTriangle size={22} />
            </div>
            <div>
              <span className="stat-label">Atención (Amarillo)</span>
              <h3 className="stat-number text-amber-400">{atencionesHoy}</h3>
              <span className="stat-hint text-amber-500/80">&lt; 5 días o Invitado</span>
            </div>
          </div>

          <div className="acceso-stat-card border-red-900/50 bg-red-950/20">
            <div className="stat-icon-wrapper bg-red-500/10 text-red-400">
              <XCircle size={22} />
            </div>
            <div>
              <span className="stat-label">Denegados (Rojo)</span>
              <h3 className="stat-number text-red-400">{denegadosHoy}</h3>
              <span className="stat-hint text-red-500/80">Vencidos o inválidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Accesos */}
      <div className="acceso-log-section">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <History size={20} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              Historial de Accesos Registrados
            </h3>
            <span className="text-xs bg-zinc-800 text-zinc-300 font-bold px-2 py-0.5 rounded-full border border-zinc-700">
              {accesosFiltrados.length}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por socio, plan o UUID..."
                className="busqueda-acceso-input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  onClick={() => setBusqueda('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="btn-group-filtros">
              <button
                className={`filtro-pill ${filtroResultado === 'todos' ? 'active' : ''}`}
                onClick={() => setFiltroResultado('todos')}
              >
                Todos
              </button>
              <button
                className={`filtro-pill ${filtroResultado === 'permitido' ? 'active-green' : ''}`}
                onClick={() => setFiltroResultado('permitido')}
              >
                Permitidos
              </button>
              <button
                className={`filtro-pill ${filtroResultado === 'atencion' ? 'active-yellow' : ''}`}
                onClick={() => setFiltroResultado('atencion')}
              >
                Advertencias
              </button>
              <button
                className={`filtro-pill ${filtroResultado === 'denegado' ? 'active-red' : ''}`}
                onClick={() => setFiltroResultado('denegado')}
              >
                Denegados
              </button>
            </div>
          </div>
        </div>

        <div className="acceso-table-card">
          <div className="overflow-x-auto">
            <table className="acceso-modern-table">
              <thead>
                <tr>
                  <th>Socio</th>
                  <th>Membresía / Plan</th>
                  <th>Fecha y Hora</th>
                  <th>Días Restantes</th>
                  <th>Estado del Torniquete</th>
                </tr>
              </thead>
              <tbody>
                {accesosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-zinc-400">
                      No se encontraron registros de acceso con los criterios de búsqueda.
                    </td>
                  </tr>
                ) : (
                  accesosFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold uppercase">
                              {item.cliente_nombre?.charAt(0) || '?'}
                            </div>
                            <span className={`table-status-dot dot-${item.color}`} />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">
                              {item.cliente_nombre}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono">
                              {item.uuid ? item.uuid.slice(0, 16) + '...' : 'Socio Registrado'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="text-sm font-semibold text-zinc-300">
                          {item.plan}
                        </span>
                      </td>

                      <td>
                        <div className="text-xs">
                          <span className="text-zinc-300 font-medium block">{item.fecha}</span>
                          <span className="text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                            <Clock size={12} /> {item.hora}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          item.dias_restantes < 0
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : item.dias_restantes <= 5
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {item.dias_restantes !== undefined
                            ? item.dias_restantes < 0
                              ? `Vencido (${Math.abs(item.dias_restantes)}d)`
                              : `${item.dias_restantes} días`
                            : 'N/A'}
                        </span>
                      </td>

                      <td>
                        <span className={`badge-resultado badge-${item.color}`}>
                          {item.color === 'green' && <CheckCircle2 size={13} />}
                          {item.color === 'yellow' && <AlertTriangle size={13} />}
                          {item.color === 'red' && <XCircle size={13} />}
                          <span>{item.resultado}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}