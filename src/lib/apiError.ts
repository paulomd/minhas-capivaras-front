/**
 * Erro de negócio (mensagem) ou Bean Validation do Quarkus (violations / detail / title).
 */
export function extrairMensagemErroApi(dados: unknown): string | undefined {
  if (!dados || typeof dados !== "object") return undefined;
  const o = dados as Record<string, unknown>;
  if (typeof o.mensagem === "string" && o.mensagem.trim()) return o.mensagem.trim();
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
  if (Array.isArray(o.violations) && o.violations.length > 0) {
    const v0 = o.violations[0];
    if (v0 && typeof v0 === "object") {
      const msg = (v0 as { message?: string }).message;
      if (typeof msg === "string" && msg.trim()) return msg.trim();
    }
  }
  if (typeof o.detail === "string" && o.detail.trim()) return o.detail.trim();
  if (typeof o.title === "string" && o.title.trim()) return o.title.trim();
  return undefined;
}
