import { useState, useEffect } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../JS/cliente';
import { getPlanes, createPlanes, updatePlanes, deletePlanes } from '../JS/plan';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../JS/proveedor';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../JS/usuarios';

export const esEstadoActivo = (estado) => {
  if (estado === undefined || estado === null) return false;
  const s = String(estado).trim().toLowerCase();
  return s === '1' || s === 'activo' || s === 'true' || estado === 1 || estado === true;
};

export const generarUUID = () => {
  const aleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GYM-QR-${Date.now().toString().slice(-4)}-${aleatorio}`;
};

// =========================================================
// 1. HOOK REUTILIZABLE: `useClientes`
// =========================================================
export function useClientes({ loggedUser, onIrAPuntoVenta }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);
  const [mostrarPasswords, setMostrarPasswords] = useState({});
  const [copiadoToken, setCopiadoToken] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [cargandoBD, setCargandoBD] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });
  const [paseInvitadoModal, setPaseInvitadoModal] = useState({ isOpen: false, cliente: null, plan: null });

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    contrasena: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    fecha_registro: '',
    estado: 1,
    token_qr: ''
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (nuevosClientes) => {
    setClientes(nuevosClientes);
    try {
      localStorage.setItem('gymton_clientes', JSON.stringify(nuevosClientes));
    } catch (e) {
      console.error('Error guardando clientes en localStorage:', e);
    }
  };

  const cargarDatos = async (forzarToast = false) => {
    setCargandoBD(true);
    try {
      const data = await getClientes();
      const lista = Array.isArray(data) ? data :
                    (data && Array.isArray(data.content)) ? data.content :
                    (data && Array.isArray(data.data)) ? data.data : null;

      if (Array.isArray(lista)) {
        setClientes(lista);
        localStorage.setItem('gymton_clientes', JSON.stringify(lista));
        setCargandoBD(false);
        if (forzarToast) {
          mostrarAlerta(`Sincronizado con MySQL: ${lista.length} cliente(s) cargado(s)`, 'success');
        }
        return;
      }
    } catch (err) {
      console.warn('Error al cargar clientes de la API:', err);
    }
    setCargandoBD(false);

    const local = localStorage.getItem('gymton_clientes');
    if (local) {
      try {
        const cached = JSON.parse(local);
        if (Array.isArray(cached) && cached.length > 0) {
          const sinMock = cached.filter(c => c.nombre !== 'Juan Pérez' && c.nombre !== 'Carolina Gómez');
          if (sinMock.length > 0) {
            setClientes(sinMock);
            return;
          }
          setClientes(cached);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setClientes([]);
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = clientes.length;
  const activos = clientes.filter(c => esEstadoActivo(c.estado)).length;
  const inactivos = total - activos;

  const togglePasswordVisible = (id) => {
    setMostrarPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copiarAlPortapapeles = (texto, id) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoToken(id);
      setTimeout(() => setCopiadoToken(null), 2000);
      mostrarAlerta('Token QR copiado al portapapeles', 'info');
    });
  };

  const handlePonerEnActivo = async (c) => {
    const nuevaLista = clientes.map(item => item.id === c.id ? { ...item, estado: "1" } : item);
    setClientes(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateCliente(c.id, { ...c, contrasena: c.contrasena || 12345, estado: "1" });
      mostrarAlerta(`Cliente "${c.nombre}" activado correctamente`, 'success');
    } catch {
      mostrarAlerta('Puesto en activo localmente', 'warning');
    }
  };

  const handleDarDeBaja = async (c) => {
    const nuevaLista = clientes.map(item => item.id === c.id ? { ...item, estado: "0" } : item);
    setClientes(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateCliente(c.id, { ...c, contrasena: c.contrasena || 12345, estado: "0" });
      mostrarAlerta(`Cliente "${c.nombre}" dado de baja correctamente`, 'info');
    } catch {
      mostrarAlerta('Dado de baja localmente', 'warning');
    }
  };

  const handleToggleEstado = (c) => {
    if (esEstadoActivo(c.estado)) handleDarDeBaja(c);
    else handlePonerEnActivo(c);
  };

  const pedirConfirmacionEliminar = (id, nombre) => {
    setConfirmModal({ isOpen: true, id, nombre: nombre || 'este cliente' });
  };

  const confirmarEliminar = async () => {
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try {
      await deleteCliente(id);
      mostrarAlerta('Registro eliminado correctamente', 'success');
      await cargarDatos();
    } catch {
      const nuevaLista = clientes.filter(c => c.id !== id);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Registro eliminado localmente', 'info');
    }
  };

  const openModal = (mode, cliente = null) => {
    setModalMode(mode);
    if (mode === 'edit' && cliente) {
      setFormData({
        id: cliente.id,
        nombre: cliente.nombre || '',
        telefono: cliente.telefono || '',
        contrasena: cliente.contrasena || '',
        contacto_emergencia: cliente.contacto_emergencia || '',
        telefono_emergencia: cliente.telefono_emergencia || '',
        fecha_registro: cliente.fecha_registro || '',
        estado: esEstadoActivo(cliente.estado) ? 1 : 0,
        token_qr: cliente.token_qr || generarUUID()
      });
    } else {
      const hoy = new Date().toISOString().split('T')[0];
      setFormData({
        nombre: '',
        telefono: '',
        contrasena: '',
        contacto_emergencia: '',
        telefono_emergencia: '',
        fecha_registro: hoy,
        estado: 1,
        token_qr: generarUUID()
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.nombre.trim()) {
      mostrarAlerta('Por favor ingresa el nombre del cliente', 'error');
      return;
    }
    if (formData.nombre.trim().length > 20) {
      mostrarAlerta('El nombre no puede exceder 20 caracteres', 'error');
      return;
    }
    if (!formData.telefono || formData.telefono.trim().length === 0) {
      mostrarAlerta('Por favor ingresa el teléfono del cliente', 'error');
      return;
    }
    const telLimpio = formData.telefono.replace(/\D/g, '');
    if (telLimpio.length > 11) {
      mostrarAlerta('El teléfono solo permite un máximo de 11 caracteres numéricos', 'error');
      return;
    }
    if (!formData.contrasena || formData.contrasena.trim().length === 0) {
      mostrarAlerta('Por favor ingresa la contraseña para el cliente', 'error');
      return;
    }
    if (formData.contrasena.length > 10) {
      mostrarAlerta('La contraseña no puede exceder 10 caracteres', 'error');
      return;
    }
    if (formData.contacto_emergencia && formData.contacto_emergencia.trim().length > 20) {
      mostrarAlerta('El contacto de emergencia no puede exceder 20 caracteres', 'error');
      return;
    }
    if (formData.telefono_emergencia) {
      const telEmergLimpio = formData.telefono_emergencia.replace(/\D/g, '');
      if (telEmergLimpio.length > 11) {
        mostrarAlerta('El teléfono de emergencia solo permite un máximo de 11 caracteres numéricos', 'error');
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        estado: esEstadoActivo(formData.estado) ? "1" : "0",
        token_qr: formData.token_qr ? formData.token_qr.trim() : generarUUID()
      };

      if (modalMode === 'create') {
        const creado = await createCliente(payload);
        setShowModal(false);

        let nuevoClienteId = creado?.id || null;
        try {
          const listaReciente = await getClientes();
          if (Array.isArray(listaReciente) && listaReciente.length > 0 && !nuevoClienteId) {
            const coincidencia = listaReciente.find(c =>
              (payload.token_qr && c.token_qr === payload.token_qr) ||
              (c.nombre === payload.nombre.trim() && c.telefono === payload.telefono)
            );
            nuevoClienteId = coincidencia ? coincidencia.id : Math.max(...listaReciente.map(c => Number(c.id) || 0));
          }
        } catch {}

        if (!nuevoClienteId) nuevoClienteId = Date.now();

        let plan1Dia = { id: 5, nombre: 'Individual (1 Día)', duracion_dias: 1, precio: 30 };
        try {
          const planesBD = await getPlanes();
          if (Array.isArray(planesBD) && planesBD.length > 0) {
            const encontrado = planesBD.find(p =>
              Number(p.duracion_dias) === 1 ||
              String(p.nombre || '').toLowerCase().includes('individual') ||
              String(p.nombre || '').toLowerCase().includes('invitado') ||
              String(p.nombre || '').toLowerCase().includes('visita') ||
              String(p.nombre || '').toLowerCase().includes('1 d')
            );
            if (encontrado) {
              plan1Dia = { id: encontrado.id, nombre: encontrado.nombre, duracion_dias: 1, precio: Number(encontrado.precio) || 30 };
            }
          }
        } catch {}

        setPaseInvitadoModal({
          isOpen: true,
          cliente: { id: nuevoClienteId, nombre: payload.nombre.trim() },
          plan: plan1Dia
        });
        mostrarAlerta(`Socio "${payload.nombre.trim()}" registrado exitosamente en la base de datos`, 'success');
        await cargarDatos();
      } else {
        await updateCliente(formData.id, payload);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
        await cargarDatos();
      }
    } catch {
      mostrarAlerta('Ocurrió un error al procesar la solicitud en el servidor', 'error');
      if (modalMode === 'create') {
        const nuevo = { ...formData, id: Date.now(), estado: esEstadoActivo(formData.estado) ? "1" : "0" };
        guardarLocalmente([nuevo, ...clientes]);
      } else {
        const lista = clientes.map(item => item.id === formData.id ? { ...item, ...formData, estado: esEstadoActivo(formData.estado) ? "1" : "0" } : item);
        guardarLocalmente(lista);
      }
      setShowModal(false);
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const coincideEstado =
      filtro === 'todos' ? true :
      filtro === 'activos' ? esEstadoActivo(c.estado) :
      !esEstadoActivo(c.estado);

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return coincideEstado;

    const nombre = (c.nombre || '').toLowerCase();
    const telefono = (c.telefono || '').toLowerCase();
    const contactoEmergencia = (c.contacto_emergencia || '').toLowerCase();
    const telEmergencia = (c.telefono_emergencia || '').toLowerCase();
    const fechaRegistro = (c.fecha_registro || '').toLowerCase();
    const tokenQr = (c.token_qr || '').toLowerCase();

    return coincideEstado && (
      nombre.includes(termino) ||
      telefono.includes(termino) ||
      contactoEmergencia.includes(termino) ||
      telEmergencia.includes(termino) ||
      fechaRegistro.includes(termino) ||
      tokenQr.includes(termino)
    );
  });

  return {
    usuarioActivo,
    clientesFiltrados,
    filtro,
    setFiltro,
    busqueda,
    setBusqueda,
    alerta,
    setAlerta,
    mostrarPasswords,
    togglePasswordVisible,
    copiadoToken,
    copiarAlPortapapeles,
    showModal,
    setShowModal,
    modalMode,
    formData,
    setFormData,
    cargandoBD,
    cargarDatos,
    total,
    activos,
    inactivos,
    confirmModal,
    setConfirmModal,
    paseInvitadoModal,
    setPaseInvitadoModal,
    handleToggleEstado,
    pedirConfirmacionEliminar,
    confirmarEliminar,
    openModal,
    handleSave,
    esEstadoActivo,
    generarUUID
  };
}

// =========================================================
// 2. HOOK REUTILIZABLE: `usePlanes`
// =========================================================
export function usePlanes({ loggedUser }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [planes, setPlanes] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion_dias: 30,
    tipo_plan: 'Regular',
    beneficios: '',
    estado: 1
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (lista) => {
    setPlanes(lista);
    try {
      localStorage.setItem('gymton_planes', JSON.stringify(lista));
    } catch {}
  };

  const cargarDatos = () => {
    getPlanes().then(data => {
      if (Array.isArray(data)) {
        const planesReales = data.filter(p => p.duracion_dias !== null && p.duracion_dias !== undefined && p.duracion_dias !== '' && !p.categoria);
        if (planesReales.length > 0) {
          const adaptados = planesReales.map(p => ({
            ...p,
            estado: (p.estado === 1 || p.estado === '1' || String(p.estado).toLowerCase() === 'activo') ? 1 : 0,
            tipo_plan: p.tipo_plan || (
              p.nombre.toLowerCase().includes('semanal') ? 'Semanal' :
              p.nombre.toLowerCase().includes('mensual') ? 'Popular' :
              p.nombre.toLowerCase().includes('anual') ? 'Mejor Valor' :
              p.nombre.toLowerCase().includes('estudian') ? 'Estudiante' : 'Pase 1 Día'
            )
          }));
          setPlanes(adaptados);
          localStorage.setItem('gymton_planes', JSON.stringify(adaptados));
          return;
        }
      }
      const local = localStorage.getItem('gymton_planes');
      if (local) {
        try {
          setPlanes(JSON.parse(local));
          return;
        } catch {}
      }
      const planesIniciales = [
        { id: 1, nombre: 'Semanal', precio: 150, duracion_dias: 7, tipo_plan: 'Semanal', descripcion: 'Acceso total durante 7 días continuos al área de pesas y cardio.', beneficios: 'Sin inscripción, lockers incluidos, acceso en horario completo', estado: 1 },
        { id: 2, nombre: 'Mensual', precio: 350, duracion_dias: 30, tipo_plan: 'Popular', descripcion: 'Acceso ilimitado por 1 mes (30 días). El plan más solicitado.', beneficios: 'Acceso completo, lockers, valoración física inicial', estado: 1 },
        { id: 3, nombre: 'Anual', precio: 2100, duracion_dias: 365, tipo_plan: 'Mejor Valor', descripcion: 'Membresía anual completa. Solo $175 MXN al mes. Máximo ahorro.', beneficios: 'Acceso ilimitado 365 días, playera conmemorativa, 2 pases de invitado al mes', estado: 1 },
        { id: 4, nombre: 'Estudiantil', precio: 200, duracion_dias: 30, tipo_plan: 'Estudiante', descripcion: 'Tarifa preferencial de $200 MXN/mes con credencial de estudiante vigente.', beneficios: 'Acceso en horario estudiantil flexible, pesas y cardio completo', estado: 1 },
        { id: 5, nombre: 'Invitado', precio: 30, duracion_dias: 1, tipo_plan: 'Pase 1 Día', descripcion: 'Pase temporal de cortesía o prueba por 24 horas para acceso a torniquetes.', beneficios: 'Acceso de prueba 1 día, inducción con instructor', estado: 1 }
      ];
      setPlanes(planesIniciales);
      localStorage.setItem('gymton_planes', JSON.stringify(planesIniciales));
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = planes.length;
  const activos = planes.filter(p => p.estado === 1 || p.estado === 'Activo').length;
  const inactivos = total - activos;

  const getRolName = (id_rol) => {
    if (id_rol === 1) return 'Administrador';
    if (id_rol === 2) return 'Recepcionista';
    return 'Usuario';
  };

  const handlePonerEnActivo = async (p) => {
    const planActualizado = { ...p, estado: 1 };
    const nuevaLista = planes.map(item => item.id === p.id ? planActualizado : item);
    setPlanes(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updatePlanes(p.id, { ...p, estado: 'Activo' });
      mostrarAlerta(`Plan "${p.nombre}" activado correctamente`, 'success');
      cargarDatos();
    } catch {
      mostrarAlerta('Puesto en activo localmente', 'warning');
    }
  };

  const handleDarDeBaja = async (p) => {
    const planActualizado = { ...p, estado: 0 };
    const nuevaLista = planes.map(item => item.id === p.id ? planActualizado : item);
    setPlanes(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updatePlanes(p.id, { ...p, estado: 'Inactivo' });
      mostrarAlerta(`Plan "${p.nombre}" dado de baja correctamente`, 'info');
      cargarDatos();
    } catch {
      mostrarAlerta('Dado de baja localmente', 'warning');
    }
  };

  const handleToggleEstado = (p) => {
    const esActivo = p.estado === 1 || p.estado === 'Activo';
    if (esActivo) handleDarDeBaja(p);
    else handlePonerEnActivo(p);
  };

  const pedirConfirmacionEliminar = (id, nombre) => {
    setConfirmModal({ isOpen: true, id, nombre: nombre || 'este plan' });
  };

  const confirmarEliminar = async () => {
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try {
      await deletePlanes(id);
      const nuevaLista = planes.filter(p => p.id !== id);
      setPlanes(nuevaLista);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Registro eliminado correctamente', 'success');
      cargarDatos();
    } catch {
      mostrarAlerta('Error al eliminar plan', 'error');
    }
  };

  const openModal = (mode, plan = null) => {
    setModalMode(mode);
    if (mode === 'edit' && plan) {
      setFormData({
        id: plan.id,
        nombre: plan.nombre || '',
        descripcion: plan.descripcion || '',
        precio: plan.precio ?? '',
        duracion_dias: plan.duracion_dias || 30,
        tipo_plan: plan.tipo_plan || 'Regular',
        beneficios: plan.beneficios || '',
        estado: (plan.estado === 1 || plan.estado === 'Activo') ? 1 : 0
      });
    } else {
      setFormData({ nombre: '', descripcion: '', precio: '', duracion_dias: 30, tipo_plan: 'Regular', beneficios: '', estado: 1 });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const nombreLimpio = formData.nombre.trim();
    if (!nombreLimpio) {
      mostrarAlerta('Por favor ingresa el nombre del plan', 'error');
      return;
    }
    if (nombreLimpio.length > 20) {
      mostrarAlerta('El nombre del plan no puede exceder 20 caracteres', 'error');
      return;
    }
    if (formData.tipo_plan && formData.tipo_plan.trim().length > 20) {
      mostrarAlerta('La etiqueta del plan no puede exceder 20 caracteres', 'error');
      return;
    }
    if (formData.descripcion && formData.descripcion.trim().length > 100) {
      mostrarAlerta('La descripción no puede exceder 100 caracteres', 'error');
      return;
    }
    if (formData.precio === '' || isNaN(Number(formData.precio)) || Number(formData.precio) < 0) {
      mostrarAlerta('Ingresa un precio válido en MXN', 'error');
      return;
    }
    if (Number(formData.precio) > 9999 || String(Math.floor(Number(formData.precio))).length > 4) {
      mostrarAlerta('El costo del plan no puede tener más de 4 cifras (máx. $9,999 MXN)', 'error');
      return;
    }
    if (!formData.duracion_dias || parseInt(formData.duracion_dias) <= 0) {
      mostrarAlerta('La duración en días debe ser mayor a 0', 'error');
      return;
    }
    if (parseInt(formData.duracion_dias) > 365) {
      mostrarAlerta('La duración del plan no puede pasar de los 365 días', 'error');
      return;
    }

    const payload = {
      ...formData,
      precio: parseFloat(formData.precio),
      duracion_dias: parseInt(formData.duracion_dias) || 1,
      estado: (formData.estado === 1 || formData.estado === 'Activo') ? 'Activo' : 'Inactivo'
    };

    try {
      if (modalMode === 'create') {
        const { id, ...createData } = payload;
        const res = await createPlanes(createData);
        const nuevo = (res && res.id) ? { ...payload, id: res.id } : { ...payload, id: Date.now() };
        guardarLocalmente([nuevo, ...planes]);
        setShowModal(false);
        mostrarAlerta('Registro completado correctamente', 'success');
        cargarDatos();
      } else {
        try {
          await updatePlanes(payload.id, payload);
        } catch {
          const { id, ...createData } = payload;
          const res = await createPlanes(createData);
          if (res && res.id) payload.id = res.id;
        }
        const nuevaLista = planes.map(item => item.id === payload.id ? { ...item, ...payload } : item);
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
        cargarDatos();
      }
    } catch {
      mostrarAlerta('Error al procesar la solicitud', 'error');
    }
  };

  const planesFiltrados = planes.filter(p => {
    const coincideEstado =
      filtro === 'todos' ? true :
      filtro === 'activos' ? (p.estado === 1 || p.estado === 'Activo') :
      (p.estado === 0 || p.estado === 'Inactivo');

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return coincideEstado;

    return coincideEstado && (
      (p.nombre || '').toLowerCase().includes(termino) ||
      (p.descripcion || '').toLowerCase().includes(termino) ||
      String(p.precio || '').includes(termino) ||
      String(p.duracion_dias || '').includes(termino)
    );
  });

  return {
    usuarioActivo,
    planesFiltrados,
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
    total,
    activos,
    inactivos,
    getRolName,
    confirmModal,
    setConfirmModal,
    handleToggleEstado,
    pedirConfirmacionEliminar,
    confirmarEliminar,
    openModal,
    handleSave
  };
}

// =========================================================
// 3. HOOK REUTILIZABLE: `useProveedores`
// =========================================================
export function useProveedores({ loggedUser }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });
  const [formData, setFormData] = useState({ nombre: '', nombre_empresa: '', telefono: '', correo: '', estado: 1 });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (lista) => {
    setProveedores(lista);
    try {
      localStorage.setItem('gymton_proveedores', JSON.stringify(lista));
    } catch {}
  };

  const cargarDatos = () => {
    getProveedores().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setProveedores(data);
        localStorage.setItem('gymton_proveedores', JSON.stringify(data));
      } else {
        const local = localStorage.getItem('gymton_proveedores');
        if (local) {
          try {
            setProveedores(JSON.parse(local));
            return;
          } catch {}
        }
        const fallback = [
          { id: 1, nombre: 'Carlos Ortiz', nombre_empresa: 'Suplementos GymFit MX', telefono: '555-0192', correo: 'contacto@gymfit.com', estado: 1 },
          { id: 2, nombre: 'Ana Morales', nombre_empresa: 'Equipamiento IronForce', telefono: '555-8832', correo: 'ventas@ironforce.com', estado: 1 },
          { id: 3, nombre: 'Jorge Luna', nombre_empresa: 'Bebidas e Hidratación Sport', telefono: '555-4311', correo: 'distribucion@sportdrink.mx', estado: 0 }
        ];
        setProveedores(fallback);
        localStorage.setItem('gymton_proveedores', JSON.stringify(fallback));
      }
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = proveedores.length;
  const activos = proveedores.filter(p => p.estado === 1 || p.estado === 'Activo').length;
  const inactivos = total - activos;
  const esUsuarioId1 = Number(usuarioActivo?.id) === 1;

  const getRolName = (id_rol) => {
    if (id_rol === 1) return 'Administrador';
    if (id_rol === 2) return 'Recepcionista';
    if (id_rol === 3) return 'Inventario';
    return 'Usuario';
  };

  const handleToggleEstado = async (p) => {
    const esActivo = p.estado === 1 || p.estado === 'Activo';
    const proveedorActualizado = { ...p, estado: esActivo ? 0 : 1 };
    const nuevaLista = proveedores.map(item => item.id === p.id ? proveedorActualizado : item);
    setProveedores(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateProveedor(p.id, proveedorActualizado);
      mostrarAlerta(
        `Proveedor "${p.nombre_empresa || p.nombre}" ${esActivo ? 'dado de baja' : 'activado'} correctamente`,
        esActivo ? 'info' : 'success'
      );
    } catch {
      mostrarAlerta('Actualizado localmente', 'warning');
    }
  };

  const pedirConfirmacionEliminar = (id, nombre) => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para eliminar registros de la tabla proveedores.', 'error');
      return;
    }
    setConfirmModal({ isOpen: true, id, nombre: nombre || 'este proveedor' });
  };

  const confirmarEliminar = async () => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para eliminar registros de la tabla proveedores.', 'error');
      return;
    }
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try {
      await deleteProveedor(id);
      const nuevaLista = proveedores.filter(p => p.id !== id);
      setProveedores(nuevaLista);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Registro eliminado correctamente', 'success');
    } catch {
      mostrarAlerta('Error al eliminar proveedor', 'error');
    }
  };

  const openModal = (mode, proveedor = null) => {
    setModalMode(mode);
    if (mode === 'edit' && proveedor) {
      setFormData({
        id: proveedor.id,
        nombre: proveedor.nombre || '',
        nombre_empresa: proveedor.nombre_empresa || '',
        telefono: proveedor.telefono || '',
        correo: proveedor.correo || '',
        estado: (proveedor.estado === 1 || proveedor.estado === 'Activo') ? 1 : 0
      });
    } else {
      setFormData({ nombre: '', nombre_empresa: '', telefono: '', correo: '', estado: 1 });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const empresaLimpia = (formData.nombre_empresa || '').trim();
    if (!empresaLimpia) {
      mostrarAlerta('Por favor ingresa el nombre de la empresa', 'error');
      return;
    }
    if (empresaLimpia.length > 20) {
      mostrarAlerta('El nombre de la empresa no puede exceder 20 caracteres', 'error');
      return;
    }
    if (formData.nombre && formData.nombre.trim().length > 20) {
      mostrarAlerta('El nombre de contacto no puede exceder 20 caracteres', 'error');
      return;
    }
    if (formData.correo && formData.correo.trim()) {
      const correoLimpio = formData.correo.trim().toLowerCase();
      if (!correoLimpio.includes('@') || !correoLimpio.includes('.com')) {
        mostrarAlerta('El correo electrónico debe ser válido y contener "@" y ".com"', 'error');
        return;
      }
    }
    if (formData.telefono) {
      const telLimpio = formData.telefono.replace(/\D/g, '');
      if (telLimpio.length > 11) {
        mostrarAlerta('El teléfono solo permite un máximo de 11 caracteres numéricos', 'error');
        return;
      }
    }

    try {
      if (modalMode === 'create') {
        const res = await createProveedor(formData);
        const nuevo = (res && res.id) ? res : { ...formData, id: Date.now() };
        guardarLocalmente([nuevo, ...proveedores]);
        setShowModal(false);
        mostrarAlerta('Registro completado correctamente', 'success');
      } else {
        await updateProveedor(formData.id, formData);
        const nuevaLista = proveedores.map(item => item.id === formData.id ? { ...item, ...formData } : item);
        guardarLocalmente(nuevaLista);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
      }
    } catch {
      mostrarAlerta('Error al procesar la solicitud', 'error');
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => {
    const coincideEstado =
      filtro === 'todos' ? true :
      filtro === 'activos' ? (p.estado === 1 || p.estado === 'Activo') :
      (p.estado === 0 || p.estado === 'Inactivo');

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return coincideEstado;

    return coincideEstado && (
      (p.nombre_empresa || '').toLowerCase().includes(termino) ||
      (p.nombre || '').toLowerCase().includes(termino) ||
      (p.telefono || '').toLowerCase().includes(termino) ||
      (p.correo || '').toLowerCase().includes(termino)
    );
  });

  return {
    usuarioActivo,
    proveedoresFiltrados,
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
    total,
    activos,
    inactivos,
    esUsuarioId1,
    getRolName,
    confirmModal,
    setConfirmModal,
    mostrarAlerta,
    handleToggleEstado,
    pedirConfirmacionEliminar,
    confirmarEliminar,
    openModal,
    handleSave
  };
}

// =========================================================
// 4. HOOK REUTILIZABLE: `useUsuarios`
// =========================================================
export function useUsuarios({ loggedUser }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });
  const [formData, setFormData] = useState({
    id_rol: 2,
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    contrasena: '',
    estado: 1
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (nuevosUsuarios) => {
    setUsuarios(nuevosUsuarios);
    try {
      localStorage.setItem('gymton_usuarios', JSON.stringify(nuevosUsuarios));
    } catch {}
  };

  const cargarDatos = async () => {
    try {
      const data = await getUsuarios();
      if (Array.isArray(data) && data.length > 0) {
        setUsuarios(data);
        localStorage.setItem('gymton_usuarios', JSON.stringify(data));
        return;
      }
    } catch {}

    const local = localStorage.getItem('gymton_usuarios');
    if (local) {
      try {
        setUsuarios(JSON.parse(local));
        return;
      } catch {}
    }

    const fallback = [
      { id: 1, id_rol: 1, nombre: 'Fabian', apellido: 'Alvarez', telefono: '3481084815', correo: 'fabi77@gmail.com', estado: "1" },
      { id: 2, id_rol: 1, nombre: 'Osvaldo', apellido: 'Padilla', telefono: '3471012962', correo: 'osvaldivo60@gmail.com', estado: "1" },
      { id: 3, id_rol: 2, nombre: 'Ismael', apellido: 'De anda', telefono: '3471021512', correo: 'Cr7@gmail.com', estado: "1" },
      { id: 4, id_rol: 2, nombre: 'Andy', apellido: 'Qlon', telefono: '34854747512', correo: 'Qlito@gmail.com', estado: "1" }
    ];
    setUsuarios(fallback);
    localStorage.setItem('gymton_usuarios', JSON.stringify(fallback));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const total = usuarios.length;
  const activos = usuarios.filter(u => esEstadoActivo(u.estado)).length;
  const inactivos = total - activos;
  const esUsuarioId1 = Number(usuarioActivo?.id) === 1;

  const getRolName = (id_rol) => {
    const rolNum = Number(id_rol);
    if (rolNum === 1) return 'Administrador';
    if (rolNum === 2) return 'Recepcionista';
    if (rolNum === 3) return 'Inventario';
    return 'Usuario';
  };

  const handleToggleEstado = async (u) => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para modificar datos de la tabla usuarios.', 'error');
      return;
    }
    const esActivo = esEstadoActivo(u.estado);
    const nuevoEst = esActivo ? "0" : "1";
    const nuevaLista = usuarios.map(item => item.id === u.id ? { ...item, estado: nuevoEst } : item);
    setUsuarios(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateUsuario(u.id, { ...u, id_rol: Number(u.id_rol) || 2, contrasena: u.contrasena || '123456', estado: nuevoEst });
      mostrarAlerta(`Usuario "${u.nombre}" ${esActivo ? 'dado de baja' : 'activado'} correctamente`, esActivo ? 'info' : 'success');
    } catch {
      mostrarAlerta('Actualizado localmente', 'warning');
    }
  };

  const pedirConfirmacionEliminar = (id, nombre) => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para eliminar registros de la tabla usuarios.', 'error');
      return;
    }
    setConfirmModal({ isOpen: true, id, nombre: nombre || 'este usuario' });
  };

  const confirmarEliminar = async () => {
    if (!esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para eliminar registros de la tabla usuarios.', 'error');
      return;
    }
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try {
      await deleteUsuario(id);
      mostrarAlerta('Registro eliminado correctamente', 'success');
      await cargarDatos();
    } catch {
      const nuevaLista = usuarios.filter(u => u.id !== id);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Registro eliminado localmente', 'info');
    }
  };

  const openModal = (mode, usuario = null) => {
    if (mode === 'edit' && !esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para modificar datos de la tabla usuarios.', 'error');
      return;
    }
    setModalMode(mode);
    if (mode === 'edit' && usuario) {
      setFormData({
        id: usuario.id,
        id_rol: Number(usuario.id_rol) === 3 ? 3 : 2,
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        telefono: usuario.telefono || '',
        correo: usuario.correo || '',
        contrasena: usuario.contrasena || '',
        estado: esEstadoActivo(usuario.estado) ? 1 : 0
      });
    } else {
      setFormData({ id_rol: 2, nombre: '', apellido: '', telefono: '', correo: '', contrasena: '', estado: 1 });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (modalMode === 'edit' && !esUsuarioId1) {
      mostrarAlerta('Restricción: Únicamente el usuario con ID=1 tiene autorización para modificar datos de la tabla usuarios.', 'error');
      setShowModal(false);
      return;
    }

    const nombreLimpio = formData.nombre.trim();
    if (!nombreLimpio) {
      mostrarAlerta('Por favor ingresa el nombre', 'error');
      return;
    }
    if (nombreLimpio.length > 20) {
      mostrarAlerta('El nombre no puede exceder 20 caracteres', 'error');
      return;
    }
    if (formData.apellido && formData.apellido.trim().length > 20) {
      mostrarAlerta('El apellido no puede exceder 20 caracteres', 'error');
      return;
    }

    const correoLimpio = (formData.correo || '').trim().toLowerCase();
    if (!correoLimpio) {
      mostrarAlerta('Por favor ingresa el correo electrónico', 'error');
      return;
    }
    if (!correoLimpio.includes('@') || !correoLimpio.includes('.com')) {
      mostrarAlerta('El correo debe ser válido y contener "@" y ".com"', 'error');
      return;
    }

    if (formData.telefono) {
      const telLimpio = formData.telefono.replace(/\D/g, '');
      if (telLimpio.length > 11) {
        mostrarAlerta('El teléfono solo permite un máximo de 11 caracteres numéricos', 'error');
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        id_rol: Number(formData.id_rol),
        estado: esEstadoActivo(formData.estado) ? "1" : "0"
      };

      if (modalMode === 'create') {
        await createUsuario(payload);
        setShowModal(false);
        mostrarAlerta('Registro completado correctamente', 'success');
        await cargarDatos();
      } else {
        await updateUsuario(formData.id, payload);
        setShowModal(false);
        mostrarAlerta('Datos actualizados correctamente', 'success');
        await cargarDatos();
      }
    } catch {
      mostrarAlerta('Ocurrió un error al procesar la solicitud en el servidor', 'error');
      if (modalMode === 'create') {
        const nuevo = { ...formData, id: Date.now(), estado: esEstadoActivo(formData.estado) ? "1" : "0" };
        guardarLocalmente([nuevo, ...usuarios]);
      } else {
        const lista = usuarios.map(u => u.id === formData.id ? { ...u, ...formData, estado: esEstadoActivo(formData.estado) ? "1" : "0" } : u);
        guardarLocalmente(lista);
      }
      setShowModal(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideEstado =
      filtro === 'todos' ? true :
      filtro === 'activos' ? esEstadoActivo(u.estado) :
      !esEstadoActivo(u.estado);

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return coincideEstado;

    const nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
    const correo = (u.correo || '').toLowerCase();
    const telefono = (u.telefono || '').toLowerCase();
    const rol = getRolName(u.id_rol).toLowerCase();

    return coincideEstado && (
      nombreCompleto.includes(termino) ||
      correo.includes(termino) ||
      telefono.includes(termino) ||
      rol.includes(termino)
    );
  });

  return {
    usuarioActivo,
    usuariosFiltrados,
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
    total,
    activos,
    inactivos,
    esUsuarioId1,
    getRolName,
    confirmModal,
    setConfirmModal,
    mostrarAlerta,
    handleToggleEstado,
    pedirConfirmacionEliminar,
    confirmarEliminar,
    openModal,
    handleSave,
    esEstadoActivo
  };
}
