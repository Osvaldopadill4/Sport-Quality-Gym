import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X, Calendar, Check, Zap, Award, GraduationCap, UserPlus } from 'lucide-react';
import '../../CSS/Planes.css';
import { getPlanes, createPlanes, updatePlanes, deletePlanes } from '../../JS/plan';
import Toast from '../Componentes/Toast';

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
      if (Array.isArray(data) && data.length > 0) {
        setPlanes(data);
        localStorage.setItem('gymton_planes', JSON.stringify(data));
      } else {
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
            precio: 0, 
            duracion_dias: 1, 
            tipo_plan: 'Pase 1 Día',
            descripcion: 'Pase temporal de cortesía o prueba por 24 horas para acceso a torniquetes.', 
            beneficios: 'Acceso de prueba 1 día, inducción con instructor',
            estado: 1 
          }
        ];
        setPlanes(planesIniciales);
        localStorage.setItem('gymton_planes', JSON.stringify(planesIniciales));
      }
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

  // ACCIÓN: Poner en activo
  const handlePonerEnActivo = async (p) => {
    try {
      const planActualizado = { ...p, estado: 1 };
      await updatePlanes(p.id, planActualizado);
      const nuevaLista = planes.map(item => item.id === p.id ? planActualizado : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Puesto en activo correctamente', 'success');
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al activar plan', 'error');
    }
  };

  // ACCIÓN: Dar de baja
  const handleDarDeBaja = async (p) => {
    try {
      const planActualizado = { ...p, estado: 0 };
      await updatePlanes(p.id, planActualizado);
      const nuevaLista = planes.map(item => item.id === p.id ? planActualizado : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Dado de baja correctamente', 'info');
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al desactivar plan', 'error');
    }
  };

  const handleToggleEstado = (p) => {
    const esActivo = p.estado === 1 || p.estado === 'Activo';
    if (esActivo) handleDarDeBaja(p);
    else handlePonerEnActivo(p);
  };

  // ACCIÓN: Eliminar
  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este plan de entrenamiento?")) {
      try {
        await deletePlanes(id);
        const nuevaLista = planes.filter(p => p.id !== id);
        guardarLocalmente(nuevaLista);
        mostrarAlerta('Registro eliminado correctamente', 'success');
      } catch (e) {
        console.error(e);
        mostrarAlerta('Error al eliminar plan', 'error');
      }
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
      duracion_dias: parseInt(formData.duracion_dias) || 1
    };

    try {
      if (modalMode === 'create') {
        const res = await createPlanes(payload);
        const nuevo = (res && res.id) ? res : { ...payload, id: Date.now() };
        const nuevaLista = [nuevo, ...planes];
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Registro completado correctamente', 'success');
      } else {
        await updatePlanes(payload.id, payload);
        const nuevaLista = planes.map(item => item.id === payload.id ? { ...item, ...payload } : item);
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
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

      {/* Tarjetas Visuales de los Planes Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Plan Semanal */}
        <div className="bg-gradient-to-b from-base-200 to-base-300 p-5 rounded-2xl border border-base-300 shadow-xl flex flex-col justify-between hover:border-primary transition-all">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="badge badge-info badge-sm font-semibold text-xs">7 Días</span>
              <Calendar size={18} className="text-info" />
            </div>
            <h3 className="text-lg font-black text-white">Semanal</h3>
            <div className="my-2">
              <span className="text-3xl font-black text-emerald-400">$150</span>
              <span className="text-xs text-gray-400 ml-1">MXN</span>
            </div>
            <p className="text-xs text-gray-400">Ideal para viajeros o pruebas cortas de entrenamiento continuo.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-300 flex items-center gap-1.5">
            <Check size={14} className="text-emerald-400 flex-shrink-0" /> Acceso pesas y cardio
          </div>
        </div>

        {/* Plan Mensual */}
        <div className="bg-gradient-to-b from-base-200 to-base-300 p-5 rounded-2xl border-2 border-primary shadow-xl flex flex-col justify-between relative scale-[1.02] hover:shadow-primary/20 transition-all">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge badge-primary font-bold text-black text-xs px-3">
            MÁS POPULAR
          </div>
          <div>
            <div className="flex justify-between items-start mb-2 mt-1">
              <span className="badge badge-success badge-sm font-semibold text-xs text-black">30 Días</span>
              <Zap size={18} className="text-primary" />
            </div>
            <h3 className="text-lg font-black text-white">Mensual</h3>
            <div className="my-2">
              <span className="text-3xl font-black text-emerald-400">$350</span>
              <span className="text-xs text-gray-400 ml-1">MXN / mes</span>
            </div>
            <p className="text-xs text-gray-400">Suscripción estándar mensual completa sin plazos forzosos.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-300 flex items-center gap-1.5">
            <Check size={14} className="text-emerald-400 flex-shrink-0" /> Acceso ilimitado 30 días
          </div>
        </div>

        {/* Plan Anual */}
        <div className="bg-gradient-to-b from-base-200 to-base-300 p-5 rounded-2xl border border-base-300 shadow-xl flex flex-col justify-between hover:border-primary transition-all">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="badge badge-warning badge-sm font-semibold text-xs text-black">365 Días</span>
              <Award size={18} className="text-warning" />
            </div>
            <h3 className="text-lg font-black text-white">Anual</h3>
            <div className="my-2">
              <span className="text-3xl font-black text-emerald-400">$2,100</span>
              <span className="text-xs text-gray-400 ml-1">MXN / año</span>
            </div>
            <p className="text-xs text-gray-400">Equivale a solo $175 MXN/mes. Ahorro de más del 50% anual.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-300 flex items-center gap-1.5">
            <Check size={14} className="text-emerald-400 flex-shrink-0" /> Máximo ahorro garantizado
          </div>
        </div>

        {/* Plan Estudiantil */}
        <div className="bg-gradient-to-b from-base-200 to-base-300 p-5 rounded-2xl border border-base-300 shadow-xl flex flex-col justify-between hover:border-primary transition-all">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="badge badge-secondary badge-sm font-semibold text-xs">Estudiantes</span>
              <GraduationCap size={18} className="text-secondary" />
            </div>
            <h3 className="text-lg font-black text-white">Estudiantil</h3>
            <div className="my-2">
              <span className="text-3xl font-black text-emerald-400">$200</span>
              <span className="text-xs text-gray-400 ml-1">MXN / mes</span>
            </div>
            <p className="text-xs text-gray-400">Tarifa reducida con credencial escolar vigente.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-300 flex items-center gap-1.5">
            <Check size={14} className="text-emerald-400 flex-shrink-0" /> Tarifa preferencial 30 días
          </div>
        </div>

        {/* Plan Invitado */}
        <div className="bg-gradient-to-b from-base-200 to-base-300 p-5 rounded-2xl border border-base-300 shadow-xl flex flex-col justify-between hover:border-primary transition-all">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="badge badge-ghost badge-sm font-semibold text-xs">Pase 1 Día</span>
              <UserPlus size={18} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-black text-white">Invitado</h3>
            <div className="my-2">
              <span className="text-3xl font-black text-emerald-400">$0</span>
              <span className="text-xs text-gray-400 ml-1">MXN (24 hrs)</span>
            </div>
            <p className="text-xs text-gray-400">Pase de prueba para torniquete válido únicamente el día de ingreso.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-300 flex items-center gap-1.5">
            <Check size={14} className="text-emerald-400 flex-shrink-0" /> Acceso diario por torniquete
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

      {/* Tabla de Planes */}
      <div className="planes-table-container">
        <table className="planes-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Precio (MXN)</th>
              <th>Duración</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th style={{textAlign:'right'}}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {planesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-400 italic">
                  {busqueda ? `No se encontraron planes con el término "${busqueda}"` : 'No hay planes registrados'}
                </td>
              </tr>
            ) : (
              planesFiltrados.map(p => {
                const esActivo = p.estado === 1 || p.estado === 'Activo';
                return (
                  <tr key={p.id}>
                    <td className="planes-td-name font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-base">{p.nombre}</span>
                        {p.tipo_plan && (
                          <span className="badge badge-sm badge-outline text-xs">
                            {p.tipo_plan}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="font-extrabold text-emerald-400 text-base">
                      ${p.precio} MXN
                    </td>
                    <td className="font-medium text-gray-300">
                      {p.duracion_dias} {p.duracion_dias === 1 ? 'día' : 'días'}
                    </td>
                    <td className="text-gray-400 text-sm max-w-xs">{p.descripcion}</td>
                    <td>
                      {esActivo ? (
                        <span className="planes-badge activo">Activo</span>
                      ) : (
                        <span className="planes-badge inactivo">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <div className="planes-table-actions">
                        <button className="planes-action-btn edit" title="Editar plan" onClick={() => openModal('edit', p)}>
                          <Edit size={16}/>
                        </button>
                        <button 
                          className={`planes-action-btn ${esActivo ? 'power-off' : 'power-on'}`} 
                          title={esActivo ? "Dar de baja" : "Poner en activo"} 
                          onClick={() => handleToggleEstado(p)}
                        >
                          <Power size={16}/>
                        </button>
                        <button className="planes-action-btn delete" title="Eliminar plan" onClick={() => handleEliminar(p.id)}>
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="planes-pagination flex justify-between items-center p-4 bg-white border-t border-gray-100">
          <span className="text-sm text-gray-500 font-medium">
            Mostrando {planesFiltrados.length} de {total} planes
            {busqueda && ` (filtrado por "${busqueda}")`}
          </span>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-outline">Anterior</button>
            <button className="btn btn-sm btn-primary">Siguiente</button>
          </div>
        </div>
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
    </div>
  );
}
