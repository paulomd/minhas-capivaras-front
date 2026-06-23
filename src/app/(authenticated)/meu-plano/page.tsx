"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PlanoBeneficios } from "@/components/planos/PlanoBeneficios";
import { apiFetch } from "@/lib/apiFetch";
import { corCabecalhoPlano } from "@/lib/planoCores";
import { formatarData, formatarMoeda } from "@/lib/format";
import {
  obterPerfilSessao,
  planoEstaAtivo,
  recarregarPerfilSessao,
  type UsuarioPerfilSessao,
} from "@/lib/usuarioSessao";
import type { Plano } from "@/types/plano";

function textoMonitoramentosPlano(limite: number | null | undefined): string {
  if (limite == null) return "Sem limite";
  if (limite === 1) return "1 monitoramento";
  return `${limite} monitoramentos`;
}

function calcularLimiteTotal(perfil: UsuarioPerfilSessao): string {
  const base = perfil.planoQuantidadeMonitoramento;
  if (base == null) return "Sem limite";
  const total = base + perfil.quantidadeMonitoramentoAdicional;
  return `${total} monitoramento${total === 1 ? "" : "s"}`;
}

function DetalheLinha({
  label,
  value,
  destaque,
}: {
  label: string;
  value: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between ${
        destaque
          ? "bg-amber-50 dark:bg-amber-950/30"
          : "bg-slate-50 dark:bg-panel-bg"
      }`}
    >
      <span className="text-sm font-medium text-slate-600 dark:text-panel-muted">
        {label}
      </span>
      <span
        className={`text-sm font-semibold ${
          destaque
            ? "text-amber-800 dark:text-amber-300"
            : "text-slate-900 dark:text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function MeuPlanoPage() {
  const [perfil, setPerfil] = useState<UsuarioPerfilSessao | null>(
    () => obterPerfilSessao(),
  );
  const [plano, setPlano] = useState<Plano | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    void (async () => {
      setCarregando(true);
      setErro(null);
      try {
        const perfilAtual =
          (await recarregarPerfilSessao()) ?? obterPerfilSessao();
        if (cancelado) return;
        setPerfil(perfilAtual);

        if (perfilAtual?.planoId) {
          const planos = await apiFetch<Plano[]>("/planos");
          if (cancelado) return;
          const encontrado = planos.find((p) => p.id === perfilAtual.planoId);
          setPlano(encontrado ?? null);
        } else {
          setPlano(null);
        }
      } catch (e) {
        if (!cancelado) {
          setErro(
            e instanceof Error ? e.message : "Erro ao carregar dados do plano.",
          );
        }
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  const ativo = planoEstaAtivo(perfil);
  const extras = perfil?.quantidadeMonitoramentoAdicional ?? 0;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold uppercase text-brand-orange">
          Meu Plano
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-panel-muted">
          Detalhes da sua assinatura e monitoramentos contratados.
        </p>
      </section>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
          {erro}
        </div>
      )}

      {carregando ? (
        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-panel-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando…
        </p>
      ) : !perfil?.planoId || !perfil.planoNome ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-panel-border dark:bg-panel-card">
          <p className="text-sm text-slate-600 dark:text-panel-muted">
            Você ainda não possui um plano associado.
          </p>
          <Link
            href="/cadastro"
            className="mt-4 inline-block text-sm font-semibold text-brand-orange hover:underline"
          >
            Escolher um plano
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-panel-border dark:bg-panel-card">
            <h2
              className="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white"
              style={{
                backgroundColor: corCabecalhoPlano(perfil.planoNome),
              }}
            >
              {perfil.planoNome}
            </h2>

            <div className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    ativo
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                  }`}
                >
                  {ativo ? "Plano ativo" : "Plano vencido"}
                </span>
                {plano && (
                  <span className="text-lg font-bold text-emerald-700">
                    {formatarMoeda(plano.valorBase)}
                  </span>
                )}
              </div>

              {plano?.descricao?.trim() && (
                <p className="text-sm text-slate-600 dark:text-panel-muted">
                  {plano.descricao}
                </p>
              )}

              <div className="space-y-2 rounded-lg border border-slate-100 p-3 dark:border-panel-border">
                <DetalheLinha
                  label="Período de assinatura"
                  value={perfil.periodoAssinatura ?? "—"}
                />
                <DetalheLinha
                  label="Início do plano"
                  value={
                    perfil.dataInicialPlano
                      ? formatarData(perfil.dataInicialPlano)
                      : "—"
                  }
                />
                <DetalheLinha
                  label="Validade"
                  value={
                    perfil.dataFinalPlano
                      ? formatarData(perfil.dataFinalPlano)
                      : "—"
                  }
                />
              </div>

              {plano && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Benefícios do plano
                  </h3>
                  <PlanoBeneficios plano={plano} />
                </div>
              )}

              {!ativo && (
                <Link
                  href="/cadastro?renovar=1"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500"
                >
                  Renovar plano
                </Link>
              )}
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-panel-border dark:bg-panel-card">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Monitoramentos
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-panel-muted">
              Uso e limites do seu plano atual.
            </p>

            <div className="mt-4 space-y-2">
              <DetalheLinha
                label="Incluídos no plano"
                value={textoMonitoramentosPlano(
                  perfil.planoQuantidadeMonitoramento,
                )}
              />
              <DetalheLinha
                label="Monitoramentos adicionais contratados"
                value={
                  extras > 0
                    ? `${extras} monitoramento${extras === 1 ? "" : "s"} extra${extras === 1 ? "" : "s"}`
                    : "Nenhum"
                }
                destaque={extras > 0}
              />
              <DetalheLinha
                label="Limite total"
                value={calcularLimiteTotal(perfil)}
              />
              <DetalheLinha
                label="Monitoramentos cadastrados"
                value={String(perfil.monitoramentosCadastrados ?? 0)}
              />
              {plano && plano.valorMonitoramentoExtra > 0 && (
                <DetalheLinha
                  label="Valor por monitoramento extra"
                  value={formatarMoeda(plano.valorMonitoramentoExtra)}
                />
              )}
            </div>

            {extras > 0 && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
                Você contratou{" "}
                <strong>
                  {extras} monitoramento{extras === 1 ? "" : "s"} adicional
                  {extras === 1 ? "" : "es"}
                </strong>{" "}
                além do limite do plano.
              </p>
            )}

            <Link
              href="/monitoramentos"
              className="mt-4 inline-block text-sm font-semibold text-brand-orange hover:underline"
            >
              Gerenciar monitoramentos
            </Link>
          </article>
        </div>
      )}
    </div>
  );
}
