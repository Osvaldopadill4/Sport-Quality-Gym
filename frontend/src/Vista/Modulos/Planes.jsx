import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X } from 'lucide-react';
import '../../CSS/Planes.css';
import { getPlanes, createPlanes, updatePlanes, deletePlanes } from '../../JS/plan';

export default function Planes({ loggedUser }) {
  const [planes, setPlanes] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', precio: 0, duracion_dias: 30, estado: 1 });

  const cargarDatos = () => {
    getPlanes().then(data => {
      if (Array.isArray(data) && data.length > 0) setPlanes(data);
      else setPlanes([
        { id: 1, nombre: 'Mensual', descripcion: 'Acceso total 30 días', precio: 500, duracion_dias: 30, estado: 1 },
        { id: 2, nombre: 'Anual', descripcion: 'Acceso total 365 días', precio: 4500, duracion_dias: 365, estado: 1 }
      ]);
    });
  };

  useEffect(() => cargarDatos(), []);

  const handleDarDeBaja = async (p) => {
    try {
      await updatePlanes(p.id, { ...p, estado: (p.estado === 1 || p.estado === 'Activo') ? 0 : 1 });
      cargarDatos();
    } catch (e) { console.error(e); }
  };

  const handleEliminar = async (id) => {
    if(window.confirm("¿Eliminar este plan?")) {
      try { await deletePlanes(id); cargarDatos(); } catch(e) { console.error(e); }
    }
  };

  const openModal = (mode, plan = null) => {
    setModalMode(mode);
    setFormData(plan ? plan : { nombre: '', descripcion: '', precio: 0, duracion_dias: 30, estado: 1 });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalMode === 'create') await createPlanes(formData);
      else await updatePlanes(formData.id, formData);
      setShowModal(false); cargarDatos();
    } catch(e) { console.error(e); }
  };

  const filtered = planes.filter(p => {
    if (filtro === 'activos') return p.estado === 1 || p.estado === 'Activo';
    if (filtro === 'inactivos') return p.estado === 0 || p.estado === 'Inactivo';
    return true;
  });

  return (
    <div className="planes-wrapper">
      <div className="planes-header">
        <h1 className="planes-title">Gestión de Planes</h1>
        <div className="planes-top-actions">
          <div className="planes-search-container">
            <Search size={20} className="planes-search-icon" />
            <input type="text" className="planes-search-input" placeholder="Buscar planes..." />
          </div>
          <button className="planes-btn-nuevo" onClick={() => openModal('create')}>
            <Plus size={16} /> Nuevo Plan
          </button>
        </div>
      </div>
      <div className="planes-filters-bar">
        <div className="planes-filters">
          <button className={`planes-filter-btn ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Todos ({planes.length})</button>
          <button className={`planes-filter-btn ${filtro === 'activos' ? 'active' : ''}`} onClick={() => setFiltro('activos')}>Activos</button>
        </div>
      </div>
      <div className="planes-table-container">
        <table className="planes-table">
          <thead>
            <tr><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Duración (Días)</th><th>Estado</th><th style={{textAlign:'right'}}>Opciones</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="planes-td-name font-bold text-primary">{p.nombre}</td>
                <td>{p.descripcion}</td>
                <td>${p.precio}</td>
                <td>{p.duracion_dias} días</td>
                <td>{p.estado === 1 || p.estado === 'Activo' ? <span className="planes-badge activo">Activo</span> : <span className="planes-badge inactivo">Inactivo</span>}</td>
                <td>
                  <div className="planes-table-actions">
                    <button className="planes-action-btn edit" onClick={() => openModal('edit', p)}><Edit size={16}/></button>
                    <button className="planes-action-btn power-on" onClick={() => handleDarDeBaja(p)}><Power size={16}/></button>
                    <button className="planes-action-btn delete" onClick={() => handleEliminar(p.id)}><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50">
              <h3 className="font-bold text-lg">{modalMode === 'create' ? 'Nuevo Plan' : 'Editar Plan'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm mb-1">Nombre</label><input type="text" className="w-full px-3 py-2 border rounded-lg" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Descripción</label><input type="text" className="w-full px-3 py-2 border rounded-lg" value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1">Precio</label><input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.precio} onChange={e => setFormData({...formData, precio: parseFloat(e.target.value)})} /></div>
                <div><label className="block text-sm mb-1">Duración (Días)</label><input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.duracion_dias} onChange={e => setFormData({...formData, duracion_dias: parseInt(e.target.value)})} /></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancelar</button>
              <button onClick={handleSave} className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
