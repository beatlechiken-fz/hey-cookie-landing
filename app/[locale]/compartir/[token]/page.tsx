import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import Images from "@/core/assets/Images";
import { HeaderWaveRibbon } from "@/core/components/wave-divider/WaveDivider";
import { PastelCompartidoSupabaseDatasource } from "@/modules/admin/store/data/datasources/PastelCompartido.datasource";
import { InvitacionCompartir } from "@/modules/compartir/presentation/components/InvitacionCompartir";

export const metadata = {
  title: "Invitación — Hey Cookie",
  robots: { index: false, follow: false },
};

export default async function CompartirPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitacion = await new PastelCompartidoSupabaseDatasource()
    .findPublicoByToken(token)
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
        <InvitacionCompartir token={token} invitacion={invitacion} />
      </section>

      <FooterBar />
    </main>
  );
}
