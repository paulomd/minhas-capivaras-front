"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SenhaInput, { validarSenha } from "@/components/SenhaInput";
import { PixPagamento } from "@/components/pix/PixPagamento";
import { ApiError, apiFetch } from "@/lib/apiFetch";
import { TOKEN_STORAGE_KEY } from "@/lib/constants";
import { queryCadastroFromSearchParams } from "@/lib/cadastroWizard";
import { obterPerfilSessao } from "@/lib/usuarioSessao";
import { PlanoCardSelecao } from "@/components/planos/PlanoCardSelecao";
import { PeriodoCardSelecao } from "@/components/planos/PeriodoCardSelecao";
import type { Plano, PeriodoAssinatura } from "@/types/plano";
import type { Pix } from "@/types/pix";

type RegistroResponse = {
  token: string;
};

const classeInputCadastro =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500";

const PASSOS = ["Dados", "Plano", "Período", "Pagamento"];

function ehErroDeEmail(mensagem: string): boolean {
  const normalizado = mensagem.toLowerCase();
  return normalizado.includes("email") || normalizado.includes("e-mail");
}

function ehErroDeTelefone(mensagem: string): boolean {
  const normalizado = mensagem.toLowerCase();
  return normalizado.includes("telefone") || normalizado.includes("fone");
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<CadastroCarregando />}>
      <CadastroWizard />
    </Suspense>
  );
}

function CadastroCarregando() {
  return (
    <main className="pagina-publica flex min-h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-600">Carregando…</p>
    </main>
  );
}

function CadastroWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { passoPlano, renovar } = queryCadastroFromSearchParams(searchParams);

  const [passo, setPasso] = useState(() => (renovar ? 3 : passoPlano ? 1 : 0));
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
  const [modoRenovacao, setModoRenovacao] = useState(renovar);
  const [loading, setLoading] = useState(renovar);
  const [erro, setErro] = useState<string | null>(null);
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const [erroFone, setErroFone] = useState<string | null>(null);

  const limparErrosFormulario = () => {
    setErro(null);
    setErroEmail(null);
    setErroFone(null);
  };

  const definirErroFormulario = (mensagem: string) => {
    if (ehErroDeEmail(mensagem)) {
      setErroEmail(mensagem);
      setErro(null);
      setErroFone(null);
    } else if (ehErroDeTelefone(mensagem)) {
      setErroFone(mensagem);
      setErro(null);
      setErroEmail(null);
    } else {
      setErro(mensagem);
      setErroEmail(null);
      setErroFone(null);
    }
  };

  const salvarToken = (authToken: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    setToken(authToken);
  };

  const renovarToken = async (): Promise<string | null> => {
    const emailLogin = email.trim();
    if (!emailLogin || !senha) return null;

    try {
      const resp = await apiFetch<RegistroResponse>("/usuarios/login", {
        method: "POST",
        body: JSON.stringify({ login: emailLogin, senha }),
      });
      if (!resp.token) return null;
      salvarToken(resp.token);
      return resp.token;
    } catch {
      return null;
    }
  };

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

  const buscarPlanoPorId = async (id: number): Promise<Plano | null> => {
    const naLista = planos.find((p) => p.id === id);
    if (naLista) return naLista;
    try {
      const lista = await apiFetch<Plano[]>("/planos");
      const normalizada = Array.isArray(lista) ? lista : [];
      setPlanos(normalizada);
      return normalizada.find((p) => p.id === id) ?? null;
    } catch {
      return null;
    }
  };

  const concluirSelecaoPeriodo = async (
    authToken: string,
    planoIdEscolhido: number,
    periodoEscolhido: number,
    planoParaFree?: Plano | null,
  ) => {
    const plano =
      planoParaFree ??
      planos.find((p) => p.id === planoIdEscolhido) ??
      (await buscarPlanoPorId(planoIdEscolhido));

    if (plano?.valorBase === 0) {
      await apiFetch("/usuarios/ativar-plano-free", {
        method: "POST",
        token: authToken,
        body: JSON.stringify({
          planoId: planoIdEscolhido,
          periodoId: periodoEscolhido,
        }),
      });
      router.push((modoRenovacao || token) ? "/inicio" : "/login");
      return;
    }

    const pixResp = await apiFetch<Pix>("/usuarios/pix-assinatura", {
      method: "POST",
      token: authToken,
      body: JSON.stringify({
        planoId: planoIdEscolhido,
        periodoId: periodoEscolhido,
      }),
    });
    setPix(pixResp);
    setPasso(3);
  };

  const iniciarRenovacaoPlanoAtual = async (
    planoIdRenovar: number,
    periodoIdRenovar: number,
    authToken: string,
  ) => {
    setErro(null);
    setModoRenovacao(true);
    setPlanoId(planoIdRenovar);
    setPeriodoId(periodoIdRenovar);

    const plano = await buscarPlanoPorId(planoIdRenovar);
    await concluirSelecaoPeriodo(
      authToken,
      planoIdRenovar,
      periodoIdRenovar,
      plano,
    );
  };

  useEffect(() => {
    const authSalvo = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (authSalvo) setToken(authSalvo);

    if (renovar) {
      if (!authSalvo) {
        router.replace("/login");
        return;
      }
      const perfil = obterPerfilSessao();
      if (!perfil?.planoId || !perfil?.periodoId) {
        setErro(
          "Não foi possível identificar seu plano atual. Escolha um plano abaixo.",
        );
        setPasso(1);
        setModoRenovacao(false);
        setLoading(false);
        return;
      }
      void iniciarRenovacaoPlanoAtual(
        perfil.planoId,
        perfil.periodoId,
        authSalvo,
      )
        .catch((err) =>
          setErro(
            err instanceof Error ? err.message : "Erro ao preparar renovação.",
          ),
        )
        .finally(() => setLoading(false));
      return;
    }

    if (passoPlano && authSalvo) {
      setPasso(1);
    }
  }, [router, renovar, passoPlano]);

  const autenticarPasso1 = async (emailCadastro: string): Promise<string> => {
    const resp = await apiFetch<RegistroResponse>("/usuarios/registrar", {
      method: "POST",
      body: JSON.stringify({ nome, email: emailCadastro, fone, senha }),
    });
    if (!resp.token) {
      throw new Error("Cadastro realizado, mas a API não retornou o token.");
    }
    return resp.token;
  };

  const handlePasso1 = async (e: FormEvent) => {
    e.preventDefault();
    limparErrosFormulario();
    const emailCadastro = email.trim();
    const erroSenha = validarSenha(senha);
    if (erroSenha) {
      definirErroFormulario(erroSenha);
      return;
    }
    setLoading(true);
    try {
      await apiFetch(
        `/usuarios/validar-email-cadastro?email=${encodeURIComponent(emailCadastro)}`,
      );

      const authToken = await autenticarPasso1(emailCadastro);
      salvarToken(authToken);
      setPasso(1);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        definirErroFormulario(err.message);
        return;
      }
      definirErroFormulario(
        err instanceof Error ? err.message : "Erro ao cadastrar.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasso4 = async (periodoIdParam?: number) => {
    const periodoEscolhido = periodoIdParam ?? periodoId;
    if (!planoId || !periodoEscolhido) return;

    setPeriodoId(periodoEscolhido);
    setErro(null);
    setLoading(true);

    let authToken = token ?? localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!authToken?.trim()) {
      authToken = await renovarToken();
    }

    if (!authToken?.trim()) {
      setErro(
        "Informe sua senha no passo de dados e clique em Continuar antes de escolher o período.",
      );
      setLoading(false);
      return;
    }

    try {
      await concluirSelecaoPeriodo(authToken, planoId, periodoEscolhido);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const tokenRenovado = await renovarToken();
        if (tokenRenovado) {
          try {
            await concluirSelecaoPeriodo(
              tokenRenovado,
              planoId,
              periodoEscolhido,
            );
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

          {loading && modoRenovacao && !pix && (
            <p className="mb-4 text-center text-sm text-slate-600">
              Preparando pagamento do seu plano atual…
            </p>
          )}

          {passo === 0 && !(modoRenovacao && loading) && (
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
                  className={classeInputCadastro}
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErroEmail(null);
                  }}
                  className={`${classeInputCadastro} ${
                    erroEmail ? "border-red-500" : ""
                  }`}
                  aria-invalid={erroEmail ? true : undefined}
                  aria-describedby={erroEmail ? "erro-email-cadastro" : undefined}
                />
                {erroEmail && (
                  <p
                    id="erro-email-cadastro"
                    className="mt-1 text-sm text-red-700"
                  >
                    {erroEmail}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Telefone
                </label>
                <input
                  required
                  value={fone}
                  onChange={(e) => {
                    setFone(e.target.value);
                    setErroFone(null);
                  }}
                  placeholder="(11) 99999-9999"
                  className={`${classeInputCadastro} ${
                    erroFone ? "border-red-500" : ""
                  }`}
                  aria-invalid={erroFone ? true : undefined}
                  aria-describedby={erroFone ? "erro-fone-cadastro" : undefined}
                />
                {erroFone && (
                  <p
                    id="erro-fone-cadastro"
                    className="mt-1 text-sm text-red-700"
                  >
                    {erroFone}
                  </p>
                )}
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
                    limparErrosFormulario();
                    setPasso(0);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
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
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
              <PixPagamento
                pix={pix}
                redirecionarAposPago={
                  modoRenovacao || token ? "/inicio" : "/login"
                }
              />
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
