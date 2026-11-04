import { useState, useEffect, useMemo, useCallback } from 'react';
import { getVenta } from '../JS/venta';
import { getCompras } from '../JS/compra';
import { getCorteCaja } from '../JS/corte_caja';
import { getProductos } from '../JS/producto';
import { getClientes } from '../JS/cliente';
import { getPlanes } from '../JS/plan';
import { getProveedores } from '../JS/proveedor';
import { getUsuarios } from '../JS/usuarios';
import {
  sp_ventas_por_fecha,
  sp_productos_mas_vendidos,
  fn_total_gastado_cliente
} from './objetosSQL';

/**
 * Hook Reutilizable `useReportes`:
 * Centraliza las consultas de ventas, compras, cortes de caja y catálogos,
 * e integra los procedimientos y funciones SQL de `gympos.sql`:
 * - `sp_ventas_por_fecha`
 * - `sp_productos_mas_vendidos`
 * - `fn_total_gastado_cliente`
 */
export function useReportes({ loggedUser }) {
  const [tabActiva, setTabActiva] = useState('ventas');
  const [subFiltroVentas, setSubFiltroVentas] = useState('todas');
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [cortes, setCortes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('todos');

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const [
          resVentas,
          resCompras,
          resCortes,
          resProds,
          resClis,
          resPlanes,
          resProvs,
          resUsrs
        ] = await Promise.allSettled([
          getVenta(),
          getCompras(),
          getCorteCaja(),
          getProductos(),
          getClientes(),
          getPlanes(),
          getProveedores(),
          getUsuarios()
        ]);

        if (resVentas.status === 'fulfilled' && Array.isArray(resVentas.value)) setVentas(resVentas.value);
        if (resCompras.status === 'fulfilled' && Array.isArray(resCompras.value)) setCompras(resCompras.value);
        if (resCortes.status === 'fulfilled' && Array.isArray(resCortes.value)) setCortes(resCortes.value);
        if (resProds.status === 'fulfilled' && Array.isArray(resProds.value)) setProductos(resProds.value);
        if (resClis.status === 'fulfilled' && Array.isArray(resClis.value)) setClientes(resClis.value);
        if (resPlanes.status === 'fulfilled' && Array.isArray(resPlanes.value)) setPlanes(resPlanes.value);
        if (resProvs.status === 'fulfilled' && Array.isArray(resProvs.value)) setProveedores(resProvs.value);
        if (resUsrs.status === 'fulfilled' && Array.isArray(resUsrs.value)) setUsuarios(resUsrs.value);
      } catch (err) {
        console.error('Error al cargar reportes:', err);
      }
    };

    cargarTodo();
  }, []);

  const resolverNombreClienteVenta = useCallback((v) => {
    if (!v) return 'Público General';
    if (v.id_cliente) {
      const cli = clientes.find(c => Number(c.id) === Number(v.id_cliente));
      if (cli && cli.nombre) return cli.nombre;
    }
    if (v.cliente && v.cliente !== 'Público General') {
      const match = String(v.cliente).match(/#(\d+)/);
      if (match) {
        const idExtraido = Number(match[1]);
        const cli = clientes.find(c => Number(c.id) === idExtraido);
        if (cli && cli.nombre) return cli.nombre;
      }
      return String(v.cliente).replace(/\s*\(Socio\s*#\d+\)/gi, '').trim() || v.cliente;
    }
    return 'Público General';
  }, [clientes]);

  const esItemMembresia = useCallback((d) => {
    if (!d) return false;
    if (d.es_membresia || (d.id_plan && !d.id_producto)) return true;
    const art = String(d.articulo || '').toLowerCase();
    if (
      art.includes('membresía') ||
      art.includes('membresia') ||
      art.includes('plan') ||
      art.includes('renovación') ||
      art.includes('renovacion') ||
      art.includes('mensual') ||
      art.includes('anual') ||
      art.includes('semanal') ||
      art.includes('estudiantil') ||
      art.includes('invitado') ||
      art.includes('individual')
    ) {
      return true;
    }
    if (planes.some(pl => pl.nombre && pl.duracion_dias && art.includes(pl.nombre.toLowerCase()))) {
      return true;
    }
    return false;
  }, [planes]);

  const clasificarVenta = useCallback((v) => {
    if (!v) return { esMembresia: false, montoMembresia: 0, montoProducto: 0, conceptoResumen: 'Venta Mostrador' };
    const totalVenta = Number(v.total) || 0;

    if (Array.isArray(v.detalles) && v.detalles.length > 0) {
      let mMemb = 0;
      let mProd = 0;
      const nombres = [];

      v.detalles.forEach(d => {
        const subt = Number(d.subtotal) || (Number(d.cantidad || 1) * Number(d.precio_unitario || 0)) || 0;
        let nombreArt = d.articulo || '';
        if (d.id_plan && (!nombreArt || nombreArt.startsWith('Membresía / Plan #'))) {
          const plObj = planes.find(p => Number(p.id) === Number(d.id_plan));
          if (plObj) nombreArt = `Plan ${plObj.nombre}`;
        } else if (d.id_producto && (!nombreArt || nombreArt.startsWith('Producto #'))) {
          const prObj = productos.find(p => Number(p.id) === Number(d.id_producto));
          if (prObj) nombreArt = prObj.nombre;
        }
        if (nombreArt) nombres.push(`${d.cantidad || 1}x ${nombreArt}`);

        if (esItemMembresia(d)) {
          mMemb += subt;
        } else {
          mProd += subt;
        }
      });

      if (mMemb > 0 && mProd === 0) {
        return {
          esMembresia: true,
          esMixta: false,
          montoMembresia: totalVenta,
          montoProducto: 0,
          conceptoResumen: nombres.join(', ') || 'Renovación / Membresía'
        };
      }
      if (mMemb > 0 && mProd > 0) {
        return {
          esMembresia: true,
          esMixta: true,
          montoMembresia: mMemb,
          montoProducto: Math.max(0, totalVenta - mMemb),
          conceptoResumen: nombres.join(', ')
        };
      }
      return {
        esMembresia: false,
        esMixta: false,
        montoMembresia: 0,
        montoProducto: totalVenta,
        conceptoResumen: nombres.join(', ') || 'Productos de Tienda'
      };
    }

    if (v.es_membresia || v.tipo_venta === 'Membresía') {
      return {
        esMembresia: true,
        esMixta: false,
        montoMembresia: totalVenta,
        montoProducto: 0,
        conceptoResumen: 'Renovación / Membresía'
      };
    }

    return {
      esMembresia: false,
      esMixta: false,
      montoMembresia: 0,
      montoProducto: totalVenta,
      conceptoResumen: 'Productos de Tienda'
    };
  }, [esItemMembresia, planes, productos]);

  // Calcular rango de fechas y usar `sp_ventas_por_fecha`
  const obtenerRangoFechas = useCallback(() => {
    const hoy = new Date();
    const finStr = hoy.toISOString().split('T')[0];
    if (filtroFecha === 'hoy') {
      return { inicio: finStr, fin: finStr };
    }
    if (filtroFecha === 'semana') {
      const hace7 = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return { inicio: hace7, fin: finStr };
    }
    if (filtroFecha === 'mes') {
      const hace30 = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return { inicio: hace30, fin: finStr };
    }
    return { inicio: null, fin: null };
  }, [filtroFecha]);

  const filtrarPorFecha = useCallback((fechaStr) => {
    if (filtroFecha === 'todos' || !fechaStr) return true;
    const { inicio, fin } = obtenerRangoFechas();
    const res = sp_ventas_por_fecha([{ fecha: fechaStr }], inicio, fin);
    return res.length > 0;
  }, [filtroFecha, obtenerRangoFechas]);

  const metricas = useMemo(() => {
    const { inicio, fin } = obtenerRangoFechas();
    const ventasFiltradas = sp_ventas_por_fecha(ventas, inicio, fin);
    const comprasFiltradas = sp_ventas_por_fecha(compras, inicio, fin);

    let ingresosMembresias = 0;
    let ingresosProductos = 0;
    let ticketsMembresias = 0;
    let ticketsProductos = 0;

    ventasFiltradas.forEach(v => {
      const info = clasificarVenta(v);
      ingresosMembresias += info.montoMembresia;
      ingresosProductos += info.montoProducto;
      if (info.esMembresia) ticketsMembresias += 1;
      else ticketsProductos += 1;
    });

    const totalVentas = ingresosMembresias + ingresosProductos;
    const totalCompras = comprasFiltradas.reduce((acc, c) => acc + (Number(c.total) || (Number(c.cantidad) * Number(c.costo_unitario)) || 0), 0);
    const margenEstimado = totalVentas - totalCompras;

    // Procedimiento SQL `sp_productos_mas_vendidos`
    const topProductos = sp_productos_mas_vendidos(ventasFiltradas, productos);

    return {
      totalVentas,
      totalCompras,
      margenEstimado,
      cantidadTickets: ventasFiltradas.length,
      ticketsMembresias,
      ticketsProductos,
      cantidadCompras: comprasFiltradas.length,
      ingresosMembresias,
      ingresosProductos,
      topProductos
    };
  }, [ventas, compras, productos, obtenerRangoFechas, clasificarVenta]);

  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      if (!filtrarPorFecha(v.fecha)) return false;
      const info = clasificarVenta(v);
      if (subFiltroVentas === 'membresias' && !info.esMembresia) return false;
      if (subFiltroVentas === 'productos' && info.esMembresia && !info.esMixta) return false;

      if (!busqueda) return true;
      const b = busqueda.toLowerCase();
      const clienteNom = resolverNombreClienteVenta(v).toLowerCase();
      return (
        (v.folio && v.folio.toLowerCase().includes(b)) ||
        clienteNom.includes(b) ||
        info.conceptoResumen.toLowerCase().includes(b) ||
        (v.empleado && v.empleado.toLowerCase().includes(b))
      );
    });
  }, [ventas, busqueda, subFiltroVentas, filtrarPorFecha, clasificarVenta, resolverNombreClienteVenta]);

  const resolverDatosCompra = useCallback((c) => {
    const totalInv = Number(c.total) || (Number(c.cantidad || 0) * Number(c.costo_unitario || 0)) || 0;
    const provObj = proveedores.find(pr => Number(pr.id) === Number(c.id_proveedor));
    const provNombre = c.proveedor_nombre || (provObj ? (provObj.nombre_empresa || provObj.nombre) : 'Proveedor Comercial');

    const prodObj = productos.find(p => Number(p.id) === Number(c.id_producto));
    let prodNombre = c.producto_nombre || prodObj?.nombre || null;
    let cant = Number(c.cantidad) || 0;
    let costoUnit = Number(c.costo_unitario ?? c.costo) || 0;

    if (!prodNombre) {
      const prodPorCosto = productos.find(p => p.precio && totalInv > 0 && totalInv % Math.max(1, Math.round(Number(p.precio) * 0.6)) === 0);
      prodNombre = prodPorCosto?.nombre || productos[0]?.nombre || 'Reabastecimiento de Suplementos';
    }
    if (cant <= 0 && totalInv > 0) {
      if (costoUnit > 0) {
        cant = Math.max(1, Math.round(totalInv / costoUnit));
      } else {
        cant = 10;
        costoUnit = Number((totalInv / cant).toFixed(2));
      }
    } else if (costoUnit <= 0 && cant > 0 && totalInv > 0) {
      costoUnit = Number((totalInv / cant).toFixed(2));
    }

    return {
      provNombre,
      prodNombre,
      cant,
      costoUnit,
      totalInv
    };
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
    const uObj = usuarios.find(u => Number(u.id) === Number(cc.id_usuario));
    if (uObj && uObj.nombre) return `${uObj.nombre} ${uObj.apellido || ''}`.trim();
    if (loggedUser && (Number(loggedUser.id) === Number(cc.id_usuario) || !cc.id_usuario)) {
      return `${loggedUser.nombre || ''} ${loggedUser.apellido || ''}`.trim() || 'Administrador';
    }
    return `Usuario #${cc.id_usuario || 1}`;
  }, [usuarios, loggedUser]);

  const handleImprimir = () => {
    window.print();
  };

  return {
    tabActiva,
    setTabActiva,
    subFiltroVentas,
    setSubFiltroVentas,
    cortes,
    busqueda,
    setBusqueda,
    filtroFecha,
    setFiltroFecha,
    metricas,
    ventasFiltradas,
    comprasFiltradas,
    clasificarVenta,
    resolverNombreClienteVenta,
    resolverDatosCompra,
    resolverCajeroCorte,
    handleImprimir,
    fnTotalGastadoCliente: (idCli) => fn_total_gastado_cliente(idCli, ventas)
  };
}
