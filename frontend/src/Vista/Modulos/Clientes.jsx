import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X, Eye, EyeOff, QrCode, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';
import '../../CSS/Clientes.css';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../../JS/cliente';
import Toast from '../Componentes/Toast';
import ConfirmModal from '../Componentes/ConfirmModal';

// Helper robusto para evaluar el estado activo de clientes (soporta "1", 1, "Activo", true, etc.)
export const esEstadoActivo = (estado) => {
  if (estado === undefined || estado === null) return false;
  const s = String(estado).trim().toLowerCase();
  return s === '1' || s === 'activo' || s === 'true' || estado === 1 || estado === true;
};

// Generador de Token QR / UUID seguro para acceso y móvil
const generarUUID = () => {
  const aleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GYM-QR-${Date.now().toString().slice(-4)}-${aleatorio}`;
};

export default function Clientes({ loggedUser }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  
  // useState para el buscador en tiempo real
  const [busqueda, setBusqueda] = useState('');

  // useState para notificaciones / alertas
  const [alerta, setAlerta] = useState(null);

  // Estados para mostrar/ocultar contraseñas en la tabla
  const [mostrarPasswords, setMostrarPasswords] = useState({});
  const [copiadoToken, setCopiadoToken] = useState(null);

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    contrasena: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    fecha_registro: '',
    estado: 1,
    token_qr: ''
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (nuevosClientes) => {
    setClientes(nuevosClientes);
    try {
      localStorage.setItem('gymton_clientes', JSON.stringify(nuevosClientes));
    } catch (e) {
      console.error('Error guardando clientes en localStorage:', e);
    }
  };

  const [cargandoBD, setCargandoBD] = useState(false);

  const cargarDatos = async (forzarToast = false) => {
    setCargandoBD(true);
    try {
      const data = await getClientes();
      const lista = Array.isArray(data) ? data : 
                    (data && Array.isArray(data.content)) ? data.content :
                    (data && Array.isArray(data.data)) ? data.data : null;
      
      if (Array.isArray(lista)) {
        setClientes(lista);
        localStorage.setItem('gymton_clientes', JSON.stringify(lista));
        setCargandoBD(false);
        if (forzarToast) {
          mostrarAlerta(`Sincronizado con MySQL: ${lista.length} cliente(s) cargado(s)`, 'success');
        }
        return;
      }
    } catch (err) {
      console.warn('Error al cargar clientes de la API:', err);
    }
    setCargandoBD(false);

    // Try localStorage cache
    const local = localStorage.getItem('gymton_clientes');
    if (local) {
      try {
        const cached = JSON.parse(local);
        if (Array.isArray(cached) && cached.length > 0) {
          // Filtrar el mock Juan Pérez si viene de fallback antiguo
          const sinMock = cached.filter(c => c.nombre !== 'Juan Pérez' && c.nombre !== 'Carolina Gómez');
          if (sinMock.length > 0) {
            setClientes(sinMock);
            return;
          }
          setClientes(cached);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Fallback vacio o mínimo
    setClientes([]);
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Métricas con el helper
  const total = clientes.length;
  const activos = clientes.filter(c => esEstadoActivo(c.estado)).length;
  const inactivos = total - activos;

  const togglePasswordVisible = (id) => {
    setMostrarPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copiarAlPortapapeles = (texto, id) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoToken(id);
      setTimeout(() => setCopiadoToken(null), 2000);
      mostrarAlerta('Token QR copiado al portapapeles', 'info');
    });
  };

  // Modal de Confirmación personalizada para eliminar (sin alert/confirm de localhost)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });

  // ACCIÓN: Poner en activo (actualiza en BD vía API y en la vista al instante)
  const handlePonerEnActivo = async (c) => {
    const nuevaLista = clientes.map(item => item.id === c.id ? { ...item, estado: "1" } : item);
    setClientes(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      const clienteActualizado = { 
        ...c, 
        contrasena: c.contrasena || 12345,
        estado: "1" 
      };
      await updateCliente(c.id, clienteActualizado);
      mostrarAlerta(`Cliente "${c.nombre}" activado correctamente`, 'success');
    } catch (error) {
      console.error('Error al poner en activo:', error);
      mostrarAlerta('Puesto en activo localmente', 'warning');
    }
  };

  // ACCIÓN: Dar de baja (actualiza en BD vía API y en la vista al instante)
  const handleDarDeBaja = async (c) => {
    const nuevaLista = clientes.map(item => item.id === c.id ? { ...item, estado: "0" } : item);
    setClientes(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      const clienteActualizado = { 
        ...c, 
        contrasena: c.contrasena || 12345,
        estado: "0" 
      };
      await updateCliente(c.id, clienteActualizado);
      mostrarAlerta(`Cliente "${c.nombre}" dado de baja correctamente`, 'info');
    } catch (error) {
      console.error('Error al dar de baja:', error);
      mostrarAlerta('Dado de baja localmente', 'warning');
    }
  };

  // Alternador de estado rápido
  const handleToggleEstado = (c) => {
    const esActivo = esEstadoActivo(c.estado);
    if (esActivo) {
      handleDarDeBaja(c);
    } else {
      handlePonerEnActivo(c);
    }
  };

  // Solicitar confirmación con Modal en pantalla (reemplaza window.confirm)
  const pedirConfirmacionEliminar = (id, nombre) => {
    setConfirmModal({
      isOpen: true,
      id,
      nombre: nombre || 'este cliente'
    });
  };

  // Ejecutar eliminación confirmada en BD vía API
  const confirmarEliminar = async () => {
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try {
      await deleteCliente(id);
      mostrarAlerta('Registro eliminado correctamente', 'success');
      await cargarDatos();
    } catch (error) {
      console.error('Error eliminando:', error);
      const nuevaLista = clientes.filter(c => c.id !== id);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Registro eliminado localmente', 'info');
    }
  };

  // Abrir Modal para Agregar o Editar
  const openModal = (mode, cliente = null) => {
    setModalMode(mode);
    if (mode === 'edit' && cliente) {
      setFormData({
        id: cliente.id,
        nombre: cliente.nombre || '',
        telefono: cliente.telefono || '',
        contrasena: cliente.contrasena || '',
        contacto_emergencia: cliente.contacto_emergencia || '',
        telefono_emergencia: cliente.telefono_emergencia || '',
        fecha_registro: cliente.fecha_registro || '',
        estado: esEstadoActivo(cliente.estado) ? 1 : 0,
        token_qr: cliente.token_qr || generarUUID()
      });
    } else {
      const hoy = new Date().toISOString().split('T')[0];
      setFormData({
        nombre: '',
        telefono: '',
        contrasena: '',
        contacto_emergencia: '',
        telefono_emergencia: '',
        fecha_registro: hoy,
        estado: 1,
        token_qr: generarUUID()
      });
    }
    setShowModal(true);
  };

  // ACCIONES: Agregar (create) y Guardar (update) mandando los datos a la BD vía API
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim()) {
      mostrarAlerta('Por favor ingresa el nombre del cliente', 'error');
      return;
    }
    if (formData.nombre.trim().length > 20) {
      mostrarAlerta('El nombre no puede exceder 20 caracteres', 'error');
      return;
    }
    if (!formData.telefono || formData.telefono.trim().length === 0) {
      mostrarAlerta('Por favor ingresa el teléfono del cliente', 'error');
      return;
    }
    if (formData.telefono.length > 11) {
      mostrarAlerta('El teléfono solo permite un máximo de 11 caracteres numéricos', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        estado: esEstadoActivo(formData.estado) ? "1" : "0",
        token_qr: formData.token_qr ? formData.token_qr.trim() : generarUUID()
      };

      if (modalMode === 'create') {
        // Enviar a la BD vía API
        await createCliente(payload);
        setShowModal(false);
        mostrarAlerta('Registro completado correctamente', 'success');
        await cargarDatos();
      } else {
        // Actualizar en la BD vía API
        await updateCliente(formData.id, payload);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error guardando cliente en BD:', error);
      mostrarAlerta('Ocurrió un error al procesar la solicitud en el servidor', 'error');
      // Fallback local
      if (modalMode === 'create') {
        const nuevo = { ...formData, id: Date.now(), estado: esEstadoActivo(formData.estado) ? "1" : "0" };
        guardarLocalmente([nuevo, ...clientes]);
      } else {
        const lista = clientes.map(item => item.id === formData.id ? { ...item, ...formData, estado: esEstadoActivo(formData.estado) ? "1" : "0" } : item);
        guardarLocalmente(lista);
      }
      setShowModal(false);
    }
  };

  // FILTRO EN TIEMPO REAL: .filter() con useState de búsqueda y pestañas
  const clientesFiltrados = clientes.filter((c) => {
    // 1. Filtro por pestaña de estado
    const coincideEstado =
      filtro === 'todos' ? true :
      filtro === 'activos' ? esEstadoActivo(c.estado) :
      !esEstadoActivo(c.estado);

    // 2. Filtro en tiempo real por búsqueda de texto (busca también por token_qr y teléfono)
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return coincideEstado;

    const nombre = (c.nombre || '').toLowerCase();
    const telefono = (c.telefono || '').toLowerCase();
    const contactoEmergencia = (c.contacto_emergencia || '').toLowerCase();
    const telEmergencia = (c.telefono_emergencia || '').toLowerCase();
    const fechaRegistro = (c.fecha_registro || '').toLowerCase();
    const tokenQr = (c.token_qr || '').toLowerCase();

    const coincideBusqueda =
      nombre.includes(termino) ||
      telefono.includes(termino) ||
      contactoEmergencia.includes(termino) ||
      telEmergencia.includes(termino) ||
      fechaRegistro.includes(termino) ||
      tokenQr.includes(termino);

    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="clientes-wrapper">
      {/* Toast Alert flotante */}
      <Toast alerta={alerta} onClose={() => setAlerta(null)} />

      {/* Top Header */}
      <div className="clientes-header">
        <div>
          <h1 className="clientes-title">Gestión de Clientes / Socios</h1>
          <p className="text-xs text-gray-400 mt-1">
            Incluye credenciales de acceso para App Móvil y Token QR para torniquetes.
          </p>
        </div>
        <div className="clientes-top-actions">
          {/* Buscador en tiempo real con useState y filter */}
          <div className="clientes-search-container">
            <div className="clientes-search-icon">
              <Search size={20} />
            </div>
            <input
              type="text"
              className="clientes-search-input"
              placeholder="Buscar por nombre, teléfono, token QR..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                type="button"
                className="clientes-search-clear"
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="clientes-terminal-badge">
            <span className="clientes-terminal-dot"></span> Terminal Activo
          </div>
          <div className="clientes-profile">
            <div className="clientes-profile-info">
              <div className="clientes-profile-name">
                {usuarioActivo ? `${usuarioActivo.nombre} ${usuarioActivo.apellido || ''}`.trim() : 'Usuario Activo'}
              </div>
              <div className="clientes-profile-role">
                Recepción Gymton
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y Botón de Agregar Nuevo */}
      <div className="clientes-filters-bar">
        <div className="clientes-filters">
          <button
            className={`clientes-filter-btn ${filtro === 'todos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({total})
          </button>
          <button
            className={`clientes-filter-btn ${filtro === 'activos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('activos')}
          >
            Activos ({activos})
          </button>
          <button
            className={`clientes-filter-btn ${filtro === 'inactivos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('inactivos')}
          >
            Inactivos ({inactivos})
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            className="btn btn-sm btn-ghost text-emerald-400 border border-zinc-700 hover:bg-zinc-800 flex items-center gap-1.5"
            onClick={() => cargarDatos(true)}
            title="Sincronizar directamente con MySQL"
          >
            <RefreshCw size={14} className={cargandoBD ? 'animate-spin' : ''} />
            <span>Sincronizar BD</span>
          </button>
          <button className="clientes-btn-nuevo" onClick={() => openModal('create')}>
            <Plus size={16} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Tabla de Clientes con TODOS los atributos de la BD */}
      <div className="clientes-table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Contraseña (Móvil)</th>
              <th>Token QR / UUID</th>
              <th>Contacto Emergencia</th>
              <th>Tel. Emergencia</th>
              <th>Fecha Registro</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" className="table-empty-row">
                  {busqueda
                    ? `No se encontraron clientes con el término "${busqueda}"`
                    : 'No hay clientes registrados'}
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((c) => {
                const esActivo = esEstadoActivo(c.estado);
                const passwordVisible = mostrarPasswords[c.id];
                return (
                  <tr key={c.id}>
                    {/* Cliente */}
                    <td className="clientes-td-user">
                      <span className="clientes-td-name">{c.nombre}</span>
                      <span className="text-xs text-gray-400 block font-mono">ID #{c.id}</span>
                    </td>

                    {/* Teléfono */}
                    <td className="clientes-td-text">{c.telefono || 'N/A'}</td>

                    {/* Contraseña para App Móvil */}
                    <td className="clientes-td-text">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs px-2 py-1 bg-zinc-800 text-zinc-200 rounded border border-zinc-700">
                          {passwordVisible ? (c.contrasena || 'Sin asignar') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisible(c.id)}
                          className="text-gray-400 hover:text-emerald-400 p-1 transition-colors"
                          title={passwordVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                          {passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>

                    {/* Token QR / UUID */}
                    <td className="clientes-td-text">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/30 flex items-center gap-1">
                          <QrCode size={13} />
                          <span>{c.token_qr ? (c.token_qr.length > 15 ? c.token_qr.slice(0, 15) + '...' : c.token_qr) : 'Sin Token'}</span>
                        </span>
                        {c.token_qr && (
                          <button
                            type="button"
                            onClick={() => copiarAlPortapapeles(c.token_qr, c.id)}
                            className="text-gray-400 hover:text-emerald-400 p-1 transition-colors"
                            title="Copiar Token QR"
                          >
                            {copiadoToken === c.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Contacto Emergencia */}
                    <td className="clientes-td-text">{c.contacto_emergencia || 'N/A'}</td>

                    {/* Teléfono Emergencia */}
                    <td className="clientes-td-text">{c.telefono_emergencia || 'N/A'}</td>

                    {/* Fecha Registro */}
                    <td className="clientes-td-text">{c.fecha_registro || 'N/A'}</td>

                    {/* Estado con Badge */}
                    <td>
                      {esActivo ? (
                        <span className="clientes-badge activo">Activo</span>
                      ) : (
                        <span className="clientes-badge inactivo">Inactivo</span>
                      )}
                    </td>

                    {/* Opciones */}
                    <td>
                      <div className="clientes-table-actions">
                        {/* Opción Guardar / Editar */}
                        <button
                          className="clientes-action-btn edit"
                          title="Editar datos del cliente"
                          onClick={() => openModal('edit', c)}
                        >
                          <Edit size={16} />
                        </button>

                        {/* Opción Poner en activo / Dar de baja */}
                        <button
                          className={`clientes-action-btn ${esActivo ? 'power-off' : 'power-on'}`}
                          title={esActivo ? 'Dar de baja' : 'Poner en activo'}
                          onClick={() => handleToggleEstado(c)}
                        >
                          <Power size={16} />
                        </button>

                        {/* Opción Eliminar */}
                        <button
                          className="clientes-action-btn delete"
                          title="Eliminar cliente"
                          onClick={() => pedirConfirmacionEliminar(c.id, c.nombre)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Paginación / Resumen */}
        <div className="clientes-pagination">
          <span className="clientes-pagination-text">
            Mostrando {clientesFiltrados.length} de {total} clientes
            {busqueda && ` (filtrado por "${busqueda}")`}
          </span>
          <div className="clientes-pagination-buttons">
            <button className="clientes-page-btn prev">Anterior</button>
            <button className="clientes-page-btn next">Siguiente</button>
          </div>
        </div>
      </div>

      {/* Modal para Agregar y Guardar (Editar) Clientes */}
      <dialog className={`modal ${showModal ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-lg flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-200">
            <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
              <QrCode size={20} className="text-emerald-400" />
              {modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
            </h3>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-4 overflow-y-auto">
              
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Nombre Completo * (Máx. 20 caracteres)
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  className="input input-bordered w-full"
                  placeholder="Ej. Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value.slice(0, 20) })}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Teléfono * (Solo números, máx. 11 dígitos)
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  className="input input-bordered w-full font-mono"
                  placeholder="Ej. 3471012962"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                />
              </div>

              {/* Contraseña para App Móvil */}
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Contraseña para App Móvil *
                </label>
                <input
                  type="text"
                  required
                  className="input input-bordered w-full font-mono"
                  placeholder="Contraseña que usará en la App"
                  value={formData.contrasena || ''}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                />
                <span className="text-xs text-gray-400 mt-1 block">
                  El cliente usará su teléfono y esta contraseña para iniciar sesión en la aplicación móvil.
                </span>
              </div>

              {/* Token QR / UUID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-base-content">
                    Token QR / UUID (Torniquete y App)
                  </label>
                  <button
                    type="button"
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    onClick={() => setFormData({ ...formData, token_qr: generarUUID() })}
                  >
                    <Sparkles size={13} /> Generar Nuevo
                  </button>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full font-mono text-xs"
                  placeholder="GYM-QR-XXXX-XXXX"
                  value={formData.token_qr || ''}
                  onChange={(e) => setFormData({ ...formData, token_qr: e.target.value })}
                />
              </div>

              {/* Contacto de Emergencia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1">
                    Contacto de Emergencia (Máx. 20 car.)
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    className="input input-bordered w-full"
                    placeholder="Ej. María Pérez"
                    value={formData.contacto_emergencia || ''}
                    onChange={(e) => setFormData({ ...formData, contacto_emergencia: e.target.value.slice(0, 20) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1">
                    Teléfono Emergencia (Máx. 11 núm.)
                  </label>
                  <input
                    type="tel"
                    maxLength={11}
                    className="input input-bordered w-full font-mono"
                    placeholder="Ej. 3471012962"
                    value={formData.telefono_emergencia || ''}
                    onChange={(e) => setFormData({ ...formData, telefono_emergencia: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                  />
                </div>
              </div>

              {/* Fecha de Registro y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1">
                    Fecha de Registro
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={formData.fecha_registro || ''}
                    onChange={(e) => setFormData({ ...formData, fecha_registro: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1">
                    Estado
                  </label>
                  <select
                    className="input input-bordered w-full"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: Number(e.target.value) })}
                  >
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-base-200 flex justify-end gap-3 bg-base-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn btn-ghost"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {modalMode === 'create' ? 'Agregar Cliente' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Modal de Advertencia y Confirmación al Centro de Pantalla */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar Cliente?"
        message={`¿Estás seguro de que deseas eliminar permanentemente a "${confirmModal.nombre}" de la base de datos? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Cliente"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, nombre: '' })}
        tipo="danger"
      />
    </div>
  );
}
