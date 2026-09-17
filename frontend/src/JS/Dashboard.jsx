import React, { useEffect, useState } from 'react';
import { getDashboardData } from './api';

export default function Dashboard({ token, alCerrarSesion }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si necesitas traer datos del backend Spring Boot al cargar el dashboard
    const fetchData = async () => {
      try {
        const dashboardData = await getDashboardData(token);
        setData(dashboardData);
      } catch (err) {
        setError('No se pudo cargar la información del dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Control - GymPOS</h1>
          <button 
            onClick={alCerrarSesion}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          >
            Cerrar Sesión
          </button>
        </header>

        <main className="bg-white p-6 rounded-lg shadow-sm min-h-[400px]">
          {loading ? (
            <p className="text-gray-500">Cargando datos del dashboard...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Bienvenido al sistema</h2>
              <p className="text-gray-600">
                Aquí podrás conectar con la base de datos y ver las estadísticas y miembros de tu gimnasio.
                Las llamadas se realizarán usando Spring Boot.
              </p>
              
              {data && (
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <pre className="text-sm text-gray-700">{JSON.stringify(data, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
