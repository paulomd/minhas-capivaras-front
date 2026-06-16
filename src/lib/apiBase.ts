/** Prefixo local — o cliente chama só este path; o backend fica no servidor. */
export const API_PROXY_BASE = "/api/backend";

/** URL do backend Quarkus (somente server-side). */
export function getBackendUrl(): string {
  return process.env.API_URL || "http://localhost:8090";
}

export function resolveApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `${API_PROXY_BASE}${normalized}`;
  }
  return `${getBackendUrl()}${normalized}`;
}
