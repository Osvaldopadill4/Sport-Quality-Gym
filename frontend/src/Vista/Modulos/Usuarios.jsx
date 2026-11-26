import React from 'react';
import {
  Search,
  Plus,
  Edit,
  Power,
  X,
  UserCog,
  Users,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  UserCheck,
  Mail,
  Phone
} from 'lucide-react';
import '../../CSS/Usuarios.css';
import Toast from '../Extras/Toast';
import Paginacion from '../Extras/Paginacion';
import { ModalFormUsuario } from '../Extras/Modales/ModalesCatalogos';
import { useUsuarios, esEstadoActivo as checkActivo } from '../../Reutilizable/useCatalogos';
import { usePaginacion } from '../../Reutilizable/usePaginacion';

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
    mostrarAlerta,
    handleToggleEstado,
    openModal,
    handleSave,
    esEstadoActivo: esActivoFn
  } = useUsuarios({ loggedUser });

  const paginacion = usePaginacion(usuariosFiltrados, 10);

  return (
    <div className="usuarios-wrapper p-4 md:p-6 bg-zinc-950 min-h-screen text-gray-200">
      {alerta && (
        <Toast
          mensaje={alerta.mensaje}
          tipo={alerta.tipo}
          onClose={() => setAlerta(null)}
        />
      )}

      {/* NIVEL 1: CABECERA PRINCIPAL CON ACCIÓN PRIMARIA     */}

      <div className="gym-header-box flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <UserCog className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Gestión de Usuarios y Personal
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Administra cuentas de cajeros, administradores y personal con roles y control de acceso seguro.
            </p>
          </div>
        </div>

        {/* Buscador y Botón de Acción Principal */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              maxLength={50}
              className="w-full pl-9 pr-9 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Buscar por nombre, correo, rol..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value.slice(0, 50))}
            />
            {busqueda && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm rounded-xl border-none shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            onClick={() => openModal('create')}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* NIVEL 2: TARJETAS DE RESUMEN Y ESTADÍSTICAS          */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Cuentas */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-zinc-800 border border-zinc-700/60 rounded-xl text-indigo-400">
            <Users size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{total}</div>
            <div className="text-xs text-gray-400 font-medium">Total de Usuarios</div>
          </div>
        </div>

        {/* Activos */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">{activos}</div>
            <div className="text-xs text-gray-400 font-medium">Usuarios Activos</div>
          </div>
        </div>

        {/* Inactivos */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <XCircle size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-400">{inactivos}</div>
            <div className="text-xs text-gray-400 font-medium">Usuarios Inactivos</div>
          </div>
        </div>
      </div>

      {/* NIVEL 3: FILTROS POR ESTADO + TABLA ESTILIZADA EN NEGRO   */}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 bg-zinc-900/80 p-1 border border-zinc-800 rounded-xl">
          <button
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filtro === 'todos'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({total})
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filtro === 'activos'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setFiltro('activos')}
          >
            Activos ({activos})
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filtro === 'inactivos'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setFiltro('inactivos')}
          >
            Inactivos ({inactivos})
          </button>
        </div>

        {usuarioActivo && (
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sesión: <strong className="text-gray-200">{usuarioActivo.nombre}</strong> (
            {getRolName(usuarioActivo.id_rol)})
          </div>
        )}
      </div>

      <div className="gym-table-card">
        <div className="gym-table-scroll">
          <table className="gym-table table-fixed min-w-[850px]">
            <thead className="gym-table-thead">
              <tr>
                <th className="gym-table-th w-[28%]">Usuario</th>
                <th className="gym-table-th w-[26%]">Correo Electrónico</th>
                <th className="gym-table-th w-[16%]">Teléfono</th>
                <th className="gym-table-th w-[14%]">Rol Asignado</th>
                <th className="gym-table-th w-[8%] text-center">Estado</th>
                <th className="gym-table-th w-[8%] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="gym-table-tbody">
              {paginacion.datosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400 italic">
                    {busqueda
                      ? `No se encontraron usuarios que coincidan con "${busqueda}"`
                      : 'No hay usuarios registrados'}
                  </td>
                </tr>
              ) : (
                paginacion.datosPaginados.map((u) => {
                  const esActivo = esActivoFn(u.estado);
                  const esAdmin = Number(u.id_rol) === 1;
                  const iniciales = `${(u.nombre || '')[0] || ''}${(u.apellido || '')[0] || ''}`.toUpperCase();

                  return (
                    <tr key={u.id} className="gym-table-tr">
                      {/* Usuario con Avatar e iniciales */}
                      <td className="gym-table-td">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${
                              esAdmin
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : 'bg-zinc-800 border-zinc-700 text-gray-300'
                            }`}
                          >
                            {iniciales || 'U'}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-white text-sm truncate">
                              {u.nombre} {u.apellido}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Correo */}
                      <td className="gym-table-td text-gray-300 font-mono text-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail size={13} className="text-gray-500 flex-shrink-0" />
                          <span className="truncate">{u.correo}</span>
                        </div>
                      </td>

                      {/* Teléfono */}
                      <td className="gym-table-td text-gray-300 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-gray-500 flex-shrink-0" />
                          <span>{u.telefono || 'Sin teléfono'}</span>
                        </div>
                      </td>

                      {/* Rol con Badge distintivo */}
                      <td className="gym-table-td">
                        {esAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                            <ShieldCheck size={12} />
                            <span>{getRolName(u.id_rol)}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-800 border border-zinc-700 text-gray-300">
                            <UserCheck size={12} />
                            <span>{getRolName(u.id_rol)}</span>
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="gym-table-td text-center">
                        {esActivo ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-800 border border-zinc-700 text-gray-500">
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="gym-table-td text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            className={`p-1.5 rounded-lg border transition-all ${
                              !esUsuarioId1
                                ? 'opacity-30 cursor-not-allowed border-zinc-800 text-gray-600'
                                : 'bg-zinc-800 border-zinc-700 text-gray-300 hover:text-white hover:border-emerald-500/50'
                            }`}
                            title={
                              esUsuarioId1
                                ? 'Editar datos del usuario'
                                : 'Restringido: Solo el Administrador Principal puede modificar datos'
                            }
                            onClick={() => {
                              if (!esUsuarioId1) {
                                mostrarAlerta(
                                  'Restricción: Únicamente el Administrador Principal tiene autorización para modificar usuarios.',
                                  'error'
                                );
                                return;
                              }
                              openModal('edit', u);
                            }}
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            className={`p-1.5 rounded-lg border transition-all ${
                              !esUsuarioId1
                                ? 'opacity-30 cursor-not-allowed border-zinc-800 text-gray-600'
                                : esActivo
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                            title={
                              !esUsuarioId1
                                ? 'Restringido: Solo el Administrador Principal puede modificar estado'
                                : esActivo
                                ? 'Desactivar usuario'
                                : 'Activar usuario'
                            }
                            onClick={() => {
                              if (!esUsuarioId1) {
                                mostrarAlerta(
                                  'Restricción: Únicamente el Administrador Principal tiene autorización para modificar el estado de usuarios.',
                                  'error'
                                );
                                return;
                              }
                              handleToggleEstado(u);
                            }}
                          >
                            <Power size={14} />
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
          etiqueta="usuarios"
        />
      </div>

      {/* Modal Formulario Usuario */}
      <ModalFormUsuario
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
