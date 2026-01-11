/* NativeSelect.tsx (React + Tailwind) */
"use client";
import React from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export default function NativeSelect({
  value,
  onChange,
  options,
  className,
}: Props) {
  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          appearance-none w-full pr-10 pl-3 py-1
          bg-[#FAF3E0] text-black rounded-2xl
          focus:outline-none focus:ring-2 focus:ring-white/30
          `}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* Arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M6 8l4 4 4-4"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
