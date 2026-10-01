import React from 'react';
import './Style.css'; // Aquí conectaremos los estilos

export default function Dashboard() {
  return (
    <div className="dashboard-desktop">
      {/* Barra lateral oscura */}
      <aside className="sidebar">
        <div className="logo-section">GymPOS</div>
        <nav className="menu-items">
          {/*botones del menú*/}
        </nav>
      </aside>

      {/* Panel principal */}
      <main className="main-pane">
        <header className="topbar">
          <h2>Panel de Inicio</h2>
          {/* Buscador y perfil */}
        </header>
        
        <section className="dashboard-content">
          {/* tarjetas */}
        </section>
      </main>
    </div>
  );
}
