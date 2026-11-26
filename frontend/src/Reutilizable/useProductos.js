import { useState, useEffect, useMemo } from 'react';
import { getProductos, createProductos, updateProductos, deleteProductos } from '../JS/producto';
import { createCompra } from '../JS/compra';
import { createDetalleCompra } from '../JS/detalle_compra';
import { getProveedores } from '../JS/proveedor';
import { esInventarioBajo, trg_aumentar_stock_compra } from './objetosSQL';

export const esEstadoActivo = (estado) => {
  if (estado === undefined || estado === null) return false;
  const s = String(estado).trim().toLowerCase();
  return s === '1' || s === 'activo' || s === 'true' || estado === 1 || estado === true;
};

export function useProductos(loggedUser) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Suplementos',
    precio: '',
    stock: '',
    stock_minimo: 5,
    estado: 1
  });

  const [proveedores, setProveedores] = useState([]);
  const [showModalCompra, setShowModalCompra] = useState(false);
  const [ticketCompra, setTicketCompra] = useState(null);

  // Estados para Proveedor con Buscador en Tiempo Real
  const [busquedaProveedor, setBusquedaProveedor] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  // Estados para Selección Multi-Producto y Carrito de Reabastecimiento
  const [itemsReabastecer, setItemsReabastecer] = useState([]);
  const [busquedaReabastecer, setBusquedaReabastecer] = useState('');
  const [productoSeleccionadoCompra, setProductoSeleccionadoCompra] = useState(null);
  const [cantidadInput, setCantidadInput] = useState(10);
  const [costoInput, setCostoInput] = useState(50);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });
  const [confirmRestockModal, setConfirmRestockModal] = useState({ isOpen: false, data: null });

  // Filtrado de proveedores en tiempo real
  const proveedoresFiltrados = useMemo(() => {
    if (!busquedaProveedor) return proveedores.slice(0, 8);
    const q = busquedaProveedor.toLowerCase().trim();
    return proveedores.filter(pr =>
      (pr.nombre_empresa && pr.nombre_empresa.toLowerCase().includes(q)) ||
      (pr.nombre && pr.nombre.toLowerCase().includes(q)) ||
      (pr.telefono && String(pr.telefono).includes(q))
    ).slice(0, 8);
  }, [proveedores, busquedaProveedor]);

  // Filtrado de productos en tiempo real para reabastecimiento
  const productosFiltradosReabastecer = useMemo(() => {
    if (productoSeleccionadoCompra) return [];
    const q = busquedaReabastecer.toLowerCase().trim();
    if (!q) return productos.slice(0, 6);
    return productos.filter(p =>
      p.nombre?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q) ||
      String(p.id).includes(q)
    ).slice(0, 6);
  }, [productos, busquedaReabastecer, productoSeleccionadoCompra]);

  // Agregar producto a la lista de reabastecimiento
  const agregarItemReabastecer = () => {
    if (!productoSeleccionadoCompra) {
      mostrarAlerta('Selecciona un producto para agregar a la orden', 'error');
      return;
    }
    const cant = Number(cantidadInput);
    const cost = Number(costoInput);
    if (isNaN(cant) || cant <= 0) {
      mostrarAlerta('Ingresa una cantidad mayor a 0', 'error');
      return;
    }
    if (isNaN(cost) || cost <= 0) {
      mostrarAlerta('Ingresa un costo unitario válido mayor a $0', 'error');
      return;
    }

    setItemsReabastecer(prev => {
      const idx = prev.findIndex(it => Number(it.id_producto) === Number(productoSeleccionadoCompra.id));
      const subtotal = Number((cant * cost).toFixed(2));
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = {
          ...copia[idx],
          cantidad: cant,
          costo_unitario: cost,
          subtotal: subtotal
        };
        return copia;
      }
      return [
        ...prev,
        {
          id_producto: productoSeleccionadoCompra.id,
          nombre: productoSeleccionadoCompra.nombre,
          categoria: productoSeleccionadoCompra.categoria || 'General',
          stock_actual: productoSeleccionadoCompra.stock || 0,
          cantidad: cant,
          costo_unitario: cost,
          subtotal: subtotal
        }
      ];
    });

    setProductoSeleccionadoCompra(null);
    setBusquedaReabastecer('');
    setCantidadInput(10);
    setCostoInput(50);
  };

  // Quitar producto de la lista
  const eliminarItemReabastecer = (idProd) => {
    setItemsReabastecer(prev => prev.filter(it => Number(it.id_producto) !== Number(idProd)));
  };

  // Total acumulado de la orden de compra
  const totalReabastecer = useMemo(() => {
    return Number(itemsReabastecer.reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0).toFixed(2));
  }, [itemsReabastecer]);

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (lista) => {
    setProductos(lista);
    try {
      localStorage.setItem('gymton_productos', JSON.stringify(lista));
    } catch (e) {
      console.error(e);
    }
  };

  const cargarDatos = () => {
    getProveedores()
      .then((dataProv) => {
        if (Array.isArray(dataProv) && dataProv.length > 0) {
          setProveedores(dataProv);
          localStorage.setItem('gymton_proveedores', JSON.stringify(dataProv));
        } else {
          try {
            const localProv = JSON.parse(localStorage.getItem('gymton_proveedores') || '[]');
            if (localProv.length > 0) setProveedores(localProv);
            else setProveedores([{ id: 1, nombre_empresa: 'Tacos lira|', nombre: 'Osvaldo', estado: '1' }]);
          } catch {
            setProveedores([{ id: 1, nombre_empresa: 'Proveedor General', nombre: 'Osvaldo', estado: '1' }]);
          }
        }
      })
      .catch(() => {});

    getProductos().then((data) => {
      if (Array.isArray(data)) {
        const prodsReales = data.filter(
          (p) =>
            (p.categoria !== null && p.categoria !== undefined && p.categoria !== '') ||
            (p.stock !== null && p.stock !== undefined && (p.duracion_dias === null || p.duracion_dias === undefined))
        );
        if (prodsReales.length > 0) {
          const adaptados = prodsReales.map((p) => ({
            ...p,
            precio: Number(p.precio) || 0,
            stock: Number(p.stock) || 0,
            stock_minimo: Number(p.stock_minimo) || 5,
            estado: esEstadoActivo(p.estado) ? 1 : 0
          }));
          setProductos(adaptados);
          localStorage.setItem('gymton_productos', JSON.stringify(adaptados));
          return;
        }
      }
      const local = localStorage.getItem('gymton_productos');
      if (local) {
        try {
          setProductos(JSON.parse(local));
          return;
        } catch (e) {
          console.error(e);
        }
      }
      const fallback = [
        { id: 1, nombre: 'Proteína Whey Isolate', categoria: 'Suplementos', descripcion: '2kg Vainilla Gold Standard', precio: 1250, stock: 18, stock_minimo: 5, estado: 1 },
        { id: 2, nombre: 'Creatina Monohidratada', categoria: 'Suplementos', descripcion: 'Creapure 300g Micronizada', precio: 550, stock: 4, stock_minimo: 6, estado: 1 },
        { id: 3, nombre: 'Bebida Energética Pre-Workout', categoria: 'Bebidas', descripcion: 'Lata 473ml Sabor Blue Berry', precio: 65, stock: 35, stock_minimo: 10, estado: 1 },
        { id: 4, nombre: 'Correas de Levantamiento (Straps)', categoria: 'Accesorios', descripcion: 'Algodón reforzado antideslizante', precio: 220, stock: 12, stock_minimo: 3, estado: 1 },
        { id: 5, nombre: 'Shaker Mezclador 700ml', categoria: 'Accesorios', descripcion: 'Vaso con bola mezcladora de acero', precio: 140, stock: 2, stock_minimo: 5, estado: 0 },
        { id: 6, nombre: 'Creatina Julio', categoria: 'Snacks', descripcion: 'Te va a hacer un tinaco man', precio: 100, stock: 498, stock_minimo: 5, estado: 1 }
      ];
      setProductos(fallback);
      localStorage.setItem('gymton_productos', JSON.stringify(fallback));
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = productos.length;
  const activos = productos.filter((p) => esEstadoActivo(p.estado)).length;
  const inactivos = total - activos;
  const bajoStockCount = productos.filter((p) => esInventarioBajo(p)).length;

  const getRolName = (id_rol) => {
    const rolNum = Number(id_rol);
    if (rolNum === 1) return 'Administrador';
    if (rolNum === 2) return 'Recepcionista';
    if (rolNum === 3) return 'Empleado';
    return 'Usuario';
  };

  const handlePonerEnActivo = async (p) => {
    const prodActualizado = { ...p, estado: '1' };
    const nuevaLista = productos.map((item) => (item.id === p.id ? prodActualizado : item));
    setProductos(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateProductos(p.id, prodActualizado);
      mostrarAlerta(`Producto "${p.nombre}" activado correctamente`, 'success');
    } catch (e) {
      console.error(e);
      mostrarAlerta('Puesto en activo localmente', 'warning');
    }
  };

  const handleDarDeBaja = async (p) => {
    const prodActualizado = { ...p, estado: '0' };
    const nuevaLista = productos.map((item) => (item.id === p.id ? prodActualizado : item));
    setProductos(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateProductos(p.id, prodActualizado);
      mostrarAlerta(`Producto "${p.nombre}" desactivado correctamente`, 'info');
    } catch (e) {
      console.error(e);
      mostrarAlerta('Desactivado localmente', 'warning');
    }
  };

  const handleToggleEstado = (p) => {
    const esActivo = esEstadoActivo(p.estado);
    if (esActivo) handleDarDeBaja(p);
    else handlePonerEnActivo(p);
  };

  const pedirConfirmacionEliminar = (id, nombre) => {
    setConfirmModal({
      isOpen: true,
      id,
      nombre: nombre || 'este producto'
    });
  };

  const confirmarEliminar = async () => {
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try {
      await deleteProductos(id);
      const nuevaLista = productos.filter((p) => p.id !== id);
      setProductos(nuevaLista);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Registro eliminado correctamente', 'success');
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al eliminar producto', 'error');
    }
  };

  const openModal = (mode, prod = null) => {
    setModalMode(mode);
    if (mode === 'edit' && prod) {
      setFormData({
        id: prod.id,
        nombre: prod.nombre || '',
        descripcion: prod.descripcion || '',
        categoria: prod.categoria || 'Suplementos',
        precio: prod.precio ?? '',
        stock: prod.stock ?? '',
        stock_minimo: prod.stock_minimo ?? 5,
        estado: esEstadoActivo(prod.estado) ? 1 : 0
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        categoria: 'Suplementos',
        precio: '',
        stock: '',
        stock_minimo: 5,
        estado: 1
      });
    }
    setShowModal(true);
  };

  const openModalCompra = (prod = null) => {
    setBusquedaProveedor('');
    setProveedorSeleccionado(proveedores.length > 0 ? proveedores[0] : null);
    setBusquedaReabastecer('');
    setProductoSeleccionadoCompra(null);
    setCantidadInput(10);
    setCostoInput(50);

    if (prod) {
      const costoSugerido = Math.max(1, Math.round(Number(prod.precio) * 0.6)) || 50;
      setItemsReabastecer([
        {
          id_producto: prod.id,
          nombre: prod.nombre,
          categoria: prod.categoria || 'General',
          stock_actual: prod.stock || 0,
          cantidad: 10,
          costo_unitario: costoSugerido,
          subtotal: 10 * costoSugerido
        }
      ]);
    } else {
      setItemsReabastecer([]);
    }
    setShowModalCompra(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const nombreLimpio = formData.nombre.trim();
    if (!nombreLimpio) {
      mostrarAlerta('Ingresa el nombre del producto', 'error');
      return;
    }
    if (nombreLimpio.length > 20) {
      mostrarAlerta('El nombre del producto no puede exceder 20 caracteres', 'error');
      return;
    }
    if (formData.descripcion && formData.descripcion.trim().length > 100) {
      mostrarAlerta('La descripción no puede exceder 100 caracteres', 'error');
      return;
    }
    if (formData.precio === '' || isNaN(Number(formData.precio)) || Number(formData.precio) < 0) {
      mostrarAlerta('Ingresa un precio válido mayor o igual a 0', 'error');
      return;
    }
    if (Number(formData.stock) < 0 || Number(formData.stock_minimo) < 0) {
      mostrarAlerta('El stock no puede ser negativo', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        precio: Number(formData.precio),
        stock: Number(formData.stock) || 0,
        stock_minimo: Number(formData.stock_minimo) || 5,
        estado: esEstadoActivo(formData.estado) ? '1' : '0'
      };

      if (modalMode === 'create') {
        const { id, ...createData } = payload;
        const res = await createProductos(createData);
        const nuevo = res && res.id ? { ...payload, id: res.id } : { ...payload, id: Date.now() };
        guardarLocalmente([nuevo, ...productos]);
        mostrarAlerta('Registro completado correctamente', 'success');
      } else {
        try {
          await updateProductos(formData.id, payload);
        } catch (errPut) {
          console.warn('PUT falló para producto, registrando:', errPut);
          const { id, ...createData } = payload;
          const res = await createProductos(createData);
          if (res && res.id) payload.id = res.id;
        }
        const lista = productos.map((p) => (p.id === formData.id ? { ...p, ...payload } : p));
        guardarLocalmente(lista);
        mostrarAlerta('Datos actualizados correctamente', 'success');
      }
      setShowModal(false);
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al procesar la solicitud', 'error');
    }
  };

  // Validación previa antes de confirmar el reabastecimiento multi-producto
  const handleRegistrarCompraInventario = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!proveedorSeleccionado) {
      mostrarAlerta('Selecciona un proveedor para la orden de compra', 'error');
      return;
    }
    if (itemsReabastecer.length === 0) {
      mostrarAlerta('Agrega al menos un producto a la lista de reabastecimiento', 'error');
      return;
    }

    const nombreProv = proveedorSeleccionado.nombre_empresa || proveedorSeleccionado.nombre || 'Proveedor Comercial';
    const totalPzas = itemsReabastecer.reduce((acc, it) => acc + Number(it.cantidad || 0), 0);

    setConfirmRestockModal({
      isOpen: true,
      data: {
        proveedor: proveedorSeleccionado,
        nombreProveedor: nombreProv,
        items: itemsReabastecer,
        totalArticulos: totalPzas,
        totalCompra: totalReabastecer
      }
    });
  };

  // Ejecución de la orden de reabastecimiento: 1 sola compra global + detalles + ticket
  const confirmarReabastecimiento = async () => {
    if (!confirmRestockModal.data) return;
    const { proveedor, nombreProveedor, items, totalCompra } = confirmRestockModal.data;
    setConfirmRestockModal({ isOpen: false, data: null });

    try {
      const fechaActual = new Date().toISOString().replace('T', ' ').slice(0, 19);

      // 1. Registra 1 sola compra en el Backend para agrupar todos los productos
      const compraGuardada = await createCompra({
        id_usuario: usuarioActivo?.id || 1,
        id_proveedor: proveedor.id || 1,
        proveedor_nombre: nombreProveedor,
        fecha: fechaActual,
        total: totalCompra,
        estado: 'Completada'
      });

      const idCompraGenerada = compraGuardada?.id || Date.now();

      // 2. Inserta cada producto en `detalle_compra` y suma el stock correspondiente
      let listaActualizada = [...productos];
      for (const item of items) {
        await createDetalleCompra({
          id_compra: idCompraGenerada,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          costo_unitario: item.costo_unitario,
          subtotal: item.subtotal
        }).catch(() => {});

        listaActualizada = trg_aumentar_stock_compra(listaActualizada, item.id_producto, item.cantidad);
        const prodActualizado = listaActualizada.find(p => Number(p.id) === Number(item.id_producto));
        if (prodActualizado) {
          await updateProductos(item.id_producto, prodActualizado).catch(() => {});
        }
      }

      guardarLocalmente(listaActualizada);
      setShowModalCompra(false);

      // 3. Genera y abre el Ticket Oficial de Entrada / Reabastecimiento
      setTicketCompra({
        id: idCompraGenerada,
        folio: `COM-${String(idCompraGenerada).padStart(4, '0')}`,
        fecha: new Date().toLocaleString(),
        proveedor: nombreProveedor,
        usuario: usuarioActivo ? `${usuarioActivo.nombre} ${usuarioActivo.apellido || ''}`.trim() : 'Encargado de Almacén',
        detalles: items.map(it => ({
          id_producto: it.id_producto,
          articulo: it.nombre,
          cantidad: it.cantidad,
          costo_unitario: it.costo_unitario,
          subtotal: it.subtotal
        })),
        total: totalCompra,
        estado: 'Completada'
      });

      mostrarAlerta(
        `¡Reabastecimiento exitoso! Se ingresaron ${items.length} producto(s) con ${nombreProveedor}`,
        'success'
      );
      cargarDatos();
    } catch (err) {
      console.error(err);
      mostrarAlerta('Error al registrar compra de inventario', 'error');
    }
  };

  const productosFiltrados = productos.filter((p) => {
    let coincideFiltro = true;
    if (filtro === 'activos') coincideFiltro = esEstadoActivo(p.estado);
    else if (filtro === 'inactivos') coincideFiltro = !esEstadoActivo(p.estado);
    else if (filtro === 'bajo_stock') coincideFiltro = esInventarioBajo(p);

    if (!coincideFiltro) return false;

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    const nombre = (p.nombre || '').toLowerCase();
    const desc = (p.descripcion || '').toLowerCase();
    const cat = (p.categoria || '').toLowerCase();
    const precio = (p.precio || '').toString();

    return nombre.includes(termino) || desc.includes(termino) || cat.includes(termino) || precio.includes(termino);
  });

  return {
    usuarioActivo,
    productos,
    productosFiltrados,
    filtro,
    setFiltro,
    busqueda,
    setBusqueda,
    alerta,
    setAlerta,
    showModal,
    setShowModal,
    modalMode,
    formData,
    setFormData,
    proveedores,
    showModalCompra,
    setShowModalCompra,
    ticketCompra,
    setTicketCompra,
    busquedaProveedor,
    setBusquedaProveedor,
    proveedorSeleccionado,
    setProveedorSeleccionado,
    proveedoresFiltrados,
    itemsReabastecer,
    setItemsReabastecer,
    busquedaReabastecer,
    setBusquedaReabastecer,
    productoSeleccionadoCompra,
    setProductoSeleccionadoCompra,
    cantidadInput,
    setCantidadInput,
    costoInput,
    setCostoInput,
    agregarItemReabastecer,
    eliminarItemReabastecer,
    totalReabastecer,
    productosFiltradosReabastecer,
    confirmModal,
    setConfirmModal,
    total,
    activos,
    inactivos,
    bajoStockCount,
    getRolName,
    handleToggleEstado,
    pedirConfirmacionEliminar,
    confirmarEliminar,
    openModal,
    openModalCompra,
    handleSave,
    handleRegistrarCompraInventario,
    confirmRestockModal,
    setConfirmRestockModal,
    confirmarReabastecimiento,
    esEstadoActivo,
    esInventarioBajo
  };
}
