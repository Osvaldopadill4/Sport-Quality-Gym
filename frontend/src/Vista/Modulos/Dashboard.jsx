import React, { useState, useEffect } from 'react';
import AdminLayout from '../Layout/AdminLayout';
import Usuarios from './Usuarios';
import Clientes from './Clientes';
import Proveedores from './Proveedores';
import { Users, Banknote, Dumbbell, CreditCard, Package } from 'lucide-react';
import Toast from '../Componentes/Toast';

export default function Dashboard({ usuario, alCerrarSesion }) {
  const [activeModule, setActiveModule] = useState('inicio');
  const [alerta, setAlerta] = useState(null);

  // Obtener usuario actual (prop o localStorage)
  const usuarioActual = usuario || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const nombreUsuario = usuarioActual?.nombre 
    ? `${usuarioActual.nombre} ${usuarioActual.apellido || ''}`.trim() 
    : 'Usuario';

  // Mostrar mensaje de bienvenida al iniciar sesión
  useEffect(() => {
    const debeMostrar = sessionStorage.getItem('gymton_mostrar_bienvenida');
    if (debeMostrar) {
      sessionStorage.removeItem('gymton_mostrar_bienvenida');
      setAlerta({
        tipo: 'success',
        mensaje: `Bienvenido - ${nombreUsuario}`
      });
    }
  }, [nombreUsuario]);

  // Vista especial para el Panel de Inicio (Dashboard Principal)
  const renderInicio = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Bienvenido - {nombreUsuario} 👋
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Panel de control operativo y resumen de actividades del gimnasio.
          </p>
        </div>
      </div>
      
      {/* Tarjetas de Estadísticas */}
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

      {/* Grid para actividad reciente y atajos */}
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
      usuario={usuarioActual}
    >
      {/* Toast de Bienvenida */}
      <Toast alerta={alerta} onClose={() => setAlerta(null)} />

      {/* Control de pantallas */}
      {activeModule === 'inicio' ? renderInicio() : 
       activeModule === 'usuarios' ? <Usuarios loggedUser={usuarioActual} /> : 
       activeModule === 'clientes' ? <Clientes loggedUser={usuarioActual} /> : 
       activeModule === 'proveedores' ? <Proveedores loggedUser={usuarioActual} /> : 
       renderModuloGenerico()}
    </AdminLayout>
  );
}
