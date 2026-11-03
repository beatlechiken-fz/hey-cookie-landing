"use client";
// Visor de la comanda de producción en una ventana flotante. Muestra un
// producto a la vez (pestañas) con sus secciones (bizcocho, coberturas,
// jarabe, toppings…) en tarjetas: ingredientes con cantidades ya escaladas y
// el procedimiento. Desde aquí también se descarga el PDF.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ComandaData, SeccionComanda } from "@/app/api/admin/ordenes/[id]/comanda/route";
import { descargarComandaPdf } from "@/core/helpers/generarPDF";
import { formatFechaCalendario } from "@/core/helpers/calendario";
import { PanelTabs } from "@/core/components/panel-shell/PanelTabs";

interface Props {
  ordenId: string;
  open: boolean;
  onClose: () => void;
}

const fmtCantidad = (n: number) => n.toLocaleString("es-MX", { maximumFractionDigits: 2 });

export function ComandaModal({ ordenId, open, onClose }: Props) {
  const [data, setData] = useState<ComandaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [itemSel, setItemSel] = useState("0");
  const [descargando, setDescargando] = useState(false);

  // Se vuelve a pedir cada vez que se abre, para mostrar siempre la orden al día.
  useEffect(() => {
    if (!open) return;
    let vigente = true;
    setCargando(true);
    setError(null);
    setItemSel("0");
    fetch(`/api/admin/ordenes/${ordenId}/comanda`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? r.statusText);
        return j as ComandaData;
      })
      .then((d) => vigente && setData(d))
      .catch((e) => vigente && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [open, ordenId]);

  useEffect(() => {
    if (!open) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [open, onClose]);

  async function descargar() {
    if (!data) return;
    setDescargando(true);
    try {
      await descargarComandaPdf(data);
    } catch (e) {
      setError(`No se pudo descargar: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setDescargando(false);
    }
  }

  const item = data?.items[Number(itemSel)];
  const entrega = data?.fechaEntrega
    ? formatFechaCalendario(data.fechaEntrega, { weekday: "short", day: "numeric", month: "short" }) +
      (data.horaEntrega ? ` · ${data.horaEntrega}` : "")
    : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-hc-cacao/25 backdrop-blur-[2px]"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="comanda-titulo"
              className="pointer-events-auto flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-hc-line bg-white shadow-[0_24px_64px_-16px_rgba(58,31,20,0.28)]"
            >
              {/* Encabezado */}
              <div className="relative flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-hc-line py-4 pl-5 pr-14 sm:pl-6">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-hc-soft">
                    Comanda de producción
                  </p>
                  <h2 id="comanda-titulo" className="mt-0.5 text-[20px] font-bold text-hc-ink">
                    Orden #{data?.numero ?? "…"}
                    {data?.clienteNombre && (
                      <span className="font-semibold text-hc-muted"> · {data.clienteNombre}</span>
                    )}
                  </h2>
                  {entrega && (
                    <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-hc-rose-tint px-2.5 py-1 text-[12.5px] font-semibold text-hc-rose">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      Entrega {entrega}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={descargar}
                    disabled={!data || descargando}
                    className="flex h-10 items-center gap-2 rounded-xl bg-hc-rose px-4 text-[13px] font-semibold text-white transition hover:bg-hc-rose-hover disabled:opacity-50"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                    </svg>
                    {descargando ? "Descargando…" : "Descargar PDF"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute right-3 top-4 flex h-10 w-10 items-center justify-center rounded-xl text-hc-muted transition hover:bg-hc-hover"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Productos */}
              {data && data.items.length > 1 && (
                <div className="shrink-0 border-b border-hc-line px-5 py-3 sm:px-6">
                  <PanelTabs
                    label="Productos de la orden"
                    value={itemSel}
                    onChange={setItemSel}
                    tabs={data.items.map((it, i) => ({ value: String(i), label: `${it.nombre} ×${it.cantidad}` }))}
                  />
                </div>
              )}

              {/* Cuerpo */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-hc-hover/60 px-5 py-5 sm:px-6">
                {cargando && !data && <p className="py-16 text-center text-sm text-hc-muted">Cargando comanda…</p>}
                {error && (
                  <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>
                )}

                {data?.notas && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-amber-800">Observaciones</p>
                    <p className="mt-1 whitespace-pre-line text-[13.5px] text-amber-950">{data.notas}</p>
                  </div>
                )}

                {data && data.items.length === 0 && (
                  <p className="py-16 text-center text-sm text-hc-muted">Esta orden no tiene productos.</p>
                )}

                {item && (
                  <>
                    <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-[17px] font-bold text-hc-ink">{item.nombre}</h3>
                      <span className="text-[13px] font-semibold text-hc-muted">
                        {item.cantidad} {item.cantidad === 1 ? "pieza" : "piezas"}
                        {item.diametroCm ? ` · ⌀ ${item.diametroCm} cm` : ""}
                        {item.factorVolumen !== 1 ? ` · factor ×${item.factorVolumen}` : ""}
                      </span>
                    </div>
                    {item.secciones.length === 0 ? (
                      <p className="rounded-xl border border-hc-line bg-white px-4 py-8 text-center text-sm text-hc-muted">
                        Este producto no tiene receta registrada.
                      </p>
                    ) : (
                      <div className="columns-1 gap-4 lg:columns-2">
                        {item.secciones.map((s, i) => (
                          <SeccionCard key={`${itemSel}-${i}`} seccion={s} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SeccionCard({ seccion }: { seccion: SeccionComanda }) {
  const [tipo, ...resto] = seccion.titulo.split(": ");
  const nombre = resto.join(": ");
  return (
    <section className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-hc-line bg-white">
      <header className="border-b border-hc-line px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-hc-soft">{tipo}</p>
        {nombre && <p className="text-[15px] font-bold text-hc-ink">{nombre}</p>}
        {seccion.nota && <p className="mt-1 text-[12.5px] text-hc-muted">{seccion.nota}</p>}
      </header>
      <ul className="divide-y divide-hc-line">
        {seccion.ingredientes.map((ing, i) => (
          <li key={i} className="flex items-baseline justify-between gap-3 px-4 py-2 text-[13.5px]">
            <span className="text-hc-ink">{ing.nombre}</span>
            <span className="shrink-0 tabular-nums">
              <strong className="font-bold text-hc-ink">{fmtCantidad(ing.cantidad)}</strong>
              <span className="ml-1 text-[12px] text-hc-muted">{ing.unidad}</span>
            </span>
          </li>
        ))}
      </ul>
      {seccion.procedimiento && (
        <details className="group border-t border-hc-line bg-hc-hover/70">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-[12.5px] font-semibold text-hc-rose">
            Procedimiento
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p className="whitespace-pre-line px-4 pb-4 text-[13px] leading-relaxed text-hc-muted">{seccion.procedimiento}</p>
        </details>
      )}
    </section>
  );
}
