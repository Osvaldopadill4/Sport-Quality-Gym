import { useState, useMemo, useEffect } from 'react';

/**
 * Hook reutilizable para paginar cualquier lista de registros en tablas.
 * Se reinicia automáticamente a la página 1 si el total de páginas disminuye
 * por debajo de la página actual (por ejemplo, al filtrar o buscar).
 */
export function usePaginacion(datos = [], itemsPorPaginaInicial = 10) {
  const listaSegura = useMemo(() => (Array.isArray(datos) ? datos : []), [datos]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(itemsPorPaginaInicial);

  const totalRegistros = listaSegura.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / itemsPorPagina));

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(1);
    }
  }, [paginaActual, totalPaginas]);

  const cambiarItemsPorPagina = (nuevaCantidad) => {
    const cantidad = Number(nuevaCantidad) || itemsPorPaginaInicial;
    setItemsPorPagina(cantidad);
    setPaginaActual(1);
  };

  const irAPagina = (pagina) => {
    const destino = Math.max(1, Math.min(Number(pagina) || 1, totalPaginas));
    setPaginaActual(destino);
  };

  const indiceInicio = totalRegistros === 0 ? 0 : (paginaActual - 1) * itemsPorPagina;
  const indiceFin = Math.min(indiceInicio + itemsPorPagina, totalRegistros);

  const datosPaginados = useMemo(() => {
    return listaSegura.slice(indiceInicio, indiceFin);
  }, [listaSegura, indiceInicio, indiceFin]);

  return {
    paginaActual,
    setPaginaActual: irAPagina,
    itemsPorPagina,
    setItemsPorPagina: cambiarItemsPorPagina,
    totalPaginas,
    totalRegistros,
    indiceInicio,
    indiceFin,
    datosPaginados
  };
}
