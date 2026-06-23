"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  FileText,
  Wallet,
  CreditCard,
  User,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export type MenuItemEstatico = {
  href: string;
  label: string;
  icone: LucideIcon;
};

export const MENU_ITENS: MenuItemEstatico[] = [
  { href: "/inicio", label: "Início", icone: Home },
  { href: "/monitoramentos", label: "Monitoramentos", icone: Search },
  { href: "/processos", label: "Processos", icone: FileText },
  { href: "/financeiro", label: "Histórico Financeiro", icone: Wallet },
  { href: "/meu-plano", label: "Meu Plano", icone: CreditCard },
];

const MEU_USUARIO_HREF = "/meu-usuario";

function caminhoAtivo(path: string, pathname: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

type Props = {
  onNavigate?: () => void;
  onSair?: () => void;
  compacto?: boolean;
};

export function SidebarNav({ onNavigate, onSair, compacto }: Props) {
  const pathname = usePathname();
  const meuUsuarioAtivo = caminhoAtivo(MEU_USUARIO_HREF, pathname);

  if (compacto) {
    return (
      <nav
        className="flex flex-col items-center gap-1 py-2"
        aria-label="Menu principal"
      >
        {MENU_ITENS.map((item) => {
          const ativo = caminhoAtivo(item.href, pathname);
          const Icone = item.icone;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              onClick={() => onNavigate?.()}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition ${
                ativo
                  ? "bg-brand-orange/15 text-slate-900 ring-1 ring-inset ring-brand-orange/30 dark:bg-brand-orange dark:text-white dark:ring-0"
                  : "text-slate-600 hover:bg-slate-100 dark:bg-panel-menu dark:text-white dark:hover:bg-panel-hover"
              }`}
            >
              <Icone
                className={`h-5 w-5 ${
                  ativo
                    ? "text-brand-orange dark:text-white"
                    : "text-slate-500 dark:text-white"
                }`}
              />
            </Link>
          );
        })}
        <Link
          href={MEU_USUARIO_HREF}
          title="Meu usuário"
          aria-label="Meu usuário"
          onClick={() => onNavigate?.()}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition ${
            meuUsuarioAtivo
              ? "bg-brand-orange/15 text-slate-900 ring-1 ring-inset ring-brand-orange/30 dark:bg-brand-orange dark:text-white dark:ring-0"
              : "text-slate-600 hover:bg-slate-100 dark:bg-panel-menu dark:text-white dark:hover:bg-panel-hover"
          }`}
        >
          <User
            className={`h-5 w-5 ${
              meuUsuarioAtivo
                ? "text-brand-orange dark:text-white"
                : "text-slate-500 dark:text-white"
            }`}
          />
        </Link>
        {onSair && (
          <button
            type="button"
            title="Sair"
            aria-label="Sair"
            onClick={() => {
              onNavigate?.();
              onSair();
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:bg-panel-menu dark:text-white dark:hover:bg-panel-hover"
          >
            <LogOut className="h-5 w-5 text-slate-500 dark:text-white" />
          </button>
        )}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1 py-2" aria-label="Menu principal">
      {MENU_ITENS.map((item) => {
        const ativo = caminhoAtivo(item.href, pathname);
        const Icone = item.icone;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate?.()}
            className={`flex items-center gap-3 rounded-r-full py-2.5 pl-3 pr-3 text-sm transition ${
              ativo
                ? "bg-brand-orange/10 font-semibold text-slate-900 ring-1 ring-inset ring-brand-orange/25 dark:bg-brand-orange dark:text-white dark:ring-0"
                : "font-medium text-slate-700 hover:bg-slate-100 dark:bg-panel-menu dark:text-white dark:hover:bg-panel-hover"
            }`}
          >
            <Icone
              className={`h-5 w-5 shrink-0 ${
                ativo
                  ? "text-brand-orange dark:text-white"
                  : "text-slate-500 dark:text-white"
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <Link
        href={MEU_USUARIO_HREF}
        onClick={() => onNavigate?.()}
        className={`flex items-center gap-3 rounded-r-full py-2.5 pl-3 pr-3 text-sm transition ${
          meuUsuarioAtivo
            ? "bg-brand-orange/10 font-semibold text-slate-900 ring-1 ring-inset ring-brand-orange/25 dark:bg-brand-orange dark:text-white dark:ring-0"
            : "font-medium text-slate-700 hover:bg-slate-100 dark:bg-panel-menu dark:text-white dark:hover:bg-panel-hover"
        }`}
      >
        <User
          className={`h-5 w-5 shrink-0 ${
            meuUsuarioAtivo
              ? "text-brand-orange dark:text-white"
              : "text-slate-500 dark:text-white"
          }`}
        />
        <span>Meu usuário</span>
      </Link>
      {onSair && (
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onSair();
          }}
          className="flex w-full items-center gap-3 rounded-r-full py-2.5 pl-3 pr-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:bg-panel-menu dark:text-white dark:hover:bg-panel-hover"
        >
          <LogOut className="h-5 w-5 shrink-0 text-slate-500 dark:text-white" />
          <span>Sair</span>
        </button>
      )}
    </nav>
  );
}
