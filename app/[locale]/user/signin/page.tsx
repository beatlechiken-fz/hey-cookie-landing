// Página de registro de usuario — pública.
// Si ya hay sesión activa de usuario, redirige a /user/servicios.

import { getUserSession } from "@/core/helpers/auth";
import { redirect } from "@/i18n/navigation";
import { RegisterForm } from "@/modules/user/auth/presentation/components/RegisterForm";
import { getLocale } from "next-intl/server";

export default async function UserSigninPage() {
  const session = await getUserSession();

  if (session) {
    const locale = await getLocale();
    redirect({ href: "/", locale });
  }

  return <RegisterForm />;
}
