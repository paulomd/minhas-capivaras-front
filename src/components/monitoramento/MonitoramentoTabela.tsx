"use client";

import { MonitoramentoAcoes } from "@/components/monitoramento/MonitoramentoAcoes";
import { MonitoramentoProgressoImportacao } from "@/components/monitoramento/MonitoramentoProgressoImportacao";
import { formatarData } from "@/lib/format";
import type { Monitoramento, TipoDocumento } from "@/types/monitoramento";

const LABEL_TIPO: Record<TipoDocumento, string> = {
  OAB: "OAB",
  CPF: "CPF",
  CNPJ: "CNPJ",
  TEXTO: "Texto / Filtro",
};

function valorFiltro(monitoramento: Monitoramento): string {
  const { documento, tipoDocumento, ufDocumento } = monitoramento;
  if (tipoDocumento === "OAB" && ufDocumento) {
    return `${documento} / ${ufDocumento}`;
  }
  return documento;
}

type MonitoramentoTabelaProps = {
  monitoramentos: Monitoramento[];
  onEditar: (monitoramento: Monitoramento) => void;
  onRemover: (id: number) => void;
};

export function MonitoramentoTabela({
  monitoramentos,
  onEditar,
  onRemover,
}: MonitoramentoTabelaProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-panel-border dark:bg-panel-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] text-sm">
          <thead className="bg-slate-50 text-left text-slate-600 dark:bg-panel-sidebar dark:text-panel-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">Ações</th>
              <th className="px-3 py-2.5 font-medium">Tipo</th>
              <th className="px-3 py-2.5 font-medium">Filtro</th>
              <th className="px-3 py-2.5 font-medium">Notificações</th>
              <th className="px-3 py-2.5 font-medium">E-mail</th>
              <th className="px-3 py-2.5 font-medium">Telefone</th>
              <th className="px-3 py-2.5 font-medium">Cadastrado em</th>
              <th className="px-3 py-2.5 font-medium">Última consulta</th>
            </tr>
          </thead>
          <tbody className="dark:text-white">
            {monitoramentos.map((monitoramento, indice) => {
              const zebrado = indice % 2 === 1;
              return (
                <tr
                  key={monitoramento.id}
                  className={
                    zebrado
                      ? "bg-slate-100 dark:bg-panel-menu"
                      : "bg-white dark:bg-panel-card"
                  }
                >
                  <td className="px-3 py-2.5">
                    <MonitoramentoAcoes
                      onEditar={() => onEditar(monitoramento)}
                      onRemover={() => void onRemover(monitoramento.id)}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-md bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">
                      {LABEL_TIPO[monitoramento.tipoDocumento]}
                    </span>
                  </td>
                  <td className="max-w-[14rem] px-3 py-2.5 font-medium text-slate-800 dark:text-white">
                    <span className="line-clamp-2 break-words">
                      {valorFiltro(monitoramento)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {monitoramento.quantidadeNotificada ?? 0}
                  </td>
                  <td className="max-w-[12rem] px-3 py-2.5 text-slate-700 dark:text-slate-200">
                    <span className="line-clamp-2 break-all">
                      {monitoramento.email ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">
                    {monitoramento.fone ?? "-"}
                  </td>
                  <td className="px-3 py-2.5">
                    {formatarData(monitoramento.dataCadastro)}
                  </td>
                  <td className="px-3 py-2.5">
                    {monitoramento.importacaoEmProgresso ? (
                      <MonitoramentoProgressoImportacao
                        emProgresso
                        percentual={monitoramento.progressoImportacaoPercentual}
                        compacto
                      />
                    ) : (
                      formatarData(monitoramento.dataUltimaConsulta)
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
