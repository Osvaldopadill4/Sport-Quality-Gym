import { useState, useEffect, useMemo, useCallback } from 'react';
import { getVenta } from '../JS/venta';
import { getCompras } from '../JS/compra';
import { getCorteCaja, calcularDesgloseCorte } from '../JS/corte_caja';
import { getProductos } from '../JS/producto';
import { getClientes } from '../JS/cliente';
import { getProveedores } from '../JS/proveedor';
import { getUsuarios } from '../JS/usuarios';
import { getReporteVentas } from '../JS/reportes_api';
import {
  sp_ventas_por_fecha,
  sp_productos_mas_vendidos,
  fn_total_gastado_cliente
} from './objetosSQL';

/**
 * Hook Reutilizable `useReportes`:
 * Consume de forma optimizada la vista SQL `vw_detalle_ventas` (/api/reporte/ventas),
 * centraliza métricas financieras (Efectivo/Tarjeta, Membresías/Tienda, Ventas/Gastos),
 * permite filtrado dinámico por fechas libres e integra reportes impresos/PDF.
 */
export function useReportes({ loggedUser }) {
  const [tabActiva, setTabActiva] = useState('ventas');
  const [subFiltroVentas, setSubFiltroVentas] = useState('todas');
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [cortes, setCortes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [modoImpresion, setModoImpresion] = useState('general'); // 'general' | 'ventas' | 'compras' | 'cortes'

  // Carga optimizada: Si la vista SQL `/api/reporte/ventas` está disponible, la usa directamente
  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const [
          resVistaVentas,
          resVentasNormales,
          resCompras,
          resCortes,
          resProds,
          resClis,
          resProvs,
          resUsrs
        ] = await Promise.allSettled([
          getReporteVentas(),
          getVenta(),
          getCompras(),
          getCorteCaja(),
          getProductos(),
          getClientes(),
          getProveedores(),
          getUsuarios()
        ]);

        if (resVistaVentas.status === 'fulfilled' && Array.isArray(resVistaVentas.value) && resVistaVentas.value.length > 0) {
          const adaptadas = resVistaVentas.value.map(row => ({
            id: row.id_venta,
            folio: `V-${String(row.id_venta).padStart(6, '0')}`,
            fecha: row.fecha,
            cliente: row.cliente || 'Público General',
            empleado: row.empleado || 'Cajero',
            articulo: row.articulo || 'Producto',
            conceptoResumen: row.articulo || 'Producto',
            cantidad: Number(row.cantidad) || 1,
            precio_unitario: Number(row.precio_unitario) || 0,
            subtotal: Number(row.subtotal) || Number(row.total) || 0,
            total: Number(row.total) || Number(row.subtotal) || 0,
            metodo_pago: row.metodo_pago || 'Efectivo',
            es_membresia: Boolean(
              String(row.articulo || '').toLowerCase().match(/membres|plan|mensual|anual|semanal|renov/)
            )
          }));
          setVentas(adaptadas);
        } else if (resVentasNormales.status === 'fulfilled' && Array.isArray(resVentasNormales.value)) {
          setVentas(resVentasNormales.value);
        }

        if (resCompras.status === 'fulfilled' && Array.isArray(resCompras.value)) setCompras(resCompras.value);
        if (resCortes.status === 'fulfilled' && Array.isArray(resCortes.value)) setCortes(resCortes.value);
        if (resProds.status === 'fulfilled' && Array.isArray(resProds.value)) setProductos(resProds.value);
        if (resClis.status === 'fulfilled' && Array.isArray(resClis.value)) setClientes(resClis.value);
        if (resProvs.status === 'fulfilled' && Array.isArray(resProvs.value)) setProveedores(resProvs.value);
        if (resUsrs.status === 'fulfilled' && Array.isArray(resUsrs.value)) setUsuarios(resUsrs.value);
      } catch (err) {
        console.error('Error al cargar reportes:', err);
      }
    };

    cargarTodo();
  }, []);

  // Función compacta para resolver nombre del cliente
  const resolverNombreClienteVenta = useCallback((v) => {
    if (!v) return 'Público General';
    if (v.cliente && v.cliente !== 'Público General') {
      return String(v.cliente).replace(/\s*\(Socio\s*#\d+\)/gi, '').trim() || v.cliente;
    }
    if (v.id_cliente) {
      const c = clientes.find(cli => Number(cli.id) === Number(v.id_cliente));
      if (c && c.nombre) return c.nombre;
    }
    return 'Público General';
  }, [clientes]);

  // Clasificación rápida de tipo de venta (Membresía vs Producto)
  const clasificarVenta = useCallback((v) => {
    if (!v) return { esMembresia: false, esMixta: false, montoMembresia: 0, montoProducto: 0, conceptoResumen: 'Venta Mostrador' };
    const tot = Number(v.total) || 0;
    const esMembresia = Boolean(
      v.es_membresia ||
      v.tipo_venta === 'Membresía' ||
      String(v.articulo || '').toLowerCase().match(/membres|plan|mensual|anual|semanal|renov/) ||
      (Array.isArray(v.detalles) && v.detalles.some(d => d.es_membresia || d.id_plan || String(d.articulo || '').toLowerCase().match(/membres|plan|renov/)))
    );

    const concepto = v.conceptoResumen || v.articulo || (Array.isArray(v.detalles) && v.detalles.length > 0 ? v.detalles.map(d => `${d.cantidad || 1}x ${d.articulo || 'Art'}`).join(', ') : 'Venta Tienda');

    return {
      esMembresia,
      esMixta: false,
      montoMembresia: esMembresia ? tot : 0,
      montoProducto: esMembresia ? 0 : tot,
      conceptoResumen: concepto
    };
  }, []);

  // Rango de fechas libre (personalizado)
  const obtenerRangoFechas = useCallback(() => {
    return {
      inicio: fechaInicio || null,
      fin: fechaFin || null
    };
  }, [fechaInicio, fechaFin]);

  const filtrarPorFecha = useCallback((fechaStr) => {
    if (!fechaStr) return true;
    const soloFecha = String(fechaStr).slice(0, 10);
    if (fechaInicio && soloFecha < fechaInicio) return false;
    if (fechaFin && soloFecha > fechaFin) return false;
    return true;
  }, [fechaInicio, fechaFin]);

  const limpiarFiltroFechas = () => {
    setFechaInicio('');
    setFechaFin('');
  };

  const imprimirSeccion = (seccion = 'ventas') => {
    setModoImpresion(seccion);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Cálculo consolidado de métricas y porcentajes para las 3 gráficas
  const metricas = useMemo(() => {
    const { inicio, fin } = obtenerRangoFechas();
    const vFiltradas = sp_ventas_por_fecha(ventas, inicio, fin);
    const cFiltradas = sp_ventas_por_fecha(compras, inicio, fin);

    let ingresosMembresias = 0;
    let ingresosProductos = 0;
    let ticketsMembresias = 0;
    let ticketsProductos = 0;
    let ventasEfectivo = 0;
    let ventasTarjeta = 0;

    vFiltradas.forEach(v => {
      const info = clasificarVenta(v);
      ingresosMembresias += info.montoMembresia;
      ingresosProductos += info.montoProducto;
      if (info.esMembresia) ticketsMembresias++; else ticketsProductos++;

      const tot = Number(v.total) || 0;
      const met = String(v.metodo_pago || '').toLowerCase();
      if (met.includes('tarjeta') || Number(v.id_modopago) === 2) {
        ventasTarjeta += tot;
      } else {
        ventasEfectivo += tot;
      }
    });

    const totalVentas = ingresosMembresias + ingresosProductos;
    const totalCompras = cFiltradas.reduce((acc, c) => acc + (Number(c.total) || (Number(c.cantidad) * Number(c.costo_unitario)) || 0), 0);
    const margenEstimado = totalVentas - totalCompras;

    const basePago = (ventasEfectivo + ventasTarjeta) || 1;
    const baseNegocio = (ingresosMembresias + ingresosProductos) || 1;
    const baseFlujo = (totalVentas + totalCompras) || 1;

    return {
      totalVentas,
      totalCompras,
      margenEstimado,
      balanceNeto: margenEstimado,
      cantidadTickets: vFiltradas.length,
      ticketsMembresias,
      ticketsProductos,
      cantidadCompras: cFiltradas.length,
      ingresosMembresias,
      ingresosProductos,
      ventasEfectivo,
      ventasTarjeta,
      pctEfectivo: Math.round((ventasEfectivo / basePago) * 100),
      pctTarjeta: Math.max(0, 100 - Math.round((ventasEfectivo / basePago) * 100)),
      pctMembresias: Math.round((ingresosMembresias / baseNegocio) * 100),
      pctProductos: Math.max(0, 100 - Math.round((ingresosMembresias / baseNegocio) * 100)),
      pctVentasFlujo: Math.round((totalVentas / baseFlujo) * 100),
      pctComprasFlujo: Math.max(0, 100 - Math.round((totalVentas / baseFlujo) * 100)),
      topProductos: sp_productos_mas_vendidos(vFiltradas, productos)
    };
  }, [ventas, compras, productos, obtenerRangoFechas, clasificarVenta]);

  // Lista filtrada de ventas para la tabla
  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      if (!filtrarPorFecha(v.fecha)) return false;
      const info = clasificarVenta(v);
      if (subFiltroVentas === 'membresias' && !info.esMembresia) return false;
      if (subFiltroVentas === 'productos' && info.esMembresia) return false;

      if (!busqueda) return true;
      const b = busqueda.toLowerCase();
      const cliNom = resolverNombreClienteVenta(v).toLowerCase();
      return (
        (v.folio && v.folio.toLowerCase().includes(b)) ||
        cliNom.includes(b) ||
        info.conceptoResumen.toLowerCase().includes(b) ||
        (v.empleado && v.empleado.toLowerCase().includes(b))
      );
    });
  }, [ventas, busqueda, subFiltroVentas, filtrarPorFecha, clasificarVenta, resolverNombreClienteVenta]);

  // Resolución de datos de compras a proveedores
  const resolverDatosCompra = useCallback((c) => {
    const totalInv = Number(c.total) || (Number(c.cantidad || 0) * Number(c.costo_unitario || 0)) || 0;
    const prov = proveedores.find(pr => Number(pr.id) === Number(c.id_proveedor));
    const provNombre = c.proveedor_nombre || (prov ? (prov.nombre_empresa || prov.nombre) : 'Proveedor Comercial');
    const prod = productos.find(p => Number(p.id) === Number(c.id_producto));
    const prodNombre = c.producto_nombre || prod?.nombre || 'Reabastecimiento de Suplementos';
    const cant = Number(c.cantidad) || (totalInv > 0 ? 10 : 0);
    const costoUnit = Number(c.costo_unitario ?? c.costo) || (cant > 0 ? Number((totalInv / cant).toFixed(2)) : 0);

    return { provNombre, prodNombre, cant, costoUnit, totalInv };
  }, [productos, proveedores]);

  const comprasFiltradas = useMemo(() => {
    return compras.filter(c => {
      if (!filtrarPorFecha(c.fecha)) return false;
      if (!busqueda) return true;
      const b = busqueda.toLowerCase();
      const info = resolverDatosCompra(c);
      return (
        String(c.id).includes(b) ||
        info.prodNombre.toLowerCase().includes(b) ||
        info.provNombre.toLowerCase().includes(b)
      );
    });
  }, [compras, busqueda, filtrarPorFecha, resolverDatosCompra]);

  const resolverCajeroCorte = useCallback((cc) => {
    if (cc.cajero_nombre && !String(cc.cajero_nombre).startsWith('Usuario #')) return cc.cajero_nombre;
    const u = usuarios.find(usr => Number(usr.id) === Number(cc.id_usuario));
    if (u && u.nombre) return `${u.nombre} ${u.apellido || ''}`.trim();
    if (loggedUser && (Number(loggedUser.id) === Number(cc.id_usuario) || !cc.id_usuario)) {
      return `${loggedUser.nombre || ''} ${loggedUser.apellido || ''}`.trim() || 'Administrador';
    }
    return `Usuario #${cc.id_usuario || 1}`;
  }, [usuarios, loggedUser]);

  const resolverDesgloseCorte = useCallback((cc) => {
    return calcularDesgloseCorte(cc, ventas, compras);
  }, [ventas, compras]);

  const cortesFiltrados = useMemo(() => {
    return cortes.filter(cc => {
      if (!filtrarPorFecha(cc.fecha_cierre || cc.fecha_apertura || cc.fecha)) return false;
      if (!busqueda) return true;
      const b = busqueda.toLowerCase();
      return (
        String(cc.id).includes(b) ||
        resolverCajeroCorte(cc).toLowerCase().includes(b) ||
        String(cc.fecha_apertura || '').toLowerCase().includes(b) ||
        String(cc.fecha_cierre || '').toLowerCase().includes(b)
      );
    });
  }, [cortes, busqueda, filtrarPorFecha, resolverCajeroCorte]);

  return {
    tabActiva,
    setTabActiva,
    subFiltroVentas,
    setSubFiltroVentas,
    cortes,
    cortesFiltrados,
    busqueda,
    setBusqueda,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    limpiarFiltroFechas,
    modoImpresion,
    imprimirSeccion,
    metricas,
    ventasFiltradas,
    comprasFiltradas,
    clasificarVenta,
    resolverNombreClienteVenta,
    resolverDatosCompra,
    resolverCajeroCorte,
    resolverDesgloseCorte,
    handleImprimir: () => imprimirSeccion(tabActiva),
    imprimirVentas: () => imprimirSeccion('ventas'),
    imprimirCompras: () => imprimirSeccion('compras'),
    imprimirCortes: () => imprimirSeccion('cortes'),
    fnTotalGastadoCliente: (idCli) => fn_total_gastado_cliente(idCli, ventas)
  };
}
