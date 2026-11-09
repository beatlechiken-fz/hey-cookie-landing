import type { ColeccionProducto } from "@/modules/admin/store/domain/entities/Producto.entity";
import type { TonoPortada } from "@/core/components/section-cover/SectionCover";

/**
 * Temporada activa del sitio. Sus productos (colección en el admin) salen en
 * una sección especial en la home, en /cake, /desserts y /jelly, y en su
 * página propia. Para apagarla al terminar la temporada: `TEMPORADA = null`
 * (y desactivar sus productos en el admin).
 */
export interface Temporada {
  coleccion: ColeccionProducto;
  /** Página propia de la temporada. */
  ruta: string;
  /** Menú en PDF (public/menus). El QR impreso apunta a esta URL. */
  menuPdf: string;
  /** Namespace de textos en messages/*.json. */
  mensajes: string;
  /** Tono oscuro de las franjas y tarjetas. */
  tono: Extract<TonoPortada, "noche" | "pino">;
}

export const TEMPORADA: Temporada | null = {
  coleccion: "navidad",
  ruta: "/navidad",
  menuPdf: "/menus/menu-navidad-2026.pdf",
  mensajes: "navidad",
  tono: "pino",
};

/** true si el producto pertenece a la temporada activa (va en su sección, no en su línea). */
export function esDeTemporada(p: { coleccion?: string | null }): boolean {
  return !!TEMPORADA && p.coleccion === TEMPORADA.coleccion;
}
