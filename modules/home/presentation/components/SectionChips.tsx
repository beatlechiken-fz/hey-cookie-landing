"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Barra fija de secciones de la home: un toque y llegas a cada catálogo (todo
 * sigue visible en la página, sin carruseles). Marca la sección en pantalla.
 */

const SECCIONES = ["temporada", "galletas", "fitness", "pasteles"] as const;

export default function SectionChips() {
  const t = useTranslations("home.chips");
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    const els = SECCIONES.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el,
    );
    if (!els.length) return;
    // La sección activa es la última cuyo inicio ya pasó por debajo de la barra.
    const actualizar = () => {
      let actual: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= 120) actual = el.id;
      }
      setActiva(actual);
    };
    actualizar();
    // El scroll de la página vive en <body> (globals.css), no en window.
    const scroller = document.body;
    scroller.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("scroll", actualizar, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", actualizar);
      window.removeEventListener("scroll", actualizar);
    };
  }, []);

  return (
    <nav
      aria-label={t("label")}
      className="sticky top-0 z-40 border-b border-espresso/10 bg-crema/90 backdrop-blur supports-[backdrop-filter]:bg-crema/75"
    >
      <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 sm:justify-center sm:px-6 [scrollbar-width:none]">
        {SECCIONES.map((id) => {
          const on = activa === id;
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                aria-current={on ? "true" : undefined}
                className={`block rounded-full px-4 py-2 font-body text-sm font-semibold transition-colors ${
                  on
                    ? "bg-espresso text-crema"
                    : "bg-white/70 text-espresso hover:bg-white"
                }`}
              >
                {t(id)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
