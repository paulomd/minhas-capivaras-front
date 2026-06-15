export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type FormatarDataOpcoes = {
  /** Quando true, valores sem fuso (ex.: do MySQL em UTC) são interpretados como UTC. */
  origemUtc?: boolean;
};

function parseData(iso: string, opcoes: FormatarDataOpcoes = {}): Date | null {
  const trimmed = iso.trim();
  const possuiFuso = /(?:[zZ]|[+-]\d{2}:\d{2})$/.test(trimmed);
  const valor = possuiFuso
    ? trimmed
    : opcoes.origemUtc
      ? `${trimmed}Z`
      : trimmed;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

const opcoesDataHoraPtBr: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};

export function formatarDataHora(
  iso: string | null | undefined,
  opcoes: FormatarDataOpcoes = {},
): string {
  if (!iso) return "-";
  const d = parseData(iso, opcoes);
  if (!d) return iso;
  return d.toLocaleString("pt-BR", opcoesDataHoraPtBr);
}

export function formatarData(
  iso: string | null | undefined,
  opcoes: FormatarDataOpcoes = {},
): string {
  if (!iso) return "-";
  const d = parseData(iso, opcoes);
  if (!d) return iso;
  return d.toLocaleDateString("pt-BR");
}
