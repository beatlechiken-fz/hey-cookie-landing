import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import Images from "@/core/assets/Images";
import { HeaderWaveRibbon } from "@/core/components/wave-divider/WaveDivider";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { TEMPORADA } from "@/core/data/temporada";
import { tonoHex } from "@/core/components/section-cover/SectionCover";
import { fetchTemporada } from "@/modules/cake/data/datasources/Temporada.datasource";
import TemporadaSections, {
  type TemporadaBand,
} from "@/modules/cake/presentation/components/TemporadaSections";
import type { CategoriaProducto } from "@/modules/admin/store/domain/entities/Producto.entity";

// Orden de las secciones y la categoría de producto que muestra cada una.
const SECCIONES: { key: TemporadaBand["key"]; categoria: CategoriaProducto }[] = [
  { key: "pasteles", categoria: "pastel" },
  { key: "reposteria", categoria: "dessert" },
  { key: "gelatinas", categoria: "gelatina" },
  { key: "galletas", categoria: "cookie" },
];

export async function generateMetadata() {
  const t = await getTranslations("navidad");
  return { title: `${t("title")} — Hey Cookie`, description: t("desc") };
}

export default async function NavidadPage() {
  if (!TEMPORADA || TEMPORADA.coleccion !== "navidad") notFound();
  const [productos, t] = await Promise.all([fetchTemporada(), getTranslations("navidad")]);
  const bands: TemporadaBand[] = SECCIONES.map(({ key, categoria }) => ({
    key,
    items: productos.filter((p) => p.producto.categoria === categoria),
  }));

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

      <HeaderWaveRibbon topFill="#F1DCC9" bottomFill={tonoHex(TEMPORADA.tono)} />

      <TemporadaSections bands={bands} tono={TEMPORADA.tono} mensajes={TEMPORADA.mensajes} />

      <FooterBar />
    </main>
  );
}
