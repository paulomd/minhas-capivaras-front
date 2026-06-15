export type Plano = {
  id: number;
  nome: string;
  descricao: string;
  valorBase: number;
  valorMonitoramentoExtra: number;
  quantidadeMonitoramento: number | null;
  quantidadeNotificacoes: number | null;
};

export type PeriodoAssinatura = {
  id: number;
  nome: string;
  percentualDesconto: number;
  meses: number;
  ordem: number;
};
