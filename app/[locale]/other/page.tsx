"use client";

import AppBar from "@/core/components/app-bar/AppBar";
import ComingSoon from "@/core/components/comming-soon/ComingSoon";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("comingSoon");

  return (
    <main className="bg-[#FAF3E0] h-screen">
      {/* ----------- APPBAR ------------ */}
      <AppBar />

      {/* ----------- SECTION 1 ------------ */}
      <section>
        <ComingSoon
          title={t("coming")}
          subtitle={t("comingSub")}
          description={t("comingDesc")}
          showBack={true}
        />
      </section>

      {/* ----------- FOOTER ------------ */}
      <FooterBar />
    </main>
  );
}
