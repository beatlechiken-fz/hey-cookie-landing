"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import dynamic from "next/dynamic";
import Icons from "@/core/assets/Icons";
import CakeCard from "./CakeCard";
import ProductoModal from "./ProductoModal";
import { WaveDivider } from "@/core/components/wave-divider/WaveDivider";
import type { Producto } from "@/modules/admin/store/domain/entities/Producto.entity";
import type { GalletaPublica } from "@/modules/home/presentation/components/Cookies";

const CookieModal = dynamic(
  () => import("@/modules/home/presentation/components/CookieModal"),
  { ssr: false },
);

// Misma pareja de degradados que el resto de las secciones del sitio.
const BAND_GRADIENTS = [
  "bg-gradient-to-b from-[#F8EDE3] via-[#F1DCC9] to-[#E6C7A5]",
  "bg-gradient-to-b from-[#FAF3E0] via-[#F1DCC9] to-[#E6C7A5]",
];
const BAND_START_COLORS = ["#F8EDE3", "#FAF3E0"];

export interface ProductoConPrecio {
  producto: Producto;
  precio: number | null;
}

export interface HalloweenBand {
  key: "pasteles" | "reposteria" | "gelatinas" | "galletas";
  items: ProductoConPrecio[];
}

function toGalleta(p: Producto): GalletaPublica {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    imagenUrl: p.imagenUrl,
    precioEstablecido: p.precioEstablecido,
    linea: p.linea,
    promo: p.promo,
  };
}

/** Menú de la colección Halloween & Día de muertos, por secciones. */
export default function HalloweenSections({ bands }: { bands: HalloweenBand[] }) {
  const t = useTranslations("halloween");
  const [selected, setSelected] = useState<Producto | null>(null);
  const [selectedCookie, setSelectedCookie] = useState<GalletaPublica | null>(null);

  return (
    <div className="relative">
      {bands.map((band, i) => {
        const isLast = i === bands.length - 1;
        return (
          <div
            key={band.key}
            id={band.key}
            className={`relative overflow-hidden ${BAND_GRADIENTS[i % BAND_GRADIENTS.length]}`}
          >
            <div className="relative z-10 pt-16 px-6 md:px-12">
              <h2 className="text-5xl text-center font-title text-[#DA6C94]">
                {t(`sections.${band.key}`)}
              </h2>
              <div className="w-full flex justify-center pt-4">
                <Image src={Icons.wavesPink} alt="" width={120} height={20} />
              </div>
            </div>

            <section className={`relative z-10 max-w-6xl mx-auto px-6 pt-10 ${isLast ? "pb-16" : "pb-36"}`}>
              {band.items.length === 0 ? (
                <p className="text-center text-[#AA6A42]/60 py-8 text-lg">{t("proximamente")}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {band.items.map(({ producto, precio }) => (
                    <CakeCard
                      key={producto.id}
                      producto={producto}
                      precio={precio}
                      onClick={(p) =>
                        p.categoria === "cookie" ? setSelectedCookie(toGalleta(p)) : setSelected(p)
                      }
                    />
                  ))}
                </div>
              )}
            </section>

            {!isLast && (
              <WaveDivider fill={BAND_START_COLORS[(i + 1) % BAND_START_COLORS.length]} />
            )}
          </div>
        );
      })}

      {selected && <ProductoModal producto={selected} onClose={() => setSelected(null)} />}
      {selectedCookie && (
        <CookieModal producto={selectedCookie} onClose={() => setSelectedCookie(null)} />
      )}
    </div>
  );
}
