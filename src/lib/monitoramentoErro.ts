import { ApiError } from "@/lib/apiFetch";

export function isErroLimiteMonitoramento(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (err.status !== 409) return false;
  return err.message.toLowerCase().includes("limite");
}
