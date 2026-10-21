// src/app/admin/layout.tsx
// Layout raíz de /admin — solo envuelve en SessionProvider.
// NO verifica sesión aquí porque /admin (login) es público.

import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "@/modules/admin/auth/presentation/components/SessionProvider";

// Sans geométrica solo para el panel: más legible en tablas y formularios.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin",
});

export const metadata = {
  title: "Panel Admin — Pastelería",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className={`${jakarta.variable} admin-ui min-h-screen bg-hc-bg text-hc-ink`}>
      <SessionProvider>{children}</SessionProvider>
    </main>
  );
}
