"use client";

import AppBar from "@/core/components/app-bar/AppBar";
import ComingSoon from "@/core/components/comming-soon/ComingSoon";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import DessertsSection from "@/modules/cake/presentation/components/DessertsSection";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Home() {
  const t = useTranslations("comingSoon");

  return (
    <main className="bg-[#FAF3E0]">
      {/* ------------------ APP BAR ------------------ */}
      <div className="relative z-99999">
        <div className="flex h-[60px] md:h-[70px]">
          <div className="relative w-[100px] h-[86px] ml-3 lg:ml-8 md:-mt-1 overflow-visible">
            {/* Imagen encima */}
            <Image
              src="/img/hey-cookie-logo-opacity.webp"
              alt=""
              width={100}
              height={100}
              className="absolute"
            />
          </div>

          <AppBar />
        </div>
      </div>

      {/* ----------- SECTION 1 ------------ */}
      <section>
        <DessertsSection />
      </section>

      {/* ----------- FOOTER ------------ */}
      <FooterBar />
    </main>
  );
}
