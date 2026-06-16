import { TOKEN_STORAGE_KEY } from "@/lib/constants";
import { resolveApiUrl } from "@/lib/apiBase";
import { extrairMensagemErroApi } from "@/lib/apiError";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function obterToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null; auth?: boolean } = {},
): Promise<T> {
  const { token, auth = false, headers, ...rest } = options;
  const authToken = token ?? (auth ? obterToken() : null);

  const resposta = await fetch(resolveApiUrl(path), {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  const semConteudo =
    resposta.status === 204 ||
    resposta.status === 205 ||
    resposta.headers.get("content-length") === "0";

  let dados: unknown = null;
  if (!semConteudo) {
    const texto = await resposta.text();
    if (texto) {
      try {
        dados = JSON.parse(texto);
      } catch {
        dados = null;
      }
    }
  }

  if (!resposta.ok) {
    const mensagem =
      extrairMensagemErroApi(dados) ??
      `Erro na requisição (HTTP ${resposta.status})`;
    throw new ApiError(resposta.status, mensagem);
  }

  return dados as T;
}
