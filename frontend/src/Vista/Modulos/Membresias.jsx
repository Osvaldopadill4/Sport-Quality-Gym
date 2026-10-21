import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X, RefreshCw, Calendar, CreditCard } from 'lucide-react';
import '../../CSS/Membresias.css';
import { getMembresias, createMembresias, updateMembresias, deleteMembresias } from '../../JS/membresia';
import Toast from '../Componentes/Toast';

// Función SQL `fn_dias_restantes_membresia(p_fecha_vencimiento)`:
// DATEDIFF(p_fecha_vencimiento, CURDATE())
export const fnDiasRestantes = (fechaVenc) => {
  if (!fechaVenc) return 0;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fechaVenc);
  venc.setHours(0, 0, 0, 0);
  return Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
};

// Función SQL `fn_estado_membresia(p_fecha_inicio, p_fecha_vencimiento)`:
// Retorna 'Pendiente', 'Vencida', 'Por vencer' (<= 3 días) o 'Activa'
export const fnEstadoMembresia = (fechaInicio, fechaVenc) => {
  const dias = fnDiasRestantes(fechaVenc);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(fechaInicio);
  inicio.setHours(0, 0, 0, 0);

  if (hoy < inicio) return 'Pendiente';
  if (dias < 0) return 'Vencida';
  if (dias <= 3) return 'Por vencer';
  return 'Activa';
};

export default function Membresias({ loggedUser }) {
  const [membresias, setMembresias] = useState([]);
  const [filtro, setFiltro] = useState('todas'); // 'todas' | 'activas' | 'por_vencer' | 'vencidas'
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  
  const [formData, setFormData] = useState({ 
    id_cliente: 1, 
    cliente_nombre: 'Juan Pérez',
    id_plan: 2, 
    plan_nombre: 'Mensual',
    duracion_dias: 30,
    fecha_inicio: new Date().toISOString().split('T')[0], 
    fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    estado: 'activa' 
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (lista) => {
    setMembresias(lista);
    try {
      localStorage.setItem('gymton_membresias', JSON.stringify(lista));
    } catch (e) {
      console.error(e);
    }
  };

  const cargarDatos = () => {
    getMembresias().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setMembresias(data);
        localStorage.setItem('gymton_membresias', JSON.stringify(data));
      } else {
        const local = localStorage.getItem('gymton_membresias');
        if (local) {
          try {
            setMembresias(JSON.parse(local));
            return;
          } catch (e) {
            console.error(e);
          }
        }
        // Registros enriquecidos simulando la vista `vw_estado_membresias` y `vw_clientes_membresias`
        const hoy = Date.now();
        const fallback = [
          { 
            id: 1, 
            id_cliente: 1, 
            cliente_nombre: 'Juan Pérez García', 
            id_plan: 2, 
            plan_nombre: 'Mensual', 
            duracion_dias: 30,
            fecha_inicio: new Date(hoy - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            fecha_vencimiento: new Date(hoy + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            estado: 'activa' 
          },
          { 
            id: 2, 
            id_cliente: 2, 
            cliente_nombre: 'Carolina Gómez Soto', 
            id_plan: 3, 
            plan_nombre: 'Anual', 
            duracion_dias: 365,
            fecha_inicio: new Date(hoy - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            fecha_vencimiento: new Date(hoy + 245 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            estado: 'activa' 
          },
          { 
            id: 3, 
            id_cliente: 4, 
            cliente_nombre: 'Sofía Mendoza Luna', 
            id_plan: 1, 
            plan_nombre: 'Semanal', 
            duracion_dias: 7,
            fecha_inicio: new Date(hoy - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            fecha_vencimiento: new Date(hoy + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            estado: 'activa' 
          },
          { 
            id: 4, 
            id_cliente: 5, 
            cliente_nombre: 'Roberto Sánchez Ruiz', 
            id_plan: 2, 
            plan_nombre: 'Mensual', 
            duracion_dias: 30,
            fecha_inicio: new Date(hoy - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            fecha_vencimiento: new Date(hoy - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            estado: 'vencida' 
          }
        ];
        setMembresias(fallback);
        localStorage.setItem('gymton_membresias', JSON.stringify(fallback));
      }
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Lógica del procedimiento almacenado `sp_renovar_membresia(p_id_membresia)`
  const handleRenovarMembresia = async (m) => {
    const duracion = Number(m.duracion_dias) || 30;
    const hoyStr = new Date().toISOString().split('T')[0];
    
    // fecha_vencimiento = DATE_ADD(GREATEST(COALESCE(v_fecha, CURDATE()), CURDATE()), INTERVAL v_duracion DAY)
    const baseFecha = new Date(m.fecha_vencimiento) > new Date() ? new Date(m.fecha_vencimiento) : new Date();
    const nuevaVencimiento = new Date(baseFecha.getTime() + duracion * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const renovada = {
      ...m,
      fecha_inicio: hoyStr,
      fecha_vencimiento: nuevaVencimiento,
      estado: 'activa'
    };

    try {
      await updateMembresias(m.id, renovada);
      const nuevaLista = membresias.map(item => item.id === m.id ? renovada : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta(`Membresía renovada exitosamente (sp_renovar_membresia). Nueva vigencia hasta: ${nuevaVencimiento}`, 'success');
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al renovar membresía', 'error');
    }
  };

  const handleToggleEstado = async (m) => {
    const nuevoEstado = (m.estado === 'activa' || m.estado === 'Activo' || m.estado === 1) ? 'inactiva' : 'activa';
    try {
      const act = { ...m, estado: nuevoEstado };
      await updateMembresias(m.id, act);
      const nuevaLista = membresias.map(item => item.id === m.id ? act : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta(`Estado actualizado a: ${nuevoEstado}`, 'info');
      cargarDatos();
    } catch (e) { 
      console.error(e); 
      mostrarAlerta('Error al cambiar estado', 'error');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro de membresía?")) {
      try { 
        await deleteMembresias(id); 
        const nuevaLista = membresias.filter(m => m.id !== id);
        guardarLocalmente(nuevaLista);
        mostrarAlerta('Membresía eliminada correctamente', 'success');
        cargarDatos(); 
      } catch(e) { 
        console.error(e); 
        mostrarAlerta('Error al eliminar', 'error');
      }
    }
  };

  const openModal = (mode, m = null) => {
    setModalMode(mode);
    const hoyStr = new Date().toISOString().split('T')[0];
    if (mode === 'edit' && m) {
      setFormData({ ...m });
    } else {
      setFormData({ 
        id_cliente: 1, 
        cliente_nombre: 'Juan Pérez',
        id_plan: 2, 
        plan_nombre: 'Mensual',
        duracion_dias: 30,
        fecha_inicio: hoyStr, 
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        estado: 'activa' 
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      if (modalMode === 'create') {
        const res = await createMembresias(formData);
        const nuevo = (res && res.id) ? res : { ...formData, id: Date.now() };
        guardarLocalmente([nuevo, ...membresias]);
        mostrarAlerta('Membresía registrada correctamente', 'success');
      } else {
        await updateMembresias(formData.id, formData);
        const lista = membresias.map(m => m.id === formData.id ? { ...m, ...formData } : m);
        guardarLocalmente(lista);
        mostrarAlerta('Membresía actualizada', 'success');
      }
      setShowModal(false); 
      cargarDatos();
    } catch(e) { 
      console.error(e); 
      mostrarAlerta('Error al guardar datos', 'error');
    }
  };

  // Filtrado en tiempo real con soporte para las funciones `fn_estado_membresia` y `fn_dias_restantes`
  const membresiasFiltradas = membresias.filter(m => {
    const estadoCalc = fnEstadoMembresia(m.fecha_inicio, m.fecha_vencimiento);
    
    if (filtro === 'activas' && estadoCalc !== 'Activa') return false;
    if (filtro === 'por_vencer' && estadoCalc !== 'Por vencer') return false;
    if (filtro === 'vencidas' && estadoCalc !== 'Vencida') return false;

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    const cliente = (m.cliente_nombre || `Cliente #${m.id_cliente}`).toLowerCase();
    const plan = (m.plan_nombre || `Plan #${m.id_plan}`).toLowerCase();
    return cliente.includes(termino) || plan.includes(termino) || String(m.id_cliente).includes(termino);
  });

  const total = membresias.length;
  const activasCount = membresias.filter(m => fnEstadoMembresia(m.fecha_inicio, m.fecha_vencimiento) === 'Activa').length;
  const porVencerCount = membresias.filter(m => fnEstadoMembresia(m.fecha_inicio, m.fecha_vencimiento) === 'Por vencer').length;
  const vencidasCount = membresias.filter(m => fnEstadoMembresia(m.fecha_inicio, m.fecha_vencimiento) === 'Vencida').length;

  return (
    <div className="membresias-wrapper p-6 bg-zinc-950 min-h-screen text-gray-200">
      {alerta && <Toast mensaje={alerta.mensaje} tipo={alerta.tipo} onClose={() => setAlerta(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="text-emerald-400" />
            Control de Membresías (Vistas y Funciones SQL)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Usa <code>vw_estado_membresias</code>, <code>fn_dias_restantes</code> y el procedimiento <code>sp_renovar_membresia</code>.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              className="bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" 
              placeholder="Buscar por socio o plan..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <button 
            className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold border-none flex items-center gap-1"
            onClick={() => openModal('create')}
          >
            <Plus size={16} /> Nueva Membresía
          </button>
        </div>
      </div>

      {/* Tabs calculadas según fn_estado_membresia */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filtro === 'todas' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setFiltro('todas')}
        >
          Todas ({total})
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filtro === 'activas' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setFiltro('activas')}
        >
          Activas ({activasCount})
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filtro === 'por_vencer' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setFiltro('por_vencer')}
        >
          Por Vencer (≤3d) ({porVencerCount})
        </button>
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filtro === 'vencidas' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setFiltro('vencidas')}
        >
          Vencidas ({vencidasCount})
        </button>
      </div>

      {/* Tabla con atributos de vw_estado_membresias */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-800/60 text-xs uppercase text-gray-400 font-bold border-b border-zinc-800">
              <tr>
                <th className="p-4">Socio (Cliente)</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Fecha Inicio</th>
                <th className="p-4">Vencimiento</th>
                <th className="p-4">Días Restantes (fn_dias)</th>
                <th className="p-4">Estado (fn_estado)</th>
                <th className="p-4 text-right">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {membresiasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400 italic">
                    No se encontraron membresías con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                membresiasFiltradas.map(m => {
                  const dias = fnDiasRestantes(m.fecha_vencimiento);
                  const estado = fnEstadoMembresia(m.fecha_inicio, m.fecha_vencimiento);
                  return (
                    <tr key={m.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-white">
                        {m.cliente_nombre || `Socio #${m.id_cliente}`}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-800 border border-zinc-700 text-gray-300">
                          {m.plan_nombre || `Plan #${m.id_plan}`}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">{m.fecha_inicio}</td>
                      <td className="p-4 font-semibold text-white">{m.fecha_vencimiento}</td>
                      <td className="p-4">
                        <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
                          dias < 0 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : dias <= 3 
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {dias < 0 ? `Vencida hace ${Math.abs(dias)}d` : `${dias} días`}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          estado === 'Activa' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : estado === 'Por vencer' 
                            ? 'bg-amber-500/20 text-amber-300' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {estado}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Botón de Renovar ejecutando la lógica de sp_renovar_membresia */}
                          <button 
                            className="btn btn-xs bg-zinc-800 hover:bg-emerald-600 hover:text-black text-emerald-400 border border-zinc-700 flex items-center gap-1 font-bold"
                            title="Renovar membresía (sp_renovar_membresia)"
                            onClick={() => handleRenovarMembresia(m)}
                          >
                            <RefreshCw size={12} /> Renovar
                          </button>
                          <button 
                            className="btn btn-xs btn-ghost text-gray-400 hover:text-white"
                            onClick={() => handleToggleEstado(m)}
                            title={m.estado === 'activa' ? 'Desactivar' : 'Activar'}
                          >
                            <Power size={14}/>
                          </button>
                          <button 
                            className="btn btn-xs btn-ghost text-gray-400 hover:text-white"
                            onClick={() => openModal('edit', m)}
                            title="Editar"
                          >
                            <Edit size={14}/>
                          </button>
                          <button 
                            className="btn btn-xs btn-ghost text-red-400 hover:bg-red-500/10"
                            onClick={() => handleEliminar(m.id)}
                            title="Eliminar"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      <dialog className={`modal ${showModal ? 'modal-open' : ''}`}>
        <div className="modal-box bg-zinc-900 border border-zinc-800 text-white p-0 overflow-hidden max-w-md">
          <div className="p-4 bg-zinc-800 border-b border-zinc-700 flex justify-between items-center">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Calendar size={18} className="text-emerald-400" />
              {modalMode === 'create' ? 'Nueva Membresía' : 'Editar Membresía'}
            </h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Nombre del Socio</label>
              <input 
                type="text" 
                required 
                className="input input-bordered w-full bg-zinc-800 border-zinc-700"
                value={formData.cliente_nombre}
                onChange={e => setFormData({ ...formData, cliente_nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Tipo de Plan</label>
              <select 
                className="input input-bordered w-full bg-zinc-800 border-zinc-700"
                value={formData.plan_nombre}
                onChange={e => {
                  const diasMap = { 'Semanal': 7, 'Mensual': 30, 'Anual': 365, 'Estudiantil': 30, 'Invitado': 1 };
                  const d = diasMap[e.target.value] || 30;
                  const inicio = new Date(formData.fecha_inicio);
                  const fin = new Date(inicio.getTime() + d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  setFormData({ 
                    ...formData, 
                    plan_nombre: e.target.value,
                    duracion_dias: d,
                    fecha_vencimiento: fin
                  });
                }}
              >
                <option value="Semanal">Semanal (7 días)</option>
                <option value="Mensual">Mensual (30 días)</option>
                <option value="Anual">Anual (365 días)</option>
                <option value="Estudiantil">Estudiantil (30 días)</option>
                <option value="Invitado">Invitado (1 día)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Fecha Inicio</label>
                <input 
                  type="date" 
                  required 
                  className="input input-bordered w-full bg-zinc-800 border-zinc-700"
                  value={formData.fecha_inicio}
                  onChange={e => {
                    const d = formData.duracion_dias || 30;
                    const inicio = new Date(e.target.value);
                    const fin = new Date(inicio.getTime() + d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    setFormData({ ...formData, fecha_inicio: e.target.value, fecha_vencimiento: fin });
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Fecha Vencimiento</label>
                <input 
                  type="date" 
                  required 
                  className="input input-bordered w-full bg-zinc-800 border-zinc-700"
                  value={formData.fecha_vencimiento}
                  onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancelar</button>
              <button type="submit" className="btn btn-primary btn-sm bg-emerald-500 hover:bg-emerald-400 text-black border-none font-bold">
                Guardar Membresía
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
