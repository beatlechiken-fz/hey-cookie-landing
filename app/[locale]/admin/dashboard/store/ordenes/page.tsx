// src/app/[locale]/admin/dashboard/ordenes/page.tsx

import { OrdenesView } from "@/modules/admin/store/presentation/components/OrdenesView";

export const metadata = { title: "Órdenes — Panel Admin" };

export default function OrdenesPage() {
  return (
    <OrdenesView />
  );
}
