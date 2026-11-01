import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Power, 
  X, 
  RefreshCw, 
  Calendar, 
  CreditCard,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import '../../CSS/Membresias.css';
import { getMembresias, createMembresias, updateMembresias, deleteMembresias } from '../../JS/membresia';
import { getPlanes } from '../../JS/plan';
import { getClientes } from '../../JS/cliente';
import Toast from '../Componentes/Toast';
// eslint-disable-next-line no-unused-vars
import ConfirmModal from '../Componentes/ConfirmModal';

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

export default function Membresias({ loggedUser, onIrAPuntoVenta }) {
  const [membresias, setMembresias] = useState([]);
  const [planesCatalogo, setPlanesCatalogo] = useState([]);
  const [clientesCatalogo, setClientesCatalogo] = useState([]);
  const [busquedaClienteModal, setBusquedaClienteModal] = useState('');
  const [clienteSeleccionadoModal, setClienteSeleccionadoModal] = useState(null);

  const [filtro, setFiltro] = useState('todas'); // 'todas' | 'activas' | 'por_vencer' | 'vencidas'
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  // Estado para el Modal de Renovación con Verificación de Pago / Envío a Caja
  const [renovacionTarget, setRenovacionTarget] = useState(null);
  const [metodoPagoPrevio, setMetodoPagoPrevio] = useState('Efectivo');
  const [referenciaPago, setReferenciaPago] = useState('');
  const [modoVerificacion, setModoVerificacion] = useState('caja'); // 'caja' | 'manual'
  
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

  const PRECIOS_DEFAULT = {
    'Semanal': 150,
    'Mensual': 350,
    'Anual': 2100,
    'Estudiantil': 200,
    'Invitado': 30
  };

  const obtenerPrecioPlan = (planNombre, planId) => {
    const encontrado = planesCatalogo.find(p => p.id === planId || (p.nombre && p.nombre.toLowerCase() === (planNombre || '').toLowerCase()));
    if (encontrado && encontrado.precio) return Number(encontrado.precio);
    return PRECIOS_DEFAULT[planNombre] || 350;
  };

  const cargarDatos = () => {
    // 1. Cargar Clientes registrados desde la BD / API
    getClientes().then(data => {
      const lista = Array.isArray(data) ? data : 
                    (data && Array.isArray(data.content)) ? data.content :
                    (data && Array.isArray(data.data)) ? data.data : null;
      if (Array.isArray(lista) && lista.length > 0) {
        setClientesCatalogo(lista);
      } else {
        const local = localStorage.getItem('gymton_clientes');
        if (local) {
          try { setClientesCatalogo(JSON.parse(local)); } catch {}
        }
      }
    }).catch(() => {});

    // 2. Cargar Planes desde la BD / API (filtrar planes válidos de membresía)
    getPlanes().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const planesMembresia = data.filter(p => p.duracion_dias !== null && p.duracion_dias !== undefined && p.duracion_dias !== '');
        setPlanesCatalogo(planesMembresia.length > 0 ? planesMembresia : data);
      }
    }).catch(() => {});

    // 3. Cargar Membresías
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

  // Abrir modal de confirmación y selección de flujo de renovación
  const abrirModalRenovacion = (m) => {
    const duracion = Number(m.duracion_dias) || 30;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencActual = m.fecha_vencimiento ? new Date(m.fecha_vencimiento) : hoy;
    vencActual.setHours(0, 0, 0, 0);

    const baseFecha = vencActual > hoy ? vencActual : hoy;
    const nuevaFecha = new Date(baseFecha.getTime() + duracion * 24 * 60 * 60 * 1000);
    const nuevaVencimiento = nuevaFecha.toISOString().split('T')[0];
    const precio = obtenerPrecioPlan(m.plan_nombre, m.id_plan);

    setRenovacionTarget({
      ...m,
      precio,
      duracion,
      nuevaVencimiento
    });
    setReferenciaPago('');
    setMetodoPagoPrevio('Efectivo');
    setModoVerificacion('caja');
  };

  // Flujo A: Enviar la renovación pendiente al Punto de Venta para que primero se pague en mostrador
  const handleMandarAPuntoVenta = () => {
    if (!renovacionTarget) return;

    const payload = {
      cliente_id: renovacionTarget.id_cliente,
      cliente_nombre: renovacionTarget.cliente_nombre || `Socio #${renovacionTarget.id_cliente}`,
      id_plan: renovacionTarget.id_plan,
      plan_nombre: renovacionTarget.plan_nombre || 'Membresía',
      precio: renovacionTarget.precio || 350,
      duracion_dias: renovacionTarget.duracion || 30,
      membresia_id: renovacionTarget.id
    };

    try {
      localStorage.setItem('gymton_renovacion_pendiente', JSON.stringify(payload));
    } catch (e) {
      console.error(e);
    }

    setRenovacionTarget(null);

    if (onIrAPuntoVenta) {
      onIrAPuntoVenta(payload);
    } else {
      mostrarAlerta('Renovación enviada al Punto de Venta. Diríjase al módulo de Caja para cobrar.', 'info');
    }
  };

  // Flujo B: Configuración para verificar que primero pagó (transferencia, comprobante previo, etc.) y renovar directamente
  const handleVerificarPagoPrevioYRenovar = async () => {
    if (!renovacionTarget) return;
    await handleRenovarMembresia(renovacionTarget);
    mostrarAlerta(`Pago previo verificado (${metodoPagoPrevio} - Ref: ${referenciaPago || 'Sin ref'}). Membresía renovada con éxito.`, 'success');
    setRenovacionTarget(null);
  };

  // Lógica de renovación de membresía y extensión de vigencia
  const handleRenovarMembresia = async (m) => {
    const duracion = Number(m.duracion_dias || m.duracion) || 30;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyStr = hoy.toISOString().split('T')[0];
    
    const vencActual = m.fecha_vencimiento ? new Date(m.fecha_vencimiento) : hoy;
    vencActual.setHours(0, 0, 0, 0);

    // Si ya venció o no tiene fecha, renovar a partir de hoy. Si sigue vigente, extender a partir de su vencimiento
    const baseFecha = vencActual > hoy ? vencActual : hoy;
    const nuevaFecha = new Date(baseFecha.getTime() + duracion * 24 * 60 * 60 * 1000);
    const nuevaVencimiento = nuevaFecha.toISOString().split('T')[0];

    const renovada = {
      ...m,
      fecha_inicio: hoyStr,
      fecha_vencimiento: nuevaVencimiento,
      estado: 'activa'
    };

    const nuevaLista = membresias.map(item => item.id === m.id ? renovada : item);
    setMembresias(nuevaLista);
    guardarLocalmente(nuevaLista);

    try {
      await updateMembresias(m.id, renovada);
    } catch (e) {
      console.warn('API de membresía no disponible, guardado en cache local:', e);
    }
  };

  // Modal de Confirmación personalizada para eliminar (sin alert/confirm de localhost)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });

  const handleToggleEstado = async (m) => {
    const nuevoEstado = (m.estado === 'activa' || m.estado === 'Activo' || m.estado === 1) ? 'inactiva' : 'activa';
    const act = { ...m, estado: nuevoEstado };
    const nuevaLista = membresias.map(item => item.id === m.id ? act : item);
    setMembresias(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateMembresias(m.id, act);
      mostrarAlerta(`Estado actualizado a: ${nuevoEstado}`, 'info');
      cargarDatos();
    } catch (e) { 
      console.error(e); 
      mostrarAlerta('Error al cambiar estado', 'error');
    }
  };

  // Solicitar confirmación con Modal en pantalla (reemplaza window.confirm)
  const pedirConfirmacionEliminar = (id, nombre) => {
    setConfirmModal({
      isOpen: true,
      id,
      nombre: nombre || 'esta membresía'
    });
  };

  // Ejecutar eliminación confirmada en BD vía API
  // eslint-disable-next-line no-unused-vars
  const confirmarEliminar = async () => {
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try { 
      await deleteMembresias(id); 
      const nuevaLista = membresias.filter(m => m.id !== id);
      setMembresias(nuevaLista);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Membresía eliminada correctamente', 'success');
      cargarDatos(); 
    } catch(e) { 
      console.error(e); 
      mostrarAlerta('Error al eliminar', 'error');
    }
  };

  const openModal = (mode, m = null) => {
    setModalMode(mode);
    setBusquedaClienteModal('');
    const hoyStr = new Date().toISOString().split('T')[0];

    // Obtener primer plan disponible de la base de datos
    const primerPlan = planesCatalogo.length > 0 ? planesCatalogo[0] : null;
    const pId = primerPlan ? primerPlan.id : 2;
    const pNom = primerPlan ? primerPlan.nombre : 'Mensual';
    const pDur = primerPlan ? (Number(primerPlan.duracion_dias) || 30) : 30;

    if (mode === 'edit' && m) {
      setFormData({ ...m });
      const cliEncontrado = clientesCatalogo.find(c => Number(c.id) === Number(m.id_cliente)) || {
        id: m.id_cliente,
        nombre: m.cliente_nombre || `Socio #${m.id_cliente}`
      };
      setClienteSeleccionadoModal(cliEncontrado);
    } else {
      setClienteSeleccionadoModal(null);
      setFormData({ 
        id_cliente: '', 
        cliente_nombre: '',
        id_plan: pId, 
        plan_nombre: pNom,
        duracion_dias: pDur,
        fecha_inicio: hoyStr, 
        fecha_vencimiento: new Date(Date.now() + pDur * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        estado: 'activa' 
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.id_cliente || !formData.cliente_nombre) {
      mostrarAlerta('Por favor busca y selecciona un socio registrado de la base de datos', 'error');
      return;
    }

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
      {alerta && <Toast alerta={alerta} onClose={() => setAlerta(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="text-emerald-400" />
            Control de Membresías
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Gestión y seguimiento de vigencias, renovaciones y estado de suscripciones de socios.
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

      {/* Tabs calculadas */}
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

      {/* Tabla de Membresías */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-fixed min-w-[880px]">
            <thead className="bg-zinc-800/60 text-xs uppercase text-gray-400 font-bold border-b border-zinc-800">
              <tr>
                <th className="p-4 w-[20%]">Socio (Cliente)</th>
                <th className="p-4 w-[13%]">Plan</th>
                <th className="p-4 w-[11%]">Fecha Inicio</th>
                <th className="p-4 w-[11%]">Vencimiento</th>
                <th className="p-4 w-[13%]">Días Restantes</th>
                <th className="p-4 w-[10%]">Estado</th>
                <th className="p-4 w-[22%] text-right">Opciones</th>
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
                      <td className="p-4 whitespace-nowrap">
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
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                          {/* Botón de Renovar membresía con verificación de pago previo o envío a caja */}
                          <button 
                            className="btn btn-xs bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 flex items-center gap-1 font-bold px-2.5 py-1 transition-all rounded-lg shadow-sm"
                            title="Renovar membresía (Verificar pago o cobrar en caja)"
                            onClick={() => abrirModalRenovacion(m)}
                          >
                            <RefreshCw size={12} /> Renovar
                          </button>
                          <button 
                            className={`btn btn-xs btn-ghost p-1.5 ${m.estado === 'activa' ? 'text-emerald-400 hover:text-red-400' : 'text-zinc-500 hover:text-emerald-400'}`}
                            onClick={() => handleToggleEstado(m)}
                            title={m.estado === 'activa' ? 'Desactivar' : 'Activar'}
                          >
                            <Power size={14}/>
                          </button>
                          <button 
                            className="btn btn-xs btn-ghost p-1.5 text-zinc-400 hover:text-white"
                            onClick={() => openModal('edit', m)}
                            title="Editar"
                          >
                            <Edit size={14}/>
                          </button>
                          <button 
                            className="btn btn-xs btn-ghost p-1.5 text-red-400 hover:bg-red-500/10"
                            onClick={() => pedirConfirmacionEliminar(m.id, m.cliente_nombre || `Socio #${m.id_cliente}`)}
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
            {/* Buscador de Socio en Tiempo Real de la BD */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                Socio / Cliente 
              </label>
              {clienteSeleccionadoModal ? (
                <div className="flex items-center justify-between p-3 bg-zinc-950 border border-emerald-500/50 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                      #{clienteSeleccionadoModal.id}
                    </div>
                    <div className="truncate">
                      <span className="text-white text-sm font-bold block truncate">
                        {clienteSeleccionadoModal.nombre}
                      </span>
                      <span className="text-zinc-400 text-xs font-mono">
                        {clienteSeleccionadoModal.telefono ? `Tel: ${clienteSeleccionadoModal.telefono}` : 'Sin teléfono'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setClienteSeleccionadoModal(null);
                      setBusquedaClienteModal('');
                      setFormData({ ...formData, id_cliente: '', cliente_nombre: '' });
                    }}
                    className="btn btn-xs btn-ghost text-zinc-400 hover:text-white shrink-0 ml-2"
                  >
                    Cambiar socio
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Escribe para buscar socio por nombre, tel o ID..."
                      className="input input-bordered w-full pl-9 pr-8 bg-zinc-800 border-zinc-700 text-white text-xs placeholder:text-zinc-500"
                      value={busquedaClienteModal}
                      onChange={e => setBusquedaClienteModal(e.target.value)}
                      autoFocus
                    />
                    {busquedaClienteModal && (
                      <button
                        type="button"
                        onClick={() => setBusquedaClienteModal('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Resultados del buscador de socios en tiempo real */}
                  {busquedaClienteModal.trim().length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-zinc-950 border border-zinc-700 rounded-xl shadow-2xl z-50 divide-y divide-zinc-800">
                      {clientesCatalogo
                        .filter(c => {
                          const term = busquedaClienteModal.toLowerCase().trim();
                          const nom = (c.nombre || '').toLowerCase();
                          const tel = (c.telefono || '').toLowerCase();
                          const id = String(c.id);
                          return nom.includes(term) || tel.includes(term) || id.includes(term);
                        })
                        .slice(0, 6)
                        .map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setClienteSeleccionadoModal(c);
                              setFormData({
                                ...formData,
                                id_cliente: c.id,
                                cliente_nombre: c.nombre
                              });
                              setBusquedaClienteModal('');
                            }}
                            className="w-full text-left p-2.5 hover:bg-emerald-500/15 flex items-center justify-between transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-white text-xs font-bold block truncate">{c.nombre}</span>
                              <span className="text-zinc-500 text-[11px] font-mono">{c.telefono || 'Sin teléfono'}</span>
                            </div>
                            <span className="badge badge-sm badge-outline text-emerald-400 border-emerald-500/40 font-mono text-[10px] shrink-0">
                              Socio #{c.id}
                            </span>
                          </button>
                        ))}
                      {clientesCatalogo.filter(c => {
                        const term = busquedaClienteModal.toLowerCase().trim();
                        const nom = (c.nombre || '').toLowerCase();
                        const tel = (c.telefono || '').toLowerCase();
                        const id = String(c.id);
                        return nom.includes(term) || tel.includes(term) || id.includes(term);
                      }).length === 0 && (
                        <div className="p-3 text-xs text-zinc-500 italic text-center">
                          No se encontraron socios con "{busquedaClienteModal}".
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Escoger Plan en base a los Planes de la BD */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                Tipo de Planes 
              </label>
              <select 
                className="input input-bordered w-full bg-zinc-800 border-zinc-700 text-white text-xs font-semibold"
                value={formData.id_plan}
                onChange={e => {
                  const planId = Number(e.target.value);
                  const pObj = planesCatalogo.find(p => Number(p.id) === planId);
                  if (pObj) {
                    const d = Number(pObj.duracion_dias) || 30;
                    const inicio = new Date(formData.fecha_inicio);
                    const fin = new Date(inicio.getTime() + d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    setFormData({ 
                      ...formData, 
                      id_plan: pObj.id,
                      plan_nombre: pObj.nombre,
                      duracion_dias: d,
                      fecha_vencimiento: fin
                    });
                  }
                }}
              >
                {planesCatalogo.length === 0 ? (
                  <option value="">Cargando planes...</option>
                ) : (
                  planesCatalogo.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — ${Number(p.precio).toFixed(2)} ({p.duracion_dias ? `${p.duracion_dias} días` : '30 días'})
                    </option>
                  ))
                )}
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

      {/* Modal de Advertencia y Confirmación al Centro de Pantalla */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar Membresía?"
        message={`¿Estás seguro de que deseas eliminar la membresía de "${confirmModal.nombre}" de la base de datos? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Membresía"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, nombre: '' })}
        tipo="danger"
      />

      {/* Modal Especial de Renovación de Membresía: Cobro en Caja o Verificación de Pago Previo */}
      {renovacionTarget && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[110] backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            {/* Cabecera del Modal */}
            <div className="p-5 bg-zinc-800/80 border-b border-zinc-700 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">
                    Renovación de Membresía
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Se requiere verificar el cobro previo antes de extender la vigencia.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setRenovacionTarget(null)} 
                className="text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Tarjeta de Resumen de la Membresía a Renovar */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold block">
                      Socio / Cliente:
                    </span>
                    <h4 className="text-base font-bold text-white">
                      {renovacionTarget.cliente_nombre || `Socio #${renovacionTarget.id_cliente}`}
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {renovacionTarget.plan_nombre || 'Plan Estándar'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Duración:</span>
                    <strong className="text-zinc-200">{renovacionTarget.duracion} días</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Costo Plan:</span>
                    <strong className="text-emerald-400 font-mono text-sm">${renovacionTarget.precio.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Nueva Vigencia:</span>
                    <strong className="text-white font-mono">{renovacionTarget.nuevaVencimiento}</strong>
                  </div>
                </div>
              </div>

              {/* Selector de Flujo: Cobro en Caja vs Verificación Previa */}
              <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setModoVerificacion('caja')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    modoVerificacion === 'caja'
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ShoppingCart size={15} />
                  <span>Cobrar en Punto de Venta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModoVerificacion('manual')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    modoVerificacion === 'manual'
                      ? 'bg-zinc-800 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 size={15} />
                  <span>Verificar Pago Previo</span>
                </button>
              </div>

              {/* Contenido según el modo seleccionado */}
              {modoVerificacion === 'caja' ? (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShoppingCart size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-white text-sm">Flujo Recomendado: Cobro en Mostrador</h5>
                      <p className="text-zinc-400 mt-1 leading-relaxed">
                        Al presionar el botón inferior, serás transferido automáticamente al <strong>Punto de Venta</strong> con este socio y su plan precargados en el carrito para expedir el ticket oficial y registrar el ingreso en caja.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs space-y-3">
                  <span className="font-bold text-zinc-300 block text-xs">
                    Comprobación de Pago Recibido Previamente:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 uppercase font-semibold mb-1">
                        Método de Pago:
                      </label>
                      <select 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-emerald-500"
                        value={metodoPagoPrevio}
                        onChange={e => setMetodoPagoPrevio(e.target.value)}
                      >
                        <option value="Efectivo">Efectivo Recibido</option>
                        <option value="Transferencia">Transferencia / SPEI</option>
                        <option value="Tarjeta">Tarjeta / Terminal</option>
                        <option value="Depósito">Depósito Bancario</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 uppercase font-semibold mb-1">
                        Folio o Referencia:
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ej. REF-8392 o N/A"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-xs outline-none focus:border-emerald-500 font-mono"
                        value={referenciaPago}
                        onChange={e => setReferenciaPago(e.target.value)}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-300/80 flex items-center gap-1.5 pt-1">
                    <AlertTriangle size={13} />
                    Solo confirmar si el importe total (${renovacionTarget.precio.toFixed(2)}) ya fue acreditado.
                  </p>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
                <button 
                  type="button" 
                  onClick={() => setRenovacionTarget(null)}
                  className="btn btn-sm btn-ghost text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>

                {modoVerificacion === 'caja' ? (
                  <button 
                    type="button"
                    onClick={handleMandarAPuntoVenta}
                    className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold border-none flex items-center gap-1.5 shadow-lg"
                  >
                    <span>Ir a Cobrar a Punto de Venta</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleVerificarPagoPrevioYRenovar}
                    className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold border-none flex items-center gap-1.5 shadow-lg"
                  >
                    <CheckCircle2 size={16} />
                    <span>Confirmar Pago y Renovar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
