import React from 'react';
import '../CSS/Dashboard.css';

export default function Dashboard({ alCerrarSesion }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Panel de Control - GymPOS</h1>
          <button 
            onClick={alCerrarSesion}
            className="dashboard-logout-btn"
          >
            Cerrar Sesión
          </button>
        </header>

        <main className="dashboard-main">
          <div>
            <h2 className="dashboard-welcome-title">Bienvenido al sistema</h2>
            <p className="dashboard-welcome-text">
              eso wazin wazaaaaa
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
