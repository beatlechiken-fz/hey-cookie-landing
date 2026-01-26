"use client";

import FooterBar from "@/core/components/footer-bar/FooterBar";
import CakeInfoSection from "@/modules/cake/presentation/components/CakeInfoSection";
import CakesSection from "@/modules/cake/presentation/components/CakesSection";
import CircleCakesSection from "@/modules/cake/presentation/components/CircleCakesSection";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("comingSoon");

  return (
    <main className="bg-[#FAF3E0]">
      {/* ----------- SECTION 1 ------------ */}
      <section>
        <CakesSection />
      </section>

      {/* ----------- SECTION 2 ------------ */}
      <section className="relative z-20 w-full overflow-x-hidden">
        <CircleCakesSection />
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
