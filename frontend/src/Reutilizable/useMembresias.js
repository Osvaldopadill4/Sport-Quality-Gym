import { useState, useEffect } from 'react';
import { getMembresias, createMembresias, updateMembresias, deleteMembresias } from '../JS/membresia';
import { getPlanes } from '../JS/plan';
import { getClientes } from '../JS/cliente';
import { createVenta } from '../JS/venta';
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
    cliente_nombre: 'Juan Pérez',
    id_plan: 2,
    plan_nombre: 'Mensual',
    duracion_dias: 30,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 'activa'
  });

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setAlerta({ mensaje, tipo });
  };

  const guardarLocalmente = (lista) => {
    setMembresias(lista);
    try {
      localStorage.setItem('gymton_membresias', JSON.stringify(lista));
    } catch (e) {
      console.error(e);
    }
  };

  const obtenerNombreCliente = (m) => {
    if (!m) return 'Cliente';
    const cli = clientesCatalogo.find((c) => Number(c.id) === Number(m.id_cliente));
    if (cli && cli.nombre) return cli.nombre;
    if (
      m.cliente_nombre &&
      !String(m.cliente_nombre).startsWith('Socio #') &&
      !String(m.cliente_nombre).startsWith('Cliente #')
    ) {
      return m.cliente_nombre;
    }
    return m.cliente_nombre || 'Cliente General';
  };

  const obtenerNombrePlan = (m) => {
    if (!m) return 'Plan';
    const pl = planesCatalogo.find((p) => Number(p.id) === Number(m.id_plan));
    if (pl && pl.nombre) return pl.nombre;
    if (m.plan_nombre && !String(m.plan_nombre).startsWith('Plan #')) {
      return m.plan_nombre;
    }
    return m.plan_nombre || 'Plan Estándar';
  };

  const obtenerDuracionPlan = (m) => {
    if (!m) return 30;
    const pl = planesCatalogo.find((p) => Number(p.id) === Number(m.id_plan));
    if (pl && Number(pl.duracion_dias) > 0) return Math.min(365, Number(pl.duracion_dias));
    if (Number(m.duracion_dias) > 0 && Number(m.duracion_dias) <= 365) return Number(m.duracion_dias);
    return 30;
  };

  const obtenerPrecioPlan = (planNombre, planId) => {
    const encontrado = planesCatalogo.find(
      (p) => Number(p.id) === Number(planId) || (p.nombre && p.nombre.toLowerCase() === (planNombre || '').toLowerCase())
    );
    if (encontrado && encontrado.precio !== undefined && encontrado.precio !== null) {
      return Math.min(9999, Number(encontrado.precio) || 350);
    }
    return PRECIOS_DEFAULT[planNombre] || 350;
  };

  const cargarDatos = () => {
    getClientes()
      .then((data) => {
        const lista = Array.isArray(data)
          ? data
          : data && Array.isArray(data.content)
          ? data.content
          : data && Array.isArray(data.data)
          ? data.data
          : null;
        if (Array.isArray(lista) && lista.length > 0) {
          setClientesCatalogo(lista);
          localStorage.setItem('gymton_clientes', JSON.stringify(lista));
        } else {
          const local = localStorage.getItem('gymton_clientes');
          if (local) {
            try {
              setClientesCatalogo(JSON.parse(local));
            } catch {}
          }
        }
      })
      .catch(() => {});

    getPlanes()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const planesMembresia = data.filter(
            (p) => p.duracion_dias !== null && p.duracion_dias !== undefined && p.duracion_dias !== ''
          );
          setPlanesCatalogo(planesMembresia.length > 0 ? planesMembresia : data);
        }
      })
      .catch(() => {});

    getMembresias().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const listaSanitizada = data.map((m) => {
          const dias = fn_dias_restantes(m.fecha_vencimiento);
          const fechaInvalida =
            !m.fecha_vencimiento ||
            String(m.fecha_vencimiento).length > 10 ||
            isNaN(new Date(m.fecha_vencimiento).getTime());
          if (fechaInvalida || dias > 500) {
            const inicioDate =
              m.fecha_inicio && String(m.fecha_inicio).length === 10 && !isNaN(new Date(m.fecha_inicio).getTime())
                ? new Date(m.fecha_inicio)
                : hoy;
            const durSanitizada =
              Number(m.duracion_dias) > 0 && Number(m.duracion_dias) <= 365 ? Number(m.duracion_dias) : 30;
            let nuevaVencDate = new Date(inicioDate.getTime() + durSanitizada * 24 * 60 * 60 * 1000);
            const maxPermitida = new Date(hoy.getTime() + 500 * 24 * 60 * 60 * 1000);
            if (nuevaVencDate > maxPermitida) nuevaVencDate = maxPermitida;
            const corregida = {
              ...m,
              fecha_inicio: inicioDate.toISOString().split('T')[0],
              fecha_vencimiento: nuevaVencDate.toISOString().split('T')[0],
              estado: trg_estado_membresia(nuevaVencDate.toISOString().split('T')[0])
            };
            updateMembresias(m.id, corregida).catch(() => {});
            return corregida;
          }
          return m;
        });
        setMembresias(listaSanitizada);
        localStorage.setItem('gymton_membresias', JSON.stringify(listaSanitizada));
      } else {
        const local = localStorage.getItem('gymton_membresias');
        if (local) {
          try {
            setMembresias(JSON.parse(local));
            return;
          } catch (e) {
            console.error(e);
          }
        }
        const hoy = Date.now();
        const fallback = [
          {
            id: 1,
            id_cliente: 1,
            cliente_nombre: 'Juan Pérez García',
            id_plan: 2,
            plan_nombre: 'Mensual',
            duracion_dias: 30,
            fecha_inicio: new Date(hoy - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            fecha_vencimiento: new Date(hoy + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            estado: 'activa'
          },
          {
            id: 2,
            id_cliente: 2,
            cliente_nombre: 'Carolina Gómez Soto',
            id_plan: 3,
            plan_nombre: 'Anual',
            duracion_dias: 365,
            fecha_inicio: new Date(hoy - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            fecha_vencimiento: new Date(hoy + 245 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            estado: 'activa'
          }
        ];
        setMembresias(fallback);
        localStorage.setItem('gymton_membresias', JSON.stringify(fallback));
      }
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Abrir modal de renovación usando `sp_renovar_membresia`
  const abrirModalRenovacion = (m) => {
    const clienteNombreReal = obtenerNombreCliente(m);
    const planNombreReal = obtenerNombrePlan(m);
    const resultadoSP = sp_renovar_membresia(m.id_cliente, m.id_plan, planesCatalogo, m);

    if (!resultadoSP.exito) {
      mostrarAlerta(
        `Restricción: No se puede renovar el plan "${planNombreReal}" para ${clienteNombreReal} porque acumularía ${resultadoSP.diasAcumulados} días de vigencia (el límite máximo permitido es de 500 días).`,
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

    const clienteNombreReal = obtenerNombreCliente(renovacionTarget);
    const planNombreReal = obtenerNombrePlan(renovacionTarget);

    const payload = {
      cliente_id: Number(renovacionTarget.id_cliente),
      cliente_nombre: clienteNombreReal,
      id_plan: Number(renovacionTarget.id_plan),
      plan_nombre: planNombreReal,
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
      mostrarAlerta('Renovación enviada al Punto de Venta. Diríjase al módulo de Caja para cobrar.', 'info');
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
    setMembresias(nuevaLista);
    guardarLocalmente(nuevaLista);

    try {
      await updateMembresias(m.id, renovada);
    } catch (e) {
      console.warn('API de membresía no disponible, guardado en cache local:', e);
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
      `Pago verificado y Membresía renovada para ${clienteNombreReal}. Venta de membresía registrada en Reportes.`,
      'success'
    );
    setRenovacionTarget(null);
  };

  const handleToggleEstado = async (m) => {
    const nuevoEstado = m.estado === 'activa' || m.estado === 'Activo' || m.estado === 1 ? 'inactiva' : 'activa';
    const act = { ...m, estado: nuevoEstado };
    const nuevaLista = membresias.map((item) => (item.id === m.id ? act : item));
    setMembresias(nuevaLista);
    guardarLocalmente(nuevaLista);
    try {
      await updateMembresias(m.id, act);
      mostrarAlerta(`Estado actualizado a: ${nuevoEstado}`, 'info');
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al cambiar estado', 'error');
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
      setMembresias(nuevaLista);
      guardarLocalmente(nuevaLista);
      mostrarAlerta('Membresía eliminada correctamente', 'success');
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al eliminar', 'error');
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
        cliente_nombre: cliNombre,
        plan_nombre: plNombre,
        duracion_dias: plDur
      });
      const cliEncontrado = clientesCatalogo.find((c) => Number(c.id) === Number(m.id_cliente)) || {
        id: m.id_cliente,
        nombre: cliNombre
      };
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
      mostrarAlerta('Por favor busca y selecciona un socio registrado de la base de datos', 'error');
      return;
    }

    const hoyStr = new Date().toISOString().split('T')[0];
    if (modalMode === 'create' && (!formData.fecha_inicio || formData.fecha_inicio < hoyStr)) {
      mostrarAlerta(
        `Restricción: No se puede registrar una membresía con fecha de inicio (${formData.fecha_inicio || 'vacía'}) anterior a la fecha actual (${hoyStr})`,
        'error'
      );
      return;
    }

    if (!formData.fecha_vencimiento || formData.fecha_vencimiento < formData.fecha_inicio) {
      mostrarAlerta('La fecha de vencimiento no puede ser anterior a la fecha de inicio', 'error');
      return;
    }

    const diasVigencia = fn_dias_restantes(formData.fecha_vencimiento);
    const diasRango = Math.ceil(
      (new Date(formData.fecha_vencimiento).getTime() - new Date(formData.fecha_inicio).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (diasVigencia > 500 || diasRango > 500) {
      mostrarAlerta(
        `Restricción: No se permite acumular o asignar más de 500 días en una membresía (intentaste asignar ${Math.max(diasVigencia, diasRango)} días).`,
        'error'
      );
      return;
    }

    const estadoTrigger = trg_estado_membresia(formData.fecha_vencimiento);
    const payload = { ...formData, estado: estadoTrigger };

    try {
      if (modalMode === 'create') {
        const res = await createMembresias(payload);
        const nuevo = res && res.id ? res : { ...payload, id: Date.now() };
        guardarLocalmente([nuevo, ...membresias]);
        mostrarAlerta('Membresía registrada correctamente', 'success');
      } else {
        await updateMembresias(payload.id, payload);
        const lista = membresias.map((m) => (Number(m.id) === Number(payload.id) ? { ...m, ...payload } : m));
        guardarLocalmente(lista);
        mostrarAlerta('Membresía actualizada correctamente', 'success');
      }
      setShowModal(false);
      cargarDatos();
    } catch (e) {
      console.error(e);
      mostrarAlerta('Error al guardar datos', 'error');
    }
  };

  const membresiasFiltradas = membresias.filter((m) => {
    const estadoCalc = fn_estado_membresia(m.fecha_inicio, m.fecha_vencimiento);

    if (filtro === 'activas' && estadoCalc !== 'Activa') return false;
    if (filtro === 'por_vencer' && estadoCalc !== 'Por vencer') return false;
    if (filtro === 'vencidas' && estadoCalc !== 'Vencida') return false;

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    const cliente = obtenerNombreCliente(m).toLowerCase();
    const plan = obtenerNombrePlan(m).toLowerCase();
    return cliente.includes(termino) || plan.includes(termino) || String(m.id_cliente).includes(termino);
  });

  const total = membresias.length;
  const activasCount = membresias.filter((m) => fn_estado_membresia(m.fecha_inicio, m.fecha_vencimiento) === 'Activa').length;
  const porVencerCount = membresias.filter((m) => fn_estado_membresia(m.fecha_inicio, m.fecha_vencimiento) === 'Por vencer').length;
  const vencidasCount = membresias.filter((m) => fn_estado_membresia(m.fecha_inicio, m.fecha_vencimiento) === 'Vencida').length;

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
