export type VisualizacaoMonitoramentos = "cards" | "tabela";

export const VISUALIZACAO_MONITORAMENTOS_KEY =
  "jurisprime_monitoramentos_visualizacao";

export function obterVisualizacaoMonitoramentosSalva(): VisualizacaoMonitoramentos {
  if (typeof window === "undefined") return "cards";
  try {
    return localStorage.getItem(VISUALIZACAO_MONITORAMENTOS_KEY) === "tabela"
      ? "tabela"
      : "cards";
  } catch {
    return "cards";
  }
}

export function salvarVisualizacaoMonitoramentos(
  visualizacao: VisualizacaoMonitoramentos,
): void {
  try {
    localStorage.setItem(VISUALIZACAO_MONITORAMENTOS_KEY, visualizacao);
  } catch {
    /* ignore */
  }
}
