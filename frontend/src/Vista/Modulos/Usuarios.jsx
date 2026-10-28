import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X } from 'lucide-react';
import '../../CSS/Usuarios.css';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../../JS/usuarios';
import Toast from '../Componentes/Toast';
import ConfirmModal from '../Componentes/ConfirmModal';

// Helper robusto para determinar si el estado es Activo,
// soportando "1", 1, "Activo", "activo", true, etc. provenientes de la BD MySQL/API.
export const esEstadoActivo = (estado) => {
  if (estado === undefined || estado === null) return false;
  const s = String(estado).trim().toLowerCase();
  return s === '1' || s === 'activo' || s === 'true' || estado === 1 || estado === true;
};

export default function Usuarios({ loggedUser }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  
  // useState para el buscador en tiempo real
  const [busqueda, setBusqueda] = useState('');

  // useState para notificaciones / alertas
  const [alerta, setAlerta] = useState(null);

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({
    id_rol: 2,
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    contrasena: '',
    estado: 1
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (nuevosUsuarios) => {
    setUsuarios(nuevosUsuarios);
    try {
      localStorage.setItem('gymton_usuarios', JSON.stringify(nuevosUsuarios));
    } catch (e) {
      console.error('Error guardando usuarios en localStorage:', e);
    }
  };

  const cargarDatos = async () => {
    try {
      const data = await getUsuarios();
      if (Array.isArray(data) && data.length > 0) {
        setUsuarios(data);
        localStorage.setItem('gymton_usuarios', JSON.stringify(data));
        return;
      }
    } catch (err) {
      console.warn('Error al cargar usuarios de la API:', err);
    }

    const local = localStorage.getItem('gymton_usuarios');
    if (local) {
      try {
        setUsuarios(JSON.parse(local));
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Fallback por defecto si no hay conexión
    const fallback = [
      { id: 1, id_rol: 1, nombre: 'Fabian', apellido: 'Alvarez', telefono: '3481084815', correo: 'fabi77@gmail.com', estado: "1" },
      { id: 2, id_rol: 1, nombre: 'Osvaldo', apellido: 'Padilla', telefono: '3471012962', correo: 'osvaldivo60@gmail.com', estado: "1" },
      { id: 3, id_rol: 2, nombre: 'Ismael', apellido: 'De anda', telefono: '3471021512', correo: 'Cr7@gmail.com', estado: "1" },
      { id: 4, id_rol: 2, nombre: 'Andy', apellido: 'Qlon', telefono: '34854747512', correo: 'Qlito@gmail.com', estado: "1" }
    ];
    setUsuarios(fallback);
    localStorage.setItem('gymton_usuarios', JSON.stringify(fallback));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Contadores calculados con el helper para reflejar exactamente el estado de la BD
  const total = usuarios.length;
  const activos = usuarios.filter(u => esEstadoActivo(u.estado)).length;
  const inactivos = total - activos;

  // Validación de permisos especiales: Solo el usuario con id === 1 puede modificar la tabla usuarios
  // y eliminar registros de proveedores y usuarios.
  const esUsuarioId1 = Number(usuarioActivo?.id) === 1;

  const getRolName = (id_rol) => {
    const rolNum = Number(id_rol);
    if (rolNum === 1) return 'Administrador';
    if (rolNum === 2) return 'Recepcionista';
    if (rolNum === 3) return 'Inventario';
    return 'Usuario';
  };

  // Modal de Confirmación personalizada para eliminar (sin alert/confirm de localhost)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });

  // ACCIÓN: Poner en activo (envía petición a la BD vía API y actualiza vista al instante)
  const handlePonerEnActivo = async (u) => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para modificar datos de la tabla usuarios.', 'error');
      return;
    }
    const nuevaLista = usuarios.map(item => item.id === u.id ? { ...item, estado: "1" } : item);
    setUsuarios(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      const usuarioActualizado = { 
        ...u, 
        id_rol: Number(u.id_rol) || 2,
        contrasena: u.contrasena || '123456',
        estado: "1" 
      };
      await updateUsuario(u.id, usuarioActualizado);
      mostrarAlerta(`Usuario "${u.nombre}" activado correctamente`, 'success');
    } catch (error) {
      console.error('Error al poner en activo:', error);
      mostrarAlerta('Puesto en activo localmente', 'warning');
    }
  };

  // ACCIÓN: Dar de baja (envía petición a la BD vía API y actualiza vista al instante)
  const handleDarDeBaja = async (u) => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para modificar datos de la tabla usuarios.', 'error');
      return;
    }
    const nuevaLista = usuarios.map(item => item.id === u.id ? { ...item, estado: "0" } : item);
    setUsuarios(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      const usuarioActualizado = { 
        ...u, 
        id_rol: Number(u.id_rol) || 2,
        contrasena: u.contrasena || '123456',
        estado: "0" 
      };
      await updateUsuario(u.id, usuarioActualizado);
      mostrarAlerta(`Usuario "${u.nombre}" dado de baja correctamente`, 'info');
    } catch (error) {
      console.error('Error al dar de baja:', error);
      mostrarAlerta('Dado de baja localmente', 'warning');
    }
  };

  // Alternador de estado rápido
  const handleToggleEstado = (u) => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para modificar datos de la tabla usuarios.', 'error');
      return;
    }
    const esActivo = esEstadoActivo(u.estado);
    if (esActivo) {
      handleDarDeBaja(u);
    } else {
      handlePonerEnActivo(u);
    }
  };

  // Solicitar confirmación con Modal en pantalla (reemplaza window.confirm)
  const pedirConfirmacionEliminar = (id, nombre) => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para eliminar registros de la tabla usuarios.', 'error');
      return;
    }
    setConfirmModal({
      isOpen: true,
      id,
      nombre: nombre || 'este usuario'
    });
  };

  // Ejecutar eliminación confirmada en BD vía API
  const confirmarEliminar = async () => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para eliminar registros de la tabla usuarios.', 'error');
      return;
    }
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try {
      await deleteUsuario(id);
      mostrarAlerta('Registro eliminado correctamente', 'success');
      await cargarDatos();
    } catch (error) {
      console.error('Error eliminando:', error);
      const nuevaLista = usuarios.filter(u => u.id !== id);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Registro eliminado localmente', 'info');
    }
  };

  // Abrir Modal para Agregar o Editar
  const openModal = (mode, usuario = null) => {
    if (mode === 'edit' && !esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para modificar datos de la tabla usuarios.', 'error');
      return;
    }
    setModalMode(mode);
    if (mode === 'edit' && usuario) {
      setFormData({
        id: usuario.id,
        id_rol: Number(usuario.id_rol) === 3 ? 3 : 2,
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        telefono: usuario.telefono || '',
        correo: usuario.correo || '',
        contrasena: usuario.contrasena || '',
        estado: esEstadoActivo(usuario.estado) ? 1 : 0
      });
    } else {
      setFormData({
        id_rol: 2,
        nombre: '',
        apellido: '',
        telefono: '',
        correo: '',
        contrasena: '',
        estado: 1
      });
    }
    setShowModal(true);
  };

  // ACCIONES: Agregar (create) y Guardar (update) enviando información a la BD
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (modalMode === 'edit' && !esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para modificar datos de la tabla usuarios.', 'error');
      setShowModal(false);
      return;
    }

    // Validaciones
    const nombreLimpio = formData.nombre.trim();
    if (!nombreLimpio) {
      mostrarAlerta('Por favor ingresa el nombre', 'error');
      return;
    }
    if (nombreLimpio.length > 20) {
      mostrarAlerta('El nombre no puede exceder 20 caracteres', 'error');
      return;
    }
    if (formData.apellido && formData.apellido.trim().length > 20) {
      mostrarAlerta('El apellido no puede exceder 20 caracteres', 'error');
      return;
    }

    const correoLimpio = (formData.correo || '').trim().toLowerCase();
    if (!correoLimpio) {
      mostrarAlerta('Por favor ingresa el correo electrónico', 'error');
      return;
    }
    if (!correoLimpio.includes('@') || !correoLimpio.includes('.com')) {
      mostrarAlerta('El correo debe ser válido y contener "@" y ".com"', 'error');
      return;
    }

    if (formData.telefono) {
      const telLimpio = formData.telefono.replace(/\D/g, '');
      if (telLimpio.length > 11) {
        mostrarAlerta('El teléfono solo permite un máximo de 11 caracteres numéricos', 'error');
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        id_rol: Number(formData.id_rol),
        estado: esEstadoActivo(formData.estado) ? "1" : "0"
      };

      if (modalMode === 'create') {
        // ACCIÓN: Agregar a la BD vía API
        await createUsuario(payload);
        setShowModal(false);
        mostrarAlerta('Registro completado correctamente', 'success');
        await cargarDatos();
      } else {
        // ACCIÓN: Guardar cambios en la BD vía API
        await updateUsuario(formData.id, payload);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error al guardar usuario en BD:', error);
      mostrarAlerta('Ocurrió un error al procesar la solicitud en el servidor', 'error');
      // Fallback local en caso de que la red falle
      if (modalMode === 'create') {
        const nuevo = { ...formData, id: Date.now(), estado: esEstadoActivo(formData.estado) ? "1" : "0" };
        guardarLocalmente([nuevo, ...usuarios]);
      } else {
        const lista = usuarios.map(u => u.id === formData.id ? { ...u, ...formData, estado: esEstadoActivo(formData.estado) ? "1" : "0" } : u);
        guardarLocalmente(lista);
      }
      setShowModal(false);
    }
  };

  // FILTRO EN TIEMPO REAL: .filter() con useState de búsqueda y pestañas
  const usuariosFiltrados = usuarios.filter((u) => {
    // 1. Filtro por pestaña de estado
    const coincideEstado =
      filtro === 'todos' ? true :
      filtro === 'activos' ? esEstadoActivo(u.estado) :
      !esEstadoActivo(u.estado);

    // 2. Filtro en tiempo real por búsqueda de texto
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return coincideEstado;

    const nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
    const correo = (u.correo || '').toLowerCase();
    const telefono = (u.telefono || '').toLowerCase();
    const rol = getRolName(u.id_rol).toLowerCase();

    const coincideBusqueda =
      nombreCompleto.includes(termino) ||
      correo.includes(termino) ||
      telefono.includes(termino) ||
      rol.includes(termino);

    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="usuarios-wrapper">
      {/* Toast Alert flotante */}
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
          {/* Buscador en tiempo real con useState y filter */}
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
                const esActivo = esEstadoActivo(u.estado);
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
                        {/* Opción Guardar / Editar (Solo usuario id === 1) */}
                        <button
                          className={`usuarios-action-btn edit ${!esUsuarioId1 ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}`}
                          title={esUsuarioId1 ? 'Editar datos del usuario' : 'Restringido: Solo el usuario con ID=1 puede modificar datos de usuarios'}
                          onClick={() => {
                            if (!esUsuarioId1) {
                              mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para modificar usuarios.', 'error');
                              return;
                            }
                            openModal('edit', u);
                          }}
                        >
                          <Edit size={16} />
                        </button>

                        {/* Opción Poner en activo / Dar de baja (Solo usuario id === 1) */}
                        <button
                          className={`usuarios-action-btn ${esActivo ? 'power-off' : 'power-on'} ${!esUsuarioId1 ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}`}
                          title={!esUsuarioId1 ? 'Restringido: Solo el usuario con ID=1 puede modificar estado' : (esActivo ? 'Dar de baja' : 'Poner en activo')}
                          onClick={() => {
                            if (!esUsuarioId1) {
                              mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para modificar el estado de usuarios.', 'error');
                              return;
                            }
                            handleToggleEstado(u);
                          }}
                        >
                          <Power size={16} />
                        </button>

                        {/* Opción Eliminar (Solo usuario id === 1) */}
                        <button
                          className={`usuarios-action-btn delete ${!esUsuarioId1 ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}`}
                          title={esUsuarioId1 ? 'Eliminar usuario' : 'Restringido: Solo el usuario con ID=1 puede eliminar usuarios'}
                          onClick={() => {
                            if (!esUsuarioId1) {
                              mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para eliminar registros de usuarios.', 'error');
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

        {/* Paginación / Resumen */}
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

      {/* Modal para Agregar y Guardar (Editar) */}
      <dialog className={`modal ${showModal ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-md flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-200">
            <h3 className="font-bold text-lg text-base-content">
              {modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
            </h3>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Nombre * (Máx. 20 caracteres)
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  className="input input-bordered w-full"
                  placeholder="Ej. Sofía"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value.slice(0, 20) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Apellido (Máx. 20 caracteres)
                </label>
                <input
                  type="text"
                  maxLength={20}
                  className="input input-bordered w-full"
                  placeholder="Ej. Martínez"
                  value={formData.apellido || ''}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value.slice(0, 20) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Correo Electrónico * (Debe contener @ y .com)
                </label>
                <input
                  type="email"
                  required
                  className="input input-bordered w-full"
                  placeholder="ejemplo@gymton.com"
                  value={formData.correo || ''}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Teléfono (Solo números, máx. 11 dígitos)
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  className="input input-bordered w-full font-mono"
                  placeholder="Ej. 3471012962"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Contraseña {modalMode === 'create' ? '*' : '(Opcional)'}
                </label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  value={formData.contrasena || ''}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Rol del Usuario
                </label>
                <select
                  className="input input-bordered w-full"
                  value={formData.id_rol}
                  onChange={(e) => setFormData({ ...formData, id_rol: Number(e.target.value) })}
                >
                  <option value={2}>Recepcionista / Empleado (ID 2)</option>
                  <option value={3}>Inventario (ID 3)</option>
                </select>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Carga exclusiva de roles operativos: ID 2 (Recepcionista) e ID 3 (Inventario).
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Estado
                </label>
                <select
                  className="input input-bordered w-full"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: Number(e.target.value) })}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-base-200 flex justify-end gap-3 bg-base-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn btn-ghost"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {modalMode === 'create' ? 'Agregar Usuario' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Modal de Advertencia y Confirmación al Centro de Pantalla */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar Usuario?"
        message={`¿Estás seguro de que deseas eliminar permanentemente a "${confirmModal.nombre}" de la base de datos? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Usuario"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, nombre: '' })}
        tipo="danger"
      />
    </div>
  );
}
