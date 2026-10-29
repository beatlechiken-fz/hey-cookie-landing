// Navegación del panel admin: grupos del sidebar e íconos (trazos estilo lucide).

import type { ReactNode } from "react";

export type AdminNavItem = {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
};

export type AdminNavGroup = {
  key: string;
  label: string | null;
  items: AdminNavItem[];
};

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const AdminIcons = {
  dashboard: (
    <Svg>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
  ),
  ordenes: (
    <Svg>
      <path d="M4 2v20l3-2 3 2 2-1.5L14 22l3-2 3 2V2l-3 2-3-2-2 1.5L10 2 7 4Z" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </Svg>
  ),
  produccion: (
    <Svg>
      <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.46.32-.85.74-1.03A4 4 0 0 0 16.6 6a5 5 0 0 0-9.2 0 4 4 0 0 0-2.14 7.62c.42.18.74.57.74 1.03V20a1 1 0 0 0 1 1Z" />
      <path d="M6 17h12" />
    </Svg>
  ),
  servicios: (
    <Svg>
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <path d="M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01" />
    </Svg>
  ),
  clientes: (
    <Svg>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  ),
  cupones: (
    <Svg>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="m9 15 6-6M9 9h.01M15 15h.01" />
    </Svg>
  ),
  finanzas: (
    <Svg>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </Svg>
  ),
  insumos: (
    <Svg>
      <path d="M2 22 16 8" />
      <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94ZM7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94ZM11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
    </Svg>
  ),
  bizcochos: (
    <Svg>
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
      <path d="M2 21h20M12 11V7" />
      <path d="M12 7a1.5 1.5 0 0 0 1.5-1.5C13.5 4 12 3 12 3s-1.5 1-1.5 2.5A1.5 1.5 0 0 0 12 7Z" />
    </Svg>
  ),
  coberturas: (
    <Svg>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z" />
    </Svg>
  ),
  jarabes: (
    <Svg>
      <path d="M10 2v7.53a2 2 0 0 1-.21.9L4.72 20.55A1 1 0 0 0 5.6 22h12.8a1 1 0 0 0 .88-1.45l-5.07-10.12a2 2 0 0 1-.21-.9V2" />
      <path d="M8.5 2h7M7 16h10" />
    </Svg>
  ),
  gelatinas: (
    <Svg>
      <path d="M4 18h16l-1.5-9.5A2 2 0 0 0 16.5 7h-9a2 2 0 0 0-2 1.5Z" />
      <path d="M3 21h18M9 7V5a3 3 0 0 1 6 0v2" />
    </Svg>
  ),
  ornamentos: (
    <Svg>
      <path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0Z" />
      <path d="M20 3v4M22 5h-4" />
    </Svg>
  ),
  empaques: (
    <Svg>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73Z" />
      <path d="M12 22V12M3.3 7 12 12l8.7-5M7.5 4.27l9 5.15" />
    </Svg>
  ),
};

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    key: "inicio",
    label: null,
    items: [{ key: "dashboard", label: "Inicio", href: "/admin/dashboard", icon: AdminIcons.dashboard }],
  },
  {
    key: "tienda",
    label: "Tienda",
    items: [
      { key: "ordenes", label: "Órdenes", href: "/admin/dashboard/store/ordenes", icon: AdminIcons.ordenes },
      { key: "produccion", label: "Producción", href: "/admin/dashboard/store/produccion", icon: AdminIcons.produccion },
      { key: "servicios", label: "Servicios", href: "/admin/dashboard/store/servicios", icon: AdminIcons.servicios },
      { key: "clientes", label: "Clientes", href: "/admin/dashboard/store/clientes", icon: AdminIcons.clientes },
      { key: "cupones", label: "Beneficios", href: "/admin/dashboard/store/beneficios", icon: AdminIcons.cupones },
      { key: "finanzas", label: "Finanzas", href: "/admin/dashboard/store/finanzas", icon: AdminIcons.finanzas },
    ],
  },
  {
    key: "raws",
    label: "Materias primas",
    items: [
      { key: "insumos", label: "Insumos", href: "/admin/dashboard/raws/insumos", icon: AdminIcons.insumos },
      { key: "bizcochos", label: "Bizcochos", href: "/admin/dashboard/raws/bizcochos", icon: AdminIcons.bizcochos },
      { key: "coberturas", label: "Coberturas", href: "/admin/dashboard/raws/coberturas", icon: AdminIcons.coberturas },
      { key: "jarabes", label: "Jarabes", href: "/admin/dashboard/raws/jarabes", icon: AdminIcons.jarabes },
      { key: "gelatinas", label: "Gelatinas", href: "/admin/dashboard/raws/gelatinas", icon: AdminIcons.gelatinas },
      { key: "ornamentos", label: "Ornamentos", href: "/admin/dashboard/raws/ornamentos", icon: AdminIcons.ornamentos },
      { key: "empaques", label: "Empaques", href: "/admin/dashboard/raws/empaques", icon: AdminIcons.empaques },
    ],
  },
];

/** Títulos de la topbar que no salen del menú (detalles y títulos más largos). */
const TITULOS_ESPECIALES: { patron: RegExp; titulo: string; grupo: string }[] = [
  { patron: /^\/admin\/dashboard\/store\/ordenes\/[^/]+$/, titulo: "Detalle de la orden", grupo: "Órdenes" },
  { patron: /^\/admin\/dashboard\/store\/clientes\/[^/]+$/, titulo: "Detalle del cliente", grupo: "Clientes" },
  { patron: /^\/admin\/dashboard\/store\/ordenes$/, titulo: "Cotizaciones y órdenes", grupo: "Tienda" },
];

export function stripLocale(pathname: string) {
  return pathname.replace(/^\/(en|es)(?=\/|$)/, "") || "/";
}

/** Ítem activo: coincidencia exacta o por prefijo (el inicio solo exacto). */
export function itemActivo(path: string): AdminNavItem | null {
  for (const g of ADMIN_NAV) {
    for (const it of g.items) {
      if (it.key === "dashboard" ? path === it.href : path === it.href || path.startsWith(it.href + "/")) return it;
    }
  }
  return null;
}

export function tituloDe(path: string): { titulo: string; grupo: string | null } {
  const especial = TITULOS_ESPECIALES.find((t) => t.patron.test(path));
  if (especial) return { titulo: especial.titulo, grupo: especial.grupo };
  for (const g of ADMIN_NAV) {
    const it = g.items.find((i) => i.key === itemActivo(path)?.key);
    if (it) return { titulo: it.key === "dashboard" ? "Panel de control" : it.label, grupo: g.label };
  }
  return { titulo: "Panel", grupo: null };
}
