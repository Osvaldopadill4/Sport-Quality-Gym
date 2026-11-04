import { useState, useEffect, useRef } from 'react';
import { getAcceso, createAcceso, generarQrCliente, validarQrAcceso } from '../JS/acceso';
import { getClientes } from '../JS/cliente';
import { getMembresias } from '../JS/membresia';
import { getPlanes } from '../JS/plan';
import {
  fn_dias_restantes,
  fn_membresia_activa,
  sp_registrar_acceso,
  vw_historial_accesos
} from './objetosSQL';

export const CLIENTES_DEMO = [
  {
    id: 1,
    uuid: 'gym-uuid-juan-001',
    nombre: 'Juan Pérez García',
    telefono: '555-0101',
    plan: 'Mensual',
    tipo_plan: 'Mensual',
    precio_plan: 350,
    dias_restantes: 22,
    fecha_vencimiento: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 1,
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    es_invitado: false
  },
  {
    id: 2,
    uuid: 'gym-uuid-carolina-002',
    nombre: 'Carolina Gómez Soto',
    telefono: '555-0102',
    plan: 'Anual',
    tipo_plan: 'Anual',
    precio_plan: 2100,
    dias_restantes: 240,
    fecha_vencimiento: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 1,
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    es_invitado: false
  },
  {
    id: 3,
    uuid: 'gym-uuid-diego-003',
    nombre: 'Diego Martínez Cruz',
    telefono: '555-0103',
    plan: 'Invitado',
    tipo_plan: 'Invitado',
    precio_plan: 0,
    dias_restantes: 1,
    fecha_vencimiento: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 1,
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    es_invitado: true
  },
  {
    id: 4,
    uuid: 'gym-uuid-sofia-004',
    nombre: 'Sofía Mendoza Luna',
    telefono: '555-0104',
    plan: 'Semanal',
    tipo_plan: 'Semanal',
    precio_plan: 150,
    dias_restantes: 3,
    fecha_vencimiento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 1,
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    es_invitado: false
  },
  {
    id: 5,
    uuid: 'gym-uuid-roberto-005',
    nombre: 'Roberto Sánchez Ruiz',
    telefono: '555-0105',
    plan: 'Mensual',
    tipo_plan: 'Mensual',
    precio_plan: 350,
    dias_restantes: -4,
    fecha_vencimiento: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 1,
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    es_invitado: false
  },
  {
    id: 6,
    uuid: 'gym-uuid-laura-006',
    nombre: 'Laura Morales Silva',
    telefono: '555-0106',
    plan: 'Estudiantil',
    tipo_plan: 'Estudiantil',
    precio_plan: 200,
    dias_restantes: 18,
    fecha_vencimiento: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 0,
    foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80',
    es_invitado: false
  }
];

export function useAcceso(loggedUser) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [inputCodigo, setInputCodigo] = useState('');
  const [accesos, setAccesos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroResultado, setFiltroResultado] = useState('todos');
  const [alerta, setAlerta] = useState(null);
  const [sonidoHabilitado, setSonidoHabilitado] = useState(true);

  const [alertaFlash, setAlertaFlash] = useState(null);
  const [tiempoRestanteFlash, setTiempoRestanteFlash] = useState(4);

  const [clientesBD, setClientesBD] = useState([]);
  const [membresiasBD, setMembresiasBD] = useState([]);
  const [planesBD, setPlanesBD] = useState([]);

  const [showSimuladorMovil, setShowSimuladorMovil] = useState(false);
  const [clienteSimulado, setClienteSimulado] = useState(CLIENTES_DEMO[0]);
  const [qrJwtToken, setQrJwtToken] = useState('');
  const [tokenCountdown, setTokenCountdown] = useState(60);
  const [tokenCargando, setTokenCargando] = useState(false);

  const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString());
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!alertaFlash && !showSimuladorMovil && inputRef.current) {
      inputRef.current.focus();
    }
  }, [alertaFlash, showSimuladorMovil]);

  // Cargar clientes, membresías y planes reales desde MySQL para sincronizar con la App Móvil y Vistas SQL
  useEffect(() => {
    Promise.allSettled([getClientes(), getMembresias(), getPlanes()]).then(([resCli, resMemb, resPlan]) => {
      if (resCli.status === 'fulfilled' && Array.isArray(resCli.value) && resCli.value.length > 0) {
        setClientesBD(resCli.value);
      }
      if (resMemb.status === 'fulfilled' && Array.isArray(resMemb.value) && resMemb.value.length > 0) {
        setMembresiasBD(resMemb.value);
      }
      if (resPlan.status === 'fulfilled' && Array.isArray(resPlan.value) && resPlan.value.length > 0) {
        setPlanesBD(resPlan.value);
      }
    });
  }, []);

  // Consolidar clientes con su estado real de `vw_estado_membresias` y `fn_dias_restantes`
  const obtenerListaClientes = () => {
    const idsDemo = new Set(CLIENTES_DEMO.map((c) => c.id));

    const resolverMembresiaCliente = (idCliente, fallbackPlan = 'Mensual', fallbackDias = 30, fallbackVenc = null) => {
      const m = membresiasBD.find((item) => Number(item.id_cliente) === Number(idCliente));
      if (!m) {
        return {
          plan: fallbackPlan,
          dias_restantes: fallbackDias,
          fecha_vencimiento: fallbackVenc || new Date(Date.now() + fallbackDias * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          es_invitado: String(fallbackPlan).toLowerCase().includes('invitado')
        };
      }
      const pl = planesBD.find((p) => Number(p.id) === Number(m.id_plan));
      const nombrePlan = pl?.nombre || m.plan_nombre || fallbackPlan;
      const dias = fn_dias_restantes(m.fecha_vencimiento);
      return {
        plan: nombrePlan,
        dias_restantes: dias,
        fecha_vencimiento: m.fecha_vencimiento,
        es_invitado: String(nombrePlan).toLowerCase().includes('invitado') || Number(pl?.duracion_dias) === 1
      };
    };

    const extrasBD = (clientesBD || [])
      .filter((c) => !idsDemo.has(c.id))
      .map((c) => {
        const infoM = resolverMembresiaCliente(c.id);
        return {
          id: c.id,
          uuid: c.token_qr || `gym-uuid-cl-${c.id}`,
          nombre: c.nombre || 'Cliente Registrado',
          telefono: c.telefono || 'Sin teléfono',
          plan: infoM.plan,
          tipo_plan: infoM.plan,
          precio_plan: 350,
          dias_restantes: infoM.dias_restantes,
          fecha_vencimiento: infoM.fecha_vencimiento,
          estado: c.estado === 1 || c.estado === '1' || String(c.estado).toLowerCase() === 'activo' ? 1 : 0,
          foto: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.nombre || 'C')}`,
          es_invitado: infoM.es_invitado
        };
      });

    const bdMap = new Map((clientesBD || []).map((c) => [c.id, c]));
    const demosActualizados = CLIENTES_DEMO.map((demo) => {
      if (bdMap.has(demo.id)) {
        const fromDb = bdMap.get(demo.id);
        const infoM = resolverMembresiaCliente(demo.id, demo.plan, demo.dias_restantes, demo.fecha_vencimiento);
        return {
          ...demo,
          nombre: fromDb.nombre || demo.nombre,
          telefono: fromDb.telefono || demo.telefono,
          plan: infoM.plan,
          dias_restantes: infoM.dias_restantes,
          fecha_vencimiento: infoM.fecha_vencimiento,
          es_invitado: infoM.es_invitado,
          estado: fromDb.estado === '1' || fromDb.estado === 1 ? 1 : 0,
          uuid: fromDb.token_qr || demo.uuid
        };
      }
      return demo;
    });

    return [...demosActualizados, ...extrasBD];
  };

  // Cargar historial usando `vw_historial_accesos`
  const cargarAccesos = async () => {
    try {
      const data = await getAcceso();
      if (Array.isArray(data) && data.length > 0) {
        const clientesActuales = obtenerListaClientes();
        const historialEnriquecido = vw_historial_accesos(data, clientesActuales);
        const mapa = new Map(clientesActuales.map((c) => [Number(c.id), c]));

        const normalizados = historialEnriquecido.map((item) => {
          const cliente = mapa.get(Number(item.id_cliente));
          const esConcedido = item.resultado === 'CONCEDIDO' || item.resultado === 'PERMITIDO' || item.resultado === 'Permitido';
          const esInvitado = cliente?.es_invitado || cliente?.plan?.toLowerCase().includes('invitado');
          const porVencer = cliente?.dias_restantes <= 5 && cliente?.dias_restantes >= 0;

          let colorBadge = 'green';
          if (!esConcedido) {
            colorBadge = 'red';
          } else if (esInvitado || porVencer) {
            colorBadge = 'yellow';
          }

          return {
            id: item.id || Date.now() + Math.random(),
            id_cliente: item.id_cliente,
            uuid: item.uuid || cliente?.uuid || `SOCIO-${item.id_cliente}`,
            cliente_nombre: item.nombre || item.cliente_nombre || cliente?.nombre || `Socio #${item.id_cliente}`,
            plan: item.plan || cliente?.plan || 'Membresía General',
            fecha: item.fecha || new Date().toISOString().split('T')[0],
            hora: item.hora || '00:00:00',
            resultado: esConcedido ? 'Permitido' : item.resultado,
            color: colorBadge,
            dias_restantes: item.dias_restantes !== undefined ? item.dias_restantes : (cliente ? cliente.dias_restantes : 30),
            foto: item.foto || cliente?.foto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.nombre || 'S')}`
          };
        });

        setAccesos(normalizados);
        localStorage.setItem('gymton_accesos_log', JSON.stringify(normalizados));
        return;
      }
    } catch (err) {
      console.warn('Error al sincronizar historial con MySQL:', err);
    }

    const local = localStorage.getItem('gymton_accesos_log');
    if (local) {
      try {
        setAccesos(JSON.parse(local));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    const hoyStr = new Date().toISOString().split('T')[0];
    const demoAccesos = [
      {
        id: 101,
        id_cliente: 1,
        uuid: 'gym-uuid-juan-001',
        cliente_nombre: 'Juan Pérez García',
        plan: 'Mensual',
        fecha: hoyStr,
        hora: '07:15:30',
        resultado: 'Permitido',
        color: 'green',
        dias_restantes: 22,
        foto: CLIENTES_DEMO[0].foto
      },
      {
        id: 102,
        id_cliente: 2,
        uuid: 'gym-uuid-carolina-002',
        cliente_nombre: 'Carolina Gómez Soto',
        plan: 'Anual',
        fecha: hoyStr,
        hora: '08:30:12',
        resultado: 'Permitido',
        color: 'green',
        dias_restantes: 240,
        foto: CLIENTES_DEMO[1].foto
      },
      {
        id: 103,
        id_cliente: 4,
        uuid: 'gym-uuid-sofia-004',
        cliente_nombre: 'Sofía Mendoza Luna',
        plan: 'Semanal',
        fecha: hoyStr,
        hora: '09:02:45',
        resultado: 'Por Vencer (3 días)',
        color: 'yellow',
        dias_restantes: 3,
        foto: CLIENTES_DEMO[3].foto
      },
      {
        id: 104,
        id_cliente: 5,
        uuid: 'gym-uuid-roberto-005',
        cliente_nombre: 'Roberto Sánchez Ruiz',
        plan: 'Mensual',
        fecha: hoyStr,
        hora: '09:45:00',
        resultado: 'Denegado (Vencido)',
        color: 'red',
        dias_restantes: -4,
        foto: CLIENTES_DEMO[4].foto
      }
    ];
    setAccesos(demoAccesos);
    localStorage.setItem('gymton_accesos_log', JSON.stringify(demoAccesos));
  };

  useEffect(() => {
    cargarAccesos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientesBD, membresiasBD, planesBD]);

  useEffect(() => {
    if (!alertaFlash) return;
    setTiempoRestanteFlash(4);
    const interval = setInterval(() => {
      setTiempoRestanteFlash((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAlertaFlash(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [alertaFlash]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (alertaFlash && (e.key === 'Escape' || e.key === ' ')) {
        setAlertaFlash(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alertaFlash]);

  // Solicitar token dinámico JWT a Spring Boot (`/api/acceso/generar-qr/{clienteId}`)
  const pedirQrDinamico = async (clienteId) => {
    setTokenCargando(true);
    try {
      const resp = await generarQrCliente(clienteId);
      if (resp && resp.token) {
        setQrJwtToken(resp.token);
        setTokenCountdown(60);
      } else {
        setQrJwtToken(`JWT-FALLBACK-CL-${clienteId}-${Date.now()}`);
        setTokenCountdown(60);
      }
    } catch {
      setQrJwtToken(`JWT-FALLBACK-CL-${clienteId}-${Date.now()}`);
      setTokenCountdown(60);
    } finally {
      setTokenCargando(false);
    }
  };

  useEffect(() => {
    if (showSimuladorMovil && clienteSimulado) {
      pedirQrDinamico(clienteSimulado.id);
    }
  }, [showSimuladorMovil, clienteSimulado]);

  useEffect(() => {
    if (!showSimuladorMovil || !qrJwtToken) return;
    const interval = setInterval(() => {
      setTokenCountdown((prev) => {
        if (prev <= 1) {
          pedirQrDinamico(clienteSimulado.id);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showSimuladorMovil, qrJwtToken, clienteSimulado]);

  const emitirSonido = (tipo) => {
    if (!sonidoHabilitado) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (tipo === 'green') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (tipo === 'yellow') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Ignorar si el navegador restringe reproducción
    }
  };

  // Procesar acceso integrando validación QR JWT de Spring Boot + `sp_registrar_acceso` + `fn_membresia_activa`
  const procesarAcceso = async (codigoParam) => {
    const rawCode = (codigoParam !== undefined ? codigoParam : inputCodigo).trim();
    if (!rawCode) return;

    setInputCodigo('');

    const ahora = new Date();
    const fechaHoy = ahora.toISOString().split('T')[0];
    const horaActualStr = ahora.toLocaleTimeString();

    const pareceJwt = rawCode.includes('.') || rawCode.startsWith('eyJ') || rawCode.length > 50;

    if (pareceJwt) {
      const respBackend = await validarQrAcceso(rawCode);
      if (respBackend) {
        if (respBackend.acceso) {
          const lista = obtenerListaClientes();
          const socio = lista.find((c) => Number(c.id) === Number(respBackend.clienteId)) || {
            id: respBackend.clienteId,
            nombre: respBackend.clienteNombre || 'Socio Registrado',
            plan: 'Mensual Activo',
            dias_restantes: 30,
            foto: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(respBackend.clienteNombre || 'S')}`
          };

          const esInvitado = socio.es_invitado || socio.plan?.toLowerCase().includes('invitado');
          const porVencer = socio.dias_restantes <= 5 && socio.dias_restantes >= 0;
          const colorFlash = esInvitado || porVencer ? 'yellow' : 'green';

          emitirSonido(colorFlash);
          setAlertaFlash({
            color: colorFlash,
            titulo: colorFlash === 'yellow' ? '¡ATENCIÓN! ACCESO CON PRECAUCIÓN' : '¡CORRECTO! ACCESO PERMITIDO',
            subtitulo: colorFlash === 'yellow'
              ? (esInvitado ? 'Pase de Invitado (1 Día)' : `Le quedan ${socio.dias_restantes} días`)
              : 'Torniquete Automático Desbloqueado',
            razon: `Validado con token JWT por el servidor Spring Boot. Hora: ${respBackend.horaEntrada || horaActualStr}`,
            cliente: socio
          });

          cargarAccesos();
          return;
        } else {
          emitirSonido('red');
          setAlertaFlash({
            color: 'red',
            titulo: '¡ACCESO DENEGADO!',
            subtitulo: 'Token QR Expirado o Inválido',
            razon: respBackend.mensaje || 'Firma digital no válida o tiempo límite de 60 segundos excedido.',
            cliente: {
              nombre: 'Acceso No Autorizado',
              plan: 'Token Expirado',
              dias_restantes: 0,
              foto: null
            }
          });
          cargarAccesos();
          return;
        }
      }
    }

    const listaCompleta = obtenerListaClientes();
    const codigoMinuscula = rawCode.toLowerCase();

    const clienteEncontrado = listaCompleta.find(
      (c) =>
        c.uuid?.toLowerCase() === codigoMinuscula ||
        String(c.id) === rawCode ||
        c.nombre?.toLowerCase().includes(codigoMinuscula)
    );

    if (!clienteEncontrado) {
      emitirSonido('red');
      setAlertaFlash({
        color: 'red',
        titulo: '¡ACCESO DENEGADO!',
        subtitulo: 'Código QR no reconocido o inexistente',
        razon: `El código "${rawCode}" no coincide con ningún socio en la base de datos.`,
        cliente: {
          nombre: 'Desconocido / No Registrado',
          plan: 'Sin Membresía',
          dias_restantes: 0,
          foto: null
        }
      });

      const nuevoLog = {
        id: Date.now(),
        id_cliente: 0,
        uuid: rawCode,
        cliente_nombre: 'Código Desconocido (' + rawCode + ')',
        plan: 'Ninguno',
        fecha: fechaHoy,
        hora: horaActualStr,
        resultado: 'Denegado (No registrado)',
        color: 'red',
        dias_restantes: 0
      };

      const actualizados = [nuevoLog, ...accesos];
      setAccesos(actualizados);
      localStorage.setItem('gymton_accesos_log', JSON.stringify(actualizados));
      return;
    }

    // Evaluar con `sp_registrar_acceso` y `fn_membresia_activa`
    const spRes = sp_registrar_acceso(clienteEncontrado.id, membresiasBD);
    const tieneMembresiaEnBD = membresiasBD.some((m) => Number(m.id_cliente) === Number(clienteEncontrado.id));

    const esInactivo = clienteEncontrado.estado === 0 || clienteEncontrado.estado === 'Inactivo';
    const esVencido = clienteEncontrado.dias_restantes < 0 || (tieneMembresiaEnBD && fn_membresia_activa(clienteEncontrado.id, membresiasBD) === 0);
    const esInvitado = clienteEncontrado.es_invitado || clienteEncontrado.plan?.toLowerCase().includes('invitado');
    const porVencer = clienteEncontrado.dias_restantes <= 5 && clienteEncontrado.dias_restantes >= 0;

    let resultadoColor = 'green';
    let tituloFlash = '¡CORRECTO! ACCESO PERMITIDO';
    let subtituloFlash = 'Torniquete Automático Desbloqueado';
    let razonMensaje = 'Membresía activa y al corriente. ¡Disfruta tu entrenamiento!';
    let resultadoBadge = 'Permitido';

    if (esInactivo) {
      resultadoColor = 'red';
      tituloFlash = '¡ACCESO DENEGADO!';
      subtituloFlash = 'Torniquete Bloqueado';
      razonMensaje = 'Socio suspendido o dado de baja administrativa. Acudir a recepción.';
      resultadoBadge = 'Denegado (Inactivo)';
    } else if (esVencido) {
      resultadoColor = 'red';
      tituloFlash = '¡ACCESO DENEGADO!';
      subtituloFlash = 'Membresía Vencida';
      razonMensaje = `Su membresía venció hace ${Math.abs(clienteEncontrado.dias_restantes)} días (${clienteEncontrado.fecha_vencimiento}). Por favor renueve en caja.`;
      resultadoBadge = 'Denegado (Vencido)';
    } else if (esInvitado) {
      resultadoColor = 'yellow';
      tituloFlash = '¡ATENCIÓN! ACCESO CON PRECAUCIÓN';
      subtituloFlash = 'Pase de Invitado (1 Día)';
      razonMensaje = 'Pase de cortesía válido únicamente por 24 horas. ¡Bienvenido a Gymton!';
      resultadoBadge = 'Invitado (1 Día)';
    } else if (porVencer) {
      resultadoColor = 'yellow';
      tituloFlash = '¡ATENCIÓN! MEMBRESÍA POR VENCER';
      subtituloFlash = `Le quedan ${clienteEncontrado.dias_restantes} días de acceso`;
      razonMensaje = `Su membresía vence pronto (${clienteEncontrado.fecha_vencimiento}). Puede renovar anticipadamente en recepción.`;
      resultadoBadge = `Por Vencer (${clienteEncontrado.dias_restantes} d)`;
    }

    emitirSonido(resultadoColor);

    setAlertaFlash({
      color: resultadoColor,
      titulo: tituloFlash,
      subtitulo: subtituloFlash,
      razon: razonMensaje,
      cliente: clienteEncontrado
    });

    const nuevoRegistro = {
      id: Date.now(),
      id_cliente: clienteEncontrado.id,
      uuid: clienteEncontrado.uuid,
      cliente_nombre: clienteEncontrado.nombre,
      plan: clienteEncontrado.plan,
      fecha: spRes.fecha,
      hora: horaActualStr,
      resultado: resultadoBadge,
      color: resultadoColor,
      dias_restantes: clienteEncontrado.dias_restantes,
      foto: clienteEncontrado.foto
    };

    const listaActualizada = [nuevoRegistro, ...accesos];
    setAccesos(listaActualizada);
    localStorage.setItem('gymton_accesos_log', JSON.stringify(listaActualizada));

    try {
      await createAcceso({
        id_cliente: clienteEncontrado.id,
        fecha: spRes.fecha,
        hora: spRes.hora,
        resultado: resultadoColor === 'green' || resultadoColor === 'yellow' ? 'CONCEDIDO' : 'DENEGADO'
      });
      cargarAccesos();
    } catch {
      // Backend offline, el log local ya está resguardado
    }
  };

  const accesosFiltrados = accesos.filter((item) => {
    const texto = busqueda.toLowerCase().trim();
    const coincideTexto =
      !texto ||
      item.cliente_nombre?.toLowerCase().includes(texto) ||
      item.plan?.toLowerCase().includes(texto) ||
      item.uuid?.toLowerCase().includes(texto) ||
      String(item.id_cliente).includes(texto);

    if (!coincideTexto) return false;
    if (filtroResultado === 'permitido') return item.color === 'green';
    if (filtroResultado === 'atencion') return item.color === 'yellow';
    if (filtroResultado === 'denegado') return item.color === 'red';
    return true;
  });

  const totalHoy = accesos.length;
  const permitidosHoy = accesos.filter((a) => a.color === 'green').length;
  const atencionesHoy = accesos.filter((a) => a.color === 'yellow').length;
  const denegadosHoy = accesos.filter((a) => a.color === 'red').length;

  return {
    usuarioActivo,
    inputCodigo,
    setInputCodigo,
    inputRef,
    accesosFiltrados,
    busqueda,
    setBusqueda,
    filtroResultado,
    setFiltroResultado,
    alerta,
    setAlerta,
    sonidoHabilitado,
    setSonidoHabilitado,
    alertaFlash,
    setAlertaFlash,
    tiempoRestanteFlash,
    showSimuladorMovil,
    setShowSimuladorMovil,
    clienteSimulado,
    setClienteSimulado,
    qrJwtToken,
    tokenCountdown,
    tokenCargando,
    horaActual,
    obtenerListaClientes,
    pedirQrDinamico,
    procesarAcceso,
    totalHoy,
    permitidosHoy,
    atencionesHoy,
    denegadosHoy
  };
}
