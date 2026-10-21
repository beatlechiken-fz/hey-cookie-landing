// src/app/[locale]/admin/dashboard/store/produccion/page.tsx

import { ProduccionView } from "@/modules/admin/store/presentation/components/ProduccionView";

export const metadata = { title: "Producción — Panel Admin" };

export default function ProduccionPage() {
  return (
    <ProduccionView />
  );
}
