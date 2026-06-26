// src/app/[locale]/admin/dashboard/raws/jarabes/page.tsx

import AppBarAdmin from "@/core/components/app-bar-admin/AppBarAdmin";
import { JarabesView } from "@/modules/admin/raws/presentation/components/JarabesView";

export const metadata = { title: "Jarabes — Panel Admin" };

export default function JarabesPage() {
  return (
    <main className="bg-[#FAF3E0] min-h-screen overflow-x-hidden">
      <AppBarAdmin />

      <div className="px-6 lg:px-20">
        <div className="mb-6 pt-4 w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#7b2d42]">Jarabes</h1>
        </div>
        <JarabesView />
      </div>
    </main>
  );
}
