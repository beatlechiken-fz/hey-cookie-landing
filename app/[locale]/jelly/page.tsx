"use client";

import AppBar from "@/core/components/app-bar/AppBar";
import ComingSoon from "@/core/components/comming-soon/ComingSoon";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import DessertsSection from "@/modules/cake/presentation/components/DessertsSection";
import JelliesSection from "@/modules/cake/presentation/components/JelliesSection";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("comingSoon");

  return (
    <main className="bg-[#FAF3E0]">
      {/* ----------- APPBAR ------------ */}
      <AppBar />

      {/* ----------- SECTION 1 ------------ */}
      <section>
        <JelliesSection />
      </section>

      {/* ----------- FOOTER ------------ */}
      <FooterBar />
    </main>
  );
}
