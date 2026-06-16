"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, CheckCircle2 } from "lucide-react";
import QRCode from "qrcode";
import { obterToken } from "@/lib/apiFetch";
import { iniciarPollingPixStatus } from "@/lib/pixPolling";
import { formatarMoeda } from "@/lib/format";
import type { Pix } from "@/types/pix";

type Props = {
  pix: Pix;
  aoPagar?: () => void;
  redirecionarAposPago?: string;
  mensagemPosPagamento?: string;
};

export function PixPagamento({
  pix,
  aoPagar,
  redirecionarAposPago = "/login",
  mensagemPosPagamento = "Pagamento confirmado! Redirecionando…",
}: Props) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiado, setCopiado] = useState(false);
  const [pago, setPago] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !pix.copiaCola) return;
    QRCode.toCanvas(canvasRef.current, pix.copiaCola, { width: 250 }).catch(
      console.error,
    );
  }, [pix.copiaCola]);

  useEffect(() => {
    const parar = iniciarPollingPixStatus(
      pix.id,
      {
        onPago: () => {
          setPago(true);
          aoPagar?.();
          window.setTimeout(() => {
            router.push(redirecionarAposPago);
          }, 2000);
        },
      },
      { token: obterToken(), intervaloMs: 2000 },
    );
    return parar;
  }, [pix.id, aoPagar, redirecionarAposPago, router]);

  const copiarPix = async () => {
    try {
      await navigator.clipboard.writeText(pix.copiaCola);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = pix.copiaCola;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    }
  };

  if (pago) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        <p className="text-lg font-semibold text-emerald-900">
          {mensagemPosPagamento}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-slate-600">Valor a pagar</p>
        <p className="text-3xl font-bold text-emerald-700">
          {formatarMoeda(pix.valor)}
        </p>
      </div>

      <p className="text-center text-sm text-slate-600">
        Copie o código Pix abaixo ou leia o QR Code com seu aplicativo
        bancário. Após o pagamento, aguarde alguns segundos para confirmação
        automática.
      </p>

      <div className="flex items-start gap-2">
        <textarea
          readOnly
          rows={4}
          value={pix.copiaCola}
          className="min-w-0 flex-1 resize-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-800"
        />
        <button
          type="button"
          onClick={() => void copiarPix()}
          className="shrink-0 rounded-lg border border-slate-300 bg-white p-3 text-slate-700 hover:bg-slate-50"
          aria-label="Copiar código Pix"
        >
          <Copy className="h-5 w-5" />
        </button>
      </div>

      {copiado && (
        <p className="text-center text-sm font-medium text-emerald-700">
          Pix copiado!
        </p>
      )}

      <div className="flex justify-center">
        <canvas ref={canvasRef} className="rounded-lg border border-slate-200" />
      </div>
    </div>
  );
}
