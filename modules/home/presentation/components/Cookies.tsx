"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CustomBreakpoint } from "@/core/types/general";
import { useBreakpoint } from "@/core/hooks/useBreakpoint";
import Chip from "@/core/components/chip/Chip";
import styles from "./Cookies.module.scss";

const cookies = [
  {
    id: 1,
    image: "/img/vc-product-splash-v2.png",
    name: "Vainilla Chips",
    description:
      "Galleta clásica de vainilla rellena de chispas de chocolate Hershey con cobertura de ganache de choclate y una perla de chocolate blanco.",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 2,
    image: "/img/ci-product-splash-v2.png",
    name: "Chocolate intenso",
    description:
      "Para los amantes del chocolate, elegante galleta de cocoa rellena de chispas de chocolate Hershey, cubierta con ganache de chocolate y cacao triturado.",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 3,
    image: "/img/rv-product-splash-v2.png",
    name: "Red Velvet",
    description:
      "Disfruta de la navidad eterna con esta galleta innovadora del clásico Red Velvet con cobertura de azucar glass con arándamos",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 4,
    image: "/img/mr-product-splash.png",
    name: "Marmoleada",
    description:
      "Disfruta de lo mejor de dos mundos con esta deliciosa galleta de vainilla y cocoa con relleno de chispas de chocolate Hershey y cobertura de ganache de chocolate y nuez",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 5,
    image: "/img/mt-product-splash.png",
    name: "Matcha",
    description:
      "Si te gustan los sabores fuertes, esta galleta es para ti, elaborada a base de matcha con relleno de chocolate blanco y coco, cobertura de chocolate blanco con coco tostado",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 6,
    image: "/img/ry-product-splash.png",
    name: "Reyes",
    description:
      "Esta galleta de edición limitada le agrega un toque innovador a nuestra galleta clásica al cambiar la cobertura por chocolate blanco y ate.",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
];

export default function Cookies() {
  const t = useTranslations("home");

  const swipeConfidenceThreshold = 80;
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (!menuRef.current) return;
      setHasOverflow(menuRef.current.scrollWidth > menuRef.current.clientWidth);
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  const scrollMenu = (direction: "left" | "right") => {
    if (!menuRef.current) return;
    menuRef.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  const changeCookie = (index: number) => {
    if (index < 0 || index >= cookies.length) return;
    setActiveIndex(index);
  };

  const activeCookie = cookies[activeIndex];

  return (
    <main className="relative w-full overflow-hidden bg-gradient-to-br from-[#F8EDE3] via-[#F1DCC9] to-[#E6C7A5]">
      {/* TOP ORGANIC SHAPE */}
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-full h-[140px]"
      >
        <path
          d="
      M0,80
      C120,40 240,120 360,80
      C480,40 600,120 720,80
      C840,40 960,120 1080,80
      C1200,40 1320,120 1440,80
      L1440,0
      L0,0
      Z
    "
          fill="#FAF3E0"
        />
      </svg>

      {/* HEADER */}
      <div className="relative z-10 px-20 pt-32">
        <h2 className="text-5xl font-extrabold text-[#DA6C94] text-center">
          Sweet Cookies
        </h2>

        <div className="w-full flex justify-center pt-4">
          <svg
            width="150"
            height="44"
            viewBox="0 0 150 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="wavePattern"
                x="0"
                y="0"
                width="48"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="
          M0 10
          C6 2 12 18 18 10
          C24 2 30 18 36 10
          C42 2 48 18 54 10
        "
                  stroke="rgba(200, 184, 160, 1)"
                  stroke-width="1.8"
                  fill="none"
                  stroke-linecap="round"
                />
              </pattern>
            </defs>
            <rect
              x="0"
              y="4"
              width="150"
              height="20"
              fill="url(#wavePattern)"
            />
            +
            <rect
              x="0"
              y="24"
              width="150"
              height="20"
              fill="url(#wavePattern)"
            />
          </svg>
        </div>

        {/* MENU */}
        <div className="relative mt-6 w-full flex justify-center">
          {hasOverflow && (
            <button
              onClick={() => scrollMenu("left")}
              className="
        absolute left-0 top-1/2 -translate-y-1/2
        z-10 text-3xl text-[#6B3E26]
        hover:scale-110 transition cursor-pointer
      "
            >
              ‹
            </button>
          )}

          {/* CENTERED MENU */}
          <div
            ref={menuRef}
            className={`
    flex gap-10
    max-w-[70%]
    overflow-x-auto overflow-y-hidden
    whitespace-nowrap
    px-6
    ${styles.scrollbarHide}
    ${hasOverflow ? "justify-start" : "justify-center"}
  `}
          >
            {cookies.map((cookie, index) => (
              <button
                key={cookie.id}
                onClick={() => changeCookie(index)}
                className={`
        text-lg font-semibold transition-all duration-300 cursor-pointer
        ${
          activeIndex === index
            ? "text-[#377F81] scale-110"
            : "text-[#377F81]/70 hover:text-[#6B3E26]"
        }
      `}
              >
                {cookie.name}
              </button>
            ))}
          </div>

          {hasOverflow && (
            <button
              onClick={() => scrollMenu("right")}
              className="
        absolute right-0 top-1/2 -translate-y-1/2
        z-10 text-3xl text-[#6B3E26]
        hover:scale-110 transition cursor-pointer
      "
            >
              ›
            </button>
          )}
        </div>
      </div>

      {/* CAROUSEL CONTENT */}
      <section className="relative z-10 mt-6 px-20 pb-36 flex overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -swipeConfidenceThreshold) {
              changeCookie(activeIndex + 1);
            } else if (info.offset.x > swipeConfidenceThreshold) {
              changeCookie(activeIndex - 1);
            }
          }}
          className="w-full"
        >
          {/* LEFT ARROW */}
          <button
            onClick={() => changeCookie(activeIndex - 1)}
            className="absolute left-16 top-1/2 -translate-y-1/2 text-5xl text-[#6B3E26] hover:scale-110 transition cursor-pointer"
          >
            ‹
          </button>

          <div
            className={`grid w-full gap-16 ${
              breakpoint === "clg" ? "grid-cols-2 items-center" : "grid-cols-1"
            }`}
            style={{ gap: breakpoint === "clg" ? "82px" : "16px" }}
          >
            {/* IMAGE */}
            <div className="flex justify-center w-full h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCookie.id}-img`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="
    relative
    aspect-square
    rounded-full
    overflow-hidden
  "
                  style={{
                    width:
                      breakpoint === "clg"
                        ? "80%"
                        : breakpoint === "cmd"
                        ? "50%"
                        : "55%",
                  }}
                >
                  <Image
                    src={activeCookie.image}
                    alt={activeCookie.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 70vw, 420px"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* INFO */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCookie.id}-info`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="w-[85%] h-full"
                style={{
                  paddingTop: breakpoint === "clg" ? "82px" : "0px",
                  textAlign: breakpoint === "clg" ? "left" : "center",
                  width: breakpoint === "clg" ? "85%" : "100%",
                }}
              >
                <h3
                  className="
    text-[clamp(3.5rem,5.3vw,6rem)]
    font-extrabold
    bg-gradient-to-r
    from-[#3A1F14]
    via-[#7A4A32]
    to-[#B07A52]
    bg-clip-text
    leading-tight
    text-transparent
  "
                  style={{ textShadow: "0 4px 16px rgba(58, 31, 20, 0.28)" }}
                >
                  {activeCookie.name}
                </h3>

                <p
                  className="mt-10 text-[clamp(1.5rem,2vw,2rem)] text-[#6B3E26]/80 mx-auto"
                  style={{
                    width: breakpoint === "clg" ? "100%" : "60%",
                    textAlign: breakpoint === "clg" ? "left" : "center",
                  }}
                >
                  {activeCookie.description}
                </p>

                <div
                  className="mt-10 flex items-center gap-4 w-full"
                  style={{
                    justifyContent: breakpoint !== "clg" ? "center" : "start",
                  }}
                >
                  <Chip
                    text={activeCookie.price}
                    color="#6B3E26"
                    bg="transparent"
                    border="solid 1px #6B3E26"
                    width="130px"
                  />
                  <Chip
                    text={activeCookie.sale}
                    color="#6B3E26"
                    bg="transparent"
                    border="solid 1px #6B3E26"
                    width="130px"
                  />
                  <Chip
                    text={activeCookie.sale2}
                    color="#fff"
                    bg="#47a2a5ff"
                    border="none"
                    width="130px"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={() => changeCookie(activeIndex + 1)}
            className="absolute right-18 top-1/2 -translate-y-1/2 text-5xl text-[#6B3E26] hover:scale-110 transition cursor-pointer"
          >
            ›
          </button>
        </motion.div>
      </section>

      {/* BOTTOM ORGANIC SHAPE */}
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[140px]"
      >
        <path
          d="
      M0,60
      C120,100 240,20 360,60
      C480,100 600,20 720,60
      C840,100 960,20 1080,60
      C1200,100 1320,20 1440,60
      L1440,140
      L0,140
      Z
    "
          fill="#FAF3E0"
        />
      </svg>
    </main>
  );
}
