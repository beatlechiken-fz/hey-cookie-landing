import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import Images from "@/core/assets/Images";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import { HeaderWaveRibbon } from "@/core/components/wave-divider/WaveDivider";
import { getTranslations } from "next-intl/server";
import HalloweenSections, {
  type HalloweenBand,
} from "@/modules/cake/presentation/components/HalloweenSections";
import { toEntity as productoFromRow } from "@/modules/admin/store/data/datasources/Producto.datasource";
import { getPastelConfigCatalogoPublico } from "@/modules/admin/store/data/datasources/PastelConfigPublico.datasource";
import { precioPublicoProducto } from "@/modules/admin/store/domain/usecases/PrecioPublico.usecase";
import type { CategoriaProducto } from "@/modules/admin/store/domain/entities/Producto.entity";

// Orden de las secciones y la categoría de producto que muestra cada una.
const SECCIONES: { key: HalloweenBand["key"]; categoria: CategoriaProducto }[] = [
  { key: "pasteles", categoria: "pastel" },
  { key: "reposteria", categoria: "dessert" },
  { key: "gelatinas", categoria: "gelatina" },
  { key: "galletas", categoria: "cookie" },
];

async function fetchBands(): Promise<HalloweenBand[]> {
  try {
    const [{ data, error }, catalogo] = await Promise.all([
      getSupabaseAdmin()
        .from("productos")
        .select("*")
        .eq("coleccion", "halloween-muertos")
        .eq("activo", true)
        .order("nombre"),
      getPastelConfigCatalogoPublico(),
    ]);
    if (error) throw error;
    const productos = (data ?? []).map(productoFromRow);
    return SECCIONES.map(({ key, categoria }) => ({
      key,
      items: productos
        .filter((p) => p.categoria === categoria)
        .map((producto) => ({ producto, precio: precioPublicoProducto(producto, catalogo) })),
    }));
  } catch {
    return SECCIONES.map(({ key }) => ({ key, items: [] }));
  }
}

export async function generateMetadata() {
  const t = await getTranslations("halloween");
  return { title: `${t("title")} — Hey Cookie` };
}

export default async function HalloweenPage() {
  const [bands, t] = await Promise.all([fetchBands(), getTranslations("halloween")]);

  return (
    <main className="bg-[#FAF3E0]">
      <h1 className="sr-only">{t("title")} — Hey Cookie</h1>
      <div className="relative z-9 bg-[#F1DCC9]">
        <div className="flex h-[60px] md:h-[70px]">
          <div className="relative w-[100px] h-[86px] ml-3 lg:ml-8 md:-mt-1 overflow-visible">
            <Link href="/">
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

      <HeaderWaveRibbon topFill="#F1DCC9" bottomFill="#F8EDE3" />

      <section>
        <HalloweenSections bands={bands} />
      </section>

      <FooterBar />
    </main>
  );
}
