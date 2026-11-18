// src/app/[locale]/admin/dashboard/ordenes/page.tsx

import { Suspense } from "react";
import { OrdenesView } from "@/modules/admin/store/presentation/components/OrdenesView";

export const metadata = { title: "Órdenes — Panel Admin" };

export default function OrdenesPage() {
  // OrdenesView lee ?tab= con useSearchParams, que necesita un Suspense.
  return (
    <Suspense>
      <OrdenesView />
    </Suspense>
  );
}
