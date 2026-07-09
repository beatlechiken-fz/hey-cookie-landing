import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import CakeInfoSection from "@/modules/cake/presentation/components/CakeInfoSection";
import CakesSection from "@/modules/cake/presentation/components/CakesSection";
import Link from "next/link";
import Image from "next/image";
import Images from "@/core/assets/Images";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type { Producto, LineaProducto } from "@/modules/admin/store/domain/entities/Producto.entity";

async function fetchPasteles(): Promise<Producto[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("productos")
      .select(`
        id, nombre, descripcion, imagen_url, linea, categoria, elaboracion,
        ingredientes_base, opciones_default, medida_base_cm,
        permite_medida_personalizada, tamanos_fijos, factor_opciones,
        mano_de_obra_minimo, precio_establecido, activo, orden,
        created_at, updated_at
      `)
      .eq("categoria", "pastel")
      .eq("activo", true)
      .order("nombre");

    if (error) return [];

    return (data ?? []).map((row: any): Producto => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion ?? null,
      imagenUrl: row.imagen_url ?? null,
      linea: row.linea as LineaProducto,
      categoria: row.categoria ?? null,
      elaboracion: row.elaboracion ?? null,
      ingredientesBase: row.ingredientes_base ?? [],
      opcionesDefault: row.opciones_default ?? {},
      medidaBaseCm: row.medida_base_cm != null ? Number(row.medida_base_cm) : null,
      permiteMedidaPersonalizada: row.permite_medida_personalizada ?? false,
      tamanosFijos: row.tamanos_fijos ?? [],
      factorOpciones: row.factor_opciones != null ? Number(row.factor_opciones) : null,
      manoDeObraMinimo: row.mano_de_obra_minimo != null ? Number(row.mano_de_obra_minimo) : null,
      precioEstablecido: row.precio_establecido != null ? Number(row.precio_establecido) : null,
      activo: row.activo,
      orden: row.orden ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch {
    return [];
  }
}

export default async function CakePage() {
  const pasteles = await fetchPasteles();

  return (
    <main className="bg-[#FAF3E0]">
      {/* APP BAR */}
      <div className="relative z-9">
        <div className="flex h-[60px] md:h-[70px]">
          <div className="relative w-[100px] h-[86px] ml-3 lg:ml-8 md:-mt-1 overflow-visible">
            <Link href="/es">
              <Image
                src={Images.logoShortOpacity}
                alt="Hey Cookie"
                width={100}
                height={100}
                className="absolute cursor-pointer"
              />
            </Link>
          </div>
          <AppBar />
        </div>
      </div>

      <section>
        <CakesSection pasteles={pasteles} />
      </section>

      <section>
        <CakeInfoSection />
      </section>

      <FooterBar />
    </main>
  );
}
