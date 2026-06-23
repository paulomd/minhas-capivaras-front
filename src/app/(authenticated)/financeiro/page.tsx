"use client";

import { useCallback, useEffect, useState } from "react";
import { PaginacaoLista } from "@/components/ui/PaginacaoLista";
import { apiFetch } from "@/lib/apiFetch";
import { formatarDataHora, formatarMoeda } from "@/lib/format";
import type { PixHistoricoItem, PixHistoricoPaginado } from "@/types/pix";

const TAMANHO_PAGINA_PADRAO = 10;

function montarQueryHistorico(pagina: number, tamanho: number): string {
  const params = new URLSearchParams();
  params.set("page", String(pagina));
  params.set("size", String(tamanho));
  return `?${params.toString()}`;
}

export default function FinanceiroPage() {
  const [pagamentos, setPagamentos] = useState<PixHistoricoItem[]>([]);
  const [totalPagamentos, setTotalPagamentos] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(TAMANHO_PAGINA_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async (paginaBusca: number, tamanhoBusca: number) => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await apiFetch<PixHistoricoPaginado>(
        `/pix/historico${montarQueryHistorico(paginaBusca, tamanhoBusca)}`,
        { auth: true },
      );
      setPagamentos(Array.isArray(dados.content) ? dados.content : []);
      setTotalPagamentos(dados.total ?? 0);
      setPagina(dados.page ?? paginaBusca);
      setTamanhoPagina(dados.size ?? tamanhoBusca);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar histórico.");
      setPagamentos([]);
      setTotalPagamentos(0);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar(pagina, tamanhoPagina);
  }, [carregar, pagina, tamanhoPagina]);

  const totalPaginas = Math.max(1, Math.ceil(totalPagamentos / tamanhoPagina));

  const propsPaginacao = {
    pagina,
    totalPaginas,
    totalRegistros: totalPagamentos,
    tamanhoPagina,
    onPaginaChange: setPagina,
    onTamanhoPaginaChange: (tamanho: number) => {
      setPagina(1);
      setTamanhoPagina(tamanho);
    },
    carregando,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Histórico financeiro
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-panel-muted">
          Acompanhe os pagamentos já realizados da sua assinatura.
        </p>
      </div>

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
          {erro}
        </div>
      )}

      {carregando && pagamentos.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-panel-muted">Carregando…</p>
      ) : totalPagamentos === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-panel-border dark:bg-panel-card dark:text-panel-muted">
          Nenhum pagamento encontrado.
        </p>
      ) : (
        <>
          <PaginacaoLista {...propsPaginacao} />

          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block dark:border-panel-border dark:bg-panel-card">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600 dark:bg-panel-sidebar dark:text-panel-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Data/Hora</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-panel-border dark:text-white">
                {pagamentos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-panel-menu">
                    <td className="px-4 py-3">
                      {formatarDataHora(p.dataHoraPagamento, { origemUtc: true })}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatarMoeda(p.valor)}
                    </td>
                    <td className="px-4 py-3">{p.descricao ?? "-"}</td>
                    <td className="px-4 py-3">PIX</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {pagamentos.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-panel-border dark:bg-panel-card dark:text-white"
              >
                <p className="font-semibold text-brand-orange">
                  {formatarMoeda(p.valor)}
                </p>
                <p className="mt-1 text-slate-600 dark:text-panel-muted">
                  {formatarDataHora(p.dataHoraPagamento, { origemUtc: true })}
                </p>
                <p className="mt-1 text-slate-700 dark:text-white">{p.descricao ?? "-"}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-panel-muted">
                  PIX · {p.tipo}
                </p>
              </div>
            ))}
          </div>

          <PaginacaoLista {...propsPaginacao} />
        </>
      )}
    </div>
  );
}
