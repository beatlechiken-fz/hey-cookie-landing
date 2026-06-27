// Página de LOGIN de usuario — pública, no requiere sesión.
// Si ya hay sesión activa, redirige directo a servicios.

import { getUserSession } from "@/core/helpers/auth";
import { redirect } from "@/i18n/navigation";
import { LoginForm } from "@/modules/user/auth/presentation/components/LoginForm";
import { getLocale } from "next-intl/server";

export default async function UserLoginPage() {
  const session = await getUserSession();

  if (session) {
    const locale = await getLocale();
    redirect({ href: "/user/servicios", locale });
  }

  return <LoginForm />;
}
