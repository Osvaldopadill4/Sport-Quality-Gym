import React from 'react';
import {
  Search,
  Plus,
  Edit,
  Power,
  X,
  Calendar,
  Check,
  Zap,
  Award,
  GraduationCap,
  UserPlus
} from 'lucide-react';
import '../../CSS/Planes.css';
import Toast from '../Extras/Toast';
import { ModalFormPlan } from '../Extras/Modales/ModalesCatalogos';
import { usePlanes } from '../../Reutilizable/useCatalogos';

const getPlanIcon = (p) => {
  const n = (p.nombre || '').toLowerCase();
  if (n.includes('semanal') || p.duracion_dias === 7) return <Calendar size={22} className="text-cyan-400" />;
  if (n.includes('mensual') || p.duracion_dias === 30) return <Zap size={22} className="text-emerald-400" />;
  if (n.includes('anual') || p.duracion_dias >= 360) return <Award size={22} className="text-amber-400" />;
  if (n.includes('estudian')) return <GraduationCap size={22} className="text-purple-400" />;
  if (n.includes('invitado') || p.duracion_dias === 1) return <UserPlus size={22} className="text-blue-400" />;
  return <Zap size={22} className="text-emerald-400" />;
};

const getPlanBeneficio = (p) => {
  if (p.beneficios) return p.beneficios;
  const n = (p.nombre || '').toLowerCase();
  if (n.includes('semanal')) return 'Acceso pesas y cardio 7 días';
  if (n.includes('mensual')) return 'Acceso ilimitado 30 días';
  if (n.includes('anual')) return 'Máximo ahorro anual garantizado';
  if (n.includes('estudian')) return 'Tarifa preferencial 30 días';
  if (n.includes('invitado') || p.duracion_dias === 1) return 'Pase diario para torniquete';
  return `${p.duracion_dias || 30} días de acceso`;
};

export default function Planes({ loggedUser }) {
  const {
    usuarioActivo,
    planesFiltrados,
    filtro,
    setFiltro,
    busqueda,
    setBusqueda,
    alerta,
    setAlerta,
    showModal,
    setShowModal,
    modalMode,
    formData,
    setFormData,
    total,
    activos,
    inactivos,
    getRolName,
    handleToggleEstado,
    openModal,
    handleSave
  } = usePlanes({ loggedUser });

  return (
    <div className="planes-wrapper">
      <Toast alerta={alerta} onClose={() => setAlerta(null)} />

      {/* Header */}
      <div className="planes-header">
        <h1 className="planes-title">Catálogo y Gestión de Planes</h1>
        <div className="planes-top-actions">
          <div className="planes-search-container relative flex items-center">
            <Search size={20} className="planes-search-icon" />
            <input
              type="text"
              maxLength={50}
              className="planes-search-input"
              placeholder="Buscar plan por nombre, precio, días..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value.slice(0, 50))}
            />
            {busqueda && (
              <button
                type="button"
                className="absolute right-3 text-gray-400 hover:text-white"
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="planes-terminal-badge flex items-center gap-2 text-sm text-gray-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Terminal Activo
          </div>
          <div className="planes-profile flex items-center gap-3 border-l border-gray-700 pl-4">
            <div className="text-right">
              <div className="text-sm font-bold text-white">
                {usuarioActivo ? `${usuarioActivo.nombre} ${usuarioActivo.apellido || ''}`.trim() : 'Usuario Activo'}
              </div>
              <div className="text-xs text-emerald-400">
                {usuarioActivo ? getRolName(usuarioActivo.id_rol) : 'Administrador'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y Botón Nuevo */}
      <div className="planes-filters-bar">
        <div className="planes-filters">
          <button className={`planes-filter-btn ${filtro === 'todos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('todos')}>Todos ({total})</button>
          <button className={`planes-filter-btn ${filtro === 'activos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('activos')}>Activos ({activos})</button>
          <button className={`planes-filter-btn ${filtro === 'inactivos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('inactivos')}>Inactivos ({inactivos})</button>
        </div>
        <button className="planes-btn-nuevo" onClick={() => openModal('create')}>
          <Plus size={16} /> Nuevo Plan
        </button>
      </div>

      {/* Tarjetas Visuales de Planes */}
      <div className="my-6">
        {planesFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl text-gray-400">
            {busqueda ? `No se encontraron planes con el término "${busqueda}"` : 'No hay planes registrados'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {planesFiltrados.map(p => {
              const esActivo = p.estado === 1 || p.estado === 'Activo' || String(p.estado) === '1';
              const esPopular = (p.tipo_plan && p.tipo_plan.toLowerCase().includes('popular')) ||
                                (p.nombre && p.nombre.toLowerCase().includes('mensual'));

              return (
                <div
                  key={p.id}
                  className={`bg-zinc-900 border rounded-2xl p-5 shadow-xl flex flex-col justify-between relative transition-all duration-200 hover:-translate-y-1 ${
                    esPopular
                      ? 'border-emerald-500/80 shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : esActivo
                      ? 'border-zinc-800 hover:border-zinc-700'
                      : 'border-red-900/40 bg-zinc-900/60 opacity-75'
                  }`}
                >
                  {esPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                      MÁS POPULAR
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        p.duracion_dias === 7 ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                        p.duracion_dias === 30 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        p.duracion_dias >= 365 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                        'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}>
                        {p.duracion_dias === 1 ? 'Pase 1 Día' : `${p.duracion_dias} Días`}
                      </span>

                      <div className="flex items-center gap-1 bg-zinc-950/80 rounded-lg p-1 border border-zinc-800">
                        <button
                          onClick={() => openModal('edit', p)}
                          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                          title="Modificar plan"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleEstado(p)}
                          className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                            esActivo ? 'text-emerald-400 hover:text-red-400' : 'text-zinc-500 hover:text-emerald-400'
                          }`}
                          title={esActivo ? 'Desactivar plan' : 'Activar plan'}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-black text-white tracking-wide">{p.nombre}</h3>
                      <div className="text-zinc-400">
                        {getPlanIcon(p)}
                      </div>
                    </div>

                    <div className="my-3">
                      <span className="text-3xl font-black text-emerald-400 tracking-tight">
                        ${p.precio}
                      </span>
                      <span className="text-xs text-zinc-400 font-semibold ml-1">
                        MXN {p.duracion_dias === 30 ? '/ mes' : p.duracion_dias >= 365 ? '/ año' : p.duracion_dias === 1 ? '(24 hrs)' : ''}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2rem]">
                      {p.descripcion || 'Acceso al gimnasio según duración establecida.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-300 truncate mr-2">
                      <Check size={14} className="text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{getPlanBeneficio(p)}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${
                      esActivo ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {esActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal extraído en `Vista/Extras/Modales/ModalesCatalogos.jsx` */}
      <ModalFormPlan
        showModal={showModal}
        setShowModal={setShowModal}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
      />
    </div>
  );
}
