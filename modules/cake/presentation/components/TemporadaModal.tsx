"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { TEMPORADA } from "@/core/data/temporada";
import { LINEA_ETIQUETA } from "@/core/components/product-card/ProductCard";
import { medidaProducto, type ProductoTemporadaItem } from "./TemporadaGrid";

const WHATSAPP = "5214433853472";

interface Props {
  item: ProductoTemporadaItem;
  onClose: () => void;
}

/**
 * Detalle de un producto de temporada: foto, descripción y lo que lleva. Sin
 * precio ni carrito; el pedido se hace por WhatsApp mientras se fijan precios.
 */
export default function TemporadaModal({ item, onClose }: Props) {
  const t = useTranslations(TEMPORADA?.mensajes ?? "navidad");
  const { producto, incluye } = item;
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const medida = medidaProducto(producto);
  const linea = LINEA_ETIQUETA[producto.linea];
  const mensaje = t("whatsappMensaje", { producto: producto.nombre });

  useEffect(() => {
    cerrarRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(18,38,28,0.6)] backdrop-blur-[4px]"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="temporada-modal-titulo"
          className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-[#FFFDF8] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={cerrarRef}
            onClick={onClose}
            aria-label={t("cerrar")}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-espresso shadow-sm transition-colors hover:bg-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          <div className="grid md:grid-cols-[5fr_7fr]">
            <div className="relative aspect-[4/3] w-full bg-pino-claro md:aspect-auto md:min-h-[400px]">
              <Image
                src={producto.imagenUrl ?? "/img/cake-cafe-sm.webp"}
                alt={producto.nombre}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 380px"
              />
            </div>

            <div className="flex flex-col gap-4 p-6 md:p-8">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-nochebuena">
                  {t("title")}
                </p>
                <h2 id="temporada-modal-titulo" className="mt-1 font-subtitle text-2xl font-bold leading-tight text-espresso">
                  {producto.nombre}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {linea && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${linea.cls}`}>{linea.label}</span>
                  )}
                  {medida && <span className="font-body text-xs text-cacao">{medida}</span>}
                </div>
                {producto.descripcion && (
                  <p className="mt-3 font-body text-sm leading-relaxed text-cacao">{producto.descripcion}</p>
                )}
              </div>

              {incluye.length > 0 && (
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wider text-espresso">{t("lleva")}</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {incluye.map((i) => (
                      <li key={i} className="rounded-full bg-tinte-menta px-2.5 py-1 font-body text-xs text-espresso">
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto flex flex-col gap-2 border-t border-[#f0e0d0] pt-4">
                <p className="font-body text-sm text-cacao">{t("precioProximamente")}</p>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-nochebuena px-5 py-3 font-body text-sm font-semibold text-crema transition-colors hover:bg-nochebuena-hover"
                >
                  {t("pedirWhatsapp")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
