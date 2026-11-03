"use client";
// Pestañas de los paneles (admin y club): control segmentado sobre un fondo
// cálido, con la pestaña activa como pastilla blanca. Mismo estilo en todas
// las secciones.

export type PanelTab<T extends string> = { value: T; label: string };

export function PanelTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  className = "",
}: {
  tabs: PanelTab<T>[];
  value: T;
  onChange: (v: T) => void;
  /** Nombre accesible del grupo de pestañas. */
  label: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={`flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-hc-line bg-hc-hover p-1 ${className}`}
    >
      {tabs.map((t) => {
        const activa = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={activa}
            onClick={() => onChange(t.value)}
            className={`shrink-0 rounded-lg border px-5 py-2 text-[13px] font-semibold transition ${
              activa
                ? "border-hc-line bg-white text-hc-soft shadow-sm"
                : "border-transparent text-hc-muted hover:text-hc-soft"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
