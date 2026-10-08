import React, { useState, useEffect } from 'react';
import { Search, UserCheck, XCircle } from 'lucide-react';
import '../../CSS/Acceso.css';
import { getAcceso, createAcceso } from '../../JS/acceso';

export default function Acceso() {
  const [accesos, setAccesos] = useState([]);
  const [qrInput, setQrInput] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const cargarDatos = () => {
    getAcceso().then(data => {
      if (Array.isArray(data) && data.length > 0) setAccesos(data);
      else setAccesos([
        { id: 1, id_cliente: 12, fecha: '2023-10-06', hora: '10:15', resultado: 'Permitido' },
        { id: 2, id_cliente: 45, fecha: '2023-10-06', hora: '10:20', resultado: 'Denegado' }
      ]);
    });
  };

  useEffect(() => cargarDatos(), []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    
    // Simular resultado
    const esValido = Math.random() > 0.3; 
    const nuevoAcceso = {
      id_cliente: parseInt(qrInput) || 0,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString().slice(0, 5),
      resultado: esValido ? 'Permitido' : 'Denegado'
    };
    
    try {
      await createAcceso(nuevoAcceso);
      setMensaje({ tipo: esValido ? 'success' : 'error', texto: esValido ? '¡Acceso Concedido!' : 'Acceso Denegado: Membresía Vencida' });
      setQrInput('');
      cargarDatos();
      setTimeout(() => setMensaje(null), 3000);
    } catch(e) { console.error(e); }
  };

  return (
    <div className="acceso-wrapper">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Panel de Escaneo (Izquierda) */}
        <div className="md:col-span-1 bg-base-200 p-6 rounded-xl shadow-lg border border-base-300 flex flex-col items-center justify-center">
          <div className="w-32 h-32 bg-base-300 rounded-full flex items-center justify-center mb-6 border-4 border-primary/20">
            <UserCheck size={60} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Control de Acceso</h2>
          <p className="text-gray-400 text-center mb-6 text-sm">Escanea el código QR del socio o ingresa su ID manualmente.</p>
          
          <form onSubmit={handleScan} className="w-full relative">
            <input 
              type="text" 
              autoFocus
              className="w-full px-4 py-3 rounded-lg border-2 border-primary bg-base-100 focus:outline-none text-center text-lg font-bold"
              placeholder="ID / Código QR"
              value={qrInput}
              onChange={e => setQrInput(e.target.value)}
            />
          </form>

          {mensaje && (
            <div className={`mt-6 p-4 w-full rounded-lg text-center font-bold animate-bounce ${mensaje.tipo === 'success' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
              {mensaje.tipo === 'success' ? <UserCheck className="inline mr-2" /> : <XCircle className="inline mr-2" />}
              {mensaje.texto}
            </div>
          )}
        </div>

        {/* Tabla de Accesos Recientes (Derecha) */}
        <div className="md:col-span-2 bg-base-100 rounded-xl shadow-lg border border-base-300 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            Accesos Recientes
          </h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>ID Cliente</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {accesos.slice().reverse().map(a => (
                  <tr key={a.id}>
                    <td className="font-bold">Socio #{a.id_cliente}</td>
                    <td>{a.fecha}</td>
                    <td>{a.hora}</td>
                    <td>
                      <span className={`badge ${a.resultado === 'Permitido' ? 'badge-success text-black' : 'badge-error text-white'} font-bold`}>
                        {a.resultado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
