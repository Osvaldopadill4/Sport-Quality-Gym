import React, { useState } from 'react';
import Login from './Vista/Modulos/Login';
import Dashboard from './Vista/Modulos/Dashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gymton_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('gymton_auth');
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('gymton_token') || null;
  });

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setToken(data?.token || 'dummy-token');

    const user = data || {
      nombre: 'Usuario',
      apellido: '',
      id_rol: 1
    };
    setCurrentUser(user);

    try {
      localStorage.setItem('gymton_auth', 'true');
      localStorage.setItem('gymton_token', data?.token || 'dummy-token');
      localStorage.setItem('gymton_current_user', JSON.stringify(user));
      // Bandera para mostrar la alerta de bienvenida
      sessionStorage.setItem('gymton_mostrar_bienvenida', 'true');
    } catch (e) {
      console.error('Error guardando sesión:', e);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem('gymton_auth');
      localStorage.removeItem('gymton_token');
      localStorage.removeItem('gymton_current_user');
      sessionStorage.removeItem('gymton_mostrar_bienvenida');
    } catch (e) {
      console.error('Error eliminando sesión:', e);
    }
  };

  return (
    <div>
      {!isAuthenticated ? (
        <Login alIniciarSesion={handleLogin} />
      ) : (
        <Dashboard 
          usuario={currentUser} 
          token={token} 
          alCerrarSesion={handleLogout} 
        />
      )}
    </div>
  );
}

export default App;