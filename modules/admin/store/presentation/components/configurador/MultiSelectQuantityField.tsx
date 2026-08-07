"use client";
// src/modules/admin/store/presentation/components/configurador/MultiSelectQuantityField.tsx

export interface QuantityFieldItem {
  id: string;
  cantidad: number;
}

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface Props {
  label: string;
  items: QuantityFieldItem[];
  options: Option[];
  onChange: (items: QuantityFieldItem[]) => void;
  ningunoLabel?: string;
  maxCantidad?: number;
}

/** Igual que MultiSelectField, pero cada chip activo lleva su propio contador de cantidad. */
export function MultiSelectQuantityField({
  label,
  items,
  options,
  onChange,
  ningunoLabel = "Ninguno",
  maxCantidad = 99,
}: Props) {
  const isNinguno = items.length === 0;
  const findItem = (id: string) => items.find((i) => i.id === id);

  const toggle = (id: string) => {
    if (findItem(id)) onChange(items.filter((i) => i.id !== id));
    else onChange([...items, { id, cantidad: 1 }]);
  };

  const setCantidad = (id: string, cantidad: number) => {
    onChange(
      items.map((i) =>
        i.id === id
          ? { ...i, cantidad: Math.max(1, Math.min(maxCantidad, cantidad)) }
          : i,
      ),
    );
  };

  const chipActive = "bg-[#c0607a] text-white border-[#c0607a]";
  const chipInactive =
    "bg-white text-[#AA6A42] border-[#e8c4a0] hover:bg-[#FFF7F0]";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
          {label}
        </label>
        {!isNinguno && (
          <span className="text-[11px] text-[#6B3E26]">
            {items.length} seleccionado{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([])}
          className={
            "px-3 py-1.5 rounded-full text-[12px] font-medium border transition cursor-pointer select-none " +
            (isNinguno ? chipActive : chipInactive)
          }
        >
          {ningunoLabel}
        </button>
        {options.map((o) => {
          const sel = findItem(o.value);
          const active = !!sel;
          return (
            <div
              key={o.value}
              className={
                "flex items-center rounded-full text-[12px] font-medium border transition select-none " +
                (active ? chipActive + " pl-3 pr-1.5 py-1" : chipInactive + " px-3 py-1.5")
              }
            >
              <button
                type="button"
                onClick={() => toggle(o.value)}
                className="cursor-pointer"
              >
                {o.label}
                {o.sublabel ? ` (${o.sublabel})` : ""}
              </button>
              {active && sel && (
                <span className="flex items-center gap-0.5 ml-1.5 bg-white/25 rounded-full">
                  <button
                    type="button"
                    onClick={() => setCantidad(o.value, sel.cantidad - 1)}
                    disabled={sel.cantidad <= 1}
                    className="w-5 h-5 flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    aria-label={`Quitar una unidad de ${o.label}`}
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-[11px] font-bold">
                    {sel.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCantidad(o.value, sel.cantidad + 1)}
                    disabled={sel.cantidad >= maxCantidad}
                    className="w-5 h-5 flex items-center justify-center disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    aria-label={`Agregar una unidad de ${o.label}`}
                  >
                    +
                  </button>
                </span>
              )}
            </div>
          );
        })}
        {options.length === 0 && (
          <span className="text-[12px] text-[#AA6A42] py-1.5">
            Sin opciones disponibles
          </span>
        )}
      </div>
    </div>
  );
}
