import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X } from 'lucide-react';
import '../../CSS/Usuarios.css';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../../JS/usuarios';

export default function Usuarios({ loggedUser }) {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ id_rol: 2, nombre: '', apellido: '', telefono: '', correo: '', contrasena: '', estado: 1 });

  const cargarDatos = () => {
    getUsuarios().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setUsuarios(data);
      } else {
        // Fallback
        setUsuarios([
          { id: 1, id_rol: 1, nombre: 'Sofía', apellido: 'Martínez', telefono: '+56 9 8765 4321', correo: 'sofia.mtz@gmail.com', estado: 1 },
          { id: 2, id_rol: 2, nombre: 'Alejandro', apellido: 'Silva', telefono: '+56 9 1234 5678', correo: 'ale.silva@outlook.com', estado: 1 }
        ]);
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

  const handleDarDeBaja = async (u) => {
    const nuevoEstado = (u.estado === 1 || u.estado === 'Activo') ? 0 : 1;
    try {
      await updateUsuario(u.id, { ...u, estado: nuevoEstado });
      cargarDatos();
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  const handleEliminar = async (id) => {
    if(window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await deleteUsuario(id);
        cargarDatos();
      } catch(error) {
        console.error("Error eliminando:", error);
      }
    }
  };

  const openModal = (mode, usuario = null) => {
    setModalMode(mode);
    if (mode === 'edit' && usuario) {
      setFormData(usuario);
    } else {
      setFormData({ id_rol: 2, nombre: '', apellido: '', telefono: '', correo: '', contrasena: '', estado: 1 });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalMode === 'create') {
        await createUsuario(formData);
      } else {
        await updateUsuario(formData.id, formData);
      }
      setShowModal(false);
      cargarDatos();
    } catch(error) {
      console.error("Error guardando:", error);
    }
  };

  return (
    <div className="usuarios-wrapper">
      {/* Top Header */}
      <div className="usuarios-header">
        <h1 className="usuarios-title">Gestión de Usuarios</h1>
        <div className="usuarios-top-actions">
          <div className="usuarios-search-container">
            <div className="usuarios-search-icon">
              <Search size={20} />
            </div>
            <input type="text" className="usuarios-search-input" placeholder="Buscar usuarios, roles..." />
          </div>
          <div className="usuarios-terminal-badge">
            <span className="usuarios-terminal-dot"></span> Terminal Activo
          </div>
          <div className="usuarios-profile">
            <div className="usuarios-profile-info">
              <div className="usuarios-profile-name">
                {loggedUser ? `${loggedUser.nombre} ${loggedUser.apellido}` : 'Cargando...'}
              </div>
              <div className="usuarios-profile-role">
                {loggedUser ? getRolName(loggedUser.id_rol) : '...'}
              </div>
            </div>
            <div className="usuarios-profile-avatar">
              <img src={`https://i.pravatar.cc/150?u=${loggedUser?.id || 11}`} alt="admin" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Create Button */}
      <div className="usuarios-filters-bar">
        <div className="usuarios-filters">
          <button className={`usuarios-filter-btn ${filtro === 'todos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('todos')}>Todos ({total})</button>
          <button className={`usuarios-filter-btn ${filtro === 'activos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('activos')}>Activos ({activos})</button>
          <button className={`usuarios-filter-btn ${filtro === 'inactivos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('inactivos')}>Inactivos ({inactivos})</button>
        </div>
        <button className="usuarios-btn-nuevo" onClick={() => openModal('create')}>
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      {/* Table */}
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
            {usuarios.filter(u => {
              if (filtro === 'activos') return u.estado === 1 || u.estado === 'Activo';
              if (filtro === 'inactivos') return u.estado === 0 || u.estado === 'Inactivo';
              return true;
            }).map(u => (
              <tr key={u.id}>
                <td className="usuarios-td-user">
                  <div className="usuarios-td-avatar">
                    <img src={`https://i.pravatar.cc/150?u=${u.id}`} alt="avatar" />
                  </div>
                  <span className="usuarios-td-name">{u.nombre} {u.apellido}</span>
                </td>
                <td className="usuarios-td-text">{u.correo}</td>
                <td className="usuarios-td-text">{u.telefono}</td>
                <td className="usuarios-td-text">{getRolName(u.id_rol)}</td>
                <td>
                  {(u.estado === 1 || u.estado === 'Activo') ? (
                    <span className="usuarios-badge activo">Activo</span>
                  ) : (
                    <span className="usuarios-badge inactivo">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="usuarios-table-actions">
                    <button className="usuarios-action-btn edit" title="Editar" onClick={() => openModal('edit', u)}>
                      <Edit size={16} />
                    </button>
                    <button className={`usuarios-action-btn ${(u.estado === 1 || u.estado === 'Activo') ? 'power-off' : 'power-on'}`} title={(u.estado === 1 || u.estado === 'Activo') ? "Dar de baja" : "Dar de alta"} onClick={() => handleDarDeBaja(u)}>
                      <Power size={16} />
                    </button>
                    <button className="usuarios-action-btn delete" title="Eliminar" onClick={() => handleEliminar(u.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Footer Pagination */}
        <div className="usuarios-pagination">
          <span className="usuarios-pagination-text">Mostrando {usuarios.length} de {total} usuarios</span>
          <div className="usuarios-pagination-buttons">
            <button className="usuarios-page-btn prev">Anterior</button>
            <button className="usuarios-page-btn next">Siguiente</button>
          </div>
        </div>
      </div>

      {/* MODAL (DaisyUI style logic but using custom fixed overlay) */}
      <dialog className={`modal ${showModal ? "modal-open" : ""}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-md flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-200">
              <h3 className="font-bold text-lg text-base-content">
                {modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Nombre</label>
                <input type="text" className="input input-bordered w-full" 
                  value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Apellido</label>
                <input type="text" className="input input-bordered w-full" 
                  value={formData.apellido || ''} onChange={e => setFormData({...formData, apellido: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Correo</label>
                <input type="email" className="input input-bordered w-full" 
                  value={formData.correo || ''} onChange={e => setFormData({...formData, correo: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Teléfono</label>
                <input type="text" className="input input-bordered w-full" 
                  value={formData.telefono || ''} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              </div>
              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1">Contraseña</label>
                  <input type="password" className="input input-bordered w-full" 
                    value={formData.contrasena || ''} onChange={e => setFormData({...formData, contrasena: e.target.value})} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Rol</label>
                <select className="input input-bordered w-full" 
                  value={formData.id_rol} onChange={e => setFormData({...formData, id_rol: Number(e.target.value)})}>
                  <option value={1}>Administrador</option>
                  <option value={2}>Recepcionista</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-base-200 flex justify-end gap-3 bg-base-200">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancelar</button>
              <button onClick={handleSave} className="btn btn-primary">Guardar</button>
            </div>
          </div>
      </dialog>
    </div>
  );
}
