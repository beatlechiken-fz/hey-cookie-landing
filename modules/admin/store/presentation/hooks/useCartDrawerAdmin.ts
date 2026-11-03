"use client";

import { create } from "zustand";

/**
 * Estado (no persistido) del drawer del carrito del admin. Lo renderiza el
 * CartButton del encabezado, pero cualquier vista puede abrirlo — p. ej. el
 * botón "Nueva orden" de Órdenes o del detalle del cliente.
 */
interface CartDrawerAdminState {
  open: boolean;
  abrir: () => void;
  cerrar: () => void;
}

export const useCartDrawerAdmin = create<CartDrawerAdminState>((set) => ({
  open: false,
  abrir: () => set({ open: true }),
  cerrar: () => set({ open: false }),
}));

/** Evento de ventana al crear una orden/cotización desde el carrito (para recargar listados). */
export const EVENTO_ORDEN_CREADA = "hc-admin:orden-creada";
