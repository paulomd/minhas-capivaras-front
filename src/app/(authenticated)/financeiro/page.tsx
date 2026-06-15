"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { formatarDataHora, formatarMoeda } from "@/lib/format";
import type { PixHistoricoItem } from "@/types/pix";

export default function FinanceiroPage() {
  const [pagamentos, setPagamentos] = useState<PixHistoricoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const dados = await apiFetch<PixHistoricoItem[]>("/pix/historico", {
          auth: true,
        });
        setPagamentos(Array.isArray(dados) ? dados : []);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao carregar histórico.");
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

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

      {carregando ? (
        <p className="text-sm text-slate-500 dark:text-panel-muted">Carregando…</p>
      ) : pagamentos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-panel-border dark:bg-panel-card dark:text-panel-muted">
          Nenhum pagamento encontrado.
        </p>
      ) : (
        <>
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
                <p className="mt-1 text-xs text-slate-500 dark:text-panel-muted">PIX · {p.tipo}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
