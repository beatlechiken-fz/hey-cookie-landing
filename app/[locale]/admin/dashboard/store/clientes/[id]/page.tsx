// src/app/[locale]/admin/dashboard/store/clientes/[id]/page.tsx

import { ClienteDetailView } from "@/modules/admin/store/presentation/components/ClienteDetailView";

export const metadata = { title: "Detalle de cliente — Panel Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <ClienteDetailView clienteId={id} />
  );
}
