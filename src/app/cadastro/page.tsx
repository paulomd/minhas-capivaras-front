"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SenhaInput, { validarSenha } from "@/components/SenhaInput";
import { PixPagamento } from "@/components/pix/PixPagamento";
import { ApiError, apiFetch } from "@/lib/apiFetch";
import { buscarPerfilUsuario } from "@/lib/usuarioSessao";
import {
  CADASTRO_EMAIL_KEY,
  CADASTRO_WIZARD_KEY,
  TOKEN_STORAGE_KEY,
} from "@/lib/constants";
import { PlanoCardSelecao } from "@/components/planos/PlanoCardSelecao";
import { PeriodoCardSelecao } from "@/components/planos/PeriodoCardSelecao";
import type { Plano, PeriodoAssinatura } from "@/types/plano";
import type { Pix } from "@/types/pix";

type RegistroResponse = {
  token: string;
};

const PASSOS = ["Dados", "Plano", "Período", "Pagamento"];

export default function CadastroPage() {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [fone, setFone] = useState("");
  const [senha, setSenha] = useState("");
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoAssinatura[]>([]);
  const [planoId, setPlanoId] = useState<number | null>(null);
  const [periodoId, setPeriodoId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pix, setPix] = useState<Pix | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);

  const salvarToken = (authToken: string, emailCadastro?: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    sessionStorage.setItem(CADASTRO_WIZARD_KEY, "1");
    if (emailCadastro?.trim()) {
      sessionStorage.setItem(CADASTRO_EMAIL_KEY, emailCadastro.trim());
    }
    setToken(authToken);
    setCadastroConcluido(true);
  };

  const renovarTokenCadastro = async (): Promise<string | null> => {
    const emailLogin = email.trim() || sessionStorage.getItem(CADASTRO_EMAIL_KEY) || "";
    if (!emailLogin || !senha) return null;

    try {
      const resp = await apiFetch<RegistroResponse>("/usuarios/login", {
        method: "POST",
        body: JSON.stringify({ login: emailLogin, senha }),
      });
      if (!resp.token) return null;
      salvarToken(resp.token, emailLogin);
      return resp.token;
    } catch {
      return null;
    }
  };

  const tokenValido = async (authToken: string) => {
    await buscarPerfilUsuario(authToken);
    return true;
  };

  useEffect(() => {
    const emailSalvo = sessionStorage.getItem(CADASTRO_EMAIL_KEY);
    if (emailSalvo) setEmail(emailSalvo);

    const wizardAtivo = sessionStorage.getItem(CADASTRO_WIZARD_KEY) === "1";
    const authSalvo = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!wizardAtivo || !authSalvo) return;

    tokenValido(authSalvo)
      .then(() => {
        setToken(authSalvo);
        setCadastroConcluido(true);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setCadastroConcluido(false);
      });
  }, []);

  useEffect(() => {
    if (passo === 1) {
      apiFetch<Plano[]>("/planos")
        .then((d) => setPlanos(Array.isArray(d) ? d : []))
        .catch(() => setPlanos([]));
    }
    if (passo === 2) {
      apiFetch<PeriodoAssinatura[]>("/periodos-assinatura")
        .then((d) => setPeriodos(Array.isArray(d) ? d : []))
        .catch(() => setPeriodos([]));
    }
  }, [passo]);

  const planoSelecionado = planos.find((p) => p.id === planoId) ?? null;

  const handlePasso1 = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    const erroSenha = validarSenha(senha);
    if (erroSenha) {
      setErro(erroSenha);
      return;
    }
    setLoading(true);
    try {
      if (cadastroConcluido) {
        const tokenRenovado = await renovarTokenCadastro();
        if (tokenRenovado) {
          setPasso(1);
          return;
        }

        const authSalvo = token ?? localStorage.getItem(TOKEN_STORAGE_KEY);
        if (authSalvo) {
          try {
            await tokenValido(authSalvo);
            salvarToken(authSalvo, email);
            setPasso(1);
            return;
          } catch {
            /* tenta registrar ou login abaixo */
          }
        }
      }

      const resp = await apiFetch<RegistroResponse>("/usuarios/registrar", {
        method: "POST",
        body: JSON.stringify({ nome, email, fone, senha }),
      });

      if (!resp.token) {
        throw new Error("Cadastro realizado, mas a API não retornou o token.");
      }

      salvarToken(resp.token, email);
      setPasso(1);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const tokenRenovado = await renovarTokenCadastro();
        if (tokenRenovado) {
          setPasso(1);
          return;
        }
      }
      setErro(err instanceof Error ? err.message : "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  const concluirSelecaoPeriodo = async (
    authToken: string,
    periodoEscolhido: number,
  ) => {
    if (planoSelecionado?.valorBase === 0) {
      await apiFetch("/usuarios/ativar-plano-free", {
        method: "POST",
        token: authToken,
        body: JSON.stringify({ planoId, periodoId: periodoEscolhido }),
      });
      sessionStorage.removeItem(CADASTRO_WIZARD_KEY);
      sessionStorage.removeItem(CADASTRO_EMAIL_KEY);
      router.push("/login");
      return;
    }

    const pixResp = await apiFetch<Pix>("/usuarios/pix-assinatura", {
      method: "POST",
      token: authToken,
      body: JSON.stringify({ planoId, periodoId: periodoEscolhido }),
    });
    setPix(pixResp);
    setPasso(3);
  };

  const handlePasso4 = async (periodoIdParam?: number) => {
    const periodoEscolhido = periodoIdParam ?? periodoId;
    if (!planoId || !periodoEscolhido) return;

    setPeriodoId(periodoEscolhido);
    setErro(null);
    setLoading(true);

    let authToken = token ?? localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!authToken?.trim()) {
      authToken = await renovarTokenCadastro();
    }

    if (!authToken?.trim()) {
      setErro(
        "Informe sua senha no passo de dados e clique em Continuar antes de escolher o período.",
      );
      setLoading(false);
      return;
    }

    try {
      await concluirSelecaoPeriodo(authToken, periodoEscolhido);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const tokenRenovado = await renovarTokenCadastro();
        if (tokenRenovado) {
          try {
            await concluirSelecaoPeriodo(tokenRenovado, periodoEscolhido);
            return;
          } catch (retryErr) {
            setErro(
              retryErr instanceof Error
                ? retryErr.message
                : "Erro ao gerar Pix.",
            );
            return;
          }
        }
        setErro(
          "Sessão expirada. Volte ao passo de dados, informe sua senha e clique em Continuar.",
        );
        return;
      }
      setErro(err instanceof Error ? err.message : "Erro ao gerar Pix.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pagina-publica min-h-screen bg-slate-100 py-4 pb-8">
      <div
        className={`mx-auto px-4 ${passo === 1 || passo === 2 ? "max-w-4xl" : "max-w-2xl"}`}
      >
        <div className="mb-3 text-center">
          <Logo
            href="/"
            size={passo === 1 || passo === 2 ? "md" : "lg"}
            className="mx-auto"
          />
        </div>

        <div className="mb-3 flex flex-wrap justify-center gap-1.5">
          {PASSOS.map((label, i) => (
            <div
              key={label}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                i === passo
                  ? "bg-brand-orange text-white"
                  : i < passo
                    ? "bg-brand-orange/20 text-brand-orange"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        <div
          className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${
            passo === 1 || passo === 2 ? "p-4" : "p-6"
          }`}
        >
          {erro && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {erro}
            </div>
          )}

          {passo === 0 && (
            <form onSubmit={handlePasso1} className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Seus dados
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Nome
                </label>
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Telefone
                </label>
                <input
                  required
                  value={fone}
                  onChange={(e) => setFone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <SenhaInput
                id="senha"
                label="Senha"
                value={senha}
                onChange={setSenha}
                showRules
                variant="light"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-orange py-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-60"
              >
                {loading ? "Cadastrando…" : "Continuar"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {passo === 1 && (
            <div className="space-y-3">
              <h2 className="text-center text-lg font-semibold text-slate-800">
                Escolha seu plano
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {planos.map((plano) => (
                  <PlanoCardSelecao
                    key={plano.id}
                    plano={plano}
                    compacto
                    selecionado={planoId === plano.id}
                    onSelecionar={() => {
                      setPlanoId(plano.id);
                      setPasso(2);
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErro(null);
                    setPasso(0);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </button>
              </div>
            </div>
          )}

          {passo === 2 && (
            <div className="space-y-3">
              <h2 className="text-center text-lg font-semibold text-slate-800">
                Escolha o período do seu plano
              </h2>

              {loading && (
                <p className="text-center text-sm text-slate-500">
                  Processando…
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {periodos.map((periodo) => (
                  <PeriodoCardSelecao
                    key={periodo.id}
                    periodo={periodo}
                    valorBase={planoSelecionado?.valorBase ?? 0}
                    compacto
                    selecionado={periodoId === periodo.id}
                    desabilitado={loading}
                    onSelecionar={() => void handlePasso4(periodo.id)}
                  />
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setErro(null);
                    setPeriodoId(null);
                    setPasso(1);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </button>
              </div>
            </div>
          )}

          {passo === 3 && pix && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Pagamento via Pix
              </h2>
              <PixPagamento pix={pix} redirecionarAposPago="/login" />
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          Já tem conta?{" "}
          <Link href="/login" className="text-brand-blue hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
