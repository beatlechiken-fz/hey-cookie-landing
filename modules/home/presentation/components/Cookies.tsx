"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CustomBreakpoint } from "@/core/types/general";
import { useBreakpoint } from "@/core/hooks/useBreakpoint";
import styles from "./Cookies.module.scss";
import Icons from "@/core/assets/Icons";

const cookies = [
  {
    id: 1,
    image: "/img/vc-product-splash.webp",
    name: "vainilla.name",
    description: "vainilla.description",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 2,
    image: "/img/ci-product-splash.webp",
    name: "chocolate.name",
    description: "chocolate.description",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 3,
    image: "/img/rv-product-splash.webp",
    name: "red.name",
    description: "red.description",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 4,
    image: "/img/mr-product-splash.webp",
    name: "marmoleada.name",
    description: "marmoleada.description",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 5,
    image: "/img/mt-product-splash.webp",
    name: "matcha.name",
    description: "matcha.description",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 6,
    image: "/img/or-product-splash.webp",
    name: "oreo.name",
    description: "oreo.description",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 7,
    image: "/img/pop-product-splash.webp",
    name: "pop.name",
    description: "pop.description",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 8,
    image: "/img/tm-product-splash.webp",
    name: "taro.name",
    description: "taro.description",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
  {
    id: 9,
    image: "/img/ry-product-splash.webp",
    name: "reyes.name",
    description: "reyes.description",
    price: "1pz $25.00",
    sale: "2pz $40.00",
    sale2: "3pz $55.00",
  },
];

export default function Cookies() {
  const t = useTranslations("cookies");

  const cookiesTranslated = cookies.map((cookie) => ({
    ...cookie,
    name: t(cookie.name),
    description: t(cookie.description),
  }));

  const swipeConfidenceThreshold = 80;

  const breakpointsConfig: Record<
    CustomBreakpoint,
    { min?: number; max?: number }
  > = {
    cxxs: { max: 619 },
    cxs: { min: 620, max: 839 },
    csm: { min: 840, max: 1022 },
    cmd: { min: 1023, max: 1199 },
    clg: { min: 1200 },
  };

  const breakpoint = useBreakpoint(breakpointsConfig);

  const [activeIndex, setActiveIndex] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasMounted = useRef(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (!menuRef.current) return;
      setHasOverflow(menuRef.current.scrollWidth > menuRef.current.clientWidth);
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const activeItem = itemRefs.current[activeIndex];
    if (!activeItem) return;

    activeItem.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex]);

  const scrollMenu = (direction: "left" | "right") => {
    if (!menuRef.current) return;
    menuRef.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  const changeCookie = (index: number) => {
    const total = cookies.length;

    if (index < 0) {
      setActiveIndex(total - 1);
      return;
    }

    if (index >= total) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(index);
  };

  const activeCookie = cookiesTranslated[activeIndex];

  return (
    <main
      className="relative w-full overflow-x-hidden bg-gradient-to-br from-[#F8EDE3] via-[#F1DCC9] to-[#E6C7A5]"
      style={{ contain: "layout paint" }}
    >
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
      <div
        className="relative z-10 pt-32"
        style={{
          paddingLeft: breakpoint === "cxs" ? "20px" : "48px",
          paddingRight: breakpoint === "cxs" ? "20px" : "48px",
        }}
      >
        <h2 className="text-5xl text-[#DA6C94] text-center font-title">
          {t("title")}
        </h2>

        <div className="w-full flex justify-center pt-4">
          <Image src={Icons.waves} alt="" width={120} height={20} />
        </div>

        {/* MENU */}
        <div className="relative mt-6 w-full flex justify-center">
          {hasOverflow && (
            <button
              onClick={() => scrollMenu("left")}
              className="
        absolute left-3 top-1/2 -translate-y-1/2
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
              w-[75%]
              overflow-x-auto overflow-y-hidden
              whitespace-nowrap
              px-4
              ${styles.scrollbarHide}
              ${hasOverflow ? "justify-start" : "justify-center"}
            `}
          >
            {cookiesTranslated.map((cookie, index) => (
              <button
                key={cookie.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
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
                absolute right-3 top-1/2 -translate-y-1/2
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
      <section
        className="relative z-10 mt-6 pb-36 flex overflow-hidden"
        style={{
          paddingLeft: breakpoint === "cxs" ? "8px" : "48px",
          paddingRight: breakpoint === "cxs" ? "8px" : "48px",
        }}
      >
        {/* ARROWS OVERLAY */}
        <div className="absolute inset-y-0 left-0 right-0 pointer-events-none z-20">
          <div className="relative h-full w-full">
            {/* LEFT ARROW */}
            <button
              onClick={() => changeCookie(activeIndex - 1)}
              className="absolute top-1/2 -translate-y-1/2 text-5xl text-[#6B3E26] hover:scale-110 transition cursor-pointer pointer-events-auto"
              style={{
                left:
                  breakpoint === "cxxs" || breakpoint === "cxs"
                    ? "32px"
                    : "56px",
              }}
            >
              ‹
            </button>

            {/* RIGHT ARROW */}
            <button
              onClick={() => changeCookie(activeIndex + 1)}
              className="absolute top-1/2 -translate-y-1/2 text-5xl text-[#6B3E26] hover:scale-110 transition cursor-pointer pointer-events-auto"
              style={{
                right:
                  breakpoint === "cxxs" || breakpoint === "cxs"
                    ? "34px"
                    : "52px",
              }}
            >
              ›
            </button>
          </div>
        </div>

        <div className="relative w-full overflow-hidden">
          <motion.div
            drag="x"
            dragListener={false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.x < -swipeConfidenceThreshold) {
                changeCookie(activeIndex + 1);
              } else if (info.offset.x > swipeConfidenceThreshold) {
                changeCookie(activeIndex - 1);
              }
            }}
            className="w-full"
            style={{ touchAction: "pan-y" }}
          >
            <div
              className={`grid w-full gap-16 ${
                breakpoint === "clg"
                  ? "grid-cols-2 items-center"
                  : "grid-cols-1"
              }`}
              style={{ gap: breakpoint === "clg" ? "82px" : "16px" }}
            >
              {/* IMAGE */}
              <div className="flex justify-center w-full h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeCookie.id}-img`}
                    drag="x"
                    dragListener={true}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="relative rounded-full overflow-hidden flex items-center justify-center"
                    style={{
                      touchAction: "pan-y",
                      width:
                        breakpoint === "clg"
                          ? "80%"
                          : breakpoint === "cmd"
                            ? "60%"
                            : "70%",
                      maxWidth: "520px",
                      aspectRatio: "1 / 1",
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

              {/* INFO (DESCRIPCIÓN INTACTA) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCookie.id}-info`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                  style={{
                    touchAction: "pan-y",
                    paddingTop: breakpoint === "clg" ? "82px" : "0px",
                    textAlign: breakpoint === "clg" ? "left" : "center",
                    width: breakpoint === "clg" ? "85%" : "100%",
                  }}
                >
                  <h3 className="text-[clamp(3rem,5.3vw,6rem)] font-extrabold bg-gradient-to-r from-[#3A1F14] via-[#AA6A42] to-[#A07A42] bg-clip-text leading-tight text-transparent font-subtitle">
                    {activeCookie.name}
                  </h3>

                  <p className="mt-10 text-[clamp(1.2rem,2vw,2rem)] text-[#6B3E26]/80 mx-auto">
                    {activeCookie.description}
                  </p>

                  {/* CHIPS intactos */}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
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
