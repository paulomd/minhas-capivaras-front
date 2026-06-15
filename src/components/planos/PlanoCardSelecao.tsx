import { formatarMoeda } from "@/lib/format";
import { corCabecalhoPlano } from "@/lib/planoCores";
import type { Plano } from "@/types/plano";
import { PlanoBeneficios } from "./PlanoBeneficios";

type Props = {
  plano: Plano;
  selecionado: boolean;
  onSelecionar: () => void;
  compacto?: boolean;
};

export function PlanoCardSelecao({
  plano,
  selecionado,
  onSelecionar,
  compacto = false,
}: Props) {
  return (
    <button
      type="button"
      onClick={onSelecionar}
      className={`flex w-full flex-col overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:shadow-md ${
        selecionado
          ? "border-[#0077aa] shadow-[0_0_12px_rgba(0,119,170,0.3)] ring-1 ring-[#0077aa]/40"
          : "border-slate-200"
      }`}
    >
      <h3
        className={`w-full text-center font-semibold uppercase tracking-wide text-white ${
          compacto ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"
        }`}
        style={{ backgroundColor: corCabecalhoPlano(plano.nome) }}
      >
        {plano.nome}
      </h3>

      <div
        className={`flex flex-1 flex-col items-center ${
          compacto ? "px-3 pb-3 pt-2" : "px-5 pb-5 pt-4"
        }`}
      >
        <p
          className={`font-bold leading-tight text-emerald-700 drop-shadow-sm ${
            compacto ? "text-[2.75rem]" : "text-5xl"
          }`}
        >
          {formatarMoeda(plano.valorBase)}
        </p>

        {plano.descricao?.trim() && !compacto && (
          <p className="mt-1 text-center text-sm text-slate-500">
            {plano.descricao}
          </p>
        )}

        <PlanoBeneficios
          plano={plano}
          compacto={compacto}
          className={compacto ? "mt-2 w-full" : "mt-4 w-full"}
        />

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
