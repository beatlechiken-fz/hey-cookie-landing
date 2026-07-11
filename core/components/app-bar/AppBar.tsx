"use client";

import NativeSelect from "../native-selec/NativeSelect";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainNav from "./MainNav";
import MobileMenu from "./MobileMenu";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/modules/admin/store/presentation/hooks/useCartStore";
import { CartDrawerPublic } from "@/modules/home/presentation/components/CartDrawerPublic";

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "HC";
}

function UserAvatar({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !menuRef.current?.contains(t))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", close, { capture: true });
  }, [open]);

  const handleToggle = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setOpen((v) => !v);
  };

  const initials = getInitials(session?.user?.name, session?.user?.email);
  const name = session?.user?.name ?? "Mi cuenta";
  const email = session?.user?.email ?? "";

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        aria-label="Mi cuenta"
        aria-expanded={open}
        className={`flex items-center justify-center w-9 h-9 rounded-full bg-[#AA6A42] hover:bg-[#8a5535] text-white text-xs font-bold tracking-wide ring-2 transition-all duration-150 cursor-pointer ${
          open ? "ring-[#e8c4a0]" : "ring-transparent hover:ring-[#e8c4a0]/50"
        }`}
      >
        {initials}
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              style={{ position: "fixed", top: dropPos.top, right: dropPos.right, zIndex: 100000 }}
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.15 }}
              className="w-56 bg-white border border-[#f0e0d0] rounded-2xl shadow-xl overflow-hidden"
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-[#f0e0d0]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#AA6A42] text-white text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#3A1F14] truncate">{name}</p>
                    {email && <p className="text-[11px] text-[#AA6A42]/70 truncate">{email}</p>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-1.5 flex flex-col gap-0.5">
                <a
                  href={`/${locale}/user/dashboard`}
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[#6B3E26]/80 hover:text-[#AA6A42] hover:bg-[#FFF0E6] transition text-left cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  Mi Dashboard
                </a>
                <a
                  href={`/${locale}/user/perfil`}
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[#6B3E26]/80 hover:text-[#AA6A42] hover:bg-[#FFF0E6] transition text-left cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  Perfil
                </a>
                <div className="h-px bg-[#f0e0d0] my-1" />
                <button
                  onClick={() => {
                    setOpen(false);
                    onClose();
                    signOut({ callbackUrl: `/${locale}/user/login` });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[#6B3E26]/80 hover:text-[#AA6A42] hover:bg-[#FFF0E6] transition text-left cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default function AppBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());

  const isUserLoggedIn = session?.user?.role === "user";

  // Auto-abrir carrito si viene de login/registro con ?cart=1
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cart") === "1") {
      setCartOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("cart");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleSetLang = (value: string) => {
    router.push(pathname, { locale: value });
  };

  return (
    <header className="top-0 left-0 z-50 w-full">
      <motion.section
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto flex h-[96px] items-center pr-4 lg:px-10 bg-transparent"
      >
        {/* LEFT ZONE — hamburger + desktop nav */}
        <div className="flex items-center gap-4 order-1 lg:order-1">
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden flex items-center mb-6 justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="#AA6A42"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="hidden lg:flex items-center gap-8">
            <MainNav />
          </div>
        </div>

        {/* RIGHT ZONE */}
        <div className="flex items-center gap-3 ml-auto order-2 lg:order-2 mb-6">
          {/*
            Order left→right:
            - Not logged in: [login]  [cart]  [lang]
            - Logged in:     [cart]  [avatar] [lang]
          */}

          {!isUserLoggedIn && (
            <button
              onClick={() => router.push("/user/login")}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#AA6A42]/40 text-[#AA6A42] text-xs font-semibold hover:bg-[#AA6A42]/10 transition-colors cursor-pointer font-body"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
              <span className="hidden sm:inline">Iniciar sesión</span>
            </button>
          )}

          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative mr-2 mt-1 p-2 rounded-lg hover:bg-[#AA6A42]/10 text-[#3A1F14] transition-colors cursor-pointer"
            aria-label="Carrito de compras"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DA6C94] text-white text-[10px] font-bold flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          {/* Profile avatar (only when logged in as user) */}
          {isUserLoggedIn && <UserAvatar onClose={() => setMenuOpen(false)} />}

          {/* Language selector */}
          <NativeSelect
            value={locale}
            onChange={(e) => handleSetLang(e)}
            options={[
              { value: "es", label: "es" },
              { value: "en", label: "en" },
            ]}
          />
        </div>
      </motion.section>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawerPublic open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
