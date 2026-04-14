"use client";

import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import CakeInfoSection from "@/modules/cake/presentation/components/CakeInfoSection";
import CakesSection from "@/modules/cake/presentation/components/CakesSection";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#FAF3E0]">
      {/* ------------------ APP BAR ------------------ */}
      <div className="relative z-9">
        <div className="flex h-[60px] md:h-[70px]">
          <div className="relative w-[100px] h-[86px] ml-3 lg:ml-8 md:-mt-1 overflow-visible">
            <Link href="/es">
              <Image
                src="/img/hey-cookie-logo-opacity.webp"
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
