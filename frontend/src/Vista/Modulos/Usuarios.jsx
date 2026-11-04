import React from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Power,
  X
} from 'lucide-react';
import '../../CSS/Usuarios.css';
import Toast from '../Extras/Toast';
import ConfirmModal from '../Extras/ConfirmModal';
import { ModalFormUsuario } from '../Extras/Modales/ModalesCatalogos';
import { useUsuarios, esEstadoActivo as checkActivo } from '../../Reutilizable/useCatalogos';

export const esEstadoActivo = checkActivo;

export default function Usuarios({ loggedUser }) {
  const {
    usuarioActivo,
    usuariosFiltrados,
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
    handleSave,
    esEstadoActivo: esActivoFn
  } = useUsuarios({ loggedUser });

  return (
    <div className="usuarios-wrapper">
      {alerta && (
        <Toast
          mensaje={alerta.mensaje}
          tipo={alerta.tipo}
          onClose={() => setAlerta(null)}
        />
      )}

      {/* Top Header */}
      <div className="usuarios-header">
        <h1 className="usuarios-title">Gestión de Usuarios</h1>
        <div className="usuarios-top-actions">
          <div className="usuarios-search-container">
            <div className="usuarios-search-icon">
              <Search size={20} />
            </div>
            <input
              type="text"
              className="usuarios-search-input"
              placeholder="Buscar usuarios por nombre, correo, rol..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                type="button"
                className="usuarios-search-clear"
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="usuarios-terminal-badge">
            <span className="usuarios-terminal-dot"></span> Terminal Activo
          </div>
          <div className="usuarios-profile">
            <div className="usuarios-profile-info">
              <div className="usuarios-profile-name">
                {usuarioActivo ? `${usuarioActivo.nombre} ${usuarioActivo.apellido || ''}`.trim() : 'Usuario Activo'}
              </div>
              <div className="usuarios-profile-role">
                {usuarioActivo ? getRolName(usuarioActivo.id_rol) : 'Administrador'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y Botón de Agregar Nuevo */}
      <div className="usuarios-filters-bar">
        <div className="usuarios-filters">
          <button
            className={`usuarios-filter-btn ${filtro === 'todos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({total})
          </button>
          <button
            className={`usuarios-filter-btn ${filtro === 'activos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('activos')}
          >
            Activos ({activos})
          </button>
          <button
            className={`usuarios-filter-btn ${filtro === 'inactivos' ? 'active' : 'inactive'}`}
            onClick={() => setFiltro('inactivos')}
          >
            Inactivos ({inactivos})
          </button>
        </div>
        <button className="usuarios-btn-nuevo" onClick={() => openModal('create')}>
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="usuarios-table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty-row">
                  {busqueda
                    ? `No se encontraron usuarios con el término "${busqueda}"`
                    : 'No hay usuarios registrados'}
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u) => {
                const esActivo = esActivoFn(u.estado);
                return (
                  <tr key={u.id}>
                    <td className="usuarios-td-user">
                      <span className="usuarios-td-name">
                        {u.nombre} {u.apellido}
                      </span>
                    </td>
                    <td className="usuarios-td-text">{u.correo}</td>
                    <td className="usuarios-td-text">{u.telefono || 'N/A'}</td>
                    <td className="usuarios-td-text">{getRolName(u.id_rol)}</td>
                    <td>
                      {esActivo ? (
                        <span className="usuarios-badge activo">Activo</span>
                      ) : (
                        <span className="usuarios-badge inactivo">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <div className="usuarios-table-actions">
                        <button
                          className={`usuarios-action-btn edit ${!esUsuarioId1 ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}`}
                          title={esUsuarioId1 ? 'Editar datos del usuario' : 'Restringido: Solo el Administrador Principal puede modificar datos de usuarios'}
                          onClick={() => {
                            if (!esUsuarioId1) {
                              mostrarAlerta('Restricción: Únicamente el Administrador Principal tiene autorización para modificar usuarios.', 'error');
                              return;
                            }
                            openModal('edit', u);
                          }}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className={`usuarios-action-btn ${esActivo ? 'power-off' : 'power-on'} ${!esUsuarioId1 ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}`}
                          title={!esUsuarioId1 ? 'Restringido: Solo el Administrador Principal puede modificar estado' : (esActivo ? 'Dar de baja' : 'Poner en activo')}
                          onClick={() => {
                            if (!esUsuarioId1) {
                              mostrarAlerta('Restricción: Únicamente el Administrador Principal tiene autorización para modificar el estado de usuarios.', 'error');
                              return;
                            }
                            handleToggleEstado(u);
                          }}
                        >
                          <Power size={16} />
                        </button>

                        <button
                          className={`usuarios-action-btn delete ${!esUsuarioId1 ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}`}
                          title={esUsuarioId1 ? 'Eliminar usuario' : 'Restringido: Solo el Administrador Principal puede eliminar usuarios'}
                          onClick={() => {
                            if (!esUsuarioId1) {
                              mostrarAlerta('Restricción: Únicamente el Administrador Principal tiene autorización para eliminar registros de usuarios.', 'error');
                              return;
                            }
                            pedirConfirmacionEliminar(u.id, `${u.nombre} ${u.apellido || ''}`.trim());
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

        <div className="usuarios-pagination">
          <span className="usuarios-pagination-text">
            Mostrando {usuariosFiltrados.length} de {total} usuarios
            {busqueda && ` (filtrado por "${busqueda}")`}
          </span>
          <div className="usuarios-pagination-buttons">
            <button className="usuarios-page-btn prev">Anterior</button>
            <button className="usuarios-page-btn next">Siguiente</button>
          </div>
        </div>
      </div>

      {/* Modal extraído en `Vista/Extras/Modales/ModalesCatalogos.jsx` */}
      <ModalFormUsuario
        showModal={showModal}
        setShowModal={setShowModal}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar Usuario?"
        message={`¿Estás seguro de que deseas eliminar permanentemente a "${confirmModal.nombre}" del sistema? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Usuario"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, nombre: '' })}
        tipo="danger"
      />
    </div>
  );
}
