"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import {
  PERFIL_STORAGE_KEY,
  SIDEBAR_RECOLHIDO_KEY,
  TOKEN_STORAGE_KEY,
} from "@/lib/constants";
import {
  buscarPerfilUsuario,
  salvarPerfilSessao,
} from "@/lib/usuarioSessao";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SidebarNav } from "./SidebarNav";
import { SidebarUserInfo } from "./SidebarUserInfo";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";
import { AppMessageProvider } from "./AppMessageProvider";

type Props = {
  children: React.ReactNode;
};

const LARGURA_SIDEBAR_COMPACTA = "4.375rem"; /* 70px */
const LARGURA_SIDEBAR_EXPANDIDA = "16.25rem"; /* 260px - igual ao PHP */

type PainelMenuProps = {
  compacto: boolean;
  perfilCarregado: boolean;
  onSair: () => void;
  onNavigate?: () => void;
  cabecalho: React.ReactNode;
};

function PainelMenu({
  compacto,
  perfilCarregado,
  onSair,
  onNavigate,
  cabecalho,
}: PainelMenuProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-white dark:bg-panel-sidebar">
      {cabecalho}

      <div
        className={`flex shrink-0 justify-center border-b border-slate-100 dark:border-panel-border ${
          compacto ? "px-1 py-3" : "px-4 py-4"
        }`}
      >
        <Logo href="/inicio" size={compacto ? "xs" : "lg"} priority />
      </div>

      <div
        className={`min-h-0 flex-1 overflow-y-auto pb-2 pt-2 ${
          compacto ? "px-1" : "px-2"
        }`}
      >
        <SidebarNav
          onNavigate={onNavigate}
          onSair={onSair}
          compacto={compacto}
        />
      </div>

      <SidebarUserInfo
        perfilCarregado={perfilCarregado}
        compacto={compacto}
      />
    </div>
  );
}

export function AppShell({ children }: Props) {
  const router = useRouter();
  const [sessaoOk, setSessaoOk] = useState<boolean | null>(null);
  const [menuRecolhido, setMenuRecolhido] = useState(false);
  const [menuMobileExpandido, setMenuMobileExpandido] = useState(false);
  const [desktopMd, setDesktopMd] = useState(false);
  const [perfilCarregado, setPerfilCarregado] = useState(false);

  useEffect(() => {
    try {
      setMenuRecolhido(
        localStorage.getItem(SIDEBAR_RECOLHIDO_KEY) === "true",
      );
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const atualizar = () => {
      const ehDesktop = mq.matches;
      setDesktopMd(ehDesktop);
      if (ehDesktop) setMenuMobileExpandido(false);
    };
    atualizar();
    mq.addEventListener("change", atualizar);
    return () => mq.removeEventListener("change", atualizar);
  }, []);

  useEffect(() => {
    if (!menuMobileExpandido) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [menuMobileExpandido]);

  const alternarMenuRecolhido = () => {
    setMenuRecolhido((v) => {
      const next = !v;
      try {
        localStorage.setItem(SIDEBAR_RECOLHIDO_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const fecharMenuMobile = () => setMenuMobileExpandido(false);

  const abrirMenuMobile = () => setMenuMobileExpandido(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      router.replace("/login");
      setSessaoOk(false);
      return;
    }
    setSessaoOk(true);
  }, [router]);

  useEffect(() => {
    if (sessaoOk !== true) return;

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return;

    (async () => {
      try {
        const perfil = await buscarPerfilUsuario(token);
        salvarPerfilSessao(perfil);
        setPerfilCarregado(true);
      } catch (e) {
        if (e instanceof Error && e.message.includes("401")) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          sessionStorage.removeItem(PERFIL_STORAGE_KEY);
          router.replace("/login");
        }
      }
    })();
  }, [router, sessaoOk]);

  const sair = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(PERFIL_STORAGE_KEY);
    router.push("/login");
  };

  if (sessaoOk === null) {
    return (
      <div className="flex min-h-screen min-h-dvh w-full items-center justify-center bg-slate-100 text-slate-600 dark:bg-panel-bg dark:text-panel-muted">
        <p className="text-sm">Carregando…</p>
      </div>
    );
  }

  if (sessaoOk === false) {
    return null;
  }

  const sidebarInlineCompacto = desktopMd ? menuRecolhido : true;
  const larguraAsideInline = desktopMd
    ? menuRecolhido
      ? LARGURA_SIDEBAR_COMPACTA
      : LARGURA_SIDEBAR_EXPANDIDA
    : LARGURA_SIDEBAR_COMPACTA;

  return (
    <AppMessageProvider>
      <ConfirmProvider>
      <div className="relative flex h-full min-h-0 w-full min-w-0 overflow-hidden bg-slate-100 dark:bg-panel-bg">
        {/* Barra fixa: mobile sempre compacta; desktop inline */}
        <aside
          className="z-10 flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l-[3px] border-l-brand-orange border-r border-slate-200 bg-white transition-[width] duration-300 ease-out dark:border-panel-border dark:bg-panel-sidebar"
          style={{ width: larguraAsideInline }}
        >
          <PainelMenu
            compacto={sidebarInlineCompacto}
            perfilCarregado={perfilCarregado}
            onSair={sair}
            onNavigate={fecharMenuMobile}
            cabecalho={
              <div
                className={`flex h-10 shrink-0 items-center border-b border-slate-100 px-2 dark:border-panel-border ${
                  sidebarInlineCompacto
                    ? "justify-center gap-0.5"
                    : "justify-between px-3"
                }`}
              >
                {desktopMd ? (
                  <button
                    type="button"
                    className="rounded p-2 text-slate-600 hover:bg-slate-100 dark:text-panel-muted dark:hover:bg-panel-menu"
                    aria-label={
                      menuRecolhido
                        ? "Expandir menu lateral"
                        : "Recolher menu lateral"
                    }
                    aria-expanded={!menuRecolhido}
                    onClick={alternarMenuRecolhido}
                  >
                    <Menu className="h-5 w-5" strokeWidth={2} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded p-2 text-slate-600 hover:bg-slate-100 dark:text-panel-muted dark:hover:bg-panel-menu"
                    aria-label="Expandir menu lateral"
                    aria-expanded={menuMobileExpandido}
                    onClick={abrirMenuMobile}
                  >
                    <Menu className="h-5 w-5" strokeWidth={2} />
                  </button>
                )}
                <ThemeToggle />
              </div>
            }
          />
        </aside>

        {/* Mobile expandido: overlay por cima do conteúdo */}
        {!desktopMd && menuMobileExpandido && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40"
              aria-label="Fechar menu"
              onClick={fecharMenuMobile}
            />
            <aside
              className="fixed left-0 top-0 z-50 flex h-full flex-col overflow-hidden border-l-[3px] border-l-brand-orange border-r border-slate-200 bg-white shadow-2xl dark:border-panel-border dark:bg-panel-sidebar"
              style={{ width: LARGURA_SIDEBAR_EXPANDIDA }}
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
            >
              <PainelMenu
                compacto={false}
                perfilCarregado={perfilCarregado}
                onSair={sair}
                onNavigate={fecharMenuMobile}
                cabecalho={
                  <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 px-3 dark:border-panel-border">
                    <ThemeToggle />
                    <button
                      type="button"
                      className="rounded p-2 text-slate-600 hover:bg-slate-100 dark:text-panel-muted dark:hover:bg-panel-menu"
                      aria-label="Fechar menu"
                      onClick={fecharMenuMobile}
                    >
                      <X className="h-5 w-5" strokeWidth={2} />
                    </button>
                  </div>
                }
              />
            </aside>
          </>
        )}

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-slate-50/80 dark:bg-panel-bg">
          <div className="w-full max-w-full min-w-0 flex-1 px-4 py-6 md:px-6">
            {children}
          </div>
        </main>
      </div>
      </ConfirmProvider>
    </AppMessageProvider>
  );
}
