import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import CakeInfoSection from "@/modules/cake/presentation/components/CakeInfoSection";
import ProductBands from "@/modules/cake/presentation/components/ProductBands";
import { fetchCatalogoPublico } from "@/modules/cake/data/datasources/CatalogoPublico.datasource";
import { fetchTemporada } from "@/modules/cake/data/datasources/Temporada.datasource";
import { portadaDe } from "@/core/data/portadas";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import Images from "@/core/assets/Images";
import { getTranslations } from "next-intl/server";

export default async function CakePage() {
  const [{ productos, precios, incluye }, temporada, t] = await Promise.all([
    fetchCatalogoPublico("pastel"),
    fetchTemporada("pastel"),
    getTranslations("mainnav"),
  ]);

  return (
    <main className="bg-[#FAF3E0]">
      <h1 className="sr-only">{t("cake")} — Hey Cookie</h1>
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

      <ProductBands
        ondaSuperior="#F1DCC9"
        productos={productos}
        precios={precios}
        incluye={incluye}
        temporada={temporada}
        kicker={t("cake")}
        portada={portadaDe("pasteles")}
      />

      <section>
        <CakeInfoSection />
      </section>

      <FooterBar />
    </main>
  );
}
