"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { usePerfilSessao } from "@/hooks/usePerfilSessao";
import {
  urlCadastroRenovarPlanoAtual,
  urlCadastroVerPlanos,
} from "@/lib/cadastroWizard";
import { planoEstaAtivo } from "@/lib/usuarioSessao";

type Props = {
  perfilCarregado?: boolean;
};

export function PlanoInativoBanner({ perfilCarregado: _perfilCarregado }: Props) {
  const perfil = usePerfilSessao();
  const ativo = planoEstaAtivo(perfil);
  const podeRenovarPlanoAtual =
    perfil?.planoId != null && perfil?.periodoId != null;

  if (ativo || perfil === null) {
    return null;
  }

  return (
    <div
      className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-800/60 dark:bg-red-950/35 dark:text-red-100"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-red-950 dark:text-red-50">
          Plano inativo ou expirado
        </p>
        <p className="mt-1 text-sm text-red-800 dark:text-red-200/90">
          Renove sua assinatura para continuar monitorando processos.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={urlCadastroVerPlanos()}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus-visible:ring-offset-red-950"
          >
            Ver planos
          </Link>
          {podeRenovarPlanoAtual && (
            <Link
              href={urlCadastroRenovarPlanoAtual()}
              className="inline-flex items-center justify-center rounded-lg border-2 border-emerald-700 bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 hover:border-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 dark:focus-visible:ring-offset-red-950"
            >
              Renovar plano atual
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
