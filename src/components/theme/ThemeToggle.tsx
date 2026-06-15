"use client";

import { Moon, Sun } from "lucide-react";
import { useTema } from "./ThemeProvider";

export function ThemeToggle() {
  const { tema, alternarTema } = useTema();
  const escuro = tema === "dark";

  return (
    <button
      type="button"
      onClick={alternarTema}
      title={escuro ? "Usar modo claro" : "Usar modo escuro"}
      aria-label={escuro ? "Usar modo claro" : "Usar modo escuro"}
      className="rounded p-2 text-slate-600 transition hover:bg-slate-100 dark:text-panel-muted dark:hover:bg-panel-menu"
    >
      {escuro ? (
        <Sun className="h-5 w-5 text-brand-orange" strokeWidth={2} />
      ) : (
        <Moon className="h-5 w-5 text-slate-500" strokeWidth={2} />
      )}
    </button>
  );
}
