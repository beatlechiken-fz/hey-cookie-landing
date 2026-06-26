"use client";
// src/components/admin/appbar/AdminNavItem.tsx
// Espejo de MainNavItem adaptado al panel de administración.
// Usa el mismo patrón de props y estructura, con los colores del admin.

import { Link } from "@/i18n/navigation";
import type { AdminMenuItem } from "./menuFactoryAdmin";

const ChevronIcon = ({ open = false }: { open?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

interface Props extends AdminMenuItem {
  active: boolean;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
}

export default function AdminNavItem({
  label,
  url,
  submenu = [],
  active,
  isMobile = false,
  isOpen = false,
  onToggle,
  onSelect,
}: Props) {
  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col">
        <button
          onClick={() => {
            if (submenu.length > 0) {
              onToggle?.();
            } else {
              onSelect?.();
            }
          }}
          className={`
            px-4 py-2 rounded-xl transition
            flex justify-between items-center
            text-left text-[18px]
            ${active ? "text-[#C0607A]" : "text-[#7b2d42] hover:text-[#C0607A]"}
          `}
        >
          <span>{label}</span>
          {submenu.length > 0 && <ChevronIcon open={isOpen} />}
        </button>

        {submenu.length > 0 && isOpen && (
          <div className="mt-1 ml-4 flex flex-col gap-0.5">
            {submenu.map((s) => (
              <Link
                key={s.id}
                href={s.url}
                onClick={onSelect}
                className="
                  px-3 py-2 text-[15px]
                  text-[#7b2d42]/70
                  hover:text-[#C0607A]
                  hover:bg-[#f5dce4]/60
                  rounded-lg transition
                "
              >
                {s.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  return (
    <div className="relative group">
      <Link
        href={url}
        onClick={onSelect}
        className={`
          px-3 py-1 rounded-xl transition text-[15px]
          flex items-center gap-1
          font-semibold
          ${active ? "text-[#f8c8d4]" : "text-white hover:text-[#fce4ec]"}
        `}
      >
        <div className="flex flex-col items-start">
          <span>{label}</span>
        </div>

        {submenu.length > 0 && (
          <span className="opacity-80 group-hover:opacity-100 transition-opacity">
            <ChevronIcon open={false} />
          </span>
        )}
      </Link>

      {/* Dropdown */}
      {submenu.length > 0 && (
        <div
          className="
            absolute top-full left-0 mt-2 w-44
            bg-[#ffffff]
            border border-[#f5dce4]
            rounded-xl p-2 shadow-lg
            opacity-0 invisible
            group-hover:opacity-100 group-hover:visible
            transition-all duration-150
            z-50
          "
        >
          {submenu.map((s) => (
            <Link
              key={s.id}
              href={s.url}
              onClick={onSelect}
              className="
                block px-3 py-2 
                text-[15px] font-semibold
                text-[#7b2d42]/80
                hover:text-[#C0607A]
                hover:bg-[#fdf6f0]
                rounded-lg transition
              "
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
