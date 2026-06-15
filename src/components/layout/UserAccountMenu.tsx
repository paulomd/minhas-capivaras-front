"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { LogOut } from "lucide-react";
import {
  iniciaisDoNome,
  obterPerfilSessao,
  type UsuarioPerfilSessao,
} from "@/lib/usuarioSessao";

type Props = {
  onSair: () => void;
  perfilRemotoCarregado?: boolean;
};

export function UserAccountMenu({
  onSair,
  perfilRemotoCarregado = false,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [perfil, setPerfil] = useState<UsuarioPerfilSessao | null>(null);
  const [montado, setMontado] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setPerfil(null);
      return;
    }
    setPerfil(obterPerfilSessao());
  }, [aberto, perfilRemotoCarregado]);

  const atualizarPosicaoPainel = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    setCoords({
      top: r.bottom + 8,
      right: Math.max(8, window.innerWidth - r.right),
    });
  }, []);

  useLayoutEffect(() => {
    if (!aberto) return;
    atualizarPosicaoPainel();
    window.addEventListener("scroll", atualizarPosicaoPainel, true);
    window.addEventListener("resize", atualizarPosicaoPainel);
    return () => {
      window.removeEventListener("scroll", atualizarPosicaoPainel, true);
      window.removeEventListener("resize", atualizarPosicaoPainel);
    };
  }, [aberto, atualizarPosicaoPainel]);

  useEffect(() => {
    if (!aberto) return;
    let cleanup: (() => void) | undefined;
    const id = window.setTimeout(() => {
      const fecharSeFora = (e: PointerEvent) => {
        const alvo = e.target as Node;
        if (buttonRef.current?.contains(alvo)) return;
        if (painelRef.current?.contains(alvo)) return;
        setAberto(false);
      };
      document.addEventListener("pointerdown", fecharSeFora);
      cleanup = () =>
        document.removeEventListener("pointerdown", fecharSeFora);
    }, 0);
    return () => {
      window.clearTimeout(id);
      cleanup?.();
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [aberto]);

  const nome = perfil?.nome ?? "Usuário";
  const email = perfil?.email ?? "";
  const iniciais = iniciaisDoNome(perfil?.nome);

  const handleSair = () => {
    setAberto(false);
    onSair();
  };

  const painel =
    aberto && montado ? (
      <div
        ref={painelRef}
        className="fixed z-[200] w-[min(100vw-1rem,22rem)] overflow-hidden rounded-sm border border-slate-200 bg-white text-slate-900 shadow-xl"
        style={{ top: coords.top, right: coords.right }}
        role="dialog"
        aria-label="Informações da conta"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
          <span className="text-xs font-medium text-slate-600">Conta</span>
          <button
            type="button"
            onClick={handleSair}
            className="inline-flex items-center gap-1 text-sm text-brand-blue underline hover:text-sky-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>

        <div className="flex gap-4 p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700">
            {iniciais}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">{nome}</p>
            {perfil?.planoNome && (
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-brand-orange">
                Plano {perfil.planoNome}
              </p>
            )}
            {email ? (
              <p className="mt-0.5 truncate text-sm text-slate-600">{email}</p>
            ) : (
              <p className="mt-0.5 text-sm text-slate-400">
                E-mail não disponível
              </p>
            )}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-2 ring-brand-orange/85 ring-offset-2 ring-offset-brand-blue transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
        aria-expanded={aberto}
        aria-haspopup="dialog"
        aria-label="Conta do usuário"
        onClick={(e) => {
          e.stopPropagation();
          setAberto((v) => !v);
        }}
      >
        <span className="text-xs font-semibold tracking-tight text-white">
          {iniciais}
        </span>
      </button>
      {painel && createPortal(painel, document.body)}
    </div>
  );
}
