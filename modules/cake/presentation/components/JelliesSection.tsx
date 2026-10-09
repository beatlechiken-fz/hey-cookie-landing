"use client";

import ProductBands from "./ProductBands";
import type { Producto } from "@/modules/admin/store/domain/entities/Producto.entity";

interface Props {
  productos: Producto[];
}

export default function JelliesSection({ productos }: Props) {
  return <ProductBands productos={productos} />;
}
