"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CustomBreakpoint } from "@/core/types/general";
import { useBreakpoint } from "@/core/hooks/useBreakpoint";
import AppBar from "@/core/components/app-bar/AppBar";
import styles from "./Hero.module.scss";

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
    <>
      <section className="relative bg-[#FAF3E0] overflow-x-hidden">
        {/* ----------- APP BAR --------------*/}
        <div className="relative z-50">
          <AppBar />
        </div>

        {/* DECORATIVE BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none overflow-x-hidden">
          {breakpoint === "clg" && (
            <svg
              className="
                absolute
                z-0
                top-[-30vw]
                right-[-30vw]
                w-[clamp(600px,80vw,1400px)]
                h-[clamp(600px,80vw,1400px)]
                pointer-events-none
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
          {/* RIGHT */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            drag={false}
            dragListener={false}
            whileTap={undefined}
            className="relative flex items-center justify-center w-full"
            onPointerDown={(e) => e.stopPropagation()}
            style={{ pointerEvents: "auto" }}
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
          </motion.section>
        </div>
      </section>
    </>
  );
}
