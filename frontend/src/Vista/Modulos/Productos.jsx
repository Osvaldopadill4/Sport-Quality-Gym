import React from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Power,
  X,
  Package,
  AlertTriangle,
  Truck,
  ArrowDownCircle
} from 'lucide-react';
import '../../CSS/Productos.css';
import Toast from '../Extras/Toast';
import ConfirmModal from '../Extras/ConfirmModal';
import { ModalFormProducto, ModalReabastecerStock } from '../Extras/Modales/ModalesProducto';
import { useProductos } from '../../Reutilizable/useProductos';
import { esInventarioBajo as checkInventarioBajo } from '../../Reutilizable/objetosSQL';

export const esInventarioBajo = checkInventarioBajo;

export default function Productos({ loggedUser }) {
  const {
    usuarioActivo,
    productos,
    filtro,
    setFiltro,
    busqueda,
    setBusqueda,
    alerta,
    setAlerta,
    showModal,
    setShowModal,
    modalMode,
    formData,
    setFormData,
    proveedores,
    showModalCompra,
    setShowModalCompra,
    busquedaReabastecer,
    setBusquedaReabastecer,
    productosFiltradosReabastecer,
    compraData,
    setCompraData,
    confirmModal,
    setConfirmModal,
    total,
    activos,
    inactivos,
    bajoStockCount,
    getRolName,
    handleToggleEstado,
    pedirConfirmacionEliminar,
    confirmarEliminar,
    openModal,
    openModalCompra,
    handleSave,
    handleRegistrarCompraInventario,
    confirmRestockModal,
    setConfirmRestockModal,
    confirmarReabastecimiento,
    productosFiltrados,
    esEstadoActivo,
    esInventarioBajo: esBajo
  } = useProductos({ loggedUser });

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

      {/* Alerta de Stock Mínimo (Vista SQL `vw_inventario_bajo`) */}
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

      {/* Tabs y Botones */}
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
          <button
            className={`productos-filter-btn ${filtro === 'bajo_stock' ? 'active bg-amber-500 text-black border-none' : 'inactive'}`}
            onClick={() => setFiltro('bajo_stock')}
          >
            ⚠️ Stock Bajo ({bajoStockCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
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
                const stockBajo = esBajo(p);
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
                          <Edit size={16} />
                        </button>
                        <button
                          className={`productos-action-btn ${esActivo ? 'power-off' : 'power-on'}`}
                          title={esActivo ? 'Dar de baja' : 'Poner en activo'}
                          onClick={() => handleToggleEstado(p)}
                        >
                          <Power size={16} />
                        </button>
                        <button
                          className="productos-action-btn delete"
                          title="Eliminar producto"
                          onClick={() => pedirConfirmacionEliminar(p.id, p.nombre)}
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

      {/* Modales extraídos en `Vista/Extras/Modales/ModalesProducto.jsx` */}
      <ModalFormProducto
        showModal={showModal}
        setShowModal={setShowModal}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
      />

      <ModalReabastecerStock
        showModalCompra={showModalCompra}
        setShowModalCompra={setShowModalCompra}
        compraData={compraData}
        setCompraData={setCompraData}
        proveedores={proveedores}
        productos={productos}
        busquedaReabastecer={busquedaReabastecer}
        setBusquedaReabastecer={setBusquedaReabastecer}
        productosFiltradosReabastecer={productosFiltradosReabastecer}
        handleRegistrarCompraInventario={handleRegistrarCompraInventario}
        esInventarioBajo={esBajo}
      />

      <ConfirmModal
        isOpen={confirmRestockModal.isOpen}
        title="¿Estás seguro de reabastecer?"
        message={
          confirmRestockModal.data ? (
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center text-sm py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Producto:</span>
                <span className="font-bold text-white">{confirmRestockModal.data.prodNombre}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Proveedor:</span>
                <span className="font-medium text-emerald-400">{confirmRestockModal.data.nombreProveedor}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Unidades a ingresar:</span>
                <span className="font-bold text-emerald-400">+{confirmRestockModal.data.cant} uds.</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Costo unitario:</span>
                <span className="font-mono text-zinc-300">${confirmRestockModal.data.costo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-base py-1">
                <span className="font-bold text-white">Inversión total:</span>
                <span className="text-2xl font-black text-emerald-400">${confirmRestockModal.data.totalCompra.toFixed(2)}</span>
              </div>
            </div>
          ) : null
        }
        confirmText="Confirmar Reabastecimiento"
        cancelText="Volver"
        tipo="success"
        onConfirm={confirmarReabastecimiento}
        onCancel={() => setConfirmRestockModal({ isOpen: false, data: null })}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar Producto?"
        message={`¿Estás seguro de que deseas eliminar permanentemente el producto "${confirmModal.nombre}" del sistema? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Producto"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, nombre: '' })}
        tipo="danger"
      />
    </div>
  );
}
