"use client";
// src/modules/admin/store/presentation/components/configurador/SelectField.tsx

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  ningunoLabel?: string;
}

const NINGUNO = "ninguno";

export function SelectField({
  label,
  value,
  options,
  onChange,
  ningunoLabel = "Ninguno",
}: Props) {
  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition appearance-none cursor-pointer";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          className={inputCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value={NINGUNO}>{ningunoLabel}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
              {o.sublabel ? ` — ${o.sublabel}` : ""}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0a0a8] pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

export { NINGUNO };
