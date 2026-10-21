// Layout de todo el panel autenticado: sidebar + topbar (el título lo pone el shell).

import type { ReactNode } from "react";
import { AdminShell } from "@/core/components/admin-shell/AdminShell";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
