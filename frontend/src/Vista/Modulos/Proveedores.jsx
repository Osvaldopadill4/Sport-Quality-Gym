import React from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Power,
  X,
  Building2
} from 'lucide-react';
import '../../CSS/Proveedor.css';
import Toast from '../Extras/Toast';
import ConfirmModal from '../Extras/ConfirmModal';
import { ModalFormProveedor } from '../Extras/Modales/ModalesCatalogos';
import { useProveedores } from '../../Reutilizable/useCatalogos';

export default function Proveedores({ loggedUser }) {
  const {
    usuarioActivo,
    proveedoresFiltrados,
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
    total,
    activos,
    inactivos,
    esUsuarioId1,
    getRolName,
    confirmModal,
    setConfirmModal,
    mostrarAlerta,
    handleToggleEstado,
    pedirConfirmacionEliminar,
    confirmarEliminar,
    openModal,
    handleSave
  } = useProveedores({ loggedUser });

  return (
    <div className="proveedor-wrapper">
      <Toast alerta={alerta} onClose={() => setAlerta(null)} />

      {/* Top Header */}
      <div className="proveedor-header">
        <h1 className="proveedor-title">Gestión de Proveedores</h1>
        <div className="proveedor-top-actions">
          <div className="proveedor-search-container relative flex items-center">
            <div className="proveedor-search-icon">
              <Search size={20} />
            </div>
            <input
              type="text"
              className="proveedor-search-input"
              placeholder="Buscar por empresa, contacto..."
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
          <div className="proveedor-terminal-badge">
            <span className="proveedor-terminal-dot"></span> Terminal Activo
          </div>
          <div className="proveedor-profile">
            <div className="proveedor-profile-info">
              <div className="proveedor-profile-name">
                {usuarioActivo ? `${usuarioActivo.nombre} ${usuarioActivo.apellido || ''}`.trim() : 'Usuario Activo'}
              </div>
              <div className="proveedor-profile-role">
                {usuarioActivo ? getRolName(usuarioActivo.id_rol) : 'Administrador'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y Botón Nuevo */}
      <div className="proveedor-filters-bar">
        <div className="proveedor-filters">
          <button className={`proveedor-filter-btn ${filtro === 'todos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('todos')}>Todos ({total})</button>
          <button className={`proveedor-filter-btn ${filtro === 'activos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('activos')}>Activos ({activos})</button>
          <button className={`proveedor-filter-btn ${filtro === 'inactivos' ? 'active' : 'inactive'}`} onClick={() => setFiltro('inactivos')}>Inactivos ({inactivos})</button>
        </div>
        <button className="proveedor-btn-nuevo" onClick={() => openModal('create')}>
          <Plus size={16} /> Nuevo Proveedor
        </button>
      </div>

      {/* Tabla de Proveedores */}
      <div className="proveedor-table-container">
        <table className="proveedor-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Contacto</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-400 italic">
                  {busqueda ? `No se encontraron proveedores con el término "${busqueda}"` : 'No hay proveedores registrados'}
                </td>
              </tr>
            ) : (
              proveedoresFiltrados.map(p => {
                const esActivo = p.estado === 1 || p.estado === 'Activo';
                return (
                  <tr key={p.id}>
                    <td className="proveedor-td-user">
                      <span className="proveedor-td-name font-bold flex items-center gap-2">
                        <Building2 size={16} className="text-primary" /> {p.nombre_empresa}
                      </span>
                    </td>
                    <td className="proveedor-td-text">{p.nombre || 'N/A'}</td>
                    <td className="proveedor-td-text">{p.correo || 'N/A'}</td>
                    <td className="proveedor-td-text">{p.telefono || 'N/A'}</td>
                    <td>
                      {esActivo ? (
                        <span className="proveedor-badge activo">Activo</span>
                      ) : (
                        <span className="proveedor-badge inactivo">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <div className="proveedor-table-actions">
                        <button className="proveedor-action-btn edit" title="Editar datos" onClick={() => openModal('edit', p)}>
                          <Edit size={16} />
                        </button>
                        <button
                          className={`proveedor-action-btn ${esActivo ? 'power-off' : 'power-on'}`}
                          title={esActivo ? 'Dar de baja' : 'Poner en activo'}
                          onClick={() => handleToggleEstado(p)}
                        >
                          <Power size={16} />
                        </button>
                        <button
                          className={`proveedor-action-btn delete ${!esUsuarioId1 ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}`}
                          title={esUsuarioId1 ? 'Eliminar proveedor' : 'Restringido: Solo el Administrador Principal puede eliminar proveedores'}
                          onClick={() => {
                            if (!esUsuarioId1) {
                              mostrarAlerta('Restricción: Únicamente el Administrador Principal tiene autorización para eliminar proveedores.', 'error');
                              return;
                            }
                            pedirConfirmacionEliminar(p.id, p.nombre_empresa || p.nombre);
                          }}
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

        <div className="proveedor-pagination">
          <span className="proveedor-pagination-text">
            Mostrando {proveedoresFiltrados.length} de {total} proveedores
            {busqueda && ` (filtrado por "${busqueda}")`}
          </span>
          <div className="proveedor-pagination-buttons">
            <button className="proveedor-page-btn prev">Anterior</button>
            <button className="proveedor-page-btn next">Siguiente</button>
          </div>
        </div>
      </div>

      {/* Modal extraído en `Vista/Extras/Modales/ModalesCatalogos.jsx` */}
      <ModalFormProveedor
        showModal={showModal}
        setShowModal={setShowModal}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar Proveedor?"
        message={`¿Estás seguro de que deseas eliminar a "${confirmModal.nombre}" del sistema? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Proveedor"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, nombre: '' })}
        tipo="danger"
      />
    </div>
  );
}
