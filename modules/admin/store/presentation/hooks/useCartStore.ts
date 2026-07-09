"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PastelConfiguracion } from "../../domain/entities/PastelPersonalizado.entity";
import type { OrdenCuponAplicado } from "../../domain/entities/Orden.entity";

export interface CartItem {
  id: string;
  nombre: string;
  configuracion: PastelConfiguracion | Record<string, any>;
  cantidad: number;
  costoUnitario: number;
  precioUnitario: number;
  desgloseCostos?: Record<string, any> | null;
  /** Cupones aplicados a este item específico (desde el modal de producto) */
  cuponesItem: OrdenCuponAplicado[];
}

interface CartState {
  items: CartItem[];
  /** Cupones globales: se aplican al total del carrito completo */
  cupones: OrdenCuponAplicado[];
  clienteId: string | null;
  clienteNombre: string | null;

  setCliente: (cliente: { id: string; nombre: string } | null) => void;

  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateCantidad: (id: string, cantidad: number) => void;
  clear: () => void;

  // Cupones globales (todo el carrito)
  addCupon: (cupon: OrdenCuponAplicado) => void;
  removeCupon: (cuponId: string) => void;

  // Cupones por item
  removeItemCupon: (itemId: string, cuponId: string) => void;

  // Derivados
  totalItems: () => number;
  subtotal: () => number;
  /** Descuento de un item específico considerando sus cuponesItem */
  itemDescuento: (itemId: string) => number;
  /** Suma de todos los descuentos por item */
  totalItemDescuentos: () => number;
  /** Descuento de cupones globales (se aplican sobre subtotal - descuentos por item) */
  globalDescuentoTotal: () => number;
  /** Descuento total = por item + global */
  descuentoTotal: () => number;
  total: () => number;
}

function genId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function calcCuponMonto(
  cupon: OrdenCuponAplicado,
  base: number,
): number {
  if (cupon.tipoDescuento === "porcentaje")
    return base * (cupon.valor / 100);
  return Math.min(cupon.valor, base);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cupones: [],
      clienteId: null,
      clienteNombre: null,

      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            { ...item, id: genId(), cuponesItem: item.cuponesItem ?? [] },
          ],
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateCantidad: (id, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, cantidad: Math.max(1, cantidad) } : i,
          ),
        })),

      setCliente: (cliente) =>
        set({
          clienteId: cliente?.id ?? null,
          clienteNombre: cliente?.nombre ?? null,
          cupones: [],
        }),

      clear: () =>
        set({ items: [], cupones: [], clienteId: null, clienteNombre: null }),

      addCupon: (cupon) =>
        set((state) => {
          if (state.cupones.some((c) => c.cuponId === cupon.cuponId))
            return state;
          return { cupones: [...state.cupones, cupon] };
        }),

      removeCupon: (cuponId) =>
        set((state) => ({
          cupones: state.cupones.filter((c) => c.cuponId !== cuponId),
        })),

      removeItemCupon: (itemId, cuponId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  cuponesItem: i.cuponesItem.filter(
                    (c) => c.cuponId !== cuponId,
                  ),
                }
              : i,
          ),
        })),

      totalItems: () => get().items.reduce((s, i) => s + i.cantidad, 0),

      subtotal: () =>
        get().items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0),

      itemDescuento: (itemId) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item) return 0;
        const base = item.precioUnitario * item.cantidad;
        return (item.cuponesItem ?? []).reduce(
          (sum, c) => sum + calcCuponMonto(c, base),
          0,
        );
      },

      totalItemDescuentos: () =>
        get().items.reduce((sum, item) => {
          const base = item.precioUnitario * item.cantidad;
          return (
            sum +
            (item.cuponesItem ?? []).reduce(
              (s, c) => s + calcCuponMonto(c, base),
              0,
            )
          );
        }, 0),

      globalDescuentoTotal: () => {
        const subtotal = get().subtotal();
        const itemDisc = get().totalItemDescuentos();
        const base = Math.max(0, subtotal - itemDisc);
        return get().cupones.reduce((sum, c) => sum + calcCuponMonto(c, base), 0);
      },

      descuentoTotal: () =>
        get().totalItemDescuentos() + get().globalDescuentoTotal(),

      total: () => Math.max(0, get().subtotal() - get().descuentoTotal()),
    }),
    { name: "pasteleria-cart" },
  ),
);
