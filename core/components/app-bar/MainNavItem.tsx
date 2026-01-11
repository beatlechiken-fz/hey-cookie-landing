"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLanding } from "@/modules/home/presentation/store/useLanding";
import type { MenuNavEntry } from "./menuFactory";

export interface SubmenuItem {
  id: string;
  label: string;
  url: string;
}

export interface MainNavItemProps {
  id: string; // Debe coincidir con MenuNavEntry
  label: string;
  submenu?: SubmenuItem[];
  active?: boolean;
  url: string;
}

export default function MainNavItem({
  id,
  label,
  submenu = [],
  active = false,
  url,
}: MainNavItemProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  const selectMainNav = useLanding((state) => state.selectMainNav);

  const isExpandable = submenu.length > 0;

  const handleEnter = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHovered(true);
    isExpandable && setOpen(true);
  };

  const handleLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setHovered(false);
      isExpandable && setOpen(false);
      closeTimeoutRef.current = null;
    }, 100);
  };

  const handleSelectMenu = (id: MenuNavEntry) => {
    selectMainNav(id as MenuNavEntry);
  };

  return (
    <div
      className="relative w-fit"
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      {/* Botón principal */}
      <Link
        className={`
          w-fit flex items-center justify-between px-4 py-2 rounded-xl
          transition-all duration-200 select-none text-left cursor-pointer
          ${
            active
              ? "bg-white/20 text-white shadow-sm"
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }
          ${hovered ? "!text-sky-300" : ""}
        `}
        aria-expanded={open}
        href={url}
        onClick={() => selectMainNav(id as MenuNavEntry)}
      >
        <span className="font-semibold tracking-wide whitespace-nowrap">
          {label}
        </span>

        {isExpandable && (
          <svg
            className={`ml-2 w-4 h-4 transition-transform ${
              open ? "rotate-180" : "rotate-0"
            }`}
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </Link>

      {/* Submenú */}
      {isExpandable && (
        <div
          className={`
            absolute left-0 top-full z-50
            transform origin-top-left
            transition-all duration-150
            ${
              open
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-1 pointer-events-none"
            }
          `}
        >
          <div
            className="
              pl-4 pr-4 py-3 flex flex-col gap-2 border border-white/10
              bg-black/70 backdrop-blur-md rounded-xl shadow-lg
              w-[220px]
            "
          >
            {submenu.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="text-gray-300 hover:text-white transition py-1"
                onClick={() => selectMainNav(id as MenuNavEntry)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
