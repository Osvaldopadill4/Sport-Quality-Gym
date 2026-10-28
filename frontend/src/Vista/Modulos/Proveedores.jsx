import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power, X, Building2 } from 'lucide-react';
import '../../CSS/Proveedor.css';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../JS/proveedor';
import Toast from '../Componentes/Toast';
import ConfirmModal from '../Componentes/ConfirmModal';

export default function Proveedores({ loggedUser }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ nombre: '', nombre_empresa: '', telefono: '', correo: '', estado: 1 });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (lista) => {
    setProveedores(lista);
    try {
      localStorage.setItem('gymton_proveedores', JSON.stringify(lista));
    } catch (e) {
      console.error(e);
    }
  };

  const cargarDatos = () => {
    getProveedores().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setProveedores(data);
        localStorage.setItem('gymton_proveedores', JSON.stringify(data));
      } else {
        const local = localStorage.getItem('gymton_proveedores');
        if (local) {
          try {
            setProveedores(JSON.parse(local));
            return;
          } catch (e) {
            console.error(e);
          }
        }
        const fallback = [
          { id: 1, nombre: 'Carlos Ortiz', nombre_empresa: 'Suplementos GymFit MX', telefono: '555-0192', correo: 'contacto@gymfit.com', estado: 1 },
          { id: 2, nombre: 'Ana Morales', nombre_empresa: 'Equipamiento IronForce', telefono: '555-8832', correo: 'ventas@ironforce.com', estado: 1 },
          { id: 3, nombre: 'Jorge Luna', nombre_empresa: 'Bebidas e Hidratación Sport', telefono: '555-4311', correo: 'distribucion@sportdrink.mx', estado: 0 }
        ];
        setProveedores(fallback);
        localStorage.setItem('gymton_proveedores', JSON.stringify(fallback));
      }
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = proveedores.length;
  const activos = proveedores.filter(p => p.estado === 1 || p.estado === 'Activo').length;
  const inactivos = total - activos;

  // Validación de permisos especiales: Solo el usuario con id === 1 puede eliminar de proveedores
  const esUsuarioId1 = Number(usuarioActivo?.id) === 1;

  const getRolName = (id_rol) => {
    if (id_rol === 1) return 'Administrador';
    if (id_rol === 2) return 'Recepcionista';
    if (id_rol === 3) return 'Inventario';
    return 'Usuario';
  };

  // Modal de Confirmación personalizada para eliminar (sin alert/confirm de localhost)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });

  // ACCIÓN: Poner en activo
  const handlePonerEnActivo = async (p) => {
    const proveedorActualizado = { ...p, estado: 1 };
    const nuevaLista = proveedores.map(item => item.id === p.id ? proveedorActualizado : item);
    setProveedores(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateProveedor(p.id, proveedorActualizado);
      mostrarAlerta(`Proveedor "${p.nombre_empresa || p.nombre}" activado correctamente`, 'success');
    } catch (error) {
      console.error(error);
      mostrarAlerta('Puesto en activo localmente', 'warning');
    }
  };

  // ACCIÓN: Dar de baja
  const handleDarDeBaja = async (p) => {
    const proveedorActualizado = { ...p, estado: 0 };
    const nuevaLista = proveedores.map(item => item.id === p.id ? proveedorActualizado : item);
    setProveedores(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateProveedor(p.id, proveedorActualizado);
      mostrarAlerta(`Proveedor "${p.nombre_empresa || p.nombre}" dado de baja correctamente`, 'info');
    } catch (error) {
      console.error(error);
      mostrarAlerta('Dado de baja localmente', 'warning');
    }
  };

  const handleToggleEstado = (p) => {
    const esActivo = p.estado === 1 || p.estado === 'Activo';
    if (esActivo) handleDarDeBaja(p);
    else handlePonerEnActivo(p);
  };

  // Solicitar confirmación con Modal en pantalla (reemplaza window.confirm)
  const pedirConfirmacionEliminar = (id, nombre) => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para eliminar registros de la tabla proveedores.', 'error');
      return;
    }
    setConfirmModal({
      isOpen: true,
      id,
      nombre: nombre || 'este proveedor'
    });
  };

  // Ejecutar eliminación confirmada en BD vía API
  const confirmarEliminar = async () => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para eliminar registros de la tabla proveedores.', 'error');
      return;
    }
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try {
      await deleteProveedor(id);
      const nuevaLista = proveedores.filter(p => p.id !== id);
      setProveedores(nuevaLista);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Registro eliminado correctamente', 'success');
    } catch(error) {
      console.error(error);
      mostrarAlerta('Error al eliminar proveedor', 'error');
    }
  };

  const openModal = (mode, proveedor = null) => {
    setModalMode(mode);
    if (mode === 'edit' && proveedor) {
      setFormData({
        id: proveedor.id,
        nombre: proveedor.nombre || '',
        nombre_empresa: proveedor.nombre_empresa || '',
        telefono: proveedor.telefono || '',
        correo: proveedor.correo || '',
        estado: (proveedor.estado === 1 || proveedor.estado === 'Activo') ? 1 : 0
      });
    } else {
      setFormData({ nombre: '', nombre_empresa: '', telefono: '', correo: '', estado: 1 });
    }
    setShowModal(true);
  };

  // ACCIONES: Registrar y Modificar
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const empresaLimpia = (formData.nombre_empresa || '').trim();
    if (!empresaLimpia) {
      mostrarAlerta('Por favor ingresa el nombre de la empresa', 'error');
      return;
    }
    if (empresaLimpia.length > 20) {
      mostrarAlerta('El nombre de la empresa no puede exceder 20 caracteres', 'error');
      return;
    }

    if (formData.nombre && formData.nombre.trim().length > 20) {
      mostrarAlerta('El nombre de contacto no puede exceder 20 caracteres', 'error');
      return;
    }

    if (formData.correo && formData.correo.trim()) {
      const correoLimpio = formData.correo.trim().toLowerCase();
      if (!correoLimpio.includes('@') || !correoLimpio.includes('.com')) {
        mostrarAlerta('El correo electrónico debe ser válido y contener "@" y ".com"', 'error');
        return;
      }
    }

    if (formData.telefono) {
      const telLimpio = formData.telefono.replace(/\D/g, '');
      if (telLimpio.length > 11) {
        mostrarAlerta('El teléfono solo permite un máximo de 11 caracteres numéricos', 'error');
        return;
      }
    }

    try {
      if (modalMode === 'create') {
        const res = await createProveedor(formData);
        const nuevo = (res && res.id) ? res : { ...formData, id: Date.now() };
        const nuevaLista = [nuevo, ...proveedores];
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Registro completado correctamente', 'success');
      } else {
        await updateProveedor(formData.id, formData);
        const nuevaLista = proveedores.map(item => item.id === formData.id ? { ...item, ...formData } : item);
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
      }
    } catch(error) {
      console.error(error);
      mostrarAlerta('Error al procesar la solicitud', 'error');
    }
  };

  // FILTRO EN TIEMPO REAL con useState y filter
  const proveedoresFiltrados = proveedores.filter(p => {
    const coincideEstado =
      filtro === 'todos' ? true :
      filtro === 'activos' ? (p.estado === 1 || p.estado === 'Activo') :
      (p.estado === 0 || p.estado === 'Inactivo');

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return coincideEstado;

    const empresa = (p.nombre_empresa || '').toLowerCase();
    const contacto = (p.nombre || '').toLowerCase();
    const telefono = (p.telefono || '').toLowerCase();
    const correo = (p.correo || '').toLowerCase();

    const coincideBusqueda =
      empresa.includes(termino) ||
      contacto.includes(termino) ||
      telefono.includes(termino) ||
      correo.includes(termino);

    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="proveedor-wrapper">
      <Toast alerta={alerta} onClose={() => setAlerta(null)} />

      {/* Top Header */}
      <div className="proveedor-header">
        <h1 className="proveedor-title">Gestión de Proveedores</h1>
        <div className="proveedor-top-actions">
          {/* Buscador en tiempo real */}
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
                          title={esActivo ? "Dar de baja" : "Poner en activo"} 
                          onClick={() => handleToggleEstado(p)}
                        >
                          <Power size={16} />
                        </button>
                        <button 
                          className={`proveedor-action-btn delete ${!esUsuarioId1 ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}`} 
                          title={esUsuarioId1 ? "Eliminar proveedor" : "Restringido: Solo el usuario con ID=1 puede eliminar proveedores"} 
                          onClick={() => {
                            if (!esUsuarioId1) {
                              mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para eliminar proveedores.', 'error');
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

      {/* Modal para Registrar / Modificar */}
      <dialog className={`modal ${showModal ? "modal-open" : ""}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-md flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-200">
            <h3 className="font-bold text-lg text-base-content">
              {modalMode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
            </h3>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Nombre de la Empresa * (Máx. 20 caracteres)
                </label>
                <input 
                  type="text" 
                  required
                  maxLength={20}
                  className="input input-bordered w-full" 
                  placeholder="Ej. Suplementos GymFit"
                  value={formData.nombre_empresa} 
                  onChange={e => setFormData({...formData, nombre_empresa: e.target.value.slice(0, 20)})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Persona de Contacto (Máx. 20 caracteres)
                </label>
                <input 
                  type="text" 
                  maxLength={20}
                  className="input input-bordered w-full" 
                  placeholder="Ej. Carlos Ortiz"
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value.slice(0, 20)})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Correo Electrónico (Debe contener @ y .com)
                </label>
                <input 
                  type="email" 
                  className="input input-bordered w-full" 
                  placeholder="contacto@empresa.com"
                  value={formData.correo || ''} 
                  onChange={e => setFormData({...formData, correo: e.target.value})} 
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
                  onChange={e => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '').slice(0, 11)})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">Estado</label>
                <select 
                  className="input input-bordered w-full"
                  value={formData.estado}
                  onChange={e => setFormData({...formData, estado: Number(e.target.value)})}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-base-200 flex justify-end gap-3 bg-base-200">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancelar</button>
              <button type="submit" className="btn btn-primary">
                {modalMode === 'create' ? 'Agregar Proveedor' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Modal de Advertencia y Confirmación al Centro de Pantalla */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar Proveedor?"
        message={`¿Estás seguro de que deseas eliminar a "${confirmModal.nombre}" de la base de datos? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Proveedor"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, nombre: '' })}
        tipo="danger"
      />
    </div>
  );
}
