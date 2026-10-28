import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X, Calendar, Check, Zap, Award, GraduationCap, UserPlus } from 'lucide-react';
import '../../CSS/Planes.css';
import { getPlanes, createPlanes, updatePlanes, deletePlanes } from '../../JS/plan';
import Toast from '../Componentes/Toast';
import ConfirmModal from '../Componentes/ConfirmModal';

// Helpers para íconos y beneficios visuales de cada tarjeta de plan
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
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [planes, setPlanes] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ 
    nombre: '', 
    descripcion: '', 
    precio: '', 
    duracion_dias: 30, 
    tipo_plan: 'Regular',
    beneficios: '',
    estado: 1 
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (lista) => {
    setPlanes(lista);
    try {
      localStorage.setItem('gymton_planes', JSON.stringify(lista));
    } catch (e) {
      console.error(e);
    }
  };

  const cargarDatos = () => {
    getPlanes().then(data => {
      if (Array.isArray(data)) {
        // Filtrar exclusivamente los planes (aquellos que tienen duracion_dias y no pertenecen al catálogo de productos)
        const planesReales = data.filter(p => p.duracion_dias !== null && p.duracion_dias !== undefined && p.duracion_dias !== '' && !p.categoria);
        if (planesReales.length > 0) {
          const adaptados = planesReales.map(p => ({
            ...p,
            estado: (p.estado === 1 || p.estado === '1' || String(p.estado).toLowerCase() === 'activo') ? 1 : 0,
            tipo_plan: p.tipo_plan || (
              p.nombre.toLowerCase().includes('semanal') ? 'Semanal' :
              p.nombre.toLowerCase().includes('mensual') ? 'Popular' :
              p.nombre.toLowerCase().includes('anual') ? 'Mejor Valor' :
              p.nombre.toLowerCase().includes('estudian') ? 'Estudiante' : 'Pase 1 Día'
            )
          }));
          setPlanes(adaptados);
          localStorage.setItem('gymton_planes', JSON.stringify(adaptados));
          return;
        }
      }
      const local = localStorage.getItem('gymton_planes');
      if (local) {
        try {
          setPlanes(JSON.parse(local));
          return;
        } catch (e) {
          console.error(e);
        }
      }
      // Los 5 planes requeridos por el gimnasio:
      const planesIniciales = [
        { 
          id: 1, 
          nombre: 'Semanal', 
          precio: 150, 
          duracion_dias: 7, 
          tipo_plan: 'Semanal',
          descripcion: 'Acceso total durante 7 días continuos al área de pesas y cardio.', 
          beneficios: 'Sin inscripción, lockers incluidos, acceso en horario completo',
          estado: 1 
        },
        { 
          id: 2, 
          nombre: 'Mensual', 
          precio: 350, 
          duracion_dias: 30, 
          tipo_plan: 'Popular',
          descripcion: 'Acceso ilimitado por 1 mes (30 días). El plan más solicitado.', 
          beneficios: 'Acceso completo, lockers, valoración física inicial',
          estado: 1 
        },
        { 
          id: 3, 
          nombre: 'Anual', 
          precio: 2100, 
          duracion_dias: 365, 
          tipo_plan: 'Mejor Valor',
          descripcion: 'Membresía anual completa. Solo $175 MXN al mes. Máximo ahorro.', 
          beneficios: 'Acceso ilimitado 365 días, playera conmemorativa, 2 pases de invitado al mes',
          estado: 1 
        },
        { 
          id: 4, 
          nombre: 'Estudiantil', 
          precio: 200, 
          duracion_dias: 30, 
          tipo_plan: 'Estudiante',
          descripcion: 'Tarifa preferencial de $200 MXN/mes con credencial de estudiante vigente.', 
          beneficios: 'Acceso en horario estudiantil flexible, pesas y cardio completo',
          estado: 1 
        },
        { 
          id: 5, 
          nombre: 'Invitado', 
          precio: 30, 
          duracion_dias: 1, 
          tipo_plan: 'Pase 1 Día',
          descripcion: 'Pase temporal de cortesía o prueba por 24 horas para acceso a torniquetes.', 
          beneficios: 'Acceso de prueba 1 día, inducción con instructor',
          estado: 1 
        }
      ];
      setPlanes(planesIniciales);
      localStorage.setItem('gymton_planes', JSON.stringify(planesIniciales));
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = planes.length;
  const activos = planes.filter(p => p.estado === 1 || p.estado === 'Activo').length;
  const inactivos = total - activos;

  const getRolName = (id_rol) => {
    if (id_rol === 1) return 'Administrador';
    if (id_rol === 2) return 'Recepcionista';
    return 'Usuario';
  };

  // Modal de Confirmación personalizada para eliminar (sin alert/confirm de localhost)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });

  // ACCIÓN: Poner en activo (actualiza en BD vía API y en la vista al instante)
  const handlePonerEnActivo = async (p) => {
    const planActualizado = { ...p, estado: 1 };
    const nuevaLista = planes.map(item => item.id === p.id ? planActualizado : item);
    setPlanes(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updatePlanes(p.id, { ...p, estado: 'Activo' });
      mostrarAlerta(`Plan "${p.nombre}" activado correctamente`, 'success');
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Puesto en activo localmente', 'warning');
    }
  };

  // ACCIÓN: Dar de baja (actualiza en BD vía API y en la vista al instante)
  const handleDarDeBaja = async (p) => {
    const planActualizado = { ...p, estado: 0 };
    const nuevaLista = planes.map(item => item.id === p.id ? planActualizado : item);
    setPlanes(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updatePlanes(p.id, { ...p, estado: 'Inactivo' });
      mostrarAlerta(`Plan "${p.nombre}" dado de baja correctamente`, 'info');
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Dado de baja localmente', 'warning');
    }
  };

  const handleToggleEstado = (p) => {
    const esActivo = p.estado === 1 || p.estado === 'Activo';
    if (esActivo) handleDarDeBaja(p);
    else handlePonerEnActivo(p);
  };

  // Solicitar confirmación con Modal en pantalla (reemplaza window.confirm)
  const pedirConfirmacionEliminar = (id, nombre) => {
    setConfirmModal({
      isOpen: true,
      id,
      nombre: nombre || 'este plan'
    });
  };

  // Ejecutar eliminación confirmada en BD vía API
  const confirmarEliminar = async () => {
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try {
      await deletePlanes(id);
      const nuevaLista = planes.filter(p => p.id !== id);
      setPlanes(nuevaLista);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Registro eliminado correctamente', 'success');
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al eliminar plan', 'error');
    }
  };

  const openModal = (mode, plan = null) => {
    setModalMode(mode);
    if (mode === 'edit' && plan) {
      setFormData({
        id: plan.id,
        nombre: plan.nombre || '',
        descripcion: plan.descripcion || '',
        precio: plan.precio ?? '',
        duracion_dias: plan.duracion_dias || 30,
        tipo_plan: plan.tipo_plan || 'Regular',
        beneficios: plan.beneficios || '',
        estado: (plan.estado === 1 || plan.estado === 'Activo') ? 1 : 0
      });
    } else {
      setFormData({ 
        nombre: '', 
        descripcion: '', 
        precio: '', 
        duracion_dias: 30, 
        tipo_plan: 'Regular',
        beneficios: '',
        estado: 1 
      });
    }
    setShowModal(true);
  };

  // ACCIONES: Registrar y Modificar
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.nombre.trim()) {
      mostrarAlerta('Por favor ingresa el nombre del plan', 'error');
      return;
    }
    if (formData.precio === '' || Number(formData.precio) < 0) {
      mostrarAlerta('Ingresa un precio válido en MXN', 'error');
      return;
    }

    const payload = {
      ...formData,
      precio: parseFloat(formData.precio),
      duracion_dias: parseInt(formData.duracion_dias) || 1,
      estado: (formData.estado === 1 || formData.estado === 'Activo') ? 'Activo' : 'Inactivo'
    };

    try {
      if (modalMode === 'create') {
        const { id, ...createData } = payload;
        const res = await createPlanes(createData);
        const nuevo = (res && res.id) ? { ...payload, id: res.id } : { ...payload, id: Date.now() };
        const nuevaLista = [nuevo, ...planes];
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Registro completado correctamente', 'success');
        cargarDatos();
      } else {
        try {
          await updatePlanes(payload.id, payload);
        } catch (errPut) {
          console.warn('PUT falló, intentando registrar plan en BD:', errPut);
          const { id, ...createData } = payload;
          const res = await createPlanes(createData);
          if (res && res.id) payload.id = res.id;
        }
        const nuevaLista = planes.map(item => item.id === payload.id ? { ...item, ...payload } : item);
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
        cargarDatos();
      }
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al procesar la solicitud', 'error');
    }
  };

  // FILTRO EN TIEMPO REAL
  const planesFiltrados = planes.filter(p => {
    const coincideEstado =
      filtro === 'todos' ? true :
      filtro === 'activos' ? (p.estado === 1 || p.estado === 'Activo') :
      (p.estado === 0 || p.estado === 'Inactivo');

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return coincideEstado;

    const nombre = (p.nombre || '').toLowerCase();
    const desc = (p.descripcion || '').toLowerCase();
    const precio = (p.precio || '').toString();
    const dias = (p.duracion_dias || '').toString();

    const coincideBusqueda =
      nombre.includes(termino) ||
      desc.includes(termino) ||
      precio.includes(termino) ||
      dias.includes(termino);

    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="planes-wrapper">
      <Toast alerta={alerta} onClose={() => setAlerta(null)} />

      {/* Header */}
      <div className="planes-header">
        <h1 className="planes-title">Catálogo y Gestión de Planes</h1>
        <div className="planes-top-actions">
          {/* Buscador en tiempo real con useState y filter */}
          <div className="planes-search-container relative flex items-center">
            <Search size={20} className="planes-search-icon" />
            <input 
              type="text" 
              className="planes-search-input" 
              placeholder="Buscar plan por nombre, precio, días..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
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

      {/* Tarjetas Visuales de Planes (Interactivas con Editar, Power y Eliminar) */}
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
                  {/* Badge MÁS POPULAR */}
                  {esPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                      MÁS POPULAR
                    </div>
                  )}

                  <div>
                    {/* Fila superior: Badge de Duración + Botones de Acción (Lápiz, Power, Eliminar) */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        p.duracion_dias === 7 ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                        p.duracion_dias === 30 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        p.duracion_dias >= 365 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                        'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}>
                        {p.duracion_dias === 1 ? 'Pase 1 Día' : `${p.duracion_dias} Días`}
                      </span>

                      {/* Botones de acción dentro de la tarjeta */}
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
                          title={esActivo ? "Dar de baja" : "Poner en activo"}
                        >
                          <Power size={14} />
                        </button>
                        <button 
                          onClick={() => pedirConfirmacionEliminar(p.id, p.nombre)}
                          className="p-1 text-zinc-400 hover:text-red-400 rounded hover:bg-zinc-800 transition-colors"
                          title="Eliminar plan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Nombre del Plan e Icono */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-black text-white tracking-wide">{p.nombre}</h3>
                      <div className="text-zinc-400">
                        {getPlanIcon(p)}
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="my-3">
                      <span className="text-3xl font-black text-emerald-400 tracking-tight">
                        ${p.precio}
                      </span>
                      <span className="text-xs text-zinc-400 font-semibold ml-1">
                        MXN {p.duracion_dias === 30 ? '/ mes' : p.duracion_dias >= 365 ? '/ año' : p.duracion_dias === 1 ? '(24 hrs)' : ''}
                      </span>
                    </div>

                    {/* Descripción */}
                    <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2rem]">
                      {p.descripcion || 'Acceso al gimnasio según duración establecida.'}
                    </p>
                  </div>

                  {/* Beneficios al pie de la tarjeta y estado */}
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

      {/* Modal para Registrar / Modificar */}
      <dialog className={`modal ${showModal ? "modal-open" : ""}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-md flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between bg-base-200">
            <h3 className="font-bold text-lg text-base-content">
              {modalMode === 'create' ? 'Nuevo Plan de Membresía' : 'Editar Plan'}
            </h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Plan *</label>
                <input 
                  type="text" 
                  required
                  className="input input-bordered w-full" 
                  placeholder="Ej. Semanal, Mensual, Estudiantil..."
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Precio (MXN) *</label>
                  <input 
                    type="number" 
                    step="1"
                    required
                    className="input input-bordered w-full" 
                    placeholder="350"
                    value={formData.precio} 
                    onChange={e => setFormData({...formData, precio: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duración (Días) *</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    className="input input-bordered w-full" 
                    placeholder="30"
                    value={formData.duracion_dias} 
                    onChange={e => setFormData({...formData, duracion_dias: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Etiqueta / Tipo</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  placeholder="Ej. Más Popular, Promoción, Estudiante..."
                  value={formData.tipo_plan || ''} 
                  onChange={e => setFormData({...formData, tipo_plan: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea 
                  rows="2"
                  className="textarea textarea-bordered w-full" 
                  placeholder="Detalles de la membresía..."
                  value={formData.descripcion || ''} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select 
                  className="input input-bordered w-full"
                  value={formData.estado}
                  onChange={e => setFormData({...formData, estado: Number(e.target.value)})}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-base-200 flex justify-end gap-3 bg-base-200">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancelar</button>
              <button type="submit" className="btn btn-primary">
                {modalMode === 'create' ? 'Crear Plan' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Modal de Advertencia y Confirmación al Centro de Pantalla */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar Plan?"
        message={`¿Estás seguro de que deseas eliminar permanentemente el plan "${confirmModal.nombre}" de la base de datos? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Plan"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, nombre: '' })}
        tipo="danger"
      />
    </div>
  );
}
