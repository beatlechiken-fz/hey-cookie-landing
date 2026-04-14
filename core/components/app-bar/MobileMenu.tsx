"use client";

import { motion } from "framer-motion";
import MainNav from "./MainNav";
import Image from "next/image";
import FooterBar from "../footer-bar/FooterBar";
import { createPortal } from "react-dom";

export default function MobileMenu({ onClose }: { onClose: () => void }) {
  if (typeof window === "undefined") return null;

  return createPortal(
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        fixed inset-0
        bg-[rgba(107,62,38,0.35)]
        backdrop-blur-sm
        z-[9999999999]
      "
    >
      <motion.section
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="
          absolute right-0 top-0 h-full w-[85%] max-w-sm
          bg-[#FAF3E0]
          border-l border-[#6B3E26]/20
          rounded-l-3xl
          p-6
          shadow-2xl
          overflow-hidden
        "
      >
        {/* 🎨 MANCHAS DECORATIVAS */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {[
            // IZQUIERDA
            { side: "left", top: "20%", size: 120, opacity: 0.18 },
            { side: "left", top: "6%", size: 200, opacity: 0.2 },
            { side: "left", top: "60%", size: 340, opacity: 0.16 },

            // DERECHA
            { side: "right", top: "18%", size: 220, opacity: 0.2 },
            { side: "right", top: "60%", size: 160, opacity: 0.17 },
          ].map((blob, i) => (
            <svg
              key={i}
              className={`absolute ${
                blob.side === "left"
                  ? "-translate-x-1/2 left-0"
                  : "translate-x-1/2 right-0"
              }`}
              style={{
                top: blob.top,
                width: blob.size,
                height: blob.size,
                opacity: blob.opacity,
              }}
              viewBox="0 0 400 400"
            >
              <circle cx="200" cy="200" r="200" fill="#C9A97E" />
            </svg>
          ))}
        </div>

        {/* CONTENIDO */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            {/* HEADER */}
            <div className="flex justify-end items-start">
              <button
                onClick={onClose}
                className="
                  p-2 rounded-full
                  hover:bg-[#6B3E26]/10
                  transition
                "
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path
                    d="M6 6l12 12M18 6l12 12"
                    stroke="#3A1F14"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* LOGO */}
            <div className="w-full h-[120px] flex justify-center relative">
              <Image
                src="/img/hey-cookie-logo-opacity.webp"
                alt="Hey Cookie"
                width={112}
                height={112}
                className="absolute"
              />
            </div>

            {/* NAV */}
            <div className="flex flex-col gap-6">
              <MainNav isMobile onSelect={onClose} />
            </div>
          </div>

          {/* FOOTER */}
          <FooterBar appearance="light" />
        </div>
      </motion.section>
    </motion.section>,
    document.body,
  );
}
