import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X, Package, AlertTriangle } from 'lucide-react';
import '../../CSS/Productos.css';
import { getProductos, createProductos, updateProductos, deleteProductos } from '../../JS/producto';
import Toast from '../Componentes/Toast';

export default function Productos({ loggedUser }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ 
    nombre: '', 
    descripcion: '', 
    categoria: 'Suplementos',
    precio: '', 
    stock: '', 
    stock_minimo: 5, 
    estado: 1 
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (lista) => {
    setProductos(lista);
    try {
      localStorage.setItem('gymton_productos', JSON.stringify(lista));
    } catch (e) {
      console.error(e);
    }
  };

  const cargarDatos = () => {
    getProductos().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setProductos(data);
        localStorage.setItem('gymton_productos', JSON.stringify(data));
      } else {
        const local = localStorage.getItem('gymton_productos');
        if (local) {
          try {
            setProductos(JSON.parse(local));
            return;
          } catch (e) {
            console.error(e);
          }
        }
        const fallback = [
          { id: 1, nombre: 'Proteína Whey Isolate', categoria: 'Suplementos', descripcion: '2kg Vainilla Gold Standard', precio: 1250, stock: 18, stock_minimo: 5, estado: 1 },
          { id: 2, nombre: 'Creatina Monohidratada', categoria: 'Suplementos', descripcion: 'Creapure 300g Micronizada', precio: 550, stock: 4, stock_minimo: 6, estado: 1 },
          { id: 3, nombre: 'Bebida Energética Pre-Workout', categoria: 'Bebidas', descripcion: 'Lata 473ml Sabor Blue Berry', precio: 65, stock: 35, stock_minimo: 10, estado: 1 },
          { id: 4, nombre: 'Correas de Levantamiento (Straps)', categoria: 'Accesorios', descripcion: 'Algodón reforzado antideslizante', precio: 220, stock: 12, stock_minimo: 3, estado: 1 },
          { id: 5, nombre: 'Shaker Mezclador 700ml', categoria: 'Accesorios', descripcion: 'Vaso con bola mezcladora de acero', precio: 140, stock: 2, stock_minimo: 5, estado: 0 }
        ];
        setProductos(fallback);
        localStorage.setItem('gymton_productos', JSON.stringify(fallback));
      }
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = productos.length;
  const activos = productos.filter(p => p.estado === 1 || p.estado === 'Activo').length;
  const inactivos = total - activos;

  const getRolName = (id_rol) => {
    if (id_rol === 1) return 'Administrador';
    if (id_rol === 2) return 'Recepcionista';
    return 'Usuario';
  };

  // ACCIÓN: Poner en activo
  const handlePonerEnActivo = async (p) => {
    try {
      const prodActualizado = { ...p, estado: 1 };
      await updateProductos(p.id, prodActualizado);
      const nuevaLista = productos.map(item => item.id === p.id ? prodActualizado : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Puesto en activo correctamente', 'success');
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al activar producto', 'error');
    }
  };

  // ACCIÓN: Dar de baja
  const handleDarDeBaja = async (p) => {
    try {
      const prodActualizado = { ...p, estado: 0 };
      await updateProductos(p.id, prodActualizado);
      const nuevaLista = productos.map(item => item.id === p.id ? prodActualizado : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Dado de baja correctamente', 'info');
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al desactivar producto', 'error');
    }
  };

  const handleToggleEstado = (p) => {
    const esActivo = p.estado === 1 || p.estado === 'Activo';
    if (esActivo) handleDarDeBaja(p);
    else handlePonerEnActivo(p);
  };

  // ACCIÓN: Eliminar
  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await deleteProductos(id);
        const nuevaLista = productos.filter(p => p.id !== id);
        guardarLocalmente(nuevaLista);
        mostrarAlerta('Registro eliminado correctamente', 'success');
      } catch (e) {
        console.error(e);
        mostrarAlerta('Error al eliminar producto', 'error');
      }
    }
  };

  const openModal = (mode, prod = null) => {
    setModalMode(mode);
    if (mode === 'edit' && prod) {
      setFormData({
        id: prod.id,
        nombre: prod.nombre || '',
        descripcion: prod.descripcion || '',
        categoria: prod.categoria || 'Suplementos',
        precio: prod.precio ?? '',
        stock: prod.stock ?? '',
        stock_minimo: prod.stock_minimo ?? 5,
        estado: (prod.estado === 1 || prod.estado === 'Activo') ? 1 : 0
      });
    } else {
      setFormData({ 
        nombre: '', 
        descripcion: '', 
        categoria: 'Suplementos',
        precio: '', 
        stock: '', 
        stock_minimo: 5, 
        estado: 1 
      });
    }
    setShowModal(true);
  };

  // ACCIONES: Registrar y Modificar
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.nombre.trim()) {
      mostrarAlerta('Por favor ingresa el nombre del producto', 'error');
      return;
    }
    if (formData.precio === '' || Number(formData.precio) < 0) {
      mostrarAlerta('Ingresa un precio válido en MXN', 'error');
      return;
    }

    const payload = {
      ...formData,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock) || 0,
      stock_minimo: parseInt(formData.stock_minimo) || 0
    };

    try {
      if (modalMode === 'create') {
        const res = await createProductos(payload);
        const nuevo = (res && res.id) ? res : { ...payload, id: Date.now() };
        const nuevaLista = [nuevo, ...productos];
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Registro completado correctamente', 'success');
      } else {
        await updateProductos(payload.id, payload);
        const nuevaLista = productos.map(item => item.id === payload.id ? { ...item, ...payload } : item);
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
      }
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al procesar la solicitud', 'error');
    }
  };

  // FILTRO EN TIEMPO REAL con useState y filter
  const productosFiltrados = productos.filter(p => {
    const coincideEstado =
      filtro === 'todos' ? true :
      filtro === 'activos' ? (p.estado === 1 || p.estado === 'Activo') :
      (p.estado === 0 || p.estado === 'Inactivo');

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return coincideEstado;

    const nombre = (p.nombre || '').toLowerCase();
    const desc = (p.descripcion || '').toLowerCase();
    const cat = (p.categoria || '').toLowerCase();
    const precio = (p.precio || '').toString();

    const coincideBusqueda =
      nombre.includes(termino) ||
      desc.includes(termino) ||
      cat.includes(termino) ||
      precio.includes(termino);

    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="productos-wrapper">
      <Toast alerta={alerta} onClose={() => setAlerta(null)} />

      {/* Header */}
      <div className="productos-header">
        <h1 className="productos-title">Gestión de Productos</h1>
        <div className="productos-top-actions">
          {/* Buscador en tiempo real */}
          <div className="productos-search-container relative flex items-center">
            <Search size={20} className="productos-search-icon" />
            <input 
              type="text" 
              className="productos-search-input" 
              placeholder="Buscar productos, suplementos, precio..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button 
                type="button" 
                className="absolute right-3 text-gray-400 hover:text-white"
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="productos-terminal-badge flex items-center gap-2 text-sm text-gray-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Terminal Activo
          </div>
          <div className="productos-profile flex items-center gap-3 border-l border-gray-700 pl-4">
            <div className="text-right">
              <div className="text-sm font-bold text-white">
                {usuarioActivo ? `${usuarioActivo.nombre} ${usuarioActivo.apellido || ''}`.trim() : 'Usuario Activo'}
              </div>
              <div className="text-xs text-emerald-400">
                {usuarioActivo ? getRolName(usuarioActivo.id_rol) : 'Administrador'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y Botón Nuevo */}
      <div className="productos-filters-bar">
        <div className="productos-filters">
          <button className={`productos-filter-btn ${filtro === 'todos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('todos')}>Todos ({total})</button>
          <button className={`productos-filter-btn ${filtro === 'activos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('activos')}>Activos ({activos})</button>
          <button className={`productos-filter-btn ${filtro === 'inactivos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('inactivos')}>Inactivos ({inactivos})</button>
        </div>
        <button className="productos-btn-nuevo" onClick={() => openModal('create')}>
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="productos-table-container">
        <table className="productos-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Precio (MXN)</th>
              <th>Stock</th>
              <th>Estado</th>
              <th style={{textAlign:'right'}}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400 italic">
                  {busqueda ? `No se encontraron productos con el término "${busqueda}"` : 'No hay productos registrados'}
                </td>
              </tr>
            ) : (
              productosFiltrados.map(p => {
                const esActivo = p.estado === 1 || p.estado === 'Activo';
                const stockBajo = Number(p.stock) <= Number(p.stock_minimo);
                return (
                  <tr key={p.id}>
                    <td className="productos-td-name font-bold">
                      <span className="flex items-center gap-2">
                        <Package size={16} className="text-primary" /> {p.nombre}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-outline badge-sm text-xs font-medium">
                        {p.categoria || 'General'}
                      </span>
                    </td>
                    <td className="text-gray-400 text-sm">{p.descripcion || 'Sin descripción'}</td>
                    <td className="font-bold text-emerald-400">${p.precio} MXN</td>
                    <td>
                      <span className={`badge ${stockBajo ? 'badge-error text-white font-bold gap-1' : 'badge-success text-black font-semibold'}`}>
                        {stockBajo && <AlertTriangle size={12} />} {p.stock} uds.
                      </span>
                    </td>
                    <td>
                      {esActivo ? (
                        <span className="productos-badge activo">Activo</span>
                      ) : (
                        <span className="productos-badge inactivo">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <div className="productos-table-actions">
                        <button className="productos-action-btn edit" title="Editar producto" onClick={() => openModal('edit', p)}>
                          <Edit size={16}/>
                        </button>
                        <button 
                          className={`productos-action-btn ${esActivo ? 'power-off' : 'power-on'}`} 
                          title={esActivo ? "Dar de baja" : "Poner en activo"} 
                          onClick={() => handleToggleEstado(p)}
                        >
                          <Power size={16}/>
                        </button>
                        <button className="productos-action-btn delete" title="Eliminar producto" onClick={() => handleEliminar(p.id)}>
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="productos-pagination flex justify-between items-center p-4 bg-white border-t border-gray-100">
          <span className="text-sm text-gray-500 font-medium">
            Mostrando {productosFiltrados.length} de {total} productos
            {busqueda && ` (filtrado por "${busqueda}")`}
          </span>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-outline">Anterior</button>
            <button className="btn btn-sm btn-primary">Siguiente</button>
          </div>
        </div>
      </div>

      {/* Modal para Registrar / Modificar */}
      <dialog className={`modal ${showModal ? "modal-open" : ""}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-md flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between bg-base-200">
            <h3 className="font-bold text-lg text-base-content">
              {modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
            </h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Producto *</label>
                <input 
                  type="text" 
                  required
                  className="input input-bordered w-full" 
                  placeholder="Ej. Proteína Whey 2kg"
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select 
                  className="input input-bordered w-full"
                  value={formData.categoria}
                  onChange={e => setFormData({...formData, categoria: e.target.value})}
                >
                  <option value="Suplementos">Suplementos</option>
                  <option value="Bebidas">Bebidas e Hidratación</option>
                  <option value="Snacks">Snacks Saludables</option>
                  <option value="Accesorios">Accesorios y Ropa</option>
                  <option value="Equipamiento">Equipamiento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  placeholder="Ej. Sabor Vainilla, 24g proteína por porción"
                  value={formData.descripcion || ''} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Precio (MXN) *</label>
                  <input 
                    type="number" 
                    step="0.5"
                    required
                    className="input input-bordered w-full" 
                    placeholder="1200"
                    value={formData.precio} 
                    onChange={e => setFormData({...formData, precio: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input 
                    type="number" 
                    className="input input-bordered w-full" 
                    placeholder="15"
                    value={formData.stock} 
                    onChange={e => setFormData({...formData, stock: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mínimo</label>
                  <input 
                    type="number" 
                    className="input input-bordered w-full" 
                    placeholder="5"
                    value={formData.stock_minimo} 
                    onChange={e => setFormData({...formData, stock_minimo: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select 
                  className="input input-bordered w-full"
                  value={formData.estado}
                  onChange={e => setFormData({...formData, estado: Number(e.target.value)})}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-base-200 flex justify-end gap-3 bg-base-200">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancelar</button>
              <button type="submit" className="btn btn-primary">
                {modalMode === 'create' ? 'Agregar Producto' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
