"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { CustomBreakpoint } from "@/core/types/general";
import { useBreakpoint } from "@/core/hooks/useBreakpoint";
import AppBar from "@/core/components/app-bar/AppBar";
import HeroDesktop from "./HeroDesktop";
import Link from "next/link";

export default function Hero() {
  const t = useTranslations("hero");

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
    <section className="relative overflow-x-hidden">
      {/* ------------------ APP BAR ------------------ */}
      <div className="relative z-99999">
        <div className="flex h-[60px] md:h-[70px]">
          <div className="relative w-[100px] h-[86px] ml-2 md:ml-8 md:-mt-1 overflow-visible">
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

      <HeroDesktop />

      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[140px] z-20"
      >
        <path
          d="
            M0,80
            C120,40 240,120 360,80
            C480,40 600,120 720,80
            C840,40 960,120 1080,80
            C1200,40 1320,120 1440,80
            L1440,140
            L0,140
            Z
          "
          fill="#F8EDE3"
        />
      </svg>
    </section>
  );
}
