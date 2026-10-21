// src/app/[locale]/admin/dashboard/store/clientes/page.tsx

import { ClientesView } from "@/modules/admin/store/presentation/components/ClientesView";

export const metadata = { title: "Clientes — Panel Admin" };

export default function ClientesPage() {
  return (
    <ClientesView />
  );
}
