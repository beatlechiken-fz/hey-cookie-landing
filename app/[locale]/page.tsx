"use client";

import FooterBar from "@/core/components/footer-bar/FooterBar";
import Contact from "@/modules/home/presentation/components/Contact";
import Cookies from "@/modules/home/presentation/components/Cookies";
import Hero from "@/modules/home/presentation/components/Hero";

export default function Home() {
  return (
    <main className="bg-[#FAF3E0]">
      {/* ----------- SECTION 1 ------------ */}
      <section>
        <Hero />
      </section>

      {/* ----------- SECTION 3 ------------ */}
      <section className="w-full flex items-center justify-center">
        <Contact />
      </section>

      {/* ----------- FOOTER ------------ */}
      <FooterBar />
    </main>
  );
}
