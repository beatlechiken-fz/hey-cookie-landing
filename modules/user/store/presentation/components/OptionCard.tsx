"use client";

import Image from "next/image";

interface Props {
  id: string;
  label: string;
  description?: string | null;
  image?: string | null;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({ label, description, image, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden cursor-pointer ${
        selected
          ? "border-[#AA6A42] shadow-[0_0_0_3px_rgba(170,106,66,0.18)]"
          : "border-[#f0e0d0] hover:border-[#e8c4a0]"
      } bg-white`}
    >
      {image && (
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={label}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 45vw, 200px"
          />
        </div>
      )}
      <div className={`px-4 py-3 ${!image ? "py-4" : ""}`}>
        <p className={`font-semibold text-sm leading-snug ${selected ? "text-[#AA6A42]" : "text-[#3A1F14]"}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-[#6B3E26]/60 mt-0.5 line-clamp-2">{description}</p>
        )}
      </div>
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#AA6A42] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      )}
    </button>
  );
}
