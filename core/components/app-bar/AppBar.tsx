"use client";

import NativeSelect from "../native-selec/NativeSelect";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainNav from "./MainNav";
import MobileMenu from "./MobileMenu";

export default function AppBar() {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleSetLang = (value: string) => {
    router.push(pathname, { locale: value });
  };

  return (
    <header className="top-0 left-0 z-50 w-full">
      <motion.section
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto flex h-[64px] items-center px-6 md:px-10 bg-transparent"
      >
        {/* LEFT ZONE */}
        <div className="flex items-center gap-4 order-1 lg:order-1">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
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

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <MainNav />
          </div>
        </div>

        {/* RIGHT ZONE */}
        <div className="flex items-center gap-4 ml-auto order-2 lg:order-2">
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
        {open && <MobileMenu onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
