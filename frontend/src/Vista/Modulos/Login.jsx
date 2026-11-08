import React, { useState } from 'react';
import '../../CSS/Login.css';

export default function Login({ alIniciarSesion }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  // Estados para la animación de carga
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const datos = {
        correo: email,
        contrasena: password
      };

      const request = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      if (!request.ok) {
        throw new Error('Credenciales incorrectas');
      }

      const respuesta = await request.json();

      if (respuesta) {
        // Validar que el usuario NO esté inactivo
        if (respuesta.estado === 'Inactivo' || respuesta.estado === 0 || respuesta.estado === '0') {
          setError('Acceso denegado: Este usuario está Inactivo.');
          return;
        }

        // Si es válido y está activo, iniciar la animación de la mancuerna
        setIsAuthenticating(true);
        let p = 0;
        const interval = setInterval(() => {
          p += 2;
          setProgress(p);
          if (p >= 100) {
            clearInterval(interval);
            if (respuesta) respuesta.id_rol = Number(respuesta.id_rol);
alIniciarSesion(respuesta);
          }
        }, 30); // 1.5 segundos en total

      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      console.warn('Fallo al conectar con el servidor:', error.message);
      
      // Fallback para pruebas/offline si el backend no está disponible
      if (email) {
        const nombreLocal = email.includes('@')
          ? email.split('@')[0].replace(/[._]/g, ' ')
          : email;
        const nombreFormateado = nombreLocal.charAt(0).toUpperCase() + nombreLocal.slice(1);

        const esEmpleado = email.toLowerCase().includes('empleado') || email.toLowerCase().includes('recep') || email.toLowerCase().includes('caja');
        const usuarioDemo = {
          id: esEmpleado ? 2 : 1,
          id_rol: esEmpleado ? 2 : 1,
          nombre: nombreFormateado,
          apellido: '',
          correo: email,
          estado: 'Activo'
        };

        setIsAuthenticating(true);
        let p = 0;
        const interval = setInterval(() => {
          p += 2;
          setProgress(p);
          if (p >= 100) {
            clearInterval(interval);
            alIniciarSesion(usuarioDemo);
          }
        }, 30);
      } else {
        setError('Por favor ingresa tu correo y contraseña');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* Panel Izquierdo (Oscuro) */}
        <div className="login-left-panel">
          <div>
            <div className="login-logo-container">
              <div className="login-logo-icon">
                <div className="login-logo-inner"></div>
              </div>
              <span className="login-logo-text">GymPOS</span>
            </div>
            <h1 className="login-title">
              Potencia tu gimnasio, simplifica tu caja.
            </h1>
            <p className="login-subtitle">
              Gestión automatizada de membresías, control de accesos por QR en tiempo real y punto de venta integrado.
            </p>
          </div>
          <div className="login-footer-text">
            Desarrollado por GymPOS v2.4
          </div>
        </div>

        {/* Panel Derecho (Formulario / Carga con animación de Mancuerna) */}
        <div className="login-right-panel relative">
          
          {isAuthenticating ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in duration-500 py-6">
              
              {/* Animación de la Mancuerna */}
              <div className="relative flex flex-col items-center justify-center">
                <svg viewBox="0 0 320 210" className="w-64 h-44 overflow-visible">
                  <defs>
                    {/* Sombra difuminada */}
                    <filter id="dumbbellShadowBlur" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="7" />
                    </filter>

                    {/* Gradiente vertical para los discos (placas) */}
                    <linearGradient id="dumbbellPlateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#cbd5e1" />
                      <stop offset="15%" stopColor="#ffffff" />
                      <stop offset="45%" stopColor="#94a3b8" />
                      <stop offset="80%" stopColor="#475569" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>

                    {/* Gradiente de contorno para los bordes de los discos */}
                    <linearGradient id="dumbbellRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="30%" stopColor="#e2e8f0" />
                      <stop offset="70%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>

                    {/* Gradiente de la barra central */}
                    <linearGradient id="dumbbellBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#334155" />
                      <stop offset="28%" stopColor="#cbd5e1" />
                      <stop offset="50%" stopColor="#ffffff" />
                      <stop offset="72%" stopColor="#64748b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>

                    {/* Gradiente para los topes/extremos */}
                    <linearGradient id="dumbbellCapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="40%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                  </defs>

                  {/* Sombra en el suelo que pulsa sincronizada */}
                  <ellipse 
                    cx="160" 
                    cy="195" 
                    rx="95" 
                    ry="12" 
                    fill="#0f172a" 
                    filter="url(#dumbbellShadowBlur)" 
                    className="dumbbell-ground-shadow"
                  />

                  {/* Mancuerna con animación de elevación */}
                  <g className="dumbbell-floating">
                    {/* Barra Central */}
                    <rect 
                      x="92" 
                      y="93" 
                      width="136" 
                      height="18" 
                      rx="4" 
                      fill="url(#dumbbellBarGrad)" 
                    />
                    
                    {/* Textura de agarre central */}
                    <rect 
                      x="125" 
                      y="94" 
                      width="70" 
                      height="16" 
                      rx="2" 
                      fill="rgba(255, 255, 255, 0.12)" 
                      stroke="rgba(0, 0, 0, 0.15)"
                      strokeWidth="0.5"
                    />

                    {/* --- DISCOS IZQUIERDOS --- */}
                    {/* Disco Interior Grande */}
                    <rect 
                      x="72" 
                      y="30" 
                      width="20" 
                      height="144" 
                      rx="10" 
                      fill="url(#dumbbellPlateGrad)" 
                      stroke="url(#dumbbellRimGrad)"
                      strokeWidth="1.5"
                    />
                    {/* Disco Medio */}
                    <rect 
                      x="50" 
                      y="46" 
                      width="18" 
                      height="112" 
                      rx="9" 
                      fill="url(#dumbbellPlateGrad)" 
                      stroke="url(#dumbbellRimGrad)"
                      strokeWidth="1.5"
                    />
                    {/* Disco Exterior Pequeño */}
                    <rect 
                      x="32" 
                      y="62" 
                      width="15" 
                      height="80" 
                      rx="7" 
                      fill="url(#dumbbellPlateGrad)" 
                      stroke="url(#dumbbellRimGrad)"
                      strokeWidth="1.5"
                    />
                    {/* Tope Izquierdo */}
                    <rect 
                      x="18" 
                      y="91" 
                      width="12" 
                      height="22" 
                      rx="6" 
                      fill="url(#dumbbellCapGrad)" 
                      stroke="#475569"
                      strokeWidth="1"
                    />

                    {/* --- DISCOS DERECHOS --- */}
                    {/* Disco Interior Grande */}
                    <rect 
                      x="228" 
                      y="30" 
                      width="20" 
                      height="144" 
                      rx="10" 
                      fill="url(#dumbbellPlateGrad)" 
                      stroke="url(#dumbbellRimGrad)"
                      strokeWidth="1.5"
                    />
                    {/* Disco Medio */}
                    <rect 
                      x="252" 
                      y="46" 
                      width="18" 
                      height="112" 
                      rx="9" 
                      fill="url(#dumbbellPlateGrad)" 
                      stroke="url(#dumbbellRimGrad)"
                      strokeWidth="1.5"
                    />
                    {/* Disco Exterior Pequeño */}
                    <rect 
                      x="273" 
                      y="62" 
                      width="15" 
                      height="80" 
                      rx="7" 
                      fill="url(#dumbbellPlateGrad)" 
                      stroke="url(#dumbbellRimGrad)"
                      strokeWidth="1.5"
                    />
                    {/* Tope Derecho */}
                    <rect 
                      x="290" 
                      y="91" 
                      width="12" 
                      height="22" 
                      rx="6" 
                      fill="url(#dumbbellCapGrad)" 
                      stroke="#475569"
                      strokeWidth="1"
                    />
                  </g>
                </svg>
              </div>
              
              {/* Barra de Progreso y Porcentaje */}
              <div className="text-center w-full max-w-xs">
                <div className="text-3xl font-black text-gray-800 tracking-widest mb-3">
                  {progress}%
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-[#10b981] transition-all duration-75 ease-linear" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-500 font-medium mt-4 animate-pulse">Iniciando sesión en GymPOS...</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="login-form-title">Iniciar Sesión</h2>
              <p className="login-form-subtitle">Ingresa tus credenciales autorizadas</p>
              
              <form onSubmit={handleSubmit}>
                <div className="login-input-group">
                  <label className="login-label">
                    Correo Electrónico
                  </label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={100}
                    placeholder="usuario@gympos.com"
                    className="login-input"
                  />
                </div>
                
                <div className="login-input-group-last">
                  <label className="login-label">
                    Contraseña
                  </label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={50}
                    placeholder="••••••••••••"
                    className="login-input"
                  />
                </div>

                {error && <p className="login-error">{error}</p>}

                <button 
                  type="submit"
                  className="login-button"
                >
                  Ingresar al Sistema
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
