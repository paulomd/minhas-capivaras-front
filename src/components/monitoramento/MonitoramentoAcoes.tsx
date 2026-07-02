"use client";

import type { LucideIcon } from "lucide-react";
import { Pencil, Trash2 } from "lucide-react";

function BotaoIcone({
  label,
  icone: Icone,
  onClick,
  className,
}: {
  label: string;
  icone: LucideIcon;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group relative rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-panel-menu ${className ?? ""}`}
    >
      <Icone className="h-4 w-4" strokeWidth={2} aria-hidden />
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-slate-700"
      >
        {label}
      </span>
    </button>
  );
}

type Props = {
  onEditar: () => void;
  onRemover: () => void;
  className?: string;
};

export function MonitoramentoAcoes({
  onEditar,
  onRemover,
  className = "",
}: Props) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <BotaoIcone
        label="Editar"
        icone={Pencil}
        onClick={onEditar}
        className="text-brand-orange"
      />
      <BotaoIcone
        label="Remover"
        icone={Trash2}
        onClick={onRemover}
        className="text-red-600 dark:text-red-400"
      />
    </div>
  );
}
