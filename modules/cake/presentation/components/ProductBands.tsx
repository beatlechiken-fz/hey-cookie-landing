"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Icons from "@/core/assets/Icons";
import CakeCard from "./CakeCard";
import ProductoModal from "./ProductoModal";
import { WaveDivider } from "@/core/components/wave-divider/WaveDivider";
import {
  COLECCIONES,
  type Producto,
  type LineaProducto,
} from "@/modules/admin/store/domain/entities/Producto.entity";

const LINE_ORDER: LineaProducto[] = ["sweet", "fitness", "healthy"];

// Misma pareja de degradados que Cookies.tsx / CookiesFitness.tsx en la home —
// se alternan por franja para que la firma visual del sitio sea una sola.
const BAND_GRADIENTS = [
  "bg-gradient-to-b from-[#F8EDE3] via-[#F1DCC9] to-[#E6C7A5]",
  "bg-gradient-to-b from-[#FAF3E0] via-[#F1DCC9] to-[#E6C7A5]",
];
const BAND_START_COLORS = ["#F8EDE3", "#FAF3E0"];

interface Band {
  key: string;
  title: string;
  items: Producto[];
}

interface Props {
  productos: Producto[];
  /**
   * Color con el que arranca lo que sigue después de la última franja. Si se
   * pasa, la última franja cierra con una onda de ese color; si no, termina
   * sin onda (la página sigue directo al footer).
   */
  lastWaveFill?: string;
}

/**
 * Franjas de productos para pasteles / repostería / gelatinas: primero una
 * franja por colección de temporada (siempre visible; "Próximamente…" si está
 * vacía) y luego una por línea con los productos del catálogo regular.
 */
export default function ProductBands({ productos, lastWaveFill }: Props) {
  const t = useTranslations();
  const [selected, setSelected] = useState<Producto | null>(null);

  const bands: Band[] = [
    ...COLECCIONES.map((c) => ({
      key: c.value,
      title: t(`cakes.collections.${c.value}`),
      items: productos.filter((p) => p.coleccion === c.value),
    })),
    ...LINE_ORDER.map((line) => ({
      key: line,
      title: t(`cakes.lines.${line}`),
      items: productos.filter((p) => !p.coleccion && p.linea === line),
    })).filter((b) => b.items.length > 0),
  ];

  return (
    <div className="relative">
      {bands.map((band, i) => {
        const isLast = i === bands.length - 1;
        const waveFill = isLast
          ? lastWaveFill
          : BAND_START_COLORS[(i + 1) % BAND_START_COLORS.length];
        return (
          <div
            key={band.key}
            className={`relative overflow-hidden ${BAND_GRADIENTS[i % BAND_GRADIENTS.length]}`}
          >
            <div className="relative z-10 pt-16 px-6 md:px-12">
              <h2 className="text-5xl text-center font-title text-[#DA6C94]">
                {band.title}
              </h2>
              <div className="w-full flex justify-center pt-4">
                <Image src={Icons.wavesPink} alt="" width={120} height={20} />
              </div>
            </div>

            <section
              className={`relative z-10 max-w-6xl mx-auto px-6 pt-10 ${waveFill ? "pb-36" : "pb-16"}`}
            >
              {band.items.length === 0 ? (
                <p className="text-center text-[#AA6A42]/60 py-8 text-lg">
                  Próximamente…
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {band.items.map((producto) => (
                    <CakeCard key={producto.id} producto={producto} onClick={setSelected} />
                  ))}
                </div>
              )}
            </section>

            {waveFill && <WaveDivider fill={waveFill} />}
          </div>
        );
      })}

      {selected && (
        <ProductoModal producto={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
