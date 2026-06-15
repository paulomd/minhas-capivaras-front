"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useParams, useRouter } from "next/navigation";
import SenhaInput, { validarSenha } from "@/components/SenhaInput";
import { apiFetch } from "@/lib/apiFetch";

export default function RecuperarSenhaTokenPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);

    const erroSenha = validarSenha(senha);
    if (erroSenha) {
      setErro(erroSenha);
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/usuarios/alterar-senha", {
        method: "POST",
        body: JSON.stringify({ token: params.token, senha }),
      });
      router.push("/login");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao alterar senha.");
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
            Nova senha
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <SenhaInput
            id="senha"
            label="Nova senha"
            value={senha}
            onChange={setSenha}
            showRules
            variant="dark"
          />
          <div>
            <label htmlFor="confirmacao" className="block text-sm text-slate-200">
              Confirmar senha
            </label>
            <input
              id="confirmacao"
              type="password"
              required
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
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
            className="w-full rounded-lg bg-brand-orange py-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-60"
          >
            {loading ? "Salvando…" : "Alterar senha"}
          </button>
        </form>
      </div>
    </main>
  );
}
