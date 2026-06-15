export type StatusProcesso = "ATIVO" | "ARQUIVADO" | "EXCLUIDO";

export type Processo = {
  processoId: number;
  numeroProcesso: string;
  codigoClasse: string | null;
  nomeClasse: string | null;
  siglaTribunal: string | null;
  comunicacoes: number | null;
  partes: string | null;
  advogados: string | null;
  dataUltimaComunicacao: string | null;
  status: StatusProcesso;
};

export type ParteProcesso = {
  nome: string;
  polo: string;
};

export type AdvogadoProcesso = {
  nome: string;
  numeroOab: string;
  ufOab: string;
};

export type Comunicacao = {
  ids: string;
  dataDisponibilizacao: string;
  tipoComunicacao: string;
  meioCompleto: string;
  nomeOrgao: string;
  texto: string;
  link: string | null;
  partes: string | null;
  advogados: string | null;
};

export type ProcessoDetalhe = {
  id: number;
  numeroProcesso: string;
  numeroProcessoMascara: string | null;
  codigoClasse: string | null;
  nomeClasse: string | null;
  siglaTribunal: string | null;
  partes: ParteProcesso[];
  advogados: AdvogadoProcesso[];
  comunicacoes: Comunicacao[];
  status: StatusProcesso;
  totalComunicacoes?: number;
};
