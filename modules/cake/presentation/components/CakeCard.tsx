"use client";

import ProductCard, { LINEA_ETIQUETA, tonoProducto } from "@/core/components/product-card/ProductCard";
import {
  etiquetaTamanoPredeterminado,
  type Producto,
} from "@/modules/admin/store/domain/entities/Producto.entity";

interface Props {
  producto: Producto;
  onClick: (producto: Producto) => void;
  /** Precio a mostrar en la tarjeta (opcional). */
  precio?: number | null;
  /** Muestra la etiqueta de línea (solo en secciones que mezclan líneas). */
  mostrarLinea?: boolean;
  /** Lo que incluye el precio mostrado (opciones por defecto). */
  incluye?: string[];
}

export default function CakeCard({ producto, onClick, precio, mostrarLinea, incluye }: Props) {
  // Tamaño predeterminado: el tamaño fijo con el que abre ("2 L", "Molde 23 × 13 cm")
  // o la medida base de los pasteles por diámetro ("24 cm").
  const medida = etiquetaTamanoPredeterminado(producto);

  return (
    <ProductCard
      nombre={producto.nombre}
      imagenUrl={producto.imagenUrl}
      imagenFallback="/img/cake-cafe-sm.webp"
      tono={tonoProducto(producto)}
      precio={precio != null ? `$${precio.toFixed(0)}` : null}
      detalle={medida}
      incluye={precio != null ? incluye : undefined}
      etiqueta={mostrarLinea ? LINEA_ETIQUETA[producto.linea] : null}
      onOpen={() => onClick(producto)}
    />
  );
}
