import React from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Power,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import '../../CSS/Membresias.css';
import Toast from '../Extras/Toast';
import ConfirmModal from '../Extras/ConfirmModal';
import { ModalFormMembresia, ModalRenovacionMembresia } from '../Extras/Modales/ModalesMembresia';
import { useMembresias } from '../../Reutilizable/useMembresias';
import { fn_dias_restantes, fn_estado_membresia } from '../../Reutilizable/objetosSQL';

export const fnDiasRestantes = fn_dias_restantes;
export const fnEstadoMembresia = fn_estado_membresia;

export default function Membresias({ loggedUser, onIrAPuntoVenta }) {
  const {
    planesCatalogo,
    clientesCatalogo,
    busquedaClienteModal,
    setBusquedaClienteModal,
    clienteSeleccionadoModal,
    setClienteSeleccionadoModal,
    filtro,
    setFiltro,
    busqueda,
    setBusqueda,
    alerta,
    setAlerta,
    showModal,
    setShowModal,
    modalMode,
    renovacionTarget,
    setRenovacionTarget,
    metodoPagoPrevio,
    setMetodoPagoPrevio,
    referenciaPago,
    setReferenciaPago,
    modoVerificacion,
    setModoVerificacion,
    formData,
    setFormData,
    confirmModal,
    setConfirmModal,
    obtenerNombreCliente,
    obtenerNombrePlan,
    abrirModalRenovacion,
    handleMandarAPuntoVenta,
    handleVerificarPagoPrevioYRenovar,
    handleToggleEstado,
    pedirConfirmacionEliminar,
    confirmarEliminar,
    openModal,
    handleSave,
    membresiasFiltradas,
    total,
    activasCount,
    porVencerCount,
    vencidasCount,
    fnDiasRestantes: calcDias,
    fnEstadoMembresia: calcEstado
  } = useMembresias({ loggedUser, onIrAPuntoVenta });

  return (
    <div className="membresias-wrapper p-6 bg-zinc-950 min-h-screen text-gray-200">
      {alerta && <Toast alerta={alerta} onClose={() => setAlerta(null)} />}

      {/* Header */}
      <div className="gym-header-box mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="text-emerald-400" />
            Control de Membresías
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Gestión y seguimiento de vigencias, renovaciones y estado de suscripciones de socios.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              maxLength={50}
              placeholder="Buscar por socio o plan..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <button
            className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold border-none flex items-center gap-1"
            onClick={() => openModal('create')}
          >
            <Plus size={16} /> Nueva Membresía
          </button>
        </div>
      </div>

      {/* Tabs calculadas */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filtro === 'todas' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setFiltro('todas')}
        >
          Todas ({total})
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filtro === 'activas' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setFiltro('activas')}
        >
          Activas ({activasCount})
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filtro === 'por_vencer' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setFiltro('por_vencer')}
        >
          Por Vencer (≤3d) ({porVencerCount})
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filtro === 'vencidas' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setFiltro('vencidas')}
        >
          Vencidas ({vencidasCount})
        </button>
      </div>

      {/* Tabla de Membresías con clases @apply de Tailwind */}
      <div className="gym-table-card">
        <div className="gym-table-scroll">
          <table className="gym-table table-fixed min-w-[880px]">
            <thead className="gym-table-thead">
              <tr>
                <th className="gym-table-th w-[20%]">Socio (Cliente)</th>
                <th className="gym-table-th w-[13%]">Plan</th>
                <th className="gym-table-th w-[11%]">Fecha Inicio</th>
                <th className="gym-table-th w-[11%]">Vencimiento</th>
                <th className="gym-table-th w-[13%]">Días Restantes</th>
                <th className="gym-table-th w-[10%]">Estado</th>
                <th className="gym-table-th w-[22%] text-right">Opciones</th>
              </tr>
            </thead>
            <tbody className="gym-table-tbody">
              {membresiasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400 italic">
                    No se encontraron membresías con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                membresiasFiltradas.map(m => {
                  const dias = calcDias(m.fecha_vencimiento);
                  const estado = calcEstado(m.fecha_inicio, m.fecha_vencimiento);
                  return (
                    <tr key={m.id} className="gym-table-tr">
                      <td className="gym-table-td font-bold text-white">
                        <span>{obtenerNombreCliente(m)}</span>
                      </td>
                      <td className="gym-table-td">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-800 border border-zinc-700 text-emerald-400">
                          {obtenerNombrePlan(m)}
                        </span>
                      </td>
                      <td className="gym-table-td text-gray-400">{m.fecha_inicio}</td>
                      <td className="gym-table-td font-semibold text-white">{m.fecha_vencimiento}</td>
                      <td className="gym-table-td">
                        <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
                          dias < 0
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : dias <= 3
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {dias < 0 ? `Vencida hace ${Math.abs(dias)}d` : `${dias} días`}
                        </span>
                      </td>
                      <td className="gym-table-td whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          estado === 'Activa'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : estado === 'Por vencer'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {estado}
                        </span>
                      </td>
                      <td className="gym-table-td text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                          <button
                            className="btn btn-xs bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 flex items-center gap-1 font-bold px-2.5 py-1 transition-all rounded-lg shadow-sm"
                            title="Renovar membresía (Verificar pago o cobrar en caja)"
                            onClick={() => abrirModalRenovacion(m)}
                          >
                            <RefreshCw size={12} /> Renovar
                          </button>
                          <button
                            className={`btn btn-xs btn-ghost p-1.5 ${m.estado === 'activa' ? 'text-emerald-400 hover:text-red-400' : 'text-zinc-500 hover:text-emerald-400'}`}
                            onClick={() => handleToggleEstado(m)}
                            title={m.estado === 'activa' ? 'Desactivar' : 'Activar'}
                          >
                            <Power size={14} />
                          </button>
                          <button
                            className="btn btn-xs btn-ghost p-1.5 text-zinc-400 hover:text-white"
                            onClick={() => openModal('edit', m)}
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-xs btn-ghost p-1.5 text-red-400 hover:bg-red-500/10"
                            onClick={() => pedirConfirmacionEliminar(m.id, obtenerNombreCliente(m))}
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales extraídos en `Vista/Extras/Modales/ModalesMembresia.jsx` */}
      <ModalFormMembresia
        showModal={showModal}
        setShowModal={setShowModal}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        clientesCatalogo={clientesCatalogo}
        planesCatalogo={planesCatalogo}
        busquedaClienteModal={busquedaClienteModal}
        setBusquedaClienteModal={setBusquedaClienteModal}
        clienteSeleccionadoModal={clienteSeleccionadoModal}
        setClienteSeleccionadoModal={setClienteSeleccionadoModal}
      />

      <ModalRenovacionMembresia
        renovacionTarget={renovacionTarget}
        setRenovacionTarget={setRenovacionTarget}
        modoVerificacion={modoVerificacion}
        setModoVerificacion={setModoVerificacion}
        metodoPagoPrevio={metodoPagoPrevio}
        setMetodoPagoPrevio={setMetodoPagoPrevio}
        referenciaPago={referenciaPago}
        setReferenciaPago={setReferenciaPago}
        handleMandarAPuntoVenta={handleMandarAPuntoVenta}
        handleVerificarPagoPrevioYRenovar={handleVerificarPagoPrevioYRenovar}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar Membresía?"
        message={`¿Estás seguro de que deseas eliminar permanentemente la membresía de "${confirmModal.nombre}" del sistema? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Membresía"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, nombre: '' })}
        tipo="danger"
      />
    </div>
  );
}
