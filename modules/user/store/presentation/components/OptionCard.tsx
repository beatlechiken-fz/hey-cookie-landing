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
      className={`relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${
        selected
          ? "border-2 border-[#AA6A42] shadow-[0_0_0_4px_rgba(170,106,66,0.22)]"
          : "border-2 border-[#f0e0d0] hover:border-[#e8c4a0]"
      }`}
    >
      {image ? (
        <>
          {/* Image fills the entire card */}
          <Image
            src={image}
            alt={label}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          />

          {/* Bottom gradient + label */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6">
            <p className="text-white font-semibold text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-sm">
              {label}
            </p>
            {description && (
              <p className="text-white/70 text-[10px] mt-0.5 line-clamp-1">{description}</p>
            )}
          </div>
        </>
      ) : (
        /* No image: solid card with centered text */
        <div
          className={`w-full h-full flex flex-col items-center justify-center px-3 py-4 text-center transition-colors ${
            selected ? "bg-[#FFF0E6]" : "bg-white hover:bg-[#FFF7F2]"
          }`}
        >
          <p
            className={`font-semibold text-sm leading-snug ${
              selected ? "text-[#AA6A42]" : "text-[#3A1F14]"
            }`}
          >
            {label}
          </p>
          {description && (
            <p className="text-xs text-[#6B3E26]/60 mt-1 line-clamp-2">{description}</p>
          )}
        </div>
      )}

      {/* Selection checkmark */}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#AA6A42] flex items-center justify-center shadow-sm">
          <svg
            viewBox="0 0 24 24"
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      )}
    </button>
  );
}
