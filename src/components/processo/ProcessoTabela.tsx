"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileSearch } from "lucide-react";
import { ProcessoAcoes } from "@/components/processo/ProcessoAcoes";
import { linhasTexto } from "@/components/processo/PartesAdvogados";
import { formatarData } from "@/lib/format";
import type { Processo } from "@/types/processo";

function resumoLista(itens: string[], maximo = 2): string {
  if (itens.length === 0) return "-";
  const exibidos = itens.slice(0, maximo).join("; ");
  const restantes = itens.length - maximo;
  return restantes > 0 ? `${exibidos} (+${restantes})` : exibidos;
}

type ProcessoTabelaProps = {
  processos: Processo[];
  onStatusAlterado: () => void;
};

export function ProcessoTabela({ processos, onStatusAlterado }: ProcessoTabelaProps) {
  const router = useRouter();

  const abrirDetalhe = (processoId: number) => {
    router.push(`/processos/${processoId}`);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-panel-border dark:bg-panel-card">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600 dark:bg-panel-sidebar dark:text-panel-muted">
          <tr>
            <th className="px-3 py-2.5 font-medium">Ações</th>
            <th className="px-3 py-2.5 font-medium">Tribunal</th>
            <th className="px-3 py-2.5 font-medium">Processo</th>
            <th className="px-3 py-2.5 font-medium">Comunicações</th>
            <th className="px-3 py-2.5 font-medium">Última em</th>
            <th className="px-3 py-2.5 font-medium">Partes</th>
            <th className="px-3 py-2.5 font-medium">Advogados</th>
          </tr>
        </thead>
        <tbody className="dark:text-white">
          {processos.map((processo, indice) => {
            const partes = linhasTexto(processo.partes);
            const advogados = linhasTexto(processo.advogados);
            const status = processo.status ?? "ATIVO";
            const zebrado = indice % 2 === 1;

            return (
              <tr
                key={processo.processoId}
                className={`cursor-pointer transition-colors ${
                  zebrado
                    ? "bg-slate-100 dark:bg-panel-menu"
                    : "bg-white dark:bg-panel-card"
                } hover:bg-slate-200/70 dark:hover:bg-panel-sidebar`}
                onClick={() => abrirDetalhe(processo.processoId)}
              >
                <td
                  className="px-3 py-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-0.5">
                    <Link
                      href={`/processos/${processo.processoId}`}
                      className="group relative rounded-lg p-1.5 text-brand-orange transition hover:bg-brand-orange/10"
                      aria-label="Detalhar processo"
                    >
                      <FileSearch className="h-4 w-4" strokeWidth={2} aria-hidden />
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
                </td>
                <td className="px-3 py-2.5">
                  {processo.siglaTribunal ? (
                    <span className="rounded-md bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">
                      {processo.siglaTribunal}
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-panel-muted">-</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span className="font-medium text-slate-800 dark:text-white">
                    {processo.numeroProcesso}
                  </span>
                  {processo.nomeClasse && (
                    <span className="mt-0.5 block text-slate-600 dark:text-panel-muted">
                      {processo.nomeClasse}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5">{processo.comunicacoes ?? 0}</td>
                <td className="px-3 py-2.5">
                  {formatarData(processo.dataUltimaComunicacao)}
                </td>
                <td className="max-w-[12rem] px-3 py-2.5 text-slate-700 dark:text-slate-200">
                  <span className="line-clamp-2">{resumoLista(partes)}</span>
                </td>
                <td className="max-w-[12rem] px-3 py-2.5 text-slate-700 dark:text-slate-200">
                  <span className="line-clamp-2">{resumoLista(advogados)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
