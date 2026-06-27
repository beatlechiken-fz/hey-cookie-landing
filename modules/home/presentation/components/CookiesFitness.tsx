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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {productos.map((p) => (
              <FitnessCard key={p.id} producto={p} onOpen={() => setSelected(p)} />
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

interface CardProps {
  producto: GalletaPublica;
  onOpen: () => void;
}

function FitnessCard({ producto, onOpen }: CardProps) {
  const imageSrc = producto.imagenUrl ?? "/img/prt-product-splash.webp";
  const precio = producto.precioEstablecido;

  return (
    <article className="flex flex-col rounded-[1.25rem] border border-[#f0e0d0] bg-[#FFFDF8] overflow-hidden shadow-[0_2px_12px_rgba(170,106,66,0.08)] hover:shadow-[0_6px_24px_rgba(170,106,66,0.16)] transition-shadow">
      {/* IMAGE */}
      <div className="relative w-full aspect-square bg-[#FFF0E6]">
        <Image
          src={imageSrc}
          alt={producto.nombre}
          fill
          className="object-contain p-3"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 px-3.5 pt-3 pb-3.5 gap-2">
        <h3 className="text-[clamp(0.78rem,1.8vw,0.95rem)] font-bold text-[#3A1F14] leading-snug line-clamp-2">
          {producto.nombre}
        </h3>

        {producto.descripcion && (
          <p className="text-[clamp(0.68rem,1.5vw,0.78rem)] text-[#6B3E26]/70 leading-relaxed line-clamp-2 italic flex-1">
            {producto.descripcion}
          </p>
        )}

        {precio != null && (
          <span className="self-start text-xs font-semibold text-[#AA6A42] bg-[#FFF0E6] border border-[#e8c4a0] rounded-md px-2 py-0.5">
            ${precio.toFixed(0)} / pz
          </span>
        )}

        <button
          onClick={onOpen}
          className="mt-1 w-full py-2 rounded-xl border border-[#DA6C94] text-[#DA6C94] text-[0.8rem] font-semibold cursor-pointer hover:bg-[#DA6C94] hover:text-white transition-colors font-body"
        >
          Ver detalles
        </button>
      </div>
    </article>
  );
}
