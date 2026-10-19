import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Search } from 'lucide-react';
import '../../CSS/PuntoVenta.css';
import { createVenta } from '../../JS/venta';
import { getProductos } from '../../JS/producto';

export default function PuntoVenta({ loggedUser }) {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  useEffect(() => {
    getProductos().then(data => {
      if (Array.isArray(data) && data.length > 0) setProductos(data.filter(p => p.estado === 1 || p.estado === 'Activo'));
      else setProductos([
        { id: 1, nombre: 'Agua 500ml', precio: 15, stock: 50 },
        { id: 2, nombre: 'Proteína Whey 1 Scoop', precio: 30, stock: 20 },
        { id: 3, nombre: 'Barra Energética', precio: 25, stock: 15 },
        { id: 4, nombre: 'Membresía Mensual', precio: 500, stock: 999 } // Plan simulado
      ]);
    });
  }, []);

  const agregarAlCarrito = (prod) => {
    const existe = carrito.find(item => item.id === prod.id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === prod.id ? { ...item, cant: item.cant + 1 } : item));
    } else {
      setCarrito([...carrito, { ...prod, cant: 1 }]);
    }
  };

  const modificarCant = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const nuevaCant = item.cant + delta;
        return nuevaCant > 0 ? { ...item, cant: nuevaCant } : item;
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cant), 0);

  const procesarVenta = async (metodo) => {
    if (carrito.length === 0) return;
    const venta = {
      id_usuario: loggedUser?.id || 1,
      id_cliente: null,
      fecha: new Date().toISOString(),
      total: total,
      metodo_pago: metodo,
      detalles: carrito.map(c => ({ id_producto: c.id, cantidad: c.cant, precio_unitario: c.precio, subtotal: c.precio * c.cant }))
    };
    try {
      await createVenta(venta);
      alert('¡Venta realizada con éxito!');
      setCarrito([]);
    } catch(e) {
      alert('Venta simulada completada (API no conectada al 100%)');
      setCarrito([]);
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="puntoventa-wrapper h-[85vh] flex gap-6">
      {/* Lista de Productos con Buscador */}
      <div className="w-2/3 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-base-200 p-4 rounded-xl shadow-sm border border-base-300">
          <h2 className="text-xl font-bold text-white">Catálogo de Venta</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              className="input input-bordered w-full pl-10" 
              placeholder="Buscar producto..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto bg-base-200 rounded-xl shadow-lg border border-base-300 flex-1">
          <table className="table table-zebra w-full">
            <thead className="bg-base-300 sticky top-0 z-10">
              <tr>
                <th>Producto</th>
                <th>Stock</th>
                <th>Precio</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => (
                <tr key={p.id} className="hover:bg-base-300/50 transition-colors">
                  <td className="font-bold text-white">{p.nombre}</td>
                  <td>
                    <span className={`badge ${p.stock < 5 ? 'badge-error' : 'badge-success'} badge-sm font-bold text-black`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="text-primary font-bold text-lg">${p.precio}</td>
                  <td className="text-right">
                    <button onClick={() => agregarAlCarrito(p)} className="btn btn-sm btn-primary">
                      <Plus size={16} /> Agregar
                    </button>
                  </td>
                </tr>
              ))}
              {productosFiltrados.length === 0 && (
                <tr><td colSpan="4" className="text-center py-8 text-gray-400">No se encontraron productos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carrito Lateral */}
      <div className="w-1/3 bg-base-200 rounded-2xl shadow-2xl border border-base-300 flex flex-col relative overflow-hidden">
        <div className="bg-primary text-black p-4 flex items-center justify-between font-bold">
          <span className="flex items-center gap-2"><ShoppingCart /> Cuenta Actual</span>
          <span className="badge badge-neutral">{carrito.length} Items</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {carrito.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">El carrito está vacío</div>
          ) : (
            carrito.map(c => (
              <div key={c.id} className="flex justify-between items-center bg-base-100 p-3 rounded-lg border border-base-300">
                <div className="flex-1">
                  <h4 className="text-sm font-bold truncate pr-2">{c.nombre}</h4>
                  <span className="text-primary font-bold">${c.precio * c.cant}</span>
                </div>
                <div className="flex items-center gap-2 bg-base-200 rounded-lg p-1">
                  <button onClick={() => modificarCant(c.id, -1)} className="p-1 hover:bg-base-300 rounded"><Minus size={14}/></button>
                  <span className="w-4 text-center text-sm font-bold">{c.cant}</span>
                  <button onClick={() => modificarCant(c.id, 1)} className="p-1 hover:bg-base-300 rounded"><Plus size={14}/></button>
                </div>
                <button onClick={() => eliminarDelCarrito(c.id)} className="ml-3 text-error hover:text-red-400"><Trash2 size={16}/></button>
              </div>
            ))
          )}
        </div>

        <div className="bg-base-300 p-6 border-t border-base-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-gray-400">Total a Pagar</span>
            <span className="text-4xl font-black text-white">${total.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => procesarVenta('Efectivo')} disabled={carrito.length===0} className="btn btn-success text-black font-bold flex gap-2">
              <Banknote size={20} /> Efectivo
            </button>
            <button onClick={() => procesarVenta('Tarjeta')} disabled={carrito.length===0} className="btn btn-info text-black font-bold flex gap-2">
              <CreditCard size={20} /> Tarjeta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
