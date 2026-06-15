import { Check } from "lucide-react";
import { formatarMoeda } from "@/lib/format";
import { corCabecalhoPeriodo } from "@/lib/periodoCores";
import { calcularValoresPeriodo } from "@/lib/periodoCalculo";
import type { PeriodoAssinatura } from "@/types/plano";

type Props = {
  periodo: PeriodoAssinatura;
  valorBase: number;
  selecionado: boolean;
  onSelecionar: () => void;
  compacto?: boolean;
  desabilitado?: boolean;
};

export function PeriodoCardSelecao({
  periodo,
  valorBase,
  selecionado,
  onSelecionar,
  compacto = false,
  desabilitado = false,
}: Props) {
  const { totalSemDesconto, valorFinal, economia } = calcularValoresPeriodo(
    valorBase,
    periodo,
  );
  const descontoInteiro = Math.round(periodo.percentualDesconto);

  return (
    <button
      type="button"
      onClick={onSelecionar}
      disabled={desabilitado}
      className={`flex w-full flex-col overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:shadow-md disabled:cursor-wait disabled:opacity-70 ${
        selecionado
          ? "border-[#0077aa] shadow-[0_0_12px_rgba(0,119,170,0.3)] ring-1 ring-[#0077aa]/40"
          : "border-slate-200"
      }`}
    >
      <h3
        className={`w-full text-center font-semibold uppercase tracking-wide text-white ${
          compacto ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"
        }`}
        style={{ backgroundColor: corCabecalhoPeriodo(periodo.nome) }}
      >
        {periodo.nome}
      </h3>

      <div
        className={`flex flex-1 flex-col items-center ${
          compacto ? "px-3 pb-3 pt-2" : "px-5 pb-5 pt-3"
        }`}
      >
        {periodo.meses > 1 && (
          <p className={`text-center text-slate-600 ${compacto ? "text-xs" : "text-sm"}`}>
            De{" "}
            <span className="font-semibold text-red-600 line-through">
              {formatarMoeda(totalSemDesconto)}
            </span>{" "}
            por
          </p>
        )}

        <p
          className={`font-bold leading-tight text-emerald-700 drop-shadow-sm ${
            compacto ? "mt-1 text-[2.75rem]" : "mt-2 text-5xl"
          }`}
        >
          {formatarMoeda(valorFinal)}
        </p>

        <ul
          className={`w-full text-left text-slate-600 ${
            compacto ? "mt-2 space-y-0.5 text-xs" : "mt-4 space-y-1.5 text-sm"
          }`}
        >
          <li className="flex items-start gap-1.5">
            <Check
              className={`shrink-0 text-emerald-600 ${
                compacto ? "mt-0.5 h-3 w-3" : "mt-0.5 h-4 w-4"
              }`}
            />
            <span>{descontoInteiro} % De Desconto</span>
          </li>
          <li className="flex items-start gap-1.5">
            <Check
              className={`shrink-0 text-emerald-600 ${
                compacto ? "mt-0.5 h-3 w-3" : "mt-0.5 h-4 w-4"
              }`}
            />
            <span>{formatarMoeda(economia)} de Economia</span>
          </li>
          {periodo.meses > 1 && (
            <li className="flex items-start gap-1.5">
              <Check
                className={`shrink-0 text-emerald-600 ${
                  compacto ? "mt-0.5 h-3 w-3" : "mt-0.5 h-4 w-4"
                }`}
              />
              <span>{periodo.meses} meses sem se preocupar</span>
            </li>
          )}
        </ul>

        <span
          className={`inline-flex w-full items-center justify-center rounded-lg bg-[#0077aa] font-bold text-white transition hover:bg-[#005577] ${
            compacto ? "mt-2 px-3 py-1.5 text-xs" : "mt-5 px-4 py-2.5 text-sm"
          }`}
        >
          Quero este
        </span>
      </div>
    </button>
  );
}
