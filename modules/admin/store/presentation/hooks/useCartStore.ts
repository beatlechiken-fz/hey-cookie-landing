"use client";
// src/modules/admin/store/presentation/store/useCartStore.ts
//
// Carrito de compras en memoria (zustand). No persiste a BD —
// se guarda al generar cotización u orden, momento en el cual
// se traduce a CreateOrdenDTO y se envía a /api/admin/ordenes.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PastelConfiguracion } from "../../domain/entities/PastelPersonalizado.entity";
import type { OrdenCuponAplicado } from "../../domain/entities/Orden.entity";

export interface CartItem {
  id: string; // id local generado (uuid/crypto)
  nombre: string; // ej: "Pastel personalizado 20cm" o "Pastel de café 24cm"
  /**
   * Snapshot de la configuración elegida. Para pastel personalizado es
   * PastelConfiguracion completa; para productos del catálogo es un objeto
   * con { productoId, opciones, diametroCm?, tamanoFijoId? }. Se guarda tal
   * cual en orden_items.configuracion (JSONB) sin validar su forma aquí.
   */
  configuracion: PastelConfiguracion | Record<string, any>;
  cantidad: number;
  costoUnitario: number; // costo de producción calculado
  precioUnitario: number; // precio de venta
  /** Snapshot del PastelCostoDesglose — se guarda en orden_items para finanzas */
  desgloseCostos?: Record<string, any> | null;
}

interface CartState {
  items: CartItem[];
  cupones: OrdenCuponAplicado[];
  clienteId: string | null;
  clienteNombre: string | null;

  setCliente: (cliente: { id: string; nombre: string } | null) => void;

  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateCantidad: (id: string, cantidad: number) => void;
  clear: () => void;

  addCupon: (cupon: OrdenCuponAplicado) => void;
  removeCupon: (cuponId: string) => void;

  // Derivados
  totalItems: () => number;
  subtotal: () => number;
  descuentoTotal: () => number;
  total: () => number;
}

function genId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
          items: [...state.items, { ...item, id: genId() }],
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
          // Al cambiar de cliente, los cupones individuales aplicados podrían
          // dejar de ser válidos para el nuevo cliente; se limpian por seguridad.
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

      totalItems: () => get().items.reduce((s, i) => s + i.cantidad, 0),

      subtotal: () =>
        get().items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0),

      descuentoTotal: () => {
        const subtotal = get().subtotal();
        return get().cupones.reduce((sum, c) => {
          const monto =
            c.tipoDescuento === "porcentaje"
              ? subtotal * (c.valor / 100)
              : Math.min(c.valor, subtotal);
          return sum + monto;
        }, 0);
      },

      total: () => Math.max(0, get().subtotal() - get().descuentoTotal()),
    }),
    { name: "pasteleria-cart" },
  ),
);
