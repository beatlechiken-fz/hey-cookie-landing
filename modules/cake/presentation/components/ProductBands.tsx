"use client";

import { useTranslations } from "next-intl";
import SectionCover, {
  tonoHex,
  type TonoPortada,
} from "@/core/components/section-cover/SectionCover";
import { HeaderWaveRibbon } from "@/core/components/wave-divider/WaveDivider";
import ProductGrid from "./ProductGrid";
import type {
  Producto,
  LineaProducto,
} from "@/modules/admin/store/domain/entities/Producto.entity";

const LINE_ORDER: LineaProducto[] = ["sweet", "fitness", "healthy"];

// Sweet siempre rosa; Fitness y Healthy siempre verde (igual que en la home).
const TONO_LINEA: Record<LineaProducto, TonoPortada> = {
  sweet: "rosa",
  fitness: "olivo",
  healthy: "olivo",
};

interface Props {
  productos: Producto[];
  /** Precio público por id de producto (precio fijo o sugerido redondeado). */
  precios?: Record<string, number | null>;
  /** Texto pequeño sobre cada título ("Pasteles", "Gelatinas"…). */
  kicker: string;
  /** Imagen de portada propia de la sección (core/data/portadas.ts). */
  portada?: string | null;
  /** Color de lo que hay arriba; la onda de entrada baja al color de la primera franja. */
  ondaSuperior: string;
}

/**
 * Franjas de productos para pasteles / repostería / gelatinas: una por línea
 * con los productos activos. Cada franja abre con su portada corta y muestra
 * todos sus productos.
 */
export default function ProductBands({ productos, precios = {}, kicker, portada, ondaSuperior }: Props) {
  const t = useTranslations();
  const conPrecio = (items: Producto[]) =>
    items.map((producto) => ({ producto, precio: precios[producto.id] ?? null }));

  const lineas = LINE_ORDER.map((line) => ({
    key: line,
    title: t(`cakes.lines.${line}`),
    items: productos.filter((p) => p.linea === line),
  })).filter((b) => b.items.length > 0);

  return (
    <div className="relative">
      <HeaderWaveRibbon
        topFill={ondaSuperior}
        bottomFill={lineas[0] ? tonoHex(TONO_LINEA[lineas[0].key]) : "#FAF3E0"}
      />

      {lineas.map((band, i) => (
        <section key={band.key} aria-label={band.title}>
          <SectionCover
            kicker={kicker}
            titulo={band.title}
            tono={TONO_LINEA[band.key]}
            imagen={(i === 0 && portada) || band.items[0]?.imagenUrl || null}
          />
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pt-20">
            <ProductGrid items={conPrecio(band.items)} />
          </div>
        </section>
      ))}
    </div>
  );
}
