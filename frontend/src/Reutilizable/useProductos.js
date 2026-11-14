import { useState, useEffect } from 'react';
import { getProductos, createProductos, updateProductos, deleteProductos } from '../JS/producto';
import { createCompra } from '../JS/compra';
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
  const [busquedaReabastecer, setBusquedaReabastecer] = useState('');
  const [productosFiltradosReabastecer, setProductosFiltradosReabastecer] = useState([]);
  const [compraData, setCompraData] = useState({
    id_producto: '',
    id_proveedor: 1,
    cantidad: 10,
    costo: 50
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });
  const [confirmRestockModal, setConfirmRestockModal] = useState({ isOpen: false, data: null });

  useEffect(() => {
    if (!showModalCompra || compraData.id_producto) {
      setProductosFiltradosReabastecer([]);
      return;
    }
    const q = busquedaReabastecer.toLowerCase().trim();
    const filtrados = !q
      ? productos.slice(0, 5)
      : productos
          .filter(
            (p) =>
              p.nombre?.toLowerCase().includes(q) ||
              p.categoria?.toLowerCase().includes(q) ||
              String(p.id).includes(q)
          )
          .slice(0, 5);
    setProductosFiltradosReabastecer(filtrados);
  }, [busquedaReabastecer, productos, showModalCompra, compraData.id_producto]);

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
        { id: 1, nombre: 'ProteÃ­na Whey Isolate', categoria: 'Suplementos', descripcion: '2kg Vainilla Gold Standard', precio: 1250, stock: 18, stock_minimo: 5, estado: 1 },
        { id: 2, nombre: 'Creatina Monohidratada', categoria: 'Suplementos', descripcion: 'Creapure 300g Micronizada', precio: 550, stock: 4, stock_minimo: 6, estado: 1 },
        { id: 3, nombre: 'Bebida EnergÃ©tica Pre-Workout', categoria: 'Bebidas', descripcion: 'Lata 473ml Sabor Blue Berry', precio: 65, stock: 35, stock_minimo: 10, estado: 1 },
        { id: 4, nombre: 'Correas de Levantamiento (Straps)', categoria: 'Accesorios', descripcion: 'AlgodÃ³n reforzado antideslizante', precio: 220, stock: 12, stock_minimo: 3, estado: 1 },
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
    if (id_rol === 1) return 'Administrador';
    if (id_rol === 2) return 'Recepcionista';
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
    const provDefault = proveedores.length > 0 ? proveedores[0].id : 1;
    setBusquedaReabastecer('');
    setCompraData({
      id_producto: prod ? prod.id : '',
      id_proveedor: provDefault,
      cantidad: 10,
      costo: prod ? Math.max(1, Math.round(Number(prod.precio) * 0.6)) : 50
    });
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
      mostrarAlerta('La descripciÃ³n no puede exceder 100 caracteres', 'error');
      return;
    }
    if (formData.precio === '' || isNaN(Number(formData.precio)) || Number(formData.precio) < 0) {
      mostrarAlerta('Ingresa un precio vÃ¡lido mayor o igual a 0', 'error');
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
          console.warn('PUT fallÃ³ para producto, registrando:', errPut);
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

  // ValidaciÃ³n y confirmaciÃ³n previa para Reabastecer Stock
  const handleRegistrarCompraInventario = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cant = Number(compraData.cantidad);
    const costo = Number(compraData.costo);
    const idProd = Number(compraData.id_producto);
    const idProv = Number(compraData.id_proveedor) || 1;

    if (!idProd) {
      mostrarAlerta('Por favor selecciona un producto a reabastecer', 'error');
      return;
    }
    if (isNaN(cant) || cant <= 0) {
      mostrarAlerta('Ingresa una cantidad vÃ¡lida mayor a 0 unidades', 'error');
      return;
    }
    if (isNaN(costo) || costo <= 0) {
      mostrarAlerta('Ingresa un costo unitario de compra vÃ¡lido mayor a $0', 'error');
      return;
    }

    const prod = productos.find((p) => Number(p.id) === idProd);
    if (!prod) {
      mostrarAlerta('No se encontrÃ³ el producto seleccionado', 'error');
      return;
    }

    const provObj = proveedores.find((pr) => Number(pr.id) === idProv);
    const nombreProveedor = provObj
      ? `${provObj.nombre_empresa || provObj.nombre}${provObj.nombre && provObj.nombre_empresa ? ` (${provObj.nombre})` : ''}`
      : 'Proveedor Comercial';

    const totalCompra = Number((cant * costo).toFixed(2));

    // Abre el modal de confirmaciÃ³n antes de impactar el inventario y compras
    setConfirmRestockModal({
      isOpen: true,
      data: {
        idProd,
        idProv,
        cant,
        costo,
        totalCompra,
        prodNombre: prod.nombre,
        nombreProveedor
      }
    });
  };

  // EjecuciÃ³n de la compra tras confirmar en el modal
  const confirmarReabastecimiento = async () => {
    if (!confirmRestockModal.data) return;
    const { idProd, idProv, cant, costo, totalCompra, prodNombre, nombreProveedor } = confirmRestockModal.data;
    setConfirmRestockModal({ isOpen: false, data: null });

    try {
      // Al insertar detalle_compra en MySQL, el trigger `trg_aumentar_stock_compra` suma automÃ¡ticamente `cant` al stock en BD
      const compraGuardada = await createCompra({
        id_usuario: usuarioActivo?.id || 1,
        id_proveedor: idProv,
        proveedor_nombre: nombreProveedor,
        id_producto: idProd,
        producto_nombre: prodNombre,
        cantidad: cant,
        costo_unitario: costo,
        total: totalCompra,
        estado: 'Completada'
      });

      const listaActualizada = trg_aumentar_stock_compra(productos, idProd, cant);
      if (!compraGuardada || compraGuardada.id > 1000000000) {
        const prodActualizado = listaActualizada.find((p) => Number(p.id) === idProd);
        if (prodActualizado) {
          await updateProductos(idProd, prodActualizado).catch(() => {});
        }
      }

      guardarLocalmente(listaActualizada);
      setShowModalCompra(false);
      mostrarAlerta(
        `Compra registrada: +${cant} uds. de "${prodNombre}" ($${costo.toFixed(2)} c/u) con ${nombreProveedor}`,
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
    busquedaReabastecer,
    setBusquedaReabastecer,
    productosFiltradosReabastecer,
    compraData,
    setCompraData,
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
