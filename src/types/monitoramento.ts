export type TipoDocumento = "OAB" | "CPF" | "CNPJ" | "TEXTO";

export type Monitoramento = {
  id: number;
  documento: string;
  tipoDocumento: TipoDocumento;
  ufDocumento: string | null;
  email: string | null;
  fone: string | null;
  dataUltimaConsulta: string | null;
  quantidadeNotificada: number;
  dataCadastro: string | null;
};

export type CriarMonitoramentoPayload = {
  tipoDocumento: TipoDocumento;
  documento: string;
  ufDocumento?: string;
  fone?: string;
  email?: string;
};
