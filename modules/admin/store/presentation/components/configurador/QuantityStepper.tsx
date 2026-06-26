"use client";
// src/modules/admin/store/presentation/components/configurador/QuantityStepper.tsx

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99 }: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-xl border border-[#e8c4cd] bg-white overflow-hidden">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className="w-9 h-9 flex items-center justify-center text-[#c0607a] hover:bg-[#fdf6f0] disabled:opacity-30 disabled:cursor-not-allowed transition text-lg font-bold"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="w-12 h-9 text-center text-sm font-semibold text-[#3d1a24] border-x border-[#e8c4cd] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className="w-9 h-9 flex items-center justify-center text-[#c0607a] hover:bg-[#fdf6f0] disabled:opacity-30 disabled:cursor-not-allowed transition text-lg font-bold"
      >
        +
      </button>
    </div>
  );
}
