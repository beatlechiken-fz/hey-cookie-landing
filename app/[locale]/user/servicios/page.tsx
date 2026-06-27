// Página de servicios del usuario — protegida.
// El proxy redirige a /user/login si no hay sesión con role "user".

import { getUserSession } from "@/core/helpers/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export default async function UserServiciosPage() {
  const session = await getUserSession();

  if (!session) {
    const locale = await getLocale();
    redirect({ href: "/user/login", locale });
  }

  return (
    <div>
      <h1>Servicios</h1>
      <p>Bienvenida, {session!.user.name}</p>
    </div>
  );
}
