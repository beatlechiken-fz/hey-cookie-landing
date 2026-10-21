// src/app/[locale]/admin/dashboard/ordenes/[id]/page.tsx

import { OrdenDetailView } from "@/modules/admin/store/presentation/components/OrdenesDetailView";

export const metadata = { title: "Detalle de orden — Panel Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrdenDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <OrdenDetailView ordenId={id} />
  );
}
