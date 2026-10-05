"use client";
// src/modules/admin/store/presentation/components/FinanzasToggle.tsx
//
// Switch "Finanzas": marca una venta (orden pagada/entregada) para que cuente
// en los dashboards de finanzas. Reutilizable en lista y detalle de órdenes.

import { useState } from "react";

interface Props {
  checked: boolean;
  /** Guarda el nuevo valor; si lanza, el switch vuelve al valor anterior. */
  onChange: (next: boolean) => Promise<void> | void;
  /** Muestra la etiqueta "Finanzas" junto al switch. */
  showLabel?: boolean;
}

export function FinanzasToggle({ checked, onChange, showLabel = true }: Props) {
  const [saving, setSaving] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    // La fila/card donde vive suele navegar al detalle al hacer click.
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      await onChange(!checked);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Marcar venta para finanzas"
      disabled={saving}
      onClick={handleClick}
      className="inline-flex items-center gap-2 disabled:opacity-60 transition"
    >
      <span
        className={
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors " +
          (checked ? "bg-[#c0607a]" : "bg-[#e8c4a0]")
        }
      >
        <span
          className={
            "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform " +
            (checked ? "translate-x-[18px]" : "translate-x-0.5")
          }
        />
      </span>
      {showLabel && (
        <span className="text-[12px] font-semibold text-[#6B3E26]">Finanzas</span>
      )}
    </button>
  );
}
