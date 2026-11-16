import React from 'react';
import {
  Search,
  Plus,
  Edit,
  Power,
  X,
  Eye,
  EyeOff,
  QrCode,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import '../../CSS/Clientes.css';
import Toast from '../Extras/Toast';
import ConfirmModal from '../Extras/ConfirmModal';
import { ModalFormCliente } from '../Extras/Modales/ModalesCatalogos';
import { useClientes, esEstadoActivo as checkActivo } from '../../Reutilizable/useCatalogos';

export const esEstadoActivo = checkActivo;

export default function Clientes({ loggedUser, onIrAPuntoVenta }) {
  const {
    usuarioActivo,
    clientesFiltrados,
    filtro,
    setFiltro,
    busqueda,
    setBusqueda,
    alerta,
    setAlerta,
    mostrarPasswords,
    togglePasswordVisible,
    copiadoToken,
    copiarAlPortapapeles,
    showModal,
    setShowModal,
    modalMode,
    formData,
    setFormData,
    cargandoBD,
    cargarDatos,
    total,
    activos,
    inactivos,
    paseInvitadoModal,
    setPaseInvitadoModal,
    handleToggleEstado,
    openModal,
    handleSave,
    esEstadoActivo: esActivoFn,
    generarUUID
  } = useClientes({ loggedUser, onIrAPuntoVenta });

  return (
    <div className="clientes-wrapper">
      <Toast alerta={alerta} onClose={() => setAlerta(null)} />

      {/* Top Header */}
      <div className="clientes-header">
        <div>
          <h1 className="clientes-title">Gestión de Clientes / Socios</h1>
          <p className="text-xs text-gray-400 mt-1">
            Incluye credenciales de acceso para App Móvil y Token QR para torniquetes.
          </p>
        </div>
        <div className="clientes-top-actions">
          <div className="clientes-search-container">
            <div className="clientes-search-icon">
              <Search size={20} />
            </div>
            <input
              type="text"
              maxLength={50}
              className="clientes-search-input"
              placeholder="Buscar por nombre, teléfono, token QR..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value.slice(0, 50))}
            />
            {busqueda && (
              <button
                type="button"
                className="clientes-search-clear"
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="clientes-terminal-badge">
            <span className="clientes-terminal-dot"></span> Terminal Activo
          </div>
          <div className="clientes-profile">
            <div className="clientes-profile-info">
              <div className="clientes-profile-name">
                {usuarioActivo ? `${usuarioActivo.nombre} ${usuarioActivo.apellido || ''}`.trim() : 'Usuario Activo'}
              </div>
              <div className="clientes-profile-role">
                Recepción Gymton
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y Botón de Agregar Nuevo */}
      <div className="clientes-filters-bar">
        <div className="clientes-filters">
          <button
            className={`clientes-filter-btn ${filtro === 'todos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({total})
          </button>
          <button
            className={`clientes-filter-btn ${filtro === 'activos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('activos')}
          >
            Activos ({activos})
          </button>
          <button
            className={`clientes-filter-btn ${filtro === 'inactivos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('inactivos')}
          >
            Inactivos ({inactivos})
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-ghost text-emerald-400 border border-zinc-700 hover:bg-zinc-800 flex items-center gap-1.5"
            onClick={() => cargarDatos(true)}
            title="Actualizar datos"
          >
            <RefreshCw size={14} className={cargandoBD ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
          <button className="clientes-btn-nuevo" onClick={() => openModal('create')}>
            <Plus size={16} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Tabla de Clientes con Tema Negro Unificado */}
      <div className="gym-table-card">
        <div className="gym-table-scroll">
          <table className="gym-table table-fixed min-w-[950px]">
            <thead className="gym-table-thead">
              <tr>
                <th className="gym-table-th w-[18%]">Cliente</th>
                <th className="gym-table-th w-[12%]">Teléfono</th>
                <th className="gym-table-th w-[13%]">Contraseña (Móvil)</th>
                <th className="gym-table-th w-[14%]">Token QR / UUID</th>
                <th className="gym-table-th w-[14%]">Contacto Emerg.</th>
                <th className="gym-table-th w-[11%]">Tel. Emerg.</th>
                <th className="gym-table-th w-[10%]">Estado</th>
                <th className="gym-table-th w-[8%] text-right">Opciones</th>
              </tr>
            </thead>
            <tbody className="gym-table-tbody">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-400 italic">
                    {busqueda
                      ? `No se encontraron clientes con el término "${busqueda}"`
                      : 'No hay clientes registrados'}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((c) => {
                  const esActivo = esActivoFn(c.estado);
                  const passwordVisible = mostrarPasswords[c.id];
                  return (
                    <tr key={c.id} className="gym-table-tr">
                      <td className="gym-table-td font-bold text-white">
                        <span>{c.nombre}</span>
                      </td>

                      <td className="gym-table-td text-gray-300 font-mono text-xs">{c.telefono || 'N/A'}</td>

                      <td className="gym-table-td">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs px-2 py-0.5 bg-zinc-800 text-zinc-200 rounded border border-zinc-700">
                            {passwordVisible ? (c.contrasena || 'Sin asignar') : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisible(c.id)}
                            className="text-gray-400 hover:text-emerald-400 p-1 transition-colors"
                            title={passwordVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
                          >
                            {passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>

                      <td className="gym-table-td">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/30 flex items-center gap-1">
                            <QrCode size={13} />
                            <span>{c.token_qr ? (c.token_qr.length > 12 ? c.token_qr.slice(0, 12) + '...' : c.token_qr) : 'Sin Token'}</span>
                          </span>
                          {c.token_qr && (
                            <button
                              type="button"
                              onClick={() => copiarAlPortapapeles(c.token_qr, c.id)}
                              className="text-gray-400 hover:text-emerald-400 p-1 transition-colors"
                              title="Copiar Token QR"
                            >
                              {copiadoToken === c.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="gym-table-td text-gray-400 text-xs">{c.contacto_emergencia || 'N/A'}</td>
                      <td className="gym-table-td text-gray-400 font-mono text-xs">{c.telefono_emergencia || 'N/A'}</td>

                      <td className="gym-table-td">
                        {esActivo ? (
                          <span className="clientes-badge activo">Activo</span>
                        ) : (
                          <span className="clientes-badge inactivo">Inactivo</span>
                        )}
                      </td>

                      <td className="gym-table-td text-right">
                        <div className="clientes-table-actions justify-end">
                          <button
                            className="clientes-action-btn edit"
                            title="Editar datos del cliente"
                            onClick={() => openModal('edit', c)}
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className={`clientes-action-btn ${esActivo ? 'power-off' : 'power-on'}`}
                            title={esActivo ? 'Desactivar cliente' : 'Activar cliente'}
                            onClick={() => handleToggleEstado(c)}
                          >
                            <Power size={16} />
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

        <div className="clientes-pagination">
          <span className="clientes-pagination-text">
            Mostrando {clientesFiltrados.length} de {total} clientes
            {busqueda && ` (filtrado por "${busqueda}")`}
          </span>
          <div className="clientes-pagination-buttons">
            <button className="clientes-page-btn prev">Anterior</button>
            <button className="clientes-page-btn next">Siguiente</button>
          </div>
        </div>

      {/* Modal extraído en `Vista/Extras/Modales/ModalesCatalogos.jsx` */}
      <ModalFormCliente
        showModal={showModal}
        setShowModal={setShowModal}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        generarUUID={generarUUID}
      />

      <ConfirmModal
        isOpen={paseInvitadoModal?.isOpen}
        title="¿Cobrar Pase de Invitado en Caja?"
        message={
          <div className="space-y-3 text-left pt-1">
            <p className="text-sm text-zinc-300">
              El socio <strong className="text-emerald-400">{paseInvitadoModal?.cliente?.nombre}</strong> ha sido registrado en la base de datos.
            </p>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
              <div className="flex justify-between items-center">
                <span>Plan sugerido:</span>
                <span className="text-white font-bold">{paseInvitadoModal?.plan?.nombre || 'Individual (1 Día)'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Costo en Caja:</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">${paseInvitadoModal?.plan?.precio || 30}.00</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              ¿Deseas enviar a este nuevo socio a Caja para cobrar su pase y activar su acceso al gimnasio?
            </p>
          </div>
        }
        confirmText="Ir a Cobrar a Caja ($30)"
        cancelText="Solo Registrar (Sin Cobro)"
        tipo="success"
        onConfirm={() => {
          if (!paseInvitadoModal?.cliente) return;
          const payloadCobro = {
            cliente_id: paseInvitadoModal.cliente.id,
            cliente_nombre: paseInvitadoModal.cliente.nombre,
            id_plan: paseInvitadoModal.plan?.id || 5,
            plan_nombre: paseInvitadoModal.plan?.nombre || 'Individual (1 Día)',
            precio: paseInvitadoModal.plan?.precio || 30,
            duracion_dias: 1,
            es_nueva: true
          };
          setPaseInvitadoModal({ isOpen: false, cliente: null, plan: null });
          if (onIrAPuntoVenta) {
            onIrAPuntoVenta(payloadCobro);
          }
        }}
        onCancel={() => setPaseInvitadoModal({ isOpen: false, cliente: null, plan: null })}
      />
    </div>
  );
}
