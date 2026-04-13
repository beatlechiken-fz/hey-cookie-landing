"use client";

import CakeCard from "./CakeCard";
import CakeModal from "./CakeModal";
import { useCakeModal } from "@/core/hooks/useCakeModal";
import { dessertsData } from "@/core/data/dessertsData";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Icons from "@/core/assets/Icons";

export default function DessertsSection() {
  const t = useTranslations();

  // Ahora el hook debe regresar también selectedJelly y setSelectedJelly
  const {
    isOpen,
    selectedCake,
    selectedSize,
    setSelectedSize,
    selectedJelly,
    setSelectedJelly,
    openModal,
    closeModal,
  } = useCakeModal();

  // Agrupar por "line"
  const groupedByLine = dessertsData.reduce(
    (acc, cake) => {
      if (!acc[cake.line]) acc[cake.line] = [];
      acc[cake.line].push(cake);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return (
    <main className="relative overflow-hidden">
      {/* 🎨 MANCHAS DECORATIVAS */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {[
          // 🔴 GRANDES (protagonistas)
          { side: "right", top: "55%", size: 520, opacity: 0.2 },

          // 🟠 MEDIANAS
          { side: "left", top: "6%", size: 360, opacity: 0.22 },
          { side: "left", top: "72%", size: 420, opacity: 0.17 },

          // 🟡 CHICAS
          { side: "right", top: "28%", size: 180, opacity: 0.15 },
        ].map((blob, i) => (
          <svg
            key={i}
            className={`absolute ${
              blob.side === "left"
                ? "-translate-x-1/2 left-0"
                : "translate-x-1/2 right-0"
            }`}
            style={{
              top: blob.top,
              width: blob.size,
              height: blob.size,
              opacity: blob.opacity,
            }}
            viewBox="0 0 400 400"
          >
            <circle cx="200" cy="200" r="200" fill="#C9A97E" />
          </svg>
        ))}
      </div>

      <section className=" relative w-full max-w-6xl mx-auto px-6 py-16 space-y-20">
        {Object.entries(groupedByLine).map(([lineKey, cakes]) => (
          <div key={lineKey} className="space-y-12">
            <h2 className="text-5xl text-center font-title text-[#DA6C94]">
              {t(`cakes.lines.${lineKey}`)}
              <div className="w-full flex justify-center pt-4">
                <Image src={Icons.wavesPink} alt="" width={120} height={20} />
              </div>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {cakes.map((cake) => (
                <CakeCard key={cake.id} cake={cake} onClick={openModal} />
              ))}
            </div>
          </div>
        ))}

        {/* MODAL */}
        {isOpen && (
          <CakeModal
            cake={selectedCake}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedJelly={selectedJelly}
            setSelectedJelly={setSelectedJelly}
            onClose={closeModal}
          />
        )}
      </section>
    </main>
  );
}
