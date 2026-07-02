"use client";

type Props = {
  emProgresso: boolean;
  percentual: number | null;
  compacto?: boolean;
};

export function MonitoramentoProgressoImportacao({
  emProgresso,
  percentual,
  compacto = false,
}: Props) {
  if (!emProgresso) {
    return compacto ? null : <span className="text-slate-400 dark:text-panel-muted">—</span>;
  }

  const larguraBarra = percentual != null ? `${percentual}%` : "35%";

  return (
    <div className={compacto ? "min-w-[7rem]" : "min-w-[10rem]"}>
      <div className="flex items-center gap-2">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-panel-menu"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentual ?? undefined}
          aria-label="Progresso da importação"
        >
          <div
            className={`h-full rounded-full bg-brand-orange transition-all duration-500 ${
              percentual == null ? "animate-pulse" : ""
            }`}
            style={{ width: larguraBarra }}
          />
        </div>
        <span className="w-9 shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-200">
          {percentual != null ? `${percentual}%` : "…"}
        </span>
      </div>
      {!compacto && (
        <p className="mt-1 text-xs text-slate-500 dark:text-panel-muted">Importando…</p>
      )}
    </div>
  );
}
