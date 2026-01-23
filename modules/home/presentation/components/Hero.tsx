"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CustomBreakpoint } from "@/core/types/general";
import { useBreakpoint } from "@/core/hooks/useBreakpoint";
import AppBar from "@/core/components/app-bar/AppBar";
import { useEffect } from "react";

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

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <section className="relative bg-[#FAF3E0] overflow-hidden">
        {/* ----------- APP BAR --------------*/}
        <div className="relative z-50">
          <AppBar />
        </div>

        {/* DECORATIVE BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {breakpoint === "clg" && (
            <svg
              className="
                absolute
                z-0
                top-[-30vw]
                right-[-30vw]
                w-[clamp(600px,80vw,1400px)]
                h-[clamp(600px,80vw,1400px)]
              "
              viewBox="0 0 400 400"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="
                M200 30
                C285 20, 365 95, 380 185
                C395 265, 330 350, 235 370
                C140 395, 55 330, 35 235
                C15 135, 90 45, 200 30
                Z
              "
                fill="#E6C7A5"
              />
            </svg>
          )}
        </div>

        {/* CONTENT */}
        <div
          className="relative z-10 flex px-10 md:px-20"
          style={{
            flexDirection: breakpoint !== "clg" ? "column" : "row",
          }}
        >
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <div className="flex flex-col w-full gap-8">
              {/* LOGO */}
              <div
                className="flex"
                style={{
                  justifyContent:
                    breakpoint !== "clg" ? "center" : "flex-start",
                }}
              >
                <Image
                  src="/img/hey-cookie-logo.webp"
                  alt="Hey Cookie"
                  width={220}
                  height={220}
                  priority
                  className="relative z-10 h-auto"
                  style={{
                    width:
                      breakpoint === "clg"
                        ? "40%"
                        : breakpoint === "cmd"
                        ? "20%"
                        : breakpoint === "csm"
                        ? "32%"
                        : "45%",
                    maxHeight: "35vh",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* TEXT */}
              <div className="w-full">
                <div
                  className="
                  w-full
                  flex
                  flex-col
                  font-title
                  leading-tight
                  text-transparent
                  bg-clip-text
                  bg-gradient-to-r
                  from-[#3A1F14]
                  via-[#AA6A42]
                  to-[#F09A92]
                  text-[clamp(2.5rem,5vw,5rem)]
                "
                  style={{
                    gap: breakpoint !== "clg" ? "14px" : "0",
                    alignItems: breakpoint !== "clg" ? "center" : "flex-start",
                  }}
                >
                  <h1>{t("title1")}</h1>
                  <h1 className="bg-gradient-to-r from-[#8A3414] via-[#C68642] to-[#D7B07A] bg-clip-text text-transparent">
                    {t("title2")}
                  </h1>
                </div>

                <p
                  className="mt-6 text-[clamp(1.8rem,2vw,2rem)] text-[#6B3E26]/80"
                  style={{
                    textAlign: breakpoint !== "clg" ? "center" : "left",
                    width: breakpoint !== "clg" ? "100%" : "90%",
                  }}
                >
                  {t("titleDescription")}
                </p>

                {/* BUTTONS */}
                <div
                  className="mt-10 flex gap-4"
                  style={{
                    justifyContent:
                      breakpoint !== "clg" ? "center" : "flex-start",
                  }}
                >
                  <button
                    onClick={() => {
                      const el = document.getElementById("cookies");
                      el?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="px-8 py-4 rounded-full bg-[#6B3E26] text-white font-semibold hover:bg-[#C68642] transition"
                  >
                    {t("cookiesButton")}
                  </button>

                  <a
                    href="https://wa.me/5214433853472?text=Hola%20me%20gustaría%20cotizar%20galletas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 rounded-full border-2 border-[#6B3E26] text-[#6B3E26] font-semibold hover:bg-[#6B3E26] hover:text-white transition"
                  >
                    {t("quoteButton")}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex items-center justify-center w-full"
          >
            <div className="relative flex items-center justify-center w-full">
              <Image
                src={
                  breakpoint !== "clg"
                    ? "/img/hero-splash-h.webp"
                    : "/img/hero-splash.webp"
                }
                alt="Hey Cookie"
                width={1000}
                height={1000}
                priority
                className="object-contain"
                style={{
                  width: breakpoint !== "clg" ? "70%" : "90%",
                  maxHeight: "80dvh",
                  marginTop: breakpoint !== "clg" ? "48px" : "0",
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
