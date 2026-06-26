"use client";
// src/modules/admin/store/presentation/components/CartButton.tsx
//
// Botón de carrito con badge para colocar en AppBarAdmin.
// Uso: <CartButton /> dentro de la barra de navegación.

import { useState } from "react";
import { useCartStore } from "../hooks/useCartStore";
import { CartDrawer } from "./CartDrawer";

export function CartButton() {
  const [open, setOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
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
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c0607a] text-white text-[10px] font-bold flex items-center justify-center">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
