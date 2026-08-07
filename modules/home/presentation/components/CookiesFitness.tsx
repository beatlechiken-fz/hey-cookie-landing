"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Icons from "@/core/assets/Icons";
import dynamic from "next/dynamic";
import type { GalletaPublica } from "./Cookies";

const CookieModal = dynamic(() => import("./CookieModal"), { ssr: false });

interface Props {
  productos: GalletaPublica[];
}

export default function CookiesFitness({ productos }: Props) {
  const t = useTranslations("cookies");
  const [selected, setSelected] = useState<GalletaPublica | null>(null);

  return (
    <main className="relative w-full overflow-x-hidden bg-gradient-to-b from-[#FAF3E0] via-[#F1DCC9] to-[#E6C7A5]">
      {/* HEADER */}
      <div className="relative z-10 pt-3 px-6 md:px-12">
        <h2 className="text-5xl text-[#DA6C94] text-center font-title">
          {t("titleFiness")}
        </h2>
        <div className="w-full flex justify-center pt-4">
          <Image src={Icons.wavesPink} alt="" width={120} height={20} />
        </div>
      </div>

      {/* GRID */}
      <section className="relative z-10 px-6 md:px-12 pt-10 pb-36">
        {productos.length === 0 ? (
          <p className="text-center text-[#AA6A42]/60 py-16 text-lg">
            Próximamente…
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 md:gap-5">
            {productos.map((p) => (
              <div
                key={p.id}
                className="w-[calc(50%-8px)] sm:w-[calc(33.333%-12px)] lg:w-[calc(25%-14px)] xl:w-[calc(20%-15px)]"
              >
                <FitnessCard producto={p} onOpen={() => setSelected(p)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BOTTOM ORGANIC SHAPE */}
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[140px] pointer-events-none"
      >
        <path
          d="M0,60 C120,100 240,20 360,60 C480,100 600,20 720,60 C840,100 960,20 1080,60 C1200,100 1320,20 1440,60 L1440,140 L0,140 Z"
          fill="#FAF3E0"
        />
      </svg>

      {/* MODAL */}
      {selected && (
        <CookieModal producto={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

const LINE_TAG: Record<string, { label: string; cls: string }> = {
  sweet:   { label: "Sweet",   cls: "bg-[#A84D66] text-white" },
  fitness: { label: "Fitness", cls: "bg-[#4A7B35] text-white" },
  healthy: { label: "Healthy", cls: "bg-[#1B7A43] text-white" },
};

interface CardProps {
  producto: GalletaPublica;
  onOpen: () => void;
}

function FitnessCard({ producto, onOpen }: CardProps) {
  const imageSrc = producto.imagenUrl ?? "/img/prt-product-splash.webp";
  const precio = producto.precioEstablecido;
  const tag = LINE_TAG[producto.linea];

  return (
    <article
      onClick={onOpen}
      className="cursor-pointer group rounded-3xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 p-4"
    >
      <div className="overflow-hidden rounded-2xl relative aspect-[4/3]">
        <Image
          src={imageSrc}
          alt={producto.nombre}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
        />
        {tag && (
          <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${tag.cls}`}>
            {tag.label}
          </span>
        )}
      </div>

      <h3 className="text-xl font-semibold mt-4 text-[#A8386A] group-hover:text-[#8f2f56] transition-colors line-clamp-2">
        {producto.nombre}
      </h3>

      {producto.descripcion && (
        <p className="text-[#6B3E26] text-sm mt-1 line-clamp-2">
          {producto.descripcion}
        </p>
      )}

      {precio != null && (
        <span className="inline-block mt-2 text-xs font-semibold text-[#8A5535] bg-[#FFF0E6] border border-[#e8c4a0] rounded-full px-3 py-0.5">
          ${precio.toFixed(0)} / pz
        </span>
      )}
    </article>
  );
}
