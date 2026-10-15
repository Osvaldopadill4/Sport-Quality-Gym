import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X } from 'lucide-react';
import '../../CSS/Clientes.css';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../../JS/cliente';
import Toast from '../Componentes/Toast';

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

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    fecha_registro: '',
    estado: 1
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

  const cargarDatos = () => {
    getClientes().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setClientes(data);
        localStorage.setItem('gymton_clientes', JSON.stringify(data));
      } else {
        const local = localStorage.getItem('gymton_clientes');
        if (local) {
          try {
            setClientes(JSON.parse(local));
            return;
          } catch (e) {
            console.error(e);
          }
        }
        // Fallback por defecto si no hay conexión o tabla vacía
        const fallback = [
          {
            id: 1,
            nombre: 'Juan Pérez',
            telefono: '555-1234',
            contacto_emergencia: 'María Pérez',
            telefono_emergencia: '555-4321',
            fecha_registro: '2023-01-15',
            estado: 1
          },
          {
            id: 2,
            nombre: 'Carolina Gómez',
            telefono: '555-9876',
            contacto_emergencia: 'Carlos Gómez',
            telefono_emergencia: '555-6789',
            fecha_registro: '2023-03-20',
            estado: 1
          }
        ];
        setClientes(fallback);
        localStorage.setItem('gymton_clientes', JSON.stringify(fallback));
      }
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = clientes.length;
  const activos = clientes.filter(c => c.estado === 1 || c.estado === 'Activo').length;
  const inactivos = total - activos;

  const getRolName = (id_rol) => {
    if (id_rol === 1) return 'Administrador';
    if (id_rol === 2) return 'Recepcionista';
    return 'Usuario';
  };

  // ACCIÓN: Poner en activo
  const handlePonerEnActivo = async (c) => {
    try {
      const clienteActualizado = { ...c, estado: 1 };
      await updateCliente(c.id, clienteActualizado);
      const nuevaLista = clientes.map(item => item.id === c.id ? clienteActualizado : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Puesto en activo correctamente', 'success');
    } catch (error) {
      console.error('Error al poner en activo:', error);
      mostrarAlerta('Error al poner en activo al cliente', 'error');
    }
  };

  // ACCIÓN: Dar de baja (desactivar)
  const handleDarDeBaja = async (c) => {
    try {
      const clienteActualizado = { ...c, estado: 0 };
      await updateCliente(c.id, clienteActualizado);
      const nuevaLista = clientes.map(item => item.id === c.id ? clienteActualizado : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Dado de baja correctamente', 'info');
    } catch (error) {
      console.error('Error al dar de baja:', error);
      mostrarAlerta('Error al desactivar al cliente', 'error');
    }
  };

  // Alternador de estado rápido
  const handleToggleEstado = (c) => {
    const esActivo = c.estado === 1 || c.estado === 'Activo';
    if (esActivo) {
      handleDarDeBaja(c);
    } else {
      handlePonerEnActivo(c);
    }
  };

  // ACCIÓN: Eliminar
  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await deleteCliente(id);
        const nuevaLista = clientes.filter(c => c.id !== id);
        guardarLocalmente(nuevaLista);
        mostrarAlerta('Registro eliminado correctamente', 'success');
      } catch (error) {
        console.error('Error eliminando:', error);
        mostrarAlerta('Error al eliminar el cliente', 'error');
      }
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
        contacto_emergencia: cliente.contacto_emergencia || '',
        telefono_emergencia: cliente.telefono_emergencia || '',
        fecha_registro: cliente.fecha_registro || '',
        estado: (cliente.estado === 1 || cliente.estado === 'Activo') ? 1 : 0
      });
    } else {
      const hoy = new Date().toISOString().split('T')[0];
      setFormData({
        nombre: '',
        telefono: '',
        contacto_emergencia: '',
        telefono_emergencia: '',
        fecha_registro: hoy,
        estado: 1
      });
    }
    setShowModal(true);
  };

  // ACCIONES: Agregar (create) y Guardar (update)
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim()) {
      mostrarAlerta('Por favor ingresa el nombre del cliente', 'error');
      return;
    }

    try {
      if (modalMode === 'create') {
        // ACCIÓN: Agregar
        const res = await createCliente(formData);
        const nuevoCliente = (res && res.id) ? res : { ...formData, id: Date.now() };
        const nuevaLista = [nuevoCliente, ...clientes];
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Registro completado correctamente', 'success');
      } else {
        // ACCIÓN: Guardar cambios (Editar)
        await updateCliente(formData.id, formData);
        const nuevaLista = clientes.map(item => item.id === formData.id ? { ...item, ...formData } : item);
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
      }
    } catch (error) {
      console.error('Error guardando cliente:', error);
      mostrarAlerta('Ocurrió un error al procesar la solicitud', 'error');
    }
  };

  // FILTRO EN TIEMPO REAL: .filter() con useState de búsqueda y pestañas
  const clientesFiltrados = clientes.filter((c) => {
    // 1. Filtro por pestaña de estado
    const coincideEstado =
      filtro === 'todos' ? true :
      filtro === 'activos' ? (c.estado === 1 || c.estado === 'Activo') :
      (c.estado === 0 || c.estado === 'Inactivo');

    // 2. Filtro en tiempo real por búsqueda de texto
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return coincideEstado;

    const nombre = (c.nombre || '').toLowerCase();
    const telefono = (c.telefono || '').toLowerCase();
    const contactoEmergencia = (c.contacto_emergencia || '').toLowerCase();
    const telEmergencia = (c.telefono_emergencia || '').toLowerCase();
    const fechaRegistro = (c.fecha_registro || '').toLowerCase();

    const coincideBusqueda =
      nombre.includes(termino) ||
      telefono.includes(termino) ||
      contactoEmergencia.includes(termino) ||
      telEmergencia.includes(termino) ||
      fechaRegistro.includes(termino);

    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="clientes-wrapper">
      {/* Toast Alert flotante */}
      <Toast alerta={alerta} onClose={() => setAlerta(null)} />

      {/* Top Header */}
      <div className="clientes-header">
        <h1 className="clientes-title">Gestión de Clientes</h1>
        <div className="clientes-top-actions">
          {/* Buscador en tiempo real con useState y filter */}
          <div className="clientes-search-container">
            <div className="clientes-search-icon">
              <Search size={20} />
            </div>
            <input
              type="text"
              className="clientes-search-input"
              placeholder="Buscar clientes por nombre, teléfono..."
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
                {usuarioActivo ? getRolName(usuarioActivo.id_rol) : 'Administrador'}
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
        <button className="clientes-btn-nuevo" onClick={() => openModal('create')}>
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

      {/* Tabla de Clientes */}
      <div className="clientes-table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
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
                <td colSpan="7" className="table-empty-row">
                  {busqueda
                    ? `No se encontraron clientes con el término "${busqueda}"`
                    : 'No hay clientes registrados'}
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((c) => {
                const esActivo = c.estado === 1 || c.estado === 'Activo';
                return (
                  <tr key={c.id}>
                    <td className="clientes-td-user">
                      <span className="clientes-td-name">{c.nombre}</span>
                    </td>
                    <td className="clientes-td-text">{c.telefono || 'N/A'}</td>
                    <td className="clientes-td-text">{c.contacto_emergencia || 'N/A'}</td>
                    <td className="clientes-td-text">{c.telefono_emergencia || 'N/A'}</td>
                    <td className="clientes-td-text">{c.fecha_registro || 'N/A'}</td>
                    <td>
                      {esActivo ? (
                        <span className="clientes-badge activo">Activo</span>
                      ) : (
                        <span className="clientes-badge inactivo">Inactivo</span>
                      )}
                    </td>
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
                          onClick={() => handleEliminar(c.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">{modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.telefono || ''} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto de Emergencia</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.contacto_emergencia || ''} onChange={e => setFormData({...formData, contacto_emergencia: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Emergencia</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.telefono_emergencia || ''} onChange={e => setFormData({...formData, telefono_emergencia: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                <input type="date" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.fecha_registro || ''} onChange={e => setFormData({...formData, fecha_registro: e.target.value})} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-white border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 text-white bg-[#10b981] rounded-lg hover:bg-[#059669]">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
