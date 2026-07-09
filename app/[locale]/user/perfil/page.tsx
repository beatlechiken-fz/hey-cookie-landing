import { getUserSession } from "@/core/helpers/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { SessionProvider } from "@/modules/user/auth/presentation/components/SessionProvider";
import { UserPerfil } from "@/modules/user/dashboard/presentation/components/UserPerfil";

export const metadata = {
  title: "Mi perfil — Hey Cookie",
  robots: "noindex, nofollow",
};

export default async function UserPerfilPage() {
  const session = await getUserSession();

  if (!session) {
    const locale = await getLocale();
    redirect({ href: "/user/login", locale });
  }

  return (
    <SessionProvider>
      <UserPerfil />
    </SessionProvider>
  );
}
