"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CustomBreakpoint } from "@/core/types/general";
import { useBreakpoint } from "@/core/hooks/useBreakpoint";
import AppBar from "@/core/components/app-bar/AppBar";

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
    <section className="relative bg-[#FAF3E0] overflow-x-hidden">
      {/* ------------------ APP BAR ------------------ */}
      <div className="relative z-50">
        <AppBar />
      </div>

      {/* ------------------ CONTENT ------------------ */}
      <div
        className="relative z-10 flex px-10 md:px-20"
        style={{
          flexDirection: breakpoint !== "clg" ? "column" : "row",
        }}
      >
        {/* LEFT */}
        <section className="w-full">
          <div className="flex flex-col w-full gap-8">
            {/* LOGO */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex"
              style={{
                justifyContent: breakpoint !== "clg" ? "center" : "flex-start",
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
            </motion.div>

            {/* TITLES */}
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
            </motion.div>

            {/* DESCRIPTION */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
              className="mt-6 text-[clamp(1.8rem,2vw,2rem)] text-[#6B3E26]/80"
              style={{
                textAlign: breakpoint !== "clg" ? "center" : "left",
                width: breakpoint !== "clg" ? "100%" : "90%",
              }}
            >
              {t("titleDescription")}
            </motion.p>

            {/* BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
              className="mt-0 flex gap-4"
              style={{
                justifyContent: breakpoint !== "clg" ? "center" : "flex-start",
              }}
            >
              <button
                onClick={() => {
                  const el = document.getElementById("cookies");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            </motion.div>
          </div>
        </section>

        {/* RIGHT */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex items-center justify-center w-full"
        >
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
            className={`
    object-contain
    ${
      breakpoint === "clg"
        ? "drop-shadow-[0_28px_45px_rgba(107,62,38,0.35)]"
        : ""
    }
  `}
            style={{
              width: breakpoint !== "clg" ? "70%" : "85%",
              maxHeight: "70dvh",
              marginTop: breakpoint !== "clg" ? "48px" : "0",
            }}
          />
        </motion.section>
      </div>
    </section>
  );
}
