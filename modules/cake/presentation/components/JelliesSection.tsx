"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Icons from "@/core/assets/Icons";
import CakeCard from "./CakeCard";
import ProductoModal from "./ProductoModal";
import type { Producto, LineaProducto } from "@/modules/admin/store/domain/entities/Producto.entity";

const LINE_ORDER: LineaProducto[] = ["sweet", "fitness", "healthy"];

interface Props {
  productos: Producto[];
}

export default function JelliesSection({ productos }: Props) {
  const t = useTranslations();
  const [selected, setSelected] = useState<Producto | null>(null);

  const grouped = LINE_ORDER.reduce<Record<string, Producto[]>>((acc, line) => {
    const items = productos.filter((p) => p.linea === line);
    if (items.length > 0) acc[line] = items;
    return acc;
  }, {});

  return (
    <main className="relative overflow-hidden">
      {/* Manchas decorativas */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {[
          { side: "right", top: "35%", size: 520, opacity: 0.2  },
          { side: "left",  top:  "6%", size: 260, opacity: 0.22 },
          { side: "left",  top: "72%", size: 420, opacity: 0.17 },
        ].map((blob, i) => (
          <svg
            key={i}
            className={`absolute ${blob.side === "left" ? "-translate-x-1/2 left-0" : "translate-x-1/2 right-0"}`}
            style={{ top: blob.top, width: blob.size, height: blob.size, opacity: blob.opacity }}
            viewBox="0 0 400 400"
          >
            <circle cx="200" cy="200" r="200" fill="#C9A97E" />
          </svg>
        ))}
      </div>

      <section className="relative z-[9] w-full max-w-6xl mx-auto px-6 py-16 space-y-20">
        {Object.keys(grouped).length === 0 ? (
          <p className="text-center text-[#AA6A42]/60 py-16 text-lg">
            Próximamente…
          </p>
        ) : (
          Object.entries(grouped).map(([lineKey, items]) => (
            <div key={lineKey} className="space-y-12">
              <h2 className="text-5xl text-center font-title text-[#DA6C94]">
                {t(`cakes.lines.${lineKey}`)}
                <div className="w-full flex justify-center pt-4">
                  <Image src={Icons.wavesPink} alt="" width={120} height={20} />
                </div>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {items.map((producto) => (
                  <CakeCard key={producto.id} producto={producto} onClick={setSelected} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {selected && (
        <ProductoModal producto={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}
