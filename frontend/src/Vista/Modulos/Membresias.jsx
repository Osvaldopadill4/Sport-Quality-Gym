import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X } from 'lucide-react';
import '../../CSS/Membresias.css';
import { getMembresias, createMembresias, updateMembresias, deleteMembresias } from '../../JS/membresia';

export default function Membresias({ loggedUser }) {
  const [membresias, setMembresias] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  
  const [formData, setFormData] = useState({ id_cliente: 1, id_plan: 1, fecha_inicio: '', fecha_vencimiento: '', estado: 'Activo' });

  const cargarDatos = () => {
    getMembresias().then(data => {
      if (Array.isArray(data) && data.length > 0) setMembresias(data);
      else setMembresias([
        { id: 1, id_cliente: 1, id_plan: 1, fecha_inicio: '2023-10-01', fecha_vencimiento: '2023-11-01', estado: 'Activo' }
      ]);
    });
  };

  useEffect(() => cargarDatos(), []);

  const handleDarDeBaja = async (m) => {
    try {
      await updateMembresias(m.id, { ...m, estado: (m.estado === 'Activo') ? 'Inactivo' : 'Activo' });
      cargarDatos();
    } catch (e) { console.error(e); }
  };

  const handleEliminar = async (id) => {
    if(window.confirm("¿Eliminar esta membresía?")) {
      try { await deleteMembresias(id); cargarDatos(); } catch(e) { console.error(e); }
    }
  };

  const openModal = (mode, m = null) => {
    setModalMode(mode);
    setFormData(m ? m : { id_cliente: 1, id_plan: 1, fecha_inicio: new Date().toISOString().split('T')[0], fecha_vencimiento: '', estado: 'Activo' });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalMode === 'create') await createMembresias(formData);
      else await updateMembresias(formData.id, formData);
      setShowModal(false); cargarDatos();
    } catch(e) { console.error(e); }
  };

  const filtered = membresias.filter(m => {
    if (filtro === 'activos') return m.estado === 'Activo' || m.estado === 1;
    if (filtro === 'inactivos') return m.estado === 'Inactivo' || m.estado === 0;
    return true;
  });

  return (
    <div className="membresias-wrapper">
      <div className="membresias-header">
        <h1 className="membresias-title">Control de Membresías</h1>
        <div className="membresias-top-actions">
          <div className="membresias-search-container">
            <Search size={20} className="membresias-search-icon" />
            <input type="text" className="membresias-search-input" placeholder="Buscar membresía..." />
          </div>
          <button className="membresias-btn-nuevo" onClick={() => openModal('create')}>
            <Plus size={16} /> Nueva Membresía
          </button>
        </div>
      </div>
      <div className="membresias-filters-bar">
        <div className="membresias-filters">
          <button className={`membresias-filter-btn ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Todas ({membresias.length})</button>
          <button className={`membresias-filter-btn ${filtro === 'activos' ? 'active' : ''}`} onClick={() => setFiltro('activos')}>Activas</button>
        </div>
      </div>
      <div className="membresias-table-container">
        <table className="membresias-table">
          <thead>
            <tr><th>ID Cliente</th><th>ID Plan</th><th>Inicio</th><th>Vencimiento</th><th>Estado</th><th style={{textAlign:'right'}}>Opciones</th></tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td className="font-bold">Cliente #{m.id_cliente}</td>
                <td>Plan #{m.id_plan}</td>
                <td>{m.fecha_inicio}</td>
                <td className="text-error font-bold">{m.fecha_vencimiento}</td>
                <td>{m.estado === 1 || m.estado === 'Activo' ? <span className="membresias-badge activo">Activo</span> : <span className="membresias-badge inactivo">Inactivo</span>}</td>
                <td>
                  <div className="membresias-table-actions">
                    <button className="membresias-action-btn edit" onClick={() => openModal('edit', m)}><Edit size={16}/></button>
                    <button className="membresias-action-btn power-on" onClick={() => handleDarDeBaja(m)}><Power size={16}/></button>
                    <button className="membresias-action-btn delete" onClick={() => handleEliminar(m.id)}><Trash2 size={16}/></button>
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
              <h3 className="font-bold text-lg">{modalMode === 'create' ? 'Asignar Membresía' : 'Editar Membresía'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1">ID Cliente</label><input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.id_cliente} onChange={e => setFormData({...formData, id_cliente: parseInt(e.target.value)})} /></div>
                <div><label className="block text-sm mb-1">ID Plan</label><input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.id_plan} onChange={e => setFormData({...formData, id_plan: parseInt(e.target.value)})} /></div>
              </div>
              <div><label className="block text-sm mb-1">Fecha Inicio</label><input type="date" className="w-full px-3 py-2 border rounded-lg" value={formData.fecha_inicio} onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Fecha Vencimiento</label><input type="date" className="w-full px-3 py-2 border rounded-lg" value={formData.fecha_vencimiento} onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})} /></div>
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
