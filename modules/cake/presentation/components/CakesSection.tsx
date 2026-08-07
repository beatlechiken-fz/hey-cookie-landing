"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Icons from "@/core/assets/Icons";
import CakeCard from "./CakeCard";
import ProductoModal from "./ProductoModal";
import { WaveDivider } from "@/core/components/wave-divider/WaveDivider";
import type { Producto, LineaProducto } from "@/modules/admin/store/domain/entities/Producto.entity";

const LINE_ORDER: LineaProducto[] = ["sweet", "fitness", "healthy"];

// Misma pareja de degradados que Cookies.tsx / CookiesFitness.tsx en la home —
// se alternan por franja para que la firma visual del sitio sea una sola.
const BAND_GRADIENTS = [
  "bg-gradient-to-b from-[#F8EDE3] via-[#F1DCC9] to-[#E6C7A5]",
  "bg-gradient-to-b from-[#FAF3E0] via-[#F1DCC9] to-[#E6C7A5]",
];
const BAND_START_COLORS = ["#F8EDE3", "#FAF3E0"];

// Color con el que arranca lo que sigue después de la última franja de esta
// sección (CakeInfoSection, que usa bg-[#FAF3E0]) — así la última onda
// conecta con lo que realmente viene después, no con un valor inventado.
const NEXT_SECTION_COLOR = "#FAF3E0";

interface Props {
  pasteles: Producto[];
}

export default function CakesSection({ pasteles }: Props) {
  const t = useTranslations();
  const [selected, setSelected] = useState<Producto | null>(null);

  const grouped = LINE_ORDER.reduce<Record<string, Producto[]>>((acc, line) => {
    const items = pasteles.filter((p) => p.linea === line);
    if (items.length > 0) acc[line] = items;
    return acc;
  }, {});
  const entries = Object.entries(grouped);

  return (
    <div className="relative">
      {entries.length === 0 ? (
        <div className={`relative overflow-hidden ${BAND_GRADIENTS[0]}`}>
          <p className="relative z-10 text-center text-[#AA6A42]/60 py-24 text-lg">
            Próximamente…
          </p>
          <WaveDivider fill={NEXT_SECTION_COLOR} />
        </div>
      ) : (
        entries.map(([lineKey, cakes], i) => {
          const isLast = i === entries.length - 1;
          const waveFill = isLast ? NEXT_SECTION_COLOR : BAND_START_COLORS[(i + 1) % BAND_START_COLORS.length];
          return (
            <div
              key={lineKey}
              className={`relative overflow-hidden ${BAND_GRADIENTS[i % BAND_GRADIENTS.length]}`}
            >
              <div className="relative z-10 pt-16 px-6 md:px-12">
                <h2 className="text-5xl text-center font-title text-[#DA6C94]">
                  {t(`cakes.lines.${lineKey}`)}
                </h2>
                <div className="w-full flex justify-center pt-4">
                  <Image src={Icons.wavesPink} alt="" width={120} height={20} />
                </div>
              </div>

              <section className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-36">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {cakes.map((cake) => (
                    <CakeCard key={cake.id} producto={cake} onClick={setSelected} />
                  ))}
                </div>
              </section>

              <WaveDivider fill={waveFill} />
            </div>
          );
        })
      )}

      {selected && (
        <ProductoModal producto={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
