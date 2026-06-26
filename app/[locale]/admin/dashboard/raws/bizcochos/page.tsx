// src/app/[locale]/admin/dashboard/store/bizcochos/page.tsx

import AppBarAdmin from "@/core/components/app-bar-admin/AppBarAdmin";
import { BizchosView } from "@/modules/admin/raws/presentation/components/BizcochosView";

export const metadata = { title: "Bizcochos — Panel Admin" };

export default function BizchosPage() {
  return (
    <main className="bg-[#FAF3E0] min-h-screen overflow-x-hidden">
      <AppBarAdmin />

      <div className="px-6 lg:px-20">
        <div className="mb-6 pt-4 w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#7b2d42]">Bizcochos</h1>
        </div>
        <BizchosView />
      </div>
    </main>
  );
}
