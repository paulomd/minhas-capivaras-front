"use client";



import { useEffect, useState } from "react";

import Link from "next/link";

import { Search, FileText, AlertCircle } from "lucide-react";

import { obterPerfilSessao } from "@/lib/usuarioSessao";

import { formatarData } from "@/lib/format";



export default function InicioPage() {

  const [nome, setNome] = useState("Usuário");

  const [planoAtivo, setPlanoAtivo] = useState<boolean | null>(null);

  const [planoNome, setPlanoNome] = useState<string | null>(null);

  const [dataFinal, setDataFinal] = useState<string | null>(null);



  useEffect(() => {

    const perfil = obterPerfilSessao();

    if (perfil) {

      setNome(perfil.nome);

      setPlanoAtivo(perfil.planoAtivo);

      setPlanoNome(perfil.planoNome);

      setDataFinal(perfil.dataFinalPlano);

    }

  }, []);



  return (

    <div className="space-y-8">

      <section>

        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">

          Olá, <span className="text-brand-orange">{nome}</span>

        </h1>

        <p className="mt-1 text-slate-600 dark:text-panel-muted">

          Saiba se você foi processado(a) antes mesmo de ser intimado(a)

        </p>

      </section>



      {planoAtivo === false && (

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-200">

          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>

            <p className="font-semibold">Plano inativo ou expirado</p>

            <p className="mt-1 text-sm">

              Renove sua assinatura para continuar monitorando processos.{" "}

              <Link href="/cadastro" className="underline">

                Ver planos

              </Link>

            </p>

          </div>

        </div>

      )}



      {planoAtivo && planoNome && (

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/30">

          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">

            Plano <strong>{planoNome}</strong> ativo

            {dataFinal && (

              <> até {formatarData(dataFinal)}</>

            )}

          </p>

        </div>

      )}



      <section className="grid gap-4 sm:grid-cols-2">

        <Link

          href="/monitoramentos"

          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-orange/40 hover:shadow-md dark:border-panel-border dark:bg-panel-card dark:hover:border-brand-orange/60"

        >

          <Search className="h-8 w-8 text-brand-orange" />

          <h2 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-brand-orange dark:text-white">

            Monitoramento Processual 24h

          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-panel-muted">

            Descubra novos processos contra um CPF, CNPJ ou OAB em tempo real.

          </p>

        </Link>



        <Link

          href="/processos"

          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-orange/40 hover:shadow-md dark:border-panel-border dark:bg-panel-card dark:hover:border-brand-blue/60"

        >

          <FileText className="h-8 w-8 text-brand-blue" />

          <h2 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-brand-blue dark:text-white">

            Histórico Processual

          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-panel-muted">

            Conheça o histórico completo de processos vinculados aos seus

            monitoramentos.

          </p>

        </Link>

      </section>

    </div>

  );

}


