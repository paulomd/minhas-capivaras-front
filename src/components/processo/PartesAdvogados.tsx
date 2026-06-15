import type { LucideIcon } from "lucide-react";
import { Scale, UserRound } from "lucide-react";

export function linhasTexto(valor: string | null | undefined): string[] {
  if (!valor?.trim()) return [];
  return valor.split("\n").map((l) => l.trim()).filter(Boolean);
}

function limitarLista(itens: string[], limite?: number) {
  if (!limite || itens.length <= limite) {
    return { exibidos: itens, restantes: 0 };
  }
  return {
    exibidos: itens.slice(0, limite),
    restantes: itens.length - limite,
  };
}

export function ListaComIcones({
  itens,
  icone: Icone,
  vazio = "-",
  classNameVazio = "mt-1",
  classNameLista = "mt-2",
}: {
  itens: string[];
  icone: LucideIcon;
  vazio?: string;
  classNameVazio?: string;
  classNameLista?: string;
}) {
  if (itens.length === 0) {
    return (
      <p className={`text-sm text-slate-500 dark:text-panel-muted ${classNameVazio}`}>{vazio}</p>
    );
  }

  return (
    <ul className={`space-y-2 text-sm text-slate-700 dark:text-slate-200 ${classNameLista}`}>
      {itens.map((item, i) => (
        <li key={i} className="flex gap-2 items-start">
          <Icone
            className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange"
            strokeWidth={2}
            aria-hidden
          />
          <span className="line-clamp-2 min-w-0 break-words leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ListaComLimite({
  itens,
  limite,
  icone: Icone,
  onMaisClick,
}: {
  itens: string[];
  limite?: number;
  icone: LucideIcon;
  onMaisClick?: () => void;
}) {
  if (itens.length === 0) {
    return <p className="mt-1 text-sm text-slate-500 dark:text-panel-muted">-</p>;
  }

  const { exibidos, restantes } = limitarLista(itens, limite);

  return (
    <>
      <ListaComIcones itens={exibidos} icone={Icone} vazio="" classNameLista="mt-2" />
      {restantes > 0 &&
        (onMaisClick ? (
          <button
            type="button"
            onClick={onMaisClick}
            className="mt-2 pl-6 text-sm font-medium text-brand-blue hover:underline"
          >
            + mais {restantes}...
          </button>
        ) : (
          <p className="mt-2 pl-6 text-sm text-slate-500 dark:text-panel-muted">
            + mais {restantes}...
          </p>
        ))}
    </>
  );
}

export function AdvogadosPartesDetalhe({
  advogados,
  partes,
}: {
  advogados: { nome: string; numeroOab: string; ufOab: string }[];
  partes: { nome: string; polo: string }[];
}) {
  const advogadosTexto = advogados.map((a) => `${a.nome} (${a.numeroOab}-${a.ufOab})`);
  const partesTexto = partes.map((p) => `${p.nome} (${p.polo})`);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-panel-border dark:bg-panel-card">
        <h2 className="font-semibold text-slate-900 dark:text-white">Advogados</h2>
        <ListaComIcones
          itens={advogadosTexto}
          icone={Scale}
          vazio="Nenhum advogado."
          classNameVazio="mt-2"
        />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-panel-border dark:bg-panel-card">
        <h2 className="font-semibold text-slate-900 dark:text-white">Partes</h2>
        <ListaComIcones
          itens={partesTexto}
          icone={UserRound}
          vazio="Nenhuma parte."
          classNameVazio="mt-2"
        />
      </div>
    </div>
  );
}

export function PartesAdvogados({
  partes,
  advogados,
  limite,
  onMaisClick,
}: {
  partes: string[];
  advogados: string[];
  limite?: number;
  onMaisClick?: () => void;
}) {
  if (partes.length === 0 && advogados.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-panel-border dark:bg-panel-bg">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Advogados</h4>
        <ListaComLimite
          itens={advogados}
          limite={limite}
          icone={Scale}
          onMaisClick={onMaisClick}
        />
      </div>
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-panel-border dark:bg-panel-bg">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Partes</h4>
        <ListaComLimite
          itens={partes}
          limite={limite}
          icone={UserRound}
          onMaisClick={onMaisClick}
        />
      </div>
    </div>
  );
}
