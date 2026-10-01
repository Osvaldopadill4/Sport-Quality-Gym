import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Power } from 'lucide-react';
import '../CSS/Usuarios.css';

export default function Usuarios({ loggedUser }) {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    fetch('http://localhost:8080/api/usuario')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUsuarios(data);
        } else {
          setUsuarios([
            { id: 1, id_rol: 1, nombre: 'Sofía', apellido: 'Martínez', telefono: '+56 9 8765 4321', correo: 'sofia.mtz@gmail.com', estado: 1 },
            { id: 2, id_rol: 2, nombre: 'Alejandro', apellido: 'Silva', telefono: '+56 9 1234 5678', correo: 'ale.silva@outlook.com', estado: 1 },
            { id: 3, id_rol: 2, nombre: 'Marta', apellido: 'Rodríguez', telefono: '+56 9 5555 4433', correo: 'marta.r@yahoo.com', estado: 0 },
            { id: 4, id_rol: 1, nombre: 'Bastián', apellido: 'Tapia', telefono: '+56 9 9900 1122', correo: 'bastian.t@cyberfit.com', estado: 1 },
            { id: 5, id_rol: 2, nombre: 'Javiera', apellido: 'Muñoz', telefono: '+56 9 8833 2211', correo: 'javi.munoz@gmail.com', estado: 0 },
          ]);
        }
      })
      .catch(() => {
        setUsuarios([
          { id: 1, id_rol: 1, nombre: 'Sofía', apellido: 'Martínez', telefono: '+56 9 8765 4321', correo: 'sofia.mtz@gmail.com', estado: 1 },
          { id: 2, id_rol: 2, nombre: 'Alejandro', apellido: 'Silva', telefono: '+56 9 1234 5678', correo: 'ale.silva@outlook.com', estado: 1 },
          { id: 3, id_rol: 2, nombre: 'Marta', apellido: 'Rodríguez', telefono: '+56 9 5555 4433', correo: 'marta.r@yahoo.com', estado: 0 },
          { id: 4, id_rol: 1, nombre: 'Bastián', apellido: 'Tapia', telefono: '+56 9 9900 1122', correo: 'bastian.t@cyberfit.com', estado: 1 },
          { id: 5, id_rol: 2, nombre: 'Javiera', apellido: 'Muñoz', telefono: '+56 9 8833 2211', correo: 'javi.munoz@gmail.com', estado: 0 },
        ]);
      });
  }, []);

  const total = usuarios.length;
  const activos = usuarios.filter(u => u.estado === 1 || u.estado === 'Activo').length;
  const inactivos = total - activos;

  const getRolName = (id_rol) => {
    if (id_rol === 1) return 'Administrador';
    if (id_rol === 2) return 'Recepcionista';
    return 'Usuario';
  };

  const handleDarDeBaja = (id) => {
    setUsuarios(usuarios.map(u => {
      if (u.id === id) {
        return { ...u, estado: (u.estado === 1 || u.estado === 'Activo' ? 0 : 1) };
      }
      return u;
    }));
    // Aquí iría el fetch PUT para actualizar el estado en el backend
  };

  return (
    <div className="usuarios-wrapper">
      {/* Top Header - Simulating Image 1 inside the component for demonstration */}
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
              placeholder="Buscar usuarios, roles..."
            />
          </div>
          <div className="usuarios-terminal-badge">
            <span className="usuarios-terminal-dot"></span>
            Terminal Activo
          </div>
          <div className="usuarios-profile">
            <div className="usuarios-profile-info">
              <div className="usuarios-profile-name">
                {loggedUser ? `${loggedUser.nombre} ${loggedUser.apellido}` : 'Cargando...'}
              </div>
              <div className="usuarios-profile-role">
                {loggedUser ? getRolName(loggedUser.id_rol) : '...'}
              </div>
            </div>
            <div className="usuarios-profile-avatar">
              <img src={`https://i.pravatar.cc/150?u=${loggedUser?.id || 11}`} alt="admin" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Create Button */}
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
        <button className="usuarios-btn-nuevo">
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      {/* Table */}
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
            {usuarios
              .filter(u => {
                if (filtro === 'activos') return u.estado === 1 || u.estado === 'Activo';
                if (filtro === 'inactivos') return u.estado === 0 || u.estado === 'Inactivo';
                return true;
              })
              .map(u => (
              <tr key={u.id}>
                <td className="usuarios-td-user">
                  <div className="usuarios-td-avatar">
                    <img src={`https://i.pravatar.cc/150?u=${u.id}`} alt="avatar" />
                  </div>
                  <span className="usuarios-td-name">{u.nombre} {u.apellido}</span>
                </td>
                <td className="usuarios-td-text">{u.correo}</td>
                <td className="usuarios-td-text">{u.telefono}</td>
                <td className="usuarios-td-text">{getRolName(u.id_rol)}</td>
                <td>
                  {(u.estado === 1 || u.estado === 'Activo') ? (
                    <span className="usuarios-badge activo">Activo</span>
                  ) : (
                    <span className="usuarios-badge inactivo">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="usuarios-table-actions">
                    <button className="usuarios-action-btn edit" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button 
                      className={`usuarios-action-btn ${(u.estado === 1 || u.estado === 'Activo') ? 'power-off' : 'power-on'}`} 
                      title={(u.estado === 1 || u.estado === 'Activo') ? "Dar de baja" : "Dar de alta"}
                      onClick={() => handleDarDeBaja(u.id)}
                    >
                      <Power size={16} />
                    </button>
                    <button className="usuarios-action-btn delete" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Footer Pagination */}
        <div className="usuarios-pagination">
          <span className="usuarios-pagination-text">Mostrando {usuarios.length} de {total} usuarios</span>
          <div className="usuarios-pagination-buttons">
            <button className="usuarios-page-btn prev">Anterior</button>
            <button className="usuarios-page-btn next">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
