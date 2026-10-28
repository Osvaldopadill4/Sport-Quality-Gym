import React, { useState, useEffect, useRef } from 'react';
import { 
  Key, 
  Search, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  X, 
  Volume2, 
  VolumeX,
  History,
  TrendingUp,
  User
} from 'lucide-react';
import '../../CSS/Acceso.css';
import { getAcceso, createAcceso, generarQrCliente, validarQrAcceso } from '../../JS/acceso';
import { getClientes } from '../../JS/cliente';
import Toast from '../Componentes/Toast';

// Clientes iniciales con distintos estados de membresía para pruebas inmediatas
const CLIENTES_DEMO = [
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
    dias_restantes: 3, // Menos de 5 días -> Alerta Amarilla
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
    dias_restantes: -4, // Vencido -> Alerta Roja
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
    estado: 0, // Dado de baja / inactivo -> Alerta Roja
    foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80',
    es_invitado: false
  }
];

export default function Acceso({ loggedUser }) {
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

  // Estado para la Alerta de Pantalla Completa (Flash de color)
  const [alertaFlash, setAlertaFlash] = useState(null); // { color: 'green'|'yellow'|'red', titulo, subtitulo, cliente, razon }
  const [tiempoRestanteFlash, setTiempoRestanteFlash] = useState(4);

  // Estado para clientes desde la Base de Datos MySQL
  const [clientesBD, setClientesBD] = useState([]);

  // Estado para el modal de la Credencial Móvil / Simulador QR dinámico
  const [showSimuladorMovil, setShowSimuladorMovil] = useState(false);
  const [clienteSimulado, setClienteSimulado] = useState(CLIENTES_DEMO[0]);
  const [qrJwtToken, setQrJwtToken] = useState('');
  const [tokenCountdown, setTokenCountdown] = useState(60);
  const [tokenCargando, setTokenCargando] = useState(false);

  // Reloj en tiempo real para la recepción
  const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString());

  const inputRef = useRef(null);

  // Mantener el reloj sincronizado
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mantener el foco en el input para lectores de códigos de barra / torniquetes
  useEffect(() => {
    if (!alertaFlash && !showSimuladorMovil && inputRef.current) {
      inputRef.current.focus();
    }
  }, [alertaFlash, showSimuladorMovil]);

  // Cargar clientes desde la Base de Datos MySQL
  useEffect(() => {
    getClientes().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setClientesBD(data);
      }
    }).catch(err => console.warn('Error al cargar clientes desde API:', err));
  }, []);

  // Obtener la base consolidada de clientes (Base de Datos MySQL + Clientes de demostración)
  const obtenerListaClientes = () => {
    const idsDemo = new Set(CLIENTES_DEMO.map(c => c.id));
    
    // Extras desde MySQL
    const extrasBD = (clientesBD || [])
      .filter(c => !idsDemo.has(c.id))
      .map(c => ({
        id: c.id,
        uuid: c.token_qr || `gym-uuid-cl-${c.id}`,
        nombre: c.nombre || 'Cliente Registrado',
        telefono: c.telefono || 'Sin teléfono',
        plan: 'Mensual',
        tipo_plan: 'Mensual',
        precio_plan: 350,
        dias_restantes: 30,
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estado: c.estado === 1 || c.estado === '1' || String(c.estado).toLowerCase() === 'activo' ? 1 : 0,
        foto: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.nombre || 'C')}`,
        es_invitado: false
      }));

    // Actualizar demos si coinciden con IDs en BD (ej. cliente id 1 en MySQL)
    const bdMap = new Map((clientesBD || []).map(c => [c.id, c]));
    const demosActualizados = CLIENTES_DEMO.map(demo => {
      if (bdMap.has(demo.id)) {
        const fromDb = bdMap.get(demo.id);
        return {
          ...demo,
          nombre: fromDb.nombre || demo.nombre,
          telefono: fromDb.telefono || demo.telefono,
          estado: fromDb.estado === '1' || fromDb.estado === 1 ? 1 : 0,
          uuid: fromDb.token_qr || demo.uuid
        };
      }
      return demo;
    });

    return [...demosActualizados, ...extrasBD];
  };

  // Cargar historial de accesos desde la Base de Datos MySQL
  const cargarAccesos = async () => {
    try {
      const data = await getAcceso();
      if (Array.isArray(data) && data.length > 0) {
        const clientesActuales = obtenerListaClientes();
        const mapa = new Map(clientesActuales.map(c => [Number(c.id), c]));

        const normalizados = data.map(item => {
          const cliente = mapa.get(Number(item.id_cliente));
          const esConcedido = item.resultado === 'CONCEDIDO' || item.resultado === 'Permitido';
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
            cliente_nombre: item.cliente_nombre || cliente?.nombre || `Socio #${item.id_cliente}`,
            plan: item.plan || cliente?.plan || 'Membresía General',
            fecha: item.fecha || new Date().toISOString().split('T')[0],
            hora: item.hora || '00:00:00',
            resultado: item.resultado === 'CONCEDIDO' ? 'Permitido' : item.resultado,
            color: colorBadge,
            dias_restantes: item.dias_restantes !== undefined ? item.dias_restantes : (cliente ? cliente.dias_restantes : 30),
            foto: item.foto || cliente?.foto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.cliente_nombre || 'S')}`
          };
        });

        setAccesos(normalizados);
        localStorage.setItem('gymton_accesos_log', JSON.stringify(normalizados));
        return;
      }
    } catch (err) {
      console.warn('Error al sincronizar historial con MySQL:', err);
    }

    // Fallback a registros locales o demo
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
  }, [clientesBD]);

  // Manejo del temporizador de la pantalla de destello (Flash)
  useEffect(() => {
    if (!alertaFlash) return;

    setTiempoRestanteFlash(4);
    const interval = setInterval(() => {
      setTiempoRestanteFlash(prev => {
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

  // Permitir cerrar la alerta flash con ESC o barra espaciadora
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (alertaFlash && (e.key === 'Escape' || e.key === ' ')) {
        setAlertaFlash(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alertaFlash]);

  // Solicitar token dinámico JWT a Spring Boot (60s TTL anti-fraude)
  const pedirQrDinamico = async (clienteId) => {
    setTokenCargando(true);
    try {
      const resp = await generarQrCliente(clienteId);
      if (resp && resp.token) {
        setQrJwtToken(resp.token);
        setTokenCountdown(60);
      } else {
        // Fallback si el cliente no está persistido o está inactivo
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

  // Efecto cuando se abre el simulador de móvil o cambia el socio seleccionado
  useEffect(() => {
    if (showSimuladorMovil && clienteSimulado) {
      pedirQrDinamico(clienteSimulado.id);
    }
  }, [showSimuladorMovil, clienteSimulado]);

  // Temporizador para la cuenta regresiva del token JWT (60 segundos)
  useEffect(() => {
    if (!showSimuladorMovil || !qrJwtToken) return;

    const interval = setInterval(() => {
      setTokenCountdown(prev => {
        if (prev <= 1) {
          // Regenerar automáticamente al expirar
          pedirQrDinamico(clienteSimulado.id);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showSimuladorMovil, qrJwtToken, clienteSimulado]);

  // Sonidos nativos del navegador con Web Audio API
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
        // Melodía de éxito / torniquete abierto (dos notas ascendentes)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.12); // G5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (tipo === 'yellow') {
        // Doble pitido de advertencia
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Zumbido grave de error / acceso denegado
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Ignorar si el navegador restringe la reproducción sin click previo
    }
  };

  // Procesar código escaneado o ingresado (JWT dinámico o código manual)
  const procesarAcceso = async (codigoParam) => {
    const rawCode = (codigoParam !== undefined ? codigoParam : inputCodigo).trim();
    if (!rawCode) return;

    setInputCodigo('');

    const ahora = new Date();
    const fechaHoy = ahora.toISOString().split('T')[0];
    const horaActualStr = ahora.toLocaleTimeString();

    // 1. Si es un token JWT o intento de validación por API con Spring Boot:
    const pareceJwt = rawCode.includes('.') || rawCode.startsWith('eyJ') || rawCode.length > 50;

    if (pareceJwt) {
      const respBackend = await validarQrAcceso(rawCode);
      if (respBackend) {
        if (respBackend.acceso) {
          // Acceso validado criptográficamente por Spring Boot y registrado en MySQL
          const lista = obtenerListaClientes();
          const socio = lista.find(c => Number(c.id) === Number(respBackend.clienteId)) || {
            id: respBackend.clienteId,
            nombre: respBackend.clienteNombre || 'Socio Registrado',
            plan: 'Mensual Activo',
            dias_restantes: 30,
            foto: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(respBackend.clienteNombre || 'S')}`
          };

          const esInvitado = socio.es_invitado || socio.plan?.toLowerCase().includes('invitado');
          const porVencer = socio.dias_restantes <= 5 && socio.dias_restantes >= 0;
          const colorFlash = (esInvitado || porVencer) ? 'yellow' : 'green';

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

          // Recargar historial desde MySQL
          cargarAccesos();
          return;
        } else {
          // Token expirado o alterado según Spring Boot
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

    // 2. Modo manual / UUID o ID de socio (recepcionista ingresa código o número de cliente)
    const listaCompleta = obtenerListaClientes();
    const codigoMinuscula = rawCode.toLowerCase();

    const clienteEncontrado = listaCompleta.find(c => 
      c.uuid?.toLowerCase() === codigoMinuscula ||
      String(c.id) === rawCode ||
      c.nombre?.toLowerCase().includes(codigoMinuscula)
    );

    if (!clienteEncontrado) {
      // CÓDIGO NO REGISTRADO O INVÁLIDO -> PANTALLA ROJA
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

    // Evaluar reglas de negocio solicitadas:
    // 1. Inactivo o días restantes <= 0 -> ROJO
    // 2. Es plan 'Invitado' o le quedan menos de 5 días -> AMARILLO
    // 3. Activo y más de 5 días -> VERDE

    const esInactivo = clienteEncontrado.estado === 0 || clienteEncontrado.estado === 'Inactivo';
    const esVencido = clienteEncontrado.dias_restantes < 0;
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

    // Activar pantalla completa
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
      fecha: fechaHoy,
      hora: horaActualStr,
      resultado: resultadoBadge,
      color: resultadoColor,
      dias_restantes: clienteEncontrado.dias_restantes,
      foto: clienteEncontrado.foto
    };

    const listaActualizada = [nuevoRegistro, ...accesos];
    setAccesos(listaActualizada);
    localStorage.setItem('gymton_accesos_log', JSON.stringify(listaActualizada));

    // Registrar en base de datos MySQL
    try {
      await createAcceso({
        id_cliente: clienteEncontrado.id,
        fecha: fechaHoy,
        hora: horaActualStr.slice(0, 8),
        resultado: resultadoColor === 'green' || resultadoColor === 'yellow' ? 'CONCEDIDO' : 'DENEGADO'
      });
      cargarAccesos();
    } catch {
      // Backend offline, el log local ya está resguardado
    }
  };

  // Filtrado en tiempo real con useState y .filter()
  const accesosFiltrados = accesos.filter(item => {
    const texto = busqueda.toLowerCase().trim();
    const coincideTexto = !texto || 
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

  // Métricas para los cuadros de resumen
  const totalHoy = accesos.length;
  const permitidosHoy = accesos.filter(a => a.color === 'green').length;
  const atencionesHoy = accesos.filter(a => a.color === 'yellow').length;
  const denegadosHoy = accesos.filter(a => a.color === 'red').length;

  return (
    <div className="acceso-module-wrapper">
      {/* Toast para notificaciones pequeñas */}
      {alerta && (
        <Toast 
          mensaje={alerta.mensaje} 
          tipo={alerta.tipo} 
          onClose={() => setAlerta(null)} 
        />
      )}

      {/* ALERTA DE PANTALLA COMPLETA (DESTELLO / FLASH VISUAL)     */}
      {alertaFlash && (
        <div 
          className={`acceso-flash-overlay flash-${alertaFlash.color}`}
          onClick={() => setAlertaFlash(null)}
        >
          {/* Barra de progreso de auto-cierre */}
          <div className="flash-progress-bar">
            <div 
              className="flash-progress-fill"
              style={{ width: `${(tiempoRestanteFlash / 4) * 100}%` }}
            />
          </div>

          <div 
            className="flash-content-card"
            onClick={e => e.stopPropagation()}
          >
            {/* Botón flotante para cerrar */}
            <button 
              className="flash-close-btn"
              onClick={() => setAlertaFlash(null)}
              title="Cerrar pantalla de acceso (Esc o Espacio)"
            >
              <X size={28} />
            </button>

            {/* Encabezado del Destello */}
            <div className="flash-header-badge">
              {alertaFlash.color === 'green' && <CheckCircle2 size={54} className="flash-icon-pulse" />}
              {alertaFlash.color === 'yellow' && <AlertTriangle size={54} className="flash-icon-pulse" />}
              {alertaFlash.color === 'red' && <XCircle size={54} className="flash-icon-pulse flash-icon-shake" />}
              
              <div>
                <h1 className="flash-title">{alertaFlash.titulo}</h1>
                <p className="flash-subtitle">{alertaFlash.subtitulo}</p>
              </div>
            </div>

            {/* Tarjeta del Socio con Foto */}
            <div className="flash-body-grid">
              <div className="flash-avatar-box">
                {alertaFlash.cliente?.foto ? (
                  <img 
                    src={alertaFlash.cliente.foto} 
                    alt={alertaFlash.cliente.nombre} 
                    className="flash-avatar-img"
                  />
                ) : (
                  <div className="flash-avatar-fallback">
                    <User size={80} />
                  </div>
                )}
                <div className={`flash-avatar-status-ring ring-${alertaFlash.color}`} />
              </div>

              <div className="flash-details">
                <span className="flash-socio-tag">Socio #{alertaFlash.cliente?.id || '---'}</span>
                <h2 className="flash-socio-name">{alertaFlash.cliente?.nombre || 'Desconocido'}</h2>
                
                <div className="flash-meta-grid">
                  <div className="flash-meta-item">
                    <span className="meta-label">Plan / Membresía:</span>
                    <span className="meta-val font-extrabold">{alertaFlash.cliente?.plan || 'Ninguno'}</span>
                  </div>
                  
                  <div className="flash-meta-item">
                    <span className="meta-label">Días Restantes:</span>
                    <span className={`meta-val ${alertaFlash.cliente?.dias_restantes < 0 ? 'text-red-400' : 'text-emerald-300'}`}>
                      {alertaFlash.cliente?.dias_restantes !== undefined
                        ? `${alertaFlash.cliente.dias_restantes} días`
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="flash-meta-item">
                    <span className="meta-label">Fecha y Hora:</span>
                    <span className="meta-val">{new Date().toLocaleDateString()} - {horaActual}</span>
                  </div>

                  <div className="flash-meta-item">
                    <span className="meta-label">Torniquete:</span>
                    <span className="meta-val">
                      {alertaFlash.color === 'red' ? '⛔ BLOQUEADO' : '🟢 DESBLOQUEADO (1 PASE)'}
                    </span>
                  </div>
                </div>

                <div className={`flash-reason-box reason-${alertaFlash.color}`}>
                  <p>{alertaFlash.razon}</p>
                </div>
              </div>
            </div>

            {/* Pie con temporizador y atajos */}
            <div className="flash-footer">
              <span className="flash-countdown-tag">
                <Clock size={16} /> Auto-cierre en {tiempoRestanteFlash}s
              </span>
              <span className="flash-dismiss-hint">
                Presiona <strong>[ESC]</strong> o <strong>[ESPACIO]</strong> para continuar
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SIMULADOR DE CELULAR / CREDENCIAL DIGITAL QR       */}
      {/* ========================================================= */}
      {showSimuladorMovil && (
        <div className="modal-backdrop-custom">
          <div className="phone-simulator-wrapper">
            <button 
              className="phone-modal-close" 
              onClick={() => setShowSimuladorMovil(false)}
            >
              <X size={22} />
            </button>

            {/* Chasis de Celular */}
            <div className="phone-device">
              {/* Bocina / Cámara del teléfono */}
              <div className="phone-notch">
                <div className="phone-speaker" />
                <div className="phone-camera" />
              </div>

              {/* Pantalla del Teléfono */}
              <div className="phone-screen">
                <div className="phone-app-header">
                  <div className="phone-gym-brand">
                    <span>⚡ GYMTON APP</span>
                    <span className="text-xs text-zinc-400">Pase Digital</span>
                  </div>
                  <span className="phone-clock">{horaActual.slice(0, 5)}</span>
                </div>

                {/* Selector rápido de socio en el simulador */}
                <div className="phone-selector-box">
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">
                    Seleccionar Socio en el Celular:
                  </label>
                  <select 
                    className="phone-select"
                    value={clienteSimulado.id}
                    onChange={(e) => {
                      const sel = obtenerListaClientes().find(c => c.id === parseInt(e.target.value));
                      if (sel) setClienteSimulado(sel);
                    }}
                  >
                    {obtenerListaClientes().map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.plan} - {c.dias_restantes < 0 ? 'Vencido' : `${c.dias_restantes}d`})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Credencial Digital dentro del celular */}
                <div className="phone-credential-card">
                  <div className="phone-card-top">
                    <img 
                      src={clienteSimulado.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'} 
                      alt="Socio" 
                      className="phone-user-avatar"
                    />
                    <div>
                      <h4 className="phone-user-name">{clienteSimulado.nombre}</h4>
                      <span className="phone-plan-badge">{clienteSimulado.plan}</span>
                    </div>
                  </div>

                  {/* Código QR Generado Dinámico JWT / Anti-fraude */}
                  <div className="phone-qr-frame">
                    <div className="qr-svg-container relative flex items-center justify-center p-2 bg-white rounded-xl shadow-md min-h-[160px]">
                      {qrJwtToken ? (
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrJwtToken)}&size=150x150&margin=2`}
                          alt="QR Dinámico"
                          className="w-36 h-36 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <QrCode size={130} className="text-zinc-900" />
                      )}
                    </div>
                    
                    {/* Cuenta regresiva de expiración de 60 segundos */}
                    <div className="flex items-center justify-between w-full mt-2 px-1 text-xs">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono">
                        <Clock size={13} />
                        Expira en: {tokenCountdown}s
                      </span>
                      <button 
                        onClick={() => pedirQrDinamico(clienteSimulado.id)}
                        title="Regenerar Token QR"
                        type="button"
                        className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw size={12} className={tokenCargando ? 'animate-spin text-emerald-400' : ''} />
                        Renovar
                      </button>
                    </div>

                    <div className="qr-token-label">
                      <span>TOKEN SEGURO JWT (ANTI-CAPTURA):</span>
                      <code className="text-[10px] break-all block truncate max-w-full font-mono text-emerald-300">
                        {qrJwtToken ? `${qrJwtToken.slice(0, 22)}...${qrJwtToken.slice(-10)}` : clienteSimulado.uuid}
                      </code>
                    </div>
                  </div>

                  <div className="phone-vigencia-info">
                    <div className="flex justify-between text-xs text-zinc-300">
                      <span>Vigencia:</span>
                      <strong>{clienteSimulado.fecha_vencimiento}</strong>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-zinc-400">Estado:</span>
                      <strong className={
                        clienteSimulado.estado === 0 || clienteEncontradoVencido(clienteSimulado)
                          ? 'text-red-400'
                          : clienteSimulado.dias_restantes <= 5 || clienteSimulado.es_invitado
                          ? 'text-amber-300'
                          : 'text-emerald-400'
                      }>
                        {clienteSimulado.estado === 0 
                          ? 'Suspendido' 
                          : clienteSimulado.dias_restantes < 0 
                          ? 'Vencida' 
                          : clienteSimulado.es_invitado
                          ? 'Invitado (1 Día)'
                          : `${clienteSimulado.dias_restantes} días restantes`}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Botón para Simular el Escaneo en el Torniquete */}
                <button 
                  className="btn-phone-scan"
                  onClick={() => {
                    setShowSimuladorMovil(false);
                    procesarAcceso(qrJwtToken || clienteSimulado.uuid);
                  }}
                >
                  <Key size={18} />
                  Simular Escaneo en Torniquete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA PRINCIPAL: TERMINAL DE RECEPCIÓN Y TORNIQUETE        */}
      {/* ========================================================= */}

      {/* Encabezado y Estado de la Terminal */}
      <div className="acceso-hero-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Key size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center gap-3">
                  Control de Acceso y Torniquetes
                </h1>
                <p className="text-sm text-zinc-400 mt-1">
                  Recepción automatizada con validación por token QR / UUID y destello visual.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Indicador de Torniquete En Línea */}
            <div className="status-radar-pill">
              <span className="status-radar-dot" />
              <span className="text-xs font-bold text-emerald-400">Torniquete #1 En Línea</span>
            </div>

            {/* Reloj Digital */}
            <div className="status-clock-pill">
              <Clock size={16} className="text-zinc-400" />
              <span className="text-sm font-mono font-bold text-white">{horaActual}</span>
            </div>

            {/* Operador en Recepción */}
            {usuarioActivo && (
              <div className="status-clock-pill hidden sm:flex">
                <User size={15} className="text-emerald-400" />
                <span className="text-xs text-zinc-300 font-medium">Recepción: {usuarioActivo.nombre || usuarioActivo.usuario}</span>
              </div>
            )}

            {/* Botón Mute Sonido */}
            <button 
              className={`p-2.5 rounded-xl border transition-all ${sonidoHabilitado ? 'bg-zinc-800 border-zinc-700 text-emerald-400 hover:bg-zinc-700' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
              onClick={() => setSonidoHabilitado(!sonidoHabilitado)}
              title={sonidoHabilitado ? 'Sonido activado' : 'Sonido silenciado'}
            >
              {sonidoHabilitado ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {/* Abrir Credencial / Simulador Móvil */}
            <button 
              className="btn-abrir-simulador"
              onClick={() => setShowSimuladorMovil(true)}
            >
              <Smartphone size={18} />
              <span>Celular / QR Socio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Superior: Escáner de Entrada + Pruebas Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        
        {/* Terminal de Escaneo (Izquierda - 7 columnas) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="scanner-glow-bar" />
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <QrCode size={16} /> Lector Óptico / Entrada QR
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Auto-focus activo
            </span>
          </div>

          <p className="text-zinc-300 text-sm mb-4">
            Pase el código QR del celular del socio frente al lector, o ingrese manualmente su UUID / ID de socio:
          </p>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              procesarAcceso();
            }}
            className="relative"
          >
            <div className="scanner-input-container">
              <input 
                ref={inputRef}
                type="text"
                className="scanner-main-input"
                placeholder="Escanee QR o escriba UUID / ID..."
                value={inputCodigo}
                onChange={(e) => setInputCodigo(e.target.value)}
                autoFocus
              />
              <button 
                type="submit" 
                className="scanner-submit-btn"
                title="Validar Acceso"
              >
                <span>Validar</span>
                <Key size={18} />
              </button>
            </div>
          </form>

          {/* Atajos de prueba rápida con 1 solo clic para verificar los 3 colores solicitados */}
          <div className="mt-5 pt-4 border-t border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
              Pruebas Rápidas de Torniquete (1 Clic):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                className="quick-test-btn test-green"
                onClick={() => procesarAcceso(CLIENTES_DEMO[0].uuid)}
                title="Socio Juan Pérez - Membresía Mensual Vigente"
              >
                <div className="quick-dot dot-green" />
                <div className="text-left">
                  <span className="quick-title">Activo (&gt;5d)</span>
                  <span className="quick-sub">Destello Verde</span>
                </div>
              </button>

              <button 
                className="quick-test-btn test-yellow"
                onClick={() => procesarAcceso(CLIENTES_DEMO[2].uuid)}
                title="Socio Diego Martínez - Pase de Invitado 1 Día"
              >
                <div className="quick-dot dot-yellow" />
                <div className="text-left">
                  <span className="quick-title">Invitado (1d)</span>
                  <span className="quick-sub">Destello Amarillo</span>
                </div>
              </button>

              <button 
                className="quick-test-btn test-yellow"
                onClick={() => procesarAcceso(CLIENTES_DEMO[3].uuid)}
                title="Socia Sofía Mendoza - Le quedan 3 días"
              >
                <div className="quick-dot dot-yellow" />
                <div className="text-left">
                  <span className="quick-title">Por Vencer (&lt;5d)</span>
                  <span className="quick-sub">Destello Amarillo</span>
                </div>
              </button>

              <button 
                className="quick-test-btn test-red"
                onClick={() => procesarAcceso(CLIENTES_DEMO[4].uuid)}
                title="Socio Roberto Sánchez - Vencida hace 4 días"
              >
                <div className="quick-dot dot-red" />
                <div className="text-left">
                  <span className="quick-title">Vencido / Inactivo</span>
                  <span className="quick-sub">Destello Rojo</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tarjetas de Estadísticas de Hoy (Derecha - 5 columnas) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="acceso-stat-card border-zinc-800 bg-zinc-900">
            <div className="stat-icon-wrapper bg-blue-500/10 text-blue-400">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="stat-label">Total Accesos Hoy</span>
              <h3 className="stat-number text-white">{totalHoy}</h3>
              <span className="stat-hint text-zinc-400">Entradas al gym</span>
            </div>
          </div>

          <div className="acceso-stat-card border-emerald-900/50 bg-emerald-950/20">
            <div className="stat-icon-wrapper bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="stat-label">Permitidos (Verde)</span>
              <h3 className="stat-number text-emerald-400">{permitidosHoy}</h3>
              <span className="stat-hint text-emerald-500/80">Membresía activa</span>
            </div>
          </div>

          <div className="acceso-stat-card border-amber-900/50 bg-amber-950/20">
            <div className="stat-icon-wrapper bg-amber-500/10 text-amber-400">
              <AlertTriangle size={22} />
            </div>
            <div>
              <span className="stat-label">Atención (Amarillo)</span>
              <h3 className="stat-number text-amber-400">{atencionesHoy}</h3>
              <span className="stat-hint text-amber-500/80">&lt; 5 días o Invitado</span>
            </div>
          </div>

          <div className="acceso-stat-card border-red-900/50 bg-red-950/20">
            <div className="stat-icon-wrapper bg-red-500/10 text-red-400">
              <XCircle size={22} />
            </div>
            <div>
              <span className="stat-label">Denegados (Rojo)</span>
              <h3 className="stat-number text-red-400">{denegadosHoy}</h3>
              <span className="stat-hint text-red-500/80">Vencidos o inválidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORIAL DE ACCESOS CON BUSCADOR EN TIEMPO REAL          */}
      <div className="acceso-log-section">
        {/* Barra de Filtros y Buscador */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <History size={20} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              Historial de Accesos Registrados
            </h3>
            <span className="text-xs bg-zinc-800 text-zinc-300 font-bold px-2 py-0.5 rounded-full border border-zinc-700">
              {accesosFiltrados.length}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Buscador en tiempo real con useState y .filter() */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text"
                placeholder="Buscar por socio, plan o UUID..."
                className="busqueda-acceso-input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  onClick={() => setBusqueda('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtros rápidos por resultado */}
            <div className="btn-group-filtros">
              <button 
                className={`filtro-pill ${filtroResultado === 'todos' ? 'active' : ''}`}
                onClick={() => setFiltroResultado('todos')}
              >
                Todos
              </button>
              <button 
                className={`filtro-pill ${filtroResultado === 'permitido' ? 'active-green' : ''}`}
                onClick={() => setFiltroResultado('permitido')}
              >
                Permitidos
              </button>
              <button 
                className={`filtro-pill ${filtroResultado === 'atencion' ? 'active-yellow' : ''}`}
                onClick={() => setFiltroResultado('atencion')}
              >
                Advertencias
              </button>
              <button 
                className={`filtro-pill ${filtroResultado === 'denegado' ? 'active-red' : ''}`}
                onClick={() => setFiltroResultado('denegado')}
              >
                Denegados
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Registros */}
        <div className="acceso-table-card">
          <div className="overflow-x-auto">
            <table className="acceso-modern-table">
              <thead>
                <tr>
                  <th>Socio / Fotografía</th>
                  <th>Membresía / Plan</th>
                  <th>Fecha y Hora</th>
                  <th>Días Restantes</th>
                  <th>Estado del Torniquete</th>
                  <th className="text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {accesosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-zinc-400">
                      No se encontraron registros de acceso con los criterios de búsqueda.
                    </td>
                  </tr>
                ) : (
                  accesosFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      {/* Socio */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {item.foto ? (
                              <img 
                                src={item.foto} 
                                alt={item.cliente_nombre} 
                                className="w-10 h-10 rounded-full object-cover border border-zinc-700" 
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold">
                                {item.cliente_nombre?.charAt(0) || '?'}
                              </div>
                            )}
                            <span className={`table-status-dot dot-${item.color}`} />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">
                              {item.cliente_nombre}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono">
                              {item.uuid ? item.uuid.slice(0, 16) + '...' : `ID #${item.id_cliente}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td>
                        <span className="text-sm font-semibold text-zinc-300">
                          {item.plan}
                        </span>
                      </td>

                      {/* Fecha y Hora */}
                      <td>
                        <div className="text-xs">
                          <span className="text-zinc-300 font-medium block">{item.fecha}</span>
                          <span className="text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                            <Clock size={12} /> {item.hora}
                          </span>
                        </div>
                      </td>

                      {/* Días Restantes */}
                      <td>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          item.dias_restantes < 0
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : item.dias_restantes <= 5
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {item.dias_restantes !== undefined
                            ? item.dias_restantes < 0
                              ? `Vencido (${Math.abs(item.dias_restantes)}d)`
                              : `${item.dias_restantes} días`
                            : 'N/A'}
                        </span>
                      </td>

                      {/* Resultado / Torniquete */}
                      <td>
                        <span className={`badge-resultado badge-${item.color}`}>
                          {item.color === 'green' && <CheckCircle2 size={13} />}
                          {item.color === 'yellow' && <AlertTriangle size={13} />}
                          {item.color === 'red' && <XCircle size={13} />}
                          <span>{item.resultado}</span>
                        </span>
                      </td>

                      {/* Acción Re-test */}
                      <td className="text-right">
                        <button 
                          className="btn-retest"
                          onClick={() => procesarAcceso(item.uuid || String(item.id_cliente))}
                          title="Simular reingreso de este socio"
                        >
                          <RefreshCw size={14} />
                          <span>Simular</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Función auxiliar para saber si un cliente está vencido
function clienteEncontradoVencido(c) {
  return c.dias_restantes < 0;
}
