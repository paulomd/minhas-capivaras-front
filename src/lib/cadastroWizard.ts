/** Passo 2 do wizard (índice 1): seleção de plano. */
export const CADASTRO_QUERY_PASSO_PLANO = "plano";

/** Renovação direta: gera PIX do plano/período atual e abre pagamento. */
export const CADASTRO_QUERY_RENOVAR = "renovar";

export function urlCadastroVerPlanos(): string {
  return `/cadastro?passo=${CADASTRO_QUERY_PASSO_PLANO}`;
}

export function urlCadastroRenovarPlanoAtual(): string {
  return `/cadastro?${CADASTRO_QUERY_RENOVAR}=1`;
}

export function lerQueryCadastro(): {
  passoPlano: boolean;
  renovar: boolean;
} {
  if (typeof window === "undefined") {
    return { passoPlano: false, renovar: false };
  }
  return queryCadastroFromSearchParams(
    new URLSearchParams(window.location.search),
  );
}

export function queryCadastroFromSearchParams(params: URLSearchParams): {
  passoPlano: boolean;
  renovar: boolean;
} {
  return {
    passoPlano: params.get("passo") === CADASTRO_QUERY_PASSO_PLANO,
    renovar: params.get(CADASTRO_QUERY_RENOVAR) === "1",
  };
}
