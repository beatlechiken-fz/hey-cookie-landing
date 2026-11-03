"use client";
// Shell del club (clientes): el PanelShell compartido con el menú del club.

import type { ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { PanelShell } from "@/core/components/panel-shell/PanelShell";
import { itemActivo, type PanelNavGroup, type PanelTitulo } from "@/core/components/panel-shell/panelNav";

function Svg({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const CLUB_NAV: PanelNavGroup[] = [
  {
    key: "club",
    label: null,
    items: [
      {
        key: "inicio",
        label: "Inicio",
        href: "/club/dashboard",
        exacto: true,
        icon: <Svg d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />,
      },
      {
        key: "perfil",
        label: "Mi perfil",
        href: "/club/perfil",
        icon: <Svg d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4 3.6-7 8-7s8 3 8 7" />,
      },
    ],
  },
];

const iconoTienda = <Svg d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0" />;

export function ClubShell({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const locale = useLocale();
  const nombre = session?.user?.name ?? "Cliente";

  const titulo = (path: string): PanelTitulo => {
    if (itemActivo(CLUB_NAV, path)?.key === "perfil") return { titulo: "Mi perfil", grupo: "Club Hey Cookie" };
    return { titulo: `¡Hola, ${nombre.split(" ")[0]}!`, grupo: "Club Hey Cookie" };
  };

  return (
    <PanelShell
      nav={CLUB_NAV}
      homeHref="/club/dashboard"
      subtitulo="Club · Mi cuenta"
      titulo={titulo}
      enlacesPie={[{ label: "Ir a la tienda", href: "/", icon: iconoTienda }]}
      usuario={{ nombre, email: session?.user?.email ?? "" }}
      onCerrarSesion={() => signOut({ callbackUrl: `/${locale}/club/login` })}
    >
      {children}
    </PanelShell>
  );
}
