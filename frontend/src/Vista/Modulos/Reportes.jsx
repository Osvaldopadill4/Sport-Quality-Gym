import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Truck,
  Calculator,
  Search,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CheckCircle2,
  CreditCard,
  Banknote,
  Tag,
  User
} from 'lucide-react';
import { useReportes } from '../../Reutilizable/useReportes';

export default function Reportes({ loggedUser }) {
  const {
    tabActiva,
    setTabActiva,
    subFiltroVentas,
    setSubFiltroVentas,
    cortes,
    busqueda,
    setBusqueda,
    filtroFecha,
    setFiltroFecha,
    metricas,
    ventasFiltradas,
    comprasFiltradas,
    clasificarVenta,
    resolverNombreClienteVenta,
    resolverDatosCompra,
    resolverCajeroCorte,
    handleImprimir
  } = useReportes({ loggedUser });

  return (
    <div className="reportes-wrapper p-6 bg-zinc-950 min-h-screen text-gray-200">
      {/* Encabezado */}
      <div className="gym-header-box mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="text-emerald-400 w-7 h-7" /> Reportes Financieros y Auditoría
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Métricas separadas de ventas de tienda, renovaciones de membresías, adquisiciones a proveedores y cortes de caja.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-zinc-800 rounded-xl p-1 border border-zinc-700">
            {[
              { id: 'hoy', label: 'Hoy' },
              { id: 'semana', label: '7 Días' },
              { id: 'mes', label: '30 Días' },
              { id: 'todos', label: 'Histórico' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFiltroFecha(f.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filtroFecha === f.id ? 'bg-emerald-500 text-black shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleImprimir}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold border border-zinc-700 transition-all shadow"
          >
            <Printer size={15} /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400 uppercase font-semibold">
            <span>Ingresos Totales (Ventas)</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><DollarSign size={16} /></span>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ${metricas.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" />
            {metricas.cantidadTickets} tickets ({metricas.ticketsMembresias} membresías, {metricas.ticketsProductos} tienda)
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400 uppercase font-semibold">
            <span>Inversión Inventario (Compras)</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><Truck size={16} /></span>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ${metricas.totalCompras.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <ArrowDownRight size={12} className="text-amber-400" />
            {metricas.cantidadCompras} órdenes de reabastecimiento
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400 uppercase font-semibold">
            <span>Margen Bruto Estimado</span>
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-xl"><TrendingUp size={16} /></span>
          </div>
          <div className={`text-2xl font-black mt-2 ${metricas.margenEstimado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${metricas.margenEstimado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} className="text-blue-400" />
            Flujo neto (Ventas - Costos de Compra)
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400 uppercase font-semibold">
            <span>Líneas de Negocio</span>
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-xl"><Tag size={16} /></span>
          </div>
          <div className="mt-2 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-zinc-300">
              <span className="flex items-center gap-1"><CreditCard size={12} className="text-purple-400" /> Membresías:</span>
              <span className="font-bold text-purple-300">${metricas.ingresosMembresias.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-300">
              <span className="flex items-center gap-1"><ShoppingBag size={12} className="text-emerald-400" /> Tienda / Mostrador:</span>
              <span className="font-bold text-emerald-400">${metricas.ingresosProductos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas / Tablas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap border-b border-zinc-800 pb-2 w-full sm:w-auto">
          <button
            onClick={() => setTabActiva('ventas')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
              tabActiva === 'ventas'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <ShoppingBag size={14} /> Reporte de Ventas ({ventasFiltradas.length})
          </button>

          <button
            onClick={() => setTabActiva('compras')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
              tabActiva === 'compras'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Truck size={14} /> Reporte de Compras ({comprasFiltradas.length})
          </button>

          <button
            onClick={() => setTabActiva('cortes')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
              tabActiva === 'cortes'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Calculator size={14} /> Auditoría de Cortes ({cortes.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {tabActiva === 'ventas' && (
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSubFiltroVentas('todas')}
                className={`px-2.5 py-1 rounded-lg transition-all ${subFiltroVentas === 'todas' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setSubFiltroVentas('membresias')}
                className={`px-2.5 py-1 rounded-lg transition-all ${subFiltroVentas === 'membresias' ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'text-zinc-400 hover:text-white'}`}
              >
                Membresías ({metricas.ticketsMembresias})
              </button>
              <button
                type="button"
                onClick={() => setSubFiltroVentas('productos')}
                className={`px-2.5 py-1 rounded-lg transition-all ${subFiltroVentas === 'productos' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'text-zinc-400 hover:text-white'}`}
              >
                Tienda ({metricas.ticketsProductos})
              </button>
            </div>
          )}

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              placeholder="Filtrar por folio, socio, proveedor o producto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contenido de la Tabla Seleccionada */}
      <div className="gym-table-card">
        {tabActiva === 'ventas' && (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="table table-zebra w-full min-w-[820px] text-xs">
              <thead className="bg-zinc-800 text-zinc-400 uppercase font-black sticky top-0 z-10 border-b border-zinc-700">
                <tr>
                  <th className="py-3 px-4">Folio Ticket</th>
                  <th className="py-3 px-3">Fecha y Hora</th>
                  <th className="py-3 px-3">Cliente / Socio</th>
                  <th className="py-3 px-3">Línea / Tipo</th>
                  <th className="py-3 px-3">Concepto / Detalle</th>
                  <th className="py-3 px-3 text-center">Método</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-right">Descuento</th>
                  <th className="py-3 px-4 text-right">Total Cobrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {ventasFiltradas.length > 0 ? (
                  ventasFiltradas.map((v, i) => {
                    const info = clasificarVenta(v);
                    const nombreSocio = resolverNombreClienteVenta(v);
                    return (
                      <tr key={v.id || v.folio || i} className="gym-table-tr">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {v.folio || `FOL-${v.id}`}
                        </td>
                        <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                          {v.fecha || 'N/A'}
                        </td>
                        <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                          {nombreSocio}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {info.esMembresia ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              <CreditCard size={11} /> {info.esMixta ? 'Membresía + Tienda' : 'Venta Membresía'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <ShoppingBag size={11} /> Venta Producto
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-zinc-300 max-w-[220px] truncate" title={info.conceptoResumen}>
                          {info.conceptoResumen}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            (v.metodo_pago || '').toLowerCase() === 'efectivo'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {(v.metodo_pago || '').toLowerCase() === 'efectivo' ? <Banknote size={11} /> : <CreditCard size={11} />}
                            {v.metodo_pago || 'Efectivo'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-zinc-400">
                          ${Number(v.subtotal || v.total || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right text-amber-400">
                          -${Number(v.descuento || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-white text-sm">
                          ${Number(v.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-zinc-500 italic">
                      No se encontraron registros de ventas para el filtro seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tabActiva === 'compras' && (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="table table-zebra w-full min-w-[780px] text-xs">
              <thead className="bg-zinc-800 text-zinc-400 uppercase font-black sticky top-0 z-10 border-b border-zinc-700">
                <tr>
                  <th className="py-3 px-4">Orden</th>
                  <th className="py-3 px-3">Fecha Adquisición</th>
                  <th className="py-3 px-3">Proveedor</th>
                  <th className="py-3 px-3">Artículo / Suplemento</th>
                  <th className="py-3 px-3 text-center">Unidades</th>
                  <th className="py-3 px-3 text-right">Costo Unitario</th>
                  <th className="py-3 px-4 text-right">Inversión Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {comprasFiltradas.length > 0 ? (
                  comprasFiltradas.map((c, i) => {
                    const info = resolverDatosCompra(c);
                    return (
                      <tr key={c.id || i} className="gym-table-tr">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          COM-{String(c.id).padStart(4, '0')}
                        </td>
                        <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                          {c.fecha || 'Registrada'}
                        </td>
                        <td className="py-3 px-3 text-zinc-300 font-semibold whitespace-nowrap">
                          {info.provNombre}
                        </td>
                        <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                          {info.prodNombre}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                          +{info.cant} uds.
                        </td>
                        <td className="py-3 px-3 text-right text-zinc-300 font-mono">
                          ${info.costoUnit.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-amber-400 text-sm">
                          ${info.totalInv.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-zinc-500 italic">
                      No se encontraron compras o reabastecimientos registrados en este periodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tabActiva === 'cortes' && (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="table table-zebra w-full min-w-[780px] text-xs">
              <thead className="bg-zinc-800 text-zinc-400 uppercase font-black sticky top-0 z-10 border-b border-zinc-700">
                <tr>
                  <th className="py-3 px-4">Folio Corte</th>
                  <th className="py-3 px-3">Cajero en Turno</th>
                  <th className="py-3 px-3">Fecha / Hora</th>
                  <th className="py-3 px-3 text-center">Fondo Inicial</th>
                  <th className="py-3 px-3 text-right">Ventas Sistema</th>
                  <th className="py-3 px-3 text-right">Efectivo Físico</th>
                  <th className="py-3 px-3 text-right">Diferencia</th>
                  <th className="py-3 px-4 text-center">Estado Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {cortes.length > 0 ? (
                  cortes.map((cc, i) => {
                    const dif = Number(cc.diferencia) || 0;
                    const ventasSist = Number(cc.total_ventas ?? cc.ventas_totales ?? 0);
                    const efecReal = Number(cc.monto_real ?? cc.dinero_real ?? 0);
                    return (
                      <tr key={cc.id || i} className="gym-table-tr">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">
                          CORTE-#{cc.id}
                        </td>
                        <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <User size={12} className="text-emerald-400" />
                            {resolverCajeroCorte(cc)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                          {cc.fecha_cierre || cc.fecha_apertura || cc.fecha || 'En Curso'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-zinc-300">
                          ${Number(cc.monto_inicial || 500).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-white">
                          ${ventasSist.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">
                          ${efecReal.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          <span className={dif === 0 ? 'text-emerald-400' : dif > 0 ? 'text-blue-400' : 'text-red-400'}>
                            {dif >= 0 ? `+$${dif.toFixed(2)}` : `-$${Math.abs(dif).toFixed(2)}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                            cc.estado === 'cuadrada' || dif === 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : dif > 0
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {cc.estado || (dif === 0 ? 'Cuadrada' : dif > 0 ? 'Sobrante' : 'Faltante')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-zinc-500 italic">
                      No se han cerrado cortes de caja en el sistema todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
