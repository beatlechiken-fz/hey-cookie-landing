"use client";
// Shell del panel admin: sidebar lateral (colapsable a íconos en escritorio,
// cajón en móvil) + topbar con título, carrito y menú de usuario.

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Images from "@/core/assets/Images";
import { CartButton } from "@/modules/admin/store/presentation/components/CartButton";
import { ADMIN_NAV, itemActivo, stripLocale, tituloDe } from "./adminNav";

/* ── Preferencia de menú colapsado (solo este navegador) ───────────────── */

const CLAVE_COLAPSADO = "hc-admin.menu-colapsado";
const EVENTO_COLAPSADO = "hc-admin:menu-colapsado";
// Sin preferencia guardada, el menú arranca colapsado.
let colapsadoEnMemoria = true;

function leerColapsado(): boolean {
  try {
    return window.localStorage.getItem(CLAVE_COLAPSADO) !== "0";
  } catch {
    return colapsadoEnMemoria;
  }
}

function guardarColapsado(valor: boolean) {
  colapsadoEnMemoria = valor;
  try {
    window.localStorage.setItem(CLAVE_COLAPSADO, valor ? "1" : "0");
  } catch {
    // Sin almacenamiento (modo privado): queda el respaldo en memoria.
  }
  window.dispatchEvent(new Event(EVENTO_COLAPSADO));
}

function suscribirColapsado(avisar: () => void) {
  window.addEventListener(EVENTO_COLAPSADO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO_COLAPSADO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "AD";
}

/* ── Menú de usuario (topbar) ──────────────────────────────────────────── */

function UserMenu() {
  const { data: session } = useSession();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = getInitials(session?.user?.name, session?.user?.email);
  const name = session?.user?.name ?? "Administrador";
  const email = session?.user?.email ?? "";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full border border-hc-line bg-hc-surface py-1 pl-1 pr-1 transition hover:border-hc-line-strong sm:pr-3"
        aria-label="Menú de usuario"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-hc-rose to-hc-rose-hover text-[11px] font-bold tracking-wide text-white">
          {initials}
        </span>
        <span className="hidden max-w-[140px] truncate text-[13px] font-semibold text-hc-ink sm:inline">{name}</span>
        <svg viewBox="0 0 24 24" className="hidden h-4 w-4 text-hc-soft sm:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-hc-line bg-hc-surface shadow-[0_12px_40px_-12px_rgba(58,31,20,0.25)]"
          >
            <div className="border-b border-hc-line px-4 py-3">
              <p className="truncate text-[13px] font-semibold text-hc-ink">{name}</p>
              <p className="truncate text-[12px] text-hc-muted">{email}</p>
            </div>
            <div className="p-1.5">
              <Link
                href="/"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-hc-muted transition hover:bg-hc-hover hover:text-hc-ink"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                </svg>
                Ver sitio público
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: `/${locale}/admin` });
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] text-hc-muted transition hover:bg-hc-rose-tint hover:text-hc-rose-hover"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
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

/* ── Shell ─────────────────────────────────────────────────────────────── */

export function AdminShell({ children }: { children: ReactNode }) {
  const path = stripLocale(usePathname());
  const activo = itemActivo(path);
  const { titulo, grupo } = tituloDe(path);
  const colapsadoGuardado = useSyncExternalStore(suscribirColapsado, leerColapsado, () => true);
  const col = colapsadoGuardado;
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Al navegar, el cajón móvil se cierra solo (ajuste durante el render).
  const [pathPrevio, setPathPrevio] = useState(path);
  if (pathPrevio !== path) {
    setPathPrevio(path);
    setMenuAbierto(false);
  }

  useEffect(() => {
    if (!menuAbierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setMenuAbierto(false);
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [menuAbierto]);

  return (
    <div className="flex h-screen overflow-hidden">
      {menuAbierto && (
        <div className="fixed inset-0 z-40 bg-hc-cacao/30 backdrop-blur-[2px] md:hidden" aria-hidden onClick={() => setMenuAbierto(false)} />
      )}

      <aside
        id="menu-admin"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] shrink-0 flex-col border-r border-hc-line bg-hc-surface transition-[width,transform] duration-200 md:static md:z-auto md:max-w-none md:translate-x-0 ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        } ${col ? "md:w-[76px]" : ""}`}
      >
        {/* Marca */}
        <div className={`flex h-[68px] shrink-0 items-center gap-3 px-5 ${col ? "md:h-auto md:flex-col md:justify-center md:gap-2 md:px-0 md:py-3.5" : ""}`}>
          <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hc-rose-tint">
              <Image src={Images.logoShortOpacity} alt="Hey Cookie" width={34} height={34} />
            </span>
            <span className={`min-w-0 leading-tight ${col ? "md:hidden" : ""}`}>
              <span className="block truncate text-[15px] font-bold text-hc-ink">Hey Cookie</span>
              <span className="block truncate text-[11px] font-medium text-hc-soft">Bake Lab · Admin</span>
            </span>
          </Link>
          {/* Colapsar / expandir (escritorio) */}
          <button
            type="button"
            onClick={() => guardarColapsado(!col)}
            aria-label={col ? "Expandir menú" : "Colapsar menú"}
            title={col ? "Expandir menú" : "Colapsar menú"}
            aria-controls="menu-admin"
            aria-expanded={!col}
            className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-hc-line text-hc-muted transition hover:border-hc-line-strong hover:bg-hc-hover hover:text-hc-ink md:flex ${col ? "" : "ml-auto"}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {col ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
            className="ml-auto rounded-lg p-1.5 text-hc-muted hover:bg-hc-hover md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navegación */}
        <nav className={`flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4 pt-2 ${col ? "md:px-3" : ""}`}>
          {ADMIN_NAV.map((g) => (
            <div key={g.key} className="flex flex-col gap-0.5">
              {g.label && (
                <p className={`px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-hc-soft ${col ? "md:hidden" : ""}`}>
                  {g.label}
                </p>
              )}
              {g.label && col && <div className="mx-3 mb-1.5 hidden h-px bg-hc-line md:block" />}
              {g.items.map((it) => {
                const isActive = activo?.key === it.key;
                return (
                  <Link
                    key={it.key}
                    href={it.href}
                    title={col ? it.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition-colors ${
                      isActive ? "bg-hc-rose-tint text-hc-rose-hover" : "text-hc-muted hover:bg-hc-hover hover:text-hc-ink"
                    } ${col ? "md:justify-center md:px-0 md:py-2.5" : ""}`}
                  >
                    {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-hc-rose" />}
                    <span className={isActive ? "text-hc-rose" : "text-hc-soft group-hover:text-hc-ink"}>{it.icon}</span>
                    <span className={`truncate ${col ? "md:sr-only" : ""}`}>{it.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-hc-line bg-hc-surface/80 px-4 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
              aria-controls="menu-admin"
              className="-ml-1.5 shrink-0 rounded-lg p-1.5 text-hc-muted hover:bg-hc-hover md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              {grupo && <p className="truncate text-[11.5px] font-medium text-hc-soft">{grupo}</p>}
              <h1 className="truncate text-[18px] font-bold leading-tight tracking-tight text-hc-ink md:text-[20px]">{titulo}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <CartButton />
            <UserMenu />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 md:px-8 md:pt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
