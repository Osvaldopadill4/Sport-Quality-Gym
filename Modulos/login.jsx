import React from 'react';
import { Eye } from 'lucide-react';

export default function IniciarSesion({ alIniciarSesion }) {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans">
      <div className="bg-white flex flex-col md:flex-row w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Panel Izquierdo (Oscuro) */}
        <div className="bg-[#111827] text-white p-12 flex flex-col justify-between w-full md:w-1/2 border-r border-dashed border-gray-600">
          <div>
            <div className="flex items-center gap-2 mb-16">
              <div className="bg-teal-400 p-2 rounded-lg">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-bold">GymPOS</span>
            </div>
            <h1 className="text-3xl font-bold mb-4 leading-tight">
              Potencia tu gimnasio, simplifica tu caja.
            </h1>
            <p className="text-gray-400 text-sm">
              Gestión automatizada de membresías, control de accesos por QR en tiempo real y punto de venta integrado.
            </p>
          </div>
          <div className="text-xs text-gray-500 mt-12">
            Desarrollado por GymPOS v2.4
          </div>
        </div>

        {/* Panel Derecho (Formulario) */}
        <div className="p-12 flex flex-col justify-center w-full md:w-1/2 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
          <p className="text-sm text-gray-500 mb-8">Ingresa tus credenciales autorizadas</p>
          
          <form onSubmit={(e) => { e.preventDefault(); alIniciarSesion(); }}>
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                Correo Electrónico
              </label>
              <input 
                type="email" 
                defaultValue="recepcion@cyberfit.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition text-sm"
              />
            </div>
            
            <div className="mb-8 relative">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <input 
                type="password" 
                defaultValue="••••••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition text-sm"
              />
              <button type="button" className="absolute right-4 top-9 text-gray-400 hover:text-gray-600">
                <Eye size={18} />
              </button>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#14b8a6] hover:bg-teal-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}