import { getUserSession } from "@/core/helpers/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { SessionProvider } from "@/modules/user/auth/presentation/components/SessionProvider";
import { UserDashboard } from "@/modules/user/dashboard/presentation/components/UserDashboard";

export const metadata = {
  title: "Mis pedidos — Hey Cookie",
  robots: "noindex, nofollow",
};

export default async function UserDashboardPage() {
  const session = await getUserSession();

  if (!session) {
    const locale = await getLocale();
    redirect({ href: "/user/login", locale });
  }

  return (
    <SessionProvider>
      <UserDashboard />
    </SessionProvider>
  );
}
