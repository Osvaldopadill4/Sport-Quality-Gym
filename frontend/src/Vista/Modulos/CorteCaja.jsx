import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calculator, 
  Plus, 
  Printer, 
  X, 
  DollarSign, 
  User, 
  Coins, 
  RefreshCw, 
  Search
} from 'lucide-react';
import '../../CSS/CorteCaja.css';
import { getCorteCaja, getCorteActivo, abrirCorteCaja, cerrarCorteCaja } from '../../JS/corte_caja';
import Toast from '../Componentes/Toast';

export default function CorteCaja({ loggedUser }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : { id: 1, nombre: 'Cajero / Administrador' };
    } catch {
      return { id: 1, nombre: 'Cajero / Administrador' };
    }
  })();

  const [cortes, setCortes] = useState([]);
  const [corteActivo, setCorteActivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos' | 'abiertos' | 'cerrados'

  // Modales
  const [showModalApertura, setShowModalApertura] = useState(false);
  const [showModalCierre, setShowModalCierre] = useState(false);
  const [ticketCorte, setTicketCorte] = useState(null);

  // Formulario de Apertura (Monto inicial siempre fijo de 500 pesos)
  const [formApertura, setFormApertura] = useState({
    id_usuario: usuarioActivo?.id || 1,
    monto_inicial: 500,
    observaciones: 'Fondo inicial fijo de $500.00 MXN para cambio en caja'
  });

  // Formulario y Arqueo de Cierre
  const [formCierre, setFormCierre] = useState({
    monto_real: 0,
    observaciones: ''
  });

  // Calculadora de desglose de efectivo (Arqueo)
  const [desgloseBilletes, setDesgloseBilletes] = useState({
    b1000: 0,
    b500: 0,
    b200: 0,
    b100: 0,
    b50: 0,
    b20: 0,
    monedas: 0
  });

  // Calcular ventas locales del turno actual desde el registro de ventas
  const obtenerVentasTurno = useCallback(() => {
    try {
      const ventasGuardadas = JSON.parse(localStorage.getItem('gymton_ventas') || '[]');
      const hoyStr = new Date().toISOString().split('T')[0];
      
      let totalVentas = 0;
      let totalEfectivo = 0;
      let totalTarjeta = 0;

      ventasGuardadas.forEach(v => {
        const fechaVenta = (v.fecha || '').slice(0, 10);
        if (fechaVenta === hoyStr || !v.fecha) {
          const tot = Number(v.total) || 0;
          totalVentas += tot;
          if ((v.metodo_pago || '').toLowerCase().includes('tarjeta')) {
            totalTarjeta += tot;
          } else {
            totalEfectivo += tot;
          }
        }
      });

      return { totalVentas, totalEfectivo, totalTarjeta };
    } catch {
      return { totalVentas: 0, totalEfectivo: 0, totalTarjeta: 0 };
    }
  }, []);

  // Cargar datos de la BD o API
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [lista, activo] = await Promise.all([
        getCorteCaja(),
        getCorteActivo()
      ]);

      if (Array.isArray(lista) && lista.length > 0) {
        setCortes(lista);
      } else {
        // Fallback de demostración
        setCortes([
          {
            id: 101,
            id_usuario: 1,
            cajero_nombre: 'Fabian Alvarez',
            fecha_apertura: '2026-10-21 07:00:00',
            fecha_cierre: '2026-10-21 15:00:00',
            monto_inicial: 500,
            total_ventas: 2850,
            monto_calculado: 3350,
            monto_real: 3350,
            diferencia: 0
          }
        ]);
      }

      setCorteActivo(activo);
    } catch (err) {
      console.warn('Error al cargar cortes de caja:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Actualizar monto real automáticamente cuando se usa la calculadora de billetes
  useEffect(() => {
    const totalArqueo = 
      (Number(desgloseBilletes.b1000) * 1000) +
      (Number(desgloseBilletes.b500) * 500) +
      (Number(desgloseBilletes.b200) * 200) +
      (Number(desgloseBilletes.b100) * 100) +
      (Number(desgloseBilletes.b50) * 50) +
      (Number(desgloseBilletes.b20) * 20) +
      (Number(desgloseBilletes.monedas) * 1);

    if (totalArqueo > 0) {
      setFormCierre(prev => ({ ...prev, monto_real: totalArqueo }));
    }
  }, [desgloseBilletes]);

  // Manejar Apertura de Turno (Monto inicial siempre fijo de 500 pesos)
  const handleAbrirTurno = async (e) => {
    if (e) e.preventDefault();
    try {
      const datosApertura = {
        id_usuario: usuarioActivo?.id || 1,
        monto_inicial: 500, // Siempre 500 pesos por requerimiento
        fecha_apertura: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };

      const resp = await abrirCorteCaja(datosApertura);
      if (resp && resp.success) {
        setAlerta({ mensaje: `¡Turno abierto exitosamente con un fondo de $${datosApertura.monto_inicial}!`, tipo: 'success' });
        setShowModalApertura(false);
        cargarDatos();
      }
    } catch (err) {
      setAlerta({ mensaje: err.message || 'Error al abrir caja', tipo: 'error' });
    }
  };

  // Preparar Cierre de Turno
  const handlePrepararCierre = () => {
    const { totalEfectivo } = obtenerVentasTurno();
    const fondoInicial = Number(corteActivo?.monto_inicial) || 0;
    const esperado = fondoInicial + totalEfectivo;

    setFormCierre({
      monto_real: esperado, // Valor predeterminado
      observaciones: ''
    });
    setDesgloseBilletes({
      b1000: 0,
      b500: 0,
      b200: 0,
      b100: 0,
      b50: 0,
      b20: 0,
      monedas: 0
    });
    setShowModalCierre(true);
  };

  // Confirmar y Guardar Cierre de Turno
  const handleCerrarTurno = async () => {
    if (!corteActivo) return;

    try {
      const { totalVentas, totalEfectivo, totalTarjeta } = obtenerVentasTurno();
      const fondoInicial = Number(corteActivo.monto_inicial) || 0;
      const montoCalculado = fondoInicial + totalEfectivo;
      const montoReal = Number(formCierre.monto_real) || 0;
      const diferencia = montoReal - montoCalculado;

      const payload = {
        total_ventas: totalVentas,
        monto_real: montoReal,
        observaciones: formCierre.observaciones
      };

      const resp = await cerrarCorteCaja(corteActivo.id, payload);
      if (resp && resp.success) {
        setShowModalCierre(false);
        setAlerta({ mensaje: '¡Turno de caja cerrado y arqueo registrado correctamente!', tipo: 'success' });
        
        // Desplegar ticket de cierre
        setTicketCorte({
          id: corteActivo.id,
          cajero: usuarioActivo?.nombre || 'Cajero en Turno',
          fecha_apertura: corteActivo.fecha_apertura || new Date().toLocaleString(),
          fecha_cierre: new Date().toLocaleString(),
          monto_inicial: fondoInicial,
          total_ventas: totalVentas,
          ventas_efectivo: totalEfectivo,
          ventas_tarjeta: totalTarjeta,
          monto_calculado: montoCalculado,
          monto_real: montoReal,
          diferencia: diferencia,
          observaciones: formCierre.observaciones
        });

        cargarDatos();
      }
    } catch (err) {
      setAlerta({ mensaje: err.message || 'Error al cerrar caja', tipo: 'error' });
    }
  };

  // Filtro de Cortes
  const cortesFiltrados = cortes.filter(c => {
    if (filtroEstado === 'abiertos' && c.fecha_cierre) return false;
    if (filtroEstado === 'cerrados' && !c.fecha_cierre) return false;

    if (!busqueda) return true;
    const term = busqueda.toLowerCase().trim();
    return (
      String(c.id).includes(term) ||
      String(c.id_usuario).includes(term) ||
      (c.fecha_apertura && c.fecha_apertura.toLowerCase().includes(term)) ||
      (c.cajero_nombre && c.cajero_nombre.toLowerCase().includes(term))
    );
  });

  // Métricas para resumen
  const metricasVentas = obtenerVentasTurno();
  const fondoActual = Number(corteActivo?.monto_inicial) || 0;
  const dineroEsperadoEnCaja = fondoActual + metricasVentas.totalEfectivo;

  return (
    <div className="cortecaja-wrapper p-6 bg-zinc-950 min-h-screen text-gray-200">
      {alerta && (
        <Toast 
          mensaje={alerta.mensaje} 
          tipo={alerta.tipo} 
          onClose={() => setAlerta(null)} 
        />
      )}

      {/* Header Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-xl mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Calculator className="text-emerald-400" size={28} />
            Corte y Arqueo de Caja
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Control de fondo inicial, ventas en efectivo y tarjeta, arqueo de billetes y corte z al cierre de turno.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Badge de Estado del Turno */}
          {corteActivo ? (
            <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-xs font-bold text-emerald-400">
                Turno #{corteActivo.id} Activo
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-bold text-amber-300">
                Sin Turno Abierto (Caja Cerrada)
              </span>
            </div>
          )}

          {/* Cajero */}
          <div className="hidden sm:flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-700 text-xs text-zinc-300">
            <User size={14} className="text-emerald-400" />
            <span>{usuarioActivo?.nombre || 'Cajero'}</span>
          </div>

          {/* Botones de Apertura o Cierre */}
          {corteActivo ? (
            <button 
              onClick={handlePrepararCierre}
              className="btn btn-sm bg-amber-500 hover:bg-amber-400 text-black font-extrabold border-none flex items-center gap-1.5 shadow-lg"
            >
              <Coins size={16} /> Realizar Corte / Cerrar Turno
            </button>
          ) : (
            <button 
              onClick={() => setShowModalApertura(true)}
              className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold border-none flex items-center gap-1.5 shadow-lg"
            >
              <Plus size={16} /> Abrir Turno / Fondo Inicial
            </button>
          )}

          <button 
            onClick={cargarDatos}
            disabled={cargando}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700 transition-all"
            title="Refrescar datos"
          >
            <RefreshCw size={16} className={cargando ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Tarjeta de Resumen en Tiempo Real del Turno Actual */}
      {corteActivo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-md">
            <span className="text-xs text-zinc-400 block font-medium">Fondo Inicial en Caja</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-white">${fondoActual.toFixed(2)}</span>
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">Apertura: {corteActivo.fecha_apertura?.slice(11, 16) || 'Hoy'}</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-md">
            <span className="text-xs text-emerald-400 block font-medium">Ventas en Efectivo</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-400">${metricasVentas.totalEfectivo.toFixed(2)}</span>
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">Cobrado en mostrador</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-md">
            <span className="text-xs text-blue-400 block font-medium">Ventas con Tarjeta</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-blue-400">${metricasVentas.totalTarjeta.toFixed(2)}</span>
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">Terminal bancaria</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-500/30 p-4 rounded-2xl shadow-md">
            <span className="text-xs text-emerald-300 block font-bold">Total Esperado en Efectivo</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-300">${dineroEsperadoEnCaja.toFixed(2)}</span>
            </div>
            <span className="text-[11px] text-emerald-400/70 mt-1 block">Fondo Inicial + Efectivo</span>
          </div>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button 
            onClick={() => setFiltroEstado('todos')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filtroEstado === 'todos' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todos ({cortes.length})
          </button>
          <button 
            onClick={() => setFiltroEstado('abiertos')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filtroEstado === 'abiertos' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Turnos en Curso
          </button>
          <button 
            onClick={() => setFiltroEstado('cerrados')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filtroEstado === 'cerrados' ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Turnos Cerrados
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Buscar por ID, fecha o cajero..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-all"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Historial de Cortes de Caja */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-fixed min-w-[920px]">
            <thead className="bg-zinc-800/60 text-xs uppercase text-gray-400 font-bold border-b border-zinc-800">
              <tr>
                <th className="p-4 w-[11%]">Turno / ID</th>
                <th className="p-4 w-[14%]">Cajero / Usuario</th>
                <th className="p-4 w-[15%]">Apertura</th>
                <th className="p-4 w-[15%]">Cierre</th>
                <th className="p-4 w-[11%]">Fondo Inicial</th>
                <th className="p-4 w-[11%]">Ventas</th>
                <th className="p-4 w-[11%]">Esperado</th>
                <th className="p-4 w-[11%]">Real</th>
                <th className="p-4 w-[11%]">Diferencia</th>
                <th className="p-4 w-[10%] text-right">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {cortesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-zinc-500 italic">
                    No se encontraron registros de cortes de caja.
                  </td>
                </tr>
              ) : (
                cortesFiltrados.map(c => {
                  const esEnCurso = !c.fecha_cierre;
                  const dif = Number(c.diferencia) || 0;
                  const cuadrada = dif === 0;
                  const sobrante = dif > 0;

                  return (
                    <tr key={c.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-white">
                        Turno #{c.id}
                      </td>
                      <td className="p-4 text-zinc-300">
                        {c.cajero_nombre || `Usuario #${c.id_usuario}`}
                      </td>
                      <td className="p-4 text-xs text-zinc-400 font-mono">
                        {c.fecha_apertura ? c.fecha_apertura.replace('T', ' ').slice(0, 16) : 'N/A'}
                      </td>
                      <td className="p-4 text-xs font-mono">
                        {esEnCurso ? (
                          <span className="badge badge-warning badge-sm font-bold text-black">
                            En Curso
                          </span>
                        ) : (
                          <span className="text-zinc-400">
                            {c.fecha_cierre.replace('T', ' ').slice(0, 16)}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-zinc-300">
                        ${Number(c.monto_inicial || 0).toFixed(2)}
                      </td>
                      <td className="p-4 font-bold text-emerald-400">
                        ${Number(c.total_ventas || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-zinc-300">
                        ${Number(c.monto_calculado || 0).toFixed(2)}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {esEnCurso ? '---' : `$${Number(c.monto_real || 0).toFixed(2)}`}
                      </td>
                      <td className="p-4">
                        {esEnCurso ? (
                          <span className="text-xs text-zinc-500 font-semibold">Pendiente</span>
                        ) : (
                          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                            cuadrada
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : sobrante
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}>
                            {cuadrada ? '$0.00 (Cuadrada)' : sobrante ? `+$${dif.toFixed(2)} (Sobrante)` : `-$${Math.abs(dif).toFixed(2)} (Faltante)`}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          className="btn btn-xs btn-ghost text-zinc-400 hover:text-white p-1"
                          onClick={() => setTicketCorte({
                            id: c.id,
                            cajero: c.cajero_nombre || `Usuario #${c.id_usuario}`,
                            fecha_apertura: c.fecha_apertura,
                            fecha_cierre: c.fecha_cierre || 'En Curso',
                            monto_inicial: c.monto_inicial,
                            total_ventas: c.total_ventas || 0,
                            monto_calculado: c.monto_calculado || 0,
                            monto_real: c.monto_real || 0,
                            diferencia: c.diferencia || 0
                          })}
                          title="Imprimir / Ver Ticket de Corte"
                        >
                          <Printer size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: APERTURA DE TURNO / FONDO INICIAL                */}
      {/* ========================================================= */}
      {showModalApertura && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 bg-zinc-800/80 border-b border-zinc-700 flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Plus size={20} className="text-emerald-400" />
                Apertura de Turno / Caja
              </h3>
              <button onClick={() => setShowModalApertura(false)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAbrirTurno} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Cajero Responsable:
                </label>
                <div className="flex items-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-semibold">
                  <User size={16} className="text-emerald-400" />
                  <span>{usuarioActivo?.nombre || 'Usuario en Turno'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Fondo Inicial en Efectivo ($ MXN):
                </label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input 
                    type="number" 
                    step="0.01" 
                    readOnly
                    className="w-full bg-zinc-950 border border-emerald-500/50 rounded-xl py-2.5 pl-10 pr-4 text-emerald-400 text-base font-extrabold cursor-not-allowed outline-none select-none"
                    value={500}
                  />
                </div>
                <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
                  ✓ El monto inicial es obligatorio y está fijado permanentemente en $500.00 MXN para dar cambio.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Observaciones:
                </label>
                <textarea 
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none"
                  rows={2}
                  value={formApertura.observaciones}
                  onChange={e => setFormApertura({ ...formApertura, observaciones: e.target.value })}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModalApertura(false)}
                  className="btn btn-sm btn-ghost text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold border-none"
                >
                  Iniciar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CIERRE DE TURNO Y ARQUEO DE CAJA                 */}
      {/* ========================================================= */}
      {showModalCierre && corteActivo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 bg-zinc-800/80 border-b border-zinc-700 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Calculator size={20} className="text-amber-400" />
                Cierre de Turno #{corteActivo.id} (Arqueo)
              </h3>
              <button onClick={() => setShowModalCierre(false)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Resumen del Sistema */}
              <div className="grid grid-cols-3 gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-bold block">Fondo Inicial</span>
                  <span className="text-base font-extrabold text-white">${fondoActual.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-bold block">Ventas Efectivo</span>
                  <span className="text-base font-extrabold text-emerald-400">+${metricasVentas.totalEfectivo.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-bold block">Monto Esperado</span>
                  <span className="text-base font-black text-amber-300">${dineroEsperadoEnCaja.toFixed(2)}</span>
                </div>
              </div>

              {/* Conteo Rápido de Billetes y Monedas (Arqueo) */}
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-300 mb-2 flex items-center justify-between">
                  <span>Conteo Físico de Billetes (Arqueo Opcional):</span>
                  <span className="text-emerald-400 font-mono font-bold">${formCierre.monto_real.toFixed(2)}</span>
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { label: '$1,000', key: 'b1000' },
                    { label: '$500', key: 'b500' },
                    { label: '$200', key: 'b200' },
                    { label: '$100', key: 'b100' },
                    { label: '$50', key: 'b50' },
                    { label: '$20', key: 'b20' },
                    { label: 'Monedas', key: 'monedas' }
                  ].map(item => (
                    <div key={item.key} className="bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-bold block">{item.label}</span>
                      <input 
                        type="number"
                        min="0"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1 text-white text-xs text-center font-bold mt-1 outline-none focus:border-emerald-500"
                        value={desgloseBilletes[item.key]}
                        onChange={e => setDesgloseBilletes({ ...desgloseBilletes, [item.key]: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Real en Caja */}
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-300 mb-1">
                  Efectivo Total Real Contado en Caja ($ MXN):
                </label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input 
                    type="number" 
                    step="0.01" 
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-lg font-black focus:border-amber-400 outline-none"
                    value={formCierre.monto_real}
                    onChange={e => setFormCierre({ ...formCierre, monto_real: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Cálculo en vivo de Diferencia */}
              {(() => {
                const dif = Number(formCierre.monto_real) - dineroEsperadoEnCaja;
                const esExacto = Math.abs(dif) < 0.01;
                const esSobrante = dif > 0.01;

                return (
                  <div className={`p-4 rounded-2xl border ${
                    esExacto 
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400' 
                      : esSobrante 
                      ? 'bg-blue-950/30 border-blue-500/40 text-blue-400' 
                      : 'bg-red-950/30 border-red-500/40 text-red-400'
                  }`}>
                    <div className="flex justify-between items-center font-bold text-sm">
                      <span>Resultado del Arqueo:</span>
                      <span className="text-base font-black font-mono">
                        {esExacto ? '✓ CAJA CUADRADA ($0.00)' : esSobrante ? `+$${dif.toFixed(2)} (SOBRANTE)` : `-$${Math.abs(dif).toFixed(2)} (FALTANTE)`}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Notas de Cierre / Justificación de Diferencia:
                </label>
                <textarea 
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:border-amber-400 outline-none"
                  rows={2}
                  placeholder="Ej. Sin novedad en el turno, caja cuadrada al 100%..."
                  value={formCierre.observaciones}
                  onChange={e => setFormCierre({ ...formCierre, observaciones: e.target.value })}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-zinc-800">
                <button 
                  type="button"
                  onClick={() => setShowModalCierre(false)}
                  className="btn btn-sm btn-ghost text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={handleCerrarTurno}
                  className="btn btn-sm bg-amber-500 hover:bg-amber-400 text-black font-extrabold border-none"
                >
                  Confirmar y Cerrar Caja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: TICKET DE CORTE DE CAJA                          */}
      {/* ========================================================= */}
      {ticketCorte && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white text-zinc-900 max-w-sm p-6 rounded-2xl shadow-2xl font-mono">
            <div className="text-center pb-4 border-b border-dashed border-zinc-400">
              <h2 className="text-xl font-black tracking-wider">⚡ GYMTON FITNESS</h2>
              <p className="text-xs text-zinc-600 font-semibold uppercase">Comprobante Oficial de Corte Z</p>
              <div className="text-xs font-bold bg-zinc-200 py-1 px-3 rounded mt-2 inline-block">
                Turno #{ticketCorte.id}
              </div>
            </div>

            <div className="py-3 text-xs space-y-1 border-b border-dashed border-zinc-400">
              <div className="flex justify-between"><span>Cajero:</span><strong>{ticketCorte.cajero}</strong></div>
              <div className="flex justify-between"><span>Apertura:</span><span>{ticketCorte.fecha_apertura}</span></div>
              <div className="flex justify-between"><span>Cierre:</span><span>{ticketCorte.fecha_cierre}</span></div>
            </div>

            <div className="py-3 text-xs space-y-1.5 border-b border-dashed border-zinc-400">
              <div className="flex justify-between">
                <span>Fondo Inicial:</span>
                <strong>${Number(ticketCorte.monto_inicial || 0).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Ventas Efectivo:</span>
                <strong className="text-emerald-700">+${Number(ticketCorte.ventas_efectivo || 0).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Ventas Tarjeta:</span>
                <strong className="text-blue-700">${Number(ticketCorte.ventas_tarjeta || 0).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-300">
                <span>Total Ventas Turno:</span>
                <strong>${Number(ticketCorte.total_ventas || 0).toFixed(2)}</strong>
              </div>
            </div>

            <div className="py-3 text-xs space-y-1.5 border-b border-dashed border-zinc-400">
              <div className="flex justify-between font-bold">
                <span>Efectivo Calculado:</span>
                <span>${Number(ticketCorte.monto_calculado || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm">
                <span>Efectivo Real en Caja:</span>
                <span>${Number(ticketCorte.monto_real || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-zinc-300">
                <span>Diferencia:</span>
                <strong className={Number(ticketCorte.diferencia) < 0 ? 'text-red-600' : 'text-emerald-700'}>
                  {Number(ticketCorte.diferencia) === 0 ? '$0.00 (Cuadrada)' : `$${Number(ticketCorte.diferencia).toFixed(2)}`}
                </strong>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-[11px] text-zinc-500">Firma del Cajero Responsable:</p>
              <div className="h-10 border-b border-zinc-400 mt-2 mx-8" />
            </div>

            <div className="flex justify-end gap-2 pt-5">
              <button onClick={() => window.print()} className="btn btn-sm btn-outline text-zinc-800">
                <Printer size={15} /> Imprimir
              </button>
              <button onClick={() => setTicketCorte(null)} className="btn btn-sm bg-zinc-900 text-white hover:bg-black">
                Cerrar
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
