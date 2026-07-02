"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { Loader2, X } from "lucide-react";
import { cpfOuCnpjValido } from "@/lib/cpfCnpj";
import type {
  AtualizarMonitoramentoPayload,
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

export type SalvarMonitoramentoForm =
  | { modo: "criar"; payload: CriarMonitoramentoPayload }
  | { modo: "editar"; id: number; payload: AtualizarMonitoramentoPayload };

type Props = {
  modo: "criar" | "editar";
  monitoramento?: Monitoramento | null;
  emailPadrao?: string;
  fonePadrao?: string;
  aberto: boolean;
  salvando: boolean;
  erro: string | null;
  onFechar: () => void;
  onSalvar: (dados: SalvarMonitoramentoForm) => void;
};

const classeInput =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-panel-border dark:bg-panel-menu dark:text-white";

const classeInputDesabilitado =
  "mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-panel-border dark:bg-panel-bg dark:text-panel-muted";

export function MonitoramentoFormDialog({
  modo,
  monitoramento,
  emailPadrao = "",
  fonePadrao = "",
  aberto,
  salvando,
  erro,
  onFechar,
  onSalvar,
}: Props) {
  const idSuffix = useId();
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento | "">("");
  const [documento, setDocumento] = useState("");
  const [ufDocumento, setUfDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [fone, setFone] = useState("");
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const edicao = modo === "editar";

  useEffect(() => {
    if (!aberto) return;
    setErroLocal(null);
    if (edicao && monitoramento) {
      setTipoDocumento(monitoramento.tipoDocumento);
      setDocumento(monitoramento.documento);
      setUfDocumento(monitoramento.ufDocumento ?? "");
      setEmail(monitoramento.email ?? "");
      setFone(monitoramento.fone ?? "");
    } else {
      setTipoDocumento("");
      setDocumento("");
      setUfDocumento("");
      setEmail(emailPadrao);
      setFone(fonePadrao);
    }
  }, [aberto, edicao, monitoramento, emailPadrao, fonePadrao]);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !salvando) onFechar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [aberto, salvando, onFechar]);

  if (!aberto) {
    return null;
  }

  const validar = (): string | null => {
    if (!edicao) {
      if (!tipoDocumento) return "Selecione o tipo de documento.";
      if (!documento.trim()) return "Informe o documento ou filtro.";
      if (tipoDocumento === "OAB" && !ufDocumento) return "Informe a UF para OAB.";
      if (tipoDocumento === "CPF" && !cpfOuCnpjValido(documento)) return "CPF inválido.";
      if (tipoDocumento === "CNPJ" && !cpfOuCnpjValido(documento)) return "CNPJ inválido.";
    }
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const msg = validar();
    if (msg) {
      setErroLocal(msg);
      return;
    }
    setErroLocal(null);

    if (edicao && monitoramento) {
      onSalvar({
        modo: "editar",
        id: monitoramento.id,
        payload: {
          email: email.trim() || undefined,
          fone: fone.trim() || undefined,
        },
      });
      return;
    }

    onSalvar({
      modo: "criar",
      payload: {
        tipoDocumento: tipoDocumento as TipoDocumento,
        documento: documento.trim(),
        ufDocumento: tipoDocumento === "OAB" ? ufDocumento : undefined,
        email: email.trim() || undefined,
        fone: fone.trim() || undefined,
      },
    });
  };

  const mensagemErro = erroLocal ?? erro;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`monitoramento-form-titulo-${idSuffix}`}
      onClick={() => {
        if (!salvando) onFechar();
      }}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-8 shadow-xl dark:border-panel-border dark:bg-panel-card"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2
            id={`monitoramento-form-titulo-${idSuffix}`}
            className="text-lg font-semibold text-slate-900 dark:text-white"
          >
            {edicao ? "Editar monitoramento" : "Novo monitoramento"}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-panel-menu"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {edicao && (
          <p className="mb-4 text-sm text-slate-600 dark:text-panel-muted">
            Apenas e-mail e telefone para alertas podem ser alterados.
          </p>
        )}

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`tipo-${idSuffix}`}
                className="block text-sm font-medium text-slate-700 dark:text-panel-muted"
              >
                Tipo de documento
              </label>
              {edicao ? (
                <div className={classeInputDesabilitado}>
                  {TIPOS.find((t) => t.value === tipoDocumento)?.label ?? tipoDocumento}
                </div>
              ) : (
                <select
                  id={`tipo-${idSuffix}`}
                  value={tipoDocumento}
                  onChange={(e) =>
                    setTipoDocumento(e.target.value as TipoDocumento | "")
                  }
                  className={classeInput}
                >
                  <option value="">Selecione…</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {!edicao && tipoDocumento === "OAB" && (
              <div>
                <label
                  htmlFor={`uf-${idSuffix}`}
                  className="block text-sm font-medium text-slate-700 dark:text-panel-muted"
                >
                  UF da OAB
                </label>
                <select
                  id={`uf-${idSuffix}`}
                  value={ufDocumento}
                  onChange={(e) => setUfDocumento(e.target.value)}
                  className={classeInput}
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
            {edicao && tipoDocumento === "OAB" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-panel-muted">
                  UF da OAB
                </label>
                <div className={classeInputDesabilitado}>{ufDocumento || "—"}</div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor={`documento-${idSuffix}`}
              className="block text-sm font-medium text-slate-700 dark:text-panel-muted"
            >
              Documento / Filtro
            </label>
            {edicao ? (
              <div className={classeInputDesabilitado}>{documento}</div>
            ) : (
              <input
                id={`documento-${idSuffix}`}
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder={placeholderDocumento(tipoDocumento)}
                className={classeInput}
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`email-${idSuffix}`}
                className="block text-sm font-medium text-slate-700 dark:text-panel-muted"
              >
                E-mail para alertas
              </label>
              <input
                id={`email-${idSuffix}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={classeInput}
              />
            </div>
            <div>
              <label
                htmlFor={`fone-${idSuffix}`}
                className="block text-sm font-medium text-slate-700 dark:text-panel-muted"
              >
                Telefone para alertas
              </label>
              <input
                id={`fone-${idSuffix}`}
                type="tel"
                value={fone}
                onChange={(e) => setFone(e.target.value)}
                className={classeInput}
              />
            </div>
          </div>
        </div>

        {mensagemErro && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
            {mensagemErro}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-panel-border dark:bg-panel-menu dark:text-white disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
            {edicao ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
