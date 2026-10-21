// src/app/[locale]/admin/dashboard/store/cupones/page.tsx

import { CuponesView } from "@/modules/admin/store/presentation/components/CuponesView";

export const metadata = { title: "Cupones — Panel Admin" };

export default function CuponesPage() {
  return (
    <CuponesView />
  );
}
