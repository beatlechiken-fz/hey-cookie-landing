"use client";

import CakeCard from "./CakeCard";
import CakeModal from "./CakeModal";
import { useCakeModal } from "@/core/hooks/useCakeModal";
import { cakesData } from "@/core/data/cakesData";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Icons from "@/core/assets/Icons";

export default function CakesSection() {
  const t = useTranslations();

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

  const groupedByLine = cakesData.reduce(
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
          { side: "left", top: "15%", size: 480, opacity: 0.18 },
          { side: "right", top: "45%", size: 520, opacity: 0.2 },
          { side: "left", top: "75%", size: 440, opacity: 0.17 },

          // 🟠 MEDIANAS
          { side: "left", top: "6%", size: 260, opacity: 0.22 },
          { side: "left", top: "34%", size: 300, opacity: 0.2 },
          { side: "left", top: "52%", size: 220, opacity: 0.17 },
          { side: "right", top: "10%", size: 320, opacity: 0.21 },
          { side: "right", top: "60%", size: 260, opacity: 0.18 },
          { side: "right", top: "78%", size: 300, opacity: 0.2 },

          // 🟡 CHICAS
          { side: "left", top: "20%", size: 180, opacity: 0.16 },
          { side: "left", top: "88%", size: 160, opacity: 0.14 },
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

      {/* CONTENIDO */}
      <section className="relative z-[9] w-full max-w-6xl mx-auto px-6 py-16 space-y-20">
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
