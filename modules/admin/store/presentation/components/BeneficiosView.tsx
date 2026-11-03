"use client";
// src/modules/admin/store/presentation/components/BeneficiosView.tsx
//
// Sección "Beneficios": cupones manuales (como antes) + beneficios
// automáticos (cumpleaños y los que se agreguen). Todo beneficio se entrega
// siempre como un cupón.

import { PanelTabs } from "@/core/components/panel-shell/PanelTabs";
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
      <PanelTabs
        label="Secciones de beneficios"
        tabs={TABS.map((t) => ({ value: t.key, label: t.label }))}
        value={tab}
        onChange={setTab}
      />

      {tab === "automaticos" ? <BeneficiosAutomaticosSection /> : <CuponesView />}
    </div>
  );
}
