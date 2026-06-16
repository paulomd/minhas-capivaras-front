"use client";

const TAMANHOS_PADRAO = [10, 20, 30, 50, 100] as const;

type PaginacaoListaProps = {
  pagina: number;
  totalPaginas: number;
  totalRegistros: number;
  tamanhoPagina: number;
  onPaginaChange: (pagina: number) => void;
  onTamanhoPaginaChange: (tamanho: number) => void;
  carregando?: boolean;
  minPaginasVisiveis?: number;
  inicioExtra?: React.ReactNode;
};

function calcularPaginasVisiveis(
  pagina: number,
  totalPaginas: number,
  minPaginasVisiveis: number,
): number[] {
  const quantidade = Math.min(minPaginasVisiveis, totalPaginas);
  if (quantidade <= 0) return [];

  let inicio = Math.max(1, pagina - Math.floor(quantidade / 2));
  let fim = inicio + quantidade - 1;

  if (fim > totalPaginas) {
    fim = totalPaginas;
    inicio = Math.max(1, fim - quantidade + 1);
  }

  return Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i);
}

export function PaginacaoLista({
  pagina,
  totalPaginas,
  totalRegistros,
  tamanhoPagina,
  onPaginaChange,
  onTamanhoPaginaChange,
  carregando = false,
  minPaginasVisiveis = 5,
  inicioExtra,
}: PaginacaoListaProps) {
  const paginasVisiveis = calcularPaginasVisiveis(pagina, totalPaginas, minPaginasVisiveis);
  const naPrimeira = pagina <= 1;
  const naUltima = pagina >= totalPaginas;

  const botaoNav =
    "rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-panel-border dark:text-slate-200 dark:hover:bg-panel-menu min-w-[2.25rem]";

  const botaoPagina = (ativa: boolean) =>
    `rounded-lg px-2.5 py-1.5 text-sm font-medium transition min-w-[2.25rem] ${
      ativa
        ? "bg-brand-orange text-white"
        : "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-panel-border dark:text-slate-200 dark:hover:bg-panel-menu"
    }`;

  return (
    <nav
      className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between dark:border-panel-border dark:bg-panel-card"
      aria-label="Paginação"
    >
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-panel-muted">
        {inicioExtra}
        <label className="font-medium text-slate-700 dark:text-slate-200" htmlFor="tamanho-pagina">
          Registros por página
        </label>
        <select
          id="tamanho-pagina"
          value={tamanhoPagina}
          onChange={(e) => onTamanhoPaginaChange(Number(e.target.value))}
          disabled={carregando}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-panel-border dark:bg-panel-menu dark:text-white"
        >
          {TAMANHOS_PADRAO.map((tamanho) => (
            <option key={tamanho} value={tamanho}>
              {tamanho}
            </option>
          ))}
        </select>
        <span>
          {totalRegistros} registro{totalRegistros === 1 ? "" : "s"} · página {pagina} de {totalPaginas}
        </span>
      </div>

      {totalPaginas > 1 && (
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => onPaginaChange(1)}
            disabled={carregando || naPrimeira}
            className={botaoNav}
            aria-label="Primeira página"
          >
            &lt;&lt;
          </button>
          <button
            type="button"
            onClick={() => onPaginaChange(pagina - 1)}
            disabled={carregando || naPrimeira}
            className={botaoNav}
            aria-label="Página anterior"
          >
            &lt;
          </button>

          {paginasVisiveis.map((numero) => (
            <button
              key={numero}
              type="button"
              onClick={() => onPaginaChange(numero)}
              disabled={carregando || numero === pagina}
              className={botaoPagina(numero === pagina)}
              aria-label={`Página ${numero}`}
              aria-current={numero === pagina ? "page" : undefined}
            >
              {numero}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPaginaChange(pagina + 1)}
            disabled={carregando || naUltima}
            className={botaoNav}
            aria-label="Próxima página"
          >
            &gt;
          </button>
          <button
            type="button"
            onClick={() => onPaginaChange(totalPaginas)}
            disabled={carregando || naUltima}
            className={botaoNav}
            aria-label="Última página"
          >
            &gt;&gt;
          </button>
        </div>
      )}
    </nav>
  );
}
