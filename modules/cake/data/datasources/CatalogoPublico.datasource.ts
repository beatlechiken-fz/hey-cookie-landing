// src/modules/cake/data/datasources/CatalogoPublico.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import { toEntity as productoFromRow } from "@/modules/admin/store/data/datasources/Producto.datasource";
import { getPastelConfigCatalogoPublico } from "@/modules/admin/store/data/datasources/PastelConfigPublico.datasource";
import { precioPublicoProducto } from "@/modules/admin/store/domain/usecases/PrecioPublico.usecase";
import { incluyeProducto } from "@/modules/admin/store/domain/usecases/IncluyeProducto.usecase";
import { normalizeOpciones } from "@/modules/admin/store/domain/entities/PastelPersonalizado.entity";
import { OPCIONES_VACIAS } from "@/modules/admin/store/domain/entities/Producto.entity";
import type {
  CategoriaProducto,
  Producto,
} from "@/modules/admin/store/domain/entities/Producto.entity";

export interface CatalogoPublico {
  productos: Producto[];
  /** Precio público por id (fijo o sugerido redondeado); null si no se pudo calcular. */
  precios: Record<string, number | null>;
  /** Lo que incluye cada producto con sus opciones por defecto (para los chips de la card). */
  incluye: Record<string, string[]>;
}

/**
 * Productos activos de una categoría con su precio público, para que las
 * cards del catálogo muestren el precio sin abrir el detalle.
 */
export async function fetchCatalogoPublico(
  categoria: CategoriaProducto,
): Promise<CatalogoPublico> {
  try {
    const q = getSupabaseAdmin()
      .from("productos")
      .select("*")
      .eq("categoria", categoria)
      .eq("activo", true);
    const [{ data, error }, catalogo] = await Promise.all([
      q.order("nombre"),
      getPastelConfigCatalogoPublico(),
    ]);
    if (error) throw error;
    const productos = (data ?? []).map(productoFromRow);
    const precios: Record<string, number | null> = {};
    const incluye: Record<string, string[]> = {};
    for (const p of productos) {
      incluye[p.id] = incluyeProducto(
        normalizeOpciones({ ...OPCIONES_VACIAS, ...p.opcionesDefault }),
        catalogo,
      ).map((i) => i.nombre);
      try {
        precios[p.id] = precioPublicoProducto(p, catalogo);
      } catch {
        precios[p.id] = null;
      }
    }
    return { productos, precios, incluye };
  } catch {
    return { productos: [], precios: {}, incluye: {} };
  }
}
