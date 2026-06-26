"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import AdminNav from "./MainNavAdmin";
import AdminMobileMenu from "./MobileMenuAdmin";
import Image from "next/image";
import Images from "@/core/assets/Images";
import { useLocale } from "next-intl";
import Icons from "@/core/assets/Icons";
import { CartButton } from "@/modules/admin/store/presentation/components/CartButton";

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "AD";
}

function UserMenu() {
  const { data: session } = useSession();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = getInitials(session?.user?.name, session?.user?.email);
  const name = session?.user?.name ?? "Administrador";
  const email = session?.user?.email ?? "";

  return (
    <div ref={ref} className="relative">
      {/* Avatar botón */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center justify-center
          w-9 h-9 rounded-full
          bg-[#c0607a] hover:bg-[#a84d66]
          text-white text-xs font-bold tracking-wide
          ring-2 transition-all duration-150
          ${open ? "ring-[#f8c8d4]" : "ring-transparent hover:ring-[#f8c8d4]/50"}
        `}
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        {initials}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            className="
              absolute right-0 top-full mt-2 w-52
              bg-white border border-[#f5dce4]
              rounded-2xl shadow-xl overflow-hidden
              z-50
            "
          >
            {/* Info usuario */}
            <div className="px-4 py-3 border-b border-[#f5dce4]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#c0607a] text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#7b2d42] truncate">
                    {name}
                  </p>
                  <p className="text-[11px] text-[#b07a8a] truncate">{email}</p>
                </div>
              </div>
            </div>

            {/* Opciones */}
            <div className="p-1.5">
              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: `/${locale}/admin` });
                }}
                className="
                  w-full flex items-center gap-2.5
                  px-3 py-2 rounded-xl
                  text-[13px] text-[#7b2d42]/80
                  hover:text-[#c0607a] hover:bg-[#fdf6f0]
                  transition text-left
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 shrink-0"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppBarAdmin() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="top-0 left-0 z-50 w-full">
      <motion.section
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto flex h-[72px] items-center px-4 lg:px-8 bg-[#231512] border-b border-[#5a1f30] shadow-sm"
      >
        {/* LEFT */}
        <div className="flex items-center gap-4 order-1">
          <div className="bg-[#FAF3E0] rounded-full">
            <Image
              src={Images.logoShortOpacity}
              alt="Hey Cookie"
              width={50}
              height={50}
              className="cursor-pointer"
            />
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 transition"
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="#fce4ec"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center ml-2">
            <AdminNav />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 ml-auto order-2">
          <div className="w-fit flex gap-6 items-center">
            <CartButton />

            <UserMenu />
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {mobileOpen && <AdminMobileMenu onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
