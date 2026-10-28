import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X, Package, AlertTriangle, Truck, ArrowDownCircle, CheckCircle2 } from 'lucide-react';
import '../../CSS/Productos.css';
import { getProductos, createProductos, updateProductos, deleteProductos } from '../../JS/producto';
import { createCompra } from '../../JS/compra';
import Toast from '../Componentes/Toast';
import ConfirmModal from '../Componentes/ConfirmModal';

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

  // Estados modal Reabastecer Inventario
  const [showModalCompra, setShowModalCompra] = useState(false);
  const [busquedaReabastecer, setBusquedaReabastecer] = useState('');
  const [productosFiltradosReabastecer, setProductosFiltradosReabastecer] = useState([]);
  const [compraData, setCompraData] = useState({
    id_producto: '',
    id_proveedor: 1,
    cantidad: 10,
    costo: 50
  });

  // Modal de Confirmación personalizada para eliminar (sin alert/confirm de localhost)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });

  // useEffect para el buscador en tiempo real dentro del modal de Reabastecer
  useEffect(() => {
    if (!showModalCompra) {
      setBusquedaReabastecer('');
      return;
    }
    const q = busquedaReabastecer.toLowerCase().trim();
    if (!q) {
      setProductosFiltradosReabastecer(productos);
    } else {
      setProductosFiltradosReabastecer(
        productos.filter(p => 
          p.nombre?.toLowerCase().includes(q) ||
          p.categoria?.toLowerCase().includes(q) ||
          String(p.id).includes(q)
        )
      );
    }
  }, [busquedaReabastecer, productos, showModalCompra]);

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
      if (Array.isArray(data)) {
        // Filtrar exclusivamente los productos del catálogo (tienen categoria o stock, y no son planes)
        const prodsReales = data.filter(p => (p.categoria !== null && p.categoria !== undefined && p.categoria !== '') || (p.stock !== null && p.stock !== undefined && (p.duracion_dias === null || p.duracion_dias === undefined)));
        if (prodsReales.length > 0) {
          const adaptados = prodsReales.map(p => ({
            ...p,
            precio: Number(p.precio) || 0,
            stock: Number(p.stock) || 0,
            stock_minimo: Number(p.stock_minimo) || 5,
            estado: esEstadoActivo(p.estado) ? 1 : 0
          }));
          setProductos(adaptados);
          localStorage.setItem('gymton_productos', JSON.stringify(adaptados));
          return;
        }
      }
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
        { id: 5, nombre: 'Shaker Mezclador 700ml', categoria: 'Accesorios', descripcion: 'Vaso con bola mezcladora de acero', precio: 140, stock: 2, stock_minimo: 5, estado: 0 },
        { id: 6, nombre: 'Creatina Julio', categoria: 'Snacks', descripcion: 'Te va a hacer un tinaco man', precio: 100, stock: 498, stock_minimo: 5, estado: 1 }
      ];
      setProductos(fallback);
      localStorage.setItem('gymton_productos', JSON.stringify(fallback));
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
    const prodActualizado = { ...p, estado: "1" };
    const nuevaLista = productos.map(item => item.id === p.id ? prodActualizado : item);
    setProductos(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateProductos(p.id, prodActualizado);
      mostrarAlerta(`Producto "${p.nombre}" activado correctamente`, 'success');
    } catch (e) {
      console.error(e);
      mostrarAlerta('Puesto en activo localmente', 'warning');
    }
  };

  // ACCIÓN: Dar de baja
  const handleDarDeBaja = async (p) => {
    const prodActualizado = { ...p, estado: "0" };
    const nuevaLista = productos.map(item => item.id === p.id ? prodActualizado : item);
    setProductos(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateProductos(p.id, prodActualizado);
      mostrarAlerta(`Producto "${p.nombre}" dado de baja correctamente`, 'info');
    } catch (e) {
      console.error(e);
      mostrarAlerta('Dado de baja localmente', 'warning');
    }
  };

  const handleToggleEstado = (p) => {
    const esActivo = esEstadoActivo(p.estado);
    if (esActivo) handleDarDeBaja(p);
    else handlePonerEnActivo(p);
  };

  // Solicitar confirmación con Modal en pantalla (reemplaza window.confirm)
  const pedirConfirmacionEliminar = (id, nombre) => {
    setConfirmModal({
      isOpen: true,
      id,
      nombre: nombre || 'este producto'
    });
  };

  // Ejecutar eliminación confirmada en BD vía API
  const confirmarEliminar = async () => {
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try {
      await deleteProductos(id);
      const nuevaLista = productos.filter(p => p.id !== id);
      setProductos(nuevaLista);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Registro eliminado correctamente', 'success');
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al eliminar producto', 'error');
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
        const { id, ...createData } = payload;
        const res = await createProductos(createData);
        const nuevo = (res && res.id) ? { ...payload, id: res.id } : { ...payload, id: Date.now() };
        guardarLocalmente([nuevo, ...productos]);
        mostrarAlerta('Registro completado correctamente', 'success');
      } else {
        try {
          await updateProductos(formData.id, payload);
        } catch (errPut) {
          console.warn('PUT falló para producto, registrando:', errPut);
          const { id, ...createData } = payload;
          const res = await createProductos(createData);
          if (res && res.id) payload.id = res.id;
        }
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
      // Registrar la compra en la base de datos / historial
      await createCompra({
        id_usuario: usuarioActivo?.id || 1,
        id_proveedor: 1,
        id_producto: idProd,
        cantidad: cant,
        costo_unitario: costo,
        total: cant * costo,
        estado: 'Registrada'
      });
      const lista = productos.map(p => p.id === idProd ? prodActualizado : p);
      guardarLocalmente(lista);
      setShowModalCompra(false);
      mostrarAlerta(`Entrada de inventario registrada: +${cant} uds. para "${prod.nombre}"`, 'success');
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
      <Toast alerta={alerta} onClose={() => setAlerta(null)} />

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

      {/* Alerta de Stock Mínimo */}
      {bajoStockCount > 0 && (
        <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4 text-amber-300">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-amber-400 flex-shrink-0 animate-bounce" />
            <div>
              <strong className="block text-sm font-bold">
                Alerta de Stock Mínimo
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
          {/* Tab de Stock Bajo */}
          <button 
            className={`productos-filter-btn ${filtro === 'bajo_stock' ? 'active bg-amber-500 text-black border-none' : 'inactive'}`} 
            onClick={() => setFiltro('bajo_stock')}
          >
            ⚠️ Stock Bajo ({bajoStockCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Reabastecer */}
          <button 
            className="btn btn-sm bg-zinc-800 text-emerald-400 border border-zinc-700 hover:bg-zinc-700 font-bold flex items-center gap-1.5"
            onClick={() => openModalCompra()}
            title="Registrar entrada de mercancía / compra a proveedor"
          >
            <Truck size={16} /> Reabastecer Stock
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
              <th style={{ width: '22%' }}>Producto</th>
              <th style={{ width: '13%' }}>Categoría</th>
              <th style={{ width: '23%' }}>Descripción</th>
              <th style={{ width: '13%' }}>Precio (MXN)</th>
              <th style={{ width: '13%' }}>Stock Disponible</th>
              <th style={{ width: '8%' }}>Estado</th>
              <th style={{ width: '8%', textAlign: 'right' }}>Opciones</th>
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
                        <Package size={16} className={stockBajo ? 'text-amber-400' : 'text-emerald-500'} /> 
                        {p.nombre}
                      </span>
                    </td>
                    <td>
                      <span className="productos-cat-pill">
                        {p.categoria || 'General'}
                      </span>
                    </td>
                    <td className="text-gray-500 text-sm">{p.descripcion || 'Sin descripción'}</td>
                    <td className="font-bold text-emerald-600">${Number(p.precio).toFixed(1)} MXN</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center font-bold text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
                          stockBajo 
                            ? 'bg-red-500/10 text-red-600 border border-red-500/30' 
                            : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                        }`}>
                          {stockBajo && <AlertTriangle size={12} className="mr-1 text-red-500" />}
                          {p.stock}
                        </span>
                        {stockBajo && (
                          <button 
                            className="p-1 rounded-md text-amber-500 hover:bg-amber-100 transition-colors"
                            title="Reabastecer stock de este producto"
                            onClick={() => openModalCompra(p)}
                          >
                            <ArrowDownCircle size={16} />
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
                    <td style={{ textAlign: 'right' }}>
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
                        <button 
                          className="productos-action-btn delete" 
                          title="Eliminar producto" 
                          onClick={() => pedirConfirmacionEliminar(p.id, p.nombre)}
                        >
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

      {/* Modal Reabastecer Inventario con buscador en tiempo real */}
      <dialog className={`modal ${showModalCompra ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-lg flex flex-col">
          <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-200">
            <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
              <Truck size={20} className="text-emerald-400" />
              Reabastecer Inventario
            </h3>
            <button type="button" onClick={() => setShowModalCompra(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleRegistrarCompraInventario} className="flex flex-col flex-1">
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-400">
                Selecciona el producto mediante el buscador en tiempo real y registra la entrada de stock a la base de datos.
              </p>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Buscar Producto a Reabastecer *
                </label>
                {/* Buscador en tiempo real con useEffect */}
                <div className="relative mb-2">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    className="input input-bordered input-sm w-full pl-9 pr-8 text-sm"
                    placeholder="Escribe el nombre o categoría para buscar rápido..."
                    value={busquedaReabastecer}
                    onChange={e => setBusquedaReabastecer(e.target.value)}
                  />
                  {busquedaReabastecer && (
                    <button 
                      type="button" 
                      onClick={() => setBusquedaReabastecer('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Lista interactiva de productos filtrados en tiempo real */}
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border border-base-300 rounded-xl p-2 bg-base-200/50">
                  {productosFiltradosReabastecer.length === 0 ? (
                    <div className="text-xs text-gray-400 py-4 text-center">
                      No se encontraron productos coincidentes
                    </div>
                  ) : (
                    productosFiltradosReabastecer.map(p => {
                      const isSelected = Number(compraData.id_producto) === Number(p.id);
                      const stockCritico = esInventarioBajo(p);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => {
                            setCompraData({
                              ...compraData,
                              id_producto: p.id,
                              costo: Math.round(Number(p.precio) * 0.6) || compraData.costo
                            });
                          }}
                          className={`p-2.5 rounded-lg cursor-pointer text-xs flex justify-between items-center transition-all ${
                            isSelected 
                              ? 'bg-primary/20 text-white font-bold border border-primary/50 shadow-sm' 
                              : 'hover:bg-base-300 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Package size={14} className={stockCritico ? 'text-amber-400' : 'text-emerald-400'} />
                            <span className="truncate">{p.nombre}</span>
                            <span className="text-[10px] text-gray-400">({p.categoria || 'General'})</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              stockCritico ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              Stock: {p.stock} uds.
                            </span>
                            {isSelected && <CheckCircle2 size={15} className="text-primary flex-shrink-0" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Confirmación del producto seleccionado */}
                {compraData.id_producto && (
                  <div className="mt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    Seleccionado: {productos.find(p => p.id === Number(compraData.id_producto))?.nombre}
                  </div>
                )}
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
              <button 
                type="submit" 
                disabled={!compraData.id_producto}
                className="btn btn-primary flex items-center gap-1"
              >
                <CheckCircle2 size={16} /> Confirmar Entrada
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Modal de Advertencia y Confirmación al Centro de Pantalla */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar Producto?"
        message={`¿Estás seguro de que deseas eliminar permanentemente "${confirmModal.nombre}" del inventario? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Producto"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, nombre: '' })}
        tipo="danger"
      />
    </div>
  );
}
