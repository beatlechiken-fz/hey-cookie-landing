"use client";

import { useEffect, useRef } from "react";
import Icons from "@/core/assets/Icons";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";

// Flecha delgada tipo chevron: abajo = colapsado, arriba = expandido.
const ArrowIcon = ({ open = false }: { open?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

interface SubItem {
  id: string;
  label: string;
  url: string;
  active?: boolean;
}

interface Props {
  id: string;
  label: string;
  url: string;
  submenu?: SubItem[];
  active?: boolean;
  onSelect?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function MainNavItem({
  id,
  label,
  url,
  submenu = [],
  active,
  onSelect,
  onClose,
  isMobile = false,
  isOpen = false,
  onToggle,
}: Props) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const hasSubmenu = submenu.length > 0;
  const panelId = `submenu-${id}`;

  // Desktop: cerrar el desplegable al hacer clic fuera o con Escape.
  useEffect(() => {
    if (isMobile || !isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onClose?.();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isMobile, isOpen, onClose]);

  // =========================
  // MOBILE
  // =========================
  if (isMobile) {
    return (
      <div className="flex flex-col">
        <button
          onClick={() => {
            if (hasSubmenu) {
              onToggle?.();
            } else {
              onSelect?.();
              router.push(url);
            }
          }}
          aria-expanded={hasSubmenu ? isOpen : undefined}
          aria-controls={hasSubmenu ? panelId : undefined}
          className={`
            px-4 py-2 rounded-xl transition
            flex justify-between items-center
            font-subtitle font-bold text-left text-[20px]
            ${active ? "text-[#AA5A32]" : "text-[#3A1F14] hover:text-[#9A4A22]"}
          `}
        >
          <span>{label}</span>
          {hasSubmenu && <ArrowIcon open={isOpen} />}
        </button>

        {hasSubmenu && isOpen && (
          <div id={panelId} className="mt-2 ml-4 flex flex-col gap-1">
            {submenu.map((s) => (
              <Link
                key={s.id}
                href={s.url}
                onClick={onSelect}
                aria-current={s.active ? "page" : undefined}
                className={`
                  px-3 py-2 rounded-lg text-[18px] font-subtitle font-semibold
                  hover:text-[#9A4A22] hover:bg-[#6B3E26]/10
                  ${s.active ? "text-[#AA5A32]" : "text-[#3A1F14]/80"}
                `}
              >
                {s.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========================
  // DESKTOP
  // =========================
  const labelBlock = (
    <span className="flex flex-col">
      <span className="whitespace-nowrap">{label}</span>
      {active && (
        <Image src={Icons.wavesPink} alt="" width={60} height={10} className="ml-auto mr-auto" />
      )}
    </span>
  );

  const itemCls = `
    px-3 xl:px-4 py-1 rounded-xl transition text-[20px] xl:text-[24px]
    flex items-center gap-1
    font-subtitle font-bold cursor-pointer
    ${active ? "text-[#AA5A32]" : "text-[#3A1F14] hover:text-[#9A4A22]"}
  `;

  if (!hasSubmenu) {
    return (
      <Link href={url} onClick={onSelect} className={itemCls}>
        {labelBlock}
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={itemCls}
      >
        {labelBlock}
        <ArrowIcon open={isOpen} />
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="
            absolute top-full left-0 mt-2 min-w-56
            bg-[#FAF3E0]
            border border-[#6B3E26]/20
            rounded-xl p-2 shadow-xl
            z-50
          "
        >
          {submenu.map((s) => (
            <Link
              key={s.id}
              href={s.url}
              onClick={onSelect}
              aria-current={s.active ? "page" : undefined}
              className={`
                block px-3 py-2 rounded-lg whitespace-nowrap
                font-subtitle font-semibold text-[18px]
                hover:text-[#9A4A22] hover:bg-[#6B3E26]/10
                ${s.active ? "text-[#AA5A32]" : "text-[#3A1F14]/85"}
              `}
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
