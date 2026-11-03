"use client";
// Shell del panel admin: el PanelShell compartido con el menú del admin,
// el carrito en el encabezado y cierre de sesión hacia el login admin.

import type { ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { PanelShell } from "@/core/components/panel-shell/PanelShell";
import { CartButton } from "@/modules/admin/store/presentation/components/CartButton";
import { ADMIN_NAV, tituloAdmin } from "./adminNav";

const iconoSitio = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

export function AdminShell({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const locale = useLocale();

  return (
    <PanelShell
      nav={ADMIN_NAV}
      homeHref="/admin/dashboard"
      subtitulo="Bake Lab · Admin"
      titulo={tituloAdmin}
      acciones={<CartButton />}
      enlacesPie={[{ label: "Ver sitio público", href: "/", icon: iconoSitio }]}
      usuario={{ nombre: session?.user?.name ?? "Administrador", email: session?.user?.email ?? "" }}
      onCerrarSesion={() => signOut({ callbackUrl: `/${locale}/admin` })}
    >
      {children}
    </PanelShell>
  );
}
