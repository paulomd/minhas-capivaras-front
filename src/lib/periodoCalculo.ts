import type { PeriodoAssinatura } from "@/types/plano";

export function calcularValoresPeriodo(
  valorBase: number,
  periodo: PeriodoAssinatura,
) {
  const totalSemDesconto = valorBase * periodo.meses;
  const valorFinal = totalSemDesconto * (1 - periodo.percentualDesconto / 100);
  const economia = Math.round(totalSemDesconto - valorFinal);

  return { totalSemDesconto, valorFinal, economia };
}
