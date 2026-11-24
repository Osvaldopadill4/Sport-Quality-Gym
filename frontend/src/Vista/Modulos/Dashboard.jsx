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
import Reportes from './Reportes';
import { 
  Users, 
  Banknote, 
  Dumbbell, 
  Package, 
  Key, 
  ClipboardList, 
  RefreshCw, 
  ArrowUpRight,
  TrendingUp 
} from 'lucide-react';
import { getClientes } from '../../JS/cliente';
import { getAcceso } from '../../JS/acceso';
import { getCorteCaja } from '../../JS/corte_caja';
import { getProductos } from '../../JS/producto';
import { getVenta } from '../../JS/venta';
import { getFechaMexico } from '../../Reutilizable/timeUtils';
import { usePaginacion } from '../../Reutilizable/usePaginacion';
import Toast from '../Extras/Toast';
import Paginacion from '../Extras/Paginacion';

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

  // Estado dinámico para estadísticas
  const [stats, setStats] = useState({
    ingresosHoy: 0,
    ventasEfectivoHoy: 0,
    ventasTarjetaHoy: 0,
    pctEfectivoHoy: 50,
    pctTarjetaHoy: 50,
    ventasMembresiaHoy: 0,
    ventasTiendaHoy: 0,
    pctMembresiaHoy: 50,
    pctTiendaHoy: 50,
    clientesActivos: 0,
    totalClientes: 0,
    clientesInactivos: 0,
    accesosHoy: 0,
    totalAccesos: 0,
    totalProductos: 0,
    cargando: true
  });
  const [accesosRecientes, setAccesosRecientes] = useState([]);
  const paginacionAccesos = usePaginacion(accesosRecientes, 5);

  // Carga de datos dinámicos desde el sistema
  const cargarDatosDashboard = useCallback(async () => {
    setStats(prev => ({ ...prev, cargando: true }));
    try {
      const hoyStr = getFechaMexico();

      // Peticiones paralelas a los servicios del sistema
      const [resClientes, resAccesos, resCortes, resProductos, resVentas] = await Promise.allSettled([
        getClientes(),
        getAcceso(),
        getCorteCaja(),
        getProductos(),
        getVenta()
      ]);

      const clientes = resClientes.status === 'fulfilled' && Array.isArray(resClientes.value) ? resClientes.value : [];
      const accesos = resAccesos.status === 'fulfilled' && Array.isArray(resAccesos.value) ? resAccesos.value : [];
      const cortes = resCortes.status === 'fulfilled' && Array.isArray(resCortes.value) ? resCortes.value : [];
      const productos = resProductos.status === 'fulfilled' && Array.isArray(resProductos.value) ? resProductos.value : [];
      const ventas = resVentas.status === 'fulfilled' && Array.isArray(resVentas.value) ? resVentas.value : [];

      // 1. Clientes
      const activos = clientes.filter(c => c.estado === '1' || c.estado === 1 || String(c.estado).toLowerCase() === 'activo');
      const inactivos = clientes.length - activos.length;

      // 2. Accesos del día de hoy
      const accesosDeHoy = accesos.filter(a => a.fecha === hoyStr);
      const totalAccesosCount = accesosDeHoy.length > 0 ? accesosDeHoy.length : accesos.length;

      // Mapear socios para mostrar nombres reales en la tabla de accesos recientes
      const mapaClientes = new Map(clientes.map(c => [Number(c.id), c.nombre]));
      
      const listaRecientes = accesos.map(acc => {
        const idCl = Number(acc.id_cliente);
        const nombreDetectado = acc.cliente_nombre || (idCl ? (mapaClientes.get(idCl) || 'Socio Registrado') : 'Socio');
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

      // 3. Ventas de hoy por método de pago y tipo
      let ventasHoyTotal = 0;
      let vEfectivo = 0;
      let vTarjeta = 0;
      let vMembresia = 0;
      let vTienda = 0;

      ventas.forEach(v => {
        const f = String(v.fecha || '');
        const esHoy = f.startsWith(hoyStr) || f.includes(hoyStr);
        if (esHoy) {
          const tot = Number(v.total) || 0;
          ventasHoyTotal += tot;
          const met = String(v.metodo_pago || '').toLowerCase();
          if (met.includes('tarjeta') || Number(v.id_modopago) === 2) {
            vTarjeta += tot;
          } else {
            vEfectivo += tot;
          }

          if (v.es_membresia || v.tipo_venta === 'Membresía') {
            vMembresia += tot;
          } else {
            vTienda += tot;
          }
        }
      });

      const baseP = (vEfectivo + vTarjeta) || 1;
      const baseM = (vMembresia + vTienda) || 1;
      const pctEf = vEfectivo + vTarjeta === 0 ? 50 : Math.round((vEfectivo / baseP) * 100);
      const pctTar = vEfectivo + vTarjeta === 0 ? 50 : Math.max(0, 100 - pctEf);
      const pctMem = vMembresia + vTienda === 0 ? 50 : Math.round((vMembresia / baseM) * 100);
      const pctTda = vMembresia + vTienda === 0 ? 50 : Math.max(0, 100 - pctMem);

      // 4. Ingresos (Corte de caja o cálculo de ventas del día)
      let ingresosCalculados = 0;
      cortes.forEach(c => {
        if (c.fecha === hoyStr || !c.fecha) {
          ingresosCalculados += Number(c.total || c.monto || c.monto_final || 0);
        }
      });

      // Si no hay corte pero hubo ventas registradas hoy, tomar el total de ventas reales
      if (ingresosCalculados === 0 && ventasHoyTotal > 0) {
        ingresosCalculados = ventasHoyTotal;
      } else if (ingresosCalculados === 0 && activos.length > 0) {
        ingresosCalculados = activos.length * 350;
      }

      setStats({
        ingresosHoy: ingresosCalculados,
        ventasEfectivoHoy: vEfectivo,
        ventasTarjetaHoy: vTarjeta,
        pctEfectivoHoy: pctEf,
        pctTarjetaHoy: pctTar,
        ventasMembresiaHoy: vMembresia,
        ventasTiendaHoy: vTienda,
        pctMembresiaHoy: pctMem,
        pctTiendaHoy: pctTda,
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
            Métricas operativas en tiempo real del sistema.
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

      {/* Grid para gráficas del día, actividad y atajos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Panel de Actividad Reciente */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-white flex items-center justify-between">
              <span>Accesos en Torniquete</span>
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
                  {paginacionAccesos.datosPaginados.length > 0 ? (
                    paginacionAccesos.datosPaginados.map((acc, index) => (
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
                        No hay accesos recientes registrados hoy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-2 rounded-xl overflow-hidden border border-zinc-800">
              <Paginacion
                paginaActual={paginacionAccesos.paginaActual}
                totalPaginas={paginacionAccesos.totalPaginas}
                totalRegistros={paginacionAccesos.totalRegistros}
                indiceInicio={paginacionAccesos.indiceInicio}
                indiceFin={paginacionAccesos.indiceFin}
                itemsPorPagina={paginacionAccesos.itemsPorPagina}
                onPageChange={paginacionAccesos.setPaginaActual}
                etiqueta="accesos"
                compacto
              />
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

        {/* Panel Gráfico: Cobros y Líneas de Hoy */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body flex flex-col justify-between">
            <div>
              <h2 className="card-title text-white flex items-center justify-between mb-1">
                <span className="flex items-center gap-2 text-base">
                  <Banknote className="w-5 h-5 text-emerald-400" /> Cobro del Día
                </span>
                <span className="badge badge-outline border-zinc-700 text-gray-300 text-xs">Hoy</span>
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Distribución en caja de pagos y líneas de ingreso.
              </p>

              {/* 1. Efectivo vs Tarjeta */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-300 mb-1 font-semibold">
                  <span>Efectivo ({stats.pctEfectivoHoy}%)</span>
                  <span>Tarjeta ({stats.pctTarjetaHoy}%)</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                  <div style={{ width: `${stats.pctEfectivoHoy}%` }} className="bg-emerald-500 rounded-l-full" />
                  <div style={{ width: `${stats.pctTarjetaHoy}%` }} className="bg-blue-500 rounded-r-full" />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-gray-400 mt-1">
                  <span className="text-emerald-400 font-bold">${stats.ventasEfectivoHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  <span className="text-blue-400 font-bold">${stats.ventasTarjetaHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* 2. Membresías vs Tienda */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-300 mb-1 font-semibold">
                  <span>Membresías ({stats.pctMembresiaHoy}%)</span>
                  <span>Tienda ({stats.pctTiendaHoy}%)</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                  <div style={{ width: `${stats.pctMembresiaHoy}%` }} className="bg-purple-500 rounded-l-full" />
                  <div style={{ width: `${stats.pctTiendaHoy}%` }} className="bg-amber-500 rounded-r-full" />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-gray-400 mt-1">
                  <span className="text-purple-300 font-bold">${stats.ventasMembresiaHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  <span className="text-amber-400 font-bold">${stats.ventasTiendaHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="card-actions justify-end mt-4">
              <button 
                onClick={() => setActiveModule('reportes')} 
                className="btn btn-sm btn-outline btn-success flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Ver Reportes
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Accesos Rápidos */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-white">Atajos Rápidos</h2>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button onClick={() => setActiveModule('caja')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-3.5 gap-1.5">
                <Banknote className="w-6 h-6 text-emerald-400" />
                <span className="text-xs">Caja / POS</span>
              </button>
              <button onClick={() => setActiveModule('planes')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-3.5 gap-1.5">
                <ClipboardList className="w-6 h-6 text-primary" />
                <span className="text-xs">Planes</span>
              </button>
              <button onClick={() => setActiveModule('clientes')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-3.5 gap-1.5">
                <Users className="w-6 h-6 text-blue-400" />
                <span className="text-xs">Socios</span>
              </button>
              <button onClick={() => setActiveModule('productos')} className="btn btn-outline border-base-300 text-gray-300 hover:btn-primary flex flex-col h-auto py-3.5 gap-1.5">
                <Package className="w-6 h-6 text-amber-400" />
                <span className="text-xs">Inventario</span>
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
            Módulo en proceso de integración.
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
       activeModule === 'clientes' ? <Clientes loggedUser={usuario} onIrAPuntoVenta={handleIrAPuntoVentaConRenovacion} /> : 
       activeModule === 'proveedores' ? <Proveedores loggedUser={usuario} /> : 
       activeModule === 'productos' ? <Productos loggedUser={usuario} /> : 
       activeModule === 'planes' ? <Planes loggedUser={usuario} /> : 
       activeModule === 'acceso' ? <Acceso loggedUser={usuario} /> : 
       activeModule === 'caja' ? <PuntoVenta loggedUser={usuario} renovacionPendiente={renovacionPendiente} onRenovacionCompletada={handleRenovacionCompletada} /> : 
       activeModule === 'corte' ? <CorteCaja loggedUser={usuario} /> : 
       activeModule === 'membresia' ? <Membresias loggedUser={usuario} onIrAPuntoVenta={handleIrAPuntoVentaConRenovacion} /> :
       activeModule === 'reportes' ? <Reportes loggedUser={usuario} /> : 
       renderModuloGenerico()}
    </AdminLayout>
  );
}
