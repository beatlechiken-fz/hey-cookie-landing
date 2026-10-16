"use client";

import ProductCard, { LINEA_ETIQUETA, tonoProducto } from "@/core/components/product-card/ProductCard";
import type { Producto } from "@/modules/admin/store/domain/entities/Producto.entity";

interface Props {
  producto: Producto;
  onClick: (producto: Producto) => void;
  /** Precio a mostrar en la tarjeta (opcional). */
  precio?: number | null;
  /** Muestra la etiqueta de línea (solo en secciones que mezclan líneas). */
  mostrarLinea?: boolean;
}

export default function CakeCard({ producto, onClick, precio, mostrarLinea }: Props) {
  // Medida visible en la tarjeta: tamaño fijo único (p. ej. panqués "Molde 23 × 13 cm")
  // o la medida base de los productos personalizables (solo junto al precio).
  const medida =
    producto.tamanosFijos.length === 1
      ? producto.tamanosFijos[0].nombre
      : precio != null && producto.permiteMedidaPersonalizada && producto.medidaBaseCm
        ? `${Number(producto.medidaBaseCm).toFixed(0)} cm`
        : null;

  return (
    <ProductCard
      nombre={producto.nombre}
      imagenUrl={producto.imagenUrl}
      imagenFallback="/img/cake-cafe-sm.webp"
      tono={tonoProducto(producto)}
      precio={precio != null ? `$${precio.toFixed(0)}` : null}
      detalle={medida}
      etiqueta={mostrarLinea ? LINEA_ETIQUETA[producto.linea] : null}
      onOpen={() => onClick(producto)}
    />
  );
}
