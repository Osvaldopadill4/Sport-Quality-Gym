import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X } from 'lucide-react';
import '../../CSS/Productos.css';
import { getProductos, createProductos, updateProductos, deleteProductos } from '../../JS/producto';

export default function Productos({ loggedUser }) {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', precio: 0, stock: 0, stock_minimo: 0, estado: 1 });

  const cargarDatos = () => {
    getProductos().then(data => {
      if (Array.isArray(data) && data.length > 0) setProductos(data);
      else setProductos([{ id: 1, nombre: 'Proteína Whey', descripcion: '2kg Vainilla', precio: 1200, stock: 15, stock_minimo: 5, estado: 1 }]);
    });
  };

  useEffect(() => cargarDatos(), []);

  const handleDarDeBaja = async (p) => {
    try {
      await updateProductos(p.id, { ...p, estado: (p.estado === 1 || p.estado === 'Activo') ? 0 : 1 });
      cargarDatos();
    } catch (e) { console.error(e); }
  };

  const handleEliminar = async (id) => {
    if(window.confirm("¿Eliminar este producto?")) {
      try { await deleteProductos(id); cargarDatos(); } catch(e) { console.error(e); }
    }
  };

  const openModal = (mode, prod = null) => {
    setModalMode(mode);
    setFormData(prod ? prod : { nombre: '', descripcion: '', precio: 0, stock: 0, stock_minimo: 0, estado: 1 });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalMode === 'create') await createProductos(formData);
      else await updateProductos(formData.id, formData);
      setShowModal(false); cargarDatos();
    } catch(e) { console.error(e); }
  };

  const filtered = productos.filter(p => {
    if (filtro === 'activos') return p.estado === 1 || p.estado === 'Activo';
    if (filtro === 'inactivos') return p.estado === 0 || p.estado === 'Inactivo';
    return true;
  });

  return (
    <div className="productos-wrapper">
      <div className="productos-header">
        <h1 className="productos-title">Gestión de Productos</h1>
        <div className="productos-top-actions">
          <div className="productos-search-container">
            <Search size={20} className="productos-search-icon" />
            <input type="text" className="productos-search-input" placeholder="Buscar productos..." />
          </div>
          <button className="productos-btn-nuevo" onClick={() => openModal('create')}>
            <Plus size={16} /> Nuevo
          </button>
        </div>
      </div>
      <div className="productos-filters-bar">
        <div className="productos-filters">
          <button className={`productos-filter-btn ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Todos ({productos.length})</button>
          <button className={`productos-filter-btn ${filtro === 'activos' ? 'active' : ''}`} onClick={() => setFiltro('activos')}>Activos</button>
        </div>
      </div>
      <div className="productos-table-container">
        <table className="productos-table">
          <thead>
            <tr><th>Producto</th><th>Descripción</th><th>Precio</th><th>Stock</th><th>Estado</th><th style={{textAlign:'right'}}>Opciones</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td className="productos-td-name font-bold">{p.nombre}</td>
                <td>{p.descripcion}</td>
                <td>${p.precio}</td>
                <td>
                  <span className={`badge ${p.stock <= p.stock_minimo ? 'badge-error' : 'badge-success'}`}>{p.stock}</span>
                </td>
                <td>{p.estado === 1 || p.estado === 'Activo' ? <span className="productos-badge activo">Activo</span> : <span className="productos-badge inactivo">Inactivo</span>}</td>
                <td>
                  <div className="productos-table-actions">
                    <button className="productos-action-btn edit" onClick={() => openModal('edit', p)}><Edit size={16}/></button>
                    <button className="productos-action-btn power-on" onClick={() => handleDarDeBaja(p)}><Power size={16}/></button>
                    <button className="productos-action-btn delete" onClick={() => handleEliminar(p.id)}><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog className={`modal ${showModal ? "modal-open" : ""}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-md flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between bg-gray-50">
              <h3 className="font-bold text-lg">{modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div><label className="block text-sm mb-1">Nombre</label><input type="text" className="w-full px-3 py-2 border rounded-lg" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Descripción</label><input type="text" className="w-full px-3 py-2 border rounded-lg" value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1">Precio</label><input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.precio} onChange={e => setFormData({...formData, precio: parseFloat(e.target.value)})} /></div>
                <div><label className="block text-sm mb-1">Stock</label><input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} /></div>
                <div><label className="block text-sm mb-1">Stock Mínimo</label><input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: parseInt(e.target.value)})} /></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancelar</button>
              <button onClick={handleSave} className="btn btn-primary">Guardar</button>
            </div>
          </div>
      </dialog>
    </div>
  );
}
