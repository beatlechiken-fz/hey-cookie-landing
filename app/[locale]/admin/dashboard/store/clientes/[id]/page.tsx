// src/app/[locale]/admin/dashboard/store/clientes/[id]/page.tsx

import AppBarAdmin from "@/core/components/app-bar-admin/AppBarAdmin";
import { ClienteDetailView } from "@/modules/admin/store/presentation/components/ClienteDetailView";

export const metadata = { title: "Detalle de cliente — Panel Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="bg-[#FAF3E0] min-h-screen overflow-x-hidden">
      <AppBarAdmin />

      <div className="px-6 lg:px-20">
        <div className="mb-6 pt-4 w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#7b2d42]">
            Detalle del cliente
          </h1>
        </div>
        <ClienteDetailView clienteId={id} />;
      </div>
    </main>
  );
}
