"use client";

import { useTranslations } from "next-intl";
import SectionCover, { type TonoPortada } from "@/core/components/section-cover/SectionCover";
import ProductGrid from "./ProductGrid";
import {
  COLECCIONES,
  type Producto,
  type LineaProducto,
} from "@/modules/admin/store/domain/entities/Producto.entity";

const LINE_ORDER: LineaProducto[] = ["sweet", "fitness", "healthy"];

interface Props {
  productos: Producto[];
  /** Precio público por id de producto (precio fijo o sugerido redondeado). */
  precios?: Record<string, number | null>;
  /** Texto pequeño sobre cada título ("Pasteles", "Gelatinas"…). */
  kicker: string;
  /** Tono de las franjas del catálogo regular (las colecciones van en calabaza). */
  tono: TonoPortada;
  /** Imagen de portada propia de la sección (core/data/portadas.ts). */
  portada?: string | null;
}

/**
 * Franjas de productos para pasteles / repostería / gelatinas: primero una
 * franja por colección de temporada (siempre visible; "Próximamente…" si está
 * vacía) y luego una por línea con los productos del catálogo regular. Cada
 * franja abre con su portada corta y debajo muestra todos sus productos.
 */
export default function ProductBands({ productos, precios = {}, kicker, tono, portada }: Props) {
  const t = useTranslations();

  const bands = [
    ...COLECCIONES.map((c) => ({
      key: c.value,
      title: t(`cakes.collections.${c.value}`),
      tono: "calabaza" as TonoPortada,
      items: productos.filter((p) => p.coleccion === c.value),
    })),
    ...LINE_ORDER.map((line) => ({
      key: line,
      title: t(`cakes.lines.${line}`),
      tono,
      items: productos.filter((p) => !p.coleccion && p.linea === line),
    })).filter((b) => b.items.length > 0),
  ];

  return (
    <div className="relative">
      {bands.map((band, i) => (
        <section key={band.key} aria-label={band.title}>
          <SectionCover
            kicker={kicker}
            titulo={band.title}
            tono={band.tono}
            imagen={(i === 0 && portada) || band.items[0]?.imagenUrl || null}
          />
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pt-20">
            <ProductGrid
              items={band.items.map((producto) => ({
                producto,
                precio: precios[producto.id] ?? null,
              }))}
              mostrarLinea={band.tono === "calabaza"}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
