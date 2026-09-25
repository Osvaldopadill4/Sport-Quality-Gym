import React, { useState } from 'react';
import '../CSS/Login.css';

export default function Login({ alIniciarSesion }) {
  const [email, setEmail] = useState('recepcion@cyberfit.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    // Simulación del login para que tú puedas probar la vista sin backend
    if (email && password) {
      if (alIniciarSesion) {
        alIniciarSesion({ token: 'mock-token' });
      }
    } else {
      setError('Por favor, ingresa tus credenciales.');
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

        {/* Panel Derecho (Formulario) */}
        <div className="login-right-panel">
          <h2 className="login-form-title">Iniciar Sesión</h2>
          <p className="login-form-subtitle">Ingresa tus credenciales autorizadas</p>
          
          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label className="login-label">
                Correo Electrónico
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />
            </div>
            
            <div className="login-input-group-last">
              <label className="login-label">
                Contraseña
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
        </div>
      </div>
    </div>
  );
}
