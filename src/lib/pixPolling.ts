import { resolveApiUrl } from "@/lib/apiBase";
import { obterToken } from "@/lib/apiFetch";
import type { PixStatusResponse } from "@/types/pix";

export type PixPollingCallbacks = {
  onPago: () => void;
  onErro?: (erro: Error) => void;
};

type PollingOptions = {
  intervaloMs?: number;
};

function pixFoiPago(dados: PixStatusResponse): boolean {
  return dados.pago === true || dados.situacao === "PAGO";
}

export function iniciarPollingPixStatus(
  pixId: number,
  callbacks: PixPollingCallbacks,
  options: PollingOptions = {},
): () => void {
  const intervaloMs = options.intervaloMs ?? 2000;
  let cancelado = false;
  let timer: number | undefined;

  const parar = () => {
    cancelado = true;
    if (timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };

  const verificar = async () => {
    if (cancelado) return;

    const authToken = obterToken();
    if (!authToken) {
      callbacks.onErro?.(new Error("Token de autenticação não encontrado."));
      return;
    }

    try {
      const resposta = await fetch(resolveApiUrl(`/pix/${pixId}/status`), {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!resposta.ok) {
        if (resposta.status >= 500) {
          return;
        }
        throw new Error(`HTTP ${resposta.status}`);
      }

      const dados = (await resposta.json()) as PixStatusResponse;
      if (pixFoiPago(dados)) {
        parar();
        callbacks.onPago();
      }
    } catch (e) {
      callbacks.onErro?.(
        e instanceof Error ? e : new Error("Erro ao verificar pagamento Pix"),
      );
    }
  };

  void verificar();
  timer = window.setInterval(verificar, intervaloMs);

  return parar;
}
