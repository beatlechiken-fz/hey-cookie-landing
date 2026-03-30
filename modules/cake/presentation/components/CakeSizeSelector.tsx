"use client";

import { cakeSizeLabels, CakeSizeKey } from "@/core/helpers/cakeSizeLabels";
import { useTranslations } from "next-intl";

interface Props {
  value: CakeSizeKey;
  onChange: (size: CakeSizeKey) => void;
  cake: any;
}

export default function CakeSizeSelector({ value, onChange, cake }: Props) {
  const t = useTranslations();

  const sizes = Object.keys(cake).filter((key) =>
    key.startsWith("size"),
  ) as CakeSizeKey[];

  return (
    <div className="flex gap-2 mt-4">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          className={`px-3 py-2 rounded-xl border text-sm transition ${
            value === size
              ? "bg-black text-white border-black"
              : "bg-white border-gray-300"
          }`}
        >
          {t(cakeSizeLabels[size])}
        </button>
      ))}
    </div>
  );
}
