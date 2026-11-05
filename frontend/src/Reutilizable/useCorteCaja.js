import { useState, useEffect, useCallback } from 'react';
import { getCorteCaja, getCorteActivo, abrirCorteCaja, cerrarCorteCaja } from '../JS/corte_caja';
import { getUsuarios } from '../JS/usuarios';
import { getVenta } from '../JS/venta';
import { getCompras } from '../JS/compra';
import { sp_corte_caja_diario } from './objetosSQL';

/**
 * Hook Reutilizable `useCorteCaja`:
 * Centraliza el control de apertura/cierre de caja, calculadora de billetes (arqueo)
 * e integra el procedimiento SQL `sp_corte_caja_diario`.
 */
export function useCorteCaja({ loggedUser }) {
  const usuarioActivo = loggedUser || (() => {
    try {
      const u = localStorage.getItem('gymton_current_user');
      return u ? JSON.parse(u) : { id: 1, nombre: 'Cajero / Administrador' };
    } catch {
      return { id: 1, nombre: 'Cajero / Administrador' };
    }
  })();

  const nombreCajeroActivo = usuarioActivo
    ? `${usuarioActivo.nombre || ''} ${usuarioActivo.apellido || ''}`.trim() || 'Cajero en Turno'
    : 'Cajero en Turno';

  const [cortes, setCortes] = useState([]);
  const [usuariosCatalogo, setUsuariosCatalogo] = useState([]);
  const [ventasBD, setVentasBD] = useState([]);
  const [comprasBD, setComprasBD] = useState([]);
  const [corteActivo, setCorteActivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const [showModalApertura, setShowModalApertura] = useState(false);
  const [showModalCierre, setShowModalCierre] = useState(false);
  const [ticketCorte, setTicketCorte] = useState(null);

  const [formApertura, setFormApertura] = useState({
    id_usuario: usuarioActivo?.id || 1,
    monto_inicial: 500,
    observaciones: 'Fondo inicial fijo de $500.00 MXN para cambio en caja'
  });

  const [formCierre, setFormCierre] = useState({
    monto_real: 0,
    observaciones: ''
  });

  const [desgloseBilletes, setDesgloseBilletes] = useState({
    b1000: 0,
    b500: 0,
    b200: 0,
    b100: 0,
    b50: 0,
    b20: 0,
    monedas: 0
  });

  const obtenerNombreCajero = useCallback((c) => {
    if (!c) return nombreCajeroActivo;
    if (c.cajero_nombre && !String(c.cajero_nombre).startsWith('Usuario #')) {
      return c.cajero_nombre;
    }
    const uEncontrado = usuariosCatalogo.find(u => Number(u.id) === Number(c.id_usuario));
    if (uEncontrado && uEncontrado.nombre) {
      return `${uEncontrado.nombre} ${uEncontrado.apellido || ''}`.trim();
    }
    if (usuarioActivo && (Number(usuarioActivo.id) === Number(c.id_usuario) || !c.id_usuario)) {
      return nombreCajeroActivo;
    }
    if (Number(c.id_usuario) === 1 && nombreCajeroActivo) {
      return nombreCajeroActivo;
    }
    return nombreCajeroActivo || `Usuario #${c.id_usuario}`;
  }, [usuariosCatalogo, usuarioActivo, nombreCajeroActivo]);

  // Calcular ventas y gastos del turno consultando datos de MySQL
  const obtenerVentasTurno = useCallback(() => {
    try {
      const fuenteVentas = ventasBD.length > 0
        ? ventasBD
        : JSON.parse(localStorage.getItem('gymton_ventas') || '[]');
      const fuenteCompras = comprasBD.length > 0
        ? comprasBD
        : JSON.parse(localStorage.getItem('gymton_compras') || '[]');

      const hoyStr = new Date().toISOString().split('T')[0];

      let totalEfectivo = 0;
      let totalTarjeta = 0;
      let totalGastos = 0;

      fuenteVentas.forEach(v => {
        const fechaVenta = (v.fecha || '').slice(0, 10);
        if (fechaVenta === hoyStr || !v.fecha) {
          const tot = Number(v.total) || 0;
          const met = String(v.metodo_pago || '').toLowerCase();
          if (met.includes('tarjeta') || Number(v.id_modopago) === 2) {
            totalTarjeta += tot;
          } else {
            totalEfectivo += tot;
          }
        }
      });

      fuenteCompras.forEach(c => {
        const fechaComp = (c.fecha || '').slice(0, 10);
        if (fechaComp === hoyStr || !c.fecha) {
          totalGastos += Number(c.total) || 0;
        }
      });

      const totalVentas = totalEfectivo + totalTarjeta;

      return {
        totalVentas,
        totalEfectivo,
        totalTarjeta,
        totalGastos
      };
    } catch {
      return { totalVentas: 0, totalEfectivo: 0, totalTarjeta: 0, totalGastos: 0 };
    }
  }, [ventasBD, comprasBD]);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [lista, activo, listaUsuarios, listaVentas, listaCompras] = await Promise.all([
        getCorteCaja(),
        getCorteActivo(),
        getUsuarios().catch(() => []),
        getVenta().catch(() => []),
        getCompras().catch(() => [])
      ]);

      if (Array.isArray(listaVentas) && listaVentas.length > 0) {
        setVentasBD(listaVentas);
      }
      if (Array.isArray(listaCompras) && listaCompras.length > 0) {
        setComprasBD(listaCompras);
      }

      if (Array.isArray(listaUsuarios) && listaUsuarios.length > 0) {
        setUsuariosCatalogo(listaUsuarios);
      } else {
        try {
          const uLocal = JSON.parse(localStorage.getItem('gymton_usuarios') || '[]');
          if (uLocal.length > 0) setUsuariosCatalogo(uLocal);
        } catch {}
      }

      if (Array.isArray(lista) && lista.length > 0) {
        setCortes(lista);
      } else {
        setCortes([
          {
            id: 101,
            id_usuario: 1,
            cajero_nombre: 'Fabian Alvarez',
            fecha_apertura: '2026-10-21 07:00:00',
            fecha_cierre: '2026-10-21 15:00:00',
            monto_inicial: 500,
            total_ventas: 2850,
            monto_calculado: 3350,
            monto_real: 3350,
            diferencia: 0
          }
        ]);
      }

      setCorteActivo(activo);
    } catch (err) {
      console.warn('Error al cargar cortes de caja:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    const totalArqueo =
      (Number(desgloseBilletes.b1000) * 1000) +
      (Number(desgloseBilletes.b500) * 500) +
      (Number(desgloseBilletes.b200) * 200) +
      (Number(desgloseBilletes.b100) * 100) +
      (Number(desgloseBilletes.b50) * 50) +
      (Number(desgloseBilletes.b20) * 20) +
      (Number(desgloseBilletes.monedas) * 1);

    if (totalArqueo > 0) {
      setFormCierre(prev => ({ ...prev, monto_real: totalArqueo }));
    }
  }, [desgloseBilletes]);

  const handleAbrirTurno = async (e) => {
    if (e) e.preventDefault();
    try {
      const datosApertura = {
        id_usuario: usuarioActivo?.id || 1,
        cajero_nombre: nombreCajeroActivo,
        monto_inicial: 500,
        fecha_apertura: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };

      const resp = await abrirCorteCaja(datosApertura);
      if (resp && resp.success) {
        setAlerta({ mensaje: `¡Turno abierto por ${nombreCajeroActivo} con fondo inicial de $500.00!`, tipo: 'success' });
        setShowModalApertura(false);
        cargarDatos();
      }
    } catch (err) {
      setAlerta({ mensaje: err.message || 'Error al abrir caja', tipo: 'error' });
    }
  };

  const handlePrepararCierre = () => {
    const { totalEfectivo } = obtenerVentasTurno();
    const fondoInicial = Number(corteActivo?.monto_inicial) || 500;
    const esperado = fondoInicial + totalEfectivo;

    setFormCierre({
      monto_real: esperado,
      observaciones: ''
    });
    setDesgloseBilletes({
      b1000: 0,
      b500: 0,
      b200: 0,
      b100: 0,
      b50: 0,
      b20: 0,
      monedas: 0
    });
    setShowModalCierre(true);
  };

  const handleCerrarTurno = async () => {
    if (!corteActivo) return;

    try {
      const { totalVentas, totalEfectivo, totalTarjeta } = obtenerVentasTurno();
      const fondoInicial = Number(corteActivo.monto_inicial) || 500;
      const montoCalculado = fondoInicial + totalEfectivo;
      const montoReal = Number(formCierre.monto_real) || 0;
      const diferencia = montoReal - montoCalculado;

      const { totalGastos } = obtenerVentasTurno();
      const payload = {
        id_usuario: usuarioActivo?.id || corteActivo.id_usuario || 1,
        cajero_nombre: nombreCajeroActivo,
        monto_inicial: fondoInicial,
        total_ventas: totalVentas,
        efectivo: totalEfectivo,
        tarjeta: totalTarjeta,
        total_gastos: totalGastos,
        monto_real: montoReal,
        observaciones: formCierre.observaciones
      };

      const resp = await cerrarCorteCaja(corteActivo.id, payload);
      if (resp && resp.success) {
        setShowModalCierre(false);
        setAlerta({ mensaje: '¡Turno de caja cerrado y arqueo registrado correctamente!', tipo: 'success' });

        setTicketCorte({
          id: corteActivo.id,
          cajero: nombreCajeroActivo,
          fecha_apertura: corteActivo.fecha_apertura || new Date().toLocaleString(),
          fecha_cierre: new Date().toLocaleString(),
          monto_inicial: fondoInicial,
          total_ventas: totalVentas,
          ventas_efectivo: totalEfectivo,
          ventas_tarjeta: totalTarjeta,
          monto_calculado: montoCalculado,
          monto_real: montoReal,
          diferencia: diferencia,
          observaciones: formCierre.observaciones
        });

        cargarDatos();
      }
    } catch (err) {
      setAlerta({ mensaje: err.message || 'Error al cerrar caja', tipo: 'error' });
    }
  };

  const cortesFiltrados = cortes.filter(c => {
    if (filtroEstado === 'abiertos' && c.fecha_cierre) return false;
    if (filtroEstado === 'cerrados' && !c.fecha_cierre) return false;

    if (!busqueda) return true;
    const term = busqueda.toLowerCase().trim();
    return (
      String(c.id).includes(term) ||
      String(c.id_usuario).includes(term) ||
      (c.fecha_apertura && c.fecha_apertura.toLowerCase().includes(term)) ||
      obtenerNombreCajero(c).toLowerCase().includes(term)
    );
  });

  const metricasVentas = obtenerVentasTurno();
  const fondoActual = Number(corteActivo?.monto_inicial) || 500;
  const dineroEsperadoEnCaja = fondoActual + metricasVentas.totalEfectivo;

  return {
    cortes,
    cortesFiltrados,
    corteActivo,
    nombreCajeroActivo,
    obtenerNombreCajero,
    cargando,
    alerta,
    setAlerta,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    showModalApertura,
    setShowModalApertura,
    showModalCierre,
    setShowModalCierre,
    ticketCorte,
    setTicketCorte,
    formApertura,
    setFormApertura,
    formCierre,
    setFormCierre,
    desgloseBilletes,
    setDesgloseBilletes,
    metricasVentas,
    fondoActual,
    dineroEsperadoEnCaja,
    sp_corte_caja_diario: () => sp_corte_caja_diario(cortes),
    cargarDatos,
    handleAbrirTurno,
    handlePrepararCierre,
    handleCerrarTurno
  };
}
