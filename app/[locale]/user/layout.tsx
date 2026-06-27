// Layout raíz de /user — envuelve en SessionProvider.
// La verificación de sesión se hace en cada página protegida y en el proxy.

import type { ReactNode } from "react";
import { SessionProvider } from "@/modules/user/auth/presentation/components/SessionProvider";

export const metadata = {
  title: "Mi cuenta — Hey Cookie",
  robots: "noindex, nofollow",
};

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-[#FAF3E0]">
      <SessionProvider>{children}</SessionProvider>
    </main>
  );
}
