import React, { useState } from 'react';
import AdminLayout from './Layout/AdminLayout';
import { Plus, Edit, Trash2, Users, Banknote, Dumbbell, CreditCard, Package } from 'lucide-react';

export default function Dashboard({ alCerrarSesion }) {
  // Inicializamos en 'inicio'
  const [activeModule, setActiveModule] = useState('inicio');

  // Vista especial para el Panel de Inicio (Dashboard Principal) con DaisyUI
  const renderInicio = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Panel de Resumen</h2>
      
      {/* Tarjetas de Estadísticas (Usando DaisyUI stats) */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-200 border border-base-300">
        <div className="stat">
          <div className="stat-figure text-primary">
            <Banknote className="w-8 h-8" />
          </div>
          <div className="stat-title text-gray-400">Ingresos Hoy</div>
          <div className="stat-value text-white">$4,200</div>
          <div className="stat-desc text-primary">↗︎ 14% más que ayer</div>
        </div>
        
        <div className="stat lg:border-l border-t lg:border-t-0 border-base-300">
          <div className="stat-figure text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title text-gray-400">Clientes Activos</div>
          <div className="stat-value text-white">412</div>
          <div className="stat-desc text-error">↘︎ 3 vencen hoy</div>
        </div>
        
        <div className="stat lg:border-l border-t lg:border-t-0 border-base-300">
          <div className="stat-figure text-primary">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div className="stat-title text-gray-400">Accesos Hoy</div>
          <div className="stat-value text-white">125</div>
          <div className="stat-desc text-gray-400">Pico de asistencia: 7am</div>
        </div>
      </div>

      {/* Grid para otras gráficas o tablas rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Panel de Actividad Reciente */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-white">Accesos Recientes</h2>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-gray-400 border-base-300">
                    <th>Socio</th>
                    <th>Hora</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-base-300">
                    <td className="text-gray-200">Juan Pérez</td>
                    <td className="text-gray-400">10:45 AM</td>
                    <td><span className="badge badge-success badge-sm text-black font-bold">Permitido</span></td>
                  </tr>
                  <tr className="border-base-300">
                    <td className="text-gray-200">María Gómez</td>
                    <td className="text-gray-400">10:30 AM</td>
                    <td><span className="badge badge-error badge-sm text-white font-bold">Vencido</span></td>
                  </tr>
                  <tr className="border-base-300">
                    <td className="text-gray-200">Carlos López</td>
                    <td className="text-gray-400">09:15 AM</td>
                    <td><span className="badge badge-success badge-sm text-black font-bold">Permitido</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-sm btn-outline btn-primary">Ver Todos</button>
            </div>
          </div>
        </div>

        {/* Panel de Accesos Rápidos */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-white">Atajos Rápidos</h2>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <button onClick={() => setActiveModule('membresia')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-6 gap-3">
                <CreditCard className="w-8 h-8" />
                Nueva Membresía
              </button>
              <button onClick={() => setActiveModule('caja')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-6 gap-3">
                <Banknote className="w-8 h-8" />
                Cobrar
              </button>
              <button onClick={() => setActiveModule('clientes')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-6 gap-3">
                <Users className="w-8 h-8" />
                Buscar Cliente
              </button>
              <button onClick={() => setActiveModule('productos')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-6 gap-3">
                <Package className="w-8 h-8" />
                Vender Producto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- ESTADO PARA GUARDAR LOS USUARIOS DE LA BASE DE DATOS ---
  const [usuariosDb, setUsuariosDb] = React.useState([]);

  // Cada vez que cambie de módulo, revisamos si entró al de "usuarios"
  React.useEffect(() => {
    if (activeModule === 'usuarios') {
      // Hacemos petición GET al backend para traer la lista de usuarios reales
      fetch('http://localhost:8080/api/usuario')
        .then(respuesta => respuesta.json())
        .then(datos => {
          // Nos aseguramos de que los datos sean una lista (arreglo) antes de guardarlos
          if (Array.isArray(datos)) {
            setUsuariosDb(datos);
          } else {
            console.error("El servidor respondió con algo que no es una lista:", datos);
            setUsuariosDb([]);
          }
        })
        .catch(error => console.error("Error cargando usuarios:", error));
    }
  }, [activeModule]);

  // --- VISTA ESPECÍFICA PARA EL CRUD DE USUARIOS ---
  const renderUsuarios = () => (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-200 p-5 rounded-xl shadow-lg border border-base-300 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white capitalize">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-400 mt-1">Administra los accesos y roles del sistema.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary">
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="bg-base-200 rounded-xl shadow-lg border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="text-gray-400 border-base-300 bg-black/20">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Aquí recorremos los usuarios de forma súper segura */}
              {Array.isArray(usuariosDb) && usuariosDb.length > 0 ? (
                usuariosDb.map((user) => (
                  <tr key={user.id} className="border-base-300 hover:bg-base-300 transition-colors text-gray-200">
                    <td className="font-medium text-white">#{user.id}</td>
                    <td>{user.nombre} {user.apellido}</td>
                    <td>{user.correo}</td>
                    <td>{user.telefono}</td>
                    <td>
                      <span className="badge badge-success badge-sm text-black font-bold">
                        {user.estado}
                      </span>
                    </td>
                    <td className="text-right space-x-2">
                      <button className="btn btn-ghost btn-sm text-gray-400 hover:text-primary">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm text-gray-400 hover:text-error"
                        onClick={() => {
                          fetch(`http://localhost:8080/api/usuario/${user.id}`, { method: 'DELETE' })
                            .then(() => {
                              setUsuariosDb(usuariosDb.filter(u => u.id !== user.id));
                            });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                /* Si no hay usuarios o hubo un error al leerlos, mostramos esto */
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-400">
                    No hay usuarios registrados o no se pudieron cargar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // Vista genérica para los otros módulos usando DaisyUI
  const renderModuloGenerico = () => (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-200 p-5 rounded-xl shadow-lg border border-base-300 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white capitalize">
            Gestión de {activeModule}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Módulo en construcción (Próximamente leerá datos de la BD).
          </p>
        </div>
      </div>
      <div className="p-10 text-center text-gray-400 border border-dashed border-base-300 rounded-xl">
        Aún no hay pantalla específica para {activeModule}. 
      </div>
    </>
  );

  return (
    <AdminLayout 
      alCerrarSesion={alCerrarSesion} 
      activeModule={activeModule}
      setActiveModule={setActiveModule}
    >
      {/* Controlamos qué pantalla mostrar según el botón del menú presionado */}
      {activeModule === 'inicio' ? renderInicio() : 
       activeModule === 'usuarios' ? renderUsuarios() : 
       renderModuloGenerico()}
    </AdminLayout>
  );
}
