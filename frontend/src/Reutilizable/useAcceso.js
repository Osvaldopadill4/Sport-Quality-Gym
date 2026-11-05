import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getAcceso,
  createAcceso,
  generarQrCliente,
  validarQrAccesoConProcedure,
  validarQrAcceso
} from '../JS/acceso';
import { getClientes } from '../JS/cliente';
import { getReporteAccesos, getReporteEstadoMembresias } from '../JS/reportes_api';
import { sp_registrar_acceso } from './objetosSQL';

export function useAcceso(paramUser) {
  const usuarioActivo = (paramUser && paramUser.loggedUser) || paramUser || (() => {
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
  const [estadoMembresiasBD, setEstadoMembresiasBD] = useState([]);

  const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString());
  const inputRef = useRef(null);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mantener foco en el input para la pistola lectora QR USB
  useEffect(() => {
    if (!alertaFlash && inputRef.current) {
      inputRef.current.focus();
    }
  }, [alertaFlash]);

  // Cargar clientes y estado de membresías desde las vistas de MySQL
  useEffect(() => {
    Promise.allSettled([getClientes(), getReporteEstadoMembresias()]).then(([resCli, resMem]) => {
      if (resCli.status === 'fulfilled' && Array.isArray(resCli.value)) {
        setClientesBD(resCli.value);
      }
      if (resMem.status === 'fulfilled' && Array.isArray(resMem.value)) {
        setEstadoMembresiasBD(resMem.value);
      }
    });
  }, []);

  // Normaliza lista de socios combinada con vista `vw_estado_membresias`
  const obtenerListaClientes = useCallback(() => {
    const mapMemb = new Map(
      (estadoMembresiasBD || []).map((m) => [Number(m.id_cliente), m])
    );

    return (clientesBD || []).map((c) => {
      const infoM = mapMemb.get(Number(c.id));
      const dias = infoM?.dias_restantes !== undefined ? Number(infoM.dias_restantes) : 30;
      const planNombre = infoM?.plan || 'Membresía General';
      const esInvitado = String(planNombre).toLowerCase().includes('invitado');

      return {
        id: c.id,
        uuid: c.token_qr || `gym-uuid-cl-${c.id}`,
        nombre: c.nombre || 'Socio Registrado',
        telefono: c.telefono || 'Sin teléfono',
        plan: planNombre,
        dias_restantes: dias,
        fecha_vencimiento: infoM?.fecha_vencimiento || '',
        estado: c.estado === 1 || c.estado === '1' || String(c.estado).toLowerCase() === 'activo' ? 1 : 0,
        es_invitado: esInvitado
      };
    });
  }, [clientesBD, estadoMembresiasBD]);

  // Cargar historial de accesos consumiendo la vista `vw_historial_accesos` de MySQL
  const cargarAccesos = useCallback(async () => {
    try {
      // 1. Intentar cargar directamente desde la vista SQL del backend
      const dataVista = await getReporteAccesos();
      const socios = obtenerListaClientes();
      const mapSocios = new Map(socios.map((s) => [Number(s.id), s]));

      if (Array.isArray(dataVista) && dataVista.length > 0) {
        const formateados = dataVista.map((row) => {
          const socio = mapSocios.get(Number(row.id_cliente));
          const esConcedido = ['PERMITIDO', 'CONCEDIDO', 'Permitido'].includes(row.resultado);
          const dias = socio?.dias_restantes !== undefined ? socio.dias_restantes : 30;
          const esInvitado = socio?.es_invitado;
          const porVencer = dias <= 5 && dias >= 0;

          let color = 'green';
          if (!esConcedido) {
            color = 'red';
          } else if (esInvitado || porVencer) {
            color = 'yellow';
          }

          return {
            id: row.id_acceso || row.id || Date.now() + Math.random(),
            id_cliente: row.id_cliente,
            uuid: socio?.uuid || `SOCIO-${row.id_cliente}`,
            cliente_nombre: row.cliente || socio?.nombre || `Socio #${row.id_cliente}`,
            plan: socio?.plan || 'Membresía General',
            fecha: row.fecha || new Date().toISOString().split('T')[0],
            hora: row.hora || '00:00:00',
            resultado: esConcedido ? 'Permitido' : (row.resultado || 'Rechazado'),
            color,
            dias_restantes: dias
          };
        });

        setAccesos(formateados);
        localStorage.setItem('gymton_accesos_log', JSON.stringify(formateados));
        return;
      }

      // 2. Fallback a endpoint estándar /api/acceso/historial
      const fallbackData = await getAcceso();
      if (Array.isArray(fallbackData) && fallbackData.length > 0) {
        const formateados = fallbackData.map((row) => {
          const socio = mapSocios.get(Number(row.id_cliente));
          const esConcedido = ['PERMITIDO', 'CONCEDIDO', 'Permitido'].includes(row.resultado);
          return {
            id: row.id || Date.now() + Math.random(),
            id_cliente: row.id_cliente,
            uuid: socio?.uuid || `SOCIO-${row.id_cliente}`,
            cliente_nombre: socio?.nombre || `Socio #${row.id_cliente}`,
            plan: socio?.plan || 'Membresía General',
            fecha: row.fecha,
            hora: row.hora,
            resultado: esConcedido ? 'Permitido' : 'Rechazado',
            color: esConcedido ? 'green' : 'red',
            dias_restantes: socio?.dias_restantes ?? 30
          };
        });
        setAccesos(formateados);
        localStorage.setItem('gymton_accesos_log', JSON.stringify(formateados));
        return;
      }
    } catch (err) {
      console.warn('Error al sincronizar accesos con backend:', err);
    }

    // Fallback offline a LocalStorage
    const local = localStorage.getItem('gymton_accesos_log');
    if (local) {
      try {
        setAccesos(JSON.parse(local));
      } catch (e) {
        console.error(e);
      }
    }
  }, [obtenerListaClientes]);

  useEffect(() => {
    cargarAccesos();
  }, [cargarAccesos]);

  // Alerta flash temporizada
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

  // Descartar flash con Tecla Escape o Espacio
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (alertaFlash && (e.key === 'Escape' || e.key === ' ')) {
        setAlertaFlash(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alertaFlash]);

  // Sintetizador Web Audio API para señales del torniquete
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
      // Ignorar si el navegador bloquea audio sin interacción
    }
  };

  // Procesar escaneo QR o entrada manual de socio
  const procesarAcceso = async (codigoParam) => {
    const rawCode = (codigoParam !== undefined ? codigoParam : inputCodigo).trim();
    if (!rawCode) return;
    setInputCodigo('');

    const ahora = new Date();
    const fechaHoy = ahora.toISOString().split('T')[0];
    const horaStr = ahora.toLocaleTimeString();
    const pareceJwt = rawCode.includes('.') || rawCode.startsWith('eyJ') || rawCode.length > 50;

    // 1. VALIDACIÓN QR CON PROCEDURE ALMACENADO EN MYSQL (`sp_registrar_acceso`)
    if (pareceJwt) {
      const resp = await validarQrAccesoConProcedure(rawCode) || await validarQrAcceso(rawCode);

      if (resp) {
        if (resp.acceso) {
          const socios = obtenerListaClientes();
          const socio = socios.find((s) => Number(s.id) === Number(resp.clienteId)) || {
            id: resp.clienteId,
            uuid: rawCode,
            nombre: resp.clienteNombre || 'Socio Registrado',
            plan: 'Membresía Activa',
            dias_restantes: 30
          };

          const esInvitado = socio.es_invitado;
          const porVencer = socio.dias_restantes <= 5 && socio.dias_restantes >= 0;
          const colorFlash = esInvitado || porVencer ? 'yellow' : 'green';

          emitirSonido(colorFlash);
          setAlertaFlash({
            color: colorFlash,
            titulo: colorFlash === 'yellow' ? '¡ATENCIÓN! ACCESO CON PRECAUCIÓN' : '¡CORRECTO! ACCESO PERMITIDO',
            subtitulo: colorFlash === 'yellow'
              ? (esInvitado ? 'Pase de Invitado (1 Día)' : `Le quedan ${socio.dias_restantes} días`)
              : 'Torniquete Automático Desbloqueado',
            razon: `Validado por procedimiento MySQL. Hora: ${resp.horaEntrada || horaStr}`,
            cliente: socio
          });

          await cargarAccesos();
          return;
        } else {
          // Acceso Denegado por procedimiento o token expirado
          emitirSonido('red');
          setAlertaFlash({
            color: 'red',
            titulo: '¡ACCESO DENEGADO!',
            subtitulo: resp.resultado === 'Rechazado' ? 'Membresía Inactiva o Vencida' : 'Token QR Inválido',
            razon: resp.mensaje || 'Firma digital expirada o membresía sin vigencia.',
            cliente: { nombre: resp.clienteNombre || 'Acceso No Autorizado', plan: 'Sin Vigencia', dias_restantes: 0 }
          });

          await cargarAccesos();
          return;
        }
      }
    }

    // 2. VALIDACIÓN MANUAL / POR TECLADO
    const socios = obtenerListaClientes();
    const busq = rawCode.toLowerCase();
    const clienteEncontrado = socios.find(
      (c) =>
        String(c.id) === rawCode ||
        c.uuid?.toLowerCase() === busq ||
        c.nombre?.toLowerCase().includes(busq)
    );

    if (!clienteEncontrado) {
      emitirSonido('red');
      setAlertaFlash({
        color: 'red',
        titulo: '¡ACCESO DENEGADO!',
        subtitulo: 'Socio no encontrado',
        razon: `El código "${rawCode}" no coincide con ningún registro activo.`,
        cliente: { nombre: 'Desconocido', plan: 'Ninguno', dias_restantes: 0 }
      });
      return;
    }

    // Intentar ejecutar el procedimiento del servidor generando un QR temporal para el cliente
    try {
      const qrData = await generarQrCliente(clienteEncontrado.id);
      if (qrData && qrData.token) {
        const respProc = await validarQrAccesoConProcedure(qrData.token);
        if (respProc && respProc.acceso) {
          emitirSonido('green');
          setAlertaFlash({
            color: 'green',
            titulo: '¡CORRECTO! ACCESO PERMITIDO',
            subtitulo: 'Torniquete Automático Desbloqueado',
            razon: `Validado en MySQL para ${clienteEncontrado.nombre}.`,
            cliente: clienteEncontrado
          });
          await cargarAccesos();
          return;
        }
      }
    } catch {
      // Continuar con fallback offline si no responde el backend
    }

    // Fallback Offline usando el procedimiento simulado `sp_registrar_acceso`
    const spLocal = sp_registrar_acceso(clienteEncontrado.id, estadoMembresiasBD);
    const esPermitido = spLocal.resultado === 'PERMITIDO';
    const esInvitado = clienteEncontrado.es_invitado;
    const porVencer = clienteEncontrado.dias_restantes <= 5 && clienteEncontrado.dias_restantes >= 0;

    let color = esPermitido ? (esInvitado || porVencer ? 'yellow' : 'green') : 'red';
    emitirSonido(color);

    setAlertaFlash({
      color,
      titulo: color === 'green' ? '¡CORRECTO! ACCESO PERMITIDO' : color === 'yellow' ? '¡ATENCIÓN! ACCESO CON PRECAUCIÓN' : '¡ACCESO DENEGADO!',
      subtitulo: color === 'green' ? 'Torniquete Desbloqueado' : color === 'yellow' ? `Restan ${clienteEncontrado.dias_restantes} días` : 'Membresía Vencida o Inactiva',
      razon: color === 'red' ? 'Acudir a recepción a renovar membresía.' : 'Acceso registrado localmente.',
      cliente: clienteEncontrado
    });

    const logLocal = {
      id: Date.now(),
      id_cliente: clienteEncontrado.id,
      uuid: clienteEncontrado.uuid,
      cliente_nombre: clienteEncontrado.nombre,
      plan: clienteEncontrado.plan,
      fecha: fechaHoy,
      hora: horaStr,
      resultado: esPermitido ? 'Permitido' : 'Rechazado',
      color,
      dias_restantes: clienteEncontrado.dias_restantes
    };

    const nuevosLogs = [logLocal, ...accesos];
    setAccesos(nuevosLogs);
    localStorage.setItem('gymton_accesos_log', JSON.stringify(nuevosLogs));

    createAcceso({
      id_cliente: clienteEncontrado.id,
      fecha: fechaHoy,
      hora: horaStr,
      resultado: esPermitido ? 'CONCEDIDO' : 'DENEGADO'
    }).catch(() => {});
  };

  // Filtrado de accesos para la tabla
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
    horaActual,
    obtenerListaClientes,
    procesarAcceso,
    totalHoy,
    permitidosHoy,
    atencionesHoy,
    denegadosHoy
  };
}
