"use client";
// src/modules/admin/finanzas/presentation/components/FinanzasView.tsx

import { useState } from "react";
import { ResumenTab } from "./ResumenTab";
import { IngresosTab } from "./IngresosTab";
import { ComprasTab } from "./ComprasTab";

type Tab = "resumen" | "ingresos" | "compras";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "resumen", label: "Resumen", icon: "📊" },
  { key: "ingresos", label: "Ingresos", icon: "💰" },
  { key: "compras", label: "Compras", icon: "🛒" },
];

// Período por defecto: año en curso
function periodoDefault() {
  const hoy = new Date().toISOString().slice(0, 10);
  const anio = hoy.slice(0, 4);
  return { desde: `${anio}-01-01`, hasta: hoy };
}

export function FinanzasView() {
  const [tab, setTab] = useState<Tab>("resumen");
  const pd = periodoDefault();
  const [desde, setDesde] = useState(pd.desde);
  const [hasta, setHasta] = useState(pd.hasta);

  const inputCls =
    "px-3 py-1.5 rounded-lg border border-[#e8c4cd] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition";

  return (
    <div className="flex flex-col gap-0">
      {/* Header con tabs y filtro de período */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        {/* Tabs */}
        <div className="flex bg-[#fdf6f0] border border-[#f5dce4] rounded-xl p-1 gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition ${
                tab === t.key
                  ? "bg-white text-[#7b2d42] shadow-sm border border-[#f5dce4]"
                  : "text-[#b07a8a] hover:text-[#7b2d42]"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filtro de período */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[11px] text-[#b07a8a] font-semibold uppercase tracking-wide">
            Período
          </span>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className={inputCls}
          />
          <span className="text-[#b07a8a]">—</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Tab content */}
      {tab === "resumen" && <ResumenTab desde={desde} hasta={hasta} />}
      {tab === "ingresos" && <IngresosTab desde={desde} hasta={hasta} />}
      {tab === "compras" && <ComprasTab desde={desde} hasta={hasta} />}
    </div>
  );
}
