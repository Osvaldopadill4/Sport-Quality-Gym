import React from 'react';
import { 
  LayoutDashboard,
  Banknote, Calculator, Key, Package, 
  CreditCard, ClipboardList, Users, Truck, UserCog, 
  BarChart3, LogOut, X, ShieldCheck, UserCheck 
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'caja', label: 'Punto de Venta / Caja', icon: Banknote },
  { id: 'corte', label: 'Corte de Caja', icon: Calculator },
  { id: 'acceso', label: 'Acceso / Torniquetes', icon: Key },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'membresia', label: 'Membresía', icon: CreditCard },
  { id: 'planes', label: 'Planes', icon: ClipboardList },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'proveedores', label: 'Proveedores', icon: Truck },
  { id: 'usuarios', label: 'Usuarios', icon: UserCog },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
];

export default function Sidebar({ isOpen, setIsOpen, activeModule, setActiveModule, alCerrarSesion, loggedUser }) {
  const user = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const idRol = Number(user?.id_rol || user?.rol_id || user?.rol);
  const esAdmin = idRol === 1;
  // Restricciones estrictas para Empleados (id_rol === 2): Únicamente Productos, Punto de Venta (caja), Acceso, Clientes y Membresías
  const modulosPermitidosEmpleado = ['productos', 'caja', 'acceso', 'membresia', 'clientes'];

  const itemsVisibles = esAdmin 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => modulosPermitidosEmpleado.includes(item.id));

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-black border-r border-zinc-800 text-gray-300 transform transition-transform duration-300 ease-in-out flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex items-center justify-between h-16 px-5 bg-black border-b border-zinc-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src="/logo-gym.png" alt="Gym Sport" className="w-9 h-9 object-contain shrink-0" />
          <div className="flex flex-col leading-tight truncate">
            <span className="text-sm font-black tracking-wider text-white">GYM SPORT</span>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Quality Center</span>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-green-500">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Indicador de Rol y Perfil */}
      <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800/80">
        <div className="flex items-center gap-2 text-xs font-semibold">
          {esAdmin ? (
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <UserCheck size={16} className="text-blue-400 shrink-0" />
          )}
          <div className="truncate">
            <span className="text-white block truncate">{user?.nombre || 'Usuario'}</span>
            <span className={esAdmin ? 'text-emerald-400 text-[11px]' : 'text-blue-400 text-[11px]'}>
              {esAdmin ? (Number(user?.id) === 1 ? 'Administrador Principal' : 'Administrador') : idRol === 2 ? 'Recepcionista' : 'Empleado'}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {itemsVisibles.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                setIsOpen(false);
              }}
              className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-green-600 text-black shadow-lg shadow-green-900/20 font-bold' 
                  : 'text-gray-400 hover:bg-zinc-800 hover:text-green-400'
                }`}
            >
              <Icon className="w-5 h-5 mr-3 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button 
          onClick={alCerrarSesion}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-zinc-800 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
