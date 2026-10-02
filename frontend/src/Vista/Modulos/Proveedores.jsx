import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X } from 'lucide-react';
import '../../CSS/Proveedor.css';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../JS/proveedor';

export default function Proveedores({ loggedUser }) {
  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ nombre_empresa: '', telefono: '', correo: '', estado: 1 });

  const cargarDatos = () => {
    getProveedores().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setProveedores(data);
      } else {
        setProveedores([{ id: 1, nombre_empresa: 'Suplementos XYZ', telefono: '555-0011', correo: 'contacto@xyz.com', estado: 1 }]);
      }
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = proveedores.length;
  const activos = proveedores.filter(p => p.estado === 1 || p.estado === 'Activo').length;
  const inactivos = total - activos;

  const getRolName = (id_rol) => {
    if (id_rol === 1) return 'Administrador';
    if (id_rol === 2) return 'Recepcionista';
    return 'Usuario';
  };

  const handleDarDeBaja = async (p) => {
    const nuevoEstado = (p.estado === 1 || p.estado === 'Activo') ? 0 : 1;
    try {
      await updateProveedor(p.id, { ...p, estado: nuevoEstado });
      cargarDatos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminar = async (id) => {
    if(window.confirm("¿Estás seguro de eliminar este proveedor?")) {
      try {
        await deleteProveedor(id);
        cargarDatos();
      } catch(error) {
        console.error(error);
      }
    }
  };

  const openModal = (mode, proveedor = null) => {
    setModalMode(mode);
    if (mode === 'edit' && proveedor) {
      setFormData(proveedor);
    } else {
      setFormData({ nombre_empresa: '', telefono: '', correo: '', estado: 1 });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalMode === 'create') {
        await createProveedor(formData);
      } else {
        await updateProveedor(formData.id, formData);
      }
      setShowModal(false);
      cargarDatos();
    } catch(error) {
      console.error(error);
    }
  };

  return (
    <div className="proveedor-wrapper">
      <div className="proveedor-header">
        <h1 className="proveedor-title">Gestión de Proveedores</h1>
        <div className="proveedor-top-actions">
          <div className="proveedor-search-container">
            <div className="proveedor-search-icon"><Search size={20} /></div>
            <input type="text" className="proveedor-search-input" placeholder="Buscar empresas..." />
          </div>
          <div className="proveedor-terminal-badge"><span className="proveedor-terminal-dot"></span> Terminal Activo</div>
          <div className="proveedor-profile">
            <div className="proveedor-profile-info">
              <div className="proveedor-profile-name">{loggedUser ? `${loggedUser.nombre} ${loggedUser.apellido}` : 'Cargando...'}</div>
              <div className="proveedor-profile-role">{loggedUser ? getRolName(loggedUser.id_rol) : '...'}</div>
            </div>
            <div className="proveedor-profile-avatar">
              <img src={`https://i.pravatar.cc/150?u=${loggedUser?.id || 11}`} alt="avatar" />
            </div>
          </div>
        </div>
      </div>

      <div className="proveedor-filters-bar">
        <div className="proveedor-filters">
          <button className={`proveedor-filter-btn ${filtro === 'todos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('todos')}>Todos ({total})</button>
          <button className={`proveedor-filter-btn ${filtro === 'activos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('activos')}>Activos ({activos})</button>
          <button className={`proveedor-filter-btn ${filtro === 'inactivos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('inactivos')}>Inactivos ({inactivos})</button>
        </div>
        <button className="proveedor-btn-nuevo" onClick={() => openModal('create')}>
          <Plus size={16} /> Nuevo Proveedor
        </button>
      </div>

      <div className="proveedor-table-container">
        <table className="proveedor-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.filter(p => {
              if (filtro === 'activos') return p.estado === 1 || p.estado === 'Activo';
              if (filtro === 'inactivos') return p.estado === 0 || p.estado === 'Inactivo';
              return true;
            }).map(p => (
              <tr key={p.id}>
                <td className="proveedor-td-user">
                  <div className="proveedor-td-avatar">
                    <img src={`https://i.pravatar.cc/150?u=empresa${p.id}`} alt="avatar" />
                  </div>
                  <span className="proveedor-td-name">{p.nombre_empresa}</span>
                </td>
                <td className="proveedor-td-text">{p.correo || 'N/A'}</td>
                <td className="proveedor-td-text">{p.telefono || 'N/A'}</td>
                <td>
                  {(p.estado === 1 || p.estado === 'Activo') ? (
                    <span className="proveedor-badge activo">Activo</span>
                  ) : (
                    <span className="proveedor-badge inactivo">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="proveedor-table-actions">
                    <button className="proveedor-action-btn edit" title="Editar" onClick={() => openModal('edit', p)}>
                      <Edit size={16} />
                    </button>
                    <button className={`proveedor-action-btn ${(p.estado === 1 || p.estado === 'Activo') ? 'power-off' : 'power-on'}`} title={(p.estado === 1 || p.estado === 'Activo') ? "Dar de baja" : "Dar de alta"} onClick={() => handleDarDeBaja(p)}>
                      <Power size={16} />
                    </button>
                    <button className="proveedor-action-btn delete" title="Eliminar" onClick={() => handleEliminar(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="proveedor-pagination">
          <span className="proveedor-pagination-text">Mostrando {proveedores.length} de {total} proveedores</span>
          <div className="proveedor-pagination-buttons">
            <button className="proveedor-page-btn prev">Anterior</button>
            <button className="proveedor-page-btn next">Siguiente</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">{modalMode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.nombre_empresa} onChange={e => setFormData({...formData, nombre_empresa: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.correo || ''} onChange={e => setFormData({...formData, correo: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10b981] outline-none" 
                  value={formData.telefono || ''} onChange={e => setFormData({...formData, telefono: e.target.value})} />
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
