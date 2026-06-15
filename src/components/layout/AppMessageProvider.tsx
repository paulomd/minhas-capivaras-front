"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { APP_MESSAGE_EVENT, consumirMensagemApp } from "@/lib/appMessage";

type AppMessageContextValue = {
  mostrarMensagem: (text: string) => void;
};

const AppMessageContext = createContext<AppMessageContextValue | null>(null);

export function useAppMessage(): AppMessageContextValue {
  const ctx = useContext(AppMessageContext);
  if (!ctx) {
    throw new Error("useAppMessage deve ser usado dentro de AppMessageProvider");
  }
  return ctx;
}

export function AppMessageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);

  const fechar = useCallback(() => {
    setAberto(false);
    window.setTimeout(() => {
      setMensagem(null);
    }, 260);
  }, []);

  const mostrarMensagem = useCallback((text: string) => {
    setMensagem(text);
    setAberto(true);
  }, []);

  useEffect(() => {
    const pendente = consumirMensagemApp();
    if (pendente?.text) {
      mostrarMensagem(pendente.text);
    }
  }, [mostrarMensagem, pathname]);

  useEffect(() => {
    const aoReceberMensagem = () => {
      const pendente = consumirMensagemApp();
      if (pendente?.text) {
        mostrarMensagem(pendente.text);
      }
    };

    window.addEventListener(APP_MESSAGE_EVENT, aoReceberMensagem);
    return () => {
      window.removeEventListener(APP_MESSAGE_EVENT, aoReceberMensagem);
    };
  }, [mostrarMensagem]);

  useEffect(() => {
    if (!mensagem || !aberto) {
      return;
    }
    const timeout = window.setTimeout(() => {
      fechar();
    }, 4000);
    return () => window.clearTimeout(timeout);
  }, [aberto, fechar, mensagem]);

  const value = useMemo(
    () => ({
      mostrarMensagem,
    }),
    [mostrarMensagem],
  );

  return (
    <AppMessageContext.Provider value={value}>
      {children}

      {mensagem && aberto && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/20 px-4 pt-24 transition-opacity duration-300">
          <div
            className="relative w-full max-w-xl translate-y-0 scale-100 rounded-xl border border-emerald-300 bg-emerald-50 p-5 shadow-2xl transition-all duration-300"
            role="dialog"
            aria-live="polite"
            aria-label="Mensagem do sistema"
          >
            <button
              type="button"
              onClick={fechar}
              className="absolute right-3 top-3 rounded p-1 text-emerald-700 transition hover:bg-emerald-100 hover:text-emerald-800"
              aria-label="Fechar mensagem"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="pr-8 text-sm font-medium text-emerald-900">{mensagem}</p>
          </div>
        </div>
      )}
    </AppMessageContext.Provider>
  );
}
