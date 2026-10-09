"use client";

import ProductBands from "./ProductBands";
import type { Producto } from "@/modules/admin/store/domain/entities/Producto.entity";

// Color con el que arranca lo que sigue después de la última franja de esta
// sección (CakeInfoSection, que usa bg-[#FAF3E0]) — así la última onda
// conecta con lo que realmente viene después, no con un valor inventado.
const NEXT_SECTION_COLOR = "#FAF3E0";

interface Props {
  pasteles: Producto[];
}

export default function CakesSection({ pasteles }: Props) {
  return <ProductBands productos={pasteles} lastWaveFill={NEXT_SECTION_COLOR} />;
}
