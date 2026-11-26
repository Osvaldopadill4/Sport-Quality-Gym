import React from 'react';
import {
  Search,
  Plus,
  Edit,
  Power,
  X,
  Building2
} from 'lucide-react';
import '../../CSS/Proveedor.css';
import Toast from '../Extras/Toast';
import Paginacion from '../Extras/Paginacion';
import { ModalFormProveedor } from '../Extras/Modales/ModalesCatalogos';
import { useProveedores } from '../../Reutilizable/useCatalogos';
import { usePaginacion } from '../../Reutilizable/usePaginacion';

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
    getRolName,
    handleToggleEstado,
    openModal,
    handleSave
  } = useProveedores({ loggedUser });

  const paginacion = usePaginacion(proveedoresFiltrados, 10);

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
              maxLength={50}
              className="proveedor-search-input"
              placeholder="Buscar por empresa, contacto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value.slice(0, 50))}
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

      {/* Tabla de Proveedores con Tema Negro Unificado */}
      <div className="gym-table-card">
        <div className="gym-table-scroll">
          <table className="gym-table table-fixed min-w-[800px]">
            <thead className="gym-table-thead">
              <tr>
                <th className="gym-table-th w-[22%]">Empresa</th>
                <th className="gym-table-th w-[20%]">Contacto</th>
                <th className="gym-table-th w-[22%]">Correo</th>
                <th className="gym-table-th w-[16%]">Teléfono</th>
                <th className="gym-table-th w-[10%]">Estado</th>
                <th className="gym-table-th w-[10%] text-right">Opciones</th>
              </tr>
            </thead>
            <tbody className="gym-table-tbody">
              {paginacion.datosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400 italic">
                    {busqueda ? `No se encontraron proveedores con el término "${busqueda}"` : 'No hay proveedores registrados'}
                  </td>
                </tr>
              ) : (
                paginacion.datosPaginados.map(p => {
                  const esActivo = p.estado === 1 || p.estado === 'Activo' || String(p.estado) === '1';
                  return (
                    <tr key={p.id} className="gym-table-tr">
                      <td className="gym-table-td font-bold text-white">
                        <span className="flex items-center gap-2">
                          <Building2 size={16} className="text-emerald-400" /> {p.nombre_empresa}
                        </span>
                      </td>
                      <td className="gym-table-td text-gray-300">{p.nombre || 'N/A'}</td>
                      <td className="gym-table-td text-gray-400 font-mono text-xs">{p.correo || 'N/A'}</td>
                      <td className="gym-table-td text-gray-300 font-mono text-xs">{p.telefono || 'N/A'}</td>
                      <td className="gym-table-td">
                        {esActivo ? (
                          <span className="proveedor-badge activo">Activo</span>
                        ) : (
                          <span className="proveedor-badge inactivo">Inactivo</span>
                        )}
                      </td>
                      <td className="gym-table-td text-right">
                        <div className="proveedor-table-actions justify-end">
                          <button className="proveedor-action-btn edit" title="Editar datos" onClick={() => openModal('edit', p)}>
                            <Edit size={16} />
                          </button>
                          <button
                            className={`proveedor-action-btn ${esActivo ? 'power-off' : 'power-on'}`}
                            title={esActivo ? 'Desactivar proveedor' : 'Activar proveedor'}
                            onClick={() => handleToggleEstado(p)}
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
        <Paginacion
          paginaActual={paginacion.paginaActual}
          totalPaginas={paginacion.totalPaginas}
          totalRegistros={paginacion.totalRegistros}
          indiceInicio={paginacion.indiceInicio}
          indiceFin={paginacion.indiceFin}
          itemsPorPagina={paginacion.itemsPorPagina}
          onPageChange={paginacion.setPaginaActual}
          onItemsPerPageChange={paginacion.setItemsPorPagina}
          etiqueta="proveedores"
        />
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
    </div>
  );
}
