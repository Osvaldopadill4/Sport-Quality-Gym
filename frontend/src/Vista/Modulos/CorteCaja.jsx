import React, { useState, useEffect } from 'react';
import { Search, Plus, Printer, X } from 'lucide-react';
import '../../CSS/CorteCaja.css';
import { getCorteCaja, createCorteCaja } from '../../JS/corte_caja';

export default function CorteCaja({ loggedUser }) {
  const [cortes, setCortes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id_usuario: loggedUser?.id || 1, fecha_apertura: '', monto_inicial: 0 });

  const cargarDatos = () => {
    getCorteCaja().then(data => {
      if (Array.isArray(data) && data.length > 0) setCortes(data);
      else setCortes([
        { id: 1, id_usuario: 1, fecha_apertura: '2023-10-06 08:00', fecha_cierre: '2023-10-06 15:00', monto_inicial: 500, total_ventas: 1500, monto_calculado: 2000, monto_real: 2000, diferencia: 0 }
      ]);
    });
  };

  useEffect(() => cargarDatos(), []);

  const openModal = () => {
    setFormData({ id_usuario: loggedUser?.id || 1, fecha_apertura: new Date().toISOString().slice(0, 16), monto_inicial: 0 });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await createCorteCaja(formData);
      setShowModal(false); cargarDatos();
    } catch(e) { console.error(e); }
  };

  return (
    <div className="cortecaja-wrapper">
      <div className="cortecaja-header">
        <h1 className="cortecaja-title">Corte de Caja</h1>
        <div className="cortecaja-top-actions">
          <button className="cortecaja-btn-nuevo" onClick={openModal}>
            <Plus size={16} /> Abrir Turno / Caja
          </button>
        </div>
      </div>
      <div className="cortecaja-table-container mt-6">
        <table className="cortecaja-table">
          <thead>
            <tr><th>Turno / ID</th><th>Usuario</th><th>Apertura</th><th>Cierre</th><th>Fondo Inicial</th><th>Ventas</th><th>Calculado</th><th>Real</th><th>Diferencia</th><th style={{textAlign:'right'}}>Opciones</th></tr>
          </thead>
          <tbody>
            {cortes.map(c => (
              <tr key={c.id}>
                <td className="font-bold">Turno #{c.id}</td>
                <td>Usr #{c.id_usuario}</td>
                <td>{c.fecha_apertura}</td>
                <td>{c.fecha_cierre || <span className="badge badge-warning">En curso</span>}</td>
                <td>${c.monto_inicial}</td>
                <td>${c.total_ventas || 0}</td>
                <td>${c.monto_calculado || 0}</td>
                <td>${c.monto_real || 0}</td>
                <td className={c.diferencia < 0 ? 'text-error font-bold' : 'text-success'}>${c.diferencia || 0}</td>
                <td>
                  <div className="cortecaja-table-actions">
                    <button className="cortecaja-action-btn print" title="Imprimir Ticket"><Printer size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between bg-gray-50">
              <h3 className="font-bold text-lg">Abrir Nueva Caja</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm mb-1">Fecha y Hora de Apertura</label><input type="datetime-local" className="w-full px-3 py-2 border rounded-lg" value={formData.fecha_apertura} onChange={e => setFormData({...formData, fecha_apertura: e.target.value})} /></div>
              <div><label className="block text-sm mb-1">Monto Inicial en Efectivo ($)</label><input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.monto_inicial} onChange={e => setFormData({...formData, monto_inicial: parseFloat(e.target.value)})} /></div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancelar</button>
              <button onClick={handleSave} className="btn btn-primary">Iniciar Turno</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
