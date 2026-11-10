"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TEMPORADA } from "@/core/data/temporada";
import ProductCard, { LINEA_ETIQUETA } from "@/core/components/product-card/ProductCard";
import { GRID_PRODUCTOS } from "@/modules/home/presentation/components/Cookies";
import {
  getPrecioEstablecidoEfectivo,
  type Producto,
} from "@/modules/admin/store/domain/entities/Producto.entity";
import type { TonoTemporada } from "@/core/components/section-cover/SectionCover";
import TemporadaModal from "./TemporadaModal";

export interface ProductoTemporadaItem {
  producto: Producto;
  incluye: string[];
}

/**
 * Las fotos de temporada son verticales (4:5) con el producto en la parte de
 * arriba; en el plato redondo se recortan centradas y el producto queda alto.
 * Mostrar más de la parte superior lo baja al centro del plato.
 */
const ENCUADRE_TEMPORADA = "50% 15%";

/**
 * Medida a mostrar: el tamaño fijo único ("Individual", "Tronco 30 cm"); si se
 * hace por diámetro, el tamaño es a gusto del cliente (`personalizable`).
 */
export function medidaProducto(p: Producto, personalizable: string): string | null {
  if (p.tamanosFijos.length === 1) return p.tamanosFijos[0].nombre;
  if (p.medidaBaseCm) return personalizable;
  return null;
}

/** Precio ya fijado de un producto de temporada ("$30"), o null si aún no tiene. */
export function precioTemporada(p: Producto): string | null {
  if (p.tamanosFijos.length > 1) return null;
  const precio = getPrecioEstablecidoEfectivo(p, p.tamanosFijos[0]?.id);
  return precio != null ? `$${Number(precio).toFixed(0)}` : null;
}

interface Props {
  items: ProductoTemporadaItem[];
  tono: TonoTemporada;
  vacio: string;
  mostrarLinea?: boolean;
}

/**
 * Cuadrícula de productos de temporada: el precio sale solo si ya se fijó
 * (`precioEstablecido`); el menú se publica antes de tenerlos todos. Cada card abre el detalle con lo que lleva.
 */
export default function TemporadaGrid({ items, tono, vacio, mostrarLinea }: Props) {
  const t = useTranslations(TEMPORADA?.mensajes ?? "navidad");
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
            precio={precioTemporada(item.producto)}
            detalle={medidaProducto(item.producto, t("personalizable"))}
            incluye={item.incluye}
            etiqueta={mostrarLinea ? LINEA_ETIQUETA[item.producto.linea] : null}
            onOpen={() => setAbierto(item)}
            priority={i < 4}
            encuadre={ENCUADRE_TEMPORADA}
          />
        ))}
      </div>
      {abierto && <TemporadaModal item={abierto} onClose={() => setAbierto(null)} />}
    </>
  );
}
