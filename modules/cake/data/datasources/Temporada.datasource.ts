// src/modules/cake/data/datasources/Temporada.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import { TEMPORADA } from "@/core/data/temporada";
import { toEntity as productoFromRow } from "@/modules/admin/store/data/datasources/Producto.datasource";
import { getPastelConfigCatalogoPublico } from "@/modules/admin/store/data/datasources/PastelConfigPublico.datasource";
import { incluyeProducto } from "@/modules/admin/store/domain/usecases/IncluyeProducto.usecase";
import { normalizeOpciones } from "@/modules/admin/store/domain/entities/PastelPersonalizado.entity";
import {
  OPCIONES_VACIAS,
  type CategoriaProducto,
  type Producto,
} from "@/modules/admin/store/domain/entities/Producto.entity";

export interface ProductoTemporada {
  producto: Producto;
  /** Lo que lleva con sus opciones por defecto (coberturas, rellenos, toppings…). */
  incluye: string[];
}

/**
 * Productos activos de la temporada activa (core/data/temporada.ts), sin
 * precio: el menú de temporada se publica antes de fijar precios.
 */
export async function fetchTemporada(categoria?: CategoriaProducto): Promise<ProductoTemporada[]> {
  if (!TEMPORADA) return [];
  try {
    let q = getSupabaseAdmin()
      .from("productos")
      .select("*")
      .eq("coleccion", TEMPORADA.coleccion)
      .eq("activo", true);
    if (categoria) q = q.eq("categoria", categoria);
    const [{ data, error }, catalogo] = await Promise.all([
      q.order("nombre"),
      getPastelConfigCatalogoPublico(),
    ]);
    if (error) throw error;
    return (data ?? []).map(productoFromRow).map((producto) => ({
      producto,
      incluye: incluyeProducto(
        normalizeOpciones({ ...OPCIONES_VACIAS, ...producto.opcionesDefault }),
        catalogo,
      ).map((i) => i.nombre),
    }));
  } catch {
    return [];
  }
}
