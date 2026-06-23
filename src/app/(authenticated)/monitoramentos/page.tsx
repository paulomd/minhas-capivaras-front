"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Radar } from "lucide-react";
import { useAppMessage } from "@/components/layout/AppMessageProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { PixPagamento } from "@/components/pix/PixPagamento";
import { apiFetch } from "@/lib/apiFetch";
import { formatarData } from "@/lib/format";
import { isErroLimiteMonitoramento } from "@/lib/monitoramentoErro";
import { obterPerfilSessao, recarregarPerfilSessao } from "@/lib/usuarioSessao";
import { cpfOuCnpjValido } from "@/lib/cpfCnpj";
import type { Pix } from "@/types/pix";
import type {
  CriarMonitoramentoPayload,
  Monitoramento,
  TipoDocumento,
} from "@/types/monitoramento";

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const TIPOS: { value: TipoDocumento; label: string }[] = [
  { value: "OAB", label: "OAB" },
  { value: "CPF", label: "CPF" },
  { value: "CNPJ", label: "CNPJ" },
  { value: "TEXTO", label: "Texto / Filtro" },
];

function placeholderDocumento(tipo: TipoDocumento | ""): string {
  if (tipo === "TEXTO") {
    return "Informe um nome de parte/juiz/advogado/empresa ou assunto (ex: Ambiental, Fiscal)";
  }
  return "Insira nº do documento";
}

function labelTipoDocumento(tipo: TipoDocumento): string {
  return TIPOS.find((t) => t.value === tipo)?.label ?? tipo;
}

type CampoMonitoramento = {
  label: string;
  value: string;
};

function valorFiltroMonitoramento(monitoramento: Monitoramento): string {
  const { documento, tipoDocumento, ufDocumento } = monitoramento;
  if (tipoDocumento === "OAB" && ufDocumento) {
    return `${documento} / ${ufDocumento}`;
  }
  return documento;
}

function montarCamposMonitoramento(monitoramento: Monitoramento): CampoMonitoramento[] {
  const campos: CampoMonitoramento[] = [
    { label: "Filtro", value: valorFiltroMonitoramento(monitoramento) },
  ];

  campos.push({
    label: "Notificações",
    value: String(monitoramento.quantidadeNotificada ?? 0),
  });

  if (monitoramento.email) {
    campos.push({ label: "E-mail", value: monitoramento.email });
  }

  if (monitoramento.fone) {
    campos.push({ label: "Telefone", value: monitoramento.fone });
  }

  campos.push({
    label: "Cadastrado em",
    value: formatarData(monitoramento.dataCadastro),
  });
  campos.push({
    label: "Última consulta",
    value: formatarData(monitoramento.dataUltimaConsulta),
  });

  return campos;
}

function MonitoramentoCard({
  monitoramento,
  onRemover,
}: {
  monitoramento: Monitoramento;
  onRemover: (id: number) => void;
}) {
  const { id, tipoDocumento } = monitoramento;
  const campos = montarCamposMonitoramento(monitoramento);
  const linhas: CampoMonitoramento[][] = [];
  for (let i = 0; i < campos.length; i += 2) {
    linhas.push(campos.slice(i, i + 2));
  }

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-md dark:border-panel-border dark:bg-panel-card dark:shadow-black/20 dark:hover:border-brand-orange/50">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-lg p-2 text-brand-orange">
          <Radar className="h-5 w-5" strokeWidth={2} />
        </span>
        <span className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-bold text-black">
          {labelTipoDocumento(tipoDocumento)}
        </span>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-slate-100 dark:border-panel-border">
        {linhas.map((linha, indice) => (
          <div
            key={indice}
            className={`grid grid-cols-2 divide-x divide-slate-100 dark:divide-panel-border ${
              indice % 2 === 0
                ? "bg-slate-50 dark:bg-panel-bg"
                : "bg-white dark:bg-panel-card"
            }`}
          >
            {linha.map((campo) => (
              <div
                key={campo.label}
                className="px-3 py-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200"
              >
                <strong className="text-slate-900 dark:text-white">{campo.label}:</strong>
                <br />
                <span className="break-words">{campo.value}</span>
              </div>
            ))}
            {linha.length === 1 && (
              <div
                className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200"
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end border-t border-slate-100 pt-3 dark:border-panel-border">
        <button
          type="button"
          onClick={() => void onRemover(id)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          aria-label="Remover monitoramento"
        >
          <Trash2 className="h-4 w-4" />
          Remover
        </button>
      </div>
    </article>
  );
}

export default function MonitoramentosPage() {
  const { mostrarMensagem } = useAppMessage();
  const { confirm } = useConfirm();
  const [lista, setLista] = useState<Monitoramento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modoPagamentoExtra, setModoPagamentoExtra] = useState(false);
  const [pixExtra, setPixExtra] = useState<Pix | null>(null);
  const [carregandoPixExtra, setCarregandoPixExtra] = useState(false);
  const [monitoramentoPendente, setMonitoramentoPendente] =
    useState<CriarMonitoramentoPayload | null>(null);

  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento | "">("");
  const [documento, setDocumento] = useState("");
  const [ufDocumento, setUfDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [fone, setFone] = useState("");
  const [planoAtivo, setPlanoAtivo] = useState<boolean | null>(null);

  const carregar = async () => {
    setCarregando(true);
    try {
      const dados = await apiFetch<Monitoramento[]>("/monitoramentos", {
        auth: true,
      });
      setLista(Array.isArray(dados) ? dados : []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const perfil = obterPerfilSessao();
    if (perfil) {
      setEmail(perfil.email ?? "");
      setFone(perfil.fone ?? "");
      setPlanoAtivo(perfil.planoAtivo);
    }
    void carregar();
  }, []);

  const podeCadastrarMonitoramento = planoAtivo === true;

  const carregarPixMonitoramentoExtra = async () => {
    setCarregandoPixExtra(true);
    setErro(null);
    try {
      const pix = await apiFetch<Pix>("/pix/monitoramento-adicional", {
        auth: true,
      });
      setPixExtra(pix);
      setModoPagamentoExtra(true);
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Erro ao gerar PIX de monitoramento adicional.",
      );
    } finally {
      setCarregandoPixExtra(false);
    }
  };

  const cadastrarMonitoramento = async (payload: CriarMonitoramentoPayload) => {
    await apiFetch("/monitoramentos", {
      method: "POST",
      auth: true,
      body: JSON.stringify(payload),
    });
    mostrarMensagem("Monitoramento cadastrado com sucesso!");
    setMostrarForm(false);
    setModoPagamentoExtra(false);
    setPixExtra(null);
    setMonitoramentoPendente(null);
    setDocumento("");
    setTipoDocumento("");
    setUfDocumento("");
    await carregar();
    await recarregarPerfilSessao();
  };

  const validarForm = (): string | null => {
    if (!tipoDocumento) return "Selecione o tipo de documento.";
    if (!documento.trim()) return "Informe o documento ou filtro.";
    if (tipoDocumento === "OAB" && !ufDocumento)
      return "Informe a UF para OAB.";
    if (tipoDocumento === "CPF" && !cpfOuCnpjValido(documento))
      return "CPF inválido.";
    if (tipoDocumento === "CNPJ" && !cpfOuCnpjValido(documento))
      return "CNPJ inválido.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    const msg = validarForm();
    if (msg) {
      setErro(msg);
      return;
    }

    const payload: CriarMonitoramentoPayload = {
      tipoDocumento: tipoDocumento as TipoDocumento,
      documento: documento.trim(),
      ufDocumento: tipoDocumento === "OAB" ? ufDocumento : undefined,
      email: email.trim() || undefined,
      fone: fone.trim() || undefined,
    };

    setSalvando(true);
    try {
      await cadastrarMonitoramento(payload);
    } catch (err) {
      if (isErroLimiteMonitoramento(err)) {
        setMonitoramentoPendente(payload);
        await carregarPixMonitoramentoExtra();
      } else {
        setErro(err instanceof Error ? err.message : "Erro ao cadastrar.");
      }
    } finally {
      setSalvando(false);
    }
  };

  const finalizarPagamentoMonitoramentoExtra = async () => {
    await recarregarPerfilSessao();
    if (!monitoramentoPendente) return;
    try {
      await cadastrarMonitoramento(monitoramentoPendente);
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : "Pagamento confirmado, mas falhou ao cadastrar o monitoramento.",
      );
      setModoPagamentoExtra(false);
      setPixExtra(null);
    }
  };

  const remover = async (id: number) => {
    const confirmado = await confirm({
      title: "Remover monitoramento",
      message: "Remover este monitoramento?",
      confirmLabel: "Remover",
      cancelLabel: "Cancelar",
      variant: "danger",
    });
    if (!confirmado) return;
    setErro(null);
    try {
      await apiFetch(`/monitoramentos/${id}`, {
        method: "DELETE",
        auth: true,
      });
      await carregar();
      await recarregarPerfilSessao();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao remover.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <section>
          <h1 className="text-2xl font-semibold uppercase text-brand-orange">
            Monitoramentos
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-panel-muted">
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              Fique por dentro de tudo.
            </strong>{" "}
            Cadastre documentos para monitorar e receba alertas por e-mail e
            WhatsApp.
          </p>
        </section>
        <button
          type="button"
          onClick={() => {
            if (!podeCadastrarMonitoramento) return;
            setMostrarForm((v) => !v);
          }}
          disabled={!podeCadastrarMonitoramento}
          title={
            !podeCadastrarMonitoramento
              ? "Renove seu plano para cadastrar monitoramentos"
              : undefined
          }
          className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-orange"
        >
          <Plus className="h-4 w-4" />
          Novo monitoramento
        </button>
      </div>

      {erro && !modoPagamentoExtra && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
          {erro}
        </div>
      )}
      {modoPagamentoExtra && pixExtra && (
        <section
          className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm space-y-4 dark:border-amber-800/40 dark:bg-panel-card"
        >
          <div>
            <h2 className="text-lg font-semibold uppercase text-brand-orange">
              Monitoramento extra
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-panel-muted">
              Você já atingiu o limite de monitoramento do seu plano, mas você
              pode adquirir monitoramentos extras.
            </p>
          </div>
          <PixPagamento
            pix={pixExtra}
            semRedirecionamento
            mensagemPosPagamento="Pagamento confirmado! Cadastrando monitoramento…"
            aoPagar={finalizarPagamentoMonitoramentoExtra}
          />
          <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-panel-border">
            <button
              type="button"
              onClick={() => {
                setModoPagamentoExtra(false);
                setPixExtra(null);
                setMonitoramentoPendente(null);
                setErro(null);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-panel-border dark:bg-panel-menu dark:text-white"
            >
              Voltar
            </button>
          </div>
        </section>
      )}
      {carregandoPixExtra && (
        <p className="text-sm text-slate-500 dark:text-panel-muted">
          Gerando PIX de monitoramento adicional…
        </p>
      )}
      {mostrarForm && podeCadastrarMonitoramento && !modoPagamentoExtra && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 dark:border-panel-border dark:bg-panel-card"
        >
          <h2 className="font-semibold text-slate-900 dark:text-white">Novo monitoramento</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
                Tipo de documento
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) =>
                  setTipoDocumento(e.target.value as TipoDocumento | "")
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-panel-border dark:bg-panel-menu dark:text-white"
              >
                <option value="">Selecione…</option>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            {tipoDocumento === "OAB" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
                  UF da OAB
                </label>
                <select
                  value={ufDocumento}
                  onChange={(e) => setUfDocumento(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-panel-border dark:bg-panel-menu dark:text-white"
                >
                  <option value="">Selecione…</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
              Documento / Filtro
            </label>
            <input
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder={placeholderDocumento(tipoDocumento)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-panel-border dark:bg-panel-menu dark:text-white"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
                E-mail para alertas
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-panel-border dark:bg-panel-menu dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
                Telefone para alertas
              </label>
              <input
                value={fone}
                onChange={(e) => setFone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-panel-border dark:bg-panel-menu dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-panel-border dark:bg-panel-menu dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
              Cadastrar
            </button>
          </div>
        </form>
      )}

      {carregando ? (
        <p className="text-sm text-slate-500 dark:text-panel-muted">Carregando…</p>
      ) : lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-panel-border dark:bg-panel-card dark:text-panel-muted">
          Nenhum monitoramento cadastrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((m) => (
            <MonitoramentoCard key={m.id} monitoramento={m} onRemover={remover} />
          ))}
        </div>
      )}
    </div>
  );
}
