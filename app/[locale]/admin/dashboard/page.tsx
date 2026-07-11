import AppBarAdmin from "@/core/components/app-bar-admin/AppBarAdmin";
import { AdminDashboard } from "@/modules/admin/dashboard/presentation/components/AdminDashboard";

export const metadata = { title: "Panel de control — Admin" };

export default function DashboardPage() {
  return (
    <main className="bg-[#FAF3E0] min-h-screen overflow-x-hidden">
      <AppBarAdmin />
      <AdminDashboard />
    </main>
  );
}
