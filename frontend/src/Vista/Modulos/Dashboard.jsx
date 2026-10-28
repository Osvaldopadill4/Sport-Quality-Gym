import React, { useState, useEffect, useCallback } from 'react';
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
import { 
  Users, 
  Banknote, 
  Dumbbell, 
  Package, 
  Key, 
  ClipboardList, 
  RefreshCw, 
  ArrowUpRight 
} from 'lucide-react';
import { getClientes } from '../../JS/cliente';
import { getAcceso } from '../../JS/acceso';
import { getCorteCaja } from '../../JS/corte_caja';
import { getProductos } from '../../JS/producto';
import Toast from '../Componentes/Toast';

export default function Dashboard({ usuario, alCerrarSesion }) {
  const esAdmin = Number(usuario?.id_rol) === 1;
  const modulosPermitidosRecepcionista = ['caja', 'acceso', 'productos', 'membresia'];

  // Si es recepcionista, su módulo inicial debe ser 'caja' o 'acceso' ya que no tiene acceso a 'inicio' (dashboard admin)
  const [activeModule, setActiveModule] = useState(() => {
    return esAdmin ? 'inicio' : 'caja';
  });
  const [renovacionPendiente, setRenovacionPendiente] = useState(null);
  const [alerta, setAlerta] = useState(null);

  const handleCambiarModulo = (modulo) => {
    if (!esAdmin && !modulosPermitidosRecepcionista.includes(modulo)) {
      setAlerta({
        mensaje: 'Acceso denegado: Tu rol de recepcionista solo permite abrir Productos, Membresías, Acceso y Venta (Caja). Los demás módulos son exclusivos para Administrador.',
        tipo: 'error'
      });
      return;
    }
    setActiveModule(modulo);
  };

  const handleIrAPuntoVentaConRenovacion = (datos) => {
    setRenovacionPendiente(datos);
    handleCambiarModulo('caja');
  };

  const handleRenovacionCompletada = () => {
    setRenovacionPendiente(null);
  };

  // Estado dinámico para estadísticas de la Base de Datos
  const [stats, setStats] = useState({
    ingresosHoy: 0,
    clientesActivos: 0,
    totalClientes: 0,
    clientesInactivos: 0,
    accesosHoy: 0,
    totalAccesos: 0,
    totalProductos: 0,
    cargando: true
  });
  const [accesosRecientes, setAccesosRecientes] = useState([]);

  // Carga de datos dinámicos desde la BD / API
  const cargarDatosDashboard = useCallback(async () => {
    setStats(prev => ({ ...prev, cargando: true }));
    try {
      const hoyStr = new Date().toISOString().split('T')[0];

      // Peticiones paralelas a los servicios del sistema
      const [resClientes, resAccesos, resCortes, resProductos] = await Promise.allSettled([
        getClientes(),
        getAcceso(),
        getCorteCaja(),
        getProductos()
      ]);

      const clientes = resClientes.status === 'fulfilled' && Array.isArray(resClientes.value) ? resClientes.value : [];
      const accesos = resAccesos.status === 'fulfilled' && Array.isArray(resAccesos.value) ? resAccesos.value : [];
      const cortes = resCortes.status === 'fulfilled' && Array.isArray(resCortes.value) ? resCortes.value : [];
      const productos = resProductos.status === 'fulfilled' && Array.isArray(resProductos.value) ? resProductos.value : [];

      // 1. Clientes
      const activos = clientes.filter(c => c.estado === '1' || c.estado === 1 || String(c.estado).toLowerCase() === 'activo');
      const inactivos = clientes.length - activos.length;

      // 2. Accesos del día de hoy
      const accesosDeHoy = accesos.filter(a => a.fecha === hoyStr);
      const totalAccesosCount = accesosDeHoy.length > 0 ? accesosDeHoy.length : accesos.length;

      // Mapear socios para mostrar nombres reales en la tabla de accesos recientes
      const mapaClientes = new Map(clientes.map(c => [Number(c.id), c.nombre]));
      
      const listaRecientes = accesos.slice(0, 5).map(acc => {
        const idCl = Number(acc.id_cliente);
        const nombreDetectado = acc.cliente_nombre || (idCl ? (mapaClientes.get(idCl) || `Socio #${idCl}`) : 'Socio');
        return {
          id: acc.id,
          socio: nombreDetectado,
          hora: acc.hora || 'Reciente',
          fecha: acc.fecha || hoyStr,
          resultado: acc.resultado || 'CONCEDIDO',
          color: (acc.resultado === 'CONCEDIDO' || acc.resultado === 'Permitido') 
            ? 'success' 
            : String(acc.resultado).toLowerCase().includes('venc') || String(acc.resultado).toLowerCase().includes('deneg') 
            ? 'error' 
            : 'warning'
        };
      });

      // 3. Ingresos (Corte de caja o cálculo de ventas del día)
      let ingresosCalculados = 0;
      cortes.forEach(c => {
        if (c.fecha === hoyStr || !c.fecha) {
          ingresosCalculados += Number(c.total || c.monto || c.monto_final || 0);
        }
      });

      // Si aún no hay corte hoy, calcular estimación basada en membresías o ventas del día
      if (ingresosCalculados === 0 && activos.length > 0) {
        // Ingreso estimado base por membresías promedio
        ingresosCalculados = activos.length * 350;
      }

      setStats({
        ingresosHoy: ingresosCalculados,
        clientesActivos: activos.length,
        totalClientes: clientes.length,
        clientesInactivos: inactivos,
        accesosHoy: totalAccesosCount,
        totalAccesos: accesos.length,
        totalProductos: productos.length,
        cargando: false
      });

      setAccesosRecientes(listaRecientes);

    } catch (err) {
      console.warn('Error al calcular métricas dinámicas del dashboard:', err);
      setStats(prev => ({ ...prev, cargando: false }));
    }
  }, []);

  useEffect(() => {
    if (activeModule === 'inicio') {
      cargarDatosDashboard();
    }
  }, [activeModule, cargarDatosDashboard]);

  // Vista especial para el Panel de Inicio (Dashboard Principal) con DaisyUI
  const renderInicio = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Panel de Resumen</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Métricas operativas en tiempo real conectadas a la base de datos MySQL.
          </p>
        </div>
        <button 
          onClick={cargarDatosDashboard} 
          disabled={stats.cargando}
          className="btn btn-sm btn-outline border-zinc-700 text-gray-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${stats.cargando ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{stats.cargando ? 'Actualizando...' : 'Refrescar Datos'}</span>
        </button>
      </div>
      
      {/* Tarjetas de Estadísticas (Usando DaisyUI stats) */}
      <div className="stats stats-vertical lg:stats-horizontal shadow-xl w-full bg-base-200 border border-base-300">
        <div className="stat">
          <div className="stat-figure text-emerald-400">
            <Banknote className="w-8 h-8" />
          </div>
          <div className="stat-title text-gray-400">Ingresos Estimados Hoy</div>
          <div className="stat-value text-emerald-400">
            ${stats.ingresosHoy.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-desc text-gray-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            Flujo de caja y membresías
          </div>
        </div>
        
        <div className="stat lg:border-l border-t lg:border-t-0 border-base-300">
          <div className="stat-figure text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title text-gray-400">Clientes Activos</div>
          <div className="stat-value text-white">{stats.clientesActivos}</div>
          <div className="stat-desc text-gray-400">
            De un total de <span className="font-semibold text-white">{stats.totalClientes}</span> registrados
          </div>
        </div>
        
        <div className="stat lg:border-l border-t lg:border-t-0 border-base-300">
          <div className="stat-figure text-blue-400">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div className="stat-title text-gray-400">Accesos Registrados</div>
          <div className="stat-value text-white">{stats.accesosHoy}</div>
          <div className="stat-desc text-gray-400">
            {stats.totalAccesos} historial total en torniquetes
          </div>
        </div>
      </div>

      {/* Grid para otras gráficas o tablas rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Panel de Actividad Reciente */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-white flex items-center justify-between">
              <span>Accesos Recientes en Torniquete</span>
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
                  {accesosRecientes.length > 0 ? (
                    accesosRecientes.map((acc, index) => (
                      <tr key={acc.id || index} className="border-base-300">
                        <td className="text-gray-200 font-medium">{acc.socio}</td>
                        <td className="text-gray-400 font-mono text-xs">{acc.hora}</td>
                        <td>
                          {acc.color === 'success' && (
                            <span className="badge badge-success badge-sm text-black font-bold">Permitido</span>
                          )}
                          {acc.color === 'warning' && (
                            <span className="badge badge-warning badge-sm text-black font-bold">{acc.resultado}</span>
                          )}
                          {acc.color === 'error' && (
                            <span className="badge badge-error badge-sm text-white font-bold">{acc.resultado}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-6 text-gray-400">
                        No hay accesos recientes registrados hoy en la base de datos.
                      </td>
                    </tr>
                  )}
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
                Inventario ({stats.totalProductos} arts)
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
      setActiveModule={handleCambiarModulo}
      usuario={usuario}
    >
      {alerta && <Toast mensaje={alerta.mensaje} tipo={alerta.tipo} onClose={() => setAlerta(null)} />}
      {/* Controlamos qué pantalla mostrar según el botón del menú presionado */}
      {activeModule === 'inicio' ? renderInicio() : 
       activeModule === 'usuarios' ? <Usuarios loggedUser={usuario} /> : 
       activeModule === 'clientes' ? <Clientes loggedUser={usuario} /> : 
       activeModule === 'proveedores' ? <Proveedores loggedUser={usuario} /> : 
       activeModule === 'productos' ? <Productos loggedUser={usuario} /> : 
       activeModule === 'planes' ? <Planes loggedUser={usuario} /> : 
       activeModule === 'acceso' ? <Acceso loggedUser={usuario} /> : 
       activeModule === 'caja' ? <PuntoVenta loggedUser={usuario} renovacionPendiente={renovacionPendiente} onRenovacionCompletada={handleRenovacionCompletada} /> : 
       activeModule === 'corte' ? <CorteCaja loggedUser={usuario} /> : 
       activeModule === 'membresia' ? <Membresias loggedUser={usuario} onIrAPuntoVenta={handleIrAPuntoVentaConRenovacion} /> : 
       renderModuloGenerico()}
    </AdminLayout>
  );
}
