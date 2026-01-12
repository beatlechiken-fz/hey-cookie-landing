"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CustomBreakpoint } from "@/core/types/general";
import { useBreakpoint } from "@/core/hooks/useBreakpoint";

export default function Hero() {
  const t = useTranslations("home");

  const breakpointsConfig: Record<
    CustomBreakpoint,
    { min?: number; max?: number }
  > = {
    cxs: { max: 839 },
    csm: { min: 840, max: 1022 },
    cmd: { min: 1023, max: 1199 },
    clg: { min: 1200 },
  };

  const breakpoint = useBreakpoint(breakpointsConfig);

  return (
    <section
      className="relative h-auto bg-[#FAF3E0]"
      style={{
        overflow: breakpoint !== "clg" ? "hidden" : "visible",
      }}
    >
      {/* ORGANIC BACKGROUND SHAPES */}
      {breakpoint === "clg" && (
        <>
          {/* Top Right */}
          <svg
            className="
    absolute
    top-[-520px]
    right-[-520px]
    w-[1400px]
    h-[1400px]
    z-0
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
        </>
      )}

      {/* Content */}
      <div
        className="relative z-10 flex items-start px-10 md:px-20"
        style={{
          flexDirection: breakpoint !== "clg" ? "column" : "row",
          overflow: breakpoint !== "clg" ? "hidden" : "visible",
        }}
      >
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="flex flex-col py-8 w-full overflow-hidden"
            style={{
              justifyContent: breakpoint !== "clg" ? "start" : "space-between",
              paddingBottom: breakpoint !== "clg" ? "24px" : "112px",
              height: breakpoint !== "clg" ? "auto" : "100vh",
            }}
          >
            <div
              className="flex"
              style={{
                justifyContent: breakpoint !== "clg" ? "center" : "start",
              }}
            >
              <Image
                src="/img/hey-cookie-logo-main.png"
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
                }}
              />
            </div>

            <div className="w-full">
              <div
                className="w-full flex text-[clamp(2.5rem,5vw,5rem)] font-bold text-[#6B3E26] leading-tight flex-col"
                style={{
                  gap: breakpoint !== "clg" ? "14px" : "0",
                  justifyContent: breakpoint !== "clg" ? "center" : "start",
                  alignItems: breakpoint !== "clg" ? "center" : "start",
                  marginTop: breakpoint !== "clg" ? "24px" : "0",
                }}
              >
                <h1>Un bocado</h1>
                <h1 className="text-[#C68642]">al corazón</h1>
              </div>

              <p
                className="mt-6 text-[clamp(1.8rem,2vw,2rem)] text-[#6B3E26]/80"
                style={{
                  textAlign: breakpoint !== "clg" ? "center" : "left",
                  width: breakpoint !== "clg" ? "100%" : "90%",
                }}
              >
                Galletas artesanales con mantequilla real, sabores intensos y un
                toque nostálgico que enamora.
              </p>

              <div
                className="mt-10 flex gap-4"
                style={{
                  justifyContent: breakpoint !== "clg" ? "center" : "start",
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
                  className="px-8 py-4 rounded-full bg-[#6B3E26] text-white font-semibold hover:bg-[#C68642] transition cursor-pointer"
                >
                  Galletas
                </button>

                <a
                  href="https://wa.me/5214433853472?text=Hola%20me%20gustaría%20cotizar%20galletas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-full border-2 border-[#6B3E26] text-[#6B3E26] font-semibold hover:bg-[#6B3E26] hover:text-white transition cursor-pointer"
                >
                  Cotizar
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative flex items-center justify-center w-full h-full"
        >
          <div
            className="relative flex items-center justify-center"
            style={{
              height: breakpoint !== "clg" ? "120%" : "100vh",
              width: "100%",
              marginTop: breakpoint !== "clg" ? "24px" : "0",
            }}
          >
            <Image
              src={
                breakpoint !== "clg"
                  ? "/img/hero-splash-h.png"
                  : "/img/hero-splash-v2.png"
              }
              alt="Hey Cookie"
              width={1000}
              height={1000}
              priority
              className="object-contain"
              style={{
                width: breakpoint !== "clg" ? "70%" : "90%",
                maxHeight: "100%",
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
