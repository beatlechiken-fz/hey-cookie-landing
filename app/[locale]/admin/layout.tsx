// src/app/admin/layout.tsx
// Layout raíz de /admin — solo envuelve en SessionProvider.
// NO verifica sesión aquí porque /admin (login) es público.

import type { ReactNode } from "react";
import { panelFont } from "@/core/helpers/panelFont";
import { SessionProvider } from "@/modules/admin/auth/presentation/components/SessionProvider";

export const metadata = {
  title: "Panel Admin — Pastelería",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className={`${panelFont.variable} admin-ui min-h-screen bg-hc-bg text-hc-ink`}>
      <SessionProvider>{children}</SessionProvider>
    </main>
  );
}
