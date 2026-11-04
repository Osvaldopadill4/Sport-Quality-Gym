import React from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
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

export default function Clientes({ loggedUser }) {
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
    confirmModal,
    setConfirmModal,
    handleToggleEstado,
    pedirConfirmacionEliminar,
    confirmarEliminar,
    openModal,
    handleSave,
    esEstadoActivo: esActivoFn,
    generarUUID
  } = useClientes({ loggedUser });

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
              className="clientes-search-input"
              placeholder="Buscar por nombre, teléfono, token QR..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
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

      {/* Tabla de Clientes */}
      <div className="clientes-table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Contraseña (Móvil)</th>
              <th>Token QR / UUID</th>
              <th>Contacto Emergencia</th>
              <th>Tel. Emergencia</th>
              <th>Fecha Registro</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" className="table-empty-row">
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
                  <tr key={c.id}>
                    <td className="clientes-td-user">
                      <span className="clientes-td-name">{c.nombre}</span>
                    </td>

                    <td className="clientes-td-text">{c.telefono || 'N/A'}</td>

                    <td className="clientes-td-text">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs px-2 py-1 bg-zinc-800 text-zinc-200 rounded border border-zinc-700">
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

                    <td className="clientes-td-text">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/30 flex items-center gap-1">
                          <QrCode size={13} />
                          <span>{c.token_qr ? (c.token_qr.length > 15 ? c.token_qr.slice(0, 15) + '...' : c.token_qr) : 'Sin Token'}</span>
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

                    <td className="clientes-td-text">{c.contacto_emergencia || 'N/A'}</td>
                    <td className="clientes-td-text">{c.telefono_emergencia || 'N/A'}</td>
                    <td className="clientes-td-text">{c.fecha_registro || 'N/A'}</td>

                    <td>
                      {esActivo ? (
                        <span className="clientes-badge activo">Activo</span>
                      ) : (
                        <span className="clientes-badge inactivo">Inactivo</span>
                      )}
                    </td>

                    <td>
                      <div className="clientes-table-actions">
                        <button
                          className="clientes-action-btn edit"
                          title="Editar datos del cliente"
                          onClick={() => openModal('edit', c)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className={`clientes-action-btn ${esActivo ? 'power-off' : 'power-on'}`}
                          title={esActivo ? 'Dar de baja' : 'Poner en activo'}
                          onClick={() => handleToggleEstado(c)}
                        >
                          <Power size={16} />
                        </button>

                        <button
                          className="clientes-action-btn delete"
                          title="Eliminar cliente"
                          onClick={() => pedirConfirmacionEliminar(c.id, c.nombre)}
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
        isOpen={confirmModal.isOpen}
        title="¿Eliminar Cliente?"
        message={`¿Estás seguro de que deseas eliminar permanentemente al cliente "${confirmModal.nombre}" del sistema? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Cliente"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, nombre: '' })}
        tipo="danger"
      />
    </div>
  );
}
