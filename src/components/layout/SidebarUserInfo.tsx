"use client";

import { useEffect, useState } from "react";
import {
  iniciaisDoNome,
  obterPerfilSessao,
  type UsuarioPerfilSessao,
} from "@/lib/usuarioSessao";

type Props = {
  perfilCarregado?: boolean;
  compacto?: boolean;
};

export function SidebarUserInfo({
  perfilCarregado = false,
  compacto = false,
}: Props) {
  const [perfil, setPerfil] = useState<UsuarioPerfilSessao | null>(null);

  useEffect(() => {
    setPerfil(obterPerfilSessao());
  }, [perfilCarregado]);

  const nome = perfil?.nome ?? "Usuário";
  const iniciais = iniciaisDoNome(perfil?.nome);

  const avatar = (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-semibold tracking-tight text-white ring-2 ring-brand-orange ring-offset-2 ring-offset-slate-50 dark:ring-offset-panel-sidebar"
      title={nome}
      aria-hidden={compacto ? undefined : true}
    >
      {iniciais}
    </div>
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
      <p className="font-semibold text-slate-900 dark:text-white">{nome}</p>
      {perfil?.planoNome && (
        <p className="mt-1">
          <span className="font-semibold text-slate-700 dark:text-panel-muted">
            Plano{" "}
          </span>
          {perfil.planoNome}
        </p>
      )}
      <p className="mt-1">
        Monitoramentos {cadastrados}
        {limiteTotal != null ? ` / ${limiteTotal}` : " / sem limite"}
      </p>
    </div>
  );
}
