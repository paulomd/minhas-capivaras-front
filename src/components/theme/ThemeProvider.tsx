"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  aplicarTema,
  obterTemaSalvo,
  salvarTema,
  type Tema,
} from "@/lib/tema";

type ThemeContextValue = {
  tema: Tema;
  alternarTema: () => void;
  definirTema: (tema: Tema) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTema(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTema deve ser usado dentro de ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>("light");

  useEffect(() => {
    const salvo = obterTemaSalvo();
    setTema(salvo);
    aplicarTema(salvo);
  }, []);

  const definirTema = useCallback((novo: Tema) => {
    setTema(novo);
    salvarTema(novo);
  }, []);

  const alternarTema = useCallback(() => {
    setTema((atual) => {
      const novo: Tema = atual === "light" ? "dark" : "light";
      salvarTema(novo);
      return novo;
    });
  }, []);

  const value = useMemo(
    () => ({ tema, alternarTema, definirTema }),
    [tema, alternarTema, definirTema],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
