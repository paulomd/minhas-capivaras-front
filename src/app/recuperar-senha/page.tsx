"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { apiFetch } from "@/lib/apiFetch";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setLoading(true);

    try {
      await apiFetch("/usuarios/recuperar-senha", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSucesso(
        "Se o e-mail estiver cadastrado, enviaremos um link de recuperação.",
      );
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : "Erro ao solicitar recuperação.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pagina-publica flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blue to-brand-orange/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl">
        <div className="mb-6 text-center">
          <Logo href="/" size="md" className="mx-auto" />
          <h1 className="mt-4 text-2xl font-semibold text-white">
            Recuperar senha
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-slate-200">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          {erro && (
            <div className="rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-100">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-100">
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-orange py-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar link de recuperação"}
          </button>

          <Link
            href="/login"
            className="block text-center text-sm text-slate-300 hover:text-white hover:underline"
          >
            Voltar ao login
          </Link>
        </form>
      </div>
    </main>
  );
}
