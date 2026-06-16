"use client";

import { LayoutGrid, Table } from "lucide-react";
import type { VisualizacaoProcessos } from "@/lib/visualizacaoProcessos";

type VisualizacaoProcessosToggleProps = {
  valor: VisualizacaoProcessos;
  onChange: (valor: VisualizacaoProcessos) => void;
};

const botaoBase =
  "rounded-md p-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-orange";

export function VisualizacaoProcessosToggle({
  valor,
  onChange,
}: VisualizacaoProcessosToggleProps) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1 dark:border-panel-border dark:bg-panel-menu"
      role="group"
      aria-label="Visualização da listagem"
    >
      <button
        type="button"
        onClick={() => onChange("cards")}
        title="Exibir como cards"
        aria-label="Exibir como cards"
        aria-pressed={valor === "cards"}
        className={`${botaoBase} ${
          valor === "cards"
            ? "bg-brand-orange text-white"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-panel-sidebar"
        }`}
      >
        <LayoutGrid className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onChange("tabela")}
        title="Exibir como tabela"
        aria-label="Exibir como tabela"
        aria-pressed={valor === "tabela"}
        className={`${botaoBase} ${
          valor === "tabela"
            ? "bg-brand-orange text-white"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-panel-sidebar"
        }`}
      >
        <Table className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
