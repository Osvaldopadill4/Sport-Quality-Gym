import React, { useState } from 'react';
import Login from './Vista/Modulos/Login';
import Dashboard from './Vista/Modulos/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  const handleLogin = (data) => {
    // Al iniciar sesión exitosamente, guardamos el token
    setIsAuthenticated(true);
    setToken(data?.token || 'dummy-token');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <Login alIniciarSesion={handleLogin} />
      ) : (
        <Dashboard token={token} alCerrarSesion={handleLogout} />
      )}
    </div>
  );
}

export default App;