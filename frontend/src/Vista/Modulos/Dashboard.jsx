import React, { useState } from 'react';
import AdminLayout from '../Layout/AdminLayout';
import Usuarios from './Usuarios';
import Clientes from './Clientes';
import Proveedores from './Proveedores';
import Productos from './Productos';
import Planes from './Planes';
import Acceso from './Acceso';
import PuntoVenta from './PuntoVenta';
import CorteCaja from './CorteCaja';
import Membresias from './Membresias';
import { Users, Banknote, Dumbbell, Package, Key, ClipboardList } from 'lucide-react';

export default function Dashboard({ usuario, alCerrarSesion }) {
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
            <h2 className="card-title text-white flex items-center justify-between">
              <span>Accesos Recientes</span>
              <span className="badge badge-primary badge-outline text-xs">En Vivo</span>
            </h2>
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
                    <td className="text-gray-200">Juan Pérez García</td>
                    <td className="text-gray-400">07:15 AM</td>
                    <td><span className="badge badge-success badge-sm text-black font-bold">Permitido</span></td>
                  </tr>
                  <tr className="border-base-300">
                    <td className="text-gray-200">Carolina Gómez Soto</td>
                    <td className="text-gray-400">08:30 AM</td>
                    <td><span className="badge badge-success badge-sm text-black font-bold">Permitido</span></td>
                  </tr>
                  <tr className="border-base-300">
                    <td className="text-gray-200">Sofía Mendoza Luna</td>
                    <td className="text-gray-400">09:02 AM</td>
                    <td><span className="badge badge-warning badge-sm text-black font-bold">Por Vencer (3d)</span></td>
                  </tr>
                  <tr className="border-base-300">
                    <td className="text-gray-200">Roberto Sánchez Ruiz</td>
                    <td className="text-gray-400">09:45 AM</td>
                    <td><span className="badge badge-error badge-sm text-white font-bold">Vencido</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="card-actions justify-end mt-4">
              <button 
                onClick={() => setActiveModule('acceso')} 
                className="btn btn-sm btn-outline btn-primary flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Ir a Torniquetes
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Accesos Rápidos */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-white">Atajos Rápidos</h2>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <button onClick={() => setActiveModule('acceso')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-5 gap-2">
                <Key className="w-7 h-7 text-emerald-400" />
                Torniquetes / Acceso
              </button>
              <button onClick={() => setActiveModule('planes')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-5 gap-2">
                <ClipboardList className="w-7 h-7 text-primary" />
                Planes y Precios
              </button>
              <button onClick={() => setActiveModule('clientes')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-5 gap-2">
                <Users className="w-7 h-7 text-blue-400" />
                Socios / Clientes
              </button>
              <button onClick={() => setActiveModule('productos')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-5 gap-2">
                <Package className="w-7 h-7 text-amber-400" />
                Inventario Productos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
       activeModule === 'usuarios' ? <Usuarios loggedUser={usuario} /> : 
       activeModule === 'clientes' ? <Clientes loggedUser={usuario} /> : 
       activeModule === 'proveedores' ? <Proveedores loggedUser={usuario} /> : 
       activeModule === 'productos' ? <Productos loggedUser={usuario} /> : 
       activeModule === 'planes' ? <Planes loggedUser={usuario} /> : 
       activeModule === 'acceso' ? <Acceso loggedUser={usuario} /> : 
       activeModule === 'caja' ? <PuntoVenta loggedUser={usuario} /> : 
       activeModule === 'corte' ? <CorteCaja loggedUser={usuario} /> : 
       activeModule === 'membresia' ? <Membresias loggedUser={usuario} /> : 
       renderModuloGenerico()}
    </AdminLayout>
  );
}
