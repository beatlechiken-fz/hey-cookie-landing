"use client";

import { create } from "zustand";

/** Qué genera el drawer: una orden/cotización normal o una prueba interna. */
export type CartDrawerModo = "orden" | "prueba";

/**
 * Estado (no persistido) del drawer del carrito del admin. Lo renderiza el
 * CartButton del encabezado, pero cualquier vista puede abrirlo — p. ej. el
 * botón "Nueva orden" de Órdenes o del detalle del cliente, o "Nueva prueba"
 * de la pestaña Pruebas.
 */
interface CartDrawerAdminState {
  open: boolean;
  modo: CartDrawerModo;
  /** Sin modo (p. ej. el botón del encabezado) conserva el modo actual. */
  abrir: (modo?: CartDrawerModo) => void;
  cerrar: () => void;
  setModo: (modo: CartDrawerModo) => void;
}

export const useCartDrawerAdmin = create<CartDrawerAdminState>((set) => ({
  open: false,
  modo: "orden",
  // `modo` puede llegar como evento de click si se pasa `abrir` directo a onClick.
  abrir: (modo) =>
    set((s) => ({
      open: true,
      modo: modo === "orden" || modo === "prueba" ? modo : s.modo,
    })),
  cerrar: () => set({ open: false }),
  setModo: (modo) => set({ modo }),
}));

/** Evento de ventana al crear una orden/cotización/prueba desde el carrito (para recargar listados). */
export const EVENTO_ORDEN_CREADA = "hc-admin:orden-creada";
