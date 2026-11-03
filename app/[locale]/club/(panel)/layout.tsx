// Páginas del club con sesión (inicio y perfil): mismo shell que el admin.
// Login, registro y QR quedan fuera de este grupo y conservan su diseño.

import type { ReactNode } from "react";
import { panelFont } from "@/core/helpers/panelFont";
import { ClubShell } from "@/core/components/club-shell/ClubShell";

export default function ClubPanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${panelFont.variable} admin-ui bg-hc-bg text-hc-ink`}>
      <ClubShell>{children}</ClubShell>
    </div>
  );
}
