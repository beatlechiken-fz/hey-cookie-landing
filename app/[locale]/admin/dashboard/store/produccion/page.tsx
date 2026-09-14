// src/app/[locale]/admin/dashboard/store/produccion/page.tsx

import AppBarAdmin from "@/core/components/app-bar-admin/AppBarAdmin";
import { ProduccionView } from "@/modules/admin/store/presentation/components/ProduccionView";

export const metadata = { title: "Producción — Panel Admin" };

export default function ProduccionPage() {
  return (
    <main className="bg-[#FAF3E0] min-h-screen overflow-x-hidden">
      <AppBarAdmin />

      <div className="px-6 lg:px-20">
        <div className="mb-6 pt-4 w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#AA6A42]">Producción</h1>
        </div>
        <div className="max-w-7xl mx-auto pb-16">
          <ProduccionView />
        </div>
      </div>
    </main>
  );
}
