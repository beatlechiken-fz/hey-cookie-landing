"use client";

import CakeCard from "./CakeCard";
import CakeModal from "./CakeModal";
import { useCakeModal } from "@/core/hooks/useCakeModal";
import { dessertsData } from "@/core/data/dessertsData";
import AppBar from "@/core/components/app-bar/AppBar";
import { useTranslations } from "next-intl";

export default function DessertsSection() {
  const t = useTranslations();

  const {
    isOpen,
    selectedCake,
    selectedSize,
    setSelectedSize,
    openModal,
    closeModal,
  } = useCakeModal();

  // 🔥 Agrupar por "line"
  const groupedByLine = dessertsData.reduce(
    (acc, cake) => {
      if (!acc[cake.line]) acc[cake.line] = [];
      acc[cake.line].push(cake);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return (
    <main>
      <section className="w-full max-w-6xl mx-auto px-4 py-16 space-y-20">
        {Object.entries(groupedByLine).map(([lineKey, cakes]) => (
          <div key={lineKey} className="space-y-12">
            {/* ----------------------------------------- */}
            {/*              TÍTULO DE LA LÍNEA           */}
            {/* ----------------------------------------- */}
            <h2 className="text-5xl text-center font-title text-[#DA6C94]">
              {t(`cakes.lines.${lineKey}`)}
            </h2>

            {/* ----------------------------------------- */}
            {/*             GRID DE POSTRES              */}
            {/* ----------------------------------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {cakes.map((cake) => (
                <CakeCard key={cake.id} cake={cake} onClick={openModal} />
              ))}
            </div>
          </div>
        ))}

        {isOpen && (
          <CakeModal
            cake={selectedCake}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            onClose={closeModal}
          />
        )}
      </section>
    </main>
  );
}
