export function corCabecalhoPlano(nome: string): string {
  const chave = (nome ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (chave.includes("gratuito")) return "#94a3b8";
  if (chave.includes("basico")) return "#ff8c00";
  if (chave.includes("padrao") || chave.includes("standard")) return "#1e90ff";
  if (chave.includes("profissional") || chave.includes("full")) return "#20b2aa";
  return "#F58220";
}
