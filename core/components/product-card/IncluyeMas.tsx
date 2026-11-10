"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ANCHO_PANEL = 240;
const MARGEN = 8;

interface Props {
  /** Todo lo que incluye el producto (también lo que ya se ve en la card). */
  items: string[];
  /** Cuántos no caben en la card: el chip dice "+N". */
  ocultos: number;
  /** Estilo del chip, igual al de los demás chips de la card. */
  chipClassName: string;
  /** Colores del panel flotante. */
  panelClassName: string;
  /** Color del título "Incluye" dentro del panel. */
  tituloClassName: string;
}

/**
 * Chip "+N" de lo que incluye un producto. Al hacer clic abre un panel
 * flotante con la lista completa, sin abrir el detalle del producto.
 * El panel va en un portal para que no lo recorte la card (overflow-hidden).
 */
export default function IncluyeMas({ items, ocultos, chipClassName, panelClassName, tituloClassName }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; arriba: boolean } | null>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  // Junto al chip; arriba si el chip está en la mitad baja de la pantalla.
  useLayoutEffect(() => {
    if (!abierto || !boton.current) return;
    const r = boton.current.getBoundingClientRect();
    const arriba = r.top > window.innerHeight / 2;
    const left = Math.min(Math.max(MARGEN, r.left), window.innerWidth - ANCHO_PANEL - MARGEN);
    setPos({ left, top: arriba ? r.top - 6 : r.bottom + 6, arriba });
  }, [abierto]);

  // Se cierra con clic afuera, Escape, scroll de la página o al cambiar el tamaño.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: Event) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || boton.current?.contains(t)) return;
      setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAbierto(false);
      boton.current?.focus();
    };
    const scroll = (e: Event) => {
      if (panel.current?.contains(e.target as Node)) return;
      setAbierto(false);
    };
    const cerrar = () => setAbierto(false);
    document.addEventListener("pointerdown", fuera, true);
    document.addEventListener("keydown", tecla);
    window.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", cerrar);
    return () => {
      document.removeEventListener("pointerdown", fuera, true);
      document.removeEventListener("keydown", tecla);
      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", cerrar);
    };
  }, [abierto]);

  return (
    <>
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={abierto ? id : undefined}
        aria-label={`Ver todo lo que incluye (${items.length})`}
        onClick={(e) => {
          // No abre el detalle del producto (la card entera es clicable).
          e.stopPropagation();
          e.preventDefault();
          setAbierto((a) => !a);
        }}
        onKeyDown={(e) => e.stopPropagation()}
        className={`relative z-10 cursor-pointer transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current ${chipClassName}`}
      >
        +{ocultos}
      </button>

      {abierto &&
        pos &&
        createPortal(
          <div
            ref={panel}
            id={id}
            role="dialog"
            aria-label="Incluye"
            // Los eventos de React cruzan el portal: que no lleguen a la card.
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              width: ANCHO_PANEL,
              transform: pos.arriba ? "translateY(-100%)" : undefined,
            }}
            className={`z-[60] max-h-[60vh] overflow-y-auto rounded-2xl border p-3 shadow-[0_12px_32px_-12px_rgba(58,31,20,0.35)] ${panelClassName}`}
          >
            <p className={`mb-1.5 text-[11px] font-semibold uppercase tracking-wider ${tituloClassName}`}>Incluye</p>
            <ul className="flex flex-col gap-1 text-sm leading-snug">
              {items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
                  {item}
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
