import React from 'react';
import {
  Calculator,
  Plus,
  Printer,
  User,
  Coins,
  RefreshCw,
  Search
} from 'lucide-react';
import '../../CSS/CorteCaja.css';
import Toast from '../Extras/Toast';
import { ModalAperturaTurno, ModalCierreTurno, ModalTicketCorte } from '../Extras/Modales/ModalesCorteCaja';
import { useCorteCaja } from '../../Reutilizable/useCorteCaja';

export default function CorteCaja({ loggedUser }) {
  const {
    cortes,
    cortesFiltrados,
    corteActivo,
    nombreCajeroActivo,
    obtenerNombreCajero,
    cargando,
    alerta,
    setAlerta,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    showModalApertura,
    setShowModalApertura,
    showModalCierre,
    setShowModalCierre,
    ticketCorte,
    setTicketCorte,
    formApertura,
    setFormApertura,
    formCierre,
    setFormCierre,
    desgloseBilletes,
    setDesgloseBilletes,
    metricasVentas,
    fondoActual,
    dineroEsperadoEnCaja,
    cargarDatos,
    handleAbrirTurno,
    handlePrepararCierre,
    handleCerrarTurno
  } = useCorteCaja({ loggedUser });

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
      <div className="gym-header-box mb-6">
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

          <div className="hidden sm:flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-700 text-xs text-zinc-200 font-semibold">
            <User size={14} className="text-emerald-400" />
            <span>Cajero: {nombreCajeroActivo}</span>
          </div>

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
            maxLength={50}
            placeholder="Buscar por ID, fecha o cajero..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-all"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Historial de Cortes de Caja con clases @apply de Tailwind */}
      <div className="gym-table-card">
        <div className="gym-table-scroll">
          <table className="gym-table table-fixed min-w-[920px]">
            <thead className="gym-table-thead">
              <tr>
                <th className="gym-table-th w-[11%]">Turno</th>
                <th className="gym-table-th w-[14%]">Cajero / Usuario</th>
                <th className="gym-table-th w-[15%]">Apertura</th>
                <th className="gym-table-th w-[15%]">Cierre</th>
                <th className="gym-table-th w-[11%]">Fondo Inicial</th>
                <th className="gym-table-th w-[11%]">Ventas</th>
                <th className="gym-table-th w-[11%]">Esperado</th>
                <th className="gym-table-th w-[11%]">Real</th>
                <th className="gym-table-th w-[11%]">Diferencia</th>
                <th className="gym-table-th w-[10%] text-right">Ticket</th>
              </tr>
            </thead>
            <tbody className="gym-table-tbody">
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
                    <tr key={c.id} className="gym-table-tr">
                      <td className="gym-table-td font-bold text-white">
                        Turno {c.id}
                      </td>
                      <td className="gym-table-td font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-emerald-400 shrink-0" />
                          <span>{obtenerNombreCajero(c)}</span>
                        </div>
                      </td>
                      <td className="gym-table-td text-xs text-zinc-400 font-mono">
                        {c.fecha_apertura ? c.fecha_apertura.replace('T', ' ').slice(0, 16) : 'N/A'}
                      </td>
                      <td className="gym-table-td text-xs font-mono">
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
                      <td className="gym-table-td font-semibold text-zinc-300">
                        ${Number(c.monto_inicial || 500).toFixed(2)}
                      </td>
                      <td className="gym-table-td font-bold text-emerald-400">
                        ${Number(c.total_ventas || 0).toFixed(2)}
                      </td>
                      <td className="gym-table-td text-zinc-300">
                        ${Number(c.monto_calculado || 0).toFixed(2)}
                      </td>
                      <td className="gym-table-td font-bold text-white">
                        {esEnCurso ? '---' : `$${Number(c.monto_real || 0).toFixed(2)}`}
                      </td>
                      <td className="gym-table-td">
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
                      <td className="gym-table-td text-right">
                        <button
                          className="btn btn-xs btn-ghost text-zinc-400 hover:text-white p-1"
                          onClick={() => setTicketCorte({
                            id: c.id,
                            cajero: obtenerNombreCajero(c),
                            fecha_apertura: c.fecha_apertura,
                            fecha_cierre: c.fecha_cierre || 'En Curso',
                            monto_inicial: Number(c.monto_inicial) || 500,
                            total_ventas: c.total_ventas || 0,
                            monto_calculado: c.monto_calculado || 500,
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

      {/* Modales extraídos en `Vista/Extras/Modales/ModalesCorteCaja.jsx` */}
      <ModalAperturaTurno
        showModalApertura={showModalApertura}
        setShowModalApertura={setShowModalApertura}
        nombreCajeroActivo={nombreCajeroActivo}
        formApertura={formApertura}
        setFormApertura={setFormApertura}
        handleAbrirTurno={handleAbrirTurno}
      />

      <ModalCierreTurno
        showModalCierre={showModalCierre}
        setShowModalCierre={setShowModalCierre}
        corteActivo={corteActivo}
        fondoActual={fondoActual}
        metricasVentas={metricasVentas}
        dineroEsperadoEnCaja={dineroEsperadoEnCaja}
        formCierre={formCierre}
        setFormCierre={setFormCierre}
        desgloseBilletes={desgloseBilletes}
        setDesgloseBilletes={setDesgloseBilletes}
        handleCerrarTurno={handleCerrarTurno}
      />

      <ModalTicketCorte
        ticketCorte={ticketCorte}
        setTicketCorte={setTicketCorte}
      />
    </div>
  );
}
