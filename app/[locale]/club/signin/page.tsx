// Página de registro de usuario — pública.
// Si ya hay sesión activa, manda directo a su destino (carrito o dashboard).

import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getUserSession } from "@/core/helpers/auth";
import { destinoTrasLogin } from "@/core/helpers/redireccion";
import { RegisterForm } from "@/modules/user/auth/presentation/components/RegisterForm";

export default async function UserSigninPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await getUserSession();

  if (session) {
    const [locale, params] = await Promise.all([getLocale(), searchParams]);
    redirect(destinoTrasLogin(locale, { from: params.from }));
  }

  return <RegisterForm />;
}
