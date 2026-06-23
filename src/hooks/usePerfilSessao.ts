"use client";

import { useEffect, useState } from "react";
import {
  obterPerfilSessao,
  type UsuarioPerfilSessao,
} from "@/lib/usuarioSessao";

export function usePerfilSessao(): UsuarioPerfilSessao | null {
  const [perfil, setPerfil] = useState<UsuarioPerfilSessao | null>(null);

  useEffect(() => {
    const atualizar = () => setPerfil(obterPerfilSessao());
    atualizar();
    window.addEventListener("perfil-sessao-atualizado", atualizar);
    return () =>
      window.removeEventListener("perfil-sessao-atualizado", atualizar);
  }, []);

  return perfil;
}
