import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/apiBase";

type RouteContext = { params: Promise<{ path: string[] }> };

const HEADERS_IGNORADOS = new Set([
  "connection",
  "content-length",
  "host",
  "transfer-encoding",
]);

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const backendPath = `/${path.join("/")}`;
  const destino = new URL(backendPath, getBackendUrl());
  destino.search = request.nextUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (HEADERS_IGNORADOS.has(key.toLowerCase())) return;
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  const resposta = await fetch(destino, init);

  const respostaHeaders = new Headers();
  resposta.headers.forEach((value, key) => {
    if (HEADERS_IGNORADOS.has(key.toLowerCase())) return;
    respostaHeaders.set(key, value);
  });

  return new NextResponse(resposta.body, {
    status: resposta.status,
    headers: respostaHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
