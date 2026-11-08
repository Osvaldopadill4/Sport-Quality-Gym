import React from 'react';
import { Search, X, Package, Truck, CheckCircle2 } from 'lucide-react';
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
  compraData,
  setCompraData,
  busquedaReabastecer,
  setBusquedaReabastecer,
  productosFiltradosReabastecer
}) {
  return (
    <dialog className={`modal ${showModalCompra ? 'modal-open' : ''}`}>
      <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-lg flex flex-col">
        <div className="gym-modal-header-daisy">
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
              Selecciona el producto mediante el buscador en tiempo real y registra la entrada de stock al inventario.
            </p>

            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Proveedor que suministra el producto *
              </label>
              <select
                className="input input-bordered w-full text-sm font-semibold"
                value={compraData.id_proveedor}
                onChange={(e) => setCompraData({ ...compraData, id_proveedor: Number(e.target.value) })}
                required
              >
                {proveedores.length === 0 ? (
                  <option value={1}>Proveedor General</option>
                ) : (
                  proveedores.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.nombre_empresa || pr.nombre || 'Proveedor Comercial'}
                      {pr.nombre && pr.nombre_empresa ? ` — Contacto: ${pr.nombre}` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-1.5">
                Producto a Reabastecer *
              </label>

              {compraData.id_producto ? (() => {
                const prodSel = productos.find((p) => Number(p.id) === Number(compraData.id_producto));
                return (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white block truncate">
                          {prodSel ? prodSel.nombre : 'Producto Seleccionado'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Categoría: {prodSel?.categoria || 'General'} • Stock actual: <strong>{prodSel?.stock ?? 0} uds.</strong>
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCompraData({ ...compraData, id_producto: '' });
                        setBusquedaReabastecer('');
                      }}
                      className="btn btn-xs btn-outline border-zinc-600 text-gray-300 hover:text-white shrink-0"
                    >
                      Cambiar producto
                    </button>
                  </div>
                );
              })() : (
                <>
                  <div className="relative mb-2">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      maxLength={50}
                      className="input input-bordered input-sm w-full pl-9 pr-8 text-sm"
                      placeholder="Escribe el nombre o categoría del producto..."
                      value={busquedaReabastecer}
                      onChange={(e) => setBusquedaReabastecer(e.target.value.slice(0, 50))}
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

                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-base-300 rounded-xl p-2 bg-base-200/50">
                    {productosFiltradosReabastecer.length === 0 ? (
                      <div className="text-xs text-gray-400 py-3 text-center">
                        No se encontraron productos coincidentes
                      </div>
                    ) : (
                      productosFiltradosReabastecer.map((p) => {
                        const stockCritico = esInventarioBajo(p);
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setCompraData({
                                ...compraData,
                                id_producto: p.id,
                                costo: Math.max(1, Math.round(Number(p.precio) * 0.6)) || compraData.costo
                              });
                              setBusquedaReabastecer('');
                            }}
                            className="p-2 rounded-lg cursor-pointer text-xs flex justify-between items-center transition-all hover:bg-base-300 text-gray-200"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Package size={14} className={stockCritico ? 'text-amber-400' : 'text-emerald-400'} />
                              <span className="truncate font-semibold">{p.nombre}</span>
                              <span className="text-[10px] text-gray-400">({p.categoria || 'General'})</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold flex-shrink-0 ${
                              stockCritico ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              Stock: {p.stock} uds.
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Unidades Compradas * (máx. 9999)</label>
                <input
                  type="number"
                  min="1"
                  max="9999"
                  maxLength={4}
                  required
                  className="input input-bordered w-full font-bold"
                  value={compraData.cantidad}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setCompraData({ ...compraData, cantidad: raw === '' ? '' : Math.min(9999, Math.max(1, parseInt(raw, 10) || 1)) });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Costo Unitario Compra ($) * (máx. 99999)</label>
                <input
                  type="number"
                  min="0.01"
                  max="99999"
                  step="0.01"
                  required
                  className="input input-bordered w-full font-bold"
                  value={compraData.costo}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (Number(val) >= 0 && Number(val) <= 99999 && val.length <= 8)) {
                      setCompraData({ ...compraData, costo: val === '' ? '' : parseFloat(val) });
                    }
                  }}
                />
              </div>
            </div>

            <div className="p-3 bg-base-200 rounded-lg flex justify-between items-center text-sm font-bold">
              <span className="text-gray-400">Inversión Total de Compra ({Number(compraData.cantidad) || 0} uds.):</span>
              <span className="text-emerald-400 text-base">
                ${((Number(compraData.cantidad) || 0) * (Number(compraData.costo) || 0)).toFixed(2)} MXN
              </span>
            </div>
          </div>

          <div className="gym-modal-footer-daisy">
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
  );
}
