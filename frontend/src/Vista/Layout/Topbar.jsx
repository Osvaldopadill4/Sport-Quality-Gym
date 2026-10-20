import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

export default function Topbar({ onMenuClick, activeModule, usuario }) {
  // Formatear el nombre del módulo activo para mostrarlo
  const moduleName = activeModule.charAt(0).toUpperCase() + activeModule.slice(1);

  // Obtener usuario actual (prop o localStorage)
  const usuarioActivo = usuario || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const nombre = usuarioActivo?.nombre 
    ? `${usuarioActivo.nombre} ${usuarioActivo.apellido || ''}`.trim() 
    : 'Usuario';

  const rol = usuarioActivo?.id_rol === 1 ? 'Administrador' : usuarioActivo?.id_rol === 2 ? 'Recepcionista' : 'En línea';

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-zinc-950 border-b border-zinc-800 shadow-sm">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-green-500 mr-4"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-100 capitalize">
          {moduleName.replace('-', ' ')}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-green-500 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-white leading-tight">
              {nombre}
            </div>
            <div className="text-xs text-green-500">
              {rol}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-500 text-black flex items-center justify-center font-bold shadow-md cursor-pointer">
            {usuarioActivo?.nombre ? usuarioActivo.nombre.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </header>
  );
}
