"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  buscarPerfilUsuario,
  limparPerfilSessao,
  salvarPerfilSessao,
} from "@/lib/usuarioSessao";
import { TOKEN_STORAGE_KEY } from "@/lib/constants";
import { apiFetch } from "@/lib/apiFetch";

type LoginResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const dados = await apiFetch<LoginResponse>("/usuarios/login", {
        method: "POST",
        body: JSON.stringify({ login, senha }),
      });

      const token = dados.token ?? dados.accessToken ?? dados.jwt;
      if (!token) {
        throw new Error(
          "A resposta da API não contém o token de autenticação.",
        );
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      const perfil = await buscarPerfilUsuario(token);
      salvarPerfilSessao(perfil);
      router.push("/inicio");
    } catch (e) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      limparPerfilSessao();
      const erroMsg =
        e instanceof Error ? e.message : "Erro inesperado ao fazer login.";
      if (erroMsg.toLowerCase().includes("failed to fetch")) {
        setErro(
          "Ocorreu um erro ao conectar com o servidor. Tente novamente mais tarde.",
        );
        return;
      }
      setErro(erroMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pagina-publica flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blue to-brand-orange/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Logo href="/" size="md" />
          <h1 className="text-2xl font-semibold text-white">Entrar</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="login" className="block text-sm font-medium text-slate-200">
              E-mail
            </label>
            <input
              id="login"
              type="email"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
              placeholder="voce@email.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="senha" className="block text-sm font-medium text-slate-200">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
              placeholder="Sua senha"
            />
          </div>

          {erro && (
            <div className="rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-100">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-orange py-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-60 transition"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>

          <div className="flex flex-col gap-2 text-sm">
            <Link
              href="/recuperar-senha"
              className="text-slate-300 hover:text-white hover:underline"
            >
              Esqueceu sua senha?
            </Link>
            <Link
              href="/cadastro"
              className="text-slate-300 hover:text-white hover:underline"
            >
              Criar conta
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
