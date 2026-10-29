"use client";
// src/modules/admin/store/presentation/components/ClienteClubQrSection.tsx
//
// Tarjeta del club: QR persistente por cliente. Al escanearlo, el cliente
// llega a su cuenta (login/registro prellenado o directo al panel si ya
// tiene sesión activa).

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import QRCode from "qrcode";

interface Props {
  clienteId: string;
  qrToken: string;
  nombreCliente: string;
}

const btn =
  "px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition disabled:opacity-50";

export function ClienteClubQrSection({ clienteId, qrToken, nombreCliente }: Props) {
  const locale = useLocale();
  const [token, setToken] = useState(qrToken);
  const [qr, setQr] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [regenerando, setRegenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/club/qr/${token}`
      : null;

  useEffect(() => {
    if (!url) return;
    let vigente = true;
    QRCode.toDataURL(url, { width: 480, margin: 1, color: { dark: "#2D1B16", light: "#FFFFFF" } })
      .then((data) => vigente && setQr(data))
      .catch(() => vigente && setQr(null));
    return () => {
      vigente = false;
    };
  }, [url]);

  async function copiar() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function descargar() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `qr-club-${nombreCliente.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }

  async function regenerar() {
    if (!confirm("Esto invalida el QR actual (el impreso dejará de funcionar). ¿Continuar?"))
      return;
    setRegenerando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/clientes/${clienteId}/regenerar-qr`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo regenerar el QR");
      setToken(data.qrToken);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRegenerando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-hc-line bg-white shadow-sm p-5 flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-bold text-hc-soft">Tarjeta del club</h2>
        <p className="text-[13px] text-hc-muted">
          QR persistente de este cliente. Al escanearlo, lo lleva directo a su
          cuenta del club (cashback, cupones y pedidos).
        </p>
      </div>

      <div className="flex items-start gap-4 flex-wrap">
        {qr && (
          <img
            src={qr}
            alt="QR de la tarjeta del club"
            className="w-32 h-32 rounded-xl border border-hc-line shrink-0"
          />
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {url && (
            <div className="flex items-center gap-2 rounded-xl bg-hc-hover border border-hc-line px-3 py-2">
              <code className="flex-1 truncate text-[12px] text-hc-ink">{url}</code>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copiar}
              className={`${btn} bg-hc-rose text-white border-hc-rose hover:bg-hc-rose-hover`}
            >
              {copiado ? "¡Copiado!" : "Copiar enlace"}
            </button>
            <button
              onClick={descargar}
              disabled={!qr}
              className={`${btn} border-hc-line-strong text-hc-muted hover:bg-hc-hover`}
            >
              Descargar QR
            </button>
            <button
              onClick={regenerar}
              disabled={regenerando}
              className={`${btn} border-red-200 text-red-600 hover:bg-red-50`}
            >
              {regenerando ? "Regenerando…" : "Regenerar QR"}
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
