// src/app/[locale]/admin/dashboard/raws/coberturas/page.tsx

import AppBarAdmin from "@/core/components/app-bar-admin/AppBarAdmin";
import { CoberturasView } from "@/modules/admin/raws/presentation/components/CoberturasView";

export const metadata = { title: "Coberturas — Panel Admin" };

export default function CoberturasPage() {
  return (
    <main className="bg-[#FAF3E0] min-h-screen overflow-x-hidden">
      <AppBarAdmin />

      <div className="px-6 lg:px-20">
        <div className="mb-6 pt-4 w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#7b2d42]">Coberturas</h1>
        </div>
        <CoberturasView />
      </div>
    </main>
  );
}
