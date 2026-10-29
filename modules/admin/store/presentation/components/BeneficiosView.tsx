"use client";
// src/modules/admin/store/presentation/components/BeneficiosView.tsx
//
// Sección "Beneficios": cupones manuales (como antes) + beneficios
// automáticos (cumpleaños y los que se agreguen). Todo beneficio se entrega
// siempre como un cupón.

import { useState } from "react";
import { CuponesView } from "./CuponesView";
import { BeneficiosAutomaticosSection } from "./BeneficiosAutomaticosSection";

type Tab = "cupones" | "automaticos";

const TABS: { key: Tab; label: string }[] = [
  { key: "automaticos", label: "Beneficios automáticos" },
  { key: "cupones", label: "Cupones" },
];

export function BeneficiosView() {
  const [tab, setTab] = useState<Tab>("automaticos");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-1 rounded-xl bg-hc-hover p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition " +
              (tab === t.key
                ? "bg-white text-hc-rose shadow-sm"
                : "text-hc-muted hover:text-hc-ink")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "automaticos" ? <BeneficiosAutomaticosSection /> : <CuponesView />}
    </div>
  );
}
