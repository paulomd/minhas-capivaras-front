import { PERFIL_STORAGE_KEY, TOKEN_STORAGE_KEY } from "@/lib/constants";
import { resolveApiUrl } from "@/lib/apiBase";

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
  periodoAssinatura: string | null;
  quantidadeMonitoramentoAdicional: number;
  monitoramentosCadastrados: number;
  planoQuantidadeMonitoramento: number | null;
};

export async function buscarPerfilUsuario(
  token: string,
): Promise<UsuarioPerfilSessao> {
  const resposta = await fetch(resolveApiUrl("/usuarios/perfil"), {
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
  window.dispatchEvent(new Event("perfil-sessao-atualizado"));
}

export async function recarregarPerfilSessao(): Promise<UsuarioPerfilSessao | null> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    return null;
  }
  const perfil = await buscarPerfilUsuario(token);
  salvarPerfilSessao(perfil);
  return perfil;
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
  window.dispatchEvent(new Event("perfil-sessao-atualizado"));
}

function parseDataFinalPlano(iso: string): Date | null {
  const trimmed = iso.trim();
  const possuiFuso = /(?:[zZ]|[+-]\d{2}:\d{2})$/.test(trimmed);
  const valor = possuiFuso ? trimmed : trimmed;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Considera expiração pela data final, além do flag retornado pela API. */
export function planoEstaAtivo(
  perfil: UsuarioPerfilSessao | null | undefined,
): boolean {
  if (!perfil?.planoAtivo || !perfil.dataFinalPlano) {
    return false;
  }
  const fim = parseDataFinalPlano(perfil.dataFinalPlano);
  if (!fim) {
    return perfil.planoAtivo;
  }
  return fim.getTime() > Date.now();
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
