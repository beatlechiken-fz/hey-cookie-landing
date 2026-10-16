"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ProductCard, {
  LINEA_ETIQUETA,
  type TonoCard,
} from "@/core/components/product-card/ProductCard";
import {
  promoEtiqueta,
  type ProductoPromo,
} from "@/modules/admin/store/domain/entities/Promocion.entity";

const CookieModal = dynamic(() => import("./CookieModal"), { ssr: false });

export interface GalletaPublica {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagenUrl: string | null;
  precioEstablecido: number | null;
  linea: "sweet" | "fitness" | "healthy";
  promo: ProductoPromo | null;
}

/** Cuadrícula común del catálogo: todo visible, sin carrusel. */
export const GRID_PRODUCTOS =
  "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5";

const TONO_LINEA: Record<GalletaPublica["linea"], TonoCard> = {
  sweet: "rosa",
  fitness: "olivo",
  healthy: "menta",
};

interface Props {
  productos: GalletaPublica[];
  /** Fuerza un tono (p. ej. "calabaza" en temporada); si no, va por línea. */
  tono?: TonoCard;
  /** Muestra la etiqueta de línea (secciones que mezclan Sweet y Fitness). */
  mostrarLinea?: boolean;
  /** Texto cuando la sección aún no tiene galletas. */
  vacio?: string;
}

/** Cuadrícula de galletas con su modal de detalle. */
export default function Cookies({ productos, tono, mostrarLinea, vacio = "Próximamente…" }: Props) {
  const [selected, setSelected] = useState<GalletaPublica | null>(null);

  if (productos.length === 0) {
    return <p className="py-10 text-center font-body text-lg text-cacao/70">{vacio}</p>;
  }

  return (
    <>
      <div className={GRID_PRODUCTOS}>
        {productos.map((p) => (
          <ProductCard
            key={p.id}
            nombre={p.nombre}
            imagenUrl={p.imagenUrl}
            imagenFallback={p.linea === "sweet" ? "/img/vc-product-splash.webp" : "/img/prt-product-splash.webp"}
            tono={tono ?? TONO_LINEA[p.linea]}
            precio={p.precioEstablecido != null ? `$${p.precioEstablecido.toFixed(0)}` : null}
            detalle={p.precioEstablecido != null ? "por pieza" : null}
            etiqueta={mostrarLinea ? LINEA_ETIQUETA[p.linea] : null}
            promo={p.promo ? promoEtiqueta(p.promo) : null}
            onOpen={() => setSelected(p)}
          />
        ))}
      </div>

      {selected && <CookieModal producto={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
