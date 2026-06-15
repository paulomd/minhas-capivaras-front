export type SituacaoPix = "CRIADO" | "PAGO" | "EXPIRADO";

export type TipoPix =
  | "ASSINATURA_PLANO"
  | "RENOVACAO_PLANO"
  | "MONITORAMENTO_ADICIONAL";

export type Pix = {
  id: number;
  valor: number;
  copiaCola: string;
  txid: string;
  situacao: SituacaoPix;
  dataHoraExpiracao: string;
  dataHoraPagamento?: string | null;
  descricao?: string | null;
  tipo: TipoPix;
};

export type PixStatusResponse = {
  pago: boolean;
  situacao?: SituacaoPix;
};

export type GerarPixAssinaturaPayload = {
  planoId: number;
  periodoId: number;
};

export type PixHistoricoItem = {
  id: number;
  valor: number;
  dataHoraPagamento: string | null;
  descricao: string | null;
  tipo: TipoPix;
  situacao: SituacaoPix;
};
