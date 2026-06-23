"use client";

import Link from "next/link";
import { usePerfilSessao } from "@/hooks/usePerfilSessao";
import { iniciaisDoNome } from "@/lib/usuarioSessao";

const MEU_USUARIO_HREF = "/meu-usuario";
const MEU_PLANO_HREF = "/meu-plano";

type Props = {
  perfilCarregado?: boolean;
  compacto?: boolean;
  onNavigate?: () => void;
};

export function SidebarUserInfo({
  compacto = false,
  onNavigate,
}: Props) {
  const perfil = usePerfilSessao();

  const nome = perfil?.nome ?? "Usuário";
  const iniciais = iniciaisDoNome(perfil?.nome);

  const avatarInner = (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-semibold tracking-tight text-white ring-2 ring-brand-orange ring-offset-2 ring-offset-slate-50 transition hover:brightness-110 dark:ring-offset-panel-sidebar"
      title={`Editar perfil — ${nome}`}
    >
      {iniciais}
    </div>
  );

  const avatar = (
    <Link
      href={MEU_USUARIO_HREF}
      onClick={() => onNavigate?.()}
      className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
      aria-label={`Meu usuário — ${nome}`}
    >
      {avatarInner}
    </Link>
  );

  if (compacto) {
    return (
      <div className="mt-auto flex shrink-0 justify-center border-t border-slate-200 bg-slate-50 px-2 py-3 dark:border-panel-border dark:bg-panel-sidebar">
        {avatar}
      </div>
    );
  }

  const cadastrados = perfil?.monitoramentosCadastrados ?? 0;
  const limitePlano = perfil?.planoQuantidadeMonitoramento;
  const extras = perfil?.quantidadeMonitoramentoAdicional ?? 0;
  const limiteTotal =
    limitePlano != null ? limitePlano + extras : null;

  return (
    <div className="mt-auto shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-600 dark:border-panel-border dark:bg-panel-sidebar dark:text-panel-muted">
      <div className="mb-3 flex justify-center">{avatar}</div>
      <Link
        href={MEU_USUARIO_HREF}
        onClick={() => onNavigate?.()}
        className="font-semibold text-slate-900 hover:text-brand-orange hover:underline dark:text-white dark:hover:text-brand-orange"
      >
        {nome}
      </Link>
      {perfil?.planoNome && (
        <p className="mt-1">
          <span className="font-semibold text-slate-700 dark:text-panel-muted">
            Plano{" "}
          </span>
          <Link
            href={MEU_PLANO_HREF}
            onClick={() => onNavigate?.()}
            className="font-semibold text-brand-orange hover:underline"
          >
            {perfil.planoNome}
          </Link>
        </p>
      )}
      <p className="mt-1">
        Monitoramentos {cadastrados}
        {limiteTotal != null ? ` / ${limiteTotal}` : " / sem limite"}
      </p>
    </div>
  );
}
