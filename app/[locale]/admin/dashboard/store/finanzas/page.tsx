// src/app/[locale]/admin/dashboard/finanzas/page.tsx

import { FinanzasView } from "@/modules/admin/store/presentation/components/FinanzasView";

export const metadata = { title: "Finanzas — Panel Admin" };

export default function FinanzasPage() {
  return (
    <FinanzasView />
  );
}
