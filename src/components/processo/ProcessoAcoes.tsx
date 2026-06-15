"use client";

import type { LucideIcon } from "lucide-react";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { useAppMessage } from "@/components/layout/AppMessageProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { apiFetch } from "@/lib/apiFetch";
import type { StatusProcesso } from "@/types/processo";

type ProcessoAcoesProps = {
  processoId: number;
  status: StatusProcesso;
  onAlterado?: () => void;
  className?: string;
};

type AcaoProcesso = "arquivar" | "reativar" | "remover";

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
      className={`group relative rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-panel-menu ${className ?? ""}`}
    >
      <Icone className="h-5 w-5" strokeWidth={2} aria-hidden />
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-slate-700"
      >
        {label}
      </span>
    </button>
  );
}

export function ProcessoAcoes({
  processoId,
  status,
  onAlterado,
  className = "",
}: ProcessoAcoesProps) {
  const { confirm } = useConfirm();
  const { mostrarMensagem } = useAppMessage();
  const podeArquivar = status === "ATIVO";
  const podeReativar = status === "ARQUIVADO";
  const podeRemover = status === "ATIVO" || status === "ARQUIVADO";

  if (!podeArquivar && !podeReativar && !podeRemover) return null;

  const executar = async (acao: AcaoProcesso) => {
    const confirmado = await confirm(
      acao === "arquivar"
        ? {
            title: "Arquivar processo",
            message: "Arquivar este processo?",
            confirmLabel: "Arquivar",
            cancelLabel: "Cancelar",
          }
        : acao === "reativar"
          ? {
              title: "Reativar processo",
              message: "Reativar este processo arquivado?",
              confirmLabel: "Reativar",
              cancelLabel: "Cancelar",
            }
          : {
              title: "Remover processo",
              message: "Remover este processo? Esta ação não pode ser desfeita.",
              confirmLabel: "Remover",
              cancelLabel: "Cancelar",
              variant: "danger",
            },
    );
    if (!confirmado) return;

    try {
      await apiFetch(`/processos/${processoId}/${acao}`, {
        method: "PATCH",
        auth: true,
      });
      onAlterado?.();
    } catch (e) {
      const mensagem =
        e instanceof Error ? e.message : "Não foi possível atualizar o processo.";
      mostrarMensagem(mensagem);
    }
  };

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {podeArquivar && (
        <BotaoIcone
          label="Arquivar"
          icone={Archive}
          onClick={() => executar("arquivar")}
          className="text-slate-600 dark:text-slate-300"
        />
      )}
      {podeReativar && (
        <BotaoIcone
          label="Reativar"
          icone={ArchiveRestore}
          onClick={() => executar("reativar")}
          className="text-brand-orange"
        />
      )}
      {podeRemover && (
        <BotaoIcone
          label="Remover"
          icone={Trash2}
          onClick={() => executar("remover")}
          className="text-red-600 dark:text-red-400"
        />
      )}
    </div>
  );
}
