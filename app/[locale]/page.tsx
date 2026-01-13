"use client";

import Images from "@/core/assets/Images";
import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import { useBreakpoint } from "@/core/hooks/useBreakpoint";
import { CustomBreakpoint } from "@/core/types/general";
import Contact from "@/modules/home/presentation/components/Contact";
import Cookies from "@/modules/home/presentation/components/Cookies";
import Hero from "@/modules/home/presentation/components/Hero";

export default function Home() {
  const breakpointsConfig: Record<
    CustomBreakpoint,
    { min?: number; max?: number }
  > = {
    cxxs: { max: 1 },
    cxs: { min: 2, max: 839 },
    csm: { min: 840, max: 1022 },
    cmd: { min: 1023, max: 1199 },
    clg: { min: 1200 },
  };

  const breakpoint = useBreakpoint(breakpointsConfig);

  return (
    <main>
      {/* ----------- APP BAR --------------*/}
      <AppBar />

      {/* ----------- SECTION 1 ------------ */}
      <section>
        <Hero />
      </section>

      {/* ----------- SECTION 2 ------------ */}
      <section
        id="cookies"
        className="w-screen flex items-center justify-center relative z-20"
      >
        <Cookies />
      </section>

      {/* ----------- SECTION 3 ------------ */}
      <section className="w-screen flex items-center justify-center">
        <Contact />
      </section>

      {/* ----------- FOOTER ------------ */}
      <FooterBar />
    </main>
  );
}
