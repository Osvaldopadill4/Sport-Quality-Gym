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

  // Vista genérica para los otros módulos usando DaisyUI
  const renderModuloGenerico = () => (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-200 p-5 rounded-xl shadow-lg border border-base-300 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white capitalize">
            Gestión de {activeModule}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Administra los registros y detalles de este módulo.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline border-base-300 text-gray-300 hover:bg-base-300 hover:border-gray-500">
            Exportar
          </button>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Nuevo Registro
          </button>
        </div>
      </div>

      <div className="bg-base-200 rounded-xl shadow-lg border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="text-gray-400 border-base-300 bg-black/20">
              <tr>
                <th>ID</th>
                <th>Nombre / Descripción</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((item) => (
                <tr key={item} className="border-base-300 hover:bg-base-300 transition-colors text-gray-200">
                  <td className="font-medium text-white">#000{item}</td>
                  <td>Ejemplo de Dato {item}</td>
                  <td>
                    <span className="badge badge-success badge-sm text-black font-bold">
                      Activo
                    </span>
                  </td>
                  <td className="text-gray-400">27 Oct 2026</td>
                  <td className="text-right space-x-2">
                    <button className="btn btn-ghost btn-sm text-gray-400 hover:text-primary">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost btn-sm text-gray-400 hover:text-error">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 bg-base-200 border-t border-base-300">
          <span className="text-sm text-gray-400">
            Mostrando <span className="font-medium text-white">1</span> a <span className="font-medium text-white">3</span> de <span className="font-medium text-white">24</span>
          </span>
          <div className="flex space-x-2">
            <button className="btn btn-sm btn-outline border-base-300 text-gray-300 hover:bg-base-300">
              Anterior
            </button>
            <button className="btn btn-sm btn-primary">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AdminLayout 
      alCerrarSesion={alCerrarSesion} 
      activeModule={activeModule}
      setActiveModule={setActiveModule}
    >
      {activeModule === 'inicio' ? renderInicio() : renderModuloGenerico()}
    </AdminLayout>
  );
}
