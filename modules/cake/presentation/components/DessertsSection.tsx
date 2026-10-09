"use client";

import ProductBands from "./ProductBands";
import type { Producto } from "@/modules/admin/store/domain/entities/Producto.entity";

interface Props {
  productos: Producto[];
}

export default function DessertsSection({ productos }: Props) {
  return <ProductBands productos={productos} />;
}
