import React from 'react';
import { Search, X, Package, Truck, CheckCircle2, Trash2, Plus, Building } from 'lucide-react';
import { esInventarioBajo } from '../../../Reutilizable/objetosSQL';

export function ModalFormProducto({
  showModal,
  setShowModal,
  modalMode,
  handleSave,
  formData,
  setFormData
}) {
  return (
    <dialog className={`modal ${showModal ? 'modal-open' : ''}`}>
      <div className="gym-modal-box-daisy">
        <div className="gym-modal-header-daisy">
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
              <label className="block text-sm font-medium text-base-content mb-1">Nombre * (máx. 20 caracteres)</label>
              <input
                type="text"
                required
                maxLength={20}
                className="input input-bordered w-full"
                placeholder="Ej. Creatina Creapure"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value.slice(0, 20) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content mb-1">Categoría</label>
              <select
                className="input input-bordered w-full"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              >
                <option value="Suplementos">Suplementos</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Snacks">Snacks / Barras</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Ropa">Ropa deportiva</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content mb-1">Descripción (máx. 100 caracteres)</label>
              <textarea
                maxLength={100}
                className="textarea textarea-bordered w-full"
                placeholder="Detalles del producto..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value.slice(0, 100) })}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Precio * (máx. 99999)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="99999"
                  required
                  className="input input-bordered w-full"
                  placeholder="0.00"
                  value={formData.precio}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (Number(val) >= 0 && Number(val) <= 99999 && val.length <= 8)) {
                      setFormData({ ...formData, precio: val });
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Stock (máx. 5 cifras)</label>
                <input
                  type="number"
                  min="0"
                  max="99999"
                  className="input input-bordered w-full"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setFormData({ ...formData, stock: raw });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Mínimo (máx. 4 cifras)</label>
                <input
                  type="number"
                  min="0"
                  max="9999"
                  className="input input-bordered w-full"
                  placeholder="5"
                  value={formData.stock_minimo}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setFormData({ ...formData, stock_minimo: raw });
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content mb-1">Estado</label>
              <select
                className="input input-bordered w-full"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: Number(e.target.value) })}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>
          <div className="gym-modal-footer-daisy">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {modalMode === 'create' ? 'Agregar Producto' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export function ModalReabastecerStock({
  showModalCompra,
  setShowModalCompra,
  handleRegistrarCompraInventario,
  proveedores,
  productos,
  busquedaProveedor,
  setBusquedaProveedor,
  proveedorSeleccionado,
  setProveedorSeleccionado,
  proveedoresFiltrados,
  itemsReabastecer,
  agregarItemReabastecer,
  eliminarItemReabastecer,
  totalReabastecer,
  busquedaReabastecer,
  setBusquedaReabastecer,
  productoSeleccionadoCompra,
  setProductoSeleccionadoCompra,
  productosFiltradosReabastecer,
  cantidadInput,
  setCantidadInput,
  costoInput,
  setCostoInput
}) {
  if (!showModalCompra) return null;

  return (
    <dialog className={`modal ${showModalCompra ? 'modal-open' : ''}`}>
      <div className="modal-box bg-zinc-950 border border-zinc-800 text-gray-200 p-0 overflow-hidden max-w-2xl flex flex-col shadow-2xl max-h-[92vh]">
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Truck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                Reabastecer Inventario (Orden de Compra)
              </h3>
              <p className="text-xs text-zinc-400">
                Selecciona el proveedor y los productos a ingresar para emitir un ticket unificado.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowModalCompra(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* PASO 1: SELECCIÓN DEL PROVEEDOR CON BUSCADOR EN TIEMPO REAL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <Building size={14} /> 1. Proveedor que Suministra *
            </label>

            {proveedorSeleccionado ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block truncate">
                      {proveedorSeleccionado.nombre_empresa || proveedorSeleccionado.nombre || 'Proveedor Comercial'}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Contacto: {proveedorSeleccionado.nombre || 'Comercial'} • Tel: {proveedorSeleccionado.telefono || 'N/A'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProveedorSeleccionado(null);
                    setBusquedaProveedor('');
                  }}
                  className="btn btn-xs btn-outline border-zinc-700 text-zinc-300 hover:text-white shrink-0"
                >
                  Cambiar Proveedor
                </button>
              </div>
            ) : (
              <div>
                <div className="relative mb-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    maxLength={50}
                    className="input input-sm w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
                    placeholder="Escribe el nombre de la empresa, contacto o teléfono..."
                    value={busquedaProveedor}
                    onChange={(e) => setBusquedaProveedor(e.target.value)}
                  />
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 border border-zinc-800 rounded-xl p-1.5 bg-zinc-900/60">
                  {proveedoresFiltrados.length === 0 ? (
                    <div className="text-xs text-zinc-500 py-2 text-center">
                      No se encontraron proveedores
                    </div>
                  ) : (
                    proveedoresFiltrados.map((pr) => (
                      <div
                        key={pr.id}
                        onClick={() => {
                          setProveedorSeleccionado(pr);
                          setBusquedaProveedor('');
                        }}
                        className="p-2 rounded-lg cursor-pointer text-xs flex justify-between items-center hover:bg-zinc-800 text-zinc-300 transition-colors"
                      >
                        <div className="font-semibold text-white">
                          {pr.nombre_empresa || pr.nombre}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {pr.nombre ? `Contacto: ${pr.nombre}` : ''}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PASO 2: AGREGAR PRODUCTOS A LA ORDEN */}
          <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-2xl space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Package size={14} /> 2. Seleccionar Producto para Agregar a la Orden
            </label>

            {productoSeleccionadoCompra ? (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Package size={18} className="text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block truncate">
                      {productoSeleccionadoCompra.nombre}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Categoría: {productoSeleccionadoCompra.categoria || 'General'} • Stock actual: <strong>{productoSeleccionadoCompra.stock ?? 0} uds.</strong>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProductoSeleccionadoCompra(null);
                    setBusquedaReabastecer('');
                  }}
                  className="btn btn-xs btn-ghost text-zinc-400 hover:text-white shrink-0"
                >
                  Elegir otro producto
                </button>
              </div>
            ) : (
              <div>
                <div className="relative mb-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    maxLength={50}
                    className="input input-sm w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
                    placeholder="Buscar producto por nombre o categoría..."
                    value={busquedaReabastecer}
                    onChange={(e) => setBusquedaReabastecer(e.target.value)}
                  />
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 border border-zinc-800 rounded-xl p-1.5 bg-zinc-950">
                  {productosFiltradosReabastecer.length === 0 ? (
                    <div className="text-xs text-zinc-500 py-2 text-center">
                      No se encontraron productos coincidentes
                    </div>
                  ) : (
                    productosFiltradosReabastecer.map((p) => {
                      const stockCritico = esInventarioBajo(p);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setProductoSeleccionadoCompra(p);
                            const costoSugerido = Math.max(1, Math.round(Number(p.precio) * 0.6)) || 50;
                            setCostoInput(costoSugerido);
                            setBusquedaReabastecer('');
                          }}
                          className="p-2 rounded-lg cursor-pointer text-xs flex justify-between items-center hover:bg-zinc-800 text-zinc-300 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Package size={14} className={stockCritico ? 'text-amber-400' : 'text-emerald-400'} />
                            <span className="truncate font-semibold text-white">{p.nombre}</span>
                            <span className="text-[10px] text-zinc-500">({p.categoria || 'General'})</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            stockCritico ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            Stock: {p.stock} uds.
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Inputs de cantidad y costo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                  Cantidad (uds.):
                </label>
                <input
                  type="number"
                  min="1"
                  max="9999"
                  className="input input-sm w-full bg-zinc-950 border border-zinc-700 rounded-xl text-white font-bold"
                  value={cantidadInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setCantidadInput(raw === '' ? '' : Math.min(9999, Math.max(1, parseInt(raw, 10) || 1)));
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                  Costo Unitario ($ MXN):
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="99999"
                  step="0.01"
                  className="input input-sm w-full bg-zinc-950 border border-zinc-700 rounded-xl text-white font-bold"
                  value={costoInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (Number(val) >= 0 && Number(val) <= 99999)) {
                      setCostoInput(val === '' ? '' : parseFloat(val) || 0);
                    }
                  }}
                />
              </div>

              <div>
                <button
                  type="button"
                  disabled={!productoSeleccionadoCompra}
                  onClick={agregarItemReabastecer}
                  className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold w-full border-none flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Plus size={16} /> Agregar a la Lista
                </button>
              </div>
            </div>
          </div>

          {/* PASO 3: LISTA DE PRODUCTOS INCLUIDOS EN LA ORDEN */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                3. Productos en esta Orden ({itemsReabastecer.length})
              </label>
              <span className="text-xs font-bold text-emerald-400">
                Subtotal Orden: ${totalReabastecer.toFixed(2)} MXN
              </span>
            </div>

            {itemsReabastecer.length === 0 ? (
              <div className="p-6 border border-dashed border-zinc-800 rounded-2xl text-center text-xs text-zinc-500">
                Aún no has agregado productos a esta orden de compra. Selecciona uno arriba y haz clic en "Agregar a la Lista".
              </div>
            ) : (
              <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/50">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-800/60 uppercase font-bold text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-2.5">Producto</th>
                      <th className="p-2.5 text-center">Cant.</th>
                      <th className="p-2.5 text-right">C. Unit.</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                      <th className="p-2.5 text-center">Quitar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {itemsReabastecer.map((it) => (
                      <tr key={it.id_producto} className="hover:bg-zinc-800/40">
                        <td className="p-2.5 font-bold text-white">
                          {it.nombre}
                          <span className="block text-[10px] text-zinc-500 font-normal">
                            {it.categoria}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-emerald-400">
                          {it.cantidad} uds.
                        </td>
                        <td className="p-2.5 text-right font-mono text-zinc-300">
                          ${Number(it.costo_unitario).toFixed(2)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-white">
                          ${Number(it.subtotal).toFixed(2)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarItemReabastecer(it.id_producto)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Quitar de la orden"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="px-6 py-4 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center gap-3">
          <div>
            <span className="text-[11px] text-zinc-400 block">Inversión Total de la Orden:</span>
            <span className="text-xl font-black text-emerald-400">
              ${totalReabastecer.toFixed(2)} MXN
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowModalCompra(false)}
              className="btn btn-sm btn-ghost text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleRegistrarCompraInventario}
              disabled={!proveedorSeleccionado || itemsReabastecer.length === 0}
              className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold border-none flex items-center gap-1.5 shadow-lg disabled:opacity-40"
            >
              <CheckCircle2 size={16} /> Confirmar Entrada y Generar Ticket
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
