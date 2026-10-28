import React from 'react';
import { 
  LayoutDashboard,
  Banknote, Calculator, Key, Package, Dumbbell, 
  CreditCard, ClipboardList, Users, Truck, UserCog, 
  BarChart3, LogOut, X, ShieldCheck, UserCheck 
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'caja', label: 'Punto de Venta / Caja', icon: Banknote },
  { id: 'corte', label: 'Corte de Caja', icon: Calculator },
  { id: 'acceso', label: 'Acceso / Torniquetes', icon: Key },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'ejercicio', label: 'Gestión de Ejercicio', icon: Dumbbell },
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

  const esAdmin = Number(user?.id_rol) === 1;
  const modulosPermitidosRecepcionista = ['caja', 'acceso', 'productos', 'membresia'];

  // Solo rol 1 puede navegar por todos los módulos.
  // Recepcionista (id_rol === 2) solo puede abrir productos, membresias, acceso y venta (caja).
  const itemsVisibles = esAdmin 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => modulosPermitidosRecepcionista.includes(item.id));

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-black border-r border-zinc-800 text-gray-300 transform transition-transform duration-300 ease-in-out flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex items-center justify-between h-16 px-6 bg-black border-b border-zinc-800">
        <span className="text-2xl font-black tracking-wider text-green-500 flex items-center gap-2">
          <Dumbbell className="w-8 h-8 text-green-500" />
          GYM<span className="text-white">POS</span>
        </span>
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
              {esAdmin ? (user?.id === 1 ? 'Admin Master (ID 1)' : 'Administrador') : 'Recepcionista'}
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
