export type Tema = "light" | "dark";

export const TEMA_STORAGE_KEY = "jurisprime_tema";

export function obterTemaSalvo(): Tema {
  if (typeof window === "undefined") return "light";
  try {
    return localStorage.getItem(TEMA_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function aplicarTema(tema: Tema): void {
  const root = document.documentElement;
  if (tema === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.style.colorScheme = tema;
}

export function salvarTema(tema: Tema): void {
  try {
    localStorage.setItem(TEMA_STORAGE_KEY, tema);
  } catch {
    /* ignore */
  }
  aplicarTema(tema);
}
