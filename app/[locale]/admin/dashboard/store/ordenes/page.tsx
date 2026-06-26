// src/app/[locale]/admin/dashboard/ordenes/page.tsx

import AppBarAdmin from "@/core/components/app-bar-admin/AppBarAdmin";
import { OrdenesView } from "@/modules/admin/store/presentation/components/OrdenesView";

export const metadata = { title: "Órdenes — Panel Admin" };

export default function OrdenesPage() {
  return (
    <main className="bg-[#FAF3E0] min-h-screen overflow-x-hidden">
      <AppBarAdmin />

      <div className="px-6 lg:px-20">
        <div className="mb-6 pt-4 w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#7b2d42]">
            Cotizaciones y órdenes
          </h1>
        </div>
        <OrdenesView />
      </div>
    </main>
  );
}
