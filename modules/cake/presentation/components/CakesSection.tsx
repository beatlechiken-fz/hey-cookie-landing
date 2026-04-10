"use client";

import CakeCard from "./CakeCard";
import CakeModal from "./CakeModal";
import { useCakeModal } from "@/core/hooks/useCakeModal";
import { cakesData } from "@/core/data/cakesData";
import { useTranslations } from "next-intl";

export default function CakesSection() {
  const t = useTranslations();

  // Ahora también debe venir jelly
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

  // Agrupado por líneas
  const groupedByLine = cakesData.reduce(
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
            <h2 className="text-5xl text-center font-title text-[#DA6C94]">
              {t(`cakes.lines.${lineKey}`)}
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
