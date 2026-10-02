import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X } from 'lucide-react';
import '../../CSS/Clientes.css';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../../JS/cliente';

export default function Clientes({ loggedUser }) {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ nombre: '', telefono: '', contacto_emergencia: '', telefono_emergencia: '', fecha_registro: '', estado: 1 });

  const cargarDatos = () => {
    getClientes().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setClientes(data);
      } else {
        setClientes([{ id: 1, nombre: 'Juan Pérez', telefono: '555-1234', contacto_emergencia: 'María Pérez', telefono_emergencia: '555-4321', fecha_registro: '2023-01-15', estado: 1 }]);
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

  const handleDarDeBaja = async (c) => {
    const nuevoEstado = (c.estado === 1 || c.estado === 'Activo') ? 0 : 1;
    try {
      await updateCliente(c.id, { ...c, estado: nuevoEstado });
      cargarDatos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminar = async (id) => {
    if(window.confirm("¿Estás seguro de eliminar este cliente?")) {
      try {
        await deleteCliente(id);
        cargarDatos();
      } catch(error) {
        console.error(error);
      }
    }
  };

  const openModal = (mode, cliente = null) => {
    setModalMode(mode);
    if (mode === 'edit' && cliente) {
      setFormData(cliente);
    } else {
      const hoy = new Date().toISOString().split('T')[0];
      setFormData({ nombre: '', telefono: '', contacto_emergencia: '', telefono_emergencia: '', fecha_registro: hoy, estado: 1 });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalMode === 'create') {
        await createCliente(formData);
      } else {
        await updateCliente(formData.id, formData);
      }
      setShowModal(false);
      cargarDatos();
    } catch(error) {
      console.error(error);
    }
  };

  return (
    <div className="clientes-wrapper">
      <div className="clientes-header">
        <h1 className="clientes-title">Gestión de Clientes</h1>
        <div className="clientes-top-actions">
          <div className="clientes-search-container">
            <div className="clientes-search-icon"><Search size={20} /></div>
            <input type="text" className="clientes-search-input" placeholder="Buscar clientes..." />
          </div>
          <div className="clientes-terminal-badge"><span className="clientes-terminal-dot"></span> Terminal Activo</div>
          <div className="clientes-profile">
            <div className="clientes-profile-info">
              <div className="clientes-profile-name">{loggedUser ? `${loggedUser.nombre} ${loggedUser.apellido}` : 'Cargando...'}</div>
              <div className="clientes-profile-role">{loggedUser ? getRolName(loggedUser.id_rol) : '...'}</div>
            </div>
            <div className="clientes-profile-avatar">
              <img src={`https://i.pravatar.cc/150?u=${loggedUser?.id || 11}`} alt="avatar" />
            </div>
          </div>
        </div>
      </div>

      <div className="clientes-filters-bar">
        <div className="clientes-filters">
          <button className={`clientes-filter-btn ${filtro === 'todos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('todos')}>Todos ({total})</button>
          <button className={`clientes-filter-btn ${filtro === 'activos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('activos')}>Activos ({activos})</button>
          <button className={`clientes-filter-btn ${filtro === 'inactivos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('inactivos')}>Inactivos ({inactivos})</button>
        </div>
        <button className="clientes-btn-nuevo" onClick={() => openModal('create')}>
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>

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
            {clientes.filter(c => {
              if (filtro === 'activos') return c.estado === 1 || c.estado === 'Activo';
              if (filtro === 'inactivos') return c.estado === 0 || c.estado === 'Inactivo';
              return true;
            }).map(c => (
              <tr key={c.id}>
                <td className="clientes-td-user">
                  <div className="clientes-td-avatar">
                    <img src={`https://i.pravatar.cc/150?u=cliente${c.id}`} alt="avatar" />
                  </div>
                  <span className="clientes-td-name">{c.nombre}</span>
                </td>
                <td className="clientes-td-text">{c.telefono || 'N/A'}</td>
                <td className="clientes-td-text">{c.contacto_emergencia || 'N/A'}</td>
                <td className="clientes-td-text">{c.telefono_emergencia || 'N/A'}</td>
                <td className="clientes-td-text">{c.fecha_registro || 'N/A'}</td>
                <td>
                  {(c.estado === 1 || c.estado === 'Activo') ? (
                    <span className="clientes-badge activo">Activo</span>
                  ) : (
                    <span className="clientes-badge inactivo">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="clientes-table-actions">
                    <button className="clientes-action-btn edit" title="Editar" onClick={() => openModal('edit', c)}>
                      <Edit size={16} />
                    </button>
                    <button className={`clientes-action-btn ${(c.estado === 1 || c.estado === 'Activo') ? 'power-off' : 'power-on'}`} title={(c.estado === 1 || c.estado === 'Activo') ? "Dar de baja" : "Dar de alta"} onClick={() => handleDarDeBaja(c)}>
                      <Power size={16} />
                    </button>
                    <button className="clientes-action-btn delete" title="Eliminar" onClick={() => handleEliminar(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="clientes-pagination">
          <span className="clientes-pagination-text">Mostrando {clientes.length} de {total} clientes</span>
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
