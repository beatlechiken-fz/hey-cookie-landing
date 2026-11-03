// Tipos y utilidades de navegación compartidos por los paneles (admin y club).

import type { ReactNode } from "react";

export type PanelNavItem = {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
  /** Solo coincide con la ruta exacta (útil para el "Inicio" de cada panel). */
  exacto?: boolean;
};

/**
 * Un grupo sin `label` se pinta suelto (ej. el Dashboard). Con `label` es una
 * sección plegable: solo una abierta a la vez, y con el menú colapsado queda
 * su `icon` en lugar de sus ítems.
 */
export type PanelNavGroup = {
  key: string;
  label: string | null;
  icon?: ReactNode;
  items: PanelNavItem[];
};

export type PanelTitulo = { titulo: string; grupo: string | null };

export function stripLocale(pathname: string) {
  return pathname.replace(/^\/(en|es)(?=\/|$)/, "") || "/";
}

/** Ítem activo: coincidencia exacta o por prefijo. */
export function itemActivo(grupos: PanelNavGroup[], path: string): PanelNavItem | null {
  for (const g of grupos) {
    for (const it of g.items) {
      if (it.exacto ? path === it.href : path === it.href || path.startsWith(it.href + "/")) return it;
    }
  }
  return null;
}

/** Título por defecto: la etiqueta del ítem activo y su grupo. */
export function tituloPorMenu(grupos: PanelNavGroup[], path: string, respaldo: string): PanelTitulo {
  const activo = itemActivo(grupos, path);
  for (const g of grupos) {
    if (activo && g.items.some((i) => i.key === activo.key)) return { titulo: activo.label, grupo: g.label };
  }
  return { titulo: respaldo, grupo: null };
}

export function iniciales(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "HC";
}
