import { getApiUrl, PERFIL_STORAGE_KEY } from "@/lib/constants";

export type UsuarioPerfilSessao = {
  id: number;
  nome: string;
  email: string;
  fone: string;
  planoId: number | null;
  planoNome: string | null;
  dataInicialPlano: string | null;
  dataFinalPlano: string | null;
  planoAtivo: boolean;
  periodoId: number | null;
  quantidadeMonitoramentoAdicional: number;
  monitoramentosCadastrados: number;
  planoQuantidadeMonitoramento: number | null;
};

export async function buscarPerfilUsuario(
  token: string,
): Promise<UsuarioPerfilSessao> {
  const resposta = await fetch(`${getApiUrl()}/usuarios/perfil`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!resposta.ok) {
    throw new Error(`HTTP ${resposta.status}`);
  }

  return (await resposta.json()) as UsuarioPerfilSessao;
}

export function salvarPerfilSessao(perfil: UsuarioPerfilSessao): void {
  sessionStorage.setItem(PERFIL_STORAGE_KEY, JSON.stringify(perfil));
}

export function obterPerfilSessao(): UsuarioPerfilSessao | null {
  const bruto = sessionStorage.getItem(PERFIL_STORAGE_KEY);
  if (!bruto) {
    return null;
  }
  try {
    return JSON.parse(bruto) as UsuarioPerfilSessao;
  } catch {
    return null;
  }
}

export function limparPerfilSessao(): void {
  sessionStorage.removeItem(PERFIL_STORAGE_KEY);
}

export function iniciaisDoNome(nome: string | undefined): string {
  if (!nome?.trim()) {
    return "?";
  }
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) {
    return "?";
  }
  if (partes.length === 1) {
    return partes[0]!.slice(0, 2).toUpperCase();
  }
  const first = partes[0]![0] ?? "";
  const last = partes[partes.length - 1]![0] ?? "";
  return (first + last).toUpperCase();
}
