"use client";

import { JellyTypeKey, jellyTypes } from "@/core/helpers/jellyTypeLabels";
import { CakeSizeKey } from "@/core/helpers/cakeSizeLabels";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

interface JellyProps {
  value: JellyTypeKey | null;
  onChange: (type: JellyTypeKey | null) => void;
  cake: any;
  selectedSize: CakeSizeKey | null;
}

export function JellySelector({
  value,
  onChange,
  cake,
  selectedSize,
}: JellyProps) {
  const t = useTranslations();

  const jellies = selectedSize
    ? Object.keys(cake[selectedSize] || {}).filter((k) =>
        Object.keys(jellyTypes).includes(k),
      )
    : [];

  // Auto-select si solo hay uno
  useEffect(() => {
    if (jellies.length === 1) {
      const only = jellies[0] as JellyTypeKey;
      if (value !== only) onChange(only);
    }
  }, [jellies, value]);

  if (jellies.length <= 1) return null;

  return (
    <div className="flex gap-2 mt-4">
      {jellies.map((jelly) => (
        <button
          key={jelly}
          onClick={() => onChange(jelly as JellyTypeKey)}
          style={{
            backgroundColor: value === jelly ? "#4f3517ff" : "#f5f1eb", // activo vs inactivo
            color: value === jelly ? "#ffffffff" : "#8b5e3c", // texto elegante
            borderColor: "#8b735cff", // borde sutil
            boxShadow:
              value === jelly ? "0 3px 6px rgba(155, 121, 93, 0.3)" : "none", // sombra ligera
          }}
          className="px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 hover:bg-[#e6d8c9] hover:text-[#6e4b34]"
        >
          {t(jellyTypes[jelly as JellyTypeKey])}
        </button>
      ))}
    </div>
  );
}
