"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, User } from "lucide-react";
import SenhaInput, { validarSenha } from "@/components/SenhaInput";
import { useAppMessage } from "@/components/layout/AppMessageProvider";
import { ApiError, apiFetch } from "@/lib/apiFetch";
import {
  buscarPerfilUsuario,
  obterPerfilSessao,
  salvarPerfilSessao,
  type UsuarioPerfilSessao,
} from "@/lib/usuarioSessao";
import { TOKEN_STORAGE_KEY } from "@/lib/constants";
import { formatarData } from "@/lib/format";

const classeInput =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-orange dark:border-panel-border dark:bg-panel-bg dark:text-white";

function ehErroDeEmail(mensagem: string): boolean {
  const normalizado = mensagem.toLowerCase();
  return normalizado.includes("email") || normalizado.includes("e-mail");
}

function ehErroDeTelefone(mensagem: string): boolean {
  const normalizado = mensagem.toLowerCase();
  return normalizado.includes("telefone") || normalizado.includes("fone");
}

function ehErroSenhaAtual(mensagem: string): boolean {
  const normalizado = mensagem.toLowerCase();
  return normalizado.includes("senha atual");
}

export default function MeuUsuarioPage() {
  const { mostrarMensagem } = useAppMessage();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [fone, setFone] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [planoNome, setPlanoNome] = useState<string | null>(null);
  const [dataFinalPlano, setDataFinalPlano] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const [erroFone, setErroFone] = useState<string | null>(null);
  const [erroSenhaAtual, setErroSenhaAtual] = useState<string | null>(null);

  const limparErros = () => {
    setErro(null);
    setErroEmail(null);
    setErroFone(null);
    setErroSenhaAtual(null);
  };

  const aplicarPerfil = (perfil: UsuarioPerfilSessao) => {
    setNome(perfil.nome ?? "");
    setEmail(perfil.email ?? "");
    setFone(perfil.fone ?? "");
    setPlanoNome(perfil.planoNome);
    setDataFinalPlano(perfil.dataFinalPlano);
  };

  useEffect(() => {
    const perfilLocal = obterPerfilSessao();
    if (perfilLocal) {
      aplicarPerfil(perfilLocal);
    }

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setCarregandoPerfil(false);
      return;
    }

    (async () => {
      try {
        const perfil = await buscarPerfilUsuario(token);
        salvarPerfilSessao(perfil);
        aplicarPerfil(perfil);
      } catch {
        /* mantém dados da sessão se houver */
      } finally {
        setCarregandoPerfil(false);
      }
    })();
  }, []);

  const definirErroFormulario = (mensagem: string) => {
    if (ehErroDeEmail(mensagem)) {
      setErroEmail(mensagem);
      setErro(null);
      setErroFone(null);
      setErroSenhaAtual(null);
    } else if (ehErroDeTelefone(mensagem)) {
      setErroFone(mensagem);
      setErro(null);
      setErroEmail(null);
      setErroSenhaAtual(null);
    } else if (ehErroSenhaAtual(mensagem)) {
      setErroSenhaAtual(mensagem);
      setErro(null);
      setErroEmail(null);
      setErroFone(null);
    } else {
      setErro(mensagem);
      setErroEmail(null);
      setErroFone(null);
      setErroSenhaAtual(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    limparErros();

    const alterarSenha = novaSenha.trim().length > 0;
    if (alterarSenha) {
      if (!senhaAtual.trim()) {
        setErroSenhaAtual("Informe a senha atual para alterar a senha.");
        return;
      }
      const erroNovaSenha = validarSenha(novaSenha);
      if (erroNovaSenha) {
        setErro(erroNovaSenha);
        return;
      }
      if (novaSenha !== confirmacaoSenha) {
        setErro("As senhas não conferem.");
        return;
      }
    }

    setLoading(true);
    try {
      const body: Record<string, string> = {
        nome: nome.trim(),
        email: email.trim(),
        fone: fone.trim(),
      };
      if (alterarSenha) {
        body.senhaAtual = senhaAtual;
        body.novaSenha = novaSenha;
      }

      const perfil = await apiFetch<UsuarioPerfilSessao>("/usuarios/perfil", {
        method: "PUT",
        auth: true,
        body: JSON.stringify(body),
      });

      salvarPerfilSessao(perfil);
      aplicarPerfil(perfil);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacaoSenha("");
      mostrarMensagem("Dados atualizados com sucesso.");
    } catch (e) {
      const mensagem =
        e instanceof ApiError || e instanceof Error
          ? e.message
          : "Erro ao salvar os dados.";
      definirErroFormulario(mensagem);
    } finally {
      setLoading(false);
    }
  };

  if (carregandoPerfil) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 dark:text-panel-muted">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-brand-orange/10 p-2 text-brand-orange">
            <User className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Meu usuário
            </h1>
            <p className="text-sm text-slate-600 dark:text-panel-muted">
              Atualize seus dados de acesso e senha
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-panel-border dark:bg-panel-card"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="nome" className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={classeInput}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={classeInput}
            />
            {erroEmail && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{erroEmail}</p>
            )}
          </div>

          <div>
            <label htmlFor="fone" className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
              Telefone
            </label>
            <input
              id="fone"
              type="tel"
              required
              value={fone}
              onChange={(e) => setFone(e.target.value)}
              className={classeInput}
            />
            {erroFone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{erroFone}</p>
            )}
          </div>
        </div>

        {planoNome && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-panel-border dark:bg-panel-bg dark:text-panel-muted">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  Plano:{" "}
                </span>
                <Link
                  href="/meu-plano"
                  className="font-semibold text-brand-orange hover:underline"
                >
                  {planoNome}
                </Link>
              </span>
              {dataFinalPlano && (
                <>
                  <span className="text-slate-400" aria-hidden="true">·</span>
                  <span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      Válido até:{" "}
                    </span>
                    {formatarData(dataFinalPlano)}
                  </span>
                </>
              )}
              <span className="text-slate-400" aria-hidden="true">·</span>
              <Link
                href="/meu-plano"
                className="font-semibold text-brand-orange hover:underline"
              >
                Detalhes do Plano
              </Link>
            </p>
          </div>
        )}

        <div className="space-y-4 border-t border-slate-100 pt-6 dark:border-panel-border">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Alterar senha
          </h2>
          <p className="text-sm text-slate-600 dark:text-panel-muted">
            Deixe em branco se não quiser alterar a senha.
          </p>

          <div>
            <label htmlFor="senhaAtual" className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
              Senha atual
            </label>
            <input
              id="senhaAtual"
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              className={classeInput}
              autoComplete="current-password"
            />
            {erroSenhaAtual && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{erroSenhaAtual}</p>
            )}
          </div>

          <SenhaInput
            id="novaSenha"
            label="Nova senha"
            value={novaSenha}
            onChange={setNovaSenha}
            required={false}
            showRules={novaSenha.length > 0}
            variant="light"
          />

          <div>
            <label htmlFor="confirmacaoSenha" className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
              Confirmar nova senha
            </label>
            <input
              id="confirmacaoSenha"
              type="password"
              value={confirmacaoSenha}
              onChange={(e) => setConfirmacaoSenha(e.target.value)}
              className={classeInput}
              autoComplete="new-password"
            />
          </div>
        </div>

        {erro && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {erro}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
