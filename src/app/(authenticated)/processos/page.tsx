"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, FileSearch, Filter, X } from "lucide-react";
import { ProcessoAcoes } from "@/components/processo/ProcessoAcoes";
import { linhasTexto, PartesAdvogados } from "@/components/processo/PartesAdvogados";
import { apiFetch } from "@/lib/apiFetch";
import { formatarData } from "@/lib/format";
import type { Processo, StatusProcesso } from "@/types/processo";
import type { TribunalPje } from "@/types/tribunal";

type FiltrosProcesso = {
  tribunal: string;
  dataInicio: string;
  dataFim: string;
  texto: string;
  status: StatusProcesso;
};

const FILTROS_PADRAO: FiltrosProcesso = {
  tribunal: "",
  dataInicio: "",
  dataFim: "",
  texto: "",
  status: "ATIVO",
};

function montarQueryFiltros(filtros: FiltrosProcesso): string {
  const params = new URLSearchParams();
  if (filtros.tribunal) params.set("tribunal", filtros.tribunal);
  if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
  if (filtros.dataFim) params.set("dataFim", filtros.dataFim);
  if (filtros.texto.trim()) params.set("texto", filtros.texto.trim());
  params.set("status", filtros.status);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function ProcessoCard({
  processo,
  onStatusAlterado,
}: {
  processo: Processo;
  onStatusAlterado: () => void;
}) {
  const partes = linhasTexto(processo.partes);
  const advogados = linhasTexto(processo.advogados);
  const status = processo.status ?? "ATIVO";

  return (
    <article
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-md dark:border-panel-border dark:bg-panel-card dark:shadow-black/20 dark:hover:border-brand-orange/50"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5">
          <Link
            href={`/processos/${processo.processoId}`}
            className="group relative rounded-lg p-2 text-brand-orange transition hover:bg-brand-orange/10"
            aria-label="Detalhar processo"
          >
            <FileSearch className="h-5 w-5" strokeWidth={2} aria-hidden />
            <span
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-slate-700"
            >
              Detalhar
            </span>
          </Link>
          <ProcessoAcoes
            processoId={processo.processoId}
            status={status}
            onAlterado={onStatusAlterado}
          />
        </div>
        {processo.siglaTribunal && (
          <span className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-bold text-black">
            {processo.siglaTribunal}
          </span>
        )}
      </div>

      <Link
        href={`/processos/${processo.processoId}`}
        className="flex flex-1 flex-col"
      >
        <div className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          <p>
            <strong className="text-slate-900 dark:text-white">Processo:</strong>
            <br />
            {processo.numeroProcesso}
            {processo.nomeClasse && (
              <>
                <br />
                {processo.nomeClasse}
              </>
            )}
          </p>

          <p>
            <strong className="text-slate-900 dark:text-white">Comunicações:</strong>{" "}
            {processo.comunicacoes ?? 0}
          </p>

          <p>
            <strong className="text-slate-900 dark:text-white">Última em:</strong>{" "}
            {formatarData(processo.dataUltimaComunicacao)}
          </p>
        </div>

        <div className="mt-4">
          <PartesAdvogados partes={partes} advogados={advogados} limite={3} />
        </div>
      </Link>
    </article>
  );
}

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [tribunais, setTribunais] = useState<TribunalPje[]>([]);
  const [filtros, setFiltros] = useState<FiltrosProcesso>(FILTROS_PADRAO);
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosProcesso>(FILTROS_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [carregandoTribunais, setCarregandoTribunais] = useState(true);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarProcessos = useCallback(async (filtrosBusca: FiltrosProcesso) => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await apiFetch<Processo[]>(
        `/processos${montarQueryFiltros(filtrosBusca)}`,
        { auth: true },
      );
      setProcessos(Array.isArray(dados) ? dados : []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar processos.");
      setProcessos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const dados = await apiFetch<TribunalPje[]>("/processos/tribunais", { auth: true });
        setTribunais(Array.isArray(dados) ? dados : []);
      } catch {
        setTribunais([]);
      } finally {
        setCarregandoTribunais(false);
      }
    })();
  }, []);

  useEffect(() => {
    carregarProcessos(filtrosAplicados);
  }, [carregarProcessos, filtrosAplicados]);

  const aplicarFiltros = () => {
    setFiltrosAplicados({ ...filtros });
  };

  const limparFiltros = () => {
    setFiltros(FILTROS_PADRAO);
    setFiltrosAplicados(FILTROS_PADRAO);
  };

  const temFiltrosPendentes =
    filtros.tribunal !== filtrosAplicados.tribunal ||
    filtros.dataInicio !== filtrosAplicados.dataInicio ||
    filtros.dataFim !== filtrosAplicados.dataFim ||
    filtros.texto !== filtrosAplicados.texto ||
    filtros.status !== filtrosAplicados.status;

  const temFiltrosAtivos =
    filtrosAplicados.tribunal ||
    filtrosAplicados.dataInicio ||
    filtrosAplicados.dataFim ||
    filtrosAplicados.texto.trim() ||
    filtrosAplicados.status !== "ATIVO";

  const textoQuantidadeRegistros = carregando
    ? "Carregando processos…"
    : processos.length === 1
      ? "1 processo encontrado"
      : `${processos.length} processos encontrados`;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold uppercase text-brand-orange">
          Processos
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-panel-muted">
          <strong className="font-semibold text-slate-800 dark:text-slate-200">
            Mais controle, menos surpresas.
          </strong>{" "}
          Todos os processos relacionados aos documentos monitorados estão aqui —
          com detalhes, movimentações e atualizações constantes.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-panel-border dark:bg-panel-card">
        <button
          type="button"
          onClick={() => setFiltrosAbertos((aberto) => !aberto)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-slate-900 dark:text-white"
          aria-expanded={filtrosAbertos}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 shrink-0 text-brand-orange" strokeWidth={2} />
            <h2 className="font-semibold">Filtros</h2>
            {temFiltrosAtivos && (
              <span className="rounded-full bg-brand-orange/15 px-2 py-0.5 text-xs font-medium text-brand-orange">
                ativos
              </span>
            )}
          </div>
          <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-panel-muted">
            {filtrosAbertos ? "Ocultar" : "Mostrar"}
            {filtrosAbertos ? (
              <ChevronUp className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden />
            )}
          </span>
        </button>

        {filtrosAbertos && (
          <div className="border-t border-slate-200 px-4 pb-4 pt-4 dark:border-panel-border">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  status: e.target.value as StatusProcesso,
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-panel-border dark:bg-panel-menu dark:text-white"
            >
              <option value="ATIVO">Ativo</option>
              <option value="ARQUIVADO">Arquivado</option>
              <option value="EXCLUIDO">Excluído</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
              Tribunal
            </label>
            <select
              value={filtros.tribunal}
              onChange={(e) => setFiltros((f) => ({ ...f, tribunal: e.target.value }))}
              disabled={carregandoTribunais}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-panel-border dark:bg-panel-menu dark:text-white"
            >
              <option value="">Todos</option>
              {tribunais.map((t) => (
                <option key={t.sigla} value={t.sigla}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
              Última comunicação (início)
            </label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros((f) => ({ ...f, dataInicio: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-panel-border dark:bg-panel-menu dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
              Última comunicação (fim)
            </label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros((f) => ({ ...f, dataFim: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-panel-border dark:bg-panel-menu dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
              Filtro
            </label>
            <input
              type="search"
              value={filtros.texto}
              onChange={(e) => setFiltros((f) => ({ ...f, texto: e.target.value }))}
              placeholder="Processo, conteúdo, advogado ou parte"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-panel-border dark:bg-panel-menu dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={aplicarFiltros}
            disabled={carregando || !temFiltrosPendentes}
            className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Filtrar
          </button>
          {temFiltrosAtivos && (
            <button
              type="button"
              onClick={limparFiltros}
              disabled={carregando}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-panel-border dark:text-slate-200 dark:hover:bg-panel-menu"
            >
              <X className="h-4 w-4" />
              Limpar filtros
            </button>
          )}
        </div>
          </div>
        )}
      </section>

      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {textoQuantidadeRegistros}
      </p>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
          {erro}
        </div>
      )}

      {!carregando && processos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-panel-border dark:bg-panel-card dark:text-panel-muted">
          {temFiltrosAtivos
            ? "Nenhum processo encontrado com os filtros aplicados."
            : "Nenhum processo encontrado!"}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {processos.map((p) => (
            <ProcessoCard
              key={p.processoId}
              processo={p}
              onStatusAlterado={() => carregarProcessos(filtrosAplicados)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
