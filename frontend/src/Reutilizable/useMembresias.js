import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getMembresias,
  updateMembresias,
  deleteMembresias
} from '../JS/membresia';
import { getPlanes } from '../JS/plan';
import { getClientes } from '../JS/cliente';
import { createVenta } from '../JS/venta';
import { getReporteClientesMembresias } from '../JS/reportes_api';
import {
  fn_dias_restantes,
  fn_estado_membresia,
  trg_estado_membresia,
  sp_renovar_membresia,
  sp_generar_folio
} from './objetosSQL';

const PRECIOS_DEFAULT = {
  Semanal: 150,
  Mensual: 350,
  Anual: 2100,
  Estudiantil: 200,
  Invitado: 30
};

export function useMembresias({ loggedUser, onIrAPuntoVenta }) {
  const [membresias, setMembresias] = useState([]);
  const [planesCatalogo, setPlanesCatalogo] = useState([]);
  const [clientesCatalogo, setClientesCatalogo] = useState([]);
  const [busquedaClienteModal, setBusquedaClienteModal] = useState('');
  const [clienteSeleccionadoModal, setClienteSeleccionadoModal] = useState(null);

  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [alerta, setAlerta] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  const [renovacionTarget, setRenovacionTarget] = useState(null);
  const [metodoPagoPrevio, setMetodoPagoPrevio] = useState('Efectivo');
  const [referenciaPago, setReferenciaPago] = useState('');
  const [modoVerificacion, setModoVerificacion] = useState('caja');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, nombre: '' });

  const [formData, setFormData] = useState({
    id_cliente: 1,
    cliente_nombre: '',
    id_plan: 2,
    plan_nombre: 'Mensual',
    duracion_dias: 30,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 'activa'
  });

  const mostrarAlerta = useCallback((mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  }, []);

  const guardarLocalmente = useCallback((lista) => {
    setMembresias(lista);
    try {
      localStorage.setItem('gymton_membresias', JSON.stringify(lista));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Mapas indexados en memoria para resolución instantánea O(1)
  const clientesMap = useMemo(
    () => new Map((clientesCatalogo || []).map((c) => [Number(c.id), c])),
    [clientesCatalogo]
  );

  const planesMap = useMemo(
    () => new Map((planesCatalogo || []).map((p) => [Number(p.id), p])),
    [planesCatalogo]
  );

  const obtenerNombreCliente = useCallback(
    (m) => {
      if (!m) return 'Cliente';
      const c = clientesMap.get(Number(m.id_cliente));
      return c?.nombre || m.cliente_nombre || 'Cliente General';
    },
    [clientesMap]
  );

  const obtenerNombrePlan = useCallback(
    (m) => {
      if (!m) return 'Plan';
      const p = planesMap.get(Number(m.id_plan));
      return p?.nombre || m.plan_nombre || 'Plan Estándar';
    },
    [planesMap]
  );

  const obtenerDuracionPlan = useCallback(
    (m) => {
      if (!m) return 30;
      const pl = planesMap.get(Number(m.id_plan));
      const dur = Number(pl?.duracion_dias || m.duracion_dias);
      return dur > 0 && dur <= 365 ? dur : 30;
    },
    [planesMap]
  );

  const obtenerPrecioPlan = useCallback(
    (planNombre, planId) => {
      const pl = planesMap.get(Number(planId)) ||
        (planesCatalogo || []).find((p) => p.nombre?.toLowerCase() === (planNombre || '').toLowerCase());
      if (pl && pl.precio !== undefined && pl.precio !== null) {
        return Math.min(9999, Number(pl.precio) || 350);
      }
      return PRECIOS_DEFAULT[planNombre] || 350;
    },
    [planesMap, planesCatalogo]
  );

  // Carga de datos integrando las vistas de MySQL y APIs
  const cargarDatos = useCallback(async () => {
    try {
      const [resCli, resPlanes, resMem, resVista] = await Promise.allSettled([
        getClientes(),
        getPlanes(),
        getMembresias(),
        getReporteClientesMembresias()
      ]);

      if (resCli.status === 'fulfilled' && Array.isArray(resCli.value)) {
        setClientesCatalogo(resCli.value);
        localStorage.setItem('gymton_clientes', JSON.stringify(resCli.value));
      }

      if (resPlanes.status === 'fulfilled' && Array.isArray(resPlanes.value)) {
        const planesFiltrados = resPlanes.value.filter(
          (p) => p.duracion_dias !== null && p.duracion_dias !== undefined && p.duracion_dias !== ''
        );
        setPlanesCatalogo(planesFiltrados.length > 0 ? planesFiltrados : resPlanes.value);
      }

      // 1. Preferir la vista SQL de clientes y membresías con JOIN si está disponible
      if (resVista.status === 'fulfilled' && Array.isArray(resVista.value) && resVista.value.length > 0) {
        const vistaMembresias = resVista.value
          .filter((v) => v.id_membresia)
          .map((v) => ({
            id: v.id_membresia,
            id_cliente: v.id_cliente,
            cliente_nombre: v.cliente,
            plan_nombre: v.plan,
            fecha_inicio: v.fecha_inicio,
            fecha_vencimiento: v.fecha_vencimiento,
            estado: v.estado_membresia || 'activa'
          }));

        if (vistaMembresias.length > 0) {
          guardarLocalmente(vistaMembresias);
          return;
        }
      }

      // 2. Endpoint estándar /api/membresia
      if (resMem.status === 'fulfilled' && Array.isArray(resMem.value) && resMem.value.length > 0) {
        guardarLocalmente(resMem.value);
        return;
      }
    } catch (e) {
      console.warn('Error al cargar catálogo de membresías:', e);
    }

    // Fallback a LocalStorage si el servidor está en arranque
    const local = localStorage.getItem('gymton_membresias');
    if (local) {
      try {
        setMembresias(JSON.parse(local));
      } catch (err) {
        console.error(err);
      }
    }
  }, [guardarLocalmente]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Renovación de membresía usando el procedimiento `sp_renovar_membresia`
  const abrirModalRenovacion = (m) => {
    const clienteNombreReal = obtenerNombreCliente(m);
    const planNombreReal = obtenerNombrePlan(m);
    const resultadoSP = sp_renovar_membresia(m.id_cliente, m.id_plan, planesCatalogo, m);

    if (!resultadoSP.exito) {
      mostrarAlerta(
        `Restricción: No se puede renovar el plan "${planNombreReal}" para ${clienteNombreReal} porque acumularía ${resultadoSP.diasAcumulados} días de vigencia (límite: 500 días).`,
        'error'
      );
      return;
    }

    const precio = obtenerPrecioPlan(planNombreReal, m.id_plan);
    setRenovacionTarget({
      ...m,
      cliente_nombre: clienteNombreReal,
      plan_nombre: planNombreReal,
      precio,
      duracion: resultadoSP.duracion_dias,
      nuevaVencimiento: resultadoSP.fecha_vencimiento
    });
    setReferenciaPago('');
    setMetodoPagoPrevio('Efectivo');
    setModoVerificacion('caja');
  };

  const handleMandarAPuntoVenta = () => {
    if (!renovacionTarget) return;

    const payload = {
      cliente_id: Number(renovacionTarget.id_cliente),
      cliente_nombre: obtenerNombreCliente(renovacionTarget),
      id_plan: Number(renovacionTarget.id_plan),
      plan_nombre: obtenerNombrePlan(renovacionTarget),
      precio: Number(renovacionTarget.precio) || 350,
      duracion_dias: Number(renovacionTarget.duracion) || 30,
      membresia_id: Number(renovacionTarget.id),
      fecha_vencimiento_actual: renovacionTarget.fecha_vencimiento
    };

    try {
      localStorage.setItem('gymton_renovacion_pendiente', JSON.stringify(payload));
    } catch (e) {
      console.error(e);
    }

    setRenovacionTarget(null);

    if (onIrAPuntoVenta) {
      onIrAPuntoVenta(payload);
    } else {
      mostrarAlerta('Renovación enviada al Punto de Venta para cobro.', 'info');
    }
  };

  const handleRenovarMembresia = async (m) => {
    const resultadoSP = sp_renovar_membresia(m.id_cliente, m.id_plan, planesCatalogo, m);
    if (!resultadoSP.exito) {
      mostrarAlerta(resultadoSP.mensaje, 'error');
      return false;
    }

    const renovada = {
      ...m,
      cliente_nombre: obtenerNombreCliente(m),
      plan_nombre: obtenerNombrePlan(m),
      duracion_dias: resultadoSP.duracion_dias,
      fecha_inicio: resultadoSP.fecha_inicio,
      fecha_vencimiento: resultadoSP.fecha_vencimiento,
      estado: resultadoSP.estado
    };

    const nuevaLista = membresias.map((item) => (Number(item.id) === Number(m.id) ? renovada : item));
    guardarLocalmente(nuevaLista);

    try {
      await updateMembresias(m.id, renovada);
    } catch (e) {
      console.warn('API no disponible, guardado en cache local:', e);
    }
    return true;
  };

  const handleVerificarPagoPrevioYRenovar = async () => {
    if (!renovacionTarget) return;
    const ok = await handleRenovarMembresia(renovacionTarget);
    if (!ok) return;

    const clienteNombreReal = obtenerNombreCliente(renovacionTarget);
    const planNombreReal = obtenerNombrePlan(renovacionTarget);
    const precioCobrado = Number(renovacionTarget.precio) || 350;
    const ahora = new Date();
    const folioGen = sp_generar_folio();

    try {
      await createVenta({
        folio: folioGen,
        id_usuario: loggedUser?.id || 1,
        empleado: loggedUser ? `${loggedUser.nombre} ${loggedUser.apellido || ''}`.trim() : 'Recepción',
        id_cliente: Number(renovacionTarget.id_cliente),
        cliente: clienteNombreReal,
        fecha: ahora.toISOString().replace('T', ' ').slice(0, 19),
        metodo_pago: metodoPagoPrevio === 'Tarjeta' ? 'Tarjeta' : 'Efectivo',
        subtotal: precioCobrado,
        descuento: 0,
        descuento_porcentaje: 0,
        total: precioCobrado,
        es_membresia: true,
        tipo_venta: 'Membresía',
        detalles: [
          {
            id_producto: null,
            id_plan: Number(renovacionTarget.id_plan),
            es_membresia: true,
            articulo: `Renovación: Plan ${planNombreReal} (${renovacionTarget.duracion} días)`,
            cantidad: 1,
            precio_unitario: precioCobrado,
            subtotal: precioCobrado
          }
        ]
      });
    } catch (errVenta) {
      console.warn('Error registrando venta de renovación:', errVenta);
    }

    mostrarAlerta(
      `Pago registrado y membresía renovada para ${clienteNombreReal}.`,
      'success'
    );
    setRenovacionTarget(null);
  };

  const handleToggleEstado = async (m) => {
    const nuevoEstado = m.estado === 'activa' || m.estado === 'Activo' || m.estado === 1 ? 'inactiva' : 'activa';
    const act = { ...m, estado: nuevoEstado };
    const nuevaLista = membresias.map((item) => (item.id === m.id ? act : item));
    guardarLocalmente(nuevaLista);

    try {
      await updateMembresias(m.id, act);
      mostrarAlerta(`Estado actualizado a: ${nuevoEstado}`, 'info');
      cargarDatos();
    } catch {
      mostrarAlerta('Error al cambiar estado en servidor', 'error');
    }
  };

  const pedirConfirmacionEliminar = (id, nombre) => {
    setConfirmModal({
      isOpen: true,
      id,
      nombre: nombre || 'esta membresía'
    });
  };

  const confirmarEliminar = async () => {
    const id = confirmModal.id;
    setConfirmModal({ isOpen: false, id: null, nombre: '' });
    if (!id) return;
    try {
      await deleteMembresias(id);
      const nuevaLista = membresias.filter((m) => m.id !== id);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Membresía eliminada correctamente', 'success');
      cargarDatos();
    } catch {
      mostrarAlerta('Error al eliminar membresía', 'error');
    }
  };

  const openModal = (mode, m = null) => {
    setModalMode(mode);
    setBusquedaClienteModal('');
    const hoyStr = new Date().toISOString().split('T')[0];
    const primerPlan = planesCatalogo.length > 0 ? planesCatalogo[0] : null;
    const pId = primerPlan ? primerPlan.id : 2;
    const pNom = primerPlan ? primerPlan.nombre : 'Mensual';
    const pDur = primerPlan ? Number(primerPlan.duracion_dias) || 30 : 30;

    if (mode === 'edit' && m) {
      const cliNombre = obtenerNombreCliente(m);
      const plNombre = obtenerNombrePlan(m);
      const plDur = obtenerDuracionPlan(m);
      setFormData({
        ...m,
        id_plan_original: Number(m.id_plan),
        cliente_nombre: cliNombre,
        plan_nombre: plNombre,
        duracion_dias: plDur
      });
      const cliEncontrado = clientesMap.get(Number(m.id_cliente)) || { id: m.id_cliente, nombre: cliNombre };
      setClienteSeleccionadoModal(cliEncontrado);
    } else {
      setClienteSeleccionadoModal(null);
      setFormData({
        id_cliente: '',
        cliente_nombre: '',
        id_plan: pId,
        plan_nombre: pNom,
        duracion_dias: Math.min(365, pDur),
        fecha_inicio: hoyStr,
        fecha_vencimiento: new Date(Date.now() + Math.min(365, pDur) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estado: 'activa'
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.id_cliente || !formData.cliente_nombre) {
      mostrarAlerta('Por favor selecciona un socio registrado de la base de datos', 'error');
      return;
    }

    // Si es creación de membresía o cambio de plan: Transferir a Caja para cobrar primero
    const esCambioDePlan = modalMode === 'edit' && formData.id_plan_original && Number(formData.id_plan) !== Number(formData.id_plan_original);

    if (modalMode === 'create' || esCambioDePlan) {
      const precioPlan = obtenerPrecioPlan(formData.plan_nombre, formData.id_plan);
      const payloadCobro = {
        cliente_id: Number(formData.id_cliente),
        cliente_nombre: formData.cliente_nombre,
        id_plan: Number(formData.id_plan),
        plan_nombre: formData.plan_nombre || 'Plan',
        precio: precioPlan,
        duracion_dias: Number(formData.duracion_dias) || 30,
        membresia_id: esCambioDePlan ? Number(formData.id) : null,
        es_cambio_plan: esCambioDePlan,
        es_nueva: modalMode === 'create'
      };

      try {
        localStorage.setItem('gymton_renovacion_pendiente', JSON.stringify(payloadCobro));
      } catch (err) {}

      setShowModal(false);

      if (onIrAPuntoVenta) {
        onIrAPuntoVenta(payloadCobro);
      } else {
        mostrarAlerta(
          esCambioDePlan
            ? 'Actualización de membresía enviada a Caja. Proceda a cobrar el nuevo plan en Punto de Venta.'
            : 'Membresía enviada al Punto de Venta. Proceda a cobrar el ticket en Caja.',
          'info'
        );
      }
      return;
    }

    // Modo Edición
    if (!formData.fecha_vencimiento || formData.fecha_vencimiento < formData.fecha_inicio) {
      mostrarAlerta('La fecha de vencimiento no puede ser anterior a la de inicio', 'error');
      return;
    }

    const diasVigencia = fn_dias_restantes(formData.fecha_vencimiento);
    if (diasVigencia > 500) {
      mostrarAlerta(`Restricción: No se permite asignar más de 500 días (${diasVigencia} días calculados).`, 'error');
      return;
    }

    const estadoTrigger = trg_estado_membresia(formData.fecha_vencimiento);
    const payload = { ...formData, estado: estadoTrigger };

    try {
      await updateMembresias(payload.id, payload);
      const lista = membresias.map((m) => (Number(m.id) === Number(payload.id) ? { ...m, ...payload } : m));
      guardarLocalmente(lista);
      mostrarAlerta('Membresía actualizada correctamente', 'success');
      setShowModal(false);
      cargarDatos();
    } catch {
      mostrarAlerta('Error al guardar datos de la membresía', 'error');
    }
  };

  // Cálculo en una sola pasada de estadísticas y filtro O(n)
  const { membresiasFiltradas, total, activasCount, porVencerCount, vencidasCount } = useMemo(() => {
    let act = 0;
    let porV = 0;
    let venc = 0;
    const term = busqueda.toLowerCase().trim();

    const filtradas = (membresias || []).filter((m) => {
      const estadoCalc = fn_estado_membresia(m.fecha_inicio, m.fecha_vencimiento);
      if (estadoCalc === 'Activa') act++;
      else if (estadoCalc === 'Por vencer') porV++;
      else if (estadoCalc === 'Vencida') venc++;

      if (filtro === 'activas' && estadoCalc !== 'Activa') return false;
      if (filtro === 'por_vencer' && estadoCalc !== 'Por vencer') return false;
      if (filtro === 'vencidas' && estadoCalc !== 'Vencida') return false;

      if (!term) return true;
      const cliente = obtenerNombreCliente(m).toLowerCase();
      const plan = obtenerNombrePlan(m).toLowerCase();
      return cliente.includes(term) || plan.includes(term) || String(m.id_cliente).includes(term);
    });

    return {
      membresiasFiltradas: filtradas,
      total: (membresias || []).length,
      activasCount: act,
      porVencerCount: porV,
      vencidasCount: venc
    };
  }, [membresias, filtro, busqueda, obtenerNombreCliente, obtenerNombrePlan]);

  return {
    membresiasFiltradas,
    planesCatalogo,
    clientesCatalogo,
    busquedaClienteModal,
    setBusquedaClienteModal,
    clienteSeleccionadoModal,
    setClienteSeleccionadoModal,
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
    renovacionTarget,
    setRenovacionTarget,
    metodoPagoPrevio,
    setMetodoPagoPrevio,
    referenciaPago,
    setReferenciaPago,
    modoVerificacion,
    setModoVerificacion,
    confirmModal,
    setConfirmModal,
    mostrarAlerta,
    obtenerNombreCliente,
    obtenerNombrePlan,
    abrirModalRenovacion,
    handleMandarAPuntoVenta,
    handleVerificarPagoPrevioYRenovar,
    handleToggleEstado,
    pedirConfirmacionEliminar,
    confirmarEliminar,
    openModal,
    handleSave,
    total,
    activasCount,
    porVencerCount,
    vencidasCount,
    fnDiasRestantes: fn_dias_restantes,
    fnEstadoMembresia: fn_estado_membresia
  };
}