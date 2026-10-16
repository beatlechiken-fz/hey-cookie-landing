"use client";

import { useTranslations } from "next-intl";
import { BandaTemporada, NOCHE_MORADO } from "@/core/components/section-cover/SectionCover";
import ProductGrid, { type ProductoConPrecio } from "./ProductGrid";

export type { ProductoConPrecio };

export interface HalloweenBand {
  key: "pasteles" | "reposteria" | "gelatinas" | "galletas";
  items: ProductoConPrecio[];
}

interface Props {
  bands: HalloweenBand[];
  /** PDF del menú de temporada; el botón va en la primera portada. */
  menuPdf?: string;
}

/** Menú de la colección Halloween & Día de muertos, por secciones. */
export default function HalloweenSections({ bands, menuPdf }: Props) {
  const t = useTranslations("halloween");

  return (
    <div className="relative">
      {bands.map((band, i) => (
        <BandaTemporada
          key={band.key}
          id={band.key}
          kicker={t("title")}
          titulo={t(`sections.${band.key}`)}
          imagen={band.items[0]?.producto.imagenUrl ?? null}
          // Entre franjas de temporada la onda va al morado de la siguiente portada.
          siguiente={i < bands.length - 1 ? NOCHE_MORADO : "#FAF3E0"}
          acciones={
            i === 0 && menuPdf ? (
              <a
                href={menuPdf}
                download
                className="inline-flex items-center gap-2 rounded-full bg-calabaza px-5 py-2.5 font-body text-sm font-semibold text-noche transition-colors hover:bg-calabaza-hover"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
                {t("descargarMenu")}
              </a>
            ) : undefined
          }
        >
          <ProductGrid items={band.items} mostrarLinea oscuro vacio={t("proximamente")} />
        </BandaTemporada>
      ))}
    </div>
  );
}
