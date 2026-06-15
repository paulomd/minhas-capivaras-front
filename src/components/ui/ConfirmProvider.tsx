"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm deve ser usado dentro de ConfirmProvider");
  }
  return ctx;
}

type DialogState = {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialog({ options, resolve });
    });
  }, []);

  const fechar = useCallback((result: boolean) => {
    setDialog((atual) => {
      if (atual) atual.resolve(result);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!dialog) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dialog, fechar]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const titulo = dialog?.options.title ?? "Confirmar";
  const confirmLabel = dialog?.options.confirmLabel ?? "Confirmar";
  const cancelLabel = dialog?.options.cancelLabel ?? "Cancelar";
  const variant = dialog?.options.variant ?? "default";

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {dialog && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => fechar(false)}
        >
          <article
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-titulo"
            aria-describedby="confirm-dialog-mensagem"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-panel-border dark:bg-panel-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="confirm-dialog-titulo"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              {titulo}
            </h2>
            <p
              id="confirm-dialog-mensagem"
              className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-panel-muted"
            >
              {dialog.options.message}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => fechar(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-panel-border dark:text-slate-200 dark:hover:bg-panel-menu"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => fechar(true)}
                className={
                  variant === "danger"
                    ? "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    : "rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                }
              >
                {confirmLabel}
              </button>
            </div>
          </article>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
