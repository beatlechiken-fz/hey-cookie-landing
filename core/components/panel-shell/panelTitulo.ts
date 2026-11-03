"use client";
// Título de la topbar fijado por la página. El shell lo calcula desde la ruta,
// pero hay títulos que dependen de datos (p. ej. "Detalle de <cliente>"): la
// página los fija mientras está montada y al salir se vuelve al de la ruta.

import { useEffect, useSyncExternalStore } from "react";
import type { PanelTitulo } from "./panelNav";

let actual: PanelTitulo | null = null;
const avisos = new Set<() => void>();

function fijar(titulo: PanelTitulo | null) {
  actual = titulo;
  avisos.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  avisos.add(avisar);
  return () => {
    avisos.delete(avisar);
  };
}

/** El título que fijó la página, o `null` si usa el de la ruta. */
export function useTituloFijado(): PanelTitulo | null {
  return useSyncExternalStore(suscribir, () => actual, () => null);
}

/** Fija el título de la topbar mientras el componente está montado. `null` = el de la ruta. */
export function useTituloDePagina(titulo: string | null, grupo: string | null = null) {
  useEffect(() => {
    if (titulo === null) return;
    fijar({ titulo, grupo });
    return () => fijar(null);
  }, [titulo, grupo]);
}
