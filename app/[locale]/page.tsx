import FooterBar from "@/core/components/footer-bar/FooterBar";
import Contact from "@/modules/home/presentation/components/Contact";
import Cookies from "@/modules/home/presentation/components/Cookies";
import CookiesFitness from "@/modules/home/presentation/components/CookiesFitness";
import Hero from "@/modules/home/presentation/components/Hero";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { GalletaPublica } from "@/modules/home/presentation/components/Cookies";
import { parsePromo } from "@/modules/admin/store/domain/entities/Promocion.entity";
import type { ColeccionProducto } from "@/modules/admin/store/domain/entities/Producto.entity";

/**
 * Galletas activas de una línea (sweet/fitness) del catálogo regular, o de una
 * colección de temporada (cualquier línea; cada galleta conserva su etiqueta).
 */
async function fetchGalletas(
  filtro: { linea: "sweet" | "fitness" } | { coleccion: ColeccionProducto },
): Promise<GalletaPublica[]> {
  try {
    let q = getSupabaseAdmin()
      .from("productos")
      .select("id, nombre, descripcion, imagen_url, precio_establecido, promo, linea")
      .eq("categoria", "cookie")
      .eq("activo", true);
    q =
      "coleccion" in filtro
        ? q.eq("coleccion", filtro.coleccion)
        : q.eq("linea", filtro.linea).is("coleccion", null);
    const { data, error } = await q.order("nombre");

    if (error) return [];

    return (data ?? []).map((row: any): GalletaPublica => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion ?? null,
      imagenUrl: row.imagen_url ?? null,
      precioEstablecido: row.precio_establecido != null ? Number(row.precio_establecido) : null,
      linea: row.linea ?? ("linea" in filtro ? filtro.linea : "sweet"),
      promo: parsePromo(row.promo),
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const [halloween, sweet, fitness] = await Promise.all([
    fetchGalletas({ coleccion: "halloween-muertos" }),
    fetchGalletas({ linea: "sweet" }),
    fetchGalletas({ linea: "fitness" }),
  ]);

  return (
    <main className="bg-[#FAF3E0] min-h-full">
      <section>
        <Hero />
      </section>

      <section id="cookies-halloween" className="relative z-20 w-full overflow-x-hidden">
        <Cookies productos={halloween} titleKey="titleHalloween" />
      </section>

      <section id="cookies" className="relative z-20 w-full overflow-x-hidden">
        <Cookies productos={sweet} />
      </section>

      <section id="cookies-fitness" className="relative z-20 w-full overflow-x-hidden">
        <CookiesFitness productos={fitness} />
      </section>

      <section className="w-full">
        <Contact />
      </section>

      <FooterBar />
    </main>
  );
}
