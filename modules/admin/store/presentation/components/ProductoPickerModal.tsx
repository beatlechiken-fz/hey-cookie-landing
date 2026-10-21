"use client";
// src/modules/admin/store/presentation/components/ProductoPickerModal.tsx
//
// Paso previo a ProductoConfiguradorModal cuando se agrega un producto de
// catálogo a una orden ya existente: elegir cuál producto configurar.

import { motion, AnimatePresence } from "framer-motion";
import { useProductos } from "../hooks/useProductos";
import type { Producto } from "../../domain/entities/Producto.entity";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (producto: Producto) => void;
}

export function ProductoPickerModal({ open, onClose, onSelect }: Props) {
  const { productos, isLoading, search, setSearch } = useProductos();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-hc-cacao/25 backdrop-blur-[2px] z-40"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(58,31,20,0.28)] border border-hc-line overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-hc-line bg-hc-hover">
                <h2 className="font-bold text-hc-soft text-lg">
                  Elegir producto de catálogo
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-hc-sunken transition text-hc-muted"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="px-6 pt-4">
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto…"
                  className="w-full px-3 py-2 rounded-lg border border-hc-line-strong bg-white text-hc-ink text-sm focus:outline-none focus:border-hc-rose focus:ring-4 focus:ring-hc-rose/10 transition placeholder:text-hc-soft"
                />
              </div>

              <div className="px-6 py-4 flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
                {isLoading && (
                  <p className="text-sm text-hc-muted py-6 text-center">
                    Cargando…
                  </p>
                )}
                {!isLoading && productos.length === 0 && (
                  <p className="text-sm text-hc-muted py-6 text-center">
                    Sin resultados.
                  </p>
                )}
                {productos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelect(p)}
                    className="flex items-center gap-3 text-left px-3 py-2.5 rounded-xl border border-hc-line-strong hover:bg-hc-hover hover:border-hc-rose transition"
                  >
                    {p.imagenUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imagenUrl}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-hc-hover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-hc-ink truncate">
                        {p.nombre}
                      </p>
                      <p className="text-[11px] text-hc-soft uppercase tracking-wider">
                        {p.linea}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
