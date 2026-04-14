"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CustomBreakpoint } from "@/core/types/general";
import { useBreakpoint } from "@/core/hooks/useBreakpoint";

export default function HeroDesktop() {
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
    <div
      className="w-full h-full"
      style={{
        background: `
      radial-gradient(
        circle at 33% 76%,
        rgba(92, 69, 23, 1) 0%,
        #000 45%
      )
    `,
      }}
    >
      <div
        className="relative z-10 flex px-10 md:px-20 bg-[url('/img/splash.webp')] bg-cover bg-center h-screen w-full"
        style={{
          flexDirection: breakpoint !== "clg" ? "column" : "row",
        }}
      >
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="absolute top-0 left-0 w-full h-[140px]"
        >
          <path
            d="
            M0,20
            C120,60 240,-20 360,20
            C480,60 600,-20 720,20
            C840,60 960,-20 1080,20
            C1200,60 1320,-20 1440,20
            L1440,0
            L0,0
            Z
          "
            fill="#FAF3E0"
          />
        </svg>

        {/* LEFT */}
        <section className="w-full">
          <div className="flex flex-col w-full gap-8 pt-20 md:pt-24">
            {/* TITLE */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
              className="
                  font-title-light
                  leading-[1.2]
                  bg-clip-text
                  text-transparent
                  bg-gradient-to-r
                  from-[#7FBF7F]
                  via-[#C8F2B8]
                  to-[#F1FFE3]
                  "
              style={{
                textAlign: "left",
                width: breakpoint !== "clg" ? "100%" : "90%",
              }}
            >
              <div className="flex flex-col">
                <span className="text-[clamp(1.7rem,4vw,4rem)]">
                  {t("titleDescription")}
                </span>
                <span className="text-[clamp(2.2rem,5vw,5rem)]">
                  {t("titleDescription2")}
                </span>
              </div>
            </motion.p>

            {/* SLOGAN */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              className="
                w-full
                flex
                flex-col
                font-title
                leading-tight
                text-transparent
                bg-clip-text
                bg-gradient-to-r
                from-[#ffebda]
                via-[#ffd166]
                to-[#ffd166]
                text-[clamp(2.5rem,5vw,5rem)]
              "
              style={{
                gap: breakpoint !== "clg" ? "14px" : "0",
                alignItems: "flex-start",
              }}
            >
              <h1>{t("title1")}</h1>
              <h1>{t("title2")}</h1>
            </motion.div>

            {/* BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
              className="mt-0 flex gap-4"
              style={{
                justifyContent: "flex-start",
              }}
            >
              <a
                href="https://wa.me/5214433853472?text=Hola%20me%20gustaría%20cotizar%20galletas"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full border-2 border-[#ffebda] text-[#ffebda] font-semibold hover:bg-[#6B3E26] hover:text-white transition"
              >
                {t("quoteButton")}
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
