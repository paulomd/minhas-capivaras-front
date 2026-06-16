export type VisualizacaoProcessos = "cards" | "tabela";

export const VISUALIZACAO_PROCESSOS_KEY = "jurisprime_processos_visualizacao";

export function obterVisualizacaoProcessosSalva(): VisualizacaoProcessos {
  if (typeof window === "undefined") return "cards";
  try {
    return localStorage.getItem(VISUALIZACAO_PROCESSOS_KEY) === "tabela"
      ? "tabela"
      : "cards";
  } catch {
    return "cards";
  }
}

export function salvarVisualizacaoProcessos(visualizacao: VisualizacaoProcessos): void {
  try {
    localStorage.setItem(VISUALIZACAO_PROCESSOS_KEY, visualizacao);
  } catch {
    /* ignore */
  }
}
