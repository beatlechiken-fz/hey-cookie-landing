"use client";
// src/modules/admin/store/presentation/components/configurador/MultiSelectField.tsx

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface Props {
  label: string;
  values: string[];
  options: Option[];
  onChange: (values: string[]) => void;
  ningunoLabel?: string;
}

const NINGUNO = "ninguno";

export function MultiSelectField({
  label,
  values,
  options,
  onChange,
  ningunoLabel = "Ninguno",
}: Props) {
  const isNinguno =
    values.length === 0 || (values.length === 1 && values[0] === NINGUNO);

  const toggle = (value: string) => {
    if (value === NINGUNO) {
      onChange([]);
      return;
    }
    const without = values.filter((v) => v !== NINGUNO);
    if (without.includes(value)) onChange(without.filter((v) => v !== value));
    else onChange([...without, value]);
  };

  const chipBase =
    "px-3 py-1.5 rounded-full text-[12px] font-medium border transition cursor-pointer select-none";
  const chipActive = "bg-[#c0607a] text-white border-[#c0607a]";
  const chipInactive =
    "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
          {label}
        </label>
        {!isNinguno && (
          <span className="text-[11px] text-[#b07a8a]">
            {values.length} seleccionado{values.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggle(NINGUNO)}
          className={chipBase + " " + (isNinguno ? chipActive : chipInactive)}
        >
          {ningunoLabel}
        </button>
        {options.map((o) => {
          const active = values.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={chipBase + " " + (active ? chipActive : chipInactive)}
            >
              {o.label}
              {o.sublabel ? ` (${o.sublabel})` : ""}
            </button>
          );
        })}
        {options.length === 0 && (
          <span className="text-[12px] text-[#c0a0a8] py-1.5">
            Sin opciones disponibles
          </span>
        )}
      </div>
    </div>
  );
}
