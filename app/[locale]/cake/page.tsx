"use client";

import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import CakeInfoSection from "@/modules/cake/presentation/components/CakeInfoSection";
import CakesSection from "@/modules/cake/presentation/components/CakesSection";
import CircleCakesSection from "@/modules/cake/presentation/components/DessertsSection";
import { useTranslations } from "next-intl";

export default function Home() {
  return (
    <main className="bg-[#FAF3E0]">
      {/* ----------- APPBAR ------------ */}
      <AppBar />

      {/* ----------- SECTION 1 ------------ */}
      <section>
        <CakesSection />
      </section>

      {/* ----------- SECTION 3 ------------ */}
      <section>
        <CakeInfoSection />
      </section>

      {/* ----------- FOOTER ------------ */}
      <FooterBar />
    </main>
  );
}
