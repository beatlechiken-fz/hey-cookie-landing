"use client";

import { useState } from "react";
import ProductCard, { LINEA_ETIQUETA } from "@/core/components/product-card/ProductCard";
import { GRID_PRODUCTOS } from "@/modules/home/presentation/components/Cookies";
import type { Producto } from "@/modules/admin/store/domain/entities/Producto.entity";
import type { TonoTemporada } from "@/core/components/section-cover/SectionCover";
import TemporadaModal from "./TemporadaModal";

export interface ProductoTemporadaItem {
  producto: Producto;
  incluye: string[];
}

/** Medida a mostrar: tamaño fijo único ("Individual", "Tronco 30 cm") o la medida base. */
export function medidaProducto(p: Producto): string | null {
  if (p.tamanosFijos.length === 1) return p.tamanosFijos[0].nombre;
  if (p.medidaBaseCm) return `${Number(p.medidaBaseCm).toFixed(0)} cm`;
  return null;
}

interface Props {
  items: ProductoTemporadaItem[];
  tono: TonoTemporada;
  vacio: string;
  mostrarLinea?: boolean;
}

/**
 * Cuadrícula de productos de temporada: sin precio (el menú de temporada se
 * publica antes de fijarlos). Cada card abre el detalle con lo que lleva.
 */
export default function TemporadaGrid({ items, tono, vacio, mostrarLinea }: Props) {
  const [abierto, setAbierto] = useState<ProductoTemporadaItem | null>(null);

  if (items.length === 0) {
    return <p className="py-10 text-center font-body text-lg text-crema/70">{vacio}</p>;
  }

  return (
    <>
      <div className={GRID_PRODUCTOS}>
        {items.map((item, i) => (
          <ProductCard
            key={item.producto.id}
            nombre={item.producto.nombre}
            imagenUrl={item.producto.imagenUrl}
            imagenFallback="/img/cake-cafe-sm.webp"
            tono={tono}
            detalle={medidaProducto(item.producto)}
            incluye={item.incluye}
            etiqueta={mostrarLinea ? LINEA_ETIQUETA[item.producto.linea] : null}
            onOpen={() => setAbierto(item)}
            priority={i < 4}
          />
        ))}
      </div>
      {abierto && <TemporadaModal item={abierto} onClose={() => setAbierto(null)} />}
    </>
  );
}
