"use client";
// Shell compartido de los paneles internos (admin y club): sidebar rosa claro
// con marca, buscador de secciones, navegación y tarjeta de usuario; a la
// derecha, encabezado con el título de la página y contenido sobre blanco.
// En escritorio el sidebar arranca colapsado a íconos; al expandirlo, un clic
// fuera de él (o navegar) lo vuelve a colapsar. En móvil es un cajón.

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Images from "@/core/assets/Images";
import { iniciales, itemActivo, stripLocale, type PanelNavGroup, type PanelTitulo } from "./panelNav";
import { PanelNavSections } from "./PanelNavSections";
import { useTituloFijado } from "./panelTitulo";

/* ── Íconos del shell ──────────────────────────────────────────────────── */

function Icono({ d, className = "h-[18px] w-[18px]" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const D_FLECHA = "m15 18-6-6 6-6";
const D_BUSCAR = "m21 21-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z";
const D_SALIR = "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9";
const D_MENU = "M4 6h16M4 12h16M4 18h16";
const D_CERRAR = "M18 6 6 18M6 6l12 12";

/* ── Shell ─────────────────────────────────────────────────────────────── */

export type PanelShellProps = {
  children: ReactNode;
  nav: PanelNavGroup[];
  /** Destino del logo. */
  homeHref: string;
  /** Línea bajo "Hey Cookie" (ej. "Bake Lab · Admin"). */
  subtitulo: string;
  titulo: (path: string) => PanelTitulo;
  /** Botones a la derecha del encabezado (carrito, acciones globales…). */
  acciones?: ReactNode;
  /** Enlaces secundarios al pie del sidebar (ej. "Ver sitio público"). */
  enlacesPie?: { label: string; href: string; icon: ReactNode }[];
  usuario: { nombre: string; email: string };
  onCerrarSesion: () => void;
};

export function PanelShell({
  children,
  nav,
  homeHref,
  subtitulo,
  titulo,
  acciones,
  enlacesPie = [],
  usuario,
  onCerrarSesion,
}: PanelShellProps) {
  const path = stripLocale(usePathname());
  const activo = itemActivo(nav, path);
  const tituloFijado = useTituloFijado();
  const { titulo: tituloPagina, grupo } = tituloFijado ?? titulo(path);
  const [col, setCol] = useState(true);
  const asideRef = useRef<HTMLElement>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Al navegar, el cajón móvil se cierra y el buscador se limpia (ajuste en render).
  const [pathPrevio, setPathPrevio] = useState(path);
  if (pathPrevio !== path) {
    setPathPrevio(path);
    setMenuAbierto(false);
    setBusqueda("");
    setCol(true);
  }

  // Menú expandido: un clic fuera del sidebar lo colapsa de nuevo.
  useEffect(() => {
    if (col) return;
    const alPresionar = (e: PointerEvent) => {
      if (asideRef.current && !asideRef.current.contains(e.target as Node)) {
        setBusqueda("");
        setCol(true);
      }
    };
    document.addEventListener("pointerdown", alPresionar);
    return () => document.removeEventListener("pointerdown", alPresionar);
  }, [col]);

  useEffect(() => {
    if (!menuAbierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setMenuAbierto(false);
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [menuAbierto]);

  // ⌘K / Ctrl+K enfoca el buscador (expande el menú si estaba colapsado).
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (col) setCol(false);
        if (window.matchMedia("(max-width: 767px)").matches) setMenuAbierto(true);
        requestAnimationFrame(() => buscadorRef.current?.focus());
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [col]);

  const q = busqueda.trim().toLowerCase();
  const grupos = q
    ? nav
        .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }))
        .filter((g) => g.items.length > 0)
    : nav;

  // En móvil el cajón siempre va expandido; `col` solo aplica desde md.
  const c = (siColapsado: string, normal = "") => (col ? `${normal} ${siColapsado}` : normal);

  return (
    <div className="flex h-screen overflow-hidden bg-hc-bg">
      {menuAbierto && (
        <div className="fixed inset-0 z-40 bg-hc-cacao/25 backdrop-blur-[2px] md:hidden" aria-hidden onClick={() => setMenuAbierto(false)} />
      )}

      <aside
        ref={asideRef}
        id="menu-panel"
        className={`fixed inset-y-0 left-0 z-50 flex w-[268px] max-w-[85vw] shrink-0 flex-col border-r border-hc-side-line bg-hc-side transition-[width,transform] duration-200 md:static md:z-auto md:max-w-none md:translate-x-0 ${
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        } ${col ? "md:w-[76px]" : ""}`}
      >
        {/* Marca */}
        <div className={c("md:flex-col md:justify-center md:gap-3 md:px-0", "flex shrink-0 items-center gap-3 px-4 pb-4 pt-5")}>
          <Link href={homeHref} className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(58,31,20,0.10)] ring-1 ring-hc-side-line">
              <Image src={Images.logoShortOpacity} alt="Hey Cookie" width={34} height={34} />
            </span>
            <span className={c("md:hidden", "min-w-0 leading-tight")}>
              <span className="block truncate text-[15.5px] font-bold text-hc-ink">Hey Cookie</span>
              <span className="block truncate text-[12px] font-medium text-hc-soft">{subtitulo}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              setCol(!col);
            }}
            aria-label={col ? "Expandir menú" : "Colapsar menú"}
            title={col ? "Expandir menú" : "Colapsar menú"}
            aria-controls="menu-panel"
            aria-expanded={!col}
            className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-hc-soft transition hover:bg-hc-side-hover hover:text-hc-ink md:flex ${col ? "" : "ml-auto"}`}
          >
            <Icono d={D_FLECHA} className={`h-[18px] w-[18px] transition-transform duration-200 ${col ? "rotate-180" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
            className="ml-auto rounded-lg p-1.5 text-hc-muted hover:bg-hc-side-hover md:hidden"
          >
            <Icono d={D_CERRAR} className="h-5 w-5" />
          </button>
        </div>

        {/* Buscador de secciones */}
        <div className={c("md:hidden", "px-3 pb-3")}>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-hc-side-line bg-white px-3 text-hc-soft shadow-[0_1px_2px_rgba(58,31,20,0.04)] transition focus-within:border-hc-rose/40 focus-within:ring-2 focus-within:ring-hc-rose/10">
            <Icono d={D_BUSCAR} className="h-4 w-4" />
            <input
              ref={buscadorRef}
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setBusqueda("")}
              placeholder="Buscar…"
              aria-label="Buscar sección"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] text-hc-ink placeholder:text-hc-soft focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <kbd className="hidden rounded-md border border-hc-side-line bg-hc-side px-1.5 py-0.5 font-sans text-[10.5px] font-semibold text-hc-soft md:block">⌘K</kbd>
          </label>
        </div>

        {/* Navegación */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4 pt-1 [scrollbar-color:var(--color-hc-side-line)_transparent] [scrollbar-width:thin]">
          <PanelNavSections nav={grupos} activo={activo} col={col} buscando={q !== ""} onExpandir={() => setCol(false)} />
        </nav>

        {/* Pie: enlaces secundarios + usuario */}
        <div className="shrink-0 border-t border-hc-side-line px-3 pb-4 pt-3">
          {enlacesPie.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              title={col ? e.label : undefined}
              className={`group mb-2 flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-hc-muted transition-colors hover:bg-hc-side-hover hover:text-hc-ink ${col ? "md:justify-center md:px-0" : ""}`}
            >
              <span className="text-hc-soft group-hover:text-hc-ink">{e.icon}</span>
              <span className={c("md:sr-only", "truncate")}>{e.label}</span>
            </Link>
          ))}
          <div className={c("md:flex-col md:gap-2 md:px-0 md:py-2", "flex items-center gap-3 rounded-xl px-2 py-2")}>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hc-rose text-[11.5px] font-bold tracking-wide text-white"
              title={col ? usuario.nombre : undefined}
            >
              {iniciales(usuario.nombre, usuario.email)}
            </span>
            <span className={c("md:hidden", "min-w-0 flex-1 leading-tight")}>
              <span className="block truncate text-[13.5px] font-semibold text-hc-ink">{usuario.nombre}</span>
              {usuario.email && <span className="block truncate text-[12px] text-hc-soft">{usuario.email}</span>}
            </span>
            <button
              type="button"
              onClick={onCerrarSesion}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-hc-soft transition hover:bg-hc-side-hover hover:text-hc-rose"
            >
              <Icono d={D_SALIR} className="h-[17px] w-[17px]" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-hc-line bg-white px-4 md:h-[80px] md:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
              aria-controls="menu-panel"
              className="-ml-1.5 shrink-0 rounded-lg p-1.5 text-hc-muted hover:bg-hc-hover md:hidden"
            >
              <Icono d={D_MENU} className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              {grupo && <p className="truncate text-[12px] font-medium text-hc-soft">{grupo}</p>}
              <h1 className="truncate text-[20px] font-semibold leading-tight tracking-tight text-hc-ink md:text-[24px]">{tituloPagina}</h1>
            </div>
          </div>
          {acciones && <div className="flex shrink-0 items-center gap-2 md:gap-3">{acciones}</div>}
        </header>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 md:px-8 md:pt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
