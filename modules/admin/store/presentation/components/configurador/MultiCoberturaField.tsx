"use client";
// src/modules/admin/store/presentation/components/configurador/MultiCoberturaField.tsx

import { SelectField, NINGUNO } from "./SelectField";

export interface CoberturaFieldItem {
  id: string;
  saborId: string | null;
  /** Escala las cantidades/costo de ESTA cobertura o relleno en particular — 1 = normal. */
  factor?: number;
}

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface Props {
  label: string;
  items: CoberturaFieldItem[];
  onChange: (items: CoberturaFieldItem[]) => void;
  options: Option[];
  sabores: Option[];
  addLabel?: string;
  maxItems?: number;
}

/** Selector de N coberturas/rellenos, cada una con su propio sabor — todas suman al precio. */
export function MultiCoberturaField({
  label,
  items,
  onChange,
  options,
  sabores,
  addLabel = "+ Agregar",
  maxItems = 5,
}: Props) {
  const addRow = () => {
    if (items.length >= maxItems) return;
    onChange([...items, { id: "", saborId: null }]);
  };
  const removeRow = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const updateRow = (idx: number, patch: Partial<CoberturaFieldItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
          {label}
        </label>
        {items.length > 0 && (
          <span className="text-[11px] text-[#6B3E26]">
            {items.length} seleccionada{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {items.length === 0 && (
        <p className="text-[12px] text-[#AA6A42] italic">Ninguna</p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 bg-[#FFF7F0] border border-[#e8c4a0] rounded-lg p-2"
          >
            <div className="flex-1 flex flex-col gap-2">
              <SelectField
                label="Opción"
                value={item.id || NINGUNO}
                options={options}
                onChange={(v) =>
                  updateRow(idx, { id: v === NINGUNO ? "" : v, saborId: null })
                }
              />
              {item.id && sabores.length > 0 && (
                <SelectField
                  label="Sabor"
                  value={item.saborId ?? NINGUNO}
                  options={sabores}
                  onChange={(v) =>
                    updateRow(idx, { saborId: v === NINGUNO ? null : v })
                  }
                  ningunoLabel="Sin sabor"
                />
              )}
              {item.id && (
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
                    Factor
                  </label>
                  <input
                    type="number"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={item.factor ?? 1}
                    onChange={(e) =>
                      updateRow(idx, {
                        factor: Math.max(0.1, Math.min(5, Number(e.target.value) || 1)),
                      })
                    }
                    className="w-20 px-2 py-1 rounded-lg border border-[#e8c4a0] bg-white text-[#3A1F14] text-[12px] font-semibold text-center focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition"
                  />
                  <span className="text-[11px] text-[#6B3E26]">
                    × cantidad {(item.factor ?? 1) !== 1 && `(${((item.factor ?? 1) * 100).toFixed(0)}%)`}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeRow(idx)}
              className="mt-6 w-7 h-7 flex items-center justify-center rounded-full text-[#c0607a] hover:bg-[#f0e0d0] transition cursor-pointer"
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
          className="self-start text-[12px] font-semibold text-[#c0607a] hover:text-[#a84d66] transition cursor-pointer"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}
