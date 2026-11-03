"use client";
// src/modules/admin/store/presentation/components/OrdenStatusFilter.tsx
//
// Filtro multiselect por estatus de orden: chips que se activan/desactivan con
// click. Sin ninguno seleccionado = todos los estatus. En pantallas pequeñas
// la lista los muestra dentro del panel de filtros, junto a la búsqueda.

import { ORDEN_STATUS_LABELS } from "@/modules/admin/store/domain/entities/Orden.entity";
import type { OrdenStatus } from "@/modules/admin/store/domain/entities/Orden.entity";

interface Props {
  /** Estatus que se pueden elegir. */
  opciones: OrdenStatus[];
  selected: OrdenStatus[];
  onChange: (next: OrdenStatus[]) => void;
}

export function OrdenStatusFilter({ opciones, selected, onChange }: Props) {
  function toggle(s: OrdenStatus) {
    onChange(
      selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s],
    );
  }

  return (
    <div
      role="group"
      aria-label="Filtrar por estatus"
      className="flex flex-wrap items-center gap-2"
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
              "whitespace-nowrap px-3.5 py-1.5 rounded-full border text-[12px] font-semibold transition " +
              (activo
                ? "bg-hc-rose border-hc-rose text-white"
                : "bg-white border-hc-line-strong text-hc-muted hover:border-hc-rose hover:text-hc-rose")
            }
          >
            {ORDEN_STATUS_LABELS[s]}
          </button>
        );
      })}
    </div>
  );
}
