"use client";

import { useTranslations } from "next-intl";
import SectionCover, { type TonoPortada } from "@/core/components/section-cover/SectionCover";
import ProductGrid, { type ProductoConPrecio } from "./ProductGrid";

export type { ProductoConPrecio };

export interface HalloweenBand {
  key: "pasteles" | "reposteria" | "gelatinas" | "galletas";
  items: ProductoConPrecio[];
}

// Calabaza y lila noche se alternan: la temporada se siente como un capítulo propio.
const TONOS: TonoPortada[] = ["calabaza", "lila"];

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
        <section key={band.key} aria-label={t(`sections.${band.key}`)}>
          <SectionCover
            id={band.key}
            kicker={t("title")}
            titulo={t(`sections.${band.key}`)}
            tono={TONOS[i % TONOS.length]}
            imagen={band.items[0]?.producto.imagenUrl ?? null}
            acciones={
              i === 0 && menuPdf ? (
                <a
                  href={menuPdf}
                  download
                  className="inline-flex items-center gap-2 rounded-full bg-frambuesa px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-frambuesa-hover"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                  </svg>
                  {t("descargarMenu")}
                </a>
              ) : undefined
            }
          />
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pt-20">
            <ProductGrid items={band.items} mostrarLinea vacio={t("proximamente")} />
          </div>
        </section>
      ))}
    </div>
  );
}
