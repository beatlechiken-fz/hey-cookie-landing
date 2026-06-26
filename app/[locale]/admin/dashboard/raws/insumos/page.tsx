// src/app/[locale]/admin/dashboard/raws/insumos/page.tsx

import AppBarAdmin from "@/core/components/app-bar-admin/AppBarAdmin";
import { InsumosView } from "@/modules/admin/raws/presentation/components/InsumosView";

export const metadata = {
  title: "Insumos — Panel Admin",
};

export default function InsumosPage() {
  return (
    <main className="bg-[#FAF3E0] min-h-screen overflow-x-hidden">
      <AppBarAdmin />

      <div className="px-6 lg:px-20">
        <div className="mb-6 pt-4 w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#7b2d42]">Insumos</h1>
        </div>

        <InsumosView />
      </div>
    </main>
  );
}
