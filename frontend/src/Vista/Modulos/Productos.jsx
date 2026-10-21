import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X, Package, AlertTriangle, Truck, ArrowDownCircle, CheckCircle2 } from 'lucide-react';
import '../../CSS/Productos.css';
import { getProductos, createProductos, updateProductos, deleteProductos } from '../../JS/producto';
import Toast from '../Componentes/Toast';

// Helper de estado activo compatible con BD (soporta "1", 1, "Activo", true)
const esEstadoActivo = (estado) => {
  if (estado === undefined || estado === null) return false;
  const s = String(estado).trim().toLowerCase();
  return s === '1' || s === 'activo' || s === 'true' || estado === 1 || estado === true;
};

// Helper que replica la vista SQL `vw_inventario_bajo`:
// (stock <= stock_minimo O stock <= 5)
export const esInventarioBajo = (p) => {
  const stock = Number(p.stock) || 0;
  const min = Number(p.stock_minimo) || 5;
  return stock <= min || stock <= 5;
};

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
  const [filtro, setFiltro] = useState('todos'); // 'todos' | 'activos' | 'inactivos' | 'bajo_stock'
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);

  // Estados modal Crear / Editar
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

  // Estados modal Reabastecer Inventario (sp_registrar_compra_inventario)
  const [showModalCompra, setShowModalCompra] = useState(false);
  const [compraData, setCompraData] = useState({
    id_producto: '',
    id_proveedor: 1,
    cantidad: 10,
    costo: 50
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
  const activos = productos.filter(p => esEstadoActivo(p.estado)).length;
  const inactivos = total - activos;
  
  // Conteo directo de la vista `vw_inventario_bajo`
  const bajoStockCount = productos.filter(p => esInventarioBajo(p)).length;

  const getRolName = (id_rol) => {
    if (id_rol === 1) return 'Administrador';
    if (id_rol === 2) return 'Recepcionista';
    return 'Usuario';
  };

  // ACCIÓN: Poner en activo
  const handlePonerEnActivo = async (p) => {
    try {
      const prodActualizado = { ...p, estado: "1" };
      await updateProductos(p.id, prodActualizado);
      const nuevaLista = productos.map(item => item.id === p.id ? prodActualizado : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Puesto en activo correctamente', 'success');
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al activar producto', 'error');
    }
  };

  // ACCIÓN: Dar de baja
  const handleDarDeBaja = async (p) => {
    try {
      const prodActualizado = { ...p, estado: "0" };
      await updateProductos(p.id, prodActualizado);
      const nuevaLista = productos.map(item => item.id === p.id ? prodActualizado : item);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Dado de baja correctamente', 'info');
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al desactivar producto', 'error');
    }
  };

  const handleToggleEstado = (p) => {
    const esActivo = esEstadoActivo(p.estado);
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
        cargarDatos();
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
        estado: esEstadoActivo(prod.estado) ? 1 : 0
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

  // Modal para ejecutar la lógica de `sp_registrar_compra_inventario`
  const openModalCompra = (prod = null) => {
    setCompraData({
      id_producto: prod ? prod.id : (productos[0]?.id || ''),
      id_proveedor: 1,
      cantidad: 10,
      costo: prod ? Math.round(Number(prod.precio) * 0.6) : 50
    });
    setShowModalCompra(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.nombre.trim()) {
      mostrarAlerta('Ingresa el nombre del producto', 'error');
      return;
    }
    if (formData.precio === '' || Number(formData.precio) < 0) {
      mostrarAlerta('Ingresa un precio válido', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        precio: Number(formData.precio),
        stock: Number(formData.stock) || 0,
        stock_minimo: Number(formData.stock_minimo) || 5,
        estado: esEstadoActivo(formData.estado) ? "1" : "0"
      };

      if (modalMode === 'create') {
        const res = await createProductos(payload);
        const nuevo = (res && res.id) ? res : { ...payload, id: Date.now() };
        guardarLocalmente([nuevo, ...productos]);
        mostrarAlerta('Registro completado correctamente', 'success');
      } else {
        await updateProductos(formData.id, payload);
        const lista = productos.map(p => p.id === formData.id ? { ...p, ...payload } : p);
        guardarLocalmente(lista);
        mostrarAlerta('Datos actualizados correctamente', 'success');
      }
      setShowModal(false);
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al procesar la solicitud', 'error');
    }
  };

  // Lógica del procedimiento almacenado `sp_registrar_compra_inventario`
  const handleRegistrarCompraInventario = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cant = Number(compraData.cantidad);
    const costo = Number(compraData.costo);
    const idProd = Number(compraData.id_producto);

    if (cant <= 0 || costo < 0) {
      mostrarAlerta('Cantidad o costo no válido', 'error');
      return;
    }

    // Actualiza stock en producto sumando la cantidad comprada:
    // UPDATE producto SET stock = stock + p_cantidad WHERE id = p_id_producto;
    const prod = productos.find(p => p.id === idProd);
    if (!prod) return;

    const nuevoStock = (Number(prod.stock) || 0) + cant;
    const prodActualizado = { ...prod, stock: nuevoStock };

    try {
      await updateProductos(idProd, prodActualizado);
      const lista = productos.map(p => p.id === idProd ? prodActualizado : p);
      guardarLocalmente(lista);
      setShowModalCompra(false);
      mostrarAlerta(`Entrada de inventario registrada (sp_registrar_compra_inventario): +${cant} uds. para "${prod.nombre}"`, 'success');
      cargarDatos();
    } catch (err) {
      console.error(err);
      mostrarAlerta('Error al registrar compra de inventario', 'error');
    }
  };

  // FILTRO EN TIEMPO REAL con soporte para la vista `vw_inventario_bajo`
  const productosFiltrados = productos.filter(p => {
    let coincideFiltro = true;
    if (filtro === 'activos') coincideFiltro = esEstadoActivo(p.estado);
    else if (filtro === 'inactivos') coincideFiltro = !esEstadoActivo(p.estado);
    else if (filtro === 'bajo_stock') coincideFiltro = esInventarioBajo(p);

    if (!coincideFiltro) return false;

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    const nombre = (p.nombre || '').toLowerCase();
    const desc = (p.descripcion || '').toLowerCase();
    const cat = (p.categoria || '').toLowerCase();
    const precio = (p.precio || '').toString();

    return nombre.includes(termino) || desc.includes(termino) || cat.includes(termino) || precio.includes(termino);
  });

  return (
    <div className="productos-wrapper">
      {alerta && (
        <Toast 
          mensaje={alerta.mensaje} 
          tipo={alerta.tipo} 
          onClose={() => setAlerta(null)} 
        />
      )}

      {/* Header */}
      <div className="productos-header">
        <div>
          <h1 className="productos-title">Gestión de Productos e Inventario</h1>
          <p className="text-xs text-gray-400 mt-1">
            Control de catálogo, abastecimiento y vista en vivo de inventario bajo.
          </p>
        </div>
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

      {/* Alerta de la Vista SQL `vw_inventario_bajo` */}
      {bajoStockCount > 0 && (
        <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4 text-amber-300">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-amber-400 flex-shrink-0 animate-bounce" />
            <div>
              <strong className="block text-sm font-bold">
                Alerta de Inventario (Vista SQL: <code>vw_inventario_bajo</code>)
              </strong>
              <span className="text-xs text-amber-200/80">
                Hay {bajoStockCount} producto(s) con stock igual o inferior a su stock mínimo (o ≤ 5 unidades).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-xs bg-amber-500 text-black border-none font-bold hover:bg-amber-400"
              onClick={() => setFiltro('bajo_stock')}
            >
              Ver {bajoStockCount} Afectados
            </button>
            <button 
              className="btn btn-xs btn-outline border-amber-400 text-amber-300 hover:bg-amber-500 hover:text-black font-bold flex items-center gap-1"
              onClick={() => openModalCompra()}
            >
              <Truck size={14} /> Reabastecer
            </button>
          </div>
        </div>
      )}

      {/* Tabs y Botón Nuevo */}
      <div className="productos-filters-bar flex flex-wrap gap-3 justify-between items-center">
        <div className="productos-filters flex flex-wrap gap-2">
          <button className={`productos-filter-btn ${filtro === 'todos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('todos')}>
            Todos ({total})
          </button>
          <button className={`productos-filter-btn ${filtro === 'activos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('activos')}>
            Activos ({activos})
          </button>
          <button className={`productos-filter-btn ${filtro === 'inactivos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('inactivos')}>
            Inactivos ({inactivos})
          </button>
          {/* Tab de la Vista vw_inventario_bajo */}
          <button 
            className={`productos-filter-btn ${filtro === 'bajo_stock' ? 'active bg-amber-500 text-black border-none' : 'inactive'}`} 
            onClick={() => setFiltro('bajo_stock')}
          >
            ⚠️ Stock Bajo (vw_inventario_bajo) ({bajoStockCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Reabastecer (sp_registrar_compra_inventario) */}
          <button 
            className="btn btn-sm bg-zinc-800 text-emerald-400 border border-zinc-700 hover:bg-zinc-700 font-bold flex items-center gap-1.5"
            onClick={() => openModalCompra()}
            title="Registrar entrada de mercancía / compra a proveedor"
          >
            <Truck size={16} /> Reabastecer (sp_compra)
          </button>

          <button className="productos-btn-nuevo" onClick={() => openModal('create')}>
            <Plus size={16} /> Nuevo Producto
          </button>
        </div>
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
              <th>Stock vs Mínimo</th>
              <th>Estado</th>
              <th style={{textAlign:'right'}}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400 italic">
                  {busqueda ? `No se encontraron productos con el término "${busqueda}"` : 'No hay productos que coincidan con el filtro seleccionado'}
                </td>
              </tr>
            ) : (
              productosFiltrados.map(p => {
                const esActivo = esEstadoActivo(p.estado);
                const stockBajo = esInventarioBajo(p);
                return (
                  <tr key={p.id}>
                    <td className="productos-td-name font-bold">
                      <span className="flex items-center gap-2">
                        <Package size={16} className={stockBajo ? 'text-amber-400' : 'text-primary'} /> 
                        {p.nombre}
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
                      <div className="flex items-center gap-2">
                        <span className={`badge ${stockBajo ? 'badge-error text-white font-bold gap-1' : 'badge-success text-black font-semibold'}`}>
                          {stockBajo && <AlertTriangle size={12} />} {p.stock} uds.
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          (min: {p.stock_minimo || 5})
                        </span>
                        {stockBajo && (
                          <button 
                            className="btn btn-ghost btn-xs text-amber-400 hover:bg-amber-500/10 p-1"
                            title="Comprar / Reabastecer este producto"
                            onClick={() => openModalCompra(p)}
                          >
                            <ArrowDownCircle size={15} />
                          </button>
                        )}
                      </div>
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

        <div className="productos-pagination">
          <span className="productos-pagination-text">
            Mostrando {productosFiltrados.length} de {total} productos
            {filtro === 'bajo_stock' && ' (Vista SQL: vw_inventario_bajo)'}
          </span>
          <div className="productos-pagination-buttons">
            <button className="productos-page-btn prev">Anterior</button>
            <button className="productos-page-btn next">Siguiente</button>
          </div>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      <dialog className={`modal ${showModal ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-md flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-200">
            <h3 className="font-bold text-lg text-base-content">
              {modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
            </h3>
            <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Nombre *</label>
                <input 
                  type="text" 
                  required 
                  className="input input-bordered w-full" 
                  placeholder="Ej. Creatina Creapure" 
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Categoría</label>
                <select 
                  className="input input-bordered w-full"
                  value={formData.categoria}
                  onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="Suplementos">Suplementos</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Snacks">Snacks / Barras</option>
                  <option value="Accesorios">Accesorios</option>
                  <option value="Ropa">Ropa deportiva</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Descripción</label>
                <textarea 
                  className="textarea textarea-bordered w-full" 
                  placeholder="Detalles del producto..." 
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1">Precio *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    className="input input-bordered w-full" 
                    placeholder="0.00" 
                    value={formData.precio}
                    onChange={e => setFormData({ ...formData, precio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1">Stock</label>
                  <input 
                    type="number" 
                    className="input input-bordered w-full" 
                    placeholder="0" 
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1">Mínimo</label>
                  <input 
                    type="number" 
                    className="input input-bordered w-full" 
                    placeholder="5" 
                    value={formData.stock_minimo}
                    onChange={e => setFormData({ ...formData, stock_minimo: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Estado</label>
                <select 
                  className="input input-bordered w-full"
                  value={formData.estado}
                  onChange={e => setFormData({ ...formData, estado: Number(e.target.value) })}
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

      {/* Modal Reabastecer Inventario (sp_registrar_compra_inventario) */}
      <dialog className={`modal ${showModalCompra ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-md flex flex-col">
          <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-200">
            <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
              <Truck size={20} className="text-emerald-400" />
              Reabastecer (sp_registrar_compra_inventario)
            </h3>
            <button type="button" onClick={() => setShowModalCompra(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleRegistrarCompraInventario} className="flex flex-col flex-1">
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-400">
                Registra la compra a proveedor y actualiza automáticamente el stock disponible en la base de datos.
              </p>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Producto a Reabastecer *</label>
                <select 
                  className="input input-bordered w-full font-semibold"
                  value={compraData.id_producto}
                  onChange={e => {
                    const sel = productos.find(p => p.id === Number(e.target.value));
                    setCompraData({ 
                      ...compraData, 
                      id_producto: Number(e.target.value),
                      costo: sel ? Math.round(Number(sel.precio) * 0.6) : compraData.costo
                    });
                  }}
                >
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (Stock actual: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1">Cantidad a Comprar *</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    className="input input-bordered w-full font-bold"
                    value={compraData.cantidad}
                    onChange={e => setCompraData({ ...compraData, cantidad: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1">Costo Unitario ($) *</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="input input-bordered w-full font-bold"
                    value={compraData.costo}
                    onChange={e => setCompraData({ ...compraData, costo: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="p-3 bg-base-200 rounded-lg flex justify-between items-center text-sm font-bold">
                <span className="text-gray-400">Total de Compra:</span>
                <span className="text-emerald-400 text-base">
                  ${(compraData.cantidad * compraData.costo).toFixed(2)} MXN
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-base-200 flex justify-end gap-3 bg-base-200">
              <button type="button" onClick={() => setShowModalCompra(false)} className="btn btn-ghost">Cancelar</button>
              <button type="submit" className="btn btn-primary flex items-center gap-1">
                <CheckCircle2 size={16} /> Confirmar Entrada
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
