"use client";

import { useTranslations } from "next-intl";
import { BandaTemporada, tonoHex, type TonoTemporada } from "@/core/components/section-cover/SectionCover";
import TemporadaGrid, { type ProductoTemporadaItem } from "./TemporadaGrid";
import TemporadaAcciones from "./TemporadaAcciones";

export interface TemporadaBand {
  key: "pasteles" | "reposteria" | "gelatinas" | "galletas";
  items: ProductoTemporadaItem[];
}

interface Props {
  bands: TemporadaBand[];
  tono: TonoTemporada;
  /** Namespace de textos de la temporada (messages/*.json). */
  mensajes: string;
}

/** Menú completo de la temporada activa, una franja por categoría. */
export default function TemporadaSections({ bands, tono, mensajes }: Props) {
  const t = useTranslations(mensajes);

  return (
    <div className="relative">
      {bands.map((band, i) => (
        <BandaTemporada
          key={band.key}
          id={band.key}
          tono={tono}
          kicker={t("title")}
          titulo={t(`sections.${band.key}`)}
          descripcion={i === 0 ? t("desc") : null}
          imagen={band.items[0]?.producto.imagenUrl ?? null}
          // Entre franjas la onda va al color de la siguiente portada.
          siguiente={i < bands.length - 1 ? tonoHex(tono) : "#FAF3E0"}
          acciones={i === 0 ? <TemporadaAcciones verMenu={false} /> : undefined}
        >
          <TemporadaGrid items={band.items} tono={tono} vacio={t("proximamente")} mostrarLinea />
        </BandaTemporada>
      ))}
    </div>
  );
}
