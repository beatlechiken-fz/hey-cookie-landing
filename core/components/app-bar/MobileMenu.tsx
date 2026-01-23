"use client";

import { motion } from "framer-motion";
import MainNav from "./MainNav";

export default function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="
        fixed inset-0 z-50
        bg-[rgba(107,62,38,0.35)]
        backdrop-blur-sm
      "
    >
      <motion.div
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
        "
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <span className="text-xl font-title text-[#3A1F14]">Menú</span>

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

        {/* NAV */}
        <div className="flex flex-col gap-6">
          <MainNav isMobile onSelect={onClose} />
        </div>
      </motion.div>
    </motion.div>
  );
}
