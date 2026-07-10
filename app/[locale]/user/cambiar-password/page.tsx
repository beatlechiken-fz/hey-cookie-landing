import { getUserSession } from "@/core/helpers/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { CambiarPasswordForm } from "@/modules/user/auth/presentation/components/CambiarPasswordForm";

export default async function CambiarPasswordPage() {
  const session = await getUserSession();
  const locale = await getLocale();

  if (!session) {
    redirect({ href: "/user/login", locale });
  }

  // Si ya cambió su contraseña y llega aquí manualmente → redirigir al inicio
  if (!(session as any).user?.mustChangePassword) {
    redirect({ href: "/", locale });
  }

  return <CambiarPasswordForm />;
}
