"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, useMemo, useEffect } from "react";

import { CakeSizeSelector } from "./CakeSizeSelector";
import { CakeSizeKey, sizePriority } from "@/core/helpers/cakeSizeLabels";

import { JellySelector } from "./JellyTypeSelector";
import { JellyTypeKey } from "@/core/helpers/jellyTypeLabels";

interface Props {
  cake: any;

  selectedSize: CakeSizeKey | null;
  setSelectedSize: (size: CakeSizeKey | null) => void;

  selectedJelly: JellyTypeKey | null;
  setSelectedJelly: (type: JellyTypeKey | null) => void;

  onClose: () => void;
}

export default function CakeModal({
  cake,
  selectedSize,
  setSelectedSize,
  selectedJelly,
  setSelectedJelly,
  onClose,
}: Props) {
  const t = useTranslations();

  if (!cake) return null;

  /* ----------------------------------
   * 1. Sizes
   ---------------------------------- */
  const availableSizes = sizePriority.filter((key) => cake[key]);

  useEffect(() => {
    const exists = selectedSize && cake[selectedSize];

    if (!exists) {
      const fallback = availableSizes[0] ?? null;
      if (fallback !== selectedSize) {
        setSelectedSize(fallback);
      }
    }
  }, [cake, availableSizes, selectedSize]);

  const sizeInfo = selectedSize ? (cake[selectedSize] ?? {}) : {};

  /* ----------------------------------
   * 2. Jelly (DEPENDE DEL SIZE)
   ---------------------------------- */
  const availableJellies: JellyTypeKey[] = selectedSize
    ? (Object.keys(cake[selectedSize] || {}).filter((key) =>
        ["water", "milk", "mix"].includes(key),
      ) as JellyTypeKey[])
    : [];

  useEffect(() => {
    const exists =
      selectedSize && selectedJelly && cake[selectedSize]?.[selectedJelly];

    if (!exists) {
      const fallback = availableJellies[0] ?? null;
      if (fallback !== selectedJelly) {
        setSelectedJelly(fallback);
      }
    }
  }, [selectedSize, availableJellies, selectedJelly]);

  const jellyPrice =
    selectedSize && selectedJelly
      ? Number(cake[selectedSize][selectedJelly]?.replace("$", "") || 0)
      : 0;

  /* ----------------------------------
   * 3. Extras
   ---------------------------------- */
  const cleanPrice = (p?: string) => (p ? Number(p.replace("$", "")) : 0);

  const [licor, setLicor] = useState(false);
  const [syrup, setSyrup] = useState(false);
  const [coverage, setCoverage] = useState(false);

  const totalPrice = useMemo(() => {
    const base = cleanPrice(sizeInfo.basePrice);

    const addLicor =
      licor && sizeInfo.licorPrice ? cleanPrice(sizeInfo.licorPrice) : 0;

    const addSyrup =
      syrup && sizeInfo.syrupPrice ? cleanPrice(sizeInfo.syrupPrice) : 0;

    const addCoverage =
      coverage && sizeInfo.coveragePrice
        ? cleanPrice(sizeInfo.coveragePrice)
        : 0;

    return base + jellyPrice + addLicor + addSyrup + addCoverage;
  }, [selectedSize, selectedJelly, licor, syrup, coverage]);

  /* ----------------------------------
   * 4. UI
   ---------------------------------- */
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="
        bg-[#F7EFE9]
        max-w-lg w-full
        rounded-3xl
        p-6
        relative
        shadow-2xl
        border border-[#ecd8ce]
        flex flex-col
        max-h-[90vh]
        "
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-[#7A3F3A] text-xl font-bold"
        >
          ✕
        </button>

        <div className="w-full flex-shrink">
          <Image
            src={cake.image}
            alt={t(cake.name)}
            width={500}
            height={400}
            className="
                rounded-2xl
                w-full
                h-auto
                max-h-[30vh]
                object-cover
                "
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          <h2 className="text-3xl font-bold mt-5 text-[#8b4e48] line-clamp-2">
            {t(cake.name)}
          </h2>

          <p className="text-gray-700 mt-2 text-sm">{t(cake.description)}</p>

          {/* SIZE */}
          <CakeSizeSelector
            cake={cake}
            value={selectedSize}
            onChange={setSelectedSize}
          />

          {/* JELLY */}
          <JellySelector
            cake={cake}
            value={selectedJelly}
            onChange={setSelectedJelly}
            selectedSize={selectedSize}
          />

          {/* Extras */}
          <div className="mt-6 space-y-3">
            {sizeInfo.licorPrice && (
              <SwitchRow
                label={t("cakes.licorPrice")}
                active={licor}
                price={cleanPrice(sizeInfo.licorPrice)}
                onToggle={() => setLicor((v) => !v)}
              />
            )}
          </div>

          {/* Precio */}
          <div className="mt-4 text-center">
            <p className="text-5xl font-extrabold text-[#DA6C94] mt-2">
              ${totalPrice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Switch */
function SwitchRow({
  label,
  active,
  price,
  onToggle,
}: {
  label: string;
  active: boolean;
  price: number;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex justify-between px-4 py-3 rounded-xl border`}
      style={{
        backgroundColor: active ? "#b67d9eff" : "#fdf0f1",
        color: active ? "#ffffffff" : "#a66a6a",
        borderColor: "#b86e9bff",
        boxShadow: active ? "0 3px 6px rgba(183, 109, 112, 0.3)" : "none",
      }}
    >
      <span>{label}</span>
      <span>+${price}</span>
    </button>
  );
}
