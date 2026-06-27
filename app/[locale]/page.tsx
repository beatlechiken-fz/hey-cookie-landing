import FooterBar from "@/core/components/footer-bar/FooterBar";
import Contact from "@/modules/home/presentation/components/Contact";
import Cookies from "@/modules/home/presentation/components/Cookies";
import CookiesFitness from "@/modules/home/presentation/components/CookiesFitness";
import Hero from "@/modules/home/presentation/components/Hero";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { GalletaPublica } from "@/modules/home/presentation/components/Cookies";

async function fetchGalletas(linea: "sweet" | "fitness"): Promise<GalletaPublica[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("productos")
      .select("id, nombre, descripcion, imagen_url, precio_establecido")
      .eq("linea", linea)
      .eq("activo", true)
      .order("orden")
      .order("nombre");

    if (error) return [];

    return (data ?? []).map((row: any): GalletaPublica => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion ?? null,
      imagenUrl: row.imagen_url ?? null,
      precioEstablecido: row.precio_establecido != null ? Number(row.precio_establecido) : null,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const [sweet, fitness] = await Promise.all([
    fetchGalletas("sweet"),
    fetchGalletas("fitness"),
  ]);

  return (
    <main className="bg-[#FAF3E0] min-h-full">
      <section>
        <Hero />
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
