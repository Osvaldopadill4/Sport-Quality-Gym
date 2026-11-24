import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Componente visual de paginación unificado para todas las tablas del sistema.
 */
export default function Paginacion({
  paginaActual,
  totalPaginas,
  totalRegistros,
  indiceInicio,
  indiceFin,
  itemsPorPagina,
  onPageChange,
  onItemsPerPageChange,
  etiqueta = 'registros',
  opcionesTamano = [5, 10, 20, 50],
  compacto = false
}) {
  if (totalRegistros === 0) return null;

  const obtenerPaginasVisibles = () => {
    const paginas = [];
    const maxBotones = compacto ? 3 : 5;

    if (totalPaginas <= maxBotones + 2) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
      return paginas;
    }

    paginas.push(1);
    let inicio = Math.max(2, paginaActual - Math.floor(maxBotones / 2));
    let fin = Math.min(totalPaginas - 1, inicio + maxBotones - 1);

    if (fin >= totalPaginas - 1) {
      fin = totalPaginas - 1;
      inicio = Math.max(2, fin - maxBotones + 1);
    }

    if (inicio > 2) paginas.push('...');
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    if (fin < totalPaginas - 1) paginas.push('...');
    paginas.push(totalPaginas);

    return paginas;
  };

  const paginas = obtenerPaginasVisibles();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-900/70 ${
        compacto ? 'px-3 py-2 text-[11px]' : 'px-4 py-3 text-xs'
      } text-zinc-400`}
    >
      <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
        <span>
          Mostrando{' '}
          <strong className="text-zinc-200">{indiceInicio + 1}</strong> -{' '}
          <strong className="text-zinc-200">{indiceFin}</strong> de{' '}
          <strong className="text-zinc-200">{totalRegistros}</strong> {etiqueta}
        </span>

        {!compacto && onItemsPerPageChange && (
          <label className="flex items-center gap-1.5 text-zinc-400">
            <span>Por página:</span>
            <select
              value={itemsPorPagina}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {opcionesTamano.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1">
        {!compacto && (
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={paginaActual <= 1}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
            title="Primera página"
          >
            <ChevronsLeft size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={() => onPageChange(paginaActual - 1)}
          disabled={paginaActual <= 1}
          className={`flex items-center gap-1 ${
            compacto ? 'px-2 py-1' : 'px-2.5 py-1.5'
          } rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors font-semibold`}
          title="Página anterior"
        >
          <ChevronLeft size={14} />
          {!compacto && <span>Anterior</span>}
        </button>

        <div className="flex items-center gap-1 mx-0.5">
          {paginas.map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="px-1.5 text-zinc-500 select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`${
                  compacto ? 'min-w-[24px] h-6 text-[11px]' : 'min-w-[30px] h-7 text-xs'
                } px-1.5 rounded-lg font-bold transition-all border ${
                  p === paginaActual
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm shadow-emerald-500/20'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(paginaActual + 1)}
          disabled={paginaActual >= totalPaginas}
          className={`flex items-center gap-1 ${
            compacto ? 'px-2 py-1' : 'px-2.5 py-1.5'
          } rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors font-semibold`}
          title="Página siguiente"
        >
          {!compacto && <span>Siguiente</span>}
          <ChevronRight size={14} />
        </button>

        {!compacto && (
          <button
            type="button"
            onClick={() => onPageChange(totalPaginas)}
            disabled={paginaActual >= totalPaginas}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
            title="Última página"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
