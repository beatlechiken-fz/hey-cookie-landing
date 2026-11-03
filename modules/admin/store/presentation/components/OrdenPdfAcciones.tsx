"use client";
// Botones de PDF de una orden: cotización u orden (mientras se puede editar),
// y la comanda (siempre): verla en una ventana flotante o descargarla. Llevan su propio estado de carga y error para poder vivir
// fuera de la tarjeta, en la línea de la ruta del detalle.

import { useState } from "react";
import type { Orden } from "@/modules/admin/store/domain/entities/Orden.entity";
import { generarCotizacionPdf, generarComandaPdf } from "@/core/helpers/generarPDF";
import { ComandaModal } from "./ComandaModal";

interface Props {
  orden: Orden;
  /** Alineación de los botones y del error. */
  align?: "start" | "end";
}

export function OrdenPdfAcciones({ orden, align = "start" }: Props) {
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verComanda, setVerComanda] = useState(false);

  async function generar(accion: () => Promise<unknown>, prefijo: string) {
    setGenerando(true);
    setError(null);
    try {
      await accion();
    } catch (e) {
      setError(`${prefijo}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setGenerando(false);
    }
  }

  const puedeCotizacion = orden.status === "cotizacion" || orden.status === "en_proceso";

  return (
    <div className={`flex flex-col gap-1.5 ${align === "end" ? "items-end" : "items-start"}`}>
      <div className={`flex flex-wrap gap-2 ${align === "end" ? "justify-end" : ""}`}>
        {puedeCotizacion && (
          <button
            onClick={() => generar(() => generarCotizacionPdf(orden), "Error al generar PDF")}
            disabled={generando}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-hc-line-strong bg-white text-hc-soft text-[12px] font-semibold hover:bg-hc-hover disabled:opacity-50 transition"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="m14 2 4 4H14V2z" />
              <path d="M10 12h4M10 16h4M10 8h1" />
            </svg>
            {generando
              ? "Generando…"
              : orden.status === "cotizacion"
                ? "Generar cotización PDF"
                : "Generar orden PDF"}
          </button>
        )}
        <button
          onClick={() => setVerComanda(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-hc-rose text-white text-[12px] font-semibold hover:bg-hc-rose-hover transition"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Ver comanda
        </button>
        <button
          onClick={() => generar(() => generarComandaPdf(orden.id, orden.numero), "Error al generar comanda")}
          disabled={generando}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-hc-line-strong bg-hc-hover text-hc-soft text-[12px] font-semibold hover:bg-hc-sunken disabled:opacity-50 transition"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="2" width="6" height="4" rx="1" />
            <path d="M9 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-4" />
            <path d="M7 13h10M7 17h5" />
          </svg>
          {generando ? "Generando…" : "Descargar comanda"}
        </button>
      </div>
      {error && <p className="text-[12px] text-red-600">{error}</p>}
      <ComandaModal ordenId={orden.id} open={verComanda} onClose={() => setVerComanda(false)} />
    </div>
  );
}
