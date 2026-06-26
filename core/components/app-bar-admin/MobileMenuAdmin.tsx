"use client";
// src/components/admin/appbar/AdminMobileMenu.tsx
// Espejo de MobileMenu con colores y contenido del panel admin.

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import AdminNav from "./MainNavAdmin";
import { signOut } from "next-auth/react";

export default function AdminMobileMenu({ onClose }: { onClose: () => void }) {
  if (typeof window === "undefined") return null;

  return createPortal(
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[rgba(60,20,30,0.45)] backdrop-blur-sm z-[9999]"
    >
      <motion.section
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="
          absolute right-0 top-0 h-full w-[85%] max-w-sm
          bg-[#fdf6f0]
          border-l border-[#f5dce4]
          rounded-l-3xl p-6 shadow-2xl overflow-hidden
        "
      >
        {/* Manchas decorativas — misma lógica que MobileMenu, colores admin */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {[
            { side: "left", top: "20%", size: 120, opacity: 0.14 },
            { side: "left", top: "6%", size: 200, opacity: 0.16 },
            { side: "left", top: "60%", size: 340, opacity: 0.12 },
            { side: "right", top: "18%", size: 220, opacity: 0.16 },
            { side: "right", top: "60%", size: 160, opacity: 0.13 },
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
              <circle cx="200" cy="200" r="200" fill="#c0607a" />
            </svg>
          ))}
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#7b2d42] font-bold text-lg">
                🎂 Panel Admin
              </span>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#f5dce4] transition"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="#7b2d42"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Nav */}
            <AdminNav isMobile onSelect={onClose} />
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="
              flex items-center gap-2 px-4 py-3
              text-[#7b2d42]/70 hover:text-[#C0607A]
              hover:bg-[#f5dce4]/60
              rounded-xl transition text-[15px]
            "
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </motion.section>
    </motion.section>,
    document.body,
  );
}
