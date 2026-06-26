// src/app/[locale]/admin/dashboard/finanzas/page.tsx

import AppBarAdmin from "@/core/components/app-bar-admin/AppBarAdmin";
import { FinanzasView } from "@/modules/admin/store/presentation/components/FinanzasView";

export const metadata = { title: "Finanzas — Panel Admin" };

export default function FinanzasPage() {
  return (
    <main className="bg-[#FAF3E0] min-h-screen overflow-x-hidden">
      <AppBarAdmin />

      <div className="px-6 lg:px-20">
        <div className="mb-6 pt-4 w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#7b2d42]">Finanzas</h1>
        </div>
        <FinanzasView />
      </div>
    </main>
  );
}
