export function corCabecalhoPeriodo(nome: string): string {
  const chave = (nome ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (chave.includes("mensal")) return "#aaaaaa";
  if (chave.includes("trimestral")) return "#ff8c00";
  if (chave.includes("semestral")) return "#1e90ff";
  if (chave.includes("anual")) return "#20b2aa";
  return "#F58220";
}
