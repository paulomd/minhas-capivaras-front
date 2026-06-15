"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { apiFetch } from "@/lib/apiFetch";
import { formatarMoeda } from "@/lib/format";
import { corCabecalhoPlano } from "@/lib/planoCores";
import { PlanoBeneficios } from "@/components/planos/PlanoBeneficios";
import type { Plano } from "@/types/plano";

function PlanoCard({ plano }: { plano: Plano }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-lg">
      <h3
        className="px-4 py-2 text-center text-sm font-semibold uppercase text-white"
        style={{ backgroundColor: corCabecalhoPlano(plano.nome) }}
      >
        {plano.nome}
      </h3>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-3xl font-bold text-emerald-400">
          {formatarMoeda(plano.valorBase)}
          {plano.valorBase > 0 && (
            <span className="text-sm font-normal text-slate-400">/mês</span>
          )}
        </p>
        <PlanoBeneficios
          plano={plano}
          className="mt-4 flex-1 text-slate-300 [&_svg]:text-brand-orange"
        />
        <Link
          href="/cadastro"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#0077aa] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#005577]"
        >
          Quero este
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const dados = await apiFetch<Plano[]>("/planos");
        setPlanos(Array.isArray(dados) ? dados : []);
      } catch {
        setPlanos([]);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  return (
    <main className="pagina-publica min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Logo href="/" size="sm" priority />
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#como-funciona" className="hover:text-white transition">
              Como funciona
            </a>
            <a href="#planos" className="hover:text-white transition">
              Planos
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/cadastro"
              className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 transition"
            >
              Criar conta
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-900 transition"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-blue/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-orange/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Monitoramento inteligente de{" "}
            <span className="text-brand-orange">processos jurídicos</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Receba atualizações automáticas sobre seus processos de forma simples
            e eficiente. Pare de procurar, comece a monitorar!
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cadastro"
              className="rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-orange-500 transition"
            >
              Experimente agora
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium hover:bg-slate-900 transition"
            >
              Acessar painel
            </Link>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold sm:text-3xl">Como funciona</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                titulo: "Cadastre seus monitoramentos",
                texto:
                  "Informe OAB, CPF/CNPJ ou um filtro específico que deseja monitorar.",
              },
              {
                titulo: "Nós fazemos o monitoramento",
                texto:
                  "Verificamos atualizações de processos automaticamente, todos os dias.",
              },
              {
                titulo: "Receba notificações",
                texto:
                  "Você é avisado por e-mail ou WhatsApp quando houver movimentações.",
              },
            ].map((etapa) => (
              <div
                key={etapa.titulo}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
              >
                <h3 className="font-semibold text-brand-orange">
                  {etapa.titulo}
                </h3>
                <p className="mt-2 text-sm text-slate-300">{etapa.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Escolha o plano ideal
          </h2>
          {carregando && (
            <p className="mt-6 text-sm text-slate-400">Carregando planos…</p>
          )}
          {!carregando && planos.length === 0 && (
            <p className="mt-6 text-sm text-slate-400">
              Planos indisponíveis no momento.
            </p>
          )}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {planos.map((plano) => (
              <PlanoCard key={plano.id} plano={plano} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Minhas Capivaras
      </footer>
    </main>
  );
}
