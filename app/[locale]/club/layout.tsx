// Layout raíz de /club. La sesión la provee el SessionProvider del layout de
// [locale] — no se anida otro aquí: un segundo provider se queda con la sesión
// nueva al hacer login y el resto del sitio (carrito, AppBar) no se entera.
// La verificación de sesión se hace en cada página protegida y en el proxy.

import type { ReactNode } from "react";

export const metadata = {
  title: "Mi cuenta — Hey Cookie",
  robots: "noindex, nofollow",
};

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-[#FAF3E0]">
      {children}
    </main>
  );
}
