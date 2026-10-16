// src/modules/cake/data/datasources/CatalogoPublico.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import { toEntity as productoFromRow } from "@/modules/admin/store/data/datasources/Producto.datasource";
import { getPastelConfigCatalogoPublico } from "@/modules/admin/store/data/datasources/PastelConfigPublico.datasource";
import { precioPublicoProducto } from "@/modules/admin/store/domain/usecases/PrecioPublico.usecase";
import type {
  CategoriaProducto,
  Producto,
} from "@/modules/admin/store/domain/entities/Producto.entity";

export interface CatalogoPublico {
  productos: Producto[];
  /** Precio público por id (fijo o sugerido redondeado); null si no se pudo calcular. */
  precios: Record<string, number | null>;
}

/**
 * Productos activos de una categoría con su precio público, para que las
 * cards del catálogo muestren el precio sin abrir el detalle.
 */
export async function fetchCatalogoPublico(
  categoria: CategoriaProducto,
  filtro?: { soloRegulares?: boolean },
): Promise<CatalogoPublico> {
  try {
    let q = getSupabaseAdmin()
      .from("productos")
      .select("*")
      .eq("categoria", categoria)
      .eq("activo", true);
    if (filtro?.soloRegulares) q = q.is("coleccion", null);
    const [{ data, error }, catalogo] = await Promise.all([
      q.order("nombre"),
      getPastelConfigCatalogoPublico(),
    ]);
    if (error) throw error;
    const productos = (data ?? []).map(productoFromRow);
    const precios: Record<string, number | null> = {};
    for (const p of productos) {
      try {
        precios[p.id] = precioPublicoProducto(p, catalogo);
      } catch {
        precios[p.id] = null;
      }
    }
    return { productos, precios };
  } catch {
    return { productos: [], precios: {} };
  }
}
