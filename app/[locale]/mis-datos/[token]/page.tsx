import type { Metadata } from "next";
import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import Images from "@/core/assets/Images";
import { HeaderWaveRibbon } from "@/core/components/wave-divider/WaveDivider";
import { ClienteRepositoryImpl } from "@/modules/admin/store/data/repositories/Cliente.repository.impl";
import { ClienteEnlaceEdicionRepositoryImpl } from "@/modules/admin/store/data/repositories/ClienteEnlaceEdicion.repository.impl";
import { ObtenerDatosPorTokenUseCase } from "@/modules/admin/store/domain/usecases/ClienteEnlaceEdicion.usecase";
import { ActualizarDatosForm } from "@/modules/mis-datos/presentation/components/ActualizarDatosForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Actualiza tus datos — Hey Cookie",
  robots: { index: false, follow: false },
  // El token va en la URL: que no viaje como Referer a otros sitios.
  referrer: "no-referrer",
};

export default async function MisDatosPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const datos = await new ObtenerDatosPorTokenUseCase(
    new ClienteEnlaceEdicionRepositoryImpl(),
    new ClienteRepositoryImpl(),
  )
    .execute(token)
    .catch(() => null);

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF3E0]">
      <div className="relative z-50 bg-[#F1DCC9]">
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

      <HeaderWaveRibbon topFill="#F1DCC9" bottomFill="#FAF3E0" />

      <section className="flex-1 px-4 py-10">
        <ActualizarDatosForm token={token} datos={datos} />
      </section>

      <FooterBar />
    </main>
  );
}
