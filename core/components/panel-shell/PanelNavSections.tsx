"use client";
// Navegación del sidebar: grupos sueltos arriba y secciones plegables tipo
// acordeón (solo una abierta). Con el menú colapsado cada sección queda como
// su ícono; tocarlo expande el menú con esa sección abierta.

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { PanelNavGroup, PanelNavItem } from "./panelNav";

const D_CHEVRON = "m6 9 6 6 6-6";

function grupoDe(nav: PanelNavGroup[], item: PanelNavItem | null): string | null {
  if (!item) return null;
  return nav.find((g) => g.label && g.items.some((i) => i.key === item.key))?.key ?? null;
}

type Props = {
  nav: PanelNavGroup[];
  activo: PanelNavItem | null;
  /** Menú colapsado a íconos (solo aplica desde md). */
  col: boolean;
  /** Con búsqueda, todas las secciones con resultados se muestran abiertas. */
  buscando: boolean;
  onExpandir: () => void;
};

export function PanelNavSections({ nav, activo, col, buscando, onExpandir }: Props) {
  // La sección abierta sigue a la página activa: al navegar a otra sección
  // (por búsqueda o un enlace) esa se abre y las demás se cierran.
  const [abierto, setAbierto] = useState(() => grupoDe(nav, activo));
  const [activoPrevio, setActivoPrevio] = useState(activo?.key);
  if (activoPrevio !== activo?.key) {
    setActivoPrevio(activo?.key);
    const g = grupoDe(nav, activo);
    if (g) setAbierto(g);
  }

  const alTocarSeccion = (key: string) => {
    if (col) {
      onExpandir();
      setAbierto(key);
      return;
    }
    setAbierto(abierto === key ? null : key);
  };

  const enlace = (it: PanelNavItem) => {
    const esActivo = activo?.key === it.key;
    return (
      <Link
        key={it.key}
        href={it.href}
        title={col ? it.label : undefined}
        aria-current={esActivo ? "page" : undefined}
        className={`group flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] transition-colors ${
          esActivo
            ? "bg-white font-semibold text-hc-ink shadow-[0_1px_3px_rgba(58,31,20,0.08)] ring-1 ring-hc-side-line"
            : "font-medium text-hc-muted hover:bg-hc-side-hover hover:text-hc-ink"
        } ${col ? "md:justify-center md:px-0" : ""}`}
      >
        <span className={esActivo ? "text-hc-rose" : "text-hc-soft group-hover:text-hc-ink"}>{it.icon}</span>
        <span className={`truncate ${col ? "md:sr-only" : ""}`}>{it.label}</span>
      </Link>
    );
  };

  return (
    <>
      {nav.length === 0 && <p className="px-3 py-2 text-[13px] text-hc-soft">Sin resultados</p>}
      {nav.map((g) => {
        if (!g.label) {
          return (
            <div key={g.key} className="mb-2 flex flex-col gap-0.5">
              {g.items.map(enlace)}
            </div>
          );
        }
        const abierta = buscando || abierto === g.key;
        const contieneActivo = grupoDe(nav, activo) === g.key;
        const idItems = `seccion-${g.key}`;
        return (
          <div key={g.key} className="flex flex-col">
            <button
              type="button"
              onClick={() => alTocarSeccion(g.key)}
              aria-expanded={abierta}
              aria-controls={idItems}
              title={col ? g.label : undefined}
              className={`group flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-colors hover:bg-hc-side-hover hover:text-hc-ink ${
                contieneActivo ? "text-hc-ink" : "text-hc-muted"
              } ${col ? "md:justify-center md:px-0" : ""}`}
            >
              {g.icon && (
                <span className={contieneActivo && col ? "text-hc-rose" : "text-hc-soft group-hover:text-hc-ink"}>{g.icon}</span>
              )}
              <span className={`flex-1 truncate text-left ${col ? "md:sr-only" : ""}`}>{g.label}</span>
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 shrink-0 text-hc-soft transition-transform duration-200 ${abierta ? "rotate-180" : ""} ${col ? "md:hidden" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d={D_CHEVRON} />
              </svg>
            </button>
            {/* Colapsado, los ítems no se pintan: la sección es solo su ícono. */}
            <div
              id={idItems}
              inert={!abierta}
              className={`grid transition-[grid-template-rows] duration-200 ${abierta ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} ${col ? "md:hidden" : ""}`}
            >
              <div className="flex flex-col gap-0.5 overflow-hidden pl-3">
                <div className="flex flex-col gap-0.5 pt-0.5 pb-1">{g.items.map(enlace)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
