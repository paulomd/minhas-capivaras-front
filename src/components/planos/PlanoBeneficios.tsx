import { Check } from "lucide-react";
import { formatarMoeda } from "@/lib/format";
import type { Plano } from "@/types/plano";

type Props = {
  plano: Plano;
  className?: string;
  compacto?: boolean;
  /** Lista com ✓ como no site PHP */
  marcadorCheck?: boolean;
};

export function PlanoBeneficios({
  plano,
  className = "",
  compacto = false,
  marcadorCheck = false,
}: Props) {
  const itens: string[] = [];

  if (plano.quantidadeMonitoramento === 1) {
    itens.push("1 Monitoramento incluído");
  } else if (
    plano.quantidadeMonitoramento != null &&
    plano.quantidadeMonitoramento > 1
  ) {
    itens.push(
      `${plano.quantidadeMonitoramento} Monitoramentos incluídos`,
    );
  } else if (plano.quantidadeMonitoramento == null) {
    itens.push("Sem limite de Monitoramentos");
  }

  if (plano.quantidadeNotificacoes == null) {
    itens.push("Sem limite de notificações");
  } else if (plano.quantidadeNotificacoes === 1) {
    itens.push("1 Notificação mensal por monitoramento");
  } else if (plano.quantidadeNotificacoes > 1) {
    itens.push(
      `${plano.quantidadeNotificacoes} Notificações mensais por monitoramento`,
    );
  }

  if (plano.valorMonitoramentoExtra > 0) {
    itens.push(
      `${formatarMoeda(plano.valorMonitoramentoExtra)} Por monitoramento extra`,
    );
  }

  if (plano.valorBase === 0) {
    itens.push("Sem suporte");
    itens.push("Válido por 60 dias");
  }

  return (
    <ul
      className={
        marcadorCheck
          ? className
          : `text-left text-slate-600 ${
              compacto ? "space-y-0.5 text-xs" : "space-y-1.5 text-sm"
            } ${className}`
      }
    >
      {itens.map((item) => (
        <li key={item} className={marcadorCheck ? "" : "flex items-start gap-1.5"}>
          {marcadorCheck ? (
            <>✓ {item}</>
          ) : (
            <>
              <Check
                className={`shrink-0 text-emerald-600 ${
                  compacto ? "mt-0.5 h-3 w-3" : "mt-0.5 h-4 w-4"
                }`}
              />
              <span>{item}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
