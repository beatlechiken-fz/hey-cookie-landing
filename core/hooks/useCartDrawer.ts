"use client";

import { create } from "zustand";

/**
 * Estado (no persistido) del drawer del carrito público. Lo renderiza el
 * AppBar, pero cualquier componente puede abrirlo — p. ej. "Ir al carrito"
 * al terminar Arma tu pedido.
 */
interface CartDrawerState {
  open: boolean;
  abrir: () => void;
  cerrar: () => void;
}

export const useCartDrawer = create<CartDrawerState>((set) => ({
  open: false,
  abrir: () => set({ open: true }),
  cerrar: () => set({ open: false }),
}));
