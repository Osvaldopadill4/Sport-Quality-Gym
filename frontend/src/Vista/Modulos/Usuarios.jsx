import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X } from 'lucide-react';
import '../../CSS/Usuarios.css';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../../JS/usuarios';
import Toast from '../Componentes/Toast';

export default function Usuarios({ loggedUser }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  
  // useState para el buscador en tiempo real
  const [busqueda, setBusqueda] = useState('');

  // useState para notificaciones / alertas
  const [alerta, setAlerta] = useState(null);

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({
    id_rol: 2,
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    contrasena: '',
    estado: 1
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (nuevosUsuarios) => {
    setUsuarios(nuevosUsuarios);
    try {
      localStorage.setItem('gymton_usuarios', JSON.stringify(nuevosUsuarios));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  };

  const cargarDatos = () => {
    getUsuarios().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setUsuarios(data);
        localStorage.setItem('gymton_usuarios', JSON.stringify(data));
      } else {
        const local = localStorage.getItem('gymton_usuarios');
        if (local) {
          try {
            setUsuarios(JSON.parse(local));
            return;
          } catch (e) {
            console.error(e);
          }
        }
        // Fallback por defecto si no hay conexión
        const fallback = [
          { id: 1, id_rol: 1, nombre: 'Sofía', apellido: 'Martínez', telefono: '+56 9 8765 4321', correo: 'sofia.mtz@gmail.com', estado: 1 },
          { id: 2, id_rol: 2, nombre: 'Alejandro', apellido: 'Silva', telefono: '+56 9 1234 5678', correo: 'ale.silva@outlook.com', estado: 1 }
        ];
        setUsuarios(fallback);
        localStorage.setItem('gymton_usuarios', JSON.stringify(fallback));
      }
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = usuarios.length;
  const activos = usuarios.filter(u => u.estado === 1 || u.estado === 'Activo').length;
  const inactivos = total - activos;

  const getRolName = (id_rol) => {
    if (id_rol === 1) return 'Administrador';
    if (id_rol === 2) return 'Recepcionista';
    return 'Usuario';
  };

  // ACCIÓN: Poner en activo
  const handlePonerEnActivo = async (u) => {
    try {
      const usuarioActualizado = { ...u, estado: 1 };
      await updateUsuario(u.id, usuarioActualizado);
      const nuevaLista = usuarios.map(item => item.id === u.id ? usuarioActualizado : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Puesto en activo correctamente', 'success');
    } catch (error) {
      console.error('Error al poner en activo:', error);
      mostrarAlerta('Error al poner en activo al usuario', 'error');
    }
  };

  // ACCIÓN: Dar de baja (desactivar)
  const handleDarDeBaja = async (u) => {
    try {
      const usuarioActualizado = { ...u, estado: 0 };
      await updateUsuario(u.id, usuarioActualizado);
      const nuevaLista = usuarios.map(item => item.id === u.id ? usuarioActualizado : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Dado de baja correctamente', 'info');
    } catch (error) {
      console.error('Error al dar de baja:', error);
      mostrarAlerta('Error al desactivar al usuario', 'error');
    }
  };

  // Alternador de estado rápido
  const handleToggleEstado = (u) => {
    const esActivo = u.estado === 1 || u.estado === 'Activo';
    if (esActivo) {
      handleDarDeBaja(u);
    } else {
      handlePonerEnActivo(u);
    }
  };

  // ACCIÓN: Eliminar
  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteUsuario(id);
        const nuevaLista = usuarios.filter(u => u.id !== id);
        guardarLocalmente(nuevaLista);
        mostrarAlerta('Registro eliminado correctamente', 'success');
      } catch (error) {
        console.error('Error eliminando:', error);
        mostrarAlerta('Error al eliminar el usuario', 'error');
      }
    }
  };

  // Abrir Modal para Agregar o Editar
  const openModal = (mode, usuario = null) => {
    setModalMode(mode);
    if (mode === 'edit' && usuario) {
      setFormData({
        id: usuario.id,
        id_rol: usuario.id_rol || 2,
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        telefono: usuario.telefono || '',
        correo: usuario.correo || '',
        contrasena: usuario.contrasena || '',
        estado: (usuario.estado === 1 || usuario.estado === 'Activo') ? 1 : 0
      });
    } else {
      setFormData({
        id_rol: 2,
        nombre: '',
        apellido: '',
        telefono: '',
        correo: '',
        contrasena: '',
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
      mostrarAlerta('Por favor ingresa el nombre', 'error');
      return;
    }
    if (!formData.correo.trim()) {
      mostrarAlerta('Por favor ingresa el correo', 'error');
      return;
    }

    try {
      if (modalMode === 'create') {
        // ACCIÓN: Agregar
        const res = await createUsuario(formData);
        const nuevoUsuario = (res && res.id) ? res : { ...formData, id: Date.now() };
        const nuevaLista = [nuevoUsuario, ...usuarios];
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Registro completado correctamente', 'success');
      } else {
        // ACCIÓN: Guardar cambios (Editar)
        await updateUsuario(formData.id, formData);
        const nuevaLista = usuarios.map(u => u.id === formData.id ? { ...u, ...formData } : u);
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      mostrarAlerta('Ocurrió un error al procesar la solicitud', 'error');
    }
  };

  // FILTRO EN TIEMPO REAL: .filter() con useState de búsqueda y pestañas
  const usuariosFiltrados = usuarios.filter((u) => {
    // 1. Filtro por pestaña de estado
    const coincideEstado =
      filtro === 'todos' ? true :
      filtro === 'activos' ? (u.estado === 1 || u.estado === 'Activo') :
      (u.estado === 0 || u.estado === 'Inactivo');

    // 2. Filtro en tiempo real por búsqueda de texto
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return coincideEstado;

    const nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
    const correo = (u.correo || '').toLowerCase();
    const telefono = (u.telefono || '').toLowerCase();
    const rol = getRolName(u.id_rol).toLowerCase();

    const coincideBusqueda =
      nombreCompleto.includes(termino) ||
      correo.includes(termino) ||
      telefono.includes(termino) ||
      rol.includes(termino);

    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="usuarios-wrapper">
      {/* Toast Alert flotante */}
      <Toast alerta={alerta} onClose={() => setAlerta(null)} />

      {/* Top Header */}
      <div className="usuarios-header">
        <h1 className="usuarios-title">Gestión de Usuarios</h1>
        <div className="usuarios-top-actions">
          {/* Buscador en tiempo real con useState y filter */}
          <div className="usuarios-search-container">
            <div className="usuarios-search-icon">
              <Search size={20} />
            </div>
            <input
              type="text"
              className="usuarios-search-input"
              placeholder="Buscar usuarios por nombre, correo, rol..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                type="button"
                className="usuarios-search-clear"
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="usuarios-terminal-badge">
            <span className="usuarios-terminal-dot"></span> Terminal Activo
          </div>
          <div className="usuarios-profile">
            <div className="usuarios-profile-info">
              <div className="usuarios-profile-name">
                {usuarioActivo ? `${usuarioActivo.nombre} ${usuarioActivo.apellido || ''}`.trim() : 'Usuario Activo'}
              </div>
              <div className="usuarios-profile-role">
                {usuarioActivo ? getRolName(usuarioActivo.id_rol) : 'Administrador'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y Botón de Agregar Nuevo */}
      <div className="usuarios-filters-bar">
        <div className="usuarios-filters">
          <button
            className={`usuarios-filter-btn ${filtro === 'todos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({total})
          </button>
          <button
            className={`usuarios-filter-btn ${filtro === 'activos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('activos')}
          >
            Activos ({activos})
          </button>
          <button
            className={`usuarios-filter-btn ${filtro === 'inactivos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('inactivos')}
          >
            Inactivos ({inactivos})
          </button>
        </div>
        <button className="usuarios-btn-nuevo" onClick={() => openModal('create')}>
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="usuarios-table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty-row">
                  {busqueda
                    ? `No se encontraron usuarios con el término "${busqueda}"`
                    : 'No hay usuarios registrados'}
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u) => {
                const esActivo = u.estado === 1 || u.estado === 'Activo';
                return (
                  <tr key={u.id}>
                    <td className="usuarios-td-user">
                      <span className="usuarios-td-name">
                        {u.nombre} {u.apellido}
                      </span>
                    </td>
                    <td className="usuarios-td-text">{u.correo}</td>
                    <td className="usuarios-td-text">{u.telefono || 'N/A'}</td>
                    <td className="usuarios-td-text">{getRolName(u.id_rol)}</td>
                    <td>
                      {esActivo ? (
                        <span className="usuarios-badge activo">Activo</span>
                      ) : (
                        <span className="usuarios-badge inactivo">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <div className="usuarios-table-actions">
                        {/* Opción Guardar / Editar */}
                        <button
                          className="usuarios-action-btn edit"
                          title="Editar datos del usuario"
                          onClick={() => openModal('edit', u)}
                        >
                          <Edit size={16} />
                        </button>

                        {/* Opción Poner en activo / Dar de baja */}
                        <button
                          className={`usuarios-action-btn ${esActivo ? 'power-off' : 'power-on'}`}
                          title={esActivo ? 'Dar de baja' : 'Poner en activo'}
                          onClick={() => handleToggleEstado(u)}
                        >
                          <Power size={16} />
                        </button>

                        {/* Opción Eliminar */}
                        <button
                          className="usuarios-action-btn delete"
                          title="Eliminar usuario"
                          onClick={() => handleEliminar(u.id)}
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
        <div className="usuarios-pagination">
          <span className="usuarios-pagination-text">
            Mostrando {usuariosFiltrados.length} de {total} usuarios
            {busqueda && ` (filtrado por "${busqueda}")`}
          </span>
          <div className="usuarios-pagination-buttons">
            <button className="usuarios-page-btn prev">Anterior</button>
            <button className="usuarios-page-btn next">Siguiente</button>
          </div>
        </div>
      </div>

      {/* MODAL (DaisyUI style logic but using custom fixed overlay) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.apellido || ''} onChange={e => setFormData({...formData, apellido: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                <input type="email" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.correo || ''} onChange={e => setFormData({...formData, correo: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.telefono || ''} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              </div>

              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input type="password" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                    value={formData.contrasena || ''} onChange={e => setFormData({...formData, contrasena: e.target.value})} />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.id_rol} onChange={e => setFormData({...formData, id_rol: Number(e.target.value)})}>
                  <option value={1}>Administrador</option>
                  <option value={2}>Recepcionista</option>
                </select>
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
