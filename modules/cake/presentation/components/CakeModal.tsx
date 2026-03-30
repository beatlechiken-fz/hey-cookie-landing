"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, useMemo, useEffect } from "react";
import CakeSizeSelector from "./CakeSizeSelector";
import { CakeSizeKey } from "@/core/helpers/cakeSizeLabels";

interface Props {
  cake: any;
  selectedSize: CakeSizeKey | null;
  setSelectedSize: (size: CakeSizeKey | null) => void;
  onClose: () => void;
}

export default function CakeModal({
  cake,
  selectedSize,
  setSelectedSize,
  onClose,
}: Props) {
  const t = useTranslations();

  if (!cake) return null;

  const sizePriority: CakeSizeKey[] = ["sizexl", "sizel", "sizemd", "sizesm"];

  const availableSizes = sizePriority.filter((s) => cake[s]);

  useEffect(() => {
    const isValid = selectedSize && cake[selectedSize];

    // Si selectedSize no es válido, aplicar fallback
    if (!isValid) {
      const fallback = sizePriority.find((s) => cake[s]);
      if (fallback && fallback !== selectedSize) setSelectedSize(fallback);
    }
  }, [selectedSize, cake]);

  const sizeInfo = selectedSize ? (cake[selectedSize] ?? {}) : {};

  const cleanPrice = (p?: string) => (p ? Number(p.replace("$", "")) : 0);

  // Switch states
  const [licor, setLicor] = useState(false);
  const [syrup, setSyrup] = useState(false);
  const [coverage, setCoverage] = useState(false);

  // Final price calculation
  const totalPrice = useMemo(() => {
    const base = cleanPrice(sizeInfo.basePrice) || 0;
    const addLicor =
      licor && sizeInfo.licorPrice ? cleanPrice(sizeInfo.licorPrice) : 0;
    const addSyrup =
      syrup && sizeInfo.syrupPrice ? cleanPrice(sizeInfo.syrupPrice) : 0;
    const addCoverage =
      coverage && sizeInfo.coveragePrice
        ? cleanPrice(sizeInfo.coveragePrice)
        : 0;

    return base + addLicor + addSyrup + addCoverage;
  }, [selectedSize, licor, syrup, coverage]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F7EFE9] max-w-lg w-full rounded-3xl p-6 relative shadow-2xl border border-[#ecd8ce]">
        {/* Close */}
        <button
          onClick={onClose}
          className="
    absolute right-4 top-4 
    w-10 h-10 flex items-center justify-center
    rounded-full bg-white shadow-md
    text-[#7A3F3A] text-xl font-bold
    transition hover:scale-105 hover:bg-[#f7e9e7]
  "
        >
          ✕
        </button>

        {/* Image */}
        <Image
          src={cake.image}
          alt={t(cake.name)}
          width={500}
          height={400}
          className="rounded-2xl w-full h-64 object-cover shadow-sm"
        />

        {/* Title */}
        <h2 className="text-3xl font-bold mt-5 text-[#8b4e48]">
          {t(cake.name)}
        </h2>
        <p className="text-gray-700 mt-2 text-sm">{t(cake.description)}</p>

        {/* Size */}
        {availableSizes.length > 1 && selectedSize && (
          <CakeSizeSelector
            cake={cake}
            value={selectedSize}
            onChange={setSelectedSize}
          />
        )}

        {/* Add-ons */}
        <div className="mt-6 space-y-3">
          {/* LICOR */}
          {sizeInfo.licorPrice && (
            <SwitchRow
              label={t("cakes.licorPrice")}
              active={licor}
              price={cleanPrice(sizeInfo.licorPrice)}
              onToggle={() => setLicor((v) => !v)}
            />
          )}

          {sizeInfo.syrupPrice && (
            <SwitchRow
              label={t("cakes.syrupPrice")}
              active={syrup}
              price={cleanPrice(sizeInfo.syrupPrice)}
              onToggle={() => setSyrup((v) => !v)}
            />
          )}

          {sizeInfo.coveragePrice && (
            <SwitchRow
              label={t("cakes.coveragePrice")}
              active={coverage}
              price={cleanPrice(sizeInfo.coveragePrice)}
              onToggle={() => setCoverage((v) => !v)}
            />
          )}
        </div>

        {/* Final Price */}
        <div className="mt-8 text-center">
          <p className="text-lg text-gray-600">{t("cakes.finalPrice")}</p>
          <p className="text-5xl font-extrabold text-[#DA6C94] mt-2">
            ${totalPrice}
          </p>
        </div>
      </div>
    </div>
  );
}

/* Switch Component */
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
      className={`
        w-full text-left flex items-center justify-between px-4 py-3 rounded-xl border shadow-sm transition
        ${active ? "bg-[#F4E3E1] border-[#d8b4af]" : "bg-white/70 border-[#e7d5cc]"}
      `}
    >
      <div>
        <p className="font-medium text-[#8b4e48]">{label}</p>
        <p className="text-sm text-gray-500">+${price}</p>
      </div>

      {/* Toggle visual only */}
      <div
        className={`
          w-12 h-6 flex items-center rounded-full transition
          ${active ? "bg-[#d9a7a0]" : "bg-gray-300"}
        `}
      >
        <div
          className={`
            w-5 h-5 bg-white rounded-full shadow transform transition
            ${active ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </div>
    </button>
  );
}
