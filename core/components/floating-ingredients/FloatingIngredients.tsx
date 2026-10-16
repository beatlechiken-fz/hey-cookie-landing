"use client";

import { useEffect, useRef } from "react";

/**
 * Ingredientes recortados que "flotan" alrededor de una sección (rediseño
 * 2026-10, fase 5). Son decorativos: aria-hidden, sin eventos de puntero.
 *
 * - Flotan con un vaivén suave (CSS) y se desplazan un poco al hacer scroll
 *   (parallax por profundidad).
 * - Con "reducir movimiento" activado se quedan quietos.
 * - `soloDesktop` los oculta en pantallas chicas para no tapar contenido.
 */

export type Ingrediente =
  | "almendra"
  | "canela"
  | "chocolate"
  | "fresa"
  | "mango"
  | "nuez"
  | "pistache";

export interface IngredienteFlotante {
  nombre: Ingrediente;
  /** Posición con clases de Tailwind (top/left/right/bottom). */
  pos: string;
  /** Ancho con clases de Tailwind (w-16 md:w-24…). */
  size: string;
  /** Rotación base en grados. */
  rot?: number;
  /** 0 (lejos, se mueve poco y se ve desenfocado) a 1 (cerca). */
  depth?: number;
  soloDesktop?: boolean;
}

interface Props {
  items: IngredienteFlotante[];
  /** Carga inmediata (solo para el splash, que se ve al abrir la página). */
  eager?: boolean;
}

export default function FloatingIngredients({ items, eager }: Props) {
  const capa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = capa.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodos = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]"));
    let frame = 0;
    const mover = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      // Distancia del centro de la sección al centro de la pantalla.
      const delta = r.top + r.height / 2 - window.innerHeight / 2;
      for (const n of nodos) {
        const d = Number(n.dataset.depth ?? 0.5);
        n.style.translate = `0 ${(-delta * d * 0.12).toFixed(1)}px`;
      }
    };
    const pedir = () => {
      if (!frame) frame = requestAnimationFrame(mover);
    };
    mover();
    // El scroll de la página vive en <body> (globals.css), no en window.
    document.body.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(frame);
      document.body.removeEventListener("scroll", pedir);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, []);

  return (
    <div ref={capa} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5]">
      {items.map((it, i) => {
        const depth = it.depth ?? 0.5;
        return (
          <div
            key={`${it.nombre}-${i}`}
            data-depth={depth}
            className={`absolute ${it.pos} ${it.size} ${it.soloDesktop ? "hidden md:block" : ""} will-change-[translate]`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- recortes WebP ya optimizados (<20 KB), decorativos */}
            <img
              src={`/img/ingredientes/${it.nombre}.webp`}
              alt=""
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              className="hc-flotar block h-auto w-full"
              style={{
                rotate: `${it.rot ?? 0}deg`,
                filter: `${depth < 0.35 ? "blur(1.5px) " : ""}drop-shadow(0 12px 14px rgba(58,31,20,0.25))`,
                animationDelay: `${(i * 1.7) % 5}s`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
