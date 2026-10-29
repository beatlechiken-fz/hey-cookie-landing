// Página de LOGIN de usuario — pública, no requiere sesión.
// Si ya hay sesión activa, manda directo a su destino (carrito, callbackUrl o dashboard).

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getUserSession } from "@/core/helpers/auth";
import { destinoTrasLogin } from "@/core/helpers/redireccion";
import { LoginForm } from "@/modules/user/auth/presentation/components/LoginForm";

export default async function UserLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; callbackUrl?: string }>;
}) {
  const session = await getUserSession();

  if (session) {
    const [locale, params] = await Promise.all([getLocale(), searchParams]);
    redirect(destinoTrasLogin(locale, params));
  }

  return <LoginForm />;
}
