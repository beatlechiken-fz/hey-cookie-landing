"use client";
// src/modules/admin/store/presentation/components/configurador/MultiInsumoField.tsx

import { SelectField, NINGUNO } from "./SelectField";

export interface InsumoFieldItem {
  id: string;
  cantidad: number;
}

interface Option {
  value: string;
  label: string;
  sublabel?: string;
  unidad?: string;
}

interface Props {
  label: string;
  items: InsumoFieldItem[];
  onChange: (items: InsumoFieldItem[]) => void;
  options: Option[];
  addLabel?: string;
  maxItems?: number;
}

/** Selector de N insumos sueltos del catálogo de materias primas, cada uno con su propia cantidad exacta. */
export function MultiInsumoField({
  label,
  items,
  onChange,
  options,
  addLabel = "+ Agregar insumo",
  maxItems = 20,
}: Props) {
  const addRow = () => {
    if (items.length >= maxItems) return;
    onChange([...items, { id: "", cantidad: 1 }]);
  };
  const removeRow = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const updateRow = (idx: number, patch: Partial<InsumoFieldItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const unidadDe = (id: string) => options.find((o) => o.value === id)?.unidad ?? "";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
          {label}
        </label>
        {items.length > 0 && (
          <span className="text-[11px] text-hc-muted">
            {items.length} seleccionado{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {items.length === 0 && (
        <p className="text-[12px] text-hc-soft italic">Ninguno</p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 bg-hc-hover border border-hc-line-strong rounded-lg p-2"
          >
            <div className="flex-1 flex flex-col gap-2">
              <SelectField
                label="Insumo"
                value={item.id || NINGUNO}
                options={options}
                onChange={(v) => updateRow(idx, { id: v === NINGUNO ? "" : v })}
              />
              {item.id && (
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-hc-soft uppercase tracking-wider">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.cantidad}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      updateRow(idx, {
                        cantidad: e.target.value === "" ? 0 : Math.max(0, Number.isFinite(n) ? n : 0),
                      });
                    }}
                    className="w-24 px-2 py-1 rounded-lg border border-hc-line-strong bg-white text-hc-ink text-[12px] font-semibold text-center focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 transition"
                  />
                  <span className="text-[11px] text-hc-muted">{unidadDe(item.id)}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeRow(idx)}
              className="mt-6 w-7 h-7 flex items-center justify-center rounded-full text-hc-rose hover:bg-hc-sunken transition cursor-pointer"
              aria-label="Quitar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {items.length < maxItems && (
        <button
          type="button"
          onClick={addRow}
          className="self-start text-[12px] font-semibold text-hc-rose hover:text-hc-rose-hover transition cursor-pointer"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}
