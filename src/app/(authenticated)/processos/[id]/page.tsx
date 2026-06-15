"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, X } from "lucide-react";
import { ProcessoAcoes } from "@/components/processo/ProcessoAcoes";
import {
  AdvogadosPartesDetalhe,
  linhasTexto,
  PartesAdvogados,
} from "@/components/processo/PartesAdvogados";
import { apiFetch } from "@/lib/apiFetch";
import { formatarData } from "@/lib/format";
import type { Comunicacao, ProcessoDetalhe } from "@/types/processo";

const TEXTO_LINHAS_MAX = 4;
const TEXTO_CHARS_MAX = 200;

function textoExcedeLimite(texto: string): boolean {
  const normalizado = texto.trim();
  if (normalizado.length > TEXTO_CHARS_MAX) return true;
  return normalizado.split("\n").filter((l) => l.trim()).length > TEXTO_LINHAS_MAX;
}

function ComunicacaoCabecalho({
  comunicacao,
  onExpandir,
}: {
  comunicacao: Comunicacao;
  onExpandir?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="rounded-lg p-2 text-brand-orange">
          <Mail className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <h3 className="font-semibold text-brand-orange">
            {formatarData(comunicacao.dataDisponibilizacao)}
            {comunicacao.tipoComunicacao ? ` - ${comunicacao.tipoComunicacao}` : ""}
          </h3>
        </div>
      </div>
      {comunicacao.link && (
        onExpandir ? (
          <button
            type="button"
            onClick={onExpandir}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline"
          >
            Abrir <ExternalLink className="h-3.5 w-3.5" />
          </button>
        ) : (
          <a
            href={comunicacao.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
          >
            Abrir no tribunal <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )
      )}
    </div>
  );
}

function ComunicacaoModal({
  comunicacao,
  onFechar,
}: {
  comunicacao: Comunicacao;
  onFechar: () => void;
}) {
  const partes = linhasTexto(comunicacao.partes);
  const advogados = linhasTexto(comunicacao.advogados);
  const texto = comunicacao.texto?.trim() ?? "";

  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/50 p-3 sm:p-4 md:p-6"
      role="presentation"
      onClick={onFechar}
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="comunicacao-modal-titulo"
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-panel-border dark:bg-panel-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 p-4 dark:border-panel-border sm:p-5">
          <div className="min-w-0 flex-1">
            <ComunicacaoCabecalho comunicacao={comunicacao} />
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-panel-muted dark:hover:bg-panel-menu"
            aria-label="Fechar comunicação"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="space-y-4">
            <div className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {comunicacao.nomeOrgao && (
                <p>
                  <strong className="text-slate-900 dark:text-white">Órgão:</strong>
                  <br />
                  {comunicacao.nomeOrgao}
                </p>
              )}
              {comunicacao.meioCompleto && (
                <p>
                  <strong className="text-slate-900 dark:text-white">Meio:</strong>
                  <br />
                  {comunicacao.meioCompleto}
                </p>
              )}
            </div>

            {texto && (
              <div>
                <h4
                  id="comunicacao-modal-titulo"
                  className="mb-2 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  Texto da comunicação
                </h4>
                <p className="whitespace-pre-wrap text-sm text-slate-800 dark:text-white">
                  {texto}
                </p>
              </div>
            )}

            <PartesAdvogados partes={partes} advogados={advogados} />
          </div>
        </div>
      </article>
    </div>
  );
}

function ComunicacaoCard({ comunicacao }: { comunicacao: Comunicacao }) {
  const [modalAberto, setModalAberto] = useState(false);
  const partes = linhasTexto(comunicacao.partes);
  const advogados = linhasTexto(comunicacao.advogados);
  const texto = comunicacao.texto?.trim() ?? "";
  const textoLongo = textoExcedeLimite(texto);
  const abrirModal = () => setModalAberto(true);

  return (
    <>
      <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-panel-border dark:bg-panel-card dark:shadow-black/20">
        <div className="mb-3 shrink-0">
          <ComunicacaoCabecalho comunicacao={comunicacao} onExpandir={abrirModal} />
        </div>

        <div className="shrink-0 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {comunicacao.nomeOrgao && (
            <p>
              <strong className="text-slate-900 dark:text-white">Órgão:</strong>
              <br />
              <span className="line-clamp-2">{comunicacao.nomeOrgao}</span>
            </p>
          )}
          {comunicacao.meioCompleto && (
            <p>
              <strong className="text-slate-900 dark:text-white">Meio:</strong>
              <br />
              <span className="line-clamp-2">{comunicacao.meioCompleto}</span>
            </p>
          )}
        </div>

        {texto && (
          <div className="mt-3 shrink-0">
            <p className="line-clamp-4 whitespace-pre-wrap text-sm text-slate-800 dark:text-white">
              {texto}
            </p>
            {textoLongo && (
              <button
                type="button"
                onClick={abrirModal}
                className="mt-2 text-sm font-medium text-brand-blue hover:underline"
              >
                Ver texto completo
              </button>
            )}
          </div>
        )}

        <div className="mt-4 shrink-0">
          <PartesAdvogados
            partes={partes}
            advogados={advogados}
            limite={3}
            onMaisClick={abrirModal}
          />
        </div>
      </article>

      {modalAberto && (
        <ComunicacaoModal
          comunicacao={comunicacao}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </>
  );
}

export default function ProcessoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [detalhe, setDetalhe] = useState<ProcessoDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const comunicacoesOrdenadas = useMemo(() => {
    if (!detalhe) return [];
    return [...detalhe.comunicacoes].sort((a, b) =>
      b.dataDisponibilizacao.localeCompare(a.dataDisponibilizacao),
    );
  }, [detalhe]);

  const carregarDetalhe = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await apiFetch<ProcessoDetalhe>(
        `/processos/${params.id}`,
        { auth: true },
      );
      setDetalhe(dados);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar processo.");
      setDetalhe(null);
    } finally {
      setCarregando(false);
    }
  }, [params.id]);

  useEffect(() => {
    carregarDetalhe();
  }, [carregarDetalhe]);

  const aposAlterarStatus = () => {
    router.push("/processos");
  };

  if (carregando) {
    return <p className="text-sm text-slate-500 dark:text-panel-muted">Carregando…</p>;
  }

  if (erro || !detalhe) {
    return (
      <div className="space-y-4">
        <Link
          href="/processos"
          className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <p className="text-red-600 dark:text-red-400">{erro ?? "Processo não encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/processos"
        className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar aos processos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {detalhe.numeroProcessoMascara ?? detalhe.numeroProcesso}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-panel-muted">
            {detalhe.siglaTribunal}
            {detalhe.nomeClasse ? ` · ${detalhe.nomeClasse}` : ""}
          </p>
        </div>
        <ProcessoAcoes
          processoId={detalhe.id}
          status={detalhe.status}
          onAlterado={aposAlterarStatus}
        />
      </div>

      <AdvogadosPartesDetalhe advogados={detalhe.advogados} partes={detalhe.partes} />

      <section>
        <h2 className="text-lg font-semibold uppercase text-brand-orange">
          Comunicações ({comunicacoesOrdenadas.length})
        </h2>
        {comunicacoesOrdenadas.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-panel-border dark:bg-panel-card dark:text-panel-muted">
            Nenhuma comunicação.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
            {comunicacoesOrdenadas.map((c) => (
              <ComunicacaoCard key={c.ids} comunicacao={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
