"use client";

import { CakeSizeKey, cakeSizeLabels } from "@/core/helpers/cakeSizeLabels";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

interface SizeProps {
  value: CakeSizeKey | null;
  onChange: (size: CakeSizeKey | null) => void;
  cake: any;
}

export function CakeSizeSelector({ value, onChange, cake }: SizeProps) {
  const t = useTranslations();

  const sizes = Object.keys(cake).filter((k) =>
    k.startsWith("size"),
  ) as CakeSizeKey[];

  // Auto-select si solo hay uno
  useEffect(() => {
    if (sizes.length === 1) {
      const onlySize = sizes[0];
      if (value !== onlySize) onChange(onlySize);
    }
  }, [sizes, value]);

  if (sizes.length <= 1) return null;

  return (
    <div className="flex gap-2 mt-4">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          style={{
            backgroundColor: value === size ? "#b67d9eff" : "#fdf0f1", // rosa pastel elegante
            color: value === size ? "#ffffffff" : "#a66a6a", // texto suave
            borderColor: "#b86e9bff", // borde delicado
            boxShadow:
              value === size ? "0 3px 6px rgba(183, 109, 112, 0.3)" : "none",
          }}
          className="px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 hover:bg-[#ffd6dc] hover:text-[#ff1493]"
        >
          {t(cakeSizeLabels[size])}
        </button>
      ))}
    </div>
  );
}
