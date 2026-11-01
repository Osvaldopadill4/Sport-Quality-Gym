import React, { useState, useEffect, useMemo } from 'react';
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
  Tag
} from 'lucide-react';
import { getVenta } from '../../JS/venta';
import { getCompras } from '../../JS/compra';
import { getCorteCaja } from '../../JS/corte_caja';
import { getProductos } from '../../JS/producto';

export default function Reportes({ loggedUser }) {
  const [tabActiva, setTabActiva] = useState('ventas'); // 'ventas', 'compras', 'cortes', 'desglose'
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [cortes, setCortes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('todos'); // 'hoy', 'semana', 'mes', 'todos'
  // const [cargando, setCargando] = useState(true);

  // Cargar datos de ventas, compras y cortes
  useEffect(() => {
    const cargarTodo = async () => {
      // setCargando(true);
      try {
        const [resVentas, resCompras, resCortes, resProds] = await Promise.allSettled([
          getVenta(),
          getCompras(),
          getCorteCaja(),
          getProductos()
        ]);

        if (resVentas.status === 'fulfilled' && Array.isArray(resVentas.value)) {
          setVentas(resVentas.value);
        }
        if (resCompras.status === 'fulfilled' && Array.isArray(resCompras.value)) {
          setCompras(resCompras.value);
        }
        if (resCortes.status === 'fulfilled' && Array.isArray(resCortes.value)) {
          setCortes(resCortes.value);
        }
        if (resProds.status === 'fulfilled' && Array.isArray(resProds.value)) {
          setProductos(resProds.value);
        }
      } catch (err) {
        console.error('Error al cargar reportes:', err);
      }
    };

    cargarTodo();
  }, []);

  // Filtrado por fecha auxiliar
  const filtrarPorFecha = (fechaStr) => {
    if (filtroFecha === 'todos' || !fechaStr) return true;
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return true;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (filtroFecha === 'hoy') {
      const f = new Date(fecha);
      f.setHours(0, 0, 0, 0);
      return f.getTime() === hoy.getTime();
    }
    if (filtroFecha === 'semana') {
      const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
      return fecha >= hace7Dias;
    }
    if (filtroFecha === 'mes') {
      const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
      return fecha >= hace30Dias;
    }
    return true;
  };

  // Métricas Consolidadas
  const metricas = useMemo(() => {
    const ventasFiltradas = ventas.filter(v => filtrarPorFecha(v.fecha));
    const comprasFiltradas = compras.filter(c => filtrarPorFecha(c.fecha));

    const totalVentas = ventasFiltradas.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
    const totalCompras = comprasFiltradas.reduce((acc, c) => acc + (Number(c.total) || (Number(c.cantidad) * Number(c.costo_unitario)) || 0), 0);
    const margenEstimado = totalVentas - totalCompras;

    // Desglose de ingresos: Membresías vs Productos
    let ingresosMembresias = 0;
    let ingresosProductos = 0;

    ventasFiltradas.forEach(v => {
      if (Array.isArray(v.detalles)) {
        v.detalles.forEach(d => {
          const subt = Number(d.subtotal) || (Number(d.cantidad) * Number(d.precio_unitario)) || 0;
          const art = (d.articulo || '').toLowerCase();
          if (art.includes('membresía') || art.includes('membresia') || art.includes('plan') || art.includes('renovación') || art.includes('renovacion')) {
            ingresosMembresias += subt;
          } else {
            ingresosProductos += subt;
          }
        });
      } else {
        // Si no tiene detalle desglosado
        ingresosProductos += Number(v.total) || 0;
      }
    });

    const pagosEfectivo = ventasFiltradas.filter(v => (v.metodo_pago || '').toLowerCase() === 'efectivo').reduce((acc, v) => acc + (Number(v.total) || 0), 0);
    const pagosTarjeta = ventasFiltradas.filter(v => (v.metodo_pago || '').toLowerCase() === 'tarjeta').reduce((acc, v) => acc + (Number(v.total) || 0), 0);

    return {
      totalVentas,
      totalCompras,
      margenEstimado,
      cantidadTickets: ventasFiltradas.length,
      cantidadCompras: comprasFiltradas.length,
      ingresosMembresias,
      ingresosProductos,
      pagosEfectivo,
      pagosTarjeta
    };
  }, [ventas, compras, filtroFecha]);

  // Lista de ventas filtrada por buscador y fecha
  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      const pasaFecha = filtrarPorFecha(v.fecha);
      const b = busqueda.toLowerCase();
      const pasaBusqueda = !busqueda || 
        (v.folio && v.folio.toLowerCase().includes(b)) ||
        (v.cliente && v.cliente.toLowerCase().includes(b)) ||
        (v.empleado && v.empleado.toLowerCase().includes(b));
      return pasaFecha && pasaBusqueda;
    });
  }, [ventas, busqueda, filtroFecha]);

  // Lista de compras filtrada por buscador y fecha
  const comprasFiltradas = useMemo(() => {
    return compras.filter(c => {
      const pasaFecha = filtrarPorFecha(c.fecha);
      const b = busqueda.toLowerCase();
      const prodNombre = productos.find(p => p.id === c.id_producto)?.nombre || '';
      const pasaBusqueda = !busqueda || 
        (c.id && String(c.id).includes(b)) ||
        prodNombre.toLowerCase().includes(b);
      return pasaFecha && pasaBusqueda;
    });
  }, [compras, productos, busqueda, filtroFecha]);

  // Función para imprimir reporte
  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="reportes-wrapper p-6 bg-zinc-950 min-h-screen text-gray-200">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="text-emerald-400 w-7 h-7" /> Reportes Financieros y Auditoría
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Métricas de ventas, costo de adquisiciones (compras), cortes de caja y separación de líneas de negocio.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Selector de Rango de Fecha */}
          <div className="flex items-center bg-zinc-800 rounded-xl p-1 border border-zinc-700">
            <button
              onClick={() => setFiltroFecha('hoy')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filtroFecha === 'hoy' ? 'bg-emerald-500 text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setFiltroFecha('semana')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filtroFecha === 'semana' ? 'bg-emerald-500 text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              7 Días
            </button>
            <button
              onClick={() => setFiltroFecha('mes')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filtroFecha === 'mes' ? 'bg-emerald-500 text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              30 Días
            </button>
            <button
              onClick={() => setFiltroFecha('todos')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filtroFecha === 'todos' ? 'bg-emerald-500 text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Histórico
            </button>
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
        
        {/* Total Ventas */}
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
            {metricas.cantidadTickets} tickets generados
          </div>
        </div>

        {/* Total Compras */}
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

        {/* Margen Operativo */}
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

        {/* Separación Membresías vs Productos */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400 uppercase font-semibold">
            <span>Líneas de Negocio</span>
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-xl"><Tag size={16} /></span>
          </div>
          <div className="mt-2 text-xs space-y-1">
            <div className="flex justify-between items-center text-zinc-300">
              <span className="flex items-center gap-1"><CreditCard size={12} className="text-purple-400" /> Membresías:</span>
              <span className="font-bold text-white">${metricas.ingresosMembresias.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-300">
              <span className="flex items-center gap-1"><ShoppingBag size={12} className="text-emerald-400" /> Tienda / Mostrador:</span>
              <span className="font-bold text-white">${metricas.ingresosProductos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas / Tablas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 w-full sm:w-auto">
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

        {/* Buscador de registros */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            placeholder="Filtrar por folio, socio o producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Contenido de la Tabla Seleccionada */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
        
        {/* TABLA 1: REPORTE DE VENTAS */}
        {tabActiva === 'ventas' && (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="table table-zebra w-full min-w-[700px] text-xs">
              <thead className="bg-zinc-800 text-zinc-400 uppercase font-black sticky top-0 z-10 border-b border-zinc-700">
                <tr>
                  <th className="py-3 px-4">Folio Ticket</th>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Cliente / Socio</th>
                  <th className="py-3 px-3 text-center">Método</th>
                  <th className="py-3 px-3 text-center">Items</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-right">Descuento</th>
                  <th className="py-3 px-4 text-right">Total Cobrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {ventasFiltradas.length > 0 ? (
                  ventasFiltradas.map((v, i) => (
                    <tr key={v.id || v.folio || i} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {v.folio || `FOL-${v.id}`}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                        {v.fecha || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                        {v.cliente || 'Público General'}
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
                      <td className="py-3 px-3 text-center text-zinc-300">
                        {Array.isArray(v.detalles) ? v.detalles.length : 1}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-zinc-500 italic">
                      No se encontraron registros de ventas para el filtro seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA 2: REPORTE DE COMPRAS */}
        {tabActiva === 'compras' && (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="table table-zebra w-full min-w-[700px] text-xs">
              <thead className="bg-zinc-800 text-zinc-400 uppercase font-black sticky top-0 z-10 border-b border-zinc-700">
                <tr>
                  <th className="py-3 px-4">ID Orden</th>
                  <th className="py-3 px-4">Fecha Adquisición</th>
                  <th className="py-3 px-4">Artículo / Suplemento</th>
                  <th className="py-3 px-3 text-center">Unidades</th>
                  <th className="py-3 px-3 text-right">Costo Unitario</th>
                  <th className="py-3 px-4 text-right">Inversión Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {comprasFiltradas.length > 0 ? (
                  comprasFiltradas.map((c, i) => {
                    const prodNombre = productos.find(p => p.id === c.id_producto)?.nombre || `Producto #${c.id_producto}`;
                    const costoUnit = Number(c.costo_unitario) || 0;
                    const cant = Number(c.cantidad) || 0;
                    const totalInv = Number(c.total) || (cant * costoUnit);

                    return (
                      <tr key={c.id || i} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          COM-#{c.id}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                          {c.fecha || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          {prodNombre}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                          +{cant} uds.
                        </td>
                        <td className="py-3 px-3 text-right text-zinc-400">
                          ${costoUnit.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-amber-400 text-sm">
                          ${totalInv.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-zinc-500 italic">
                      No se encontraron compras o reabastecimientos registrados en este periodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA 3: AUDITORÍA DE CORTES DE CAJA */}
        {tabActiva === 'cortes' && (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="table table-zebra w-full min-w-[700px] text-xs">
              <thead className="bg-zinc-800 text-zinc-400 uppercase font-black sticky top-0 z-10 border-b border-zinc-700">
                <tr>
                  <th className="py-3 px-4">Folio Corte</th>
                  <th className="py-3 px-4">Fecha / Hora</th>
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
                    return (
                      <tr key={cc.id || i} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">
                          CORTE-#{cc.id}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                          {cc.fecha || cc.fecha_cierre || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-zinc-300">
                          ${Number(cc.monto_inicial || 500).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-white">
                          ${Number(cc.ventas_totales || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">
                          ${Number(cc.dinero_real || 0).toFixed(2)}
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
                    <td colSpan="7" className="text-center py-10 text-zinc-500 italic">
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
