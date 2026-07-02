"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Plus, Radar } from "lucide-react";
import { useAppMessage } from "@/components/layout/AppMessageProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import {
  MonitoramentoFormDialog,
  type SalvarMonitoramentoForm,
} from "@/components/monitoramento/MonitoramentoFormDialog";
import { MonitoramentoAcoes } from "@/components/monitoramento/MonitoramentoAcoes";
import { MonitoramentoProgressoImportacao } from "@/components/monitoramento/MonitoramentoProgressoImportacao";
import { MonitoramentoTabela } from "@/components/monitoramento/MonitoramentoTabela";
import { VisualizacaoProcessosToggle } from "@/components/processo/VisualizacaoProcessosToggle";
import { PixPagamento } from "@/components/pix/PixPagamento";
import { apiFetch } from "@/lib/apiFetch";
import { formatarData } from "@/lib/format";
import { isErroLimiteMonitoramento } from "@/lib/monitoramentoErro";
import {
  obterVisualizacaoMonitoramentosSalva,
  salvarVisualizacaoMonitoramentos,
  type VisualizacaoMonitoramentos,
} from "@/lib/visualizacaoMonitoramentos";
import { obterPerfilSessao, recarregarPerfilSessao } from "@/lib/usuarioSessao";
import type { Pix } from "@/types/pix";
import type {
  CriarMonitoramentoPayload,
  Monitoramento,
  TipoDocumento,
} from "@/types/monitoramento";

const TIPOS: { value: TipoDocumento; label: string }[] = [
  { value: "OAB", label: "OAB" },
  { value: "CPF", label: "CPF" },
  { value: "CNPJ", label: "CNPJ" },
  { value: "TEXTO", label: "Texto / Filtro" },
];

function labelTipoDocumento(tipo: TipoDocumento): string {
  return TIPOS.find((t) => t.value === tipo)?.label ?? tipo;
}

type CampoMonitoramento = {
  label: string;
  valor: ReactNode;
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
    { label: "Filtro", valor: valorFiltroMonitoramento(monitoramento) },
  ];

  campos.push({
    label: "Notificações",
    valor: String(monitoramento.quantidadeNotificada ?? 0),
  });

  if (monitoramento.email) {
    campos.push({ label: "E-mail", valor: monitoramento.email });
  }

  if (monitoramento.fone) {
    campos.push({ label: "Telefone", valor: monitoramento.fone });
  }

  campos.push({
    label: "Cadastrado em",
    valor: formatarData(monitoramento.dataCadastro),
  });
  campos.push({
    label: "Última consulta",
    valor: monitoramento.importacaoEmProgresso ? (
      <MonitoramentoProgressoImportacao
        emProgresso
        percentual={monitoramento.progressoImportacaoPercentual}
        compacto
      />
    ) : (
      formatarData(monitoramento.dataUltimaConsulta)
    ),
  });

  return campos;
}

function MonitoramentoCard({
  monitoramento,
  onEditar,
  onRemover,
}: {
  monitoramento: Monitoramento;
  onEditar: (monitoramento: Monitoramento) => void;
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
                <span className="break-words">{campo.valor}</span>
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
        <MonitoramentoAcoes
          onEditar={() => onEditar(monitoramento)}
          onRemover={() => void onRemover(id)}
        />
      </div>
    </article>
  );
}

export default function MonitoramentosPage() {
  const { mostrarMensagem } = useAppMessage();
  const { confirm } = useConfirm();
  const [lista, setLista] = useState<Monitoramento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalModo, setModalModo] = useState<"criar" | "editar">("criar");
  const [monitoramentoSelecionado, setMonitoramentoSelecionado] =
    useState<Monitoramento | null>(null);
  const [salvandoModal, setSalvandoModal] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [modoPagamentoExtra, setModoPagamentoExtra] = useState(false);
  const [pixExtra, setPixExtra] = useState<Pix | null>(null);
  const [carregandoPixExtra, setCarregandoPixExtra] = useState(false);
  const [monitoramentoPendente, setMonitoramentoPendente] =
    useState<CriarMonitoramentoPayload | null>(null);
  const [emailPadrao, setEmailPadrao] = useState("");
  const [fonePadrao, setFonePadrao] = useState("");
  const [planoAtivo, setPlanoAtivo] = useState<boolean | null>(null);
  const [visualizacao, setVisualizacao] = useState<VisualizacaoMonitoramentos>(() =>
    typeof window !== "undefined" ? obterVisualizacaoMonitoramentosSalva() : "cards",
  );
  const [desktopMd, setDesktopMd] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : false,
  );

  const definirVisualizacao = (nova: VisualizacaoMonitoramentos) => {
    setVisualizacao(nova);
    salvarVisualizacaoMonitoramentos(nova);
  };

  const mostrarCards = !desktopMd || visualizacao === "cards";

  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setCarregando(true);
    }
    try {
      const dados = await apiFetch<Monitoramento[]>("/monitoramentos", {
        auth: true,
      });
      setLista(Array.isArray(dados) ? dados : []);
    } catch (e) {
      if (!silencioso) {
        setErro(e instanceof Error ? e.message : "Erro ao carregar.");
      }
    } finally {
      if (!silencioso) {
        setCarregando(false);
      }
    }
  }, []);

  const temImportacaoEmProgresso = lista.some((m) => m.importacaoEmProgresso);

  useEffect(() => {
    const perfil = obterPerfilSessao();
    if (perfil) {
      setEmailPadrao(perfil.email ?? "");
      setFonePadrao(perfil.fone ?? "");
      setPlanoAtivo(perfil.planoAtivo);
    }
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (!temImportacaoEmProgresso) {
      return;
    }
    const intervalo = window.setInterval(() => {
      void carregar(true);
    }, 5000);
    return () => window.clearInterval(intervalo);
  }, [carregar, temImportacaoEmProgresso]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const atualizar = () => setDesktopMd(mq.matches);
    atualizar();
    mq.addEventListener("change", atualizar);
    return () => mq.removeEventListener("change", atualizar);
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
    setModalAberto(false);
    setModoPagamentoExtra(false);
    setPixExtra(null);
    setMonitoramentoPendente(null);
    await carregar();
    await recarregarPerfilSessao();
  };

  const abrirCadastro = () => {
    if (!podeCadastrarMonitoramento) return;
    setModalModo("criar");
    setMonitoramentoSelecionado(null);
    setErroModal(null);
    setModalAberto(true);
  };

  const abrirEdicao = (monitoramento: Monitoramento) => {
    setModalModo("editar");
    setMonitoramentoSelecionado(monitoramento);
    setErroModal(null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (salvandoModal) return;
    setModalAberto(false);
    setMonitoramentoSelecionado(null);
    setErroModal(null);
  };

  const handleSalvarModal = async (dados: SalvarMonitoramentoForm) => {
    setSalvandoModal(true);
    setErroModal(null);
    try {
      if (dados.modo === "criar") {
        await cadastrarMonitoramento(dados.payload);
      } else {
        await apiFetch(`/monitoramentos/${dados.id}`, {
          method: "PUT",
          auth: true,
          body: JSON.stringify(dados.payload),
        });
        mostrarMensagem("Monitoramento atualizado com sucesso!");
        setModalAberto(false);
        setMonitoramentoSelecionado(null);
        await carregar();
      }
    } catch (err) {
      if (dados.modo === "criar" && isErroLimiteMonitoramento(err)) {
        setMonitoramentoPendente(dados.payload);
        setModalAberto(false);
        await carregarPixMonitoramentoExtra();
      } else {
        setErroModal(
          err instanceof Error ? err.message : "Erro ao salvar monitoramento.",
        );
      }
    } finally {
      setSalvandoModal(false);
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
          onClick={abrirCadastro}
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

      {carregando ? (
        <p className="text-sm text-slate-500 dark:text-panel-muted">Carregando…</p>
      ) : lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-panel-border dark:bg-panel-card dark:text-panel-muted">
          Nenhum monitoramento cadastrado.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 dark:border-panel-border dark:bg-panel-card dark:text-panel-muted">
            <div className="hidden md:inline-flex">
              <VisualizacaoProcessosToggle
                valor={visualizacao}
                onChange={definirVisualizacao}
              />
            </div>
            <span>
              {lista.length}{" "}
              {lista.length === 1 ? "monitoramento" : "monitoramentos"}
            </span>
          </div>

          {mostrarCards ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {lista.map((m) => (
                <MonitoramentoCard
                  key={m.id}
                  monitoramento={m}
                  onEditar={abrirEdicao}
                  onRemover={remover}
                />
              ))}
            </div>
          ) : (
            <MonitoramentoTabela
              monitoramentos={lista}
              onEditar={abrirEdicao}
              onRemover={remover}
            />
          )}
        </>
      )}

      <MonitoramentoFormDialog
        modo={modalModo}
        monitoramento={monitoramentoSelecionado}
        emailPadrao={emailPadrao}
        fonePadrao={fonePadrao}
        aberto={modalAberto}
        salvando={salvandoModal}
        erro={erroModal}
        onFechar={fecharModal}
        onSalvar={(dados) => void handleSalvarModal(dados)}
      />
    </div>
  );
}
