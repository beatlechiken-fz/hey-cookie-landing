"use client";
// src/modules/admin/store/presentation/components/OrdenStatusFilter.tsx
//
// Filtro multiselect por estatus de orden. Pantallas grandes: chips que se
// activan/desactivan con click. Pantallas pequeñas: desplegable con casillas.
// Sin ninguno seleccionado = todos los estatus.

import { useState } from "react";
import { ORDEN_STATUS_LABELS } from "@/modules/admin/store/domain/entities/Orden.entity";
import type { OrdenStatus } from "@/modules/admin/store/domain/entities/Orden.entity";

interface Props {
  /** Estatus que se pueden elegir. */
  opciones: OrdenStatus[];
  selected: OrdenStatus[];
  onChange: (next: OrdenStatus[]) => void;
}

export function OrdenStatusFilter({ opciones, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);

  function toggle(s: OrdenStatus) {
    onChange(
      selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s],
    );
  }

  const resumen =
    selected.length === 0
      ? "Todos"
      : selected.length === 1
        ? ORDEN_STATUS_LABELS[selected[0]]
        : `${selected.length} seleccionados`;

  return (
    <>
      {/* Pantallas grandes: chips */}
      <div
        role="group"
        aria-label="Filtrar por estatus"
        className="hidden md:flex flex-wrap items-center gap-2"
      >
        {opciones.map((s) => {
          const activo = selected.includes(s);
          return (
            <button
              key={s}
              type="button"
              aria-pressed={activo}
              onClick={() => toggle(s)}
              className={
                "px-3.5 py-1.5 rounded-full border text-[12px] font-semibold transition " +
                (activo
                  ? "bg-[#c0607a] border-[#c0607a] text-white"
                  : "bg-white border-[#e8c4a0] text-[#6B3E26] hover:border-[#c0607a] hover:text-[#c0607a]")
              }
            >
              {ORDEN_STATUS_LABELS[s]}
            </button>
          );
        })}
      </div>

      {/* Pantallas pequeñas: multiselect */}
      <div className="md:hidden relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-[#e8c4a0] bg-white text-sm text-[#3d1a24]"
        >
          <span>
            <span className="text-[#AA6A42]">Estatus: </span>
            <span className="font-semibold">{resumen}</span>
          </span>
          <svg
            viewBox="0 0 24 24"
            className={"w-4 h-4 text-[#6B3E26] transition-transform " + (open ? "rotate-180" : "")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div
              role="listbox"
              aria-multiselectable="true"
              className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-[#f0e0d0] bg-white shadow-lg overflow-hidden"
            >
              {opciones.map((s) => {
                const activo = selected.includes(s);
                return (
                  <label
                    key={s}
                    role="option"
                    aria-selected={activo}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[#3d1a24] border-b border-[#f9eef2] last:border-b-0 cursor-pointer active:bg-[#FFF7F0]"
                  >
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={() => toggle(s)}
                      className="w-4 h-4 accent-[#c0607a]"
                    />
                    {ORDEN_STATUS_LABELS[s]}
                  </label>
                );
              })}
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="w-full px-4 py-3 text-left text-[13px] font-semibold text-[#AA6A42] bg-[#FFF7F0]"
                >
                  Limpiar selección
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
