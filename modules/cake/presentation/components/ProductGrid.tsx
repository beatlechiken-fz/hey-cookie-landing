"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import CakeCard from "./CakeCard";
import ProductoModal from "./ProductoModal";
import { GRID_PRODUCTOS, type GalletaPublica } from "@/modules/home/presentation/components/Cookies";
import type { Producto } from "@/modules/admin/store/domain/entities/Producto.entity";

const CookieModal = dynamic(
  () => import("@/modules/home/presentation/components/CookieModal"),
  { ssr: false },
);

export interface ProductoConPrecio {
  producto: Producto;
  precio: number | null;
}

function toGalleta(p: Producto): GalletaPublica {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    imagenUrl: p.imagenUrl,
    precioEstablecido: p.precioEstablecido,
    linea: p.linea,
    promo: p.promo,
  };
}

interface Props {
  items: ProductoConPrecio[];
  mostrarLinea?: boolean;
  vacio?: string;
}

/**
 * Cuadrícula de productos del catálogo (pasteles, repostería, gelatinas y
 * galletas de colección). Abre el modal que corresponde a cada categoría.
 */
export default function ProductGrid({ items, mostrarLinea, vacio = "Próximamente…" }: Props) {
  const [selected, setSelected] = useState<Producto | null>(null);
  const [selectedCookie, setSelectedCookie] = useState<GalletaPublica | null>(null);

  if (items.length === 0) {
    return <p className="py-10 text-center font-body text-lg text-cacao/70">{vacio}</p>;
  }

  return (
    <>
      <div className={GRID_PRODUCTOS}>
        {items.map(({ producto, precio }) => (
          <CakeCard
            key={producto.id}
            producto={producto}
            precio={precio}
            mostrarLinea={mostrarLinea}
            onClick={(p) =>
              p.categoria === "cookie" ? setSelectedCookie(toGalleta(p)) : setSelected(p)
            }
          />
        ))}
      </div>

      {selected && <ProductoModal producto={selected} onClose={() => setSelected(null)} />}
      {selectedCookie && (
        <CookieModal producto={selectedCookie} onClose={() => setSelectedCookie(null)} />
      )}
    </>
  );
}
