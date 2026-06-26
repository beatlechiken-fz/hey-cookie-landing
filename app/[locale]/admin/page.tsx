// src/app/admin/page.tsx
// Página de LOGIN — pública, no requiere sesión.
// Si ya hay sesión activa, redirige directo al dashboard.

import { getAdminSession } from "@/core/helpers/auth";
import { redirect } from "@/i18n/navigation";
import { LoginForm } from "@/modules/admin/auth/presentation/components/Loginform";
import { getLocale } from "next-intl/server";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  // Si ya está autenticada, mandarla directo al dashboard
  if (session) {
    const locale = await getLocale();
    redirect({ href: "/admin/dashboard", locale });
  }

  return <LoginForm />;
}
